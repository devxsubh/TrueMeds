import Tesseract from 'tesseract.js';
import sharp from 'sharp';

/**
 * Extract text from medicine image using OCR
 * @param {Buffer} imageBuffer - Image buffer
 * @returns {Promise<string>} Extracted text
 */
export const extractTextFromImage = async (imageBuffer) => {
	try {
		// Preprocess image for better OCR results
		const processedImage = await sharp(imageBuffer)
			.greyscale() // Convert to grayscale
			.normalize() // Normalize contrast
			.sharpen() // Sharpen image
			.png() // Convert to PNG
			.toBuffer();

		// Perform OCR
		const { data: { text } } = await Tesseract.recognize(processedImage, 'eng', {
			logger: (m) => {
				// Optional: log OCR progress
				if (m.status === 'recognizing text') {
					console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
				}
			}
		});

		return text.trim();
	} catch (error) {
		console.error('OCR Error:', error);
		throw new Error(`Failed to extract text from image: ${error.message}`);
	}
};

/**
 * Extract structured information from OCR text
 * @param {string} ocrText - Raw OCR text
 * @returns {Object} Structured medicine information
 */
export const parseMedicineInfo = (ocrText) => {
	const info = {
		rawText: ocrText,
		medicineName: null,
		manufacturer: null,
		ingredients: null,
		dosage: null,
		expiryDate: null,
		batchNumber: null
	};

	// Simple pattern matching for common medicine label information
	const lines = ocrText.split('\n').map(line => line.trim()).filter(line => line.length > 0);

	// Try to extract medicine name (usually first few lines)
	if (lines.length > 0) {
		info.medicineName = lines[0] || null;
	}

	// Look for common patterns
	lines.forEach(line => {
		const lowerLine = line.toLowerCase();

		// Manufacturer
		if (lowerLine.includes('manufactured by') || lowerLine.includes('mfg by')) {
			info.manufacturer = line;
		}

		// Expiry date
		if (lowerLine.includes('exp') || lowerLine.includes('expiry') || lowerLine.includes('use before')) {
			info.expiryDate = line;
		}

		// Batch number
		if (lowerLine.includes('batch') || lowerLine.includes('lot')) {
			info.batchNumber = line;
		}

		// Dosage
		if (lowerLine.includes('mg') || lowerLine.includes('ml') || lowerLine.includes('dose')) {
			info.dosage = line;
		}

		// Ingredients
		if (lowerLine.includes('ingredients') || lowerLine.includes('composition')) {
			info.ingredients = line;
		}
	});

	return info;
};

export default {
	extractTextFromImage,
	parseMedicineInfo
};

