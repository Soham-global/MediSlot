# MediSlot frontend

Employee and hospital-admin interface for the MediSlot appointment platform.

## Stack

- React 18 + Vite 5 (JavaScript/JSX)
- React Router 6
- Axios
- Framer Motion
- Lucide icons
- Recharts (reserved for future admin analytics)

## Run locally

```bash
npm install
npm run dev
```

The app runs at `http://localhost:5173` and calls the backend at
`http://localhost:8080` by default. Override the API base URL with:

```bash
VITE_API_URL=http://localhost:8080
```

Copy `.env.example` to `.env` if you need a local override.

## Build

```bash
npm run build
npm run preview
```

## Routes

- `/` — landing page
- `/login`, `/signup` — employee authentication
- `/admin/login` — hospital admin authentication
- `/doctors`, `/doctors/:id` — doctor directory and booking
- `/appointments` — employee appointment history
- `/profile` — employee profile
- `/admin`, `/admin/doctors`, `/admin/doctors/:id/slots`, `/admin/appointments` — admin placeholders

Employee and admin routes are role protected. Shared auth state is stored under the
`token`, `role`, and `user` local storage keys.
