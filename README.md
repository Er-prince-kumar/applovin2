# LinkEarn — Authentic Traffic Monetization & Affiliate Performance Platform

> **"Turn genuine traffic into measurable earnings."**

LinkEarn is a modern, high-performance web application designed for creators, publishers, and affiliate marketers to monetize genuine traffic through smart direct links, backed by a defensive traffic quality engine, transparent earnings ledger, and multi-channel payouts.

---

## 🌟 Key Highlights & Architecture

- **Sub-Millisecond Public Redirects (`/go/[slug]`)**: Instant target resolution with zero interstitial spam or deceptive scripts.
- **Defensive Multi-Layer Traffic & Fraud Filter**: Automatically classifies traffic into `VALID`, `SUSPICIOUS`, or `INVALID` based on rapid burst limits, automated bot user agents, and duplicate fingerprint detection.
- **Server-Side Earning Calculation**: Configurable models (**CPC**, **CPM**, **CPA**). Earnings are computed strictly on the backend and recorded to an immutable database ledger.
- **Referral Commission Engine**: Built-in 5% lifetime referral bonus credited to sponsors whenever their referred publishers generate verified revenue.
- **Multi-Method Payout System**: Self-service withdrawal requests via **PayPal**, **USDT (TRC20)**, **Bank Wire**, and **Payoneer** with manual admin approvals and balance refund protection on rejections.
- **Dual User & Admin Portals**: Dedicated Publisher Dashboard and separate, role-protected Admin Operations Center.
- **Modern Dark UI/UX**: Charcoal and jet-black themes (`#0B0F17`), emerald-green earnings accents, responsive drawers, Recharts visual analytics, and toast notifications.

---

## 🛠️ Technology Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, Turbopack, React 19)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, custom glassmorphism design tokens
- **Database & ORM**: PostgreSQL / SQLite with [Prisma ORM](https://www.prisma.io/)
- **Authentication**: Bcrypt password hashing, signed HTTP-only JWT sessions (`jose`)
- **Data Validation**: [Zod](https://zod.dev/)
- **Charts**: [Recharts](https://recharts.org/) (Area, Bar, Donut charts)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 📁 Project Structure

```
├── prisma/
│   ├── schema.prisma        # Complete schema (User, Session, Link, Campaign, ClickEvent, etc.)
│   └── seed.ts              # Seed script populating demo admin, publisher, links, traffic & payouts
├── scripts/
│   ├── test-suite.ts        # Unit test suite verifying auth, fraud engine, and ledgers
│   └── verify-live-app.ts   # Live server integration test suite (17 passed assertions)
├── src/
│   ├── app/
│   │   ├── (public pages)   # Landing page (/), /login, /register, /forgot-password
│   │   ├── go/[slug]/       # High-speed public direct link redirect route handler
│   │   ├── link-error/      # Fallback error page for paused/deleted links
│   │   ├── dashboard/       # Publisher performance overview with real database metrics
│   │   ├── links/           # Link management & /links/create form
│   │   ├── analytics/       # Deep-dive traffic demographics, devices, and countries
│   │   ├── earnings/        # Immutable transaction ledger & revenue models breakdown
│   │   ├── withdrawals/     # Payout request modal and disbursement queue history
│   │   ├── referrals/       # Referral code, sponsor tracking, and affiliate tree
│   │   ├── profile/         # Account profile & password change
│   │   ├── settings/        # Notification triggers & developer API keys
│   │   ├── support/         # Support ticket center & FAQ
│   │   ├── admin/           # Admin Control Center (Users, Links, Traffic, Withdrawals, Campaigns, Reports)
│   │   └── api/             # REST API routes (auth, links, withdrawals, admin, analytics)
│   ├── components/
│   │   ├── brand/Logo.tsx   # LinkEarn brand icon & typography
│   │   ├── charts/          # Recharts components (EarningsChart, TrafficChart, DeviceDistribution)
│   │   ├── layout/          # Sidebar, Topbar, MobileNav, AdminSidebar, AdminTopbar, Shells
│   │   └── ui/              # StatCard, Toast notifications, Modal
│   └── lib/
│       ├── auth.ts          # Session tokens, password hashing, and RBAC guards
│       ├── earning-engine.ts# Server-side revenue calculation & immutable transaction ledger
│       ├── fraud.ts         # Defensive traffic evaluation & bot detection
│       ├── prisma.ts        # Singleton Prisma client instance
│       └── utils.ts         # Formatting currencies, numbers, and dates
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js LTS (v20+ or v22+)
- npm or pnpm

### 2. Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Default `.env` configuration:
```env
DATABASE_URL="file:./dev.db"
AUTH_SECRET="linkearn-production-secure-auth-secret-key-32-chars-min"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
ADMIN_DEFAULT_EMAIL="admin@linkearn.com"
ADMIN_DEFAULT_PASSWORD="AdminSecure123!"
MIN_WITHDRAWAL_AMOUNT="10.00"
REFERRAL_PERCENT_COMMISSION="5.0"
PLATFORM_DEFAULT_CURRENCY="USD"
```

> **To switch to PostgreSQL in production:**
> 1. In `prisma/schema.prisma`, change `provider = "sqlite"` to `provider = "postgresql"`.
> 2. Set `DATABASE_URL="postgresql://username:password@localhost:5432/linkearn?schema=public"` in `.env`.
> 3. Run `npm run db:push`.

### 3. Database Migration & Seeding
Generate the client, create the database schema, and seed realistic demo accounts:
```bash
npm run postinstall   # prisma generate
npm run db:push       # push schema to database
npm run db:seed       # seed demo users, links, campaigns, and traffic
```

### 4. Running the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Running the Production Server
```bash
npm run build
npm run start
```

---

## 🔑 Demo Login Credentials

The seed script creates the following pre-configured demo accounts:

| Role | Email | Password | Access Area |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@linkearn.com` | `AdminSecure123!` | `/admin` (Complete control center) |
| **Publisher User** | `publisher@linkearn.com` | `Publisher123!` | `/dashboard` (Publisher portal) |

> 💡 *Quick Login: Both the `/login` page and forms feature 1-click demo autofill buttons for immediate testing.*

---

## 🧪 Automated Testing

LinkEarn includes both standalone unit tests and live HTTP integration suites:

```bash
# Run unit tests (Password hashing, JWT, Fraud engine, Earning engine, Withdrawals)
npm test

# Run TypeScript compilation checks
npx tsc --noEmit

# Run production build validation
npm run build

# Run live endpoint verification against running server
npx tsx scripts/verify-live-app.ts
```

---

## 🛡️ Security & Anti-Fraud Architecture

1. **Defensive Traffic Quality Checks**:
   - Bot & Scraper detection via user-agent signatures (curl, wget, python, headless chrome, selenium, automated spiders).
   - Sub-second duplicate click bursts (< 3s) from the same fingerprint are marked `INVALID` and rejected from earnings.
   - High-frequency rate limits (> 6 clicks/min from same fingerprint) are tagged as `SUSPICIOUS` and isolated from the publisher's payable balance.
2. **Immutable Financial Ledger**:
   - Every earning credit, referral dividend, and withdrawal generates an atomic `Transaction` row.
   - Balances are updated strictly server-side using ACID transactions (`prisma.$transaction`).
3. **Safe Redirections**:
   - Destination URLs are validated for legal `http://` or `https://` protocols to prevent open-redirect vulnerabilities.
   - User inputs sanitized via Zod schemas.
4. **Session Security**:
   - Signed, tamper-proof JSON Web Tokens stored in `HttpOnly`, `SameSite=Lax` cookies.

---

## 📱 Mobile App & Direct Website Download

LinkEarn includes full mobile application support with direct, 1-click downloads directly from the website for end-users and publishers, as well as a native Capacitor project:

### 📥 Downloading the App Directly from the Website
1. **Dedicated Download Hub**: Visit [`/download`](http://localhost:3000/download) from any browser to access the 1-click Android APK installer and iOS installation guide.
2. **Direct APK Download URL**: Visiting or clicking [`/api/download/apk`](http://localhost:3000/api/download/apk) instantly downloads `LinkEarn-Publisher-v1.0.0.apk` with proper Android package MIME headers.
3. **Landing Page Integrations**:
   - Header navigation button: "Mobile App" & "Get APK"
   - Hero action button: "Download App (APK)"
   - Showcase section: Mobile phone mockup preview with 1-click installer button
   - Footer shortcut: "Download App"
4. **Publisher Dashboard Integrations**:
   - Left Sidebar: Interactive "Mobile App (APK)" widget with instant "Get APK" button
   - Top Navigation Bar: Quick "Get APK" header shortcut button
   - Navigation Menu: Direct "Mobile App (APK)" link

### Mobile App Native Features
- **Direct Android APK Package**: Ready-to-install Android package (`.apk`, 178 KB) built directly from the native Capacitor project.
- **Native Bottom Navigation Bar**: Quick thumb-friendly switching between Dashboard, Links, 1-Click Create Link, Analytics, and Payouts.
- **Edge-to-Edge Dark Status Bar**: Seamless integration with Android and iOS system themes.
- **PWA & Standalone Support**: Includes `manifest.json` and high-resolution icons for instant installation on mobile browsers without an app store account.
- **Native Android Project**: Located in the [`android/`](file:///C:/Users/Prince%20Singh/Desktop/Add/android) directory ready for compilation with Android Studio or Gradle.

### Mobile Developer Commands
```bash
# Sync web changes to the native Android project
npm run cap:sync

# Open the project in Android Studio to build APK or run on emulator/device
npm run cap:open:android

# Build native Android APK via Gradle wrapper
cd android
./gradlew assembleDebug
```

---

## ⚡ Automatic Live Code & GitHub Sync

Any changes you make to the code can be automatically updated in the live app and automatically committed and pushed to your GitHub repository:

### 1. Live Instant App Updates (Fast Refresh)
Run the development server:
```bash
npm run dev
```
- Edits made to any component, page, or style immediately update in the browser and mobile app via **Next.js Fast Refresh** with zero reload time.

### 2. Automatic GitHub Upload Watcher
Start the automatic GitHub background sync watcher:
```bash
npm run watch:github
```
- **Automatic detection**: Detects whenever you save any file.
- **Automatic commit**: Batches changes and creates an atomic Git commit with a timestamp.
- **Automatic GitHub push**: As soon as your GitHub remote is set, pushes commits directly to your GitHub repository in the background.

### 3. Connect Your GitHub Repository (One-Time Setup)
```bash
# Link your repository and push initial commit
npm run git:remote -- https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git

# Or standard Git command:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
git push -u origin main
```

---

## 📄 License
MIT License. Built for performance affiliate link monetization.
