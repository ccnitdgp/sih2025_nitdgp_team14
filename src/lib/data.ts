
import {
  Syringe,
  Stethoscope,
  HeartPulse,
  type LucideIcon,
  TriangleAlert,
  ShieldCheck,
  Info,
  CheckCircle,
} from 'lucide-react';

type Stat = {
  id: number;
  name: string;
  value: string;
  icon: LucideIcon;
};

export const stats: Stat[] = [];

export const vaccinationDrives = [];

export const visitingCamps = [];

export const testimonials = [];

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

export const medicalNotifications: MedicalNotification[] = [];


export type Bill = {
  id: number;
  title: string;
  category: 'Radiology' | 'Pharmacy' | 'Consultation';
  date: string;
  amount: number;
  status: 'Due' | 'Paid';
};

export const billingHistory: Bill[] = [];

export const personalNotifications = [];

export const upcomingAppointments = [];

export const pastAppointments = [];

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


export const doctorUpcomingAppointments: DoctorAppointment[] = [];

export const doctorPastAppointments: DoctorAppointment[] = [];

export const weeklyActivity = [];

export const recentUploads = [];

// This will act as our makeshift database for appointments
export let appointments: any[] = [];
