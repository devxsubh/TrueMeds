#!/bin/bash

# Script to start all three services
# Usage: ./start-all.sh

echo "🚀 Starting Counterfeit Medicine Detection System..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env files exist
if [ ! -f "server/.env" ]; then
    echo -e "${YELLOW}⚠️  Warning: server/.env not found${NC}"
    echo "Please create server/.env file (see SETUP.md)"
    exit 1
fi

if [ ! -f "client/.env" ]; then
    echo -e "${YELLOW}⚠️  Warning: client/.env not found${NC}"
    echo "Creating client/.env with defaults..."
    echo "VITE_API_URL=http://localhost:5000" > client/.env
fi

# Function to check if a port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        echo -e "${YELLOW}⚠️  Port $1 is already in use${NC}"
        return 1
    fi
    return 0
}

# Check ports
echo "Checking ports..."
check_port 8000 || exit 1
check_port 5000 || exit 1
check_port 3000 || exit 1

# Start ML Service
echo -e "${BLUE}📦 Starting ML Service (FastAPI)...${NC}"
cd ml_service
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi
source venv/bin/activate
pip install -q -r requirements.txt
python app.py &
ML_PID=$!
cd ..
echo -e "${GREEN}✅ ML Service started (PID: $ML_PID)${NC}"
sleep 3

# Start Backend Server
echo -e "${BLUE}📦 Starting Backend Server (Express)...${NC}"
cd server
npm install --silent > /dev/null 2>&1
npm run dev &
SERVER_PID=$!
cd ..
echo -e "${GREEN}✅ Backend Server started (PID: $SERVER_PID)${NC}"
sleep 5

# Start Frontend Client
echo -e "${BLUE}📦 Starting Frontend Client (React)...${NC}"
cd client
npm install --silent > /dev/null 2>&1
npm run dev &
CLIENT_PID=$!
cd ..
echo -e "${GREEN}✅ Frontend Client started (PID: $CLIENT_PID)${NC}"

echo ""
echo -e "${GREEN}🎉 All services started!${NC}"
echo ""
echo "Services:"
echo "  - ML Service:    http://localhost:8000"
echo "  - Backend API:   http://localhost:5000"
echo "  - Frontend:      http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for interrupt
trap "echo ''; echo 'Stopping all services...'; kill $ML_PID $SERVER_PID $CLIENT_PID 2>/dev/null; exit" INT
wait

