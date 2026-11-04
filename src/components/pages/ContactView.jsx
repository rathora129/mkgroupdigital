'use client';

import {
  ArrowUpRight,
  Clock3,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
} from 'lucide-react';
import styled from 'styled-components';
import PageHero from '@/components/sections/PageHero';
import Section from '@/components/ui/Section';
import Container from '@/components/ui/Container';
import SectionHeading from '@/components/ui/SectionHeading';
import Reveal from '@/components/ui/Reveal';
import Accordion from '@/components/ui/Accordion';
import ContactForm from '@/components/contact/ContactForm';
import { faqs } from '@/data/faqs';
import siteConfig from '@/data/site';
import { media } from '@/styles/theme';

const Grid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(280px, 0.6fr);
  gap: clamp(1.5rem, 4vw, 3rem);
  align-items: start;

  ${media.down('md')} {
    grid-template-columns: 1fr;
  }
`;

const Panel = styled.div`
  padding: clamp(1.5rem, 4vw, 2.75rem);
  border-radius: ${({ theme }) => theme.radius.xl};
  border: 1px solid ${({ theme }) => theme.colors.lineStrong};
  background:
    radial-gradient(560px circle at 0% 0%, rgba(124, 92, 255, 0.1), transparent 60%),
    ${({ theme }) => theme.colors.card};
`;

const PanelHead = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.75rem;
`;

const Eyebrow = styled.p`
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.violetSoft};

  &::before {
    content: '';
    width: 24px;
    height: 1px;
    background: ${({ theme }) => theme.gradients.accent};
  }
`;

const PanelTitle = styled.h2`
  font-size: clamp(1.6rem, 3vw, 2.15rem);
  letter-spacing: -0.035em;
`;

const PanelText = styled.p`
  max-width: 540px;
  font-size: 0.92rem;
  line-height: 1.7;
  color: ${({ theme }) => theme.colors.muted};
`;

const Rail = styled.aside`
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  position: sticky;
  top: 130px;

  ${media.down('md')} {
    position: static;
  }
`;

const Card = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  padding: 1.35rem;
  border-radius: ${({ theme }) => theme.radius.lg};
  border: 1px solid ${({ theme }) => theme.colors.line};
  background: ${({ theme }) => theme.colors.bgSoft};
  transition:
    border-color 0.3s ease,
    background 0.3s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.violetLine};
  }
`;

const CardHead = styled.div`
  display: flex;
  align-items: center;
  gap: 0.55rem;
  color: ${({ theme }) => theme.colors.violetSoft};

  span {
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }
`;

const CardLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: clamp(1rem, 1.8vw, 1.15rem);
  font-weight: 500;
  letter-spacing: -0.02em;
  color: ${({ theme }) => theme.colors.text};
  overflow-wrap: anywhere;

  &:hover {
    color: ${({ theme }) => theme.colors.violetSoft};
  }
`;

const CardValue = styled.p`
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: clamp(1rem, 1.8vw, 1.15rem);
  font-weight: 500;
  letter-spacing: -0.02em;
  color: ${({ theme }) => theme.colors.text};
`;

const CardNote = styled.p`
  font-size: 0.76rem;
  line-height: 1.55;
  color: ${({ theme }) => theme.colors.faint};
`;

const Availability = styled.div`
  display: flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.85rem 1rem;
  border-radius: 999px;
  border: 1px solid rgba(87, 214, 164, 0.22);
  background: rgba(87, 214, 164, 0.06);
  color: ${({ theme }) => theme.colors.success};
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;

  &::before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
    box-shadow: 0 0 0 4px rgba(87, 214, 164, 0.1);
  }
`;

const Next = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  padding: 1.35rem;
  border-radius: ${({ theme }) => theme.radius.lg};
  border: 1px solid ${({ theme }) => theme.colors.line};
  background: linear-gradient(160deg, rgba(124, 92, 255, 0.09), rgba(255, 255, 255, 0.015));
`;

const Step = styled.div`
  display: grid;
  grid-template-columns: 24px 1fr;
  gap: 0.65rem;
  align-items: start;

  span {
    font-family: ${({ theme }) => theme.fonts.display};
    font-size: 0.7rem;
    letter-spacing: 0.08em;
    color: ${({ theme }) => theme.colors.violetSoft};
    padding-top: 0.12rem;
  }

  p {
    font-size: 0.8rem;
    line-height: 1.6;
    color: ${({ theme }) => theme.colors.textSoft};
  }
`;

const FaqWrap = styled.div`
  display: grid;
  grid-template-columns: 0.8fr 1.2fr;
  gap: clamp(2rem, 6vw, 5rem);
  align-items: start;

  ${media.down('md')} {
    grid-template-columns: 1fr;
  }
`;

const DirectLine = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;

  p {
    font-size: 0.9rem;
    line-height: 1.7;
    color: ${({ theme }) => theme.colors.muted};
  }
`;

const faqItems = [faqs[1], faqs[2], faqs[6]];

export default function ContactView() {
  return (
    <>
      <PageHero
        breadcrumb={[{ name: 'Home', path: '/' }, { name: 'Contact' }]}
        eyebrow="Contact"
        title={
          <>
            Tell us what
            <br />
            you&apos;re <em>building.</em>
          </>
        }
        description="Share a little about the project and where you want it to go. We will reply with a considered response — not a sales pitch."
        aside={
          <Card>
            <Availability>Available for new projects</Availability>
            <CardLink href={`mailto:${siteConfig.email}`}>
              <Mail size={17} /> {siteConfig.email}
            </CardLink>
            <CardNote>
              {siteConfig.responseTime}. Prefer to talk? WhatsApp is usually
              quickest.
            </CardNote>
          </Card>
        }
      />

      <Section $compact id="enquiry" aria-labelledby="enquiry-heading">
        <Container>
          <Grid>
            <Reveal y={18}>
              <Panel>
                <PanelHead>
                  <Eyebrow>Project enquiry</Eyebrow>
                  <PanelTitle id="enquiry-heading">Start a conversation.</PanelTitle>
                  <PanelText>
                    The more context you share, the more useful our first reply
                    will be. If you are unsure about scope or budget, choose the
                    closest option and we will work it out together.
                  </PanelText>
                </PanelHead>
                <ContactForm />
              </Panel>
            </Reveal>

            <Rail>
              <Card>
                <CardHead>
                  <Mail size={16} />
                  <span>Email</span>
                </CardHead>
                <CardLink href={`mailto:${siteConfig.email}`}>
                  {siteConfig.email} <ArrowUpRight size={14} />
                </CardLink>
                <CardNote>Briefs, documents and general enquiries.</CardNote>
              </Card>

              <Card>
                <CardHead>
                  <MessageCircle size={16} />
                  <span>WhatsApp</span>
                </CardHead>
                <CardLink
                  href={siteConfig.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {siteConfig.phone} <ArrowUpRight size={14} />
                </CardLink>
                <CardNote>Usually the fastest way to reach us.</CardNote>
              </Card>

              <Card>
                <CardHead>
                  <Phone size={16} />
                  <span>Call</span>
                </CardHead>
                <CardLink href={siteConfig.phoneHref}>{siteConfig.phone}</CardLink>
                <CardNote>Call us directly for a quick conversation.</CardNote>
              </Card>

              <Card>
                <CardHead>
                  <MapPin size={16} />
                  <span>Based in</span>
                </CardHead>
                <CardValue>{siteConfig.location}</CardValue>
                <CardNote>Projects run over email, WhatsApp and video calls.</CardNote>
              </Card>

              <Next>
                <CardHead>
                  <Clock3 size={16} />
                  <span>What happens next</span>
                </CardHead>
                <Step>
                  <span>01</span>
                  <p>We read your brief and look at anything you have shared.</p>
                </Step>
                <Step>
                  <span>02</span>
                  <p>
                    We reply within one business day — with questions or a
                    suggested next step.
                  </p>
                </Step>
                <Step>
                  <span>03</span>
                  <p>
                    If it is a good fit, we schedule a call and prepare a written
                    proposal.
                  </p>
                </Step>
              </Next>
            </Rail>
          </Grid>
        </Container>
      </Section>

      <Section $tone="soft" $divider aria-labelledby="contact-faq-heading">
        <Container>
          <FaqWrap>
            <DirectLine>
              <SectionHeading
                eyebrow="Before you write"
                title={
                  <>
                    A few quick <em>answers.</em>
                  </>
                }
                description="The things most people ask before starting a conversation."
                headingId="contact-faq-heading"
              />
              <p>
                Still unsure? Send the brief anyway. It is easier to point you in
                the right direction once we understand what you need.
              </p>
            </DirectLine>
            <Accordion items={faqItems} />
          </FaqWrap>
        </Container>
      </Section>
    </>
  );
}
