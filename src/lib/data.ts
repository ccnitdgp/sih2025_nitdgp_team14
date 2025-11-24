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
    name: 'COVID-19 Booster Dose Drive',
    location: 'Community Hall, Near Labour Chowk',
    date: 'August 20, 2024',
    time: '9:00 AM - 5:00 PM',
    details: 'Free COVID-19 booster shots (Covishield & Covaxin) available for all eligible individuals. Please bring your previous vaccination certificate and Aadhar card for registration.'
  },
  {
    id: 2,
    name: 'Children\'s Immunization Camp (Polio & MMR)',
    location: 'Anganwadi Center, Near Site 5',
    date: 'August 25, 2024',
    time: '10:00 AM - 4:00 PM',
    details: 'Free Polio and MMR vaccines for children under 5. Please bring the child\'s birth certificate and immunization card.'
  },
  {
    id: 3,
    name: 'Tetanus & Diphtheria (Td) Vaccination for Adults',
    location: 'Sector 18 Community Center',
    date: 'September 5, 2024',
    time: '11:00 AM - 3:00 PM',
    details: 'Td vaccine for adults. Recommended for everyone, especially those with recent injuries. No prior registration required.'
  },
  {
    id: 4,
    name: 'Hepatitis B Vaccination Drive',
    location: 'Govt. Primary School, Phase 3',
    date: 'September 12, 2024',
    time: '9:00 AM - 4:00 PM',
    details: 'First and second doses of Hepatitis B vaccine available. Open for all age groups.'
  }
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
