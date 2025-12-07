import { Router } from 'express';
import catchAsync from '~/utils/catchAsync';
import mlController from '~/controllers/mlController';
import uploadImageMemory from '~/middlewares/uploadImageMemory';
import authenticate from '~/middlewares/authenticate';

const router = Router();

// Health check endpoint (no auth required)
router.get('/health', catchAsync(mlController.checkHealth));

// Classify image endpoint (auth optional - can be enabled by uncommenting authenticate())
router.post('/classify', uploadImageMemory, catchAsync(mlController.classifyImage));
// To enable authentication, use: router.post('/classify', authenticate(), uploadImageMemory, catchAsync(mlController.classifyImage));

export default router;

