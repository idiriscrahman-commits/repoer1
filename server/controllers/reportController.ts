import type { Response } from 'express';
import type { AuthenticatedRequest } from '../middleware/auth.ts';
import { DataStore } from '../services/dataStore.ts';
import { ReportCreateSchema, ReportUpdateSchema } from '../validators/reportValidator.ts';
import type { ReportFilterOptions, ReportPriority, ReportStatus } from '../models/types.ts';

export const getReports = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const {
      search,
      status,
      category,
      priority,
      customer,
      startDate,
      endDate,
      archived,
      sortBy,
      sortOrder,
      page,
      limit,
    } = req.query;

    const filterOptions: ReportFilterOptions = {
      search: typeof search === 'string' ? search : undefined,
      status: typeof status === 'string' && status !== 'ALL' ? (status as ReportStatus) : undefined,
      category: typeof category === 'string' && category !== 'ALL' ? category : undefined,
      priority: typeof priority === 'string' && priority !== 'ALL' ? (priority as ReportPriority) : undefined,
      customer: typeof customer === 'string' && customer !== 'ALL' ? customer : undefined,
      startDate: typeof startDate === 'string' && startDate ? startDate : undefined,
      endDate: typeof endDate === 'string' && endDate ? endDate : undefined,
      archived: archived === 'true' ? true : false,
      sortBy: typeof sortBy === 'string' ? (sortBy as any) : 'createdAt',
      sortOrder: sortOrder === 'asc' ? 'asc' : 'desc',
      page: page ? parseInt(page as string, 10) : 1,
      limit: limit ? parseInt(limit as string, 10) : 10,
    };

    const result = await DataStore.getAllReports(filterOptions);
    res.json({
      success: true,
      data: result.reports,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error('[ReportController] getReports error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve reports' });
  }
};

export const getReportById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const report = await DataStore.getReportById(id);

    if (!report) {
      res.status(404).json({ success: false, message: 'Report not found' });
      return;
    }

    res.json({ success: true, data: report });
  } catch (error) {
    console.error('[ReportController] getReportById error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch report details' });
  }
};

export const createReport = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const parseResult = ReportCreateSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: parseResult.error.issues.map((e: any) => `${e.path.join('.')}: ${e.message}`),
      });
      return;
    }

    const created = await DataStore.createReport(parseResult.data as any);
    res.status(201).json({
      success: true,
      message: `Report ${created.reportNumber} created successfully.`,
      data: created,
    });
  } catch (error) {
    console.error('[ReportController] createReport error:', error);
    res.status(500).json({ success: false, message: 'Failed to create report' });
  }
};

export const updateReport = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const parseResult = ReportUpdateSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: parseResult.error.issues.map((e: any) => `${e.path.join('.')}: ${e.message}`),
      });
      return;
    }

    const updated = await DataStore.updateReport(id, parseResult.data as any);
    if (!updated) {
      res.status(404).json({ success: false, message: 'Report not found' });
      return;
    }

    res.json({
      success: true,
      message: `Report ${updated.reportNumber} updated successfully.`,
      data: updated,
    });
  } catch (error) {
    console.error('[ReportController] updateReport error:', error);
    res.status(500).json({ success: false, message: 'Failed to update report' });
  }
};

export const archiveReport = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const archived = await DataStore.archiveReport(id);
    if (!archived) {
      res.status(404).json({ success: false, message: 'Report not found' });
      return;
    }

    res.json({
      success: true,
      message: `Report ${archived.reportNumber} has been archived.`,
      data: archived,
    });
  } catch (error) {
    console.error('[ReportController] archiveReport error:', error);
    res.status(500).json({ success: false, message: 'Failed to archive report' });
  }
};

export const restoreReport = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const restored = await DataStore.restoreReport(id);
    if (!restored) {
      res.status(404).json({ success: false, message: 'Report not found' });
      return;
    }

    res.json({
      success: true,
      message: `Report ${restored.reportNumber} has been restored to active reports.`,
      data: restored,
    });
  } catch (error) {
    console.error('[ReportController] restoreReport error:', error);
    res.status(500).json({ success: false, message: 'Failed to restore report' });
  }
};

export const getCategories = async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const categories = await DataStore.getDistinctCategories();
    res.json({ success: true, data: categories });
  } catch (error) {
    console.error('[ReportController] getCategories error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch categories' });
  }
};

export const lookupPublicReport = async (req: any, res: Response): Promise<void> => {
  try {
    const { query } = req.query;
    if (!query || typeof query !== 'string' || query.trim().length < 3) {
      res.status(400).json({
        success: false,
        message: 'Please provide a valid Report Number or Reference (min 3 characters).',
      });
      return;
    }

    const cleanQuery = query.trim().toUpperCase();
    const all = await DataStore.getAllRawReports();
    const found = all.find(
      (r) =>
        !r.archived &&
        (r.reportNumber.toUpperCase() === cleanQuery ||
          (r.reference && r.reference.toUpperCase() === cleanQuery))
    );

    if (!found) {
      res.status(404).json({
        success: false,
        message: `No active verified report matches "${query.trim()}". Please verify your Report Number.`,
      });
      return;
    }

    res.json({
      success: true,
      message: 'Official report record verified.',
      data: {
        reportNumber: found.reportNumber,
        title: found.title,
        category: found.category,
        customer: found.customer || 'General Client / Internal',
        reportDate: found.reportDate,
        status: found.status,
        priority: found.priority,
        reference: found.reference,
        description: found.description,
        findings: found.findings,
        recommendations: found.recommendations,
        createdAt: found.createdAt,
        verified: true,
      },
    });
  } catch (error) {
    console.error('[ReportController] lookupPublicReport error:', error);
    res.status(500).json({ success: false, message: 'Failed to verify report' });
  }
};

