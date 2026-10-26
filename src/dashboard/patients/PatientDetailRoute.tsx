import { useSearchParams } from 'react-router-dom'
import { PatientAiReferenceDialog } from './PatientAiReferenceDialog.tsx'
import { PatientDetailPage } from './PatientDetailPage.tsx'

export function PatientDetailRoute() {
  const [params] = useSearchParams()
  const showsAiSummary = params.get('tab') === 'ai-summary'

  return (
    <>
      <PatientDetailPage />
      {showsAiSummary && <PatientAiReferenceDialog section={params.get('section')} />}
    </>
  )
}
