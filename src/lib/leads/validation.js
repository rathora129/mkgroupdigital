import * as yup from 'yup';

export const LEAD_STATUSES = [
  'new',
  'researching',
  'qualified',
  'contacted',
  'meeting',
  'proposal',
  'won',
  'lost',
];

export const LEAD_PRIORITIES = ['low', 'medium', 'high', 'urgent'];

export const LEAD_SOURCES = [
  'website',
  'referral',
  'outbound',
  'inbound',
  'event',
  'social',
  'partner',
  'cold_call',
  'other',
];

export const LEAD_ARCHIVE_FILTERS = ['active', 'archived', 'all'];
export const LEAD_SORTS = [
  'created',
  'updated',
  'company',
  'value',
  'followUp',
  'priority',
];

const emptyToNull = (value) =>
  typeof value === 'string' && value.trim() === '' ? null : value;

const nullableText = (max, message) =>
  yup
    .string()
    .trim()
    .transform(emptyToNull)
    .max(max, message)
    .nullable();

const companyNameField = yup
  .string()
  .trim()
  .min(1, 'Company name is required.')
  .max(160, 'Company name must be 160 characters or fewer.');

const emailField = yup
  .string()
  .trim()
  .transform(emptyToNull)
  .email('Enter a valid email address.')
  .max(200, 'Email must be 200 characters or fewer.')
  .nullable();

const websiteField = nullableText(
  300,
  'Website must be 300 characters or fewer.',
);

const estimatedValueField = yup
  .number()
  .transform((value, original) => (original === '' ? null : value))
  .integer('Use whole currency units.')
  .min(0, 'Estimated value cannot be negative.')
  .max(1_000_000_000_000, 'That value is too large.')
  .nullable();

const currencyField = yup
  .string()
  .trim()
  .uppercase()
  .matches(/^[A-Z]{3}$/, 'Use a three-letter currency code.')
  .default('INR');

const followUpField = yup
  .date()
  .transform((value, original) => (original === '' ? null : value))
  .typeError('Enter a valid follow-up date.')
  .nullable();

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value) {
  return typeof value === 'string' && UUID_RE.test(value);
}

const assignmentField = yup
  .mixed()
  .nullable()
  .test(
    'assignee',
    'Choose a workspace member.',
    (value) =>
      value === undefined ||
      value === null ||
      (typeof value === 'string' && UUID_RE.test(value)),
  );

const notesField = nullableText(5_000, 'Notes must be 5,000 characters or fewer.');

export const leadCreateSchema = yup.object({
  companyName: companyNameField.required('Company name is required.'),
  contactName: nullableText(160, 'Contact name must be 160 characters or fewer.'),
  email: emailField,
  phone: nullableText(60, 'Phone must be 60 characters or fewer.'),
  website: websiteField,
  industry: nullableText(120, 'Industry must be 120 characters or fewer.'),
  businessType: nullableText(120, 'Business type must be 120 characters or fewer.'),
  location: nullableText(160, 'Location must be 160 characters or fewer.'),
  country: nullableText(120, 'Country must be 120 characters or fewer.'),
  source: yup
    .string()
    .oneOf(LEAD_SOURCES, 'Choose a valid source.')
    .default('other'),
  estimatedValueCents: estimatedValueField,
  currency: currencyField,
  assignedUserId: assignmentField,
  priority: yup
    .string()
    .oneOf(LEAD_PRIORITIES, 'Choose a valid priority.')
    .default('medium'),
  status: yup
    .string()
    .oneOf(LEAD_STATUSES, 'Choose a valid status.')
    .default('new'),
  nextFollowUpAt: followUpField,
  notes: notesField,
});

export const leadUpdateSchema = yup.object({
  companyName: companyNameField,
  contactName: nullableText(160, 'Contact name must be 160 characters or fewer.'),
  email: emailField,
  phone: nullableText(60, 'Phone must be 60 characters or fewer.'),
  website: websiteField,
  industry: nullableText(120, 'Industry must be 120 characters or fewer.'),
  businessType: nullableText(120, 'Business type must be 120 characters or fewer.'),
  location: nullableText(160, 'Location must be 160 characters or fewer.'),
  country: nullableText(120, 'Country must be 120 characters or fewer.'),
  source: yup.string().oneOf(LEAD_SOURCES, 'Choose a valid source.'),
  estimatedValueCents: estimatedValueField,
  currency: yup
    .string()
    .trim()
    .uppercase()
    .matches(/^[A-Z]{3}$/, 'Use a three-letter currency code.'),
  priority: yup.string().oneOf(LEAD_PRIORITIES, 'Choose a valid priority.'),
  nextFollowUpAt: followUpField,
  notes: notesField,
});

export const leadStatusSchema = yup.object({
  status: yup
    .string()
    .oneOf(LEAD_STATUSES, 'Choose a valid status.')
    .required('Choose a status.'),
  note: nullableText(500, 'Note must be 500 characters or fewer.'),
});

export const leadAssignSchema = yup.object({
  assignedUserId: yup
    .mixed()
    .defined('Choose a member or unassign.')
    .nullable()
    .test(
      'assignee',
      'Choose a workspace member.',
      (value) => value === null || (typeof value === 'string' && UUID_RE.test(value)),
    ),
});

export const leadNoteSchema = yup.object({
  body: yup
    .string()
    .trim()
    .min(2, 'Note must be at least 2 characters.')
    .max(5_000, 'Note must be 5,000 characters or fewer.')
    .required('Write a note.'),
});

export const leadArchiveSchema = yup.object({
  archived: yup.boolean().required('Choose archive or restore.'),
});

export const leadQuerySchema = yup.object({
  page: yup.number().integer().min(1).default(1),
  pageSize: yup.number().integer().min(1).max(100).default(20),
  search: yup
    .string()
    .trim()
    .transform(emptyToNull)
    .max(120, 'Search is too long.')
    .nullable(),
  status: yup.string().oneOf(LEAD_STATUSES),
  priority: yup.string().oneOf(LEAD_PRIORITIES),
  source: yup.string().oneOf(LEAD_SOURCES),
  assigned: yup
    .string()
    .trim()
    .test(
      'assigned-filter',
      'Choose a member.',
      (value) =>
        !value ||
        value === 'me' ||
        value === 'unassigned' ||
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          value,
        ),
    ),
  archived: yup
    .string()
    .oneOf(LEAD_ARCHIVE_FILTERS, 'Choose a valid archive filter.')
    .default('active'),
  sort: yup
    .string()
    .oneOf(LEAD_SORTS, 'Choose a valid sort.')
    .default('created'),
  direction: yup.string().oneOf(['asc', 'desc']).default('desc'),
  due: yup.string().oneOf(['overdue', 'upcoming']),
});
