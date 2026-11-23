// Provider metadata is server-only. Credentials are never stored in the
// database or sent to the browser; this registry only reports whether the
// environment already supplies a key.

const PROVIDERS = {
  openai: {
    key: 'openai',
    label: 'OpenAI',
    envKeys: ['OPENAI_API_KEY'],
    defaultModel: 'gpt-4o-mini',
    supportsJson: true,
    supportsTools: true,
    models: [
      { id: 'gpt-4o-mini', label: 'GPT-4o mini', inputCentsPerMillion: 15, outputCentsPerMillion: 60 },
      { id: 'gpt-4.1-mini', label: 'GPT-4.1 mini', inputCentsPerMillion: 40, outputCentsPerMillion: 160 },
      { id: 'gpt-4o', label: 'GPT-4o', inputCentsPerMillion: 250, outputCentsPerMillion: 1000 },
    ],
  },
  anthropic: {
    key: 'anthropic',
    label: 'Anthropic',
    envKeys: ['ANTHROPIC_API_KEY'],
    defaultModel: 'claude-3-5-haiku-latest',
    supportsJson: false,
    supportsTools: true,
    models: [
      { id: 'claude-3-5-haiku-latest', label: 'Claude 3.5 Haiku', inputCentsPerMillion: 80, outputCentsPerMillion: 400 },
      { id: 'claude-3-5-sonnet-latest', label: 'Claude 3.5 Sonnet', inputCentsPerMillion: 300, outputCentsPerMillion: 1500 },
    ],
  },
  gemini: {
    key: 'gemini',
    label: 'Google Gemini',
    envKeys: ['GEMINI_API_KEY', 'GOOGLE_API_KEY'],
    defaultModel: 'gemini-2.0-flash',
    supportsJson: true,
    supportsTools: true,
    models: [
      { id: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash', inputCentsPerMillion: 10, outputCentsPerMillion: 40 },
      { id: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro', inputCentsPerMillion: 125, outputCentsPerMillion: 500 },
    ],
  },
};

export const PROVIDER_KEYS = Object.keys(PROVIDERS);

export function getProviderDefinition(key) {
  return PROVIDERS[key] || null;
}

export function getProviderApiKey(key) {
  const definition = PROVIDERS[key];
  if (!definition) return null;
  for (const envKey of definition.envKeys) {
    const value = process.env[envKey];
    if (value && value.trim()) return value.trim();
  }
  return null;
}

export function isProviderConfigured(key) {
  return Boolean(getProviderApiKey(key));
}

export function configuredProviderKeys() {
  return PROVIDER_KEYS.filter((key) => isProviderConfigured(key));
}

export function getModelDefinition(providerKey, modelId) {
  const definition = PROVIDERS[providerKey];
  if (!definition) return null;
  return definition.models.find((model) => model.id === modelId) || null;
}

// Unknown models are allowed (providers add them faster than this table), but
// the cost then stays 0 and the UI marks usage as unpriced.
export function estimateCostCents(providerKey, modelId, usage = {}) {
  const model = getModelDefinition(providerKey, modelId);
  if (!model) return 0;
  const input = Number(usage.promptTokens || 0);
  const output = Number(usage.completionTokens || 0);
  const cents =
    (input / 1_000_000) * model.inputCentsPerMillion +
    (output / 1_000_000) * model.outputCentsPerMillion;
  return Math.max(0, Math.round(cents));
}

export function listProviderMetadata() {
  return PROVIDER_KEYS.map((key) => {
    const { envKeys, ...definition } = PROVIDERS[key];
    return {
      ...definition,
      configured: isProviderConfigured(key),
    };
  });
}
