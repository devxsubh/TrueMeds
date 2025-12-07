# Counterfeit Medicine Detection - Frontend Client

React-based frontend application for the Counterfeit Medicine Detection System.

## Features

- 🔐 **Authentication**: Sign up, sign in, and secure token management
- 🖼️ **Image Classification**: Upload medicine images and get authentic/counterfeit classification
- 💬 **RAG Chat**: AI-powered chat about medicines using RAG (Retrieval-Augmented Generation)
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🎨 **Modern UI**: Beautiful, intuitive interface

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env` file in the client directory:

```bash
VITE_API_URL=http://localhost:5000
```

### 3. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173` (or the port Vite assigns).

### 4. Build for Production

```bash
npm run build
```

## Project Structure

```
client/
├── src/
│   ├── components/          # Reusable components
│   │   ├── Navbar.jsx      # Navigation bar
│   │   ├── ProtectedRoute.jsx  # Route protection
│   │   ├── RAGChat.jsx     # RAG chat interface
│   │   └── UploadComponent.jsx  # Image upload component
│   ├── contexts/           # React contexts
│   │   └── AuthContext.jsx  # Authentication context
│   ├── pages/              # Page components
│   │   ├── Home.jsx        # Main dashboard
│   │   ├── Login.jsx       # Login page
│   │   └── Signup.jsx      # Signup page
│   ├── services/           # API services
│   │   └── api.js          # Axios API client
│   ├── App.jsx             # Main app component
│   └── main.jsx            # Entry point
├── package.json
└── vite.config.js
```

## API Integration

All API endpoints are integrated:

### Authentication
- `POST /api/v1/auth/signup` - User registration
- `POST /api/v1/auth/signin` - User login
- `POST /api/v1/auth/logout` - User logout
- `POST /api/v1/auth/refresh-tokens` - Refresh access token

### ML Service
- `GET /api/v1/ml/health` - Health check
- `POST /api/v1/ml/classify` - Classify medicine image

### RAG Service
- `POST /api/v1/rag/process-image` - Process image for RAG
- `POST /api/v1/rag/chat` - Chat with RAG about medicine
- `GET /api/v1/rag/context/:sessionId` - Get medicine context

### User Management
- `GET /api/v1/users/me` - Get current user profile
- `PATCH /api/v1/users/me` - Update profile
- `GET /api/v1/users` - Get all users
- `GET /api/v1/users/:userId` - Get user by ID
- `PATCH /api/v1/users/:userId` - Update user
- `DELETE /api/v1/users/:userId` - Delete user

### Image Management
- `POST /api/v1/images/upload` - Upload image

### Role Management
- `GET /api/v1/roles` - Get all roles
- `GET /api/v1/roles/:roleId` - Get role by ID
- `POST /api/v1/roles` - Create role
- `PATCH /api/v1/roles/:roleId` - Update role
- `DELETE /api/v1/roles/:roleId` - Delete role

## Usage

### 1. Authentication Flow

1. Navigate to `/signup` to create an account
2. Or navigate to `/login` to sign in
3. After authentication, you'll be redirected to the home page

### 2. Image Classification

1. Go to the "Classification" tab
2. Upload a medicine image (drag & drop or click to browse)
3. Click "Classify Image"
4. View the results with confidence scores

### 3. RAG Chat

1. Go to the "AI Chat (RAG)" tab
2. Upload a medicine image
3. Wait for processing (classification + OCR)
4. Ask questions about the medicine in the chat interface
5. Get AI-powered answers based on the extracted information

## Technologies

- **React 18** - UI library
- **React Router DOM** - Routing
- **Axios** - HTTP client
- **Vite** - Build tool
- **CSS3** - Styling

## Development

The app uses:
- React Context API for state management
- Axios interceptors for automatic token refresh
- Protected routes for authenticated pages
- Responsive CSS for mobile support

## Notes

- Tokens are stored in `localStorage`
- Automatic token refresh on 401 errors
- All API calls include authentication headers automatically
- Error handling with user-friendly messages

