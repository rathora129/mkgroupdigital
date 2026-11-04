'use client';

import {
  BarChart3,
  Boxes,
  FileText,
  MessageCircle,
  Users,
  Warehouse,
} from 'lucide-react';
import styled from 'styled-components';
import Container from '@/components/ui/Container';
import Section from '@/components/ui/Section';
import SectionHeading from '@/components/ui/SectionHeading';
import Reveal from '@/components/ui/Reveal';
import Button from '@/components/ui/Button';
import siteConfig from '@/data/site';
import { media } from '@/styles/theme';

const examples = [
  {
    icon: Warehouse,
    title: 'Retail Inventory Management',
    description:
      'Track stock levels, categories and reorder points across a single shop or multiple locations.',
  },
  {
    icon: Boxes,
    title: 'Stock & Purchase Management',
    description:
      'Record purchases, manage suppliers and know exactly what is coming in and going out.',
  },
  {
    icon: Users,
    title: 'Employee Management',
    description:
      'Staff records, roles and attendance in one place — without spreadsheets and registers.',
  },
  {
    icon: FileText,
    title: 'Billing & Invoicing',
    description:
      'Create invoices, track payments and keep clean records for every sale you make.',
  },
  {
    icon: MessageCircle,
    title: 'CRM & Lead Management',
    description:
      'Capture enquiries, follow up on time and see every customer conversation in one view.',
  },
  {
    icon: BarChart3,
    title: 'Business Analytics Dashboard',
    description:
      'Sales, stock and performance numbers summarised in a dashboard you actually check.',
  },
];

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-top: clamp(2.5rem, 5vw, 3.5rem);

  ${media.down('md')} {
    grid-template-columns: 1fr 1fr;
  }

  ${media.down('sm')} {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.article`
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  padding: 1.5rem;
  border-radius: ${({ theme }) => theme.radius.lg};
  border: 1px solid ${({ theme }) => theme.colors.line};
  background: rgba(255, 255, 255, 0.02);
  transition:
    transform 0.4s cubic-bezier(0.22, 1, 0.36, 1),
    border-color 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    border-color: ${({ theme }) => theme.colors.violetLine};
  }

  svg {
    color: ${({ theme }) => theme.colors.violetSoft};
  }

  h3 {
    font-size: 1.02rem;
    letter-spacing: -0.02em;
  }

  p {
    font-size: 0.86rem;
    line-height: 1.65;
    color: ${({ theme }) => theme.colors.muted};
  }
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: clamp(2rem, 4vw, 3rem);
`;

export default function BusinessSoftware() {
  return (
    <Section $tone="soft" aria-labelledby="software-heading">
      <Container>
        <SectionHeading
          eyebrow="Business software"
          title={
            <>
              Smart Software for <em>Everyday Business Operations.</em>
            </>
          }
          description="We build practical business software that helps shops and growing businesses manage inventory, stock, billing, employees, customers and daily operations from one place."
          headingId="software-heading"
        />

        <Grid>
          {examples.map((example, index) => (
            <Reveal key={example.title} delay={(index % 3) * 0.06} y={18}>
              <Card>
                <example.icon size={20} strokeWidth={1.7} />
                <h3>{example.title}</h3>
                <p>{example.description}</p>
              </Card>
            </Reveal>
          ))}
        </Grid>

        <Actions>
          <Button href="/contact" size="lg">
            Discuss Your Software Idea
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
        </Actions>
      </Container>
    </Section>
  );
}
