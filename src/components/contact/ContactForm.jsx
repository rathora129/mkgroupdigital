'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Form, Formik } from 'formik';
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Loader2,
  Mail,
  MessageCircle,
  Send,
} from 'lucide-react';
import styled from 'styled-components';
import Button from '@/components/ui/Button';
import { contactSchema, initialContactValues } from '@/lib/contactSchema';
import { serviceOptions } from '@/data/services';
import { budgetOptions, contactMethodOptions } from '@/data/content';
import siteConfig from '@/data/site';
import { media } from '@/styles/theme';

const FormEl = styled(Form)`
  display: flex;
  flex-direction: column;
  gap: 1.15rem;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  ${media.down('sm')} {
    grid-template-columns: 1fr;
  }
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  ${({ $full }) => $full && 'grid-column: 1 / -1;'}
`;

const Label = styled.label`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.5rem;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.textSoft};

  span {
    font-size: 0.64rem;
    font-weight: 500;
    letter-spacing: 0.04em;
    text-transform: none;
    color: ${({ theme }) => theme.colors.faint};
  }
`;

const fieldStyles = `
  width: 100%;
  padding: 0.85rem 1rem;
  border-radius: 12px;
  border: 1px solid ${'rgba(255,255,255,0.1)'};
  background: rgba(255, 255, 255, 0.025);
  color: #F4F4F7;
  font-size: 0.92rem;
  line-height: 1.5;
  transition: border-color 0.25s ease, background 0.25s ease, box-shadow 0.25s ease;
  outline: none;

  &::placeholder {
    color: #5c5c6e;
  }

  &:hover {
    border-color: rgba(255, 255, 255, 0.18);
  }

  &:focus {
    border-color: rgba(124, 92, 255, 0.55);
    background: rgba(124, 92, 255, 0.045);
    box-shadow: 0 0 0 3px rgba(124, 92, 255, 0.11);
  }
`;

const Input = styled.input`
  ${fieldStyles}
  border-color: ${({ theme, $error }) =>
    $error ? theme.colors.danger : 'rgba(255,255,255,0.1)'};
`;

const SelectWrap = styled.div`
  position: relative;

  svg {
    position: absolute;
    top: 50%;
    right: 1rem;
    transform: translateY(-50%);
    pointer-events: none;
    color: ${({ theme }) => theme.colors.faint};
  }
`;

const Select = styled.select`
  ${fieldStyles}
  appearance: none;
  padding-right: 2.6rem;
  cursor: pointer;
  border-color: ${({ theme, $error }) =>
    $error ? theme.colors.danger : 'rgba(255,255,255,0.1)'};

  option {
    background: ${({ theme }) => theme.colors.bgRaised};
    color: ${({ theme }) => theme.colors.text};
  }
`;

const Textarea = styled.textarea`
  ${fieldStyles}
  min-height: 150px;
  resize: vertical;
  border-color: ${({ theme, $error }) =>
    $error ? theme.colors.danger : 'rgba(255,255,255,0.1)'};
`;

const ErrorText = styled.p`
  font-size: 0.72rem;
  line-height: 1.45;
  color: ${({ theme }) => theme.colors.danger};
`;

const MethodGroup = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
`;

const Method = styled.label`
  position: relative;
  cursor: pointer;

  input {
    position: absolute;
    opacity: 0;
    pointer-events: none;
  }

  span {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 46px;
    padding: 0.6rem 0.8rem;
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(255, 255, 255, 0.025);
    color: ${({ theme }) => theme.colors.textSoft};
    font-size: 0.86rem;
    transition:
      border-color 0.25s ease,
      background 0.25s ease,
      color 0.25s ease;
  }

  &:hover span {
    border-color: rgba(255, 255, 255, 0.18);
  }

  input:checked + span {
    border-color: rgba(124, 92, 255, 0.55);
    background: rgba(124, 92, 255, 0.1);
    color: ${({ theme }) => theme.colors.text};
  }

  input:focus-visible + span {
    outline: 2px solid rgba(124, 92, 255, 0.6);
    outline-offset: 2px;
  }
`;

const Counter = styled.span`
  align-self: flex-end;
  font-size: 0.66rem;
  color: ${({ theme }) => theme.colors.faint};
`;

const Honeypot = styled.div`
  position: absolute;
  left: -9999px;
  width: 1px;
  height: 1px;
  overflow: hidden;
`;

const SubmitRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  margin-top: 0.25rem;
`;

const Legal = styled.p`
  font-size: 0.72rem;
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.faint};

  a {
    color: ${({ theme }) => theme.colors.textSoft};
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  a:hover {
    color: ${({ theme }) => theme.colors.violetSoft};
  }
`;

const Alert = styled.div`
  display: flex;
  gap: 0.75rem;
  padding: 1rem 1.1rem;
  border-radius: ${({ theme }) => theme.radius.sm};
  border: 1px solid rgba(255, 122, 122, 0.28);
  background: ${({ theme }) => theme.colors.dangerWash};
  color: ${({ theme }) => theme.colors.textSoft};
  font-size: 0.82rem;
  line-height: 1.6;

  svg {
    flex-shrink: 0;
    margin-top: 0.1rem;
    color: ${({ theme }) => theme.colors.danger};
  }

  a {
    color: ${({ theme }) => theme.colors.text};
    text-decoration: underline;
    text-underline-offset: 2px;
  }
`;

const AlertBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
`;

const Direct = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;

  a {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.35rem 0.6rem;
    border-radius: 999px;
    border: 1px solid rgba(255, 255, 255, 0.14);
    font-size: 0.72rem;
    text-decoration: none;
    color: ${({ theme }) => theme.colors.textSoft};
  }

  a:hover {
    border-color: ${({ theme }) => theme.colors.violetLine};
    color: ${({ theme }) => theme.colors.text};
  }
`;

const Spin = styled.span`
  display: inline-flex;

  @media (prefers-reduced-motion: no-preference) {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const SuccessPanel = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1rem;
  padding: clamp(1.75rem, 4vw, 2.5rem);
  border-radius: ${({ theme }) => theme.radius.lg};
  border: 1px solid rgba(87, 214, 164, 0.24);
  background:
    radial-gradient(420px circle at 100% 0%, rgba(87, 214, 164, 0.1), transparent 65%),
    ${({ theme }) => theme.colors.card};

  > svg {
    color: ${({ theme }) => theme.colors.success};
  }

  h3 {
    font-size: clamp(1.35rem, 3vw, 1.7rem);
    letter-spacing: -0.03em;
  }

  p {
    max-width: 520px;
    font-size: 0.94rem;
    line-height: 1.7;
    color: ${({ theme }) => theme.colors.muted};
  }
`;

const SuccessActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  padding-top: 0.4rem;
`;

export default function ContactForm() {
  const [sent, setSent] = useState(null);
  const [failure, setFailure] = useState(null);
  const [formKey, setFormKey] = useState(0);

  const fallbackMessage = `We could not send your message from this form. Please email ${siteConfig.email} or message us on WhatsApp at ${siteConfig.phone}.`;

  if (sent) {
    return (
      <SuccessPanel role="status">
        <CheckCircle2 size={30} strokeWidth={1.8} />
        <h3>Thank you{sent.firstName ? `, ${sent.firstName}` : ''}.</h3>
        <p>{sent.message}</p>
        <p>
          We will review your brief, follow up with any questions and suggest a
          time to talk if it looks like a good fit.
        </p>
        <SuccessActions>
          <Button
            href={siteConfig.whatsappUrl}
            external
            icon={<MessageCircle size={16} strokeWidth={1.8} />}
            arrow={false}
          >
            Chat on WhatsApp
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              setSent(null);
              setFormKey((key) => key + 1);
            }}
            arrow={false}
          >
            Send another enquiry
          </Button>
        </SuccessActions>
      </SuccessPanel>
    );
  }

  return (
    <Formik
      key={formKey}
      initialValues={initialContactValues}
      validationSchema={contactSchema}
      onSubmit={async (values, { setSubmitting, resetForm }) => {
        setFailure(null);

        const payload = Object.fromEntries(
          Object.entries(values).map(([key, value]) => [
            key,
            typeof value === 'string' ? value.trim() : value,
          ]),
        );

        try {
          const response = await fetch('/api/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          const result = await response.json().catch(() => ({}));

          if (!response.ok) {
            setFailure({ message: result.message || fallbackMessage });
            return;
          }

          setSent({
            message: result.message,
            firstName: payload.fullName.split(' ')[0],
          });
          resetForm();
        } catch {
          setFailure({ message: fallbackMessage });
        } finally {
          setSubmitting(false);
        }
      }}
    >
      {({
        values,
        errors,
        touched,
        isSubmitting,
        handleChange,
        handleBlur,
        setFieldValue,
      }) => {
        const errorFor = (name) =>
          touched[name] && errors[name] ? errors[name] : null;

        return (
          <FormEl noValidate aria-busy={isSubmitting}>
            {failure ? (
              <Alert role="alert">
                <AlertCircle size={18} />
                <AlertBody>
                  <span>{failure.message}</span>
                  <Direct>
                    <a href={`mailto:${siteConfig.email}`}>
                      <Mail size={13} /> {siteConfig.email}
                    </a>
                    <a
                      href={siteConfig.whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle size={13} /> WhatsApp
                    </a>
                  </Direct>
                </AlertBody>
              </Alert>
            ) : null}

            <Grid>
              <Field>
                <Label htmlFor="fullName">Full name</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  autoComplete="name"
                  placeholder="Your name"
                  value={values.fullName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-invalid={Boolean(errorFor('fullName'))}
                  aria-describedby={errorFor('fullName') ? 'fullName-error' : undefined}
                  $error={Boolean(errorFor('fullName'))}
                />
                {errorFor('fullName') ? (
                  <ErrorText id="fullName-error">{errorFor('fullName')}</ErrorText>
                ) : null}
              </Field>

              <Field>
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="you@gmail.com"
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-invalid={Boolean(errorFor('email'))}
                  aria-describedby={errorFor('email') ? 'email-error' : undefined}
                  $error={Boolean(errorFor('email'))}
                />
                {errorFor('email') ? (
                  <ErrorText id="email-error">{errorFor('email')}</ErrorText>
                ) : null}
              </Field>

              <Field>
                <Label htmlFor="phone">
                  Phone / WhatsApp <span>Optional</span>
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="+91 00000 00000"
                  value={values.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-invalid={Boolean(errorFor('phone'))}
                  aria-describedby={errorFor('phone') ? 'phone-error' : undefined}
                  $error={Boolean(errorFor('phone'))}
                />
                {errorFor('phone') ? (
                  <ErrorText id="phone-error">{errorFor('phone')}</ErrorText>
                ) : null}
              </Field>

              <Field $full>
                <Label htmlFor="company">
                  Company / business name <span>Optional</span>
                </Label>
                <Input
                  id="company"
                  name="company"
                  type="text"
                  autoComplete="organization"
                  placeholder="Leave blank if you have not registered one yet"
                  value={values.company}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-invalid={Boolean(errorFor('company'))}
                  aria-describedby={errorFor('company') ? 'company-error' : undefined}
                  $error={Boolean(errorFor('company'))}
                />
                {errorFor('company') ? (
                  <ErrorText id="company-error">{errorFor('company')}</ErrorText>
                ) : null}
              </Field>

              <Field>
                <Label htmlFor="service">Service required</Label>
                <SelectWrap>
                  <Select
                    id="service"
                    name="service"
                    value={values.service}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    aria-invalid={Boolean(errorFor('service'))}
                    aria-describedby={
                      errorFor('service') ? 'service-error' : undefined
                    }
                    $error={Boolean(errorFor('service'))}
                  >
                    <option value="">Select the closest option</option>
                    {serviceOptions.map((service) => (
                      <option key={service} value={service}>
                        {service}
                      </option>
                    ))}
                  </Select>
                  <ChevronDown size={16} />
                </SelectWrap>
                {errorFor('service') ? (
                  <ErrorText id="service-error">{errorFor('service')}</ErrorText>
                ) : null}
              </Field>

              <Field>
                <Label htmlFor="budget">Estimated budget</Label>
                <SelectWrap>
                  <Select
                    id="budget"
                    name="budget"
                    value={values.budget}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    aria-invalid={Boolean(errorFor('budget'))}
                    aria-describedby={
                      errorFor('budget') ? 'budget-error' : undefined
                    }
                    $error={Boolean(errorFor('budget'))}
                  >
                    <option value="">Select a range</option>
                    {budgetOptions.map((budget) => (
                      <option key={budget} value={budget}>
                        {budget}
                      </option>
                    ))}
                  </Select>
                  <ChevronDown size={16} />
                </SelectWrap>
                {errorFor('budget') ? (
                  <ErrorText id="budget-error">{errorFor('budget')}</ErrorText>
                ) : null}
              </Field>

              <Field $full>
                <Label htmlFor="details">
                  Project details{' '}
                  <span>
                    Optional · {values.details.length}/5000
                  </span>
                </Label>
                <Textarea
                  id="details"
                  name="details"
                  placeholder="What are you building, who is it for and what does success look like? Even two or three sentences help. Links to existing work are welcome."
                  value={values.details}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-invalid={Boolean(errorFor('details'))}
                  aria-describedby={errorFor('details') ? 'details-error' : undefined}
                  $error={Boolean(errorFor('details'))}
                />
                {errorFor('details') ? (
                  <ErrorText id="details-error">{errorFor('details')}</ErrorText>
                ) : (
                  <Counter>Brief, clear and as specific as you can be.</Counter>
                )}
              </Field>

              <Field $full>
                <Label id="contact-method-label">Preferred contact method</Label>
                <MethodGroup role="radiogroup" aria-labelledby="contact-method-label">
                  {contactMethodOptions.map((method) => (
                    <Method key={method}>
                      <input
                        type="radio"
                        name="contactMethod"
                        value={method}
                        checked={values.contactMethod === method}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                      <span>{method}</span>
                    </Method>
                  ))}
                </MethodGroup>
                {errorFor('contactMethod') ? (
                  <ErrorText id="contactMethod-error">
                    {errorFor('contactMethod')}
                  </ErrorText>
                ) : null}
              </Field>
            </Grid>

            <Honeypot aria-hidden="true">
              <label htmlFor="website">Website</label>
              <input
                id="website"
                name="website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={values.website}
                onChange={(event) =>
                  setFieldValue('website', event.target.value)
                }
              />
            </Honeypot>

            <SubmitRow>
              <Button
                type="submit"
                size="lg"
                full
                disabled={isSubmitting}
                icon={
                  isSubmitting ? (
                    <Spin>
                      <Loader2 size={17} strokeWidth={2} />
                    </Spin>
                  ) : (
                    <Send size={16} strokeWidth={1.9} />
                  )
                }
                arrow={false}
              >
                {isSubmitting ? 'Sending enquiry…' : 'Send Enquiry'}
              </Button>
              <Legal>
                By sending this form you agree to our{' '}
                <Link href="/privacy-policy">Privacy Policy</Link>. Your details
                are used only to respond to this enquiry.
              </Legal>
            </SubmitRow>
          </FormEl>
        );
      }}
    </Formik>
  );
}
