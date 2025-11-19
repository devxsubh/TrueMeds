# Counterfeit Medicine Detection System

A comprehensive end-to-end machine learning system for detecting counterfeit medicines from images using deep learning. This project includes a complete training pipeline, REST API services, and a modern web frontend for real-time medicine authentication.

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Features](#features)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Detailed Setup](#detailed-setup)
- [Training the Model](#training-the-model)
- [API Documentation](#api-documentation)
- [Configuration](#configuration)
- [Development](#development)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Dataset](#dataset)
- [License](#license)

## 🎯 Overview

This system uses **Transfer Learning** with a pre-trained ResNet-18 model to classify medicine images as either **Authentic** or **Counterfeit**. The solution is built with a microservices architecture, separating concerns into:

- **ML Service**: FastAPI-based inference service for model predictions
- **Backend API**: Express.js server handling authentication, user management, and ML service proxying
- **Frontend**: React application with Vite for fast development and production builds

### Use Cases

- Pharmaceutical quality control
- Supply chain verification
- Consumer protection tools
- Regulatory compliance checking

## 🏗️ Architecture

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   Client    │─────▶│   Server     │─────▶│ ML Service  │
│  (React)    │◀─────│  (Express)   │◀─────│  (FastAPI)  │
└─────────────┘      └──────────────┘      └─────────────┘
     Port 3000           Port 5000            Port 8000
```

**Data Flow:**
1. User uploads medicine image via React frontend
2. Frontend sends request to Express backend (with authentication)
3. Backend validates request and proxies to ML service
4. ML service processes image through ResNet-18 model
5. Prediction results flow back through the stack
6. User sees classification result (Authentic/Counterfeit) with confidence score

## ✨ Features

### Core Functionality
- **Image Classification**: Binary classification (Authentic vs Counterfeit) using ResNet-18
- **Real-time Inference**: Fast API responses with confidence scores and probability distributions
- **User Authentication**: JWT-based authentication system with role-based access control
- **Image Upload**: Secure file upload with validation and processing

### Technical Features
- **Transfer Learning**: Pre-trained ResNet-18 model fine-tuned on medicine dataset
- **RESTful APIs**: Well-structured API endpoints following REST principles
- **Microservices**: Decoupled services for scalability and maintainability
- **Docker Support**: Containerized deployment for easy setup
- **Error Handling**: Comprehensive error handling and validation
- **Logging**: Structured logging for debugging and monitoring

## 📁 Project Structure

```
AiMl/
├── client/                          # React frontend application
│   ├── src/
│   │   ├── components/             # Reusable React components
│   │   │   └── UploadComponent.jsx # Image upload component
│   │   ├── pages/                  # Page components
│   │   ├── services/               # API client services
│   │   │   └── api.js              # Axios API client
│   │   ├── App.jsx                 # Main app component
│   │   ├── main.jsx                # Entry point
│   │   └── index.css               # Global styles
│   ├── public/                     # Static assets
│   ├── index.html                  # HTML template
│   ├── vite.config.js              # Vite configuration
│   ├── package.json
│   └── Dockerfile                   # Docker configuration
│
├── server/                          # Express.js backend API
│   ├── src/
│   │   ├── config/                 # Configuration files
│   │   │   ├── config.js           # Environment config
│   │   │   ├── mongoose.js        # Database connection
│   │   │   ├── passport.js        # JWT authentication
│   │   │   └── logger.js          # Winston logger
│   │   ├── controllers/           # Request handlers
│   │   │   ├── authController.js  # Authentication logic
│   │   │   ├── mlController.js    # ML service integration
│   │   │   ├── userController.js  # User management
│   │   │   └── imageController.js # Image handling
│   │   ├── middlewares/           # Express middlewares
│   │   │   ├── authenticate.js    # JWT verification
│   │   │   ├── uploadImage.js     # File upload handling
│   │   │   └── validate.js       # Request validation
│   │   ├── models/                # Mongoose models
│   │   │   ├── userModel.js       # User schema
│   │   │   ├── roleModel.js       # Role schema
│   │   │   └── tokenModel.js      # Token schema
│   │   ├── routes/                # API routes
│   │   │   └── v1/
│   │   │       ├── authRoute.js  # Auth endpoints
│   │   │       ├── mlRoute.js    # ML endpoints
│   │   │       ├── userRoute.js   # User endpoints
│   │   │       └── index.js      # Route aggregator
│   │   ├── services/              # Business logic
│   │   │   ├── jwtService.js     # JWT utilities
│   │   │   └── tokenService.js   # Token management
│   │   ├── utils/                 # Utility functions
│   │   │   └── apiError.js       # Error handling
│   │   ├── validations/           # Validation schemas
│   │   │   └── authValidation.js # Request validation
│   │   ├── app.js                 # Express app setup
│   │   └── index.js               # Server entry point
│   ├── package.json
│   ├── ecosystem.config.js         # PM2 configuration
│   └── Dockerfile
│
├── ml_service/                     # ML training & inference service
│   ├── main.ipynb                 # Jupyter notebook (training)
│   ├── app.py                     # FastAPI inference service
│   ├── utils.py                   # Preprocessing utilities
│   ├── model/                      # Trained model files
│   │   └── best_cls_resnet18.pt   # ResNet-18 checkpoint
│   ├── requirements.txt            # Python dependencies
│   └── Dockerfile
│
├── data/                           # Dataset (gitignored)
│   ├── raw/                        # Original dataset
│   │   ├── train/                  # Training images (89M)
│   │   ├── valid/                  # Validation images (14M)
│   │   └── test/                   # Test images (6.8M)
│   └── processed/                  # Processed data (empty)
│
├── docker-compose.yml              # Docker Compose configuration
├── .gitignore                      # Git ignore rules
└── README.md                       # This file
```

## 📦 Prerequisites

### Required Software

- **Python 3.10+** - For ML service
- **Node.js 20+** - For backend and frontend
- **npm or yarn** - Package manager
- **MongoDB** - Database (or use MongoDB Atlas)
- **Git** - Version control

## 🚀 Quick Start

### Option 1: Docker (Recommended)

The fastest way to get started:

```bash
# Clone the repository
git clone <repository-url>
cd AiMl

# Start all services
docker compose up --build

# Services will be available at:
# - Frontend: http://localhost:3000
# - Backend API: http://localhost:5000
# - ML Service: http://localhost:8000
```

### Option 2: Manual Setup

See [Detailed Setup](#detailed-setup) section below.

## 🔧 Detailed Setup

### Step 1: Clone Repository

```bash
git clone <repository-url>
cd AiMl
```

### Step 2: ML Service Setup

```bash
cd ml_service

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# On macOS/Linux:
source .venv/bin/activate
# On Windows:
.venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Ensure model file exists
# The model should be at: ml_service/model/best_cls_resnet18.pt
# If not, train the model first (see Training section)

# Start the service
python app.py
```

The ML service will run on `http://localhost:8000`

**Verify it's working:**
```bash
curl http://localhost:8000/health
```

### Step 3: Backend Server Setup

```bash
cd server

# Install dependencies
npm install

# Create .env file (copy from .env.example if available)
# Or set environment variables:
export ML_SERVICE_URL=http://localhost:8000
export DATABASE_URI=mongodb://127.0.0.1:27017/aiml_db
export JWT_ACCESS_TOKEN_SECRET_PRIVATE=<your-secret>
export JWT_ACCESS_TOKEN_SECRET_PUBLIC=<your-public-key>

# Generate JWT keys (if needed)
ssh-keygen -t rsa -P "" -b 2048 -m PEM -f storage/jwtRS256.key
ssh-keygen -e -m PEM -f storage/jwtRS256.key > storage/jwtRS256.key.pub
cat storage/jwtRS256.key | base64  # Use this for JWT_ACCESS_TOKEN_SECRET_PRIVATE
cat storage/jwtRS256.key.pub | base64  # Use this for JWT_ACCESS_TOKEN_SECRET_PUBLIC

# Start MongoDB (if running locally)
# macOS: brew services start mongodb-community
# Linux: sudo systemctl start mongod
# Windows: net start MongoDB

# Start the server
npm start
# Or for development with hot reload:
npm run dev
```

The server will run on `http://localhost:5000` (or PORT from .env)

**Verify it's working:**
```bash
curl http://localhost:5000/api/v1/ml/health
```

### Step 4: Frontend Client Setup

```bash
cd client

# Install dependencies
npm install

# Create .env file (optional)
# VITE_API_URL=http://localhost:5000

# Start development server
npm run dev
```

The frontend will run on `http://localhost:3000`

### Step 5: Verify All Services

1. **ML Service**: http://localhost:8000/health
2. **Backend API**: http://localhost:5000/api/v1/ml/health
3. **Frontend**: http://localhost:3000

## 🎓 Training the Model

### Prerequisites

- Jupyter Notebook installed
- Dataset in `data/raw/` directory
- GPU recommended (but not required)

### Training Steps

1. **Open Jupyter Notebook:**
   ```bash
   cd ml_service
   jupyter notebook main.ipynb
   ```

2. **Run All Cells:**
   - The notebook will:
     - Load and explore the dataset from `data/raw/`
     - Create image-level labels from detection boxes
     - Set up data loaders with augmentation
     - Initialize ResNet-18 model
     - Train for 10 epochs (configurable)
     - Evaluate on test set
     - Save best model to `ml_service/model/best_cls_resnet18.pt`

3. **Model Checkpoint:**
   - Best model is saved based on validation accuracy
   - Location: `ml_service/model/best_cls_resnet18.pt`
   - Contains: model state, classes, and metadata

### Training Configuration

Edit the notebook to adjust:
- `EPOCHS`: Number of training epochs (default: 10)
- `BATCH_SIZE`: Batch size for training (default: 32)
- `LEARNING_RATE`: Optimizer learning rate (default: 0.001)
- `DATA_DIR`: Dataset directory path

### Expected Results

- Training accuracy: ~85-95%
- Validation accuracy: ~80-90%
- Test accuracy: ~75-85%

*Note: Results may vary based on dataset and training configuration*

## 📡 API Documentation

### ML Service (FastAPI) - Port 8000

#### Health Check

```http
GET /health
```

**Response:**
```json
{
  "ok": true,
  "classes": ["authentic", "counterfeit"],
  "checkpoint": "/path/to/model/best_cls_resnet18.pt"
}
```

#### Classify Image

```http
POST /classify
Content-Type: multipart/form-data
```

**Request:**
- Form data with `file` field containing image (JPG, PNG, etc.)

**Response:**
```json
{
  "label": "authentic",
  "confidence": 0.95,
  "probabilities": {
    "authentic": 0.95,
    "counterfeit": 0.05
  }
}
```

**Example (cURL):**
```bash
curl -X POST http://localhost:8000/classify \
  -F "file=@path/to/image.jpg"
```

### Backend API (Express) - Port 5000

All endpoints are prefixed with `/api/v1`

#### Authentication Endpoints

**Sign Up:**
```http
POST /api/v1/auth/signup
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe"
}
```

**Sign In:**
```http
POST /api/v1/auth/signin
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "tokens": {
    "access": {
      "token": "jwt_token_here",
      "expires": "2024-01-01T00:00:00.000Z"
    },
    "refresh": {
      "token": "refresh_token_here",
      "expires": "2024-01-02T00:00:00.000Z"
    }
  }
}
```

#### ML Endpoints

**Health Check:**
```http
GET /api/v1/ml/health
```

**Response:**
```json
{
  "ok": true,
  "classes": ["authentic", "counterfeit"],
  "checkpoint": "/path/to/model"
}
```

**Classify Image:**
```http
POST /api/v1/ml/classify
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data
```

**Request:**
- Header: `Authorization: Bearer <jwt_token>`
- Form data: `file` field with image

**Response:**
```json
{
  "success": true,
  "data": {
    "label": "authentic",
    "confidence": 0.95,
    "probabilities": {
      "authentic": 0.95,
      "counterfeit": 0.05
    }
  }
}
```

**Example (cURL):**
```bash
curl -X POST http://localhost:5000/api/v1/ml/classify \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@path/to/image.jpg"
```

#### User Management Endpoints

**Get All Users:**
```http
GET /api/v1/users
Authorization: Bearer <jwt_token>
```

**Get User by ID:**
```http
GET /api/v1/users/:userId
Authorization: Bearer <jwt_token>
```

**Update User:**
```http
PUT /api/v1/users/:userId
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Delete User:**
```http
DELETE /api/v1/users/:userId
Authorization: Bearer <jwt_token>
```

## ⚙️ Configuration

### Environment Variables

#### ML Service

No environment variables required (uses default paths)

#### Backend Server (.env file)

```bash
# Application
NODE_ENV=development
APP_NAME=Counterfeit Medicine Detection API
HOST=0.0.0.0
PORT=5000

# Database
DATABASE_URI=mongodb://127.0.0.1:27017/aiml_db

# JWT Authentication
JWT_ACCESS_TOKEN_SECRET_PRIVATE=<base64-encoded-private-key>
JWT_ACCESS_TOKEN_SECRET_PUBLIC=<base64-encoded-public-key>
JWT_ACCESS_TOKEN_EXPIRATION_MINUTES=240

# Token Expiration
REFRESH_TOKEN_EXPIRATION_DAYS=1
VERIFY_EMAIL_TOKEN_EXPIRATION_MINUTES=60
RESET_PASSWORD_TOKEN_EXPIRATION_MINUTES=30

# Email (Optional - for email verification)
SMTP_HOST=smtp.googlemail.com
SMTP_PORT=465
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=noreply@example.com

# URLs
FRONTEND_URL=http://localhost:3000
IMAGE_URL=http://localhost:5000/images

# ML Service
ML_SERVICE_URL=http://localhost:8000
```

#### Frontend Client (.env file)

```bash
VITE_API_URL=http://localhost:5000
```

### Docker Configuration

Edit `docker-compose.yml` to customize:
- Port mappings
- Volume mounts
- Environment variables
- Resource limits

## 💻 Development

### Development Workflow

1. **Start ML Service:**
   ```bash
   cd ml_service
   source .venv/bin/activate
   python app.py
   ```

2. **Start Backend (with hot reload):**
   ```bash
   cd server
   npm run dev
   ```

3. **Start Frontend (with hot reload):**
   ```bash
   cd client
   npm run dev
   ```

### Code Structure

- **Backend**: Follows MVC pattern with clear separation of concerns
- **Frontend**: Component-based React architecture
- **ML Service**: Simple FastAPI service with model loading

### Testing

```bash
# Backend tests (if available)
cd server
npm test

# Frontend tests (if available)
cd client
npm test
```

### Code Quality

```bash
# Backend linting
cd server
npm run lint

# Backend formatting
npm run format
```

## 🚢 Deployment

### Production Build

#### Backend

```bash
cd server
npm run build
npm run prod  # Uses PM2
```

#### Frontend

```bash
cd client
npm run build
# Output in client/dist/
```

### Docker Deployment

```bash
# Build and start all services
docker compose up -d --build

# View logs
docker compose logs -f

# Stop services
docker compose down
```

### Security Considerations

- Use HTTPS in production
- Store secrets in environment variables (never commit)
- Enable CORS only for trusted domains
- Use rate limiting (already configured)
- Validate all user inputs
- Keep dependencies updated

## 🐛 Troubleshooting

### Common Issues

#### ML Service Not Starting

**Problem:** Model file not found
```bash
Error: [Errno 2] No such file or directory: 'model/best_cls_resnet18.pt'
```

**Solution:**
- Train the model first (see Training section)
- Or download pre-trained model
- Check model path in `app.py`

#### Backend Can't Connect to ML Service

**Problem:** Connection refused error

**Solution:**
- Verify ML service is running: `curl http://localhost:8000/health`
- Check `ML_SERVICE_URL` in backend `.env`
- Ensure no firewall blocking port 8000

#### Database Connection Error

**Problem:** MongoDB connection failed

**Solution:**
- Verify MongoDB is running: `mongosh` or `mongo`
- Check `DATABASE_URI` in `.env`
- Ensure MongoDB is accessible from server

#### Frontend API Errors

**Problem:** CORS errors or 404s

**Solution:**
- Check `VITE_API_URL` in frontend `.env`
- Verify backend is running
- Check browser console for detailed errors

#### Port Already in Use

**Problem:** Port 3000, 5000, or 8000 already in use

**Solution:**
```bash
# Find process using port
lsof -i :8000  # macOS/Linux
netstat -ano | findstr :8000  # Windows

# Kill process or change port in configuration
```

### Getting Help

1. Check logs:
   - Backend: `server/logs/` or console output
   - ML Service: Console output
   - Docker: `docker compose logs`

2. Verify all services are running
3. Check environment variables
4. Review API documentation
5. Check GitHub issues (if applicable)

## 📊 Dataset

### Dataset Information

- **Source**: Roboflow Universe (Counterfeit_med_detection)
- **License**: CC BY 4.0
- **Format**: TensorFlow Object Detection format (CSV)
- **Size**: ~110MB total
  - Training: 89MB (1,367 images)
  - Validation: 14MB (123 images)
  - Test: 6.8MB (65 images)

### Dataset Structure

```
data/raw/
├── train/
│   ├── _annotations.csv    # Annotation file
│   └── *.jpg               # Training images
├── valid/
│   ├── _annotations.csv    # Annotation file
│   └── *.jpg               # Validation images
└── test/
    ├── _annotations.csv    # Annotation file
    └── *.jpg               # Test images
```

### CSV Format

Each row in `_annotations.csv` contains:
```
filename,width,height,class,xmin,ymin,xmax,ymax
```

- `filename`: Image filename
- `width`, `height`: Image dimensions
- `class`: Label (authentic/counterfeit)
- `xmin`, `ymin`, `xmax`, `ymax`: Bounding box coordinates

## 📄 License

- **Dataset**: CC BY 4.0 (Roboflow Universe)
- **Code**: See repository license file