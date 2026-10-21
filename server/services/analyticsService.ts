import type { IReport, ReportStatus, ReportPriority } from '../models/types.ts';

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
  completionRate: number; // percentage 0-100
  pendingWorkloadRate: number; // percentage 0-100
  monthlyGrowthPercentage: number; // vs previous month
  yearlyGrowthPercentage: number; // vs previous year
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
  period: string; // e.g. "2026-01", "2026-W03", "2026-03-20"
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
  percentageChange: number | null; // null if previousCount is 0
  direction: 'increase' | 'decrease' | 'unchanged' | 'not_applicable';
  summarySentence: string;
}

export interface FullAnalyticsReport {
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

/**
 * Safely computes percentage with 1 decimal precision, preventing divide-by-zero.
 */
export function calculatePercentage(part: number, total: number): number {
  if (!total || total <= 0) return 0;
  return Math.round((part / total) * 1000) / 10;
}

/**
 * Safely computes growth rate from previous to current.
 */
export function calculateGrowthRate(current: number, previous: number): {
  rate: number | null;
  direction: 'increase' | 'decrease' | 'unchanged' | 'not_applicable';
} {
  if (previous === 0) {
    if (current === 0) {
      return { rate: 0, direction: 'unchanged' };
    }
    return { rate: null, direction: 'increase' };
  }
  const change = current - previous;
  const rate = Math.round((change / previous) * 1000) / 10;
  let direction: 'increase' | 'decrease' | 'unchanged' = 'unchanged';
  if (rate > 0) direction = 'increase';
  else if (rate < 0) direction = 'decrease';
  return { rate, direction };
}

/**
 * Checks if a date falls within a given day, week, month or year relative to reference date.
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

export function isSameMonth(date1: Date, date2: Date): boolean {
  return date1.getFullYear() === date2.getFullYear() && date1.getMonth() === date2.getMonth();
}

export function isSameYear(date1: Date, date2: Date): boolean {
  return date1.getFullYear() === date2.getFullYear();
}

export function isWithinLastDays(date: Date, refDate: Date, days: number): boolean {
  const diffTime = refDate.getTime() - date.getTime();
  const diffDays = diffTime / (1000 * 3600 * 24);
  return diffDays >= 0 && diffDays <= days;
}

export function filterReports(
  reports: IReport[],
  filters: {
    startDate?: string;
    endDate?: string;
    category?: string;
    status?: string;
    priority?: string;
    customer?: string;
    archived?: boolean;
    search?: string;
  }
): IReport[] {
  return reports.filter((r) => {
    // Archived filter
    const isArchived = Boolean(r.archived);
    if (filters.archived !== undefined && isArchived !== filters.archived) {
      return false;
    }

    // Status filter
    if (filters.status && filters.status !== 'ALL' && r.status !== filters.status) {
      return false;
    }

    // Category filter
    if (filters.category && filters.category !== 'ALL' && r.category !== filters.category) {
      return false;
    }

    // Priority filter
    if (filters.priority && filters.priority !== 'ALL' && r.priority !== filters.priority) {
      return false;
    }

    // Customer filter
    if (filters.customer && filters.customer !== 'ALL' && r.customer !== filters.customer) {
      return false;
    }

    // Date range filter based on reportDate or createdAt
    const reportDateStr = r.reportDate || r.createdAt.substring(0, 10);
    if (filters.startDate && reportDateStr < filters.startDate) {
      return false;
    }
    if (filters.endDate && reportDateStr > filters.endDate) {
      return false;
    }

    // Text search filter
    if (filters.search && filters.search.trim() !== '') {
      const q = filters.search.toLowerCase().trim();
      const match =
        r.reportNumber.toLowerCase().includes(q) ||
        r.title.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        (r.customer && r.customer.toLowerCase().includes(q)) ||
        (r.findings && r.findings.toLowerCase().includes(q)) ||
        (r.recommendations && r.recommendations.toLowerCase().includes(q)) ||
        (r.reference && r.reference.toLowerCase().includes(q)) ||
        (r.tags && r.tags.some((t) => t.toLowerCase().includes(q)));
      if (!match) return false;
    }

    return true;
  });
}

export function computeAnalytics(allReports: IReport[], refDate: Date = new Date()): FullAnalyticsReport {
  const activeReports = allReports.filter((r) => !r.archived);
  const totalActive = activeReports.length;
  const totalArchived = allReports.filter((r) => r.archived).length;

  let createdToday = 0;
  let createdThisWeek = 0;
  let createdThisMonth = 0;
  let createdThisYear = 0;

  let pendingCount = 0;
  let inProgressCount = 0;
  let completedCount = 0;
  let rejectedCount = 0;

  const categoryCounts: Record<string, number> = {};
  const priorityCounts: Record<ReportPriority, number> = {
    Low: 0,
    Medium: 0,
    High: 0,
    Urgent: 0,
  };

  // Monthly buckets for the past 12 months
  const monthlyBuckets: Record<string, TimeSeriesPoint> = {};
  for (let i = 11; i >= 0; i--) {
    const d = new Date(refDate.getFullYear(), refDate.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    monthlyBuckets[key] = {
      period: key,
      label,
      total: 0,
      completed: 0,
      pending: 0,
      inProgress: 0,
      rejected: 0,
    };
  }

  // Daily buckets for last 14 days
  const dailyBuckets: Record<string, TimeSeriesPoint> = {};
  for (let i = 13; i >= 0; i--) {
    const d = new Date(refDate);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().substring(0, 10);
    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    dailyBuckets[key] = {
      period: key,
      label,
      total: 0,
      completed: 0,
      pending: 0,
      inProgress: 0,
      rejected: 0,
    };
  }

  for (const r of activeReports) {
    const createdAt = new Date(r.createdAt || r.reportDate);

    if (isSameDay(createdAt, refDate)) createdToday++;
    if (isWithinLastDays(createdAt, refDate, 7)) createdThisWeek++;
    if (isSameMonth(createdAt, refDate)) createdThisMonth++;
    if (isSameYear(createdAt, refDate)) createdThisYear++;

    // Status tally
    if (r.status === 'Pending') pendingCount++;
    else if (r.status === 'In Progress') inProgressCount++;
    else if (r.status === 'Completed') completedCount++;
    else if (r.status === 'Rejected') rejectedCount++;

    // Category tally
    categoryCounts[r.category] = (categoryCounts[r.category] || 0) + 1;

    // Priority tally
    if (priorityCounts[r.priority] !== undefined) {
      priorityCounts[r.priority]++;
    }

    // Monthly bucket
    const monthKey = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, '0')}`;
    if (monthlyBuckets[monthKey]) {
      monthlyBuckets[monthKey].total++;
      if (r.status === 'Completed') monthlyBuckets[monthKey].completed++;
      else if (r.status === 'Pending') monthlyBuckets[monthKey].pending++;
      else if (r.status === 'In Progress') monthlyBuckets[monthKey].inProgress++;
      else if (r.status === 'Rejected') monthlyBuckets[monthKey].rejected++;
    }

    // Daily bucket
    const dayKey = createdAt.toISOString().substring(0, 10);
    if (dailyBuckets[dayKey]) {
      dailyBuckets[dayKey].total++;
      if (r.status === 'Completed') dailyBuckets[dayKey].completed++;
      else if (r.status === 'Pending') dailyBuckets[dayKey].pending++;
      else if (r.status === 'In Progress') dailyBuckets[dayKey].inProgress++;
      else if (r.status === 'Rejected') dailyBuckets[dayKey].rejected++;
    }
  }

  // Calculate Previous Month counts
  const prevMonthDate = new Date(refDate.getFullYear(), refDate.getMonth() - 1, 1);
  let createdPrevMonth = 0;
  for (const r of activeReports) {
    const createdAt = new Date(r.createdAt || r.reportDate);
    if (isSameMonth(createdAt, prevMonthDate)) {
      createdPrevMonth++;
    }
  }

  // Calculate Previous Year counts
  const prevYear = refDate.getFullYear() - 1;
  let createdPrevYear = 0;
  for (const r of activeReports) {
    const createdAt = new Date(r.createdAt || r.reportDate);
    if (createdAt.getFullYear() === prevYear) {
      createdPrevYear++;
    }
  }

  const completionRate = calculatePercentage(completedCount, totalActive);
  const pendingWorkloadRate = calculatePercentage(pendingCount + inProgressCount, totalActive);

  // Month comparison
  const monthGrowth = calculateGrowthRate(createdThisMonth, createdPrevMonth);
  const currentMonthName = refDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const prevMonthName = prevMonthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  let monthSummary = '';
  if (createdPrevMonth === 0) {
    if (createdThisMonth === 0) {
      monthSummary = `No reports were created in ${currentMonthName} or ${prevMonthName}.`;
    } else {
      monthSummary = `${createdThisMonth} report(s) recorded in ${currentMonthName} (baseline was 0 in ${prevMonthName}).`;
    }
  } else {
    const absDiff = Math.abs(createdThisMonth - createdPrevMonth);
    if (monthGrowth.rate! > 0) {
      monthSummary = `Report volume increased by ${monthGrowth.rate}% (+${absDiff} reports) compared with ${prevMonthName}.`;
    } else if (monthGrowth.rate! < 0) {
      monthSummary = `Report volume decreased by ${Math.abs(monthGrowth.rate!)}% (-${absDiff} reports) compared with ${prevMonthName}.`;
    } else {
      monthSummary = `Report volume was unchanged at ${createdThisMonth} reports compared with ${prevMonthName}.`;
    }
  }

  const monthComparison: ComparisonResult = {
    currentPeriodLabel: currentMonthName,
    previousPeriodLabel: prevMonthName,
    currentCount: createdThisMonth,
    previousCount: createdPrevMonth,
    absoluteChange: createdThisMonth - createdPrevMonth,
    percentageChange: monthGrowth.rate,
    direction: monthGrowth.direction,
    summarySentence: monthSummary,
  };

  // Year comparison
  const yearGrowth = calculateGrowthRate(createdThisYear, createdPrevYear);
  let yearSummary = '';
  if (createdPrevYear === 0) {
    if (createdThisYear === 0) {
      yearSummary = `No reports recorded in ${refDate.getFullYear()} or ${prevYear}.`;
    } else {
      yearSummary = `${createdThisYear} report(s) created in ${refDate.getFullYear()} (0 recorded in ${prevYear}).`;
    }
  } else {
    const absDiffYear = Math.abs(createdThisYear - createdPrevYear);
    if (yearGrowth.rate! > 0) {
      yearSummary = `Annual volume grew by ${yearGrowth.rate}% (+${absDiffYear} reports) vs ${prevYear}.`;
    } else if (yearGrowth.rate! < 0) {
      yearSummary = `Annual volume decreased by ${Math.abs(yearGrowth.rate!)}% (-${absDiffYear} reports) vs ${prevYear}.`;
    } else {
      yearSummary = `Annual volume remained consistent at ${createdThisYear} reports compared to ${prevYear}.`;
    }
  }

  const yearComparison: ComparisonResult = {
    currentPeriodLabel: String(refDate.getFullYear()),
    previousPeriodLabel: String(prevYear),
    currentCount: createdThisYear,
    previousCount: createdPrevYear,
    absoluteChange: createdThisYear - createdPrevYear,
    percentageChange: yearGrowth.rate,
    direction: yearGrowth.direction,
    summarySentence: yearSummary,
  };

  // Category Distribution
  const categoryDistribution: CategoryMetric[] = Object.entries(categoryCounts)
    .map(([category, count]) => ({
      category,
      count,
      percentage: calculatePercentage(count, totalActive),
    }))
    .sort((a, b) => b.count - a.count);

  // Status Distribution
  const statusDistribution: StatusMetric[] = [
    { status: 'Completed', count: completedCount, percentage: calculatePercentage(completedCount, totalActive) },
    { status: 'In Progress', count: inProgressCount, percentage: calculatePercentage(inProgressCount, totalActive) },
    { status: 'Pending', count: pendingCount, percentage: calculatePercentage(pendingCount, totalActive) },
    { status: 'Rejected', count: rejectedCount, percentage: calculatePercentage(rejectedCount, totalActive) },
  ];

  // Priority Distribution
  const priorityDistribution = [
    { priority: 'Urgent' as ReportPriority, count: priorityCounts.Urgent, percentage: calculatePercentage(priorityCounts.Urgent, totalActive) },
    { priority: 'High' as ReportPriority, count: priorityCounts.High, percentage: calculatePercentage(priorityCounts.High, totalActive) },
    { priority: 'Medium' as ReportPriority, count: priorityCounts.Medium, percentage: calculatePercentage(priorityCounts.Medium, totalActive) },
    { priority: 'Low' as ReportPriority, count: priorityCounts.Low, percentage: calculatePercentage(priorityCounts.Low, totalActive) },
  ];

  // Executive Insights
  const executiveInsights: string[] = [monthSummary];
  if (categoryDistribution.length > 0) {
    const topCat = categoryDistribution[0];
    executiveInsights.push(`"${topCat.category}" is the highest-volume category, comprising ${topCat.percentage}% (${topCat.count} reports) of active records.`);
  }
  executiveInsights.push(`Overall report completion rate stands at ${completionRate}%, with an active pending workload of ${pendingWorkloadRate}%.`);

  return {
    overview: {
      totalActive,
      totalArchived,
      createdToday,
      createdThisWeek,
      createdThisMonth,
      createdThisYear,
      pendingCount,
      inProgressCount,
      completedCount,
      rejectedCount,
      completionRate,
      pendingWorkloadRate,
      monthlyGrowthPercentage: monthGrowth.rate ?? 0,
      yearlyGrowthPercentage: yearGrowth.rate ?? 0,
    },
    categoryDistribution,
    statusDistribution,
    priorityDistribution,
    monthlyTrends: Object.values(monthlyBuckets),
    dailyTrends: Object.values(dailyBuckets),
    monthComparison,
    yearComparison,
    executiveInsights,
  };
}
