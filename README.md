# 🏎️ ApexVector

<div align="center">

### AI-Powered Motorsport Telemetry & Race Strategy Platform

<img src="https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react" />
<img src="https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript" />
<img src="https://img.shields.io/badge/Vite-Frontend-purple?style=for-the-badge&logo=vite" />
<img src="https://img.shields.io/badge/TailwindCSS-Styling-38B2AC?style=for-the-badge&logo=tailwind-css" />
<img src="https://img.shields.io/badge/Supabase-Backend-3ECF8E?style=for-the-badge&logo=supabase" />
<img src="https://img.shields.io/badge/PostgreSQL-Database-336791?style=for-the-badge&logo=postgresql" />

<br/>
<br/>

> Real-time telemetry analysis, predictive race strategy, and AI-powered motorsport engineering dashboards inspired by professional Formula racing environments.

</div>

---

# 📌 Overview

ApexVector is a full-stack motorsport telemetry platform designed to simulate modern racing engineering systems used in high-performance motorsport environments.

The platform combines:

- 📊 Real-time telemetry visualization
- 🧠 AI-assisted race analytics
- 🏁 Session monitoring
- 📈 Predictive performance insights
- ⚡ Interactive motorsport dashboards

Built using a scalable React + TypeScript architecture with Supabase backend integration.

---

# ✨ Features

## 🏎️ Telemetry Dashboard
- Real-time racing telemetry simulation
- Speed, RPM, throttle, brake & fuel analytics
- Tire and brake temperature tracking
- Interactive session visualization

---

## 🧠 AI Race Strategy System
- Predictive analytics engine
- Race performance insights
- Driver trend analysis
- Session summary generation

---

## 📈 Performance Analytics
- Lap-time analysis
- Sector comparison
- Driver performance tracking
- Session history overview

---

## 🔐 Authentication & Backend
- Supabase authentication
- PostgreSQL database integration
- Secure telemetry storage
- Session-based data management

---

# 🖥️ Tech Stack

| Category | Technologies |
|---|---|
| Frontend | React, TypeScript, Vite |
| Styling | TailwindCSS |
| Backend | Supabase |
| Database | PostgreSQL |
| Charts & Visualization | Recharts |
| Deployment | Vercel |

---

# 🏗️ System Architecture

```text
Frontend (React + TypeScript)
        ↓
Telemetry Components & Context API
        ↓
Supabase Client
        ↓
PostgreSQL Database
        ↓
Analytics & Session Storage
```

---

# 📂 Project Structure

```bash
ApexVector/
│
├── src/
│   ├── components/
│   ├── contexts/
│   ├── hooks/
│   ├── lib/
│   ├── pages/
│   └── utils/
│
├── supabase/
│   └── migrations/
│
├── public/
├── package.json
└── vite.config.ts
```

---

# 🚀 Installation

## Clone Repository

```bash
git clone https://github.com/hamsinisripada-png/ApexVector.git
cd ApexVector
```

---

## Install Dependencies

```bash
npm install
```

---

## Configure Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_publishable_key
```

---

## Run Development Server

```bash
npm run dev
```

Application runs at:

```text
http://localhost:5173
```

---

# 🗄️ Database Setup

Run migration SQL files inside Supabase SQL Editor:

```text
supabase/migrations/
```

This initializes:
- profiles
- telemetry sessions
- telemetry points
- onboarding fields
- session summaries

---

# 📊 Future Improvements

- 🔴 Live telemetry streaming
- 🧠 AI lap prediction models
- 🛞 Tire degradation simulation
- 📡 Real-time race communication
- 🏁 Multi-driver comparison system
- 📈 Advanced predictive analytics

---

# 🌐 Deployment

Deploy easily using:

- Vercel
- Netlify

---

# 👩‍💻 Author

## Hamsini Sripaada

BTech Artificial Intelligence & Data Science

### Interests
- Motorsport Technology
- AI Engineering
- Telemetry Analytics
- Simulation Systems
- Performance Engineering

---

# ⭐ Support

If you like this project:

⭐ Star the repository  
🍴 Fork the project  
🚀 Share it with others

---

<div align="center">

### 🏁 ApexVector — Engineering Motorsport Intelligence

</div>
