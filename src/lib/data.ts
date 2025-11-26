
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
  UserPlus
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
    name: 'stat_vaccination_drives',
    value: '1,200+',
    icon: Syringe,
  },
  {
    id: 2,
    name: 'stat_health_camps',
    value: '500+',
    icon: Stethoscope,
  },
  {
    id: 3,
    name: 'stat_records_secured',
    value: '1M+',
    icon: HeartPulse,
  },
];

export const vaccinationDrives = [
  {
    id: 1,
    name_key: 'vaccination_drive_1_name',
    location_key: 'vaccination_drive_1_location',
    date: 'August 20, 2024',
    time: '9:00 AM - 5:00 PM',
    details_key: 'vaccination_drive_1_details'
  },
  {
    id: 2,
    name_key: 'vaccination_drive_2_name',
    location_key: 'vaccination_drive_2_location',
    date: 'August 25, 2024',
    time: '10:00 AM - 4:00 PM',
    details_key: 'vaccination_drive_2_details'
  },
  {
    id: 3,
    name_key: 'vaccination_drive_3_name',
    location_key: 'vaccination_drive_3_location',
    date: 'September 5, 2024',
    time: '11:00 AM - 3:00 PM',
    details_key: 'vaccination_drive_3_details'
  },
  {
    id: 4,
    name_key: 'vaccination_drive_4_name',
    location_key: 'vaccination_drive_4_location',
    date: 'September 12, 2024',
    time: '9:00 AM - 4:00 PM',
    details_key: 'vaccination_drive_4_details'
  }
];

export const visitingCamps = [
  {
    id: 1,
    name_key: 'health_camp_1_name',
    location_key: 'health_camp_1_location',
    date: 'August 15, 2024',
    time: '8:00 AM - 2:00 PM',
    details_key: 'health_camp_1_details'
  },
  {
    id: 2,
    name_key: 'health_camp_2_name',
    location_key: 'health_camp_2_location',
    date: 'August 22, 2024',
    time: '9:00 AM - 1:00 PM',
    details_key: 'health_camp_2_details'
  },
  {
    id: 3,
    name_key: 'health_camp_3_name',
    location_key: 'health_camp_3_location',
    date: 'September 1, 2024',
    time: '10:00 AM - 5:00 PM',
    details_key: 'health_camp_3_details'
  },
  {
    id: 4,
    name_key: 'health_camp_4_name',
    location_key: 'health_camp_4_location',
    date: 'September 10, 2024',
    time: '10:00 AM - 4:00 PM',
    details_key: 'health_camp_4_details'
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
  title_key: string;
  category: 'WEATHER ADVISORY' | 'DISEASE PREVENTION' | 'PUBLIC HEALTH' | 'VACCINATION';
  date: string;
  details_key: string;
  Icon: LucideIcon;
  color: string;
  bgColor: string;
  borderColor: string;
  i18n_category_key: string;
};

export const medicalNotifications: MedicalNotification[] = [
  {
    id: 1,
    title_key: 'announcement_1_title',
    category: 'WEATHER ADVISORY',
    i18n_category_key: 'weather_advisory',
    date: 'August 10, 2024',
    details_key: 'announcement_1_details',
    Icon: TriangleAlert,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-500',
  },
  {
    id: 2,
    title_key: 'announcement_2_title',
    category: 'DISEASE PREVENTION',
    i18n_category_key: 'disease_prevention',
    date: 'August 5, 2024',
    details_key: 'announcement_2_details',
    Icon: ShieldCheck,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-500',
  },
  {
    id: 3,
    title_key: 'announcement_3_title',
    category: 'PUBLIC HEALTH',
    i18n_category_key: 'public_health',
    date: 'August 1, 2024',
    details_key: 'announcement_3_details',
    Icon: Info,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-500',
  },
  {
    id: 4,
    title_key: 'announcement_4_title',
    category: 'VACCINATION',
    i18n_category_key: 'vaccination',
    date: 'July 28, 2024',
    details_key: 'announcement_4_details',
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

export const personalNotifications = [
    {
        id: 1,
        message: "Your appointment with Sachin Nikam on Oct 2 is confirmed.",
        time: "about 14 hours ago"
    },
    {
        id: 2,
        message: "Your appointment with Sachin Nikam on Oct 3 is confirmed.",
        time: "about 16 hours ago"
    },
    {
        id: 3,
        message: "Your appointment with Sachin Nikam on Oct 2 is confirmed.",
        time: "about 16 hours ago"
    }
];

export const upcomingAppointments = [
    {
        id: 1,
        doctorName: 'Dr. Anjali Sharma',
        specialty: 'Cardiologist',
        date: 'October 15, 2024',
        time: '11:00 AM',
        location: 'Apollo Hospital, Delhi',
        avatar: 'https://picsum.photos/seed/doc1/200'
    },
    {
        id: 2,
        doctorName: 'Dr. Vikram Singh',
        specialty: 'Dermatologist',
        date: 'October 18, 2024',
        time: '02:30 PM',
        location: 'Max Healthcare, Gurgaon',
        avatar: 'https://picsum.photos/seed/doc2/200'
    }
];

export const pastAppointments = [
    {
        id: 1,
        doctorName: 'Dr. Priya Gupta',
        specialty: 'General Physician',
        date: 'July 20, 2024',
        time: '09:00 AM',
        location: 'Fortis Hospital, Noida',
        avatar: 'https://picsum.photos/seed/doc3/200'
    },
     {
        id: 2,
        doctorName: 'Dr. Anjali Sharma',
        specialty: 'Cardiologist',
        date: 'May 10, 2024',
        time: '01:00 PM',
        location: 'Apollo Hospital, Delhi',
        avatar: 'https://picsum.photos/seed/doc1/200'
    }
];

export type DoctorAppointment = {
    id: number;
    patientName: string;
    patientAvatar: string;
    patientId: string;
    patientAge: number;
    date: string;
    time: string;
    reason: string;
    type: 'In-Person' | 'Virtual';
    status: 'Scheduled' | 'Completed' | 'Canceled';
};


export const doctorUpcomingAppointments: DoctorAppointment[] = [
    {
        id: 1,
        patientName: 'Aditi Jaiswal',
        patientAvatar: 'https://picsum.photos/seed/patient1/200',
        patientId: 'PT62220551',
        patientAge: 21,
        date: 'September 30, 2025',
        time: '4:00 PM',
        reason: 'fever cold',
        type: 'In-Person',
        status: 'Scheduled',
    },
    {
        id: 2,
        patientName: 'Rohan Verma',
        patientAvatar: 'https://picsum.photos/seed/patient2/200',
        patientId: 'PT87345902',
        patientAge: 35,
        date: 'September 30, 2025',
        time: '4:00 PM',
        reason: 'Follow-up Consultation',
        type: 'In-Person',
        status: 'Scheduled',
    },
     {
        id: 3,
        patientName: 'Sunita Devi',
        patientAvatar: 'https://picsum.photos/seed/patient3/200',
        patientId: 'PT12348765',
        patientAge: 48,
        date: 'October 2, 2025',
        time: '3:30 PM',
        reason: 'New Patient Check-up',
        type: 'In-Person',
        status: 'Scheduled',
    }
];

export const doctorPastAppointments: DoctorAppointment[] = [
    {
        id: 4,
        patientName: 'Geeta Sharma',
        patientAvatar: 'https://picsum.photos/seed/patient4/200',
        patientId: 'PT98765432',
        patientAge: 29,
        date: 'September 10, 2025',
        time: '9:00 AM',
        reason: 'Fever and Cold',
        type: 'Virtual',
        status: 'Completed',
    },
];

export const weeklyActivity = [
  { day: "Sunday", appointments: 0 },
  { day: "Monday", appointments: 4 },
  { day: "Tuesday", appointments: 3 },
  { day: "Wednesday", appointments: 2 },
  { day: "Thursday", appointments: 1 },
  { day: "Friday", appointments: 3 },
  { day: "Saturday", appointments: 0 },
]

export const recentUploads = [
  {
    id: 1,
    fileName: 'sef.pdf',
    patientName: 'Aditi Jaiswal',
    type: 'Scan',
    date: 'Sep 25, 2025'
  },
    {
    id: 2,
    fileName: 'blood_report.pdf',
    patientName: 'Rohan Verma',
    type: 'Lab Report',
    date: 'Sep 23, 2025'
  },
   {
    id: 3,
    fileName: 'vaccine_cert.pdf',
    patientName: 'Sunita Devi',
    type: 'Vaccination',
    date: 'Sep 22, 2025'
  },
]
