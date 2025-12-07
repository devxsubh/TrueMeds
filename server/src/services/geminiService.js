import { GoogleGenerativeAI } from '@google/generative-ai';
import config from '~/config/config';

// System prompt for medical compliance
const SYSTEM_PROMPT = `You are a medical compliance assistant analyzing medicine packaging images. 

Your role:
- Analyze the packaging visually
- Describe visible features, text, and design elements
- Compare visual features to authenticity standards
- Explain when something appears suspicious
- Answer user questions about the packaging clearly

IMPORTANT RESTRICTIONS:
- DO NOT give medical dosage advice
- DO NOT claim safety of consuming the product
- DO NOT diagnose medical conditions
- DO NOT provide treatment recommendations

Use only information from the image and the authenticity model results provided.`;

// Rate limiting configuration
// Gemini free tier: 15 requests per minute
const RATE_LIMIT_RPM = 12; // Conservative limit: 12 requests per minute
const MIN_REQUEST_INTERVAL = (60 * 1000) / RATE_LIMIT_RPM; // ~5 seconds between requests

// Request queue and rate limiting
const requestQueue = [];
let isProcessing = false;
let lastRequestTime = 0;

// Initialize Gemini
let genAI = null;
if (config.GEMINI_API_KEY) {
	try {
		genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY);
		console.log('✅ Gemini Vision API initialized');
		console.log(`📊 Rate limit: ${RATE_LIMIT_RPM} requests per minute (~${Math.round(MIN_REQUEST_INTERVAL / 1000)}s between requests)`);
	} catch (error) {
		console.error('❌ Failed to initialize Gemini:', error.message);
	}
} else {
	console.warn('⚠️  GEMINI_API_KEY not found. Chat functionality will be disabled.');
}

// Model names to try in order of preference (with vision support)
const MODEL_NAMES = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-pro'];

/**
 * Wait for rate limit window
 */
const waitForRateLimit = async () => {
	const now = Date.now();
	const timeSinceLastRequest = now - lastRequestTime;
	
	if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
		const waitTime = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
		await new Promise(resolve => setTimeout(resolve, waitTime));
	}
	
	lastRequestTime = Date.now();
};

/**
 * Process queued requests one at a time
 */
const processQueue = async () => {
	if (isProcessing || requestQueue.length === 0) {
		return;
	}

	isProcessing = true;

	while (requestQueue.length > 0) {
		const { resolve, reject, fn } = requestQueue.shift();
		
		try {
			// Wait for rate limit
			await waitForRateLimit();
			
			// Execute the function
			const result = await fn();
			resolve(result);
		} catch (error) {
			reject(error);
		}
	}

	isProcessing = false;
};

/**
 * Queue a request to ensure rate limiting
 */
const queueRequest = (fn) => {
	return new Promise((resolve, reject) => {
		requestQueue.push({ resolve, reject, fn });
		processQueue();
	});
};

/**
 * Generate content with Gemini using model fallback strategy
 * @param {string} prompt - Text prompt
 * @param {Object} imageData - Image data {buffer, mimeType} (optional)
 * @returns {Promise<string>} Gemini's reply
 */
const generateWithGemini = async (prompt, imageData = null) => {
	if (!genAI) {
		throw new Error('Gemini API is not configured. Please set GEMINI_API_KEY environment variable.');
	}

	// Try different model names in order of preference
	for (const modelName of MODEL_NAMES) {
		try {
			const model = genAI.getGenerativeModel({
				model: modelName,
				systemInstruction: SYSTEM_PROMPT
			});

			// Prepare content array
			const content = [prompt];
			
			// Add image if provided
			if (imageData) {
				content.push({
					inlineData: {
						data: imageData.buffer.toString('base64'),
						mimeType: imageData.mimeType
					}
				});
			}

			const result = await model.generateContent(content);
			const response = await result.response;
			return response.text();
		} catch (error) {
			console.warn(`Gemini model ${modelName} failed:`, error.message);
			// Continue to next model if this one fails
			continue;
		}
	}

	// If all models fail, throw error
	throw new Error('All Gemini models failed. Please check your API key and quota limits.');
};

/**
 * Chat with Gemini Vision about an image
 * @param {Buffer} imageBuffer - Image buffer
 * @param {string} message - User message
 * @param {Object} authenticity - Authenticity model results
 * @param {string} mimeType - Image MIME type (default: 'image/jpeg')
 * @returns {Promise<string>} Gemini's reply
 */
export const chatWithImage = async (imageBuffer, message, authenticity, mimeType = 'image/jpeg') => {
	if (!genAI) {
		throw new Error('Gemini API is not configured. Please set GEMINI_API_KEY environment variable.');
	}

	// Prepare prompt with authenticity info
	const authenticityInfo = `AuthenticityModel: ${JSON.stringify(authenticity)}`;
	const fullPrompt = `${authenticityInfo}\n\nUser question: ${message}`;

	// Queue the request to ensure rate limiting
	try {
		const reply = await queueRequest(async () => {
			return await generateWithGemini(fullPrompt, {
				buffer: imageBuffer,
				mimeType: mimeType
			});
		});
		
		return reply;
	} catch (error) {
		console.error('Gemini API Error:', error);
		
		// Extract error message
		let errorMessage = error.message || 'Unknown error';
		
		// Handle specific error types
		if (errorMessage.includes('429') || errorMessage.includes('rate limit') || errorMessage.includes('Too Many Requests') || errorMessage.includes('quota')) {
			errorMessage = 'Rate limit exceeded. Please wait a moment and try again.';
		} else if (errorMessage.includes('not found') || errorMessage.includes('404')) {
			errorMessage = 'Model not found. Please check your API configuration.';
		} else if (errorMessage.includes('500') || errorMessage.includes('503')) {
			errorMessage = 'Gemini API server error. Please try again later.';
		} else if (errorMessage.includes('400')) {
			errorMessage = 'Invalid request. Please check your input.';
		} else if (errorMessage.includes('401') || errorMessage.includes('403')) {
			errorMessage = 'Authentication failed. Please check your API key.';
		}
		
		throw new Error(`Failed to get response from Gemini: ${errorMessage}`);
	}
};

/**
 * Check if Gemini is configured
 * @returns {boolean}
 */
export const isGeminiConfigured = () => {
	return genAI !== null;
};

/**
 * List available Gemini models (for debugging)
 * @returns {Promise<Array>}
 */
export const listAvailableModels = async () => {
	if (!genAI) {
		throw new Error('Gemini API is not configured');
	}
	try {
		const models = await genAI.listModels();
		return models.map(m => ({
			name: m.name,
			displayName: m.displayName,
			supportedGenerationMethods: m.supportedGenerationMethods
		}));
	} catch (error) {
		console.error('Failed to list models:', error);
		throw error;
	}
};

export default {
	chatWithImage,
	isGeminiConfigured,
	listAvailableModels
};
