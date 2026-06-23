<div align="center">
  <img src="https://raw.githubusercontent.com/sujaljondhale/DriveSync/main/frontend/public/favicon.svg" alt="DriveSync Logo" width="120" />
  <h1>DriveSync</h1>
  <p><b>A beautifully crafted, high-performance personal cloud storage solution.</b></p>
  <p>Built for speed, security, and simplicity.</p>

  [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
  [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](#)
  [![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](#)
  [![Vite](https://img.shields.io/badge/Vite-B73BFE?logo=vite&logoColor=FFD62E)](#)
  [![Prisma](https://img.shields.io/badge/Prisma-3982CE?logo=Prisma&logoColor=white)](#)
</div>

---

## 🌟 About DriveSync

DriveSync bridges powerful cloud storage infrastructure with a calm, organic interface. It's built for people who want their files kept safely and simply. With seamless Google OAuth integration, advanced passkey support, and a robust folder structure system, DriveSync is a modern alternative to traditional cloud drives.

## ✨ Features

- **🔒 Secure Authentication:** Sign in via Email/Password, Google OAuth, or seamless Passkeys (WebAuthn).
- **📂 File & Folder Management:** Create, nest, rename, and organize your files with ease.
- **⚡ Lightning Fast:** Built with Vite and React for a snappy, app-like frontend experience.
- **🔗 Link Sharing:** Generate secure public links to share specific files or folders with anyone.
- **🗑️ Trash Recovery:** Safely recover deleted files or empty your trash to save space.
- **🛡️ Enterprise Grade:** Data encrypted at rest and in transit, powered by PostgreSQL and Prisma.

---

## 🏗️ Architecture

DriveSync follows a modern Client-Server architecture separated into a fast React frontend and a robust Node/Express backend.

```mermaid
graph TD
    User([👨‍💻 User]) --> |HTTPS / REST| Frontend
    
    subgraph "Vercel (Frontend)"
        Frontend[⚛️ React + Vite App]
        Context[React Context API]
        Frontend --- Context
    end

    Frontend -->|API Requests| Backend
    
    subgraph "Render (Backend)"
        Backend[🟢 Node.js / Express]
        Auth[🔐 Auth Layer JWT/OAuth]
        Controllers[⚙️ API Controllers]
        Prisma[🗃️ Prisma ORM]
        
        Backend --- Auth
        Backend --- Controllers
        Controllers --- Prisma
    end
    
    Prisma -->|TCP/SSL| Database[(🐘 Neon PostgreSQL)]
    Auth -.->|OAuth 2.0| Google[Google Cloud Console]
```

---

## 📂 Folder Structure

```text
DriveSync/
├── frontend/               # ⚛️ React + Vite Frontend
│   ├── public/             # Static assets
│   ├── src/
│   │   ├── components/     # Reusable UI components (Icons, Modals, etc.)
│   │   ├── context/        # State management (AuthContext, FilesContext)
│   │   ├── pages/          # App views (Dashboard, Login, Settings, etc.)
│   │   ├── services/       # API integration logic (Axios config)
│   │   ├── utils/          # Helper functions
│   │   ├── App.jsx         # Main React router setup
│   │   └── index.css       # Global design system & styles
│   ├── package.json
│   └── vite.config.js      # Vite configuration & API proxy
│
├── src/                    # 🟢 Express + TypeScript Backend
│   ├── config/             # DB & server configurations
│   ├── controllers/        # Route handlers & business logic (Auth, Files, Folders)
│   ├── middleware/         # Express middlewares (Auth, Error handling)
│   ├── routes/             # API route definitions
│   ├── utils/              # Helper utilities
│   ├── app.ts              # Express application setup
│   └── index.ts            # Server entry point
│
├── prisma/                 # 🗃️ Database Layer
│   └── schema.prisma       # Database schema & models
│
├── .env                    # Backend environment variables (Gitignored)
├── package.json            # Backend dependencies
└── tsconfig.json           # TypeScript configuration
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your local machine:
- **Node.js** (v18+)
- **npm** (v9+)
- A **PostgreSQL** database (Local or Cloud like Neon/Supabase)

### 1. Clone the repository
```bash
git clone https://github.com/sujaljondhale/DriveSync.git
cd DriveSync
```

### 2. Backend Setup
```bash
# Install backend dependencies
npm install

# Setup your .env file
cp .env.example .env

# Generate Prisma client and push schema to database
npx prisma generate
npx prisma db push

# Start the development server (runs on http://localhost:3000)
npm run dev
```

### 3. Frontend Setup
```bash
# Open a new terminal tab and navigate to the frontend directory
cd frontend

# Install frontend dependencies
npm install

# Start the Vite development server (runs on http://localhost:5173)
npm run dev
```

---

## ⚙️ Environment Variables

For the application to run smoothly, you'll need to set up the following environment variables.

**Backend (`/.env`):**
```env
PORT=3000
DATABASE_URL="postgresql://user:password@localhost:5432/drivesync?schema=public"
JWT_SECRET="your_super_secret_jwt_key"

# Google OAuth Setup
GOOGLE_CLIENT_ID="your_google_client_id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your_google_client_secret"
GOOGLE_CALLBACK_URI="http://localhost:3000/api/auth/google/callback"

# WebAuthn / Passkeys Setup
FRONTEND_ORIGIN="http://localhost:5173"
RP_ID="localhost"
RP_NAME="DriveSync"
```

**Frontend (`/frontend/.env.local`):**
```env
VITE_API_URL=http://localhost:3000/api
```

---

## 💡 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

<p align="center">
  <i>Crafted with ❤️ by <a href="https://github.com/sujaljondhale">Sujal Jondhale</a></i>
</p>
