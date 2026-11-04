'use client';

import styled from 'styled-components';
import Container from '@/components/ui/Container';
import Section from '@/components/ui/Section';
import SectionHeading from '@/components/ui/SectionHeading';
import Testimonials from '@/components/ui/Testimonials';

const Head = styled.div`
  margin-bottom: clamp(2rem, 4vw, 2.75rem);
`;

export default function TestimonialsSection() {
  return (
    <Section id="testimonials" aria-labelledby="testimonials-heading">
      <Container>
        <Head>
          <SectionHeading
            eyebrow="Testimonials"
            title={
              <>
                Client <em>stories.</em>
              </>
            }
            description="Honest words from the businesses we work with — published only once they are happy to share."
            headingId="testimonials-heading"
          />
        </Head>
        <Testimonials />
      </Container>
    </Section>
  );
}
