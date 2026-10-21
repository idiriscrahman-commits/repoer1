import test from 'node:test';
import assert from 'node:assert/strict';
import { LoginSchema } from '../server/validators/authValidator.ts';
import { ReportCreateSchema } from '../server/validators/reportValidator.ts';

test('LoginSchema validates correct and invalid login payloads', () => {
  const valid = LoginSchema.safeParse({
    email: 'admin@reportmanagement.internal',
    password: 'AdminPassword2026!',
  });
  assert.equal(valid.success, true);

  const invalidEmail = LoginSchema.safeParse({
    email: 'not-an-email',
    password: 'password123',
  });
  assert.equal(invalidEmail.success, false);

  const shortPassword = LoginSchema.safeParse({
    email: 'admin@test.com',
    password: '123',
  });
  assert.equal(shortPassword.success, false);
});

test('ReportCreateSchema validates and cleans report payload', () => {
  const payload = {
    title: 'Quarterly Infrastructure Risk Evaluation',
    category: 'Risk Management',
    reportDate: '2026-04-20',
    description: 'Detailed analysis of server redundancy and power backups.',
    findings: 'Found no single point of failure.',
    recommendations: 'Continue monthly drills.',
    status: 'In Progress',
    priority: 'High',
    tags: 'Infrastructure, Cloud, Risk',
  };

  const parsed = ReportCreateSchema.safeParse(payload);
  assert.equal(parsed.success, true);
  if (parsed.success) {
    assert.deepEqual(parsed.data.tags, ['Infrastructure', 'Cloud', 'Risk']);
    assert.equal(parsed.data.status, 'In Progress');
    assert.equal(parsed.data.priority, 'High');
  }
});
