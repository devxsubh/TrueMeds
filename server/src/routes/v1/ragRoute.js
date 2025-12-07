import { Router } from 'express';
import catchAsync from '~/utils/catchAsync';
import ragController from '~/controllers/ragController';
import uploadImageMemory from '~/middlewares/uploadImageMemory';
import authenticate from '~/middlewares/authenticate';

const router = Router();

// New endpoints - Upload image and get imageId
router.post('/upload-image', authenticate(), uploadImageMemory, catchAsync(ragController.uploadImage));

// Chat with Gemini Vision about the uploaded image
router.post('/chat', authenticate(), catchAsync(ragController.chat));

// Legacy endpoints for backward compatibility
router.post('/process-image', authenticate(), uploadImageMemory, catchAsync(ragController.processMedicineImage));
router.post('/chat-legacy', authenticate(), catchAsync(ragController.chatAboutMedicine));

export default router;

