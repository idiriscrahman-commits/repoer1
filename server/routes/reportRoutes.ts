import { Router } from 'express';
import {
  getReports,
  getReportById,
  createReport,
  updateReport,
  archiveReport,
  restoreReport,
  getCategories,
  lookupPublicReport,
} from '../controllers/reportController.ts';
import { requireAuth } from '../middleware/auth.ts';

const router = Router();

// Public verification endpoint for customers/auditors
router.get('/public/lookup', lookupPublicReport);

// All subsequent report endpoints are strictly protected by Admin authentication
router.use(requireAuth);

router.get('/categories', getCategories);
router.get('/', getReports);
router.post('/', createReport);
router.get('/:id', getReportById);
router.put('/:id', updateReport);
router.patch('/:id/archive', archiveReport);
router.patch('/:id/restore', restoreReport);

export default router;
