import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import type { IAdmin, IReport, ReportFilterOptions } from '../models/types.ts';
import { AdminModel } from '../models/Admin.ts';
import { ReportModel } from '../models/Report.ts';
import { getIsMongoConnected } from '../config/db.ts';
import { ENV } from '../config/env.ts';
import { generateNextReportNumber } from './reportNumber.ts';
import { filterReports } from './analyticsService.ts';

const DATA_DIR = path.resolve(process.cwd(), '.data');
const DATA_FILE = path.join(DATA_DIR, 'reports_db.json');

interface LocalDB {
  admins: IAdmin[];
  reports: IReport[];
}

// In-memory cache synced with disk file
let localCache: LocalDB = {
  admins: [],
  reports: [],
};

function ensureDataDirectory() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadLocalDB(): LocalDB {
  ensureDataDirectory();
  if (fs.existsSync(DATA_FILE)) {
    try {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(content);
    } catch (err) {
      console.error('[DataStore] Error reading local db file, resetting cache:', err);
    }
  }
  return { admins: [], reports: [] };
}

function saveLocalDB(data: LocalDB) {
  ensureDataDirectory();
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('[DataStore] Error writing to local db file:', err);
  }
}

export const DataStore = {
  async init() {
    localCache = loadLocalDB();
    await this.seedInitialDataIfEmpty();
  },

  async seedInitialDataIfEmpty() {
    const isMongo = getIsMongoConnected();

    // Check admins
    let adminCount = 0;
    if (isMongo) {
      try {
        adminCount = await AdminModel.countDocuments();
      } catch {
        adminCount = 0;
      }
    } else {
      adminCount = localCache.admins.length;
    }

    if (adminCount === 0) {
      console.log('[DataStore] Seeding initial Admin user...');
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(ENV.ADMIN_PASSWORD, salt);
      const defaultAdmin: IAdmin = {
        _id: 'admin_1',
        name: ENV.ADMIN_NAME,
        email: ENV.ADMIN_EMAIL.toLowerCase().trim(),
        passwordHash,
        role: 'admin',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (isMongo) {
        try {
          await AdminModel.create(defaultAdmin);
        } catch (e) {
          console.error('[DataStore] Failed to seed Admin in Mongo:', e);
        }
      }
      localCache.admins.push(defaultAdmin);
      saveLocalDB(localCache);
      console.log(`[DataStore] Admin seeded: ${ENV.ADMIN_EMAIL}`);
    }

    // Check reports
    let reportCount = 0;
    if (isMongo) {
      try {
        reportCount = await ReportModel.countDocuments();
      } catch {
        reportCount = 0;
      }
    } else {
      reportCount = localCache.reports.length;
    }

    if (reportCount === 0) {
      console.log('[DataStore] Seeding initial realistic reports...');
      const seedReports: IReport[] = [
        {
          _id: 'rpt_1',
          reportNumber: 'RPT-2026-0001',
          title: 'Q1 Financial & Operational Audit Review',
          category: 'Financial Audit',
          reportDate: '2026-01-15',
          description: 'Comprehensive quarterly assessment of departmental expense structures, ledger reconciliations, and capital expenditure variance.',
          findings: 'Found a 4.2% operational discrepancy in vendor contract reconciliations across the regional hub. All core ledger balances match bank statements.',
          recommendations: 'Implement automated three-way matching for purchase orders exceeding $10,000 and mandate dual approval for off-cycle dispatches.',
          status: 'Completed',
          priority: 'High',
          tags: ['Finance', 'Audit', 'Q1-2026', 'Compliance'],
          reference: 'AUD-2026-Q1-09',
          archived: false,
          createdAt: '2026-01-15T10:00:00.000Z',
          updatedAt: '2026-01-16T14:30:00.000Z',
        },
        {
          _id: 'rpt_2',
          reportNumber: 'RPT-2026-0002',
          title: 'Enterprise Cloud Infrastructure Security Assessment',
          category: 'Security & Compliance',
          reportDate: '2026-02-04',
          description: 'Evaluation of IAM role hierarchies, network security group policies, and zero-trust perimeter enforcement on production clusters.',
          findings: 'Three legacy service accounts possessed overly permissive wildcard permissions. Multi-factor authentication is 99.4% compliant across administrative consoles.',
          recommendations: 'Rotate credentials for identified service accounts immediately. Enforce automated weekly least-privilege role scanning in CI/CD.',
          status: 'Completed',
          priority: 'Urgent',
          tags: ['Security', 'Cloud', 'IAM', 'ZeroTrust'],
          reference: 'SEC-INFRA-882',
          archived: false,
          createdAt: '2026-02-04T09:15:00.000Z',
          updatedAt: '2026-02-05T11:20:00.000Z',
        },
        {
          _id: 'rpt_3',
          reportNumber: 'RPT-2026-0003',
          title: 'Supply Chain Logistics Disruption Analysis',
          category: 'Operational Risk',
          reportDate: '2026-02-22',
          description: 'Root cause evaluation of freight shipping bottlenecks at coastal ports and impact on inventory turnover targets.',
          findings: 'Port congestion led to an average delay of 6.8 days on sea containers. Secondary regional warehouse buffers absorbed 72% of delivery shock.',
          recommendations: 'Diversify carrier agreements to include air cargo fallback guarantees for critical path components.',
          status: 'In Progress',
          priority: 'High',
          tags: ['SupplyChain', 'Logistics', 'Operations'],
          reference: 'LOG-DIS-441',
          archived: false,
          createdAt: '2026-02-22T08:30:00.000Z',
          updatedAt: '2026-02-23T16:00:00.000Z',
        },
        {
          _id: 'rpt_4',
          reportNumber: 'RPT-2026-0004',
          title: 'Server Cluster Thermal & Power Efficiency Incident',
          category: 'Incident Report',
          reportDate: '2026-03-02',
          description: 'Investigation into unexpected temperature spikes in Rack B-4 and localized HVAC failover latency.',
          findings: 'A backup cooling compressor valve experienced intermittent mechanical throttling, causing rack thermal levels to reach 28°C.',
          recommendations: 'Replace actuator valve on secondary HVAC unit and recalibrate ambient temperature telemetry triggers to 24°C threshold.',
          status: 'Completed',
          priority: 'Urgent',
          tags: ['Incident', 'DataCenter', 'Hardware', 'Facilities'],
          reference: 'INC-2026-0302',
          archived: false,
          createdAt: '2026-03-02T13:45:00.000Z',
          updatedAt: '2026-03-03T10:15:00.000Z',
        },
        {
          _id: 'rpt_5',
          reportNumber: 'RPT-2026-0005',
          title: 'Q2 Executive Strategy & Market Alignment Summary',
          category: 'Executive Summary',
          reportDate: '2026-03-18',
          description: 'High-level synthesis of quarterly business unit performance, operational efficiency indices, and strategic growth trajectories.',
          findings: 'Enterprise adoption exceeded preliminary forecasts by 18%. Customer retention metrics remain solid at 96.8%.',
          recommendations: 'Scale customer onboarding engineering teams and accelerate international localization milestones.',
          status: 'In Progress',
          priority: 'Medium',
          tags: ['Strategy', 'Executive', 'Q2', 'Growth'],
          reference: 'EXEC-STRAT-2026',
          archived: false,
          createdAt: '2026-03-18T11:00:00.000Z',
          updatedAt: '2026-03-19T09:30:00.000Z',
        },
        {
          _id: 'rpt_6',
          reportNumber: 'RPT-2026-0006',
          title: 'Microservices Latency and Database Indexing Audit',
          category: 'Technical Review',
          reportDate: '2026-04-05',
          description: 'Deep performance profiling of API gateway latency, p99 request bottlenecks, and slow query executions.',
          findings: 'Unindexed timestamp filtering on analytics endpoints was contributing 280ms to p99 response curves.',
          recommendations: 'Deploy compound B-tree index on (archived, status, reportDate) and activate Redis edge caching for read-heavy summaries.',
          status: 'Completed',
          priority: 'Medium',
          tags: ['Performance', 'Database', 'Microservices', 'Latency'],
          reference: 'TECH-REV-091',
          archived: false,
          createdAt: '2026-04-05T14:10:00.000Z',
          updatedAt: '2026-04-06T15:20:00.000Z',
        },
        {
          _id: 'rpt_7',
          reportNumber: 'RPT-2026-0007',
          title: 'Vendor SLA Non-Compliance & Billing Dispute',
          category: 'Operational Risk',
          reportDate: '2026-04-12',
          description: 'Formal documentation of uptime SLA breach by third-party telephony provider during peak hours.',
          findings: 'SLA dropped to 97.2% against contracted 99.9% uptime commitment, impacting call center operations.',
          recommendations: 'Issue contractual cure notice and claim credit refund as stipulated in section 8.4 of agreement.',
          status: 'Pending',
          priority: 'High',
          tags: ['Vendor', 'SLA', 'Legal', 'Operations'],
          reference: 'VEN-SLA-102',
          archived: false,
          createdAt: '2026-04-12T16:00:00.000Z',
          updatedAt: '2026-04-12T16:00:00.000Z',
        },
        {
          _id: 'rpt_8',
          reportNumber: 'RPT-2026-0008',
          title: 'Annual Data Privacy & GDPR Policy Compliance Inspection',
          category: 'Security & Compliance',
          reportDate: '2026-04-18',
          description: 'Yearly statutory audit verifying compliance with international data privacy standards and data subject request workflows.',
          findings: 'Automated data deletion request pipeline functions within 48-hour legal requirement. Cookie consent banner updated to v3 specifications.',
          recommendations: 'Conduct biannual refresher training for customer support personnel handling identity verification.',
          status: 'Pending',
          priority: 'Medium',
          tags: ['Compliance', 'GDPR', 'Privacy', 'Security'],
          reference: 'PRIV-2026-GDPR',
          archived: false,
          createdAt: '2026-04-18T10:30:00.000Z',
          updatedAt: '2026-04-18T10:30:00.000Z',
        },
        {
          _id: 'rpt_9',
          reportNumber: 'RPT-2026-0009',
          title: 'Legacy Automated Testing Framework Migration Proposal',
          category: 'Technical Review',
          reportDate: '2026-04-19',
          description: 'Feasibility analysis of migrating outdated testing scripts to modern Vitest and Supertest suites.',
          findings: 'Old test runner takes 18 minutes in CI pipeline and exhibits intermittent flakiness.',
          recommendations: 'Standardize on Vitest with parallel execution pipelines, reducing run duration to under 90 seconds.',
          status: 'Rejected',
          priority: 'Low',
          tags: ['Testing', 'DevOps', 'CI-CD'],
          reference: 'TEST-MIG-003',
          archived: false,
          createdAt: '2026-04-19T09:00:00.000Z',
          updatedAt: '2026-04-20T11:00:00.000Z',
        },
        {
          _id: 'rpt_10',
          reportNumber: 'RPT-2026-0010',
          title: 'Archived 2025 Office Lease Renewal Negotiation Report',
          category: 'Executive Summary',
          reportDate: '2025-11-10',
          description: 'Historical summary of lease renewal terms negotiated for headquarters facility.',
          findings: 'Secured 3-year extension with capped rent indexation and turnkey HVAC upgrades.',
          recommendations: 'Maintain lease agreement documentation in archive repository.',
          status: 'Completed',
          priority: 'Low',
          tags: ['Facilities', 'RealEstate', 'Historical'],
          reference: 'LEASE-HQ-2025',
          archived: true,
          createdAt: '2025-11-10T08:00:00.000Z',
          updatedAt: '2025-11-15T12:00:00.000Z',
        },
      ];

      if (isMongo) {
        try {
          await ReportModel.insertMany(seedReports);
        } catch (e) {
          console.error('[DataStore] Failed to seed reports in Mongo:', e);
        }
      }
      localCache.reports = seedReports;
      saveLocalDB(localCache);
      console.log(`[DataStore] Seeded ${seedReports.length} reports.`);
    }
  },

  async findAdminByEmail(email: string): Promise<IAdmin | null> {
    const cleanEmail = email.toLowerCase().trim();
    if (getIsMongoConnected()) {
      try {
        const found = await AdminModel.findOne({ email: cleanEmail }).lean();
        if (found) return found as unknown as IAdmin;
      } catch (e) {
        console.error('[DataStore] Mongo findAdminByEmail error:', e);
      }
    }
    return localCache.admins.find((a) => a.email.toLowerCase() === cleanEmail) || null;
  },

  async getAdminById(id: string): Promise<IAdmin | null> {
    if (getIsMongoConnected()) {
      try {
        const found = await AdminModel.findById(id).lean();
        if (found) return found as unknown as IAdmin;
      } catch (e) {
        console.error('[DataStore] Mongo getAdminById error:', e);
      }
    }
    return localCache.admins.find((a) => a._id === id) || null;
  },

  async getAllReports(options: ReportFilterOptions = {}) {
    const page = Math.max(1, options.page || 1);
    const limit = Math.max(1, Math.min(100, options.limit || 10));

    // Get all reports from store
    let all: IReport[] = [];
    if (getIsMongoConnected()) {
      try {
        all = (await ReportModel.find().lean()) as unknown as IReport[];
      } catch (e) {
        console.error('[DataStore] Mongo getAllReports error:', e);
        all = localCache.reports;
      }
    } else {
      all = localCache.reports;
    }

    // Apply filtering
    let filtered = filterReports(all, {
      search: options.search,
      status: options.status,
      category: options.category,
      priority: options.priority,
      customer: options.customer,
      startDate: options.startDate,
      endDate: options.endDate,
      archived: options.archived !== undefined ? options.archived : false,
    });

    // Sorting
    const sortBy = options.sortBy || 'createdAt';
    const sortOrder = options.sortOrder || 'desc';

    filtered.sort((a, b) => {
      let valA: string = '';
      let valB: string = '';

      if (sortBy === 'reportDate') {
        valA = a.reportDate || a.createdAt;
        valB = b.reportDate || b.createdAt;
      } else if (sortBy === 'title') {
        valA = a.title.toLowerCase();
        valB = b.title.toLowerCase();
      } else if (sortBy === 'reportNumber') {
        valA = a.reportNumber;
        valB = b.reportNumber;
      } else {
        valA = a.createdAt;
        valB = b.createdAt;
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    const total = filtered.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginated = filtered.slice(startIndex, startIndex + limit);

    return {
      reports: paginated,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  },

  async getAllRawReports(): Promise<IReport[]> {
    if (getIsMongoConnected()) {
      try {
        return (await ReportModel.find().lean()) as unknown as IReport[];
      } catch (e) {
        console.error('[DataStore] Mongo getAllRawReports error:', e);
      }
    }
    return localCache.reports;
  },

  async getReportById(id: string): Promise<IReport | null> {
    if (getIsMongoConnected()) {
      try {
        const doc = await ReportModel.findById(id).lean();
        if (doc) return doc as unknown as IReport;
      } catch (e) {
        console.error('[DataStore] Mongo getReportById error:', e);
      }
    }
    return localCache.reports.find((r) => r._id === id || r.reportNumber === id) || null;
  },

  async createReport(input: Omit<IReport, '_id' | 'reportNumber' | 'createdAt' | 'updatedAt' | 'archived'> & { archived?: boolean }): Promise<IReport> {
    const allReports = await this.getAllRawReports();
    const existingNumbers = allReports.map((r) => r.reportNumber);
    const targetYear = input.reportDate ? parseInt(input.reportDate.substring(0, 4), 10) : new Date().getFullYear();
    const reportNumber = generateNextReportNumber(existingNumbers, isNaN(targetYear) ? new Date().getFullYear() : targetYear);

    const now = new Date().toISOString();
    const newReport: IReport = {
      _id: 'rpt_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      reportNumber,
      title: input.title.trim(),
      category: input.category.trim(),
      reportDate: input.reportDate,
      description: input.description.trim(),
      findings: input.findings ? input.findings.trim() : '',
      recommendations: input.recommendations ? input.recommendations.trim() : '',
      status: input.status,
      priority: input.priority,
      tags: Array.isArray(input.tags) ? input.tags.map((t) => t.trim()).filter(Boolean) : [],
      reference: input.reference ? input.reference.trim() : '',
      customer: input.customer ? input.customer.trim() : '',
      archived: Boolean(input.archived),
      createdAt: now,
      updatedAt: now,
    };

    if (getIsMongoConnected()) {
      try {
        const created = await ReportModel.create(newReport);
        newReport._id = created._id.toString();
      } catch (e) {
        console.error('[DataStore] Mongo createReport error:', e);
      }
    }

    localCache.reports.unshift(newReport);
    saveLocalDB(localCache);

    return newReport;
  },

  async updateReport(id: string, updates: Partial<Omit<IReport, '_id' | 'reportNumber' | 'createdAt'>>): Promise<IReport | null> {
    const now = new Date().toISOString();

    if (getIsMongoConnected()) {
      try {
        const updated = await ReportModel.findByIdAndUpdate(
          id,
          { ...updates, updatedAt: now },
          { new: true }
        ).lean();
        if (updated) {
          // Sync with local cache
          const idx = localCache.reports.findIndex((r) => r._id === id || r.reportNumber === id);
          if (idx !== -1) {
            localCache.reports[idx] = updated as unknown as IReport;
            saveLocalDB(localCache);
          }
          return updated as unknown as IReport;
        }
      } catch (e) {
        console.error('[DataStore] Mongo updateReport error:', e);
      }
    }

    const idx = localCache.reports.findIndex((r) => r._id === id || r.reportNumber === id);
    if (idx === -1) return null;

    const existing = localCache.reports[idx];
    const updatedRecord: IReport = {
      ...existing,
      ...updates,
      updatedAt: now,
    };

    localCache.reports[idx] = updatedRecord;
    saveLocalDB(localCache);
    return updatedRecord;
  },

  async archiveReport(id: string): Promise<IReport | null> {
    return this.updateReport(id, { archived: true });
  },

  async restoreReport(id: string): Promise<IReport | null> {
    return this.updateReport(id, { archived: false });
  },

  async getDistinctCategories(): Promise<string[]> {
    const reports = await this.getAllRawReports();
    const categories = new Set<string>();
    reports.forEach((r) => {
      if (r.category && r.category.trim()) categories.add(r.category.trim());
    });
    return Array.from(categories).sort();
  },
};
