import type { Response } from 'express';
import ExcelJS from 'exceljs';
import { jsPDF } from 'jspdf';
import type { AuthenticatedRequest } from '../middleware/auth.ts';
import { DataStore } from '../services/dataStore.ts';
import { filterReports } from '../services/analyticsService.ts';
import type { IReport, ReportPriority, ReportStatus } from '../models/types.ts';

export const exportExcel = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { search, status, category, priority, startDate, endDate, archived, reportId } = req.query;

    let reportsToExport: IReport[] = [];

    if (reportId && typeof reportId === 'string') {
      const single = await DataStore.getReportById(reportId);
      if (single) reportsToExport = [single];
    } else {
      const all = await DataStore.getAllRawReports();
      reportsToExport = filterReports(all, {
        search: typeof search === 'string' ? search : undefined,
        status: typeof status === 'string' && status !== 'ALL' ? status : undefined,
        category: typeof category === 'string' && category !== 'ALL' ? category : undefined,
        priority: typeof priority === 'string' && priority !== 'ALL' ? priority : undefined,
        startDate: typeof startDate === 'string' && startDate ? startDate : undefined,
        endDate: typeof endDate === 'string' && endDate ? endDate : undefined,
        archived: archived === 'true',
      });
    }

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Report Management System';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet('Reports Audit List', {
      views: [{ state: 'frozen', ySplit: 1 }],
      pageSetup: { orientation: 'landscape', fitToPage: true },
    });

    sheet.columns = [
      { header: 'Report #', key: 'reportNumber', width: 16 },
      { header: 'Title', key: 'title', width: 36 },
      { header: 'Category', key: 'category', width: 22 },
      { header: 'Date', key: 'reportDate', width: 14 },
      { header: 'Status', key: 'status', width: 14 },
      { header: 'Priority', key: 'priority', width: 14 },
      { header: 'Reference', key: 'reference', width: 18 },
      { header: 'Tags', key: 'tags', width: 24 },
      { header: 'Description', key: 'description', width: 45 },
      { header: 'Findings', key: 'findings', width: 40 },
      { header: 'Recommendations', key: 'recommendations', width: 40 },
      { header: 'Archived', key: 'archived', width: 10 },
      { header: 'Created At', key: 'createdAt', width: 20 },
    ];

    // Style Header Row
    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF0F172A' }, // Navy blue
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
    headerRow.height = 28;

    reportsToExport.forEach((r, idx) => {
      const row = sheet.addRow({
        reportNumber: r.reportNumber,
        title: r.title,
        category: r.category,
        reportDate: r.reportDate || (r.createdAt ? r.createdAt.substring(0, 10) : ''),
        status: r.status,
        priority: r.priority,
        reference: r.reference || 'N/A',
        tags: Array.isArray(r.tags) ? r.tags.join(', ') : '',
        description: r.description,
        findings: r.findings || '',
        recommendations: r.recommendations || '',
        archived: r.archived ? 'Yes' : 'No',
        createdAt: r.createdAt ? new Date(r.createdAt).toISOString().replace('T', ' ').substring(0, 19) : '',
      });

      row.alignment = { vertical: 'top', wrapText: true };
      row.height = 24;

      // Alternating row background
      if (idx % 2 === 1) {
        row.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF8FAFC' },
        };
      }
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="Reports_Export_${new Date().toISOString().substring(0, 10)}.xlsx"`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('[ExportController] exportExcel error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate Excel export' });
  }
};

export const exportPDF = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { reportId, search, status, category, priority, startDate, endDate, archived } = req.query;

    if (reportId && typeof reportId === 'string') {
      // Export single report detail in full layout
      const report = await DataStore.getReportById(reportId);
      if (!report) {
        res.status(404).json({ success: false, message: 'Report not found' });
        return;
      }

      const doc = new jsPDF({ unit: 'pt', format: 'letter' });
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 40;
      const contentWidth = pageWidth - margin * 2;

      // Header Banner
      doc.setFillColor(15, 23, 42); // Navy #0f172a
      doc.rect(0, 0, pageWidth, 75, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.text('GENERAL REPORT MANAGEMENT SYSTEM', margin, 35);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`Official Document Record | Generated: ${new Date().toUTCString()}`, margin, 55);

      // Report Header Block
      let y = 105;
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text(report.reportNumber, margin, y);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(`Status: ${report.status.toUpperCase()}   |   Priority: ${report.priority.toUpperCase()}`, margin + 180, y);

      y += 18;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(30, 41, 59);
      doc.text(report.title, margin, y, { maxWidth: contentWidth });

      y += 28;
      doc.setDrawColor(226, 232, 240);
      doc.line(margin, y, pageWidth - margin, y);
      y += 20;

      // Metadata Key-Value Grid
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(71, 85, 105);
      doc.text('Category:', margin, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(15, 23, 42);
      doc.text(report.category, margin + 70, y);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(71, 85, 105);
      doc.text('Report Date:', margin + 250, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(15, 23, 42);
      doc.text(report.reportDate || 'N/A', margin + 330, y);

      y += 18;
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(71, 85, 105);
      doc.text('Reference:', margin, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(15, 23, 42);
      doc.text(report.reference || 'None provided', margin + 70, y);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(71, 85, 105);
      doc.text('Archived:', margin + 250, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(15, 23, 42);
      doc.text(report.archived ? 'Yes' : 'No', margin + 330, y);

      if (report.tags && report.tags.length > 0) {
        y += 18;
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(71, 85, 105);
        doc.text('Tags:', margin, y);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(15, 23, 42);
        doc.text(report.tags.join(', '), margin + 70, y, { maxWidth: contentWidth - 70 });
      }

      y += 28;

      // Section helper
      const renderSection = (title: string, content: string) => {
        if (!content) return;
        if (y > 680) {
          doc.addPage();
          y = 50;
        }
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(15, 23, 42);
        doc.text(title.toUpperCase(), margin, y);
        y += 6;
        doc.setDrawColor(203, 213, 225);
        doc.line(margin, y, pageWidth - margin, y);
        y += 16;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(51, 65, 85);
        const splitText = doc.splitTextToSize(content, contentWidth);
        doc.text(splitText, margin, y);
        y += splitText.length * 14 + 18;
      };

      renderSection('Executive Description & Background', report.description);
      renderSection('Key Findings & Observed Data', report.findings);
      renderSection('Strategic Recommendations & Action Items', report.recommendations);

      // Footer
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(`Report Management System - Confidential Document - Page ${i} of ${totalPages}`, margin, 760);
      }

      const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${report.reportNumber}.pdf"`);
      res.send(pdfBuffer);
      return;
    }

    // Export Filtered List Summary PDF
    const all = await DataStore.getAllRawReports();
    const reports = filterReports(all, {
      search: typeof search === 'string' ? search : undefined,
      status: typeof status === 'string' && status !== 'ALL' ? status : undefined,
      category: typeof category === 'string' && category !== 'ALL' ? category : undefined,
      priority: typeof priority === 'string' && priority !== 'ALL' ? priority : undefined,
      startDate: typeof startDate === 'string' && startDate ? startDate : undefined,
      endDate: typeof endDate === 'string' && endDate ? endDate : undefined,
      archived: archived === 'true',
    });

    const doc = new jsPDF({ unit: 'pt', format: 'letter' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 40;
    const contentWidth = pageWidth - margin * 2;

    // Header
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, pageWidth, 75, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('REPORT AUDIT & SUMMARY COMPILATION', margin, 35);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Total Records: ${reports.length}   |   Export Date: ${new Date().toLocaleDateString()}`, margin, 55);

    let y = 100;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('NO.', margin, y);
    doc.text('NUMBER', margin + 30, y);
    doc.text('TITLE & CATEGORY', margin + 120, y);
    doc.text('DATE', margin + 320, y);
    doc.text('STATUS', margin + 390, y);
    doc.text('PRIORITY', margin + 460, y);

    y += 8;
    doc.setDrawColor(203, 213, 225);
    doc.line(margin, y, pageWidth - margin, y);
    y += 16;

    reports.forEach((r, idx) => {
      if (y > 720) {
        doc.addPage();
        y = 50;
      }

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(9);

      doc.text(String(idx + 1), margin, y);
      doc.setFont('helvetica', 'bold');
      doc.text(r.reportNumber, margin + 30, y);
      doc.setFont('helvetica', 'normal');

      // Title & category
      const titleTrunc = r.title.length > 32 ? r.title.substring(0, 30) + '...' : r.title;
      doc.text(titleTrunc, margin + 120, y);
      doc.setTextColor(100, 116, 139);
      doc.setFontSize(8);
      doc.text(`(${r.category})`, margin + 120, y + 10);

      doc.setTextColor(15, 23, 42);
      doc.setFontSize(9);
      doc.text(r.reportDate || 'N/A', margin + 320, y);
      doc.text(r.status, margin + 390, y);
      doc.text(r.priority, margin + 460, y);

      y += 24;
      doc.setDrawColor(241, 245, 249);
      doc.line(margin, y - 6, pageWidth - margin, y - 6);
    });

    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(`Report Management System - Page ${i} of ${totalPages}`, margin, 760);
    }

    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Reports_Summary_${new Date().toISOString().substring(0, 10)}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('[ExportController] exportPDF error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate PDF export' });
  }
};
