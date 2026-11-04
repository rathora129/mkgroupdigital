'use client';

import styled from 'styled-components';
import Container from '@/components/ui/Container';
import Section from '@/components/ui/Section';
import SectionHeading from '@/components/ui/SectionHeading';
import ServiceCard from '@/components/ui/ServiceCard';
import Reveal from '@/components/ui/Reveal';
import Button from '@/components/ui/Button';
import services from '@/data/services';
import { media } from '@/styles/theme';

const Head = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 2rem;
  margin-bottom: clamp(2.5rem, 5vw, 3.5rem);

  ${media.down('md')} {
    flex-direction: column;
    align-items: flex-start;
    gap: 1.5rem;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.9rem;

  ${media.down('lg')} {
    grid-template-columns: repeat(2, 1fr);
  }

  ${media.down('sm')} {
    grid-template-columns: 1fr;
  }
`;

const LinkWrap = styled.div`
  flex-shrink: 0;
  padding-bottom: 0.4rem;
`;

export default function ServicesOverview({ showHeaderLink = true }) {
  return (
    <Section id="services" aria-labelledby="services-heading">
      <Container>
        <Head>
          <SectionHeading
            eyebrow="Services"
            title={
              <>
                Everything Your Brand <em>Needs to Grow.</em>
              </>
            }
            description="Eight connected capabilities — from the first line of strategy to the systems that keep growing after launch."
            headingId="services-heading"
          />
          {showHeaderLink ? (
            <LinkWrap>
              <Button href="/services" variant="ghost">
                All services
              </Button>
            </LinkWrap>
          ) : null}
        </Head>

        <Grid>
          {services.map((service, index) => (
            <Reveal key={service.slug} delay={(index % 4) * 0.06} y={18}>
              <ServiceCard service={service} index={index} />
            </Reveal>
          ))}
        </Grid>
      </Container>
    </Section>
  );
}
