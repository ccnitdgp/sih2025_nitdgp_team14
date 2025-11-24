import {
  Syringe,
  Stethoscope,
  HeartPulse,
  type LucideIcon,
} from 'lucide-react';

type Stat = {
  id: number;
  name: string;
  value: string;
  icon: LucideIcon;
};

export const stats: Stat[] = [
  {
    id: 1,
    name: 'Vaccination Drives',
    value: '1,200+',
    icon: Syringe,
  },
  {
    id: 2,
    name: 'Health Camps',
    value: '500+',
    icon: Stethoscope,
  },
  {
    id: 3,
    name: 'Records Secured',
    value: '1M+',
    icon: HeartPulse,
  },
];

export const vaccinationDrives = [
  {
    id: 1,
    name: 'Polio Vaccine',
    location: 'City Health Center',
    date: '25th July, 2024',
    time: '9:00 AM - 5:00 PM',
  },
  {
    id: 2,
    name: 'COVID-19 Booster',
    location: 'Community Hall',
    date: '28th July, 2024',
    time: '10:00 AM - 4:00 PM',
  },
  {
    id: 3,
    name: 'MMR Vaccine',
    location: 'Green Valley Hospital',
    date: '1st August, 2024',
    time: '11:00 AM - 3:00 PM',
  },
];

export const visitingCamps = [
  {
    id: 1,
    name: 'General Health Check-up',
    location: 'Sunshine Park',
    date: '30th July, 2024',
    time: '8:00 AM - 2:00 PM',
  },
  {
    id: 2,
    name: 'Dental Care Camp',
    location: 'Riverside School',
    date: '5th August, 2024',
    time: '9:00 AM - 1:00 PM',
  },
  {
    id: 3,
    name: 'Eye Check-up Camp',
    location: 'Central Library',
    date: '10th August, 2024',
    time: '10:00 AM - 5:00 PM',
  },
];

export const testimonials = [
  {
    id: 1,
    quote: 'Swasthya made it incredibly easy to find a vaccination center near me. The process was seamless and quick!',
    name: 'Priya Sharma',
    title: 'Working Professional',
    avatarId: 'testimonial-1',
  },
  {
    id: 2,
    quote: 'The health camp information is always up-to-date. It helped my family get regular check-ups without any hassle.',
    name: 'Amit Singh',
    title: 'Retired Teacher',
    avatarId: 'testimonial-2',
  },
  {
    id: 3,
    quote: 'Having all my medical records in one place is a game-changer. I can access them anytime, anywhere.',
    name: 'Ananya Gupta',
    title: 'Student',
    avatarId: 'testimonial-3',
  },
];

export const healthRecords = [
    {
        id: 'REC001',
        recordType: 'Vaccination Certificate',
        date: '2023-05-15',
        details: 'COVID-19 Booster (Pfizer)',
        issuer: 'City Health Center',
    },
    {
        id: 'REC002',
        recordType: 'Blood Test Report',
        date: '2024-01-20',
        details: 'Complete Blood Count (CBC)',
        issuer: 'Green Valley Hospital',
    },
    {
        id: 'REC003',
        recordType: 'Doctor\'s Prescription',
        date: '2024-06-10',
        details: 'Prescription for seasonal allergies',
        issuer: 'Dr. Rahul Verma',
    },
    {
        id: 'REC004',
        recordType: 'Dental Check-up',
        date: '2024-02-18',
        details: 'Routine cleaning and check-up',
        issuer: 'Riverside Dental Clinic',
    }
];
