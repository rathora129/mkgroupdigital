import * as Yup from 'yup';
import { serviceOptions } from '@/data/services';
import { budgetOptions, contactMethodOptions } from '@/data/content';

const phonePattern = /^[+()\d\s.-]{7,20}$/;

export const contactSchema = Yup.object({
  fullName: Yup.string()
    .trim()
    .min(2, 'Please enter your full name.')
    .max(80, 'Please keep your name under 80 characters.')
    .required('Please enter your full name.'),
  email: Yup.string()
    .trim()
    .email('Please enter a valid email address.')
    .max(254, 'Please use an email address under 254 characters.')
    .required('Please enter your email address.'),
  phone: Yup.string()
    .trim()
    .test(
      'phone-format',
      'Please enter a valid phone or WhatsApp number.',
      (value) => !value || phonePattern.test(value),
    ),
  company: Yup.string()
    .trim()
    .max(120, 'Please keep the company or business name under 120 characters.'),
  service: Yup.string()
    .required('Please choose the closest option.')
    .oneOf(serviceOptions, 'Please choose an option from the list.'),
  budget: Yup.string()
    .required('Please choose the closest option — “Not sure yet” is fine.')
    .oneOf(budgetOptions, 'Please choose a budget from the list.'),
  details: Yup.string()
    .trim()
    .max(5000, 'Please keep the project details under 5,000 characters.')
    .test(
      'details-length',
      'Please share a little more detail — at least 10 characters.',
      (value) => !value || value.length >= 10,
    ),
  contactMethod: Yup.string()
    .required('Please choose how you would like us to reply.')
    .oneOf(contactMethodOptions, 'Please choose a contact method.'),
  website: Yup.string().max(0),
});

export const initialContactValues = {
  fullName: '',
  email: '',
  phone: '',
  company: '',
  service: '',
  budget: '',
  details: '',
  contactMethod: 'WhatsApp',
  website: '',
};
