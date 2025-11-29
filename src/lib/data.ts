
import {
  Syringe,
  Stethoscope,
  HeartPulse,
  type LucideIcon,
  TriangleAlert,
  ShieldCheck,
  Info,
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
    value: '0+',
    icon: Syringe,
  },
  {
    id: 2,
    name: 'stat_health_camps',
    value: '0+',
    icon: Stethoscope,
  },
  {
    id: 3,
    name: 'stat_records_secured',
    value: '0+',
    icon: HeartPulse,
  },
];

export const vaccinationDrives = [
    {
        "id": 1,
        "name": "COVID-19 Booster Dose Drive",
        "location": "Community Hall, Near Labour Chowk",
        "date": "25th August 2024",
        "name_key": "vaccination_drive_1_name",
        "location_key": "vaccination_drive_1_location",
        "details_key": "vaccination_drive_1_details",
        "details": "Free COVID-19 booster shots (Covishield & Covaxin) available for all eligible individuals. Please bring your previous vaccination certificate and Aadhar card for registration."
    },
    {
        "id": 2,
        "name": "Children's Immunization Camp (Polio & MMR)",
        "location": "Anganwadi Center, Near Site 5",
        "date": "28th August 2024",
        "name_key": "vaccination_drive_2_name",
        "location_key": "vaccination_drive_2_location",
        "details_key": "vaccination_drive_2_details",
        "details": "Free Polio and MMR vaccines for children under 5. Please bring the child's birth certificate and immunization card."
    },
    {
        "id": 3,
        "name": "Tetanus & Diphtheria (Td) Vaccination for Adults",
        "location": "Sector 18 Community Center",
        "date": "1st September 2024",
        "name_key": "vaccination_drive_3_name",
        "location_key": "vaccination_drive_3_location",
        "details_key": "vaccination_drive_3_details",
        "details": "Td vaccine for adults. Recommended for everyone, especially those with recent injuries. No prior registration required."
    },
    {
        "id": 4,
        "name": "Hepatitis B Vaccination Drive",
        "location": "Govt. Primary School, Phase 3",
        "date": "5th September 2024",
        "name_key": "vaccination_drive_4_name",
        "location_key": "vaccination_drive_4_location",
        "details_key": "vaccination_drive_4_details",
        "details": "First and second doses of Hepatitis B vaccine available. Open for all age groups."
    }
];

export const visitingCamps = [
    {
        "id": 1,
        "name": "General Health Check-up Camp",
        "location": "Community Hall, Near Labour Chowk",
        "date": "30th August 2024",
        "name_key": "health_camp_1_name",
        "location_key": "health_camp_1_location",
        "details_key": "health_camp_1_details",
        "details": "Free general health check-ups, including blood pressure monitoring, blood sugar tests, and a consultation with a general physician. Basic medicines will be provided free of cost."
    },
    {
        "id": 2,
        "name": "Eye Care & Vision Screening",
        "location": "Sector 18 Community Center",
        "date": "4th September 2024",
        "name_key": "health_camp_2_name",
        "location_key": "health_camp_2_location",
        "details_key": "health_camp_2_details",
        "details": "Comprehensive eye examinations, vision tests, and distribution of free eyeglasses for those in need. Minor eye ailments will also be treated."
    },
    {
        "id": 3,
        "name": "Dental Health Camp",
        "location": "Govt. Primary School, Phase 3",
        "date": "8th September 2024",
        "name_key": "health_camp_3_name",
        "location_key": "health_camp_3_location",
        "details_key": "health_camp_3_details",
        "details": "Free dental check-ups, cleaning, and basic treatments. Consultations on oral hygiene will also be available."
    },
    {
        "id": 4,
        "name": "Women's Health & Awareness Camp",
        "location": "Anganwadi Center, Near Site 5",
        "date": "12th September 2024",
        "name_key": "health_camp_4_name",
        "location_key": "health_camp_4_location",
        "details_key": "health_camp_4_details",
        "details": "Specialized health check-ups for women, including screenings and consultations. Awareness sessions on various health issues."
    }
];

export const testimonials = [
  {
    id: 1,
    name: "Priya Sharma",
    title: "Working Mother",
    quote: "Swasthya has been a lifesaver. I can manage my kids' vaccination schedules and my parents' appointments all in one place. The AI health assistant is surprisingly helpful for quick questions!",
    avatarId: "testimonial-1",
  },
  {
    id: 2,
    name: "Amit Singh",
    title: "Construction Worker",
    quote: "Finding the free health camps through this app has helped me and my co-workers get regular check-ups without worrying about the cost. It's a very valuable service for our community.",
    avatarId: "testimonial-2",
  },
  {
    id: 3,
    name: "Ananya Gupta",
    title: "College Student",
    quote: "I used the AI feature to analyze my grandmother's prescription, and it broke down all the medical terms into simple language. It made understanding her treatment so much easier. Highly recommend!",
    avatarId: "testimonial-3",
  },
];


export const medicalHistory = [];

export const prescriptions = [];

export const labReports = [];

export const vaccinationRecords = [];


export type MedicalNotification = {
  id: number;
  title: string;
  title_key: string;
  category: 'WEATHER ADVISORY' | 'DISEASE PREVENTION' | 'PUBLIC HEALTH' | 'VACCINATION';
  date: string;
  details: string;
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
        title: "Heatwave Alert & Precautionary Measures",
        title_key: "announcement_1_title",
        category: 'WEATHER ADVISORY',
        date: '20th August 2024',
        details: "High temperatures are expected over the next few days. Stay hydrated, avoid direct sun exposure between 11 AM and 4 PM, and wear light clothing. Ensure the elderly and children are well-protected. Seek medical help if you experience dizziness or nausea.",
        details_key: "announcement_1_details",
        Icon: TriangleAlert,
        color: "text-yellow-600",
        bgColor: "bg-yellow-100",
        borderColor: "border-yellow-500",
        i18n_category_key: "weather_advisory"
    },
    {
        id: 2,
        title: "Dengue & Malaria Prevention Advisory",
        title_key: "announcement_2_title",
        category: 'DISEASE PREVENTION',
        date: '18th August 2024',
        details: "With the monsoon season, it's crucial to prevent mosquito breeding. Do not let water stagnate in coolers, pots, or tires. Use mosquito repellents and nets. See a doctor immediately if you develop a high fever with body aches.",
        details_key: "announcement_2_details",
        Icon: ShieldCheck,
        color: "text-blue-600",
        bgColor: "bg-blue-100",
        borderColor: "border-blue-500",
        i18n_category_key: "disease_prevention"
    },
    {
        id: 3,
        title: "Public Health Notice: Contaminated Water Supply",
        title_key: "announcement_3_title",
        category: 'PUBLIC HEALTH',
        date: '15th August 2024',
        details: "A recent report indicates potential contamination of the water supply in Sector 15. Residents are advised to boil water before drinking or use a reliable water purifier. The local authorities are working to resolve the issue.",
        details_key: "announcement_3_details",
        Icon: Info,
        color: "text-red-600",
        bgColor: "bg-red-100",
        borderColor: "border-red-500",
        i18n_category_key: "public_health"
    },
    {
        id: 4,
        title: "Flu Vaccination Campaign",
        title_key: "announcement_4_title",
        category: 'VACCINATION',
        date: '12th August 2024',
        details: "A free flu vaccination drive is being organized next week. Getting vaccinated is the best way to protect yourself and others from the flu. Details about locations and times will be announced shortly.",
        details_key: "announcement_4_details",
        Icon: Syringe,
        color: "text-green-600",
        bgColor: "bg-green-100",
        borderColor: "border-green-500",
        i18n_category_key: "vaccination"
    }
];


export type Bill = {
  id: number;
  title: string;
  category: 'Radiology' | 'Pharmacy' | 'Consultation';
  date: string;
  amount: number;
  status: 'Due' | 'Paid';
};

export const billingHistory: Bill[] = [];

export const personalNotifications = [
    {
        id: 1,
        message: 'Your appointment with Dr. Sharma is confirmed for tomorrow at 10:00 AM.',
        time: 'Yesterday',
        type: 'appointmentReminders'
    },
    {
        id: 2,
        message: 'Reminder: Take your Metformin tablet.',
        time: '2 hours ago',
        type: 'prescriptionReminders'
    },
    {
        id: 3,
        message: 'Your child\'s Polio vaccination is due next week.',
        time: '3 days ago',
        type: 'vaccinationReminders'
    },
    {
        id: 4,
        message: 'A new health tip is available: "5 ways to stay hydrated".',
        time: '5 days ago',
        type: 'healthTips'
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


export const recentUploads = [];
