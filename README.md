# PDUMC Alumni Platform

Pandit Dindayal Upadhyay Medical College Alumni Reunion & Networking Platform

## 🚀 Project Status

This is a work-in-progress implementation of a full-stack Next.js application for PDUMC alumni. The platform enables alumni to reconnect, coordinate reunion events, and share memories.

### ✅ Completed Features

#### Phase 1: Project Setup & Infrastructure
- ✅ Next.js 15 with TypeScript and App Router
- ✅ Tailwind CSS for styling
- ✅ Landing page with hero section and CTAs
- ✅ Cloudflare Pages configuration template
- ✅ Database schema designed for D1 (SQLite)
- ✅ TypeScript types for all data models

#### Phase 2: Database Design
- ✅ Complete database schema with 7 tables:
  - `users` - Authentication and user accounts
  - `alumni_profiles` - Alumni information (pre-imported or self-registered)
  - `events` - Reunion events
  - `event_registrations` - Event sign-ups
  - `memories` - Photo gallery
  - `announcements` - Platform announcements
  - `activity_logs` - Admin monitoring logs

#### Phase 3: Authentication (Partial)
- ✅ NextAuth.js v5 configuration
- ✅ Login page UI
- ✅ Registration page UI
- ✅ Role-based access control setup (Alumni, Admin)
- ⏳ Email/password authentication API (needs database integration)
- ⏳ Google OAuth integration (needs credentials)

### 🔨 In Progress / To Do

#### Authentication System
- [ ] Implement registration API with database
- [ ] Add password hashing with bcryptjs
- [ ] Email verification flow
- [ ] Google OAuth integration
- [ ] Password reset functionality

#### Core UI Components
- [ ] Main navigation header
- [ ] Responsive mobile menu
- [ ] Reusable form components
- [ ] Loading states and error boundaries
- [ ] Toast notifications

#### Alumni Features
- [ ] Alumni directory with search and filters
- [ ] Individual alumni profile pages
- [ ] Profile edit functionality
- [ ] Photo upload to Cloudflare R2
- [ ] Privacy settings

#### Database Import & Claim System
- [ ] Admin interface for viewing unclaimed profiles
- [ ] Token generation for profile claims
- [ ] Email invitation system
- [ ] Profile claim flow with verification

#### Event Management
- [ ] Event listing page
- [ ] Event detail page
- [ ] Event registration form
- [ ] Admin event creation/edit
- [ ] Capacity management

#### Memories (Photo Gallery)
- [ ] Photo upload interface
- [ ] Gallery view (masonry layout)
- [ ] Photo modal viewer

#### Admin Features
- [ ] Admin dashboard
- [ ] Alumni management (CRUD)
- [ ] Event management
- [ ] Data export
- [ ] Activity logs viewer

## 🛠️ Technology Stack

### Core Framework
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework

### Authentication
- **NextAuth.js v5** - Authentication (email/password + Google OAuth)
- **bcryptjs** - Password hashing

### Database & Storage
- **Cloudflare D1** - Serverless SQL database (SQLite)
- **Cloudflare R2** - S3-compatible object storage for photos

### Form Handling
- **React Hook Form** - Form state management
- **Zod** - Schema validation

### UI Components
- **Radix UI** - Headless UI components
- **date-fns** - Date manipulation

### Deployment
- **Cloudflare Pages** - Static site hosting
- **Cloudflare Workers** - Serverless functions

## 📦 Getting Started

### Prerequisites
- Node.js 18 or higher
- npm or yarn
- Cloudflare account (for deployment)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/technoknol/pdumc2001.com.git
cd pdumc2001.com
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Generate NextAuth secret:
```bash
openssl rand -base64 32
# Copy to NEXTAUTH_SECRET in .env
```

### Local Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

### Database Setup

See [db/README.md](db/README.md) for database setup instructions.

For local development:
```bash
# Install wrangler CLI
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Create local D1 database
wrangler d1 create pdumc-alumni-db --local

# Run migrations
wrangler d1 execute pdumc-alumni-db --local --file=./db/migrations/001_initial_schema.sql
```

### Building for Production

```bash
npm run build
```

## 📁 Project Structure

```
pdumc2001.com/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   └── auth/         # NextAuth.js handlers
│   ├── login/            # Login page
│   ├── register/         # Registration page
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Landing page
├── db/                    # Database files
│   ├── migrations/       # SQL migration files
│   └── README.md         # Database docs
├── lib/                   # Utility functions
│   └── db.ts             # Database helpers
├── types/                 # TypeScript types
│   ├── models.ts         # Database models
│   └── next-auth.d.ts    # NextAuth extensions
├── public/               # Static assets
├── auth.ts               # NextAuth configuration
├── auth.config.ts        # Auth callbacks
├── wrangler.toml.example # Cloudflare config template
└── package.json          # Dependencies
```

## 🚀 Deployment

### Cloudflare Pages

1. Create Cloudflare D1 database:
```bash
wrangler d1 create pdumc-alumni-db
```

2. Create Cloudflare R2 bucket:
```bash
wrangler r2 bucket create pdumc-alumni-storage
```

3. Update `wrangler.toml` with your database and bucket IDs

4. Run migrations:
```bash
wrangler d1 execute pdumc-alumni-db --file=./db/migrations/001_initial_schema.sql
```

5. Deploy:
```bash
npm run build
wrangler pages deploy
```

## 📝 Requirements

Full requirements are documented in [REQUIREMENTS.md](REQUIREMENTS.md).

### Key Features (from Requirements)

1. **User Management**
   - Self-registration for new alumni
   - Profile claiming for pre-imported alumni
   - Google OAuth integration
   - Role-based access (Alumni, Admin)

2. **Alumni Directory**
   - Search and filter alumni
   - View profiles with privacy controls
   - Professional networking

3. **Event Management**
   - Create and manage reunion events
   - Event registration with guest count
   - Dietary preferences and special requirements

4. **Photo Gallery**
   - Upload and share memories
   - Caption photos
   - Browse by date

5. **Admin Features**
   - Bulk import alumni data
   - Manage events and announcements
   - Export data
   - Activity logs

## 🔐 Security

- Passwords are hashed with bcryptjs
- NextAuth.js handles session management
- Environment variables for sensitive data
- Input validation with Zod
- Role-based access control

## 🤝 Contributing

This is a private project for PDUMC alumni. For questions or issues, please contact the development team.

## 📄 License

ISC

## 👥 Contact

For questions or support, contact the PDUMC Alumni platform administrators.

---

**Note**: This project is in active development. Features are being added incrementally following the implementation plan in the PR description.
