import {
  Syringe,
  Stethoscope,
  HeartPulse,
  type LucideIcon,
  TriangleAlert,
  ShieldCheck,
  Info,
  CheckCircle,
  Activity,
  Pill,
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
    name: 'General Health Check-up Camp',
    location: 'Community Hall, Near Labour Chowk',
    date: 'August 15, 2024',
    time: '8:00 AM - 2:00 PM',
    details: 'Free general health check-ups, including blood pressure monitoring, blood sugar tests, and a consultation with a general physician. Basic medicines will be provided free of cost.'
  },
  {
    id: 2,
    name: 'Eye Care & Vision Screening',
    location: 'Sector 18 Community Center',
    date: 'August 22, 2024',
    time: '9:00 AM - 1:00 PM',
    details: 'Comprehensive eye examinations, vision tests, and distribution of free eyeglasses for those in need. Minor eye ailments will also be treated.'
  },
  {
    id: 3,
    name: 'Dental Health Camp',
    location: 'Govt. Primary School, Phase 3',
    date: 'September 1, 2024',
    time: '10:00 AM - 5:00 PM',
    details: 'Free dental check-ups, cleaning, and basic treatments. Consultations on oral hygiene will also be available.'
  },
  {
    id: 4,
    name: 'Women\'s Health & Awareness Camp',
    location: 'Anganwadi Center, Near Site 5',
    date: 'September 10, 2024',
    time: '10:00 AM - 4:00 PM',
    details: 'Specialized health check-ups for women, including screenings and consultations. Awareness sessions on various health issues.'
  }
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

export const medicalHistory = [
  "Irregular periods",
  "Fracture in left hand",
  "Appendix",
];


export const prescriptions = [
  {
    id: 1,
    medication: 'Metformin',
    dosage: '500mg, twice a day',
    doctor: 'Dr. Anjali Sharma',
    date: '2024-07-15',
    status: 'Active',
  },
  {
    id: 2,
    medication: 'Amlodipine',
    dosage: '5mg, once a day',
    doctor: 'Dr. Anjali Sharma',
    date: '2024-07-15',
    status: 'Active',
  },
  {
    id: 3,
    medication: 'Amoxicillin',
    dosage: '250mg, three times a day for 7 days',
    doctor: 'Dr. Vikram Singh',
    date: '2024-06-01',
    status: 'Finished',
  },
];

export const labReports = [
  {
    id: 1,
    name: 'Complete Blood Count (CBC)',
    date: '2024-07-10',
    issuer: 'Apollo Diagnostics',
  },
  {
    id: 2,
    name: 'Lipid Profile',
    date: '2024-07-10',
    issuer: 'Apollo Diagnostics',
  },
  {
    id: 3,
    name: 'Thyroid Function Test',
    date: '2024-05-20',
    issuer: 'Max Labs',
  },
];

export const vaccinationRecords = [
    {
        id: 1,
        vaccine: 'COVID-19 (Covishield)',
        dose: 1,
        date: '2021-04-12',
        location: 'City General Hospital'
    },
    {
        id: 2,
        vaccine: 'COVID-19 (Covishield)',
        dose: 2,
        date: '2021-07-05',
        location: 'City General Hospital'
    },
    {
        id: 3,
        vaccine: 'Tetanus (TT)',
        dose: 1,
        date: '2023-11-20',
        location: 'Community Health Center'
    }
];


export type MedicalNotification = {
  id: number;
  title: string;
  category: 'WEATHER ADVISORY' | 'DISEASE PREVENTION' | 'PUBLIC HEALTH' | 'VACCINATION';
  date: string;
  details: string;
  Icon: LucideIcon;
  color: string;
  bgColor: string;
  borderColor: string;
};

export const medicalNotifications: MedicalNotification[] = [
  {
    id: 1,
    title: 'Heatwave Alert & Precautionary Measures',
    category: 'WEATHER ADVISORY',
    date: 'August 10, 2024',
    details: 'High temperatures are expected over the next few days. Stay hydrated, avoid direct sun exposure between 11 AM and 4 PM, and wear light clothing. Ensure the elderly and children are well-protected. Seek medical help if you experience dizziness or nausea.',
    Icon: TriangleAlert,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-500',
  },
  {
    id: 2,
    title: 'Dengue & Malaria Prevention Advisory',
    category: 'DISEASE PREVENTION',
    date: 'August 5, 2024',
    details: 'With the monsoon season, it\'s crucial to prevent mosquito breeding. Do not let water stagnate in coolers, pots, or tires. Use mosquito repellents and nets. See a doctor immediately if you develop a high fever with body aches.',
    Icon: ShieldCheck,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-500',
  },
  {
    id: 3,
    title: 'Public Health Notice: Contaminated Water Supply',
    category: 'PUBLIC HEALTH',
    date: 'August 1, 2024',
    details: 'A recent report indicates potential contamination of the water supply in Sector 15. Residents are advised to boil water before drinking or use a reliable water purifier. The local authorities are working to resolve the issue.',
    Icon: Info,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-500',
  },
  {
    id: 4,
    title: 'Flu Vaccination Campaign',
    category: 'VACCINATION',
    date: 'July 28, 2024',
    details: 'A free flu vaccination drive is being organized next week. Getting vaccinated is the best way to protect yourself and others from the flu. Details about locations and times will be announced shortly.',
    Icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-500',
  },
];


export type Bill = {
  id: number;
  title: string;
  category: 'Radiology' | 'Pharmacy' | 'Consultation';
  date: string;
  amount: number;
  status: 'Due' | 'Paid';
};

export const billingHistory: Bill[] = [
  {
    id: 1,
    title: 'Bone Fracture X-Ray',
    category: 'Radiology',
    date: 'September 25, 2025',
    amount: 1500,
    status: 'Due',
  },
  {
    id: 2,
    title: 'Painkillers & Bandages',
    category: 'Pharmacy',
    date: 'September 25, 2025',
    amount: 3000,
    status: 'Due',
  },
  {
    id: 3,
    title: 'Orthopedic Consultation',
    category: 'Consultation',
    date: 'September 25, 2025',
    amount: 500,
    status: 'Due',
  },
   {
    id: 4,
    title: 'Annual Check-up',
    category: 'Consultation',
    date: 'August 15, 2025',
    amount: 1000,
    status: 'Paid',
  },
];
