export const projects = [
  {
    slug: 'rooteco',
    name: 'RootsEco',
    industry: 'Corporate Gifting',
    services: [
      'E-commerce Development',
      'Website Development',
      'UI/UX Design',
      'Custom Web Applications',
    ],
    image: '/projects/rooteco.jpg',
    imageWide: '/projects/rooteco-wide.jpg',
    imageAlt:
      'RootsEco corporate gifting brand cover with the RootsEco seal on a deep green background',
    url: null,
    status: 'Private build',
    featured: true,
    summary:
      'A full corporate-gifting storefront and owner dashboard, managed from one connected system.',
    overview: [
      'RootsEco is a corporate gifting storefront built as a single, connected system. The public site presents products, collections and a build-your-own-hamper flow, while a private owner dashboard manages the catalogue, orders, quotes, leads and website content.',
      'The result is a storefront that is straightforward for customers and practical for the team running it — with content, commerce and enquiries living in the same place.',
    ],
    highlights: [
      'Product catalogue with categories, variants and customisation',
      'Build-your-own-hamper flow and quote requests',
      'Owner dashboard covering orders, leads, content and SEO',
    ],
    note: 'Live preview available on request.',
  },
  {
    slug: 'multigraphics',
    name: 'Multigraphics Group',
    industry: 'Printing & Assessment Technology',
    services: ['Website Development', 'UI/UX Design'],
    image: '/projects/multigraphics.jpg',
    imageAlt:
      'Multigraphics Group website hero presenting print, assessment and learning platforms',
    url: 'https://multigraphics.in',
    status: 'Live',
    featured: true,
    summary:
      'A group website bringing print production, OMR assessment and learning platforms under one clear brand.',
    overview: [
      'Multigraphics Group operates across print production, InstaOMR assessment technology and learning platforms. The website needed to present three related but distinct offerings without diluting the group brand.',
      'We built a clear group-level structure with a distinct story for each service line and straightforward enquiry paths throughout.',
    ],
    highlights: [
      'Group-level structure across three business offerings',
      'Product storytelling for print, assessment and learning',
      'Clear enquiry paths for each service line',
    ],
  },
  {
    slug: 'dice-academy',
    name: 'Dice Academy',
    industry: 'Education & Training',
    services: ['Website Development', 'UI/UX Design'],
    image: '/projects/dice-academy.jpg',
    imageAlt:
      'Dice Academy website hero promoting UGC-recognised degrees and industry training',
    url: 'https://dice-academy.com',
    status: 'Live',
    featured: true,
    summary:
      'A conversion-focused site for a UGC-recognised degree and industry training academy in Delhi NCR.',
    overview: [
      'Dice Academy presents UGC-recognised degree programmes alongside industry training, with a course ladder that runs from a six-month certificate to a three-year degree.',
      'The website makes programme options easy to compare, keeps enrolment and demo booking visible, and gives the academy a current, responsive presence across devices.',
    ],
    highlights: [
      'Programme ladder from certificate to degree',
      'Demo booking and enrolment calls to action',
      'Responsive programme content for mobile visitors',
    ],
  },
  {
    slug: 'tech-assistant',
    name: 'Tech Assistant',
    industry: 'Technology & Software',
    services: ['Website Development', 'UI/UX Design'],
    image: '/projects/techassistant.jpg',
    imageAlt:
      'Tech Assistant website hero for a custom software development company in India',
    url: 'https://techassistant.co.in',
    status: 'Live',
    featured: true,
    summary:
      'A modern website for a Lucknow-based custom software company, with a conversational enquiry entry point.',
    overview: [
      'Tech Assistant builds custom software for clients in India and abroad. Its website needed to explain a broad service range quickly and make starting a conversation feel easy.',
      'The site pairs a clear service story with a conversational enquiry experience, backed by a fast, responsive marketing build.',
    ],
    highlights: [
      'Service positioning for a custom software company',
      'Conversational enquiry entry point',
      'Fast, responsive marketing site',
    ],
  },
  {
    slug: 'oraanj-interiors',
    name: 'Ooraanj Interiors',
    industry: 'Interior Design',
    services: ['Website Development', 'UI/UX Design'],
    image: '/projects/oraanj.jpg',
    imageAlt:
      'Ooraanj Interiors website hero presenting bespoke London residential and commercial interiors',
    url: 'https://oraanj-interiors.co.uk',
    status: 'Live',
    featured: true,
    summary:
      'A premium website for a London interior design and design & build studio serving UK and international clients.',
    overview: [
      'Ooraanj Interiors designs and delivers residential and commercial interiors across London. The website needed to communicate a high-end design sensibility while making a complex service range easy to navigate.',
      'The site presents interior design, renovation and design & build services with project storytelling and clear consultation paths for local and overseas clients.',
    ],
    highlights: [
      'Service architecture across residential, commercial and renovation',
      'Project storytelling with before-and-after content',
      'Consultation and enquiry flows for UK and overseas clients',
    ],
  },
];

export const featuredProjects = projects.filter((project) => project.featured);

export const getProjectBySlug = (slug) =>
  projects.find((project) => project.slug === slug);

export default projects;
