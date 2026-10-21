import { Router } from 'express';
import { exportExcel, exportPDF } from '../controllers/exportController.ts';
import { requireAuth } from '../middleware/auth.ts';

const router = Router();

// Export endpoints require admin authentication
router.use(requireAuth);

router.get('/excel', exportExcel);
router.get('/pdf', exportPDF);

export default router;
