export type ReportStatus = 'Pending' | 'In Progress' | 'Completed' | 'Rejected';
export type ReportPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'admin';
  createdAt?: string;
}

export interface ReportItem {
  _id: string;
  reportNumber: string;
  title: string;
  category: string;
  reportDate: string;
  description: string;
  findings: string;
  recommendations: string;
  status: ReportStatus;
  priority: ReportPriority;
  tags: string[];
  reference?: string;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface OverviewMetrics {
  totalActive: number;
  totalArchived: number;
  createdToday: number;
  createdThisWeek: number;
  createdThisMonth: number;
  createdThisYear: number;
  pendingCount: number;
  inProgressCount: number;
  completedCount: number;
  rejectedCount: number;
  completionRate: number;
  pendingWorkloadRate: number;
  monthlyGrowthPercentage: number;
  yearlyGrowthPercentage: number;
}

export interface CategoryMetric {
  category: string;
  count: number;
  percentage: number;
}

export interface StatusMetric {
  status: ReportStatus;
  count: number;
  percentage: number;
}

export interface TimeSeriesPoint {
  period: string;
  label: string;
  total: number;
  completed: number;
  pending: number;
  inProgress: number;
  rejected: number;
}

export interface ComparisonResult {
  currentPeriodLabel: string;
  previousPeriodLabel: string;
  currentCount: number;
  previousCount: number;
  absoluteChange: number;
  percentageChange: number | null;
  direction: 'increase' | 'decrease' | 'unchanged' | 'not_applicable';
  summarySentence: string;
}

export interface FullAnalyticsData {
  overview: OverviewMetrics;
  categoryDistribution: CategoryMetric[];
  statusDistribution: StatusMetric[];
  priorityDistribution: { priority: ReportPriority; count: number; percentage: number }[];
  monthlyTrends: TimeSeriesPoint[];
  dailyTrends: TimeSeriesPoint[];
  monthComparison: ComparisonResult;
  yearComparison: ComparisonResult;
  executiveInsights: string[];
}

export interface ReportFormData {
  title: string;
  category: string;
  reportDate: string;
  description: string;
  findings: string;
  recommendations: string;
  status: ReportStatus;
  priority: ReportPriority;
  tags: string;
  reference: string;
}
