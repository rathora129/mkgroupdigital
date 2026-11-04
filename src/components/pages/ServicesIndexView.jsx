'use client';

import Link from 'next/link';
import { ArrowUpRight, MessageCircle, Sparkles } from 'lucide-react';
import styled from 'styled-components';
import PageHero from '@/components/sections/PageHero';
import Section from '@/components/ui/Section';
import Container from '@/components/ui/Container';
import SectionHeading from '@/components/ui/SectionHeading';
import Reveal from '@/components/ui/Reveal';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import ProcessSection from '@/components/sections/ProcessSection';
import CtaSection from '@/components/sections/CtaSection';
import services from '@/data/services';
import siteConfig from '@/data/site';
import { media } from '@/styles/theme';

const CapabilityGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.55rem;
  width: 100%;
  padding: 1rem;
  border-radius: ${({ theme }) => theme.radius.lg};
  border: 1px solid ${({ theme }) => theme.colors.line};
  background: ${({ theme }) => theme.gradients.card};
  box-shadow: ${({ theme }) => theme.shadow.card};
`;

const Capability = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.7rem 0.75rem;
  border-radius: ${({ theme }) => theme.radius.sm};
  border: 1px solid transparent;
  color: ${({ theme }) => theme.colors.textSoft};
  font-size: 0.76rem;
  line-height: 1.2;
  transition:
    background 0.3s ease,
    border-color 0.3s ease,
    color 0.3s ease;

  svg {
    color: ${({ theme }) => theme.colors.violetSoft};
    flex-shrink: 0;
  }

  &:hover {
    background: ${({ theme }) => theme.colors.violetWash};
    border-color: ${({ theme }) => theme.colors.violetLine};
    color: ${({ theme }) => theme.colors.text};
  }
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  border-top: 1px solid ${({ theme }) => theme.colors.line};
  margin-top: clamp(2.5rem, 5vw, 3.75rem);
`;

const Row = styled(Link)`
  display: grid;
  grid-template-columns: 58px 1.05fr 1.35fr 44px;
  align-items: center;
  gap: clamp(1rem, 3vw, 2.5rem);
  padding: 1.75rem 0.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.line};
  transition:
    background 0.35s ease,
    padding 0.35s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.02);
    padding-inline: 1.1rem;
  }

  &:hover .service-glyph {
    background: linear-gradient(135deg, rgba(124, 92, 255, 0.3), rgba(77, 141, 255, 0.16));
    border-color: ${({ theme }) => theme.colors.violetLine};
    color: ${({ theme }) => theme.colors.violetSoft};
  }

  &:hover .service-arrow {
    color: ${({ theme }) => theme.colors.violetSoft};
    transform: translate(3px, -3px);
  }

  ${media.down('md')} {
    grid-template-columns: 46px 1fr 34px;
    gap: 0.9rem 1rem;
    padding-block: 1.5rem;
  }
`;

const Glyph = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 16px;
  border: 1px solid ${({ theme }) => theme.colors.line};
  background: rgba(255, 255, 255, 0.03);
  color: ${({ theme }) => theme.colors.textSoft};
  transition:
    background 0.35s ease,
    border-color 0.35s ease,
    color 0.35s ease;

  ${media.down('md')} {
    width: 44px;
    height: 44px;
    border-radius: 12px;
  }
`;

const RowTitle = styled.h3`
  font-size: clamp(1.15rem, 2.2vw, 1.5rem);
  letter-spacing: -0.03em;

  small {
    display: block;
    margin-top: 0.4rem;
    font-family: ${({ theme }) => theme.fonts.body};
    font-size: 0.7rem;
    font-weight: 500;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: ${({ theme }) => theme.colors.faint};
  }
`;

const RowCopy = styled.p`
  font-size: 0.9rem;
  line-height: 1.65;
  color: ${({ theme }) => theme.colors.muted};

  ${media.down('md')} {
    grid-column: 2 / -1;
    grid-row: 2;
  }
`;

const RowArrow = styled.span`
  display: inline-flex;
  justify-content: flex-end;
  color: ${({ theme }) => theme.colors.faint};
  transition:
    transform 0.35s cubic-bezier(0.22, 1, 0.36, 1),
    color 0.3s ease;
`;

const Models = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-top: clamp(2.5rem, 5vw, 3.5rem);

  ${media.down('md')} {
    grid-template-columns: 1fr;
  }
`;

const Model = styled.article`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1.8rem;
  border-radius: ${({ theme }) => theme.radius.lg};
  border: 1px solid ${({ theme }) => theme.colors.line};
  background: ${({ theme }) => theme.colors.card};

  span {
    font-family: ${({ theme }) => theme.fonts.display};
    font-size: 0.72rem;
    letter-spacing: 0.16em;
    color: ${({ theme }) => theme.colors.violetSoft};
  }

  h3 {
    font-size: 1.18rem;
    letter-spacing: -0.025em;
  }

  p {
    font-size: 0.9rem;
    line-height: 1.65;
    color: ${({ theme }) => theme.colors.muted};
  }
`;

const Note = styled.div`
  display: flex;
  align-items: center;
  gap: 0.65rem;
  margin-top: 1.25rem;
  padding: 0.9rem 1.1rem;
  border-radius: ${({ theme }) => theme.radius.sm};
  border: 1px solid rgba(87, 214, 164, 0.18);
  background: rgba(87, 214, 164, 0.05);
  color: ${({ theme }) => theme.colors.textSoft};
  font-size: 0.82rem;
  line-height: 1.5;

  svg {
    color: ${({ theme }) => theme.colors.success};
    flex-shrink: 0;
  }
`;

export default function ServicesIndexView() {
  return (
    <>
      <PageHero
        breadcrumb={[{ name: 'Home', path: '/' }, { name: 'Services' }]}
        eyebrow="Services"
        title={
          <>
            Everything your brand
            <br />
            needs to <em>grow.</em>
          </>
        }
        description="Strategy, design, engineering and growth — connected under one roof. Choose a single capability or bring us in across the whole journey."
        actions={
          <>
            <Button href="/contact" size="lg">
              Start Your Project
            </Button>
            <Button
              href={siteConfig.whatsappUrl}
              external
              variant="secondary"
              size="lg"
              icon={<MessageCircle size={17} strokeWidth={1.8} />}
              arrow={false}
            >
              Chat on WhatsApp
            </Button>
          </>
        }
        aside={
          <CapabilityGrid aria-label="All services">
            {services.map((service) => (
              <Capability key={service.slug} href={`/services/${service.slug}`}>
                <Icon name={service.icon} size={16} />
                {service.shortTitle}
              </Capability>
            ))}
          </CapabilityGrid>
        }
      />

      <Section aria-labelledby="capabilities-heading">
        <Container>
          <SectionHeading
            eyebrow="Capabilities"
            title={
              <>
                Eight services. <em>One connected team.</em>
              </>
            }
            description="Each service is strong on its own. Together they remove the gaps that appear when strategy, design, build and growth sit in separate places."
            headingId="capabilities-heading"
          />

          <List>
            {services.map((service, index) => (
              <Reveal key={service.slug} delay={index * 0.04} y={18}>
                <Row href={`/services/${service.slug}`}>
                  <Glyph className="service-glyph">
                    <Icon name={service.icon} size={22} />
                  </Glyph>
                  <RowTitle>
                    {service.title}
                    <small>Service {String(index + 1).padStart(2, '0')}</small>
                  </RowTitle>
                  <RowCopy>{service.short}</RowCopy>
                  <RowArrow className="service-arrow" aria-hidden="true">
                    <ArrowUpRight size={20} strokeWidth={1.8} />
                  </RowArrow>
                </Row>
              </Reveal>
            ))}
          </List>

          <Note>
            <Sparkles size={16} />
            Not sure where to start? Tell us the outcome you need — we will
            recommend the right mix, not the biggest one.
          </Note>
        </Container>
      </Section>

      <Section $tone="soft" aria-labelledby="models-heading">
        <Container>
          <SectionHeading
            eyebrow="Engagements"
            title={
              <>
                Three ways to <em>work together.</em>
              </>
            }
            description="Every engagement is scoped around what the business needs now, with a clear path to what comes next."
            headingId="models-heading"
          />
          <Models>
            <Model>
              <span>01</span>
              <h3>A focused project</h3>
              <p>
                A defined website, brand or platform build — planned, designed,
                developed and delivered as one engagement.
              </p>
            </Model>
            <Model>
              <span>02</span>
              <h3>An ongoing partnership</h3>
              <p>
                Continuous design, development and growth support for teams that
                ship regularly and need a dependable digital partner.
              </p>
            </Model>
            <Model>
              <span>03</span>
              <h3>A product build</h3>
              <p>
                End-to-end delivery of a custom application, from workflow mapping
                and architecture through to launch and iteration.
              </p>
            </Model>
          </Models>
          <Note>
            <Sparkles size={16} />
            Scope, timeline and investment are agreed in writing before work
            begins. No open-ended estimates.
          </Note>
        </Container>
      </Section>

      <ProcessSection />
      <CtaSection />
    </>
  );
}
