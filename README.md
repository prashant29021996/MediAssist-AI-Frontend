# MediAssist AI Frontend

AI-powered Clinic Operating System - Frontend Application

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State**: React Context + Hooks
- **API**: Fetch API with auto-refresh token handling

## Project Structure

```
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout with AuthProvider
│   │   ├── page.tsx            # Home page (redirects to login/dashboard)
│   │   ├── globals.css         # Global styles
│   │   ├── login/
│   │   │   └── page.tsx        # Login page
│   │   └── dashboard/
│   │       └── page.tsx        # Dashboard page
│   ├── lib/
│   │   ├── api.ts              # API client with auth handling
│   │   └── auth-context.tsx    # Auth context provider
│   ├── components/             # Shared components
│   └── features/               # Feature-based modules
├── public/
├── Dockerfile
├── next.config.ts
├── package.json
└── tsconfig.json
```

## Prerequisites

- Node.js 20+
- npm

## Local Development

### 1. Install Dependencies

```bash
cd MediAssist-AI-Frontend
npm install
```

### 2. Set Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Docker Build

```bash
docker build -t medassist-frontend .
docker run -p 3000:3000 medassist-frontend
```

## Features

### Sprint 1
- [x] Login page with email/password
- [x] JWT token management (auto-refresh)
- [x] Auth context with protected routes
- [x] Dashboard with organization listing
- [x] Responsive Tailwind CSS design
- [x] API client with 401 auto-retry

### Pages

| Route | Description | Auth Required |
|-------|-------------|---------------|
| `/` | Home (auto-redirects) | No |
| `/login` | User login | No |
| `/dashboard` | Main dashboard | Yes |

## API Integration

The frontend API client (`src/lib/api.ts`) provides:

- Automatic JWT token attachment
- 401 auto-refresh with token rotation
- Type-safe API methods for auth and organizations
- Centralized error handling

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8080/api/v1` | Backend API base URL |