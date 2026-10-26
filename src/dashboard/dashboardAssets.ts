import type { AvatarKey, MetricArtKey, NavIconKey } from './dashboardData.ts'
import type { DirectoryDoctorPortrait, DirectoryPatientPortrait } from './patients/patientDirectoryData.ts'

import navDashboard from '../assets/dashboard/icons/sidebar/dashboard.svg'
import navPatients from '../assets/dashboard/icons/sidebar/patients.svg'
import navAppointments from '../assets/dashboard/icons/sidebar/appointments.svg'
import navMedicalRecords from '../assets/dashboard/icons/sidebar/medical_records.svg'
import navMaternity from '../assets/dashboard/icons/sidebar/maternity.svg'
import navPediatric from '../assets/dashboard/icons/sidebar/pediatric.svg'
import navPharmacy from '../assets/dashboard/icons/sidebar/pharmacy.svg'
import navLaboratory from '../assets/dashboard/icons/sidebar/laboratory.svg'
import navHealthcareAssistant from '../assets/dashboard/icons/sidebar/healthcare_assistant.svg'
import navNotifications from '../assets/dashboard/icons/sidebar/notifications.svg'
import navAnalytics from '../assets/dashboard/icons/sidebar/analytics.svg'
import navProfile from '../assets/dashboard/icons/sidebar/profile.svg'

import metricPatients from '../assets/dashboard/metrics/dashboard_metric_patients.png'
import metricAppointments from '../assets/dashboard/metrics/dashboard_metric_appointments.png'
import metricNewPatients from '../assets/dashboard/metrics/dashboard_metric_new_patients.png'
import metricLab from '../assets/dashboard/metrics/dashboard_metric_lab.png'

import avatarSitiAisyah from '../assets/dashboard/avatars/dashboard_avatar_siti_aisyah.png'
import avatarMuhammadRizki from '../assets/dashboard/avatars/dashboard_avatar_muhammad_rizki.png'
import avatarAnitaDewi from '../assets/dashboard/avatars/dashboard_avatar_anita_dewi.png'
import avatarBudiSantoso from '../assets/dashboard/avatars/dashboard_avatar_budi_santoso.png'
import avatarRinaMelati from '../assets/dashboard/avatars/dashboard_avatar_rina_melati.png'
import avatarDoctor from '../assets/dashboard/avatars/dashboard_doctor_avatar.png'

import directoryPatient1 from '../assets/dashboard/avatars/directory/directory_patient_1.png'
import directoryPatient2 from '../assets/dashboard/avatars/directory/directory_patient_2.png'
import directoryPatient3 from '../assets/dashboard/avatars/directory/directory_patient_3.png'
import directoryPatient4 from '../assets/dashboard/avatars/directory/directory_patient_4.png'
import directoryPatient5 from '../assets/dashboard/avatars/directory/directory_patient_5.png'
import directoryPatient6 from '../assets/dashboard/avatars/directory/directory_patient_6.png'
import directoryPatient7 from '../assets/dashboard/avatars/directory/directory_patient_7.png'
import directoryPatient8 from '../assets/dashboard/avatars/directory/directory_patient_8.png'
import directoryDoctor1 from '../assets/dashboard/avatars/directory/directory_doctor_1.png'
import directoryDoctor2 from '../assets/dashboard/avatars/directory/directory_doctor_2.png'
import directoryDoctor3 from '../assets/dashboard/avatars/directory/directory_doctor_3.png'
import directoryDoctor4 from '../assets/dashboard/avatars/directory/directory_doctor_4.png'
import directoryDoctor5 from '../assets/dashboard/avatars/directory/directory_doctor_5.png'
import directoryDoctor6 from '../assets/dashboard/avatars/directory/directory_doctor_6.png'
import directoryDoctor7 from '../assets/dashboard/avatars/directory/directory_doctor_7.png'
import directoryDoctor8 from '../assets/dashboard/avatars/directory/directory_doctor_8.png'

export const NAV_ICONS: Record<NavIconKey, string> = {
  dashboard: navDashboard,
  patients: navPatients,
  appointments: navAppointments,
  medicalRecords: navMedicalRecords,
  maternity: navMaternity,
  pediatric: navPediatric,
  pharmacy: navPharmacy,
  laboratory: navLaboratory,
  healthcareAssistant: navHealthcareAssistant,
  notifications: navNotifications,
  analytics: navAnalytics,
  // No dedicated data-entry glyph was supplied, so the records icon is reused.
  dataInput: navMedicalRecords,
  profile: navProfile,
}

export const METRIC_ART: Record<MetricArtKey, string> = {
  patients: metricPatients,
  appointments: metricAppointments,
  newPatients: metricNewPatients,
  lab: metricLab,
}

export const AVATARS: Record<AvatarKey, string> = {
  sitiAisyah: avatarSitiAisyah,
  muhammadRizki: avatarMuhammadRizki,
  anitaDewi: avatarAnitaDewi,
  budiSantoso: avatarBudiSantoso,
  rinaMelati: avatarRinaMelati,
  doctor: avatarDoctor,
}

/** Directory-only portraits, one per visible row and per attending clinician. */
export const DIRECTORY_AVATARS: Record<DirectoryPatientPortrait | DirectoryDoctorPortrait, string> = {
  patient1: directoryPatient1,
  patient2: directoryPatient2,
  patient3: directoryPatient3,
  patient4: directoryPatient4,
  patient5: directoryPatient5,
  patient6: directoryPatient6,
  patient7: directoryPatient7,
  patient8: directoryPatient8,
  doctor1: directoryDoctor1,
  doctor2: directoryDoctor2,
  doctor3: directoryDoctor3,
  doctor4: directoryDoctor4,
  doctor5: directoryDoctor5,
  doctor6: directoryDoctor6,
  doctor7: directoryDoctor7,
  doctor8: directoryDoctor8,
}
