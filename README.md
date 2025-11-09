# Counterfeit Medicine Detection

End-to-end machine learning project for detecting counterfeit medicines from images using deep learning. Includes a complete training pipeline, REST API service, and web frontend.

## Project Structure

```
fake-medicine-detector/
├── client/                      # React frontend (Vite)
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── pages/              # Page components
│   │   └── services/           # API client
│   └── package.json
├── server/                      # Node.js + Express backend
│   ├── src/
│   │   ├── routes/             # API routes
│   │   ├── controllers/        # Request handlers
│   │   ├── models/             # Data models
│   │   ├── services/           # Business logic
│   │   ├── uploads/            # Upload directory
│   │   └── index.js            # Entry point
│   └── package.json
├── ml_service/                 # ML training & inference
│   ├── main.ipynb              # Jupyter notebook (training + testing)
│   ├── model/                  # Model files
│   │   └── trained_model.pkl  # Exported model (optional)
│   ├── app.py                  # FastAPI microservice for inference
│   ├── utils.py                # Preprocessing utilities
│   ├── requirements.txt
│   └── test_images/            # Test images
├── data/
│   ├── raw/                    # Raw dataset
│   └── processed/              # Processed data
├── checkpoints/                # Saved model checkpoints
└── docker-compose.yml
```

## Features

- **Training Pipeline**: Jupyter notebook with complete ML workflow (data exploration, training, evaluation)
- **REST API**: FastAPI microservice for model inference
- **Web Frontend**: React application with image upload and classification UI
- **Backend API**: Express.js server that proxies requests to ML service
- **Docker Support**: Containerized services for easy deployment

## Quick Start

### With Docker (Recommended)

```bash
docker compose up --build
```

Services will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- ML Service: http://localhost:8000

### Manual Setup

#### 1. ML Service

```bash
cd ml_service
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

The ML service will run on http://localhost:8000

#### 2. Backend Server

```bash
cd server
npm install
ML_SERVICE_URL=http://localhost:8000 npm start
```

The server will run on http://localhost:5000

#### 3. Frontend Client

```bash
cd client
npm install
npm run dev
```

The frontend will run on http://localhost:3000

## Training the Model

1. Open `ml_service/main.ipynb` in Jupyter
2. Run all cells to:
   - Load and explore the dataset
   - Train a ResNet-18 classifier
   - Evaluate on test set
   - Save model checkpoint

The best model will be saved to `checkpoints/best_cls_resnet18.pt`

## Dataset

- **Source**: Roboflow Universe (Counterfeit_med_detection)
- **License**: CC BY 4.0
- **Format**: TensorFlow Object Detection CSVs
- **Splits**: `data/train/`, `data/valid/`, `data/test/`

Each CSV row contains: `filename,width,height,class,xmin,ymin,xmax,ymax`

## API Endpoints

### ML Service (FastAPI)

- `GET /health` - Service health check
- `POST /classify` - Classify uploaded image
  - Request: `multipart/form-data` with `file` field
  - Response: `{ label, confidence, probabilities }`

### Backend API (Express)

- `GET /api/health` - Check ML service health
- `POST /api/classify` - Proxy to ML service for classification

## Environment Variables

- `ML_SERVICE_URL` - ML service URL (default: http://localhost:8000)
- `PORT` - Server port (default: 5000)
- `VITE_API_URL` - Frontend API URL (default: http://localhost:5000)

## Requirements

- Python 3.10+
- Node.js 20+
- Docker & Docker Compose (optional)

## License

Dataset: CC BY 4.0 (Roboflow Universe)
Code: See repository license
