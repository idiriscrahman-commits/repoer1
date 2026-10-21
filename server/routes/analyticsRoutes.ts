import { Router } from 'express';
import {
  getFullAnalytics,
  getOverview,
  getTrends,
  getCategories,
  getStatuses,
  getCompare,
} from '../controllers/analyticsController.ts';
import { requireAuth } from '../middleware/auth.ts';

const router = Router();

// Protected by Admin authentication
router.use(requireAuth);

router.get('/all', getFullAnalytics);
router.get('/overview', getOverview);
router.get('/trends', getTrends);
router.get('/categories', getCategories);
router.get('/statuses', getStatuses);
router.get('/compare', getCompare);

export default router;
