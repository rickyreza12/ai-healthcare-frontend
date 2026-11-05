# BUNDA Healthcare frontend

React, TypeScript and Vite. The existing BUNDA dashboard and other patient tabs remain available. The Patient AI Summary (`/dashboard/patients/:patientId?tab=ai-summary`), Healthcare Assistant (`/dashboard/healthcare-assistant`), and nurse-only patient registration use the local BUNDA FastAPI API on the same hostname as Vite.

```powershell
cd E:\Volare\HealthCare\apps\repo\frontend
npm install
npm run dev
npm run check
npm run build
```

Use `http://localhost:5173` with the backend at `http://localhost:8000`; keep both hosts identical so the session cookie is sent. Configure `VITE_API_URL` only for browser-safe API origins, never secrets. Authenticate with an approved local BUNDA test account. Nurses can register patients in Patient Directory; doctors have no creation control, and backend role checks remain authoritative. Registration requires an active attending doctor and stores records through the backend. The summary page accepts an exact CAS synthetic patient ID and offers explicit ingestion when no versioned summary exists.

The feature is organized into `src/features/clinicalAi/domain`, `application`, `infrastructure`, and `presentation`, with presentation split into the `patient-summary` and `assistant` screens. All clinical requests go through the shared `src/api.ts` transport with HttpOnly session cookie credentials and support for cancellation. Source citations are checked against returned evidence; dialogs support keyboard dismissal and focus restoration; user input and patient context remain local to the mounted page. No browser calls to CAS Dummy or bearer tokens are allowed.

Phase one uses deterministic source-backed responses. General Assistant supports curated example questions, Patient Assistant requires a verified ingested patient context, and unsupported prompts display a bounded unavailable result. Future LLM, Qdrant, and hybrid retrieval support is not part of this runtime.

For browser acceptance, start the CAS, FastAPI and Vite services, then run `node scripts/clinical-browser-smoke.mjs` against the preconfigured local QA Chrome DevTools session. It checks login, ingestion, source citations, summary review/refresh, assistant modes, unsupported results and responsive widths. Captured screenshots are saved under `../../workspaces/result`.
