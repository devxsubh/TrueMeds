import httpStatus from 'http-status';
import APIError from '~/utils/apiError';
import axios from 'axios';
import config from '~/config/config';
import geminiService from '~/services/geminiService';
import { v4 as uuidv4 } from 'uuid';

// In-memory storage for image data (imageId -> {imageBuffer, authenticity, timestamp})
const imageStorage = new Map();

/**
 * Upload image: Run authenticity model and get imageId
 * Calls ML service for classification, stores image in memory for chat
 */
export const uploadImage = async (req, res) => {
	if (!req.file) {
		throw new APIError('Please provide an image file', httpStatus.BAD_REQUEST);
	}

	try {
		// Call ML service for classification only
		const FormData = require('form-data');
		const formData = new FormData();
		formData.append('file', req.file.buffer, {
			filename: req.file.originalname,
			contentType: req.file.mimetype
		});

		const mlResponse = await axios.post(`${config.ML_SERVICE_URL}/classify`, formData, {
			headers: formData.getHeaders(),
			timeout: 30000
		});

		// Extract classification results
		const authenticity = {
			result: mlResponse.data.label,
			confidence: mlResponse.data.confidence,
			probabilities: mlResponse.data.probabilities
		};

		// Generate unique imageId
		const imageId = uuidv4();

		// Store image buffer and metadata in memory
		imageStorage.set(imageId, {
			imageBuffer: req.file.buffer,
			authenticity,
			timestamp: new Date().toISOString(),
			mimetype: req.file.mimetype
		});

		// Clean up old images (older than 1 hour) to prevent memory leaks
		const oneHourAgo = Date.now() - 60 * 60 * 1000;
		for (const [id, data] of imageStorage.entries()) {
			if (new Date(data.timestamp).getTime() < oneHourAgo) {
				imageStorage.delete(id);
			}
		}

		return res.json({
			success: true,
			imageId,
			authenticity
		});
	} catch (error) {
		if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
			throw new APIError('ML service is unavailable', httpStatus.SERVICE_UNAVAILABLE);
		}
		throw new APIError(
			error.response?.data?.detail || error.message || 'Failed to upload image',
			error.response?.status || httpStatus.INTERNAL_SERVER_ERROR
		);
	}
};

/**
 * Chat with Gemini Vision about the uploaded image
 * Uses Gemini service directly in the server
 */
export const chat = async (req, res) => {
	const { imageId, message } = req.body;

	if (!message) {
		throw new APIError('Please provide a message', httpStatus.BAD_REQUEST);
	}

	if (!imageId) {
		throw new APIError('Please provide an imageId. Upload an image first.', httpStatus.BAD_REQUEST);
	}

	// Get image data from storage
	const imageData = imageStorage.get(imageId);
	if (!imageData) {
		throw new APIError('Image not found. Please upload an image first.', httpStatus.NOT_FOUND);
	}

	try {
		// Call Gemini service directly
		const reply = await geminiService.chatWithImage(
			imageData.imageBuffer,
			message,
			imageData.authenticity,
			imageData.mimetype
		);

		return res.json({
			success: true,
			data: {
				message,
				reply
			}
		});
	} catch (error) {
		console.error('Chat Error:', error);
		
		if (!geminiService.isGeminiConfigured()) {
			throw new APIError(
				'Gemini API is not configured. Please set GEMINI_API_KEY environment variable.',
				httpStatus.SERVICE_UNAVAILABLE
			);
		}
		
		throw new APIError(
			error.message || 'Failed to process message',
			httpStatus.INTERNAL_SERVER_ERROR
		);
	}
};

// Legacy endpoints for backward compatibility
export const processMedicineImage = async (req, res) => {
	// Redirect to new upload-image endpoint
	return uploadImage(req, res);
};

export const chatAboutMedicine = async (req, res) => {
	// Convert old format (question, sessionId) to new format (message, imageId)
	const { question, sessionId } = req.body;
	
	if (!question || !sessionId) {
		throw new APIError('Please provide both question and sessionId', httpStatus.BAD_REQUEST);
	}
	
	// For backward compatibility, treat sessionId as imageId
	req.body = { imageId: sessionId, message: question };
	return chat(req, res);
};

export default {
	uploadImage,
	chat,
	processMedicineImage, // Legacy
	chatAboutMedicine // Legacy
};

