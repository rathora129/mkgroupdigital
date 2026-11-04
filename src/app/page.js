import Hero from '@/components/sections/Hero';
import ServicesOverview from '@/components/sections/ServicesOverview';
import BusinessSoftware from '@/components/sections/BusinessSoftware';
import WhyChoose from '@/components/sections/WhyChoose';
import FeaturedWork from '@/components/sections/FeaturedWork';
import ProcessSection from '@/components/sections/ProcessSection';
import Industries from '@/components/sections/Industries';
import TestimonialsSection from '@/components/sections/TestimonialsSection';
import FaqSection from '@/components/sections/FaqSection';
import CtaSection from '@/components/sections/CtaSection';
import { JsonLd } from '@/lib/schema';
import { faqs } from '@/data/faqs';

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  })),
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <ServicesOverview />
      <BusinessSoftware />
      <WhyChoose />
      <FeaturedWork />
      <ProcessSection />
      <Industries />
      <TestimonialsSection />
      <FaqSection />
      <CtaSection />
      <JsonLd data={faqSchema} />
    </>
  );
}
