
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
    value: '12+',
    icon: Syringe,
  },
  {
    id: 2,
    name: 'stat_health_camps',
    value: '25+',
    icon: Stethoscope,
  },
  {
    id: 3,
    name: 'stat_records_secured',
    value: '10K+',
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
    name: 'Priya Sharma',
    title: 'Working Professional',
    quote:
      'The AI symptom checker suggested I see a specialist, and it was the right call. The appointment booking was seamless. Swasthya has made managing my health so much simpler.',
    avatarId: 'testimonial-1',
  },
  {
    id: 2,
    name: 'Amit Singh',
    title: 'Retired Teacher',
    quote:
      'Finding local health camps through this app has been a blessing for my wife and me. We get regular check-ups without any hassle. A must-have for every family.',
    avatarId: 'testimonial-2',
  },
  {
    id: 3,
    name: 'Ananya Gupta',
    title: 'New Mother',
    quote:
      "Managing my child's vaccination schedule was always a challenge. Swasthya's reminders and clear record-keeping have made it incredibly easy to stay on top of everything.",
    avatarId: 'testimonial-3',
  },
];

export const medicalHistory = [
  { id: 1, recordType: 'medicalHistory', details: 'Diagnosed with Type 2 Diabetes in 2022.' },
  { id: 2, recordType: 'medicalHistory', details: 'Patient has a known allergy to Penicillin.' },
  { id: 3, recordType: 'medicalHistory', details: 'History of seasonal allergies.' },
];

export const prescriptions = [
  { id: 1, recordType: 'prescription', details: { medication: 'Metformin', dosage: '500mg, twice a day', doctor: 'Dr. Ramesh Gupta', date: '2023-01-15', status: 'Active' }},
  { id: 2, recordType: 'prescription', details: { medication: 'Amoxicillin', dosage: '250mg, thrice a day', doctor: 'Dr. Sunita Patel', date: '2023-06-20', status: 'Finished' }},
];

export const labReports = [
  { id: 1, recordType: 'labReport', details: { name: 'Complete Blood Count (CBC)', date: '2023-07-01', issuer: 'Pathology Labs' }},
  { id: 2, recordType: 'labReport', details: { name: 'Lipid Profile', date: '2023-07-01', issuer: 'Pathology Labs' }},
];

export const vaccinationRecords = [
    { id: 1, vaccine: 'COVID-19 (Covishield) - Dose 1', date: '2021-05-10', location: 'City Hospital', dose: 1 },
    { id: 2, vaccine: 'COVID-19 (Covishield) - Dose 2', date: '2021-08-10', location: 'City Hospital', dose: 2 },
    { id: 3, vaccine: 'Tetanus Toxoid', date: '2022-03-20', location: 'Local Clinic', dose: 1 },
];


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

export const billingHistory: Bill[] = [
    { id: 1, title: 'Chest X-Ray', category: 'Radiology', date: '2024-08-15', amount: 1200, status: 'Due' },
    { id: 2, title: 'Paracetamol & Cough Syrup', category: 'Pharmacy', date: '2024-08-10', amount: 350, status: 'Paid' },
    { id: 3, title: 'General Consultation', category: 'Consultation', date: '2024-08-10', amount: 800, status: 'Paid' },
    { id: 4, title: 'Blood Test (CBC)', category: 'Radiology', date: '2024-08-05', amount: 750, status: 'Due' },
];

export const personalNotifications = [
    { id: 1, message: "Your appointment with Dr. Sharma is confirmed for tomorrow at 10:00 AM.", time: '1 day ago' },
    { id: 2, message: "Reminder: Time to take your evening medication.", time: '8 hours ago' },
    { id: 3, message: "A new health tip is available: 'Benefits of staying hydrated'.", time: '3 days ago' },
    { id: 4, message: "Your bill for the recent consultation is now due.", time: '5 days ago' },
];

export const appointments = [
    { id: 1, doctorId: 'Y43GFgpcD3QY6xGM3f83hTzYV5i2', patientId: 'p-101', doctorName: 'Dr. Ramesh Gupta', specialty: 'General Physician', location: 'City Hospital', date: '2024-09-10', time: '11:00 AM', avatar: 'https://picsum.photos/seed/doc1/200', type: 'In-Person' },
    { id: 2, doctorId: 'Y43GFgpcD3QY6xGM3f83hTzYV5i2', patientId: 'p-102', doctorName: 'Dr. Sunita Patel', specialty: 'Dermatologist', location: 'SkinCare Clinic', date: '2024-09-12', time: '02:30 PM', avatar: 'https://picsum.photos/seed/doc2/200', type: 'Virtual' },
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
    { id: 1, patientName: 'Amit Kumar', patientAvatar: 'https://picsum.photos/seed/p1/200', patientId: 'p-101', patientAge: 45, date: new Date().toISOString().split('T')[0], time: '10:00 AM', reason: 'Follow-up for blood pressure', type: 'In-Person', status: 'Scheduled' },
    { id: 2, patientName: 'Sunita Devi', patientAvatar: 'https://picsum.photos/seed/p2/200', patientId: 'p-102', patientAge: 34, date: new Date().toISOString().split('T')[0], time: '11:30 AM', reason: 'General weakness and fatigue', type: 'Virtual', status: 'Scheduled' },
    { id: 3, patientName: 'Rajesh Singh', patientAvatar: 'https://picsum.photos/seed/p3/200', patientId: 'p-103', patientAge: 52, date: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0], time: '02:00 PM', reason: 'Annual health check-up', type: 'In-Person', status: 'Scheduled' },
];

export const doctorPastAppointments: DoctorAppointment[] = [
    { id: 4, patientName: 'Geeta Sharma', patientAvatar: 'https://picsum.photos/seed/p4/200', patientId: 'p-104', patientAge: 28, date: '2024-08-18', time: '09:00 AM', reason: 'Fever and sore throat', type: 'Virtual', status: 'Completed' },
];

export const recentUploads = [
    { id: 1, fileName: 'cbc_report_august.pdf', patientName: 'Amit Kumar', type: 'Lab Report', date: '2024-08-20' },
    { id: 2, fileName: 'chest_xray.dcm', patientName: 'Sunita Devi', type: 'Scan', date: '2024-08-19' },
];
