import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculatePercentage,
  calculateGrowthRate,
  filterReports,
  computeAnalytics,
} from '../server/services/analyticsService.ts';
import { IReport } from '../server/models/types.ts';

test('calculatePercentage handles zero and positive numbers gracefully', () => {
  assert.equal(calculatePercentage(0, 0), 0);
  assert.equal(calculatePercentage(5, 0), 0);
  assert.equal(calculatePercentage(25, 100), 25);
  assert.equal(calculatePercentage(1, 3), 33.3);
});

test('calculateGrowthRate handles zero baselines and growth accurately', () => {
  assert.deepEqual(calculateGrowthRate(0, 0), { rate: 0, direction: 'unchanged' });
  assert.deepEqual(calculateGrowthRate(10, 0), { rate: null, direction: 'increase' });
  assert.deepEqual(calculateGrowthRate(15, 10), { rate: 50, direction: 'increase' });
  assert.deepEqual(calculateGrowthRate(8, 10), { rate: -20, direction: 'decrease' });
  assert.deepEqual(calculateGrowthRate(10, 10), { rate: 0, direction: 'unchanged' });
});

test('filterReports filters correctly by search, status, and category', () => {
  const sampleReports: IReport[] = [
    {
      _id: '1',
      reportNumber: 'RPT-2026-0001',
      title: 'Annual Security Audit',
      category: 'Security',
      reportDate: '2026-01-15',
      description: 'Audit of authentication protocols',
      findings: 'Strong compliance',
      recommendations: 'Continue monthly rotation',
      status: 'Completed',
      priority: 'High',
      tags: ['Security', 'Audit'],
      archived: false,
      createdAt: '2026-01-15T00:00:00.000Z',
      updatedAt: '2026-01-15T00:00:00.000Z',
    },
    {
      _id: '2',
      reportNumber: 'RPT-2026-0002',
      title: 'Q1 Financial Summary',
      category: 'Finance',
      reportDate: '2026-02-10',
      description: 'Q1 budget review',
      findings: 'Within budget limits',
      recommendations: 'Allocate Q2 surplus',
      status: 'Pending',
      priority: 'Medium',
      tags: ['Finance', 'Budget'],
      archived: false,
      createdAt: '2026-02-10T00:00:00.000Z',
      updatedAt: '2026-02-10T00:00:00.000Z',
    },
    {
      _id: '3',
      reportNumber: 'RPT-2025-0009',
      title: 'Historical Archive Review',
      category: 'Security',
      reportDate: '2025-05-01',
      description: 'Old decommissioned server report',
      findings: 'Archived',
      recommendations: 'None',
      status: 'Completed',
      priority: 'Low',
      tags: ['Old'],
      archived: true,
      createdAt: '2025-05-01T00:00:00.000Z',
      updatedAt: '2025-05-01T00:00:00.000Z',
    },
  ];

  // Active only
  const active = filterReports(sampleReports, { archived: false });
  assert.equal(active.length, 2);

  // Search keyword "Security"
  const securitySearch = filterReports(sampleReports, { search: 'Security', archived: false });
  assert.equal(securitySearch.length, 1);
  assert.equal(securitySearch[0].reportNumber, 'RPT-2026-0001');

  // Filter by status "Pending"
  const pending = filterReports(sampleReports, { status: 'Pending', archived: false });
  assert.equal(pending.length, 1);
  assert.equal(pending[0].reportNumber, 'RPT-2026-0002');

  // Filter archived
  const archived = filterReports(sampleReports, { archived: true });
  assert.equal(archived.length, 1);
  assert.equal(archived[0].reportNumber, 'RPT-2025-0009');
});

test('computeAnalytics produces verified breakdown metrics', () => {
  const sampleReports: IReport[] = [
    {
      _id: '1',
      reportNumber: 'RPT-2026-0001',
      title: 'A',
      category: 'Audit',
      reportDate: '2026-04-10',
      description: 'Audit desc',
      findings: '',
      recommendations: '',
      status: 'Completed',
      priority: 'High',
      tags: [],
      archived: false,
      createdAt: '2026-04-10T00:00:00.000Z',
      updatedAt: '2026-04-10T00:00:00.000Z',
    },
    {
      _id: '2',
      reportNumber: 'RPT-2026-0002',
      title: 'B',
      category: 'Audit',
      reportDate: '2026-04-12',
      description: 'Audit desc 2',
      findings: '',
      recommendations: '',
      status: 'Pending',
      priority: 'Low',
      tags: [],
      archived: false,
      createdAt: '2026-04-12T00:00:00.000Z',
      updatedAt: '2026-04-12T00:00:00.000Z',
    },
  ];

  const refDate = new Date('2026-04-15T12:00:00.000Z');
  const analytics = computeAnalytics(sampleReports, refDate);

  assert.equal(analytics.overview.totalActive, 2);
  assert.equal(analytics.overview.completedCount, 1);
  assert.equal(analytics.overview.pendingCount, 1);
  assert.equal(analytics.overview.completionRate, 50);
  assert.equal(analytics.overview.pendingWorkloadRate, 50);
  assert.equal(analytics.categoryDistribution[0].category, 'Audit');
  assert.equal(analytics.categoryDistribution[0].count, 2);
  assert.equal(analytics.categoryDistribution[0].percentage, 100);
});
