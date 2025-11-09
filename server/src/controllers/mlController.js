import httpStatus from 'http-status';
import axios from 'axios';
import FormData from 'form-data';
import APIError from '~/utils/apiError';
import config from '~/config/config';

/**
 * Check ML service health
 */
export const checkHealth = async (req, res) => {
	try {
		const response = await axios.get(`${config.ML_SERVICE_URL}/health`, {
			timeout: 5000
		});
		return res.json(response.data);
	} catch (error) {
		if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
			throw new APIError('ML service is unavailable', httpStatus.SERVICE_UNAVAILABLE);
		}
		throw new APIError(
			error.response?.data?.detail || 'Failed to check ML service health',
			error.response?.status || httpStatus.INTERNAL_SERVER_ERROR
		);
	}
};

/**
 * Classify an image using ML service
 */
export const classifyImage = async (req, res) => {
	if (!req.file) {
		throw new APIError('Please provide an image file', httpStatus.BAD_REQUEST);
	}

	try {
		// Create form data to send to ML service
		const formData = new FormData();
		formData.append('file', req.file.buffer, {
			filename: req.file.originalname,
			contentType: req.file.mimetype
		});

		// Send request to ML service
		const response = await axios.post(`${config.ML_SERVICE_URL}/classify`, formData, {
			headers: {
				...formData.getHeaders()
			},
			timeout: 30000 // 30 seconds timeout for ML inference
		});

		return res.json({
			success: true,
			data: response.data
		});
	} catch (error) {
		if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
			throw new APIError('ML service is unavailable', httpStatus.SERVICE_UNAVAILABLE);
		}
		throw new APIError(
			error.response?.data?.detail || 'Failed to classify image',
			error.response?.status || httpStatus.INTERNAL_SERVER_ERROR
		);
	}
};

export default {
	checkHealth,
	classifyImage
};

