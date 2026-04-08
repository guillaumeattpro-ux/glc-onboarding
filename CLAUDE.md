# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Dev server with HMR
npm run build        # Production build to dist/
npm run lint         # ESLint (flat config)
npm run preview      # Serve built dist locally
npm run preview:public  # Preview on network (0.0.0.0:4173)
npm run tunnel       # Expose via localtunnel (requires preview running)
```

No test framework is configured.

## Architecture

This is a **React 19 + Vite + Tailwind CSS** single-page app for client onboarding. It is deployed on Vercel.

### Onboarding Flow (App.jsx)

`App.jsx` is a step-based state machine — no routing library. It controls a linear flow:

| Step | Component | Purpose |
|------|-----------|---------|
| 0 | `Step1Welcome` | Video intro, start onboarding |
| 1 | `Step2Contract` | Canvas-based signature capture |
| 2 | `Step3Info` | Personal info form |
| 3 | `Step4Quiz` | 15-question questionnaire (5 blocks) |
| 4 | `Step5Dashboard` | Full student dashboard |

`?coach=true` URL param triggers `CoachView` instead of the onboarding flow.

### State & Persistence

All state is managed via React hooks. Two localStorage namespaces:
- `glc_onboarding_client_data_v1` — signature, personal info, questionnaire answers (managed in `App.jsx`)
- `glc_dashboard_state_v1` / `glc_dashboard_notes_history_v1` — routines, todos, calendar, notes (managed in `Step5Dashboard`)

`clientData` shape:
```js
{
  signature: "data:image/png;...",
  signatureDate, signatureDateIso,
  contratSigne: boolean,
  infos: { prenom, nom, email, instagram, situation },
  questionnaire: { [index]: { question, bloc, text } }
}
```

### Config-Driven Content (src/config.js)

**All user-facing content lives in `src/config.js`** — this is the primary file to edit for customization:
- Organization identity, tagline, quote
- `welcome_video.src` — accepts YouTube URL, YouTube short URL, YouTube ID, or MP4 URL
- Coach password (`glc2026`)
- Full contract text
- Questionnaire (15 questions across 5 blocks)
- Resource links (Skool, WhatsApp, Instagram)
- Calendar events (predefined monthly events)
- `nextCall` date/time for the countdown timer

### Key Components

- **`Step5Dashboard.jsx`** (~1150 lines) — the main student workspace after onboarding: countdown timer, morning/evening routines with streaks, todo lists (daily/weekly/monthly), month calendar, 4 objectives, Pomodoro timer, notes, contract PDF download.
- **`CoachView.jsx`** (~1400 lines) — admin view for monitoring students: roster, alerts, habit tracking, calendar, WhatsApp links. Currently uses `MOCK_STUDENTS` in-memory data.
- **`Background.jsx`** — canvas-based animated particle system (fixed, z-index 0-1), used on most screens.

### Design System

CSS variables defined in `index.css`:
- `--bg`, `--bg1`–`--bg3`: near-black backgrounds (`#0D0D0D`–`#1A1A1A`)
- `--gold`, `--gold2`: accent (`#C9A44A`)
- `--text`, `--text2`, `--text3`: off-white text
- `--border`, `--border2`: subtle white overlays

Typography: **Bebas Neue** (headings, all-caps) + **Inter** (body), loaded from Google Fonts. Both are used throughout with inline styles and Tailwind utilities.
