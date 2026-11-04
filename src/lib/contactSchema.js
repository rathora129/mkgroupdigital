import * as Yup from 'yup';
import { serviceOptions } from '@/data/services';
import { budgetOptions } from '@/data/content';

export const contactSchema = Yup.object({
  fullName: Yup.string()
    .trim()
    .min(2, 'Please enter your full name.')
    .max(80, 'Please keep your name under 80 characters.')
    .required('Please enter your full name.'),
  businessEmail: Yup.string()
    .trim()
    .email('Please enter a valid business email address.')
    .max(254, 'Please use an email address under 254 characters.')
    .required('Please enter your business email.'),
  phone: Yup.string()
    .trim()
    .matches(
      /^[+()\d\s.-]{7,20}$/,
      'Please enter a valid phone number, including country code.',
    )
    .required('Please enter a phone number.'),
  company: Yup.string()
    .trim()
    .max(120, 'Please keep the company name under 120 characters.'),
  service: Yup.string()
    .required('Please choose the service you need.')
    .oneOf(serviceOptions, 'Please choose a service from the list.'),
  budget: Yup.string()
    .required('Please choose an indicative budget range.')
    .oneOf(budgetOptions, 'Please choose a budget from the list.'),
  details: Yup.string()
    .trim()
    .min(20, 'Please share a little more detail — at least 20 characters.')
    .max(5000, 'Please keep the project details under 5,000 characters.')
    .required('Please tell us about the project.'),
  website: Yup.string().max(0),
});

export const initialContactValues = {
  fullName: '',
  businessEmail: '',
  phone: '',
  company: '',
  service: '',
  budget: '',
  details: '',
  website: '',
};
