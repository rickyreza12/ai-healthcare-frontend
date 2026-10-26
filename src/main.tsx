import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './index.css'
import './dashboard.css'
import { AuthProvider, RedirectHome, RequireAuth } from './auth.tsx'
import Login from './Login.tsx'
import { DashboardShell } from './dashboard/DashboardShell.tsx'
import { DashboardOverview } from './dashboard/DashboardOverview.tsx'
import { PatientDirectoryPage } from './dashboard/patients/PatientDirectoryPage.tsx'
import { AppointmentSchedulingPage } from './dashboard/appointments/AppointmentSchedulingPage.tsx'
import { MedicalRecordsPage } from './dashboard/medicalRecords/MedicalRecordsPage.tsx'
import { MaternityOverviewPage } from './dashboard/maternity/MaternityOverviewPage.tsx'
import { PediatricOverviewPage } from './dashboard/pediatric/PediatricOverviewPage.tsx'
import { PharmacyPage } from './dashboard/pharmacy/PharmacyPage.tsx'
import { LaboratoryPage } from './dashboard/laboratory/LaboratoryPage.tsx'
import { HealthcareAssistantLivePage } from './features/clinicalAi/presentation/assistant/HealthcareAssistantLivePage.tsx'
import { ClinicalInboxPage } from './dashboard/notifications/ClinicalInboxPage.tsx'
import { AnalyticsReportsPage } from './dashboard/analytics/AnalyticsReportsPage.tsx'
import { ProfileSettingsPage } from './dashboard/profile/ProfileSettingsPage.tsx'
import { DataInputOverviewPage } from './dashboard/dataInput/DataInputOverviewPage.tsx'
import { DataInputResourcePage } from './dashboard/dataInput/DataInputResourcePage.tsx'
import { DataInputRecordPage } from './dashboard/dataInput/DataInputRecordPage.tsx'
import { AppointmentDetailPage } from './dashboard/DashboardDetailPages.tsx'
import { PatientDetailRoute } from './dashboard/patients/PatientDetailRoute.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<RedirectHome />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <DashboardShell />
              </RequireAuth>
            }
          >
            <Route index element={<DashboardOverview />} />
            <Route path="patients" element={<PatientDirectoryPage />} />
            <Route path="patients/:patientId" element={<PatientDetailRoute />} />
            <Route path="appointments" element={<AppointmentSchedulingPage />} />
            <Route path="appointments/:appointmentKey" element={<AppointmentDetailPage />} />
            <Route path="medical-records" element={<MedicalRecordsPage />} />
            <Route path="maternity" element={<MaternityOverviewPage />} />
            <Route path="pediatric" element={<PediatricOverviewPage />} />
            <Route path="pharmacy" element={<PharmacyPage />} />
            <Route path="laboratory" element={<LaboratoryPage />} />
            <Route path="healthcare-assistant" element={<HealthcareAssistantLivePage />} />
            <Route path="notifications" element={<ClinicalInboxPage />} />
            <Route path="analytics" element={<AnalyticsReportsPage />} />
            <Route path="data-input" element={<DataInputOverviewPage />} />
            <Route path="data-input/:resourceKey" element={<DataInputResourcePage />} />
            <Route path="data-input/:resourceKey/:recordId" element={<DataInputRecordPage />} />
            <Route path="profile" element={<ProfileSettingsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
