import { ProviderError, RETRYABLE_CODES } from './errors';
import {
  getModelDefinition,
  getProviderApiKey,
  getProviderDefinition,
} from './registry';

const DEFAULT_TIMEOUT_MS = 60_000;
const MAX_TIMEOUT_MS = 120_000;

function mapHttpError(provider, status, body) {
  const detail =
    (body && (body.error?.message || body.message)) || `HTTP ${status}`;
  if (status === 401 || status === 403) {
    return new ProviderError(
      'auth',
      `${provider} rejected the configured credentials (${status}).`,
      { status },
    );
  }
  if (status === 404) {
    return new ProviderError('model_not_found', `${provider}: ${detail}`, {
      status,
    });
  }
  if (status === 429) {
    return new ProviderError(
      'rate_limited',
      `${provider} rate limit reached. The run will be retried.`,
      { status, retryable: true },
    );
  }
  if (status === 400 || status === 422) {
    return new ProviderError('invalid_request', `${provider}: ${detail}`, {
      status,
    });
  }
  if (status >= 500) {
    return new ProviderError(
      'provider_error',
      `${provider} returned a server error (${status}).`,
      { status, retryable: true },
    );
  }
  return new ProviderError('provider_error', `${provider}: ${detail}`, {
    status,
  });
}

async function readBody(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

async function requestJson({ url, init, provider, fetchImpl, signal, timeoutMs }) {
  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, Math.min(Number(timeoutMs) || DEFAULT_TIMEOUT_MS, MAX_TIMEOUT_MS));

  const onAbort = () => controller.abort();
  signal?.addEventListener('abort', onAbort, { once: true });

  try {
    const response = await fetchImpl(url, { ...init, signal: controller.signal });
    const body = await readBody(response);
    if (!response.ok) {
      throw mapHttpError(provider, response.status, body);
    }
    return body;
  } catch (error) {
    if (error instanceof ProviderError) throw error;
    if (signal?.aborted) {
      throw new ProviderError('cancelled', 'The run was cancelled.', {
        retryable: false,
      });
    }
    if (timedOut || error?.name === 'AbortError') {
      throw new ProviderError(
        'timeout',
        `${provider} did not respond in time.`,
        { retryable: true },
      );
    }
    throw new ProviderError(
      'network',
      `${provider} could not be reached.`,
      { retryable: true },
    );
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', onAbort);
  }
}

function openAiTools(tools) {
  return tools.map((tool) => ({
    type: 'function',
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters || { type: 'object', properties: {} },
    },
  }));
}

function anthropicTools(tools) {
  return tools.map((tool) => ({
    name: tool.name,
    description: tool.description,
    input_schema: tool.parameters || { type: 'object', properties: {} },
  }));
}

function geminiTools(tools) {
  return [
    {
      functionDeclarations: tools.map((tool) => ({
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters || { type: 'object', properties: {} },
      })),
    },
  ];
}

async function callOpenAi({
  apiKey,
  model,
  instructions,
  input,
  tools,
  json,
  fetchImpl,
  signal,
  timeoutMs,
}) {
  const body = {
    model,
    messages: [
      { role: 'system', content: instructions },
      { role: 'user', content: input },
    ],
    temperature: 0.2,
  };
  if (json) body.response_format = { type: 'json_object' };
  if (tools.length) body.tools = openAiTools(tools);

  const data = await requestJson({
    url: 'https://api.openai.com/v1/chat/completions',
    init: {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    },
    provider: 'OpenAI',
    fetchImpl,
    signal,
    timeoutMs,
  });

  const message = data?.choices?.[0]?.message || {};
  return {
    text: typeof message.content === 'string' ? message.content : '',
    toolCalls: (message.tool_calls || []).map((call) => ({
      name: call.function?.name || '',
      arguments: call.function?.arguments || '',
    })),
    usage: {
      promptTokens: Number(data?.usage?.prompt_tokens || 0),
      completionTokens: Number(data?.usage?.completion_tokens || 0),
    },
  };
}

async function callAnthropic({
  apiKey,
  model,
  instructions,
  input,
  tools,
  json,
  fetchImpl,
  signal,
  timeoutMs,
}) {
  const system = json
    ? `${instructions}\n\nRespond with a single valid JSON object and no prose.`
    : instructions;
  const body = {
    model,
    max_tokens: 1024,
    temperature: 0.2,
    system,
    messages: [{ role: 'user', content: input }],
  };
  if (tools.length) body.tools = anthropicTools(tools);

  const data = await requestJson({
    url: 'https://api.anthropic.com/v1/messages',
    init: {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    },
    provider: 'Anthropic',
    fetchImpl,
    signal,
    timeoutMs,
  });

  const blocks = Array.isArray(data?.content) ? data.content : [];
  return {
    text: blocks
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('\n')
      .trim(),
    toolCalls: blocks
      .filter((block) => block.type === 'tool_use')
      .map((block) => ({
        name: block.name || '',
        arguments: JSON.stringify(block.input || {}),
      })),
    usage: {
      promptTokens: Number(data?.usage?.input_tokens || 0),
      completionTokens: Number(data?.usage?.output_tokens || 0),
    },
  };
}

async function callGemini({
  apiKey,
  model,
  instructions,
  input,
  tools,
  json,
  fetchImpl,
  signal,
  timeoutMs,
}) {
  const body = {
    systemInstruction: { parts: [{ text: instructions }] },
    contents: [{ role: 'user', parts: [{ text: input }] }],
    generationConfig: { temperature: 0.2 },
  };
  if (json) body.generationConfig.responseMimeType = 'application/json';
  if (tools.length) body.tools = geminiTools(tools);

  const data = await requestJson({
    url: `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
    init: {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify(body),
    },
    provider: 'Gemini',
    fetchImpl,
    signal,
    timeoutMs,
  });

  const candidate = data?.candidates?.[0];
  const parts = candidate?.content?.parts || [];
  return {
    text: parts
      .filter((part) => typeof part.text === 'string')
      .map((part) => part.text)
      .join('\n')
      .trim(),
    toolCalls: parts
      .filter((part) => part.functionCall)
      .map((part) => ({
        name: part.functionCall.name || '',
        arguments: JSON.stringify(part.functionCall.args || {}),
      })),
    usage: {
      promptTokens: Number(data?.usageMetadata?.promptTokenCount || 0),
      completionTokens: Number(data?.usageMetadata?.candidatesTokenCount || 0),
    },
  };
}

const ADAPTERS = {
  openai: callOpenAi,
  anthropic: callAnthropic,
  gemini: callGemini,
};

export function supportsProvider(provider) {
  return Boolean(ADAPTERS[provider]);
}

export async function generateText({
  provider,
  model,
  instructions,
  input,
  tools = [],
  json = false,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  signal,
  fetchImpl = globalThis.fetch,
}) {
  const definition = getProviderDefinition(provider);
  if (!definition) {
    throw new ProviderError(
      'unknown_provider',
      `Unknown AI provider "${provider}".`,
    );
  }
  if (!getModelDefinition(provider, model)) {
    // Still allowed: providers ship models faster than the pricing table.
    if (!model || typeof model !== 'string' || model.length > 120) {
      throw new ProviderError('invalid_request', 'A valid model is required.');
    }
  }

  const apiKey = getProviderApiKey(provider);
  if (!apiKey) {
    throw new ProviderError(
      'not_configured',
      `${definition.label} is not configured on this server. Add ${definition.envKeys[0]} to enable AI execution.`,
    );
  }

  if (!instructions || !String(instructions).trim()) {
    throw new ProviderError(
      'invalid_request',
      'Agent instructions are empty.',
    );
  }
  if (!input || !String(input).trim()) {
    throw new ProviderError('invalid_request', 'Run input is empty.');
  }

  return ADAPTERS[provider]({
    apiKey,
    model,
    instructions: String(instructions),
    input: String(input),
    tools,
    json,
    fetchImpl,
    signal,
    timeoutMs,
  });
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function generateWithRetry(options, policy = {}) {
  const retries = Number.isInteger(policy.retries) ? policy.retries : 2;
  const baseDelayMs = Number(policy.baseDelayMs ?? 750);
  const wait = policy.sleep || sleep;

  let attempt = 0;
  for (;;) {
    try {
      return await generateText(options);
    } catch (error) {
      const retryable =
        error instanceof ProviderError && RETRYABLE_CODES.has(error.code);
      if (!retryable || attempt >= retries || options.signal?.aborted) {
        throw error;
      }
      const delay = Math.min(baseDelayMs * 2 ** attempt, 8_000);
      attempt += 1;
      await wait(delay);
    }
  }
}

export async function generateStructured(options, policy) {
  const result = await generateWithRetry({ ...options, json: true }, policy);
  let data;
  try {
    data = JSON.parse(result.text);
  } catch {
    throw new ProviderError(
      'invalid_output',
      'The provider did not return valid JSON.',
      { retryable: true },
    );
  }
  return { ...result, data };
}
