import { useSearchParams } from 'react-router-dom'
import { PatientAiSummaryPage } from '../../features/clinicalAi/presentation/patient-summary/PatientAiSummaryPage.tsx'
import { PatientDetailPage } from './PatientDetailPage.tsx'

export function PatientDetailRoute() {
  const [params] = useSearchParams()
  return params.get('tab') === 'ai-summary' ? <PatientAiSummaryPage /> : <PatientDetailPage />
}
