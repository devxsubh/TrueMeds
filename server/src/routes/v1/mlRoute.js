import { Router } from 'express';
import catchAsync from '~/utils/catchAsync';
import mlController from '~/controllers/mlController';
import uploadImageMemory from '~/middlewares/uploadImageMemory';
import authenticate from '~/middlewares/authenticate';

const router = Router();

// Health check endpoint (no auth required)
router.get('/health', catchAsync(mlController.checkHealth));

// Classify image endpoint (requires authentication)
router.post('/classify', authenticate(), uploadImageMemory, catchAsync(mlController.classifyImage));

export default router;

