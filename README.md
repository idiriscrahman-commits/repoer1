# Enterprise Report Management System (RMS)

A complete, production-grade, secure, responsive, full-stack Report Management System designed exclusively for an **Admin** to enter, store, manage, search, review, compare, analyze, and export general enterprise reports.

---

## 1. Technology Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, Recharts
- **Backend**: Node.js & Express.js
- **Database**: MongoDB Atlas Cloud Database (with Mongoose ODM) + Persistent High-Reliability internal file storage engine fallback
- **Authentication & Security**: JSON Web Tokens (JWT), Bcrypt password hashing (salt factor 10), Login Rate Limiter (brute-force defense), RBAC (Admin exclusive)
- **Data Validation**: Zod runtime schema validation
- **Reporting & Exports**: ExcelJS (styled .xlsx spreadsheets with frozen headers), jsPDF (executive paginated PDFs)
- **Testing**: Built-in `node:test` runner executed via `tsx`

---

## 2. Project Folder Structure

```text
/
├── .data/                             # High-reliability persistent local database store
│   └── reports_db.json
├── index.html                         # Entry HTML with meta and title sync
├── metadata.json                      # Applet capabilities & metadata
├── package.json                       # Dependencies & scripts
├── server.ts                          # Root full-stack server (Express + Vite middleware)
├── tsconfig.json                      # TypeScript configuration
├── vite.config.ts                     # Vite build configuration
│
├── server/                            # Backend Source Code
│   ├── app.ts                         # Express app setup, CORS, JSON parsers, routes
│   ├── config/
│   │   ├── db.ts                      # MongoDB Atlas connector & status check
│   │   └── env.ts                     # Environment variable validation
│   ├── controllers/
│   │   ├── authController.ts          # Login & Admin verification
│   │   ├── reportController.ts        # CRUD, archiving, restoring, filtering
│   │   ├── analyticsController.ts     # Real-time metrics & comparison calculations
│   │   └── exportController.ts       # ExcelJS and jsPDF binary export generation
│   ├── middleware/
│   │   ├── auth.ts                    # JWT token validation & rate limiting
│   │   └── errorHandler.ts            # Centralized error handler
│   ├── models/
│   │   ├── Admin.ts                   # Mongoose Admin Schema
│   │   ├── Report.ts                  # Mongoose Report Schema with text indexes
│   │   └── types.ts                   # TypeScript interfaces
│   ├── routes/
│   │   ├── authRoutes.ts              # /api/auth/*
│   │   ├── reportRoutes.ts            # /api/reports/*
│   │   ├── analyticsRoutes.ts         # /api/analytics/*
│   │   └── exportRoutes.ts            # /api/export/*
│   ├── services/
│   │   ├── analyticsService.ts        # Pure statistical calculations & trend analysis
│   │   ├── dataStore.ts               # Unified data repository (Mongo Atlas & persistent disk)
│   │   └── reportNumber.ts            # Concurrency-safe unique sequence generator
│   └── seedAdmin.ts                   # Standalone Admin and report seed script
│
├── src/                               # Frontend Source Code
│   ├── App.tsx                        # Root application component & layout state
│   ├── main.tsx                       # React DOM entry
│   ├── index.css                      # Tailwind CSS v4 directives
│   ├── types/
│   │   └── index.ts                   # Shared TypeScript models
│   ├── context/
│   │   └── AuthContext.tsx            # Admin session context & token management
│   ├── services/
│   │   └── api.ts                     # API client & binary file downloaders
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx            # Navy-blue enterprise sidebar
│   │   │   ├── Header.tsx             # Header with title & database status badge
│   │   │   └── MainLayout.tsx         # Responsive container
│   │   └── ui/
│   │       ├── StatusBadge.tsx        # Pending, In Progress, Completed, Rejected
│   │       ├── PriorityBadge.tsx      # Low, Medium, High, Urgent
│   │       ├── ConfirmModal.tsx       # Reusable confirmation dialogs
│   │       └── Toast.tsx              # Pop-up notification toasts
│   └── pages/
│       ├── LoginPage.tsx              # Secure Admin login with 1-click demo button
│       ├── DashboardPage.tsx          # 9 Summary KPI cards, Recharts, recent table
│       ├── AddReportPage.tsx          # Report entry form with auto-numbering
│       ├── ReportsListPage.tsx        # Filterable repository table with pagination
│       ├── ReportDetailPage.tsx       # Full report inspection view & PDF button
│       ├── AnalyticsPage.tsx          # Advanced trends, ratios, and growth metrics
│       ├── ArchivedReportsPage.tsx    # Archived vault with restore option
│       ├── ExportPage.tsx             # Export center for Excel (.xlsx) & PDF
│       └── SettingsPage.tsx           # Admin info, MongoDB configuration, security specs
│
└── tests/                             # Automated Unit Tests
    ├── reportNumber.test.ts           # Sequence generation tests
    ├── analytics.test.ts              # Growth calculations & zero-division safe tests
    └── auth.test.ts                   # Zod schemas & credential validation tests
```

---

## 3. Quick Start & Local Setup

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Default seeded credentials:
- **Email**: `admin@reportmanagement.internal`
- **Password**: `AdminPassword2026!`

*(Alternatively, use the **"Use Seeded Admin Credentials (1-Click)"** button on the login screen).*

### Step 3: Run the Development Server
```bash
npm run dev
```
The server will start at `http://localhost:3000`.

### Step 4: Run the Standalone Seed Script (Optional)
To manually re-seed the administrator or reload base reports:
```bash
npx tsx server/seedAdmin.ts
```

---

## 4. Connecting MongoDB Atlas Cloud Database

The application connects to MongoDB Atlas out-of-the-box when a connection string is provided. If no connection string is provided, it operates seamlessly using its internal persistent disk store (`.data/reports_db.json`), ensuring zero downtime.

To connect your own MongoDB Atlas cluster:
1. Log in to [cloud.mongodb.com](https://cloud.mongodb.com) and create a free M0 cluster.
2. In **Database Access**, create a user with Read and Write permissions.
3. In **Network Access**, allow access from your deployment IP or `0.0.0.0/0`.
4. Copy your SRV connection string:
   ```text
   mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/report_management?retryWrites=true&w=majority
   ```
5. Paste it into your `.env` as `MONGO_URI`:
   ```bash
   MONGO_URI="mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/report_management?retryWrites=true&w=majority"
   ```
6. Restart the application. The header badge will indicate `Storage: MongoDB Atlas`.

---

## 5. REST API Documentation

All private endpoints require the `Authorization: Bearer <token>` header.

### Authentication
- `POST /api/auth/login`: Admin authentication with rate limiting. Returns JWT token and admin info.
- `GET /api/auth/me`: Verifies active session token.

### Reports
- `GET /api/reports`: Retrieves reports with filtering (`search`, `status`, `category`, `priority`, `startDate`, `endDate`, `archived`), sorting (`sortBy`, `sortOrder`), and pagination (`page`, `limit`).
- `POST /api/reports`: Creates a new report with auto-generated unique report number (`RPT-YYYY-XXXX`).
- `GET /api/reports/:id`: Returns full report details.
- `PUT /api/reports/:id`: Updates an existing report.
- `PATCH /api/reports/:id/archive`: Safely moves a report to the archive vault.
- `PATCH /api/reports/:id/restore`: Restores an archived report back to active rotation.
- `GET /api/reports/categories`: Retrieves all distinct report categories.

### Analytics
- `GET /api/analytics/all`: Returns complete analytical dataset with filters applied.
- `GET /api/analytics/overview`: Returns KPI counts, completion rate, and growth percentages.
- `GET /api/analytics/trends`: Returns 12-month and 14-day time series data points.
- `GET /api/analytics/categories`: Returns volume and percentage distribution by category.
- `GET /api/analytics/statuses`: Returns status ratios and pending workload percentages.
- `GET /api/analytics/compare`: Returns month-over-month and year-over-year comparative models with verified textual insights.

### Exports
- `GET /api/export/excel`: Streams an `.xlsx` workbook generated with ExcelJS.
- `GET /api/export/pdf`: Streams a formatted `.pdf` document generated with jsPDF.

---

## 6. Running Automated Tests

Run the unit test suite:
```bash
npm test
```
Or directly:
```bash
npx tsx --test tests/*.test.ts
```

Tests cover:
- Unique sequence numbering formatting & annual counter resets
- Zero-denominator safe percentage and growth rate calculations
- Search, status, and category filtering algorithms
- Analytics aggregation engine
- Zod schema input validation

---

## 7. Connecting DNS with InfinityFree (infinityfree.com)

If you have a domain or free subdomain managed on [InfinityFree](https://www.infinityfree.com/):

### Method 1: CNAME Record Setup (Direct Mapping)
1. Log into your **InfinityFree Client Area** and open your hosting account.
2. Click **Control Panel** (cPanel / VistaPanel).
3. Scroll to the **Advanced** section and click **CNAME Records**.
4. In **Source**, enter your chosen subdomain prefix (e.g., `reports` or `@` for root domain).
5. In **Destination**, enter your deployed application host (e.g. your Cloud Run or server hostname).
6. Click **Add**.

### Method 2: InfinityFree Custom Nameservers
If using a custom domain with InfinityFree DNS:
- Nameserver 1: `ns1.epizy.com`
- Nameserver 2: `ns2.epizy.com`

### Free SSL Configuration
1. In the InfinityFree Client Area, click **Free SSL Certificates**.
2. Select your domain and choose **Let's Encrypt** or **ZeroSSL**.
3. Complete the automatic CNAME verification and install the certificate with one click.
4. Update `CLIENT_ORIGIN` in your `.env` to match your HTTPS InfinityFree domain.

