import multer from 'multer';
import path from 'path';
import APIError from '~/utils/apiError';
import httpStatus from 'http-status';

// Use memory storage for ML classification (we need to send buffer to ML service)
const storage = multer.memoryStorage();

const upload = multer({
	storage: storage,
	limits: {
		fileSize: 10 * 1024 * 1024 // 10MB limit for ML classification
	},
	fileFilter: (req, file, callback) => {
		const ext = path.extname(file.originalname).toLowerCase();
		const allowedExts = ['.png', '.jpg', '.gif', '.jpeg', '.webp'];
		if (!allowedExts.includes(ext)) {
			return callback(new APIError('File image unsupported. Allowed: png, jpg, jpeg, gif, webp', httpStatus.BAD_REQUEST));
		}
		callback(null, true);
	}
}).single('file');

const uploadImageMemory = (req, res, next) => {
	upload(req, res, (err) => {
		if (err instanceof multer.MulterError) {
			return next(new APIError(err.message, httpStatus.BAD_REQUEST));
		} else if (err) {
			return next(err);
		}
		return next();
	});
};

export default uploadImageMemory;

