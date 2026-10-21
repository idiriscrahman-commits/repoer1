import type { Response } from 'express';
import type { AuthenticatedRequest } from '../middleware/auth.ts';
import { DataStore } from '../services/dataStore.ts';
import { computeAnalytics, filterReports } from '../services/analyticsService.ts';

export const getFullAnalytics = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const rawReports = await DataStore.getAllRawReports();
    const { startDate, endDate, category, status, priority } = req.query;

    const filtered = filterReports(rawReports, {
      startDate: typeof startDate === 'string' ? startDate : undefined,
      endDate: typeof endDate === 'string' ? endDate : undefined,
      category: typeof category === 'string' ? category : undefined,
      status: typeof status === 'string' ? status : undefined,
      priority: typeof priority === 'string' ? priority : undefined,
    });

    const analytics = computeAnalytics(filtered);
    res.json({ success: true, data: analytics });
  } catch (error) {
    console.error('[AnalyticsController] getFullAnalytics error:', error);
    res.status(500).json({ success: false, message: 'Failed to compute analytics' });
  }
};

export const getOverview = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const rawReports = await DataStore.getAllRawReports();
    const analytics = computeAnalytics(rawReports);
    res.json({ success: true, data: analytics.overview });
  } catch (error) {
    console.error('[AnalyticsController] getOverview error:', error);
    res.status(500).json({ success: false, message: 'Failed to compute overview metrics' });
  }
};

export const getTrends = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const rawReports = await DataStore.getAllRawReports();
    const analytics = computeAnalytics(rawReports);
    res.json({
      success: true,
      data: {
        monthly: analytics.monthlyTrends,
        daily: analytics.dailyTrends,
      },
    });
  } catch (error) {
    console.error('[AnalyticsController] getTrends error:', error);
    res.status(500).json({ success: false, message: 'Failed to compute trend metrics' });
  }
};

export const getCategories = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const rawReports = await DataStore.getAllRawReports();
    const analytics = computeAnalytics(rawReports);
    res.json({ success: true, data: analytics.categoryDistribution });
  } catch (error) {
    console.error('[AnalyticsController] getCategories error:', error);
    res.status(500).json({ success: false, message: 'Failed to compute category metrics' });
  }
};

export const getStatuses = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const rawReports = await DataStore.getAllRawReports();
    const analytics = computeAnalytics(rawReports);
    res.json({ success: true, data: analytics.statusDistribution });
  } catch (error) {
    console.error('[AnalyticsController] getStatuses error:', error);
    res.status(500).json({ success: false, message: 'Failed to compute status metrics' });
  }
};

export const getCompare = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const rawReports = await DataStore.getAllRawReports();
    const analytics = computeAnalytics(rawReports);
    res.json({
      success: true,
      data: {
        monthComparison: analytics.monthComparison,
        yearComparison: analytics.yearComparison,
        executiveInsights: analytics.executiveInsights,
      },
    });
  } catch (error) {
    console.error('[AnalyticsController] getCompare error:', error);
    res.status(500).json({ success: false, message: 'Failed to compute comparison analytics' });
  }
};
