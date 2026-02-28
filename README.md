# NGO Hub

NGO Hub is a comprehensive web platform designed to streamline the management, collaboration, and gamification of Non-Governmental Organizations (NGOs), youth clubs, and associated teams.

It provides tools for managing members, tracking activities, assigning tasks, and measuring engagement through points and challenges. 

![Project Overview](https://img.shields.io/badge/Status-Active-brightgreen)
![Tech Stack](https://img.shields.io/badge/Tech-React_|_Vite_|_Tailwind_|_Supabase-blue)

---

## 🎯 Features

- **Authentication & Profiles**: Secure sign-up/login with Supabase. Detailed user profiles tracking volunteering hours and points.
- **Club & Team Management**: Create clubs, appoint presidents and board members, and organize members into dynamic project teams.
- **Task Assignment & Tracking**: Kanban-style task boards, multi-assignee support, complexity weighting, and milestone tracking.
- **Gamification**: Members earn points for completing tasks, finishing challenges, and participating in activities.
- **Document Hub**: Shared team storage buckets for meeting notes and resources.
- **Activities & Events**: Plan internal events, formations, and general assemblies.

---

## 🛠 Tech Stack

- **Frontend**: 
  - [React 18](https://reactjs.org/)
  - [Vite](https://vitejs.dev/) (Bundler & Dev Server)
  - [TypeScript](https://www.typescriptlang.org/)
  - [Tailwind CSS](https://tailwindcss.com/) (Styling)
  - [Lucide React](https://lucide.dev/) (Icons)
  - [Sonner](https://sonner.emilkowal.ski/) (Toast Notifications)
  - [React Router](https://reactrouter.com/) (Navigation)
- **Backend/Database**: 
  - [Supabase](https://supabase.com/) (PostgreSQL Database, Authentication, Storage, & Row Level Security)

---

## 🚀 Installation & Setup

Follow these steps to run the project locally on your machine.

### Prerequisites

1. **Node.js**: Ensure you have [Node.js](https://nodejs.org/) installed (v18 or higher recommended).
2. **Supabase Account**: You will need a [Supabase](https://supabase.com/) project to host the database and authentication.

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd ngo_hub
```

### 2. Install Dependencies

Run the following command to install all required NPM packages:

```bash
npm install
```

### 3. Setup Environment Variables

Create a file named `.env` in the root of your project directory. Add your Supabase credentials:

```ini
VITE_SUPABASE_URL=https://your-project-url.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```
*(You can find these values in your Supabase Dashboard under Settings > API).*

### 4. Database Setup (Supabase)

To get the database up and running, you need to apply the complete SQL schema.
1. Open your [Supabase SQL Editor](https://supabase.com/dashboard/project/_/sql).
2. Open the file `ngo_hub_complete_schema.sql` found in the root of this project.
3. Copy the entire contents of `ngo_hub_complete_schema.sql` and paste it into the Supabase SQL Editor.
4. Click **Run**.
5. Once complete, run the supplementary scripts if necessary (e.g. `FINALIZE_TASKS_SYSTEM.sql` and `FINALIZE_GAMIFICATION.sql`) to ensure all features are fully unlocked.

### 5. Start the Development Server

Start the local Vite development server:

```bash
npm run dev
```

The application should now be running at `http://localhost:5173`.

---

## 📁 Project Structure

```
ngo_hub/
├── public/                 # Static assets
├── src/
│   ├── features/           # Feature-based folder structure
│   │   ├── Authentication/ # Auth flows (Login, Register, Profiles)
│   │   ├── Activities/     # Events and Timeline
│   │   ├── Teams/          # Team and Club management
│   │   ├── Tasks/          # Task boards and assignments
│   │   └── CRM/            # Candidate recruitment and reporting
│   ├── lib/                # Utility functions (e.g., Tailwind class merger)
│   ├── utils/              # Supabase client, Upload helpers
│   ├── Global_Components/  # Reusable UI components (Navbar, Sidebar)
│   ├── App.tsx             # Main application router
│   └── main.tsx            # React DOM entry point
├── ngo_hub_complete_schema.sql # Master DB initialization script
├── .env                    # Environment variables (Git-ignored)
├── package.json            # NPM dependencies and scripts
├── tailwind.config.js      # Tailwind CSS configuration
└── vite.config.ts          # Vite configuration
```

---

## 🔒 Security Notes

- Database access is strictly controlled via **Row Level Security (RLS)** in Supabase. Only authenticated users can read/write data according to their specific organizational roles (President, Lead, Member, etc.).
- Never commit your `.env` file containing sensitive Supabase keys or service role keys to version control.

---

## 🤝 Contributing

1. Fork the feature branch.
2. Commit your changes (`git commit -m 'Add new feature'`).
3. Push to the branch (`git push origin feature-branch`).
4. Open a Pull Request.

---

*For support or technical inquiries, please refer to the project maintainers.*
