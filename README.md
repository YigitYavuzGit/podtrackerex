## Plant Pod Tracker

This repository contains the backend and frontend code for the case study: "Evolving Plant Pod Tracker".

### 1) Design Choices

Database Schema  
The database is made up of two tables: "Pods" and Images". The "Pods" table contains information about each pod and the Images table stores the images linked for each pod. The Images table uses a foreign key that references the id of the matching pod in the "Pods" table. The one-to-many pod-to-image relationship is handled in this manner.

API Endpoints  
- POST /api/pods: Adds a new Pod. Accepts pod details and an optional initial image.
- POST /api/pods/{pod_id}/images: Adds a new image to an existing pod matched by "pod_id".
- GET /api/pods: Retrieves a list of all plant pods, including their basic details and associated image information.
- GET /api/pods/{pod_id}: Retrieves a specific pod.
- GET /api/uploads/{filename}: Serves the image files according to their filenames.

Image Storage and Access  
Uploaded images are stored on the server's filesystem with generated UUID's. The frontend can access the images from the "/api/uploads/{filename}" endpoint.

### 2) Backend Setup

Prerequisites (Python Packages/Libraries)  
- Python 3.9+
- FastAPI
- SQLAlchemy
- SQLite
- fastapi
- uvicorn
- sqlalchemy
- pydantic
- python-multipart
- aiofiles

Backend Execution  
The "server.py" file located in the /backend directory has to be executed with the following commands:
- cd backend
- python server.py

Database Initialization  
The Database is initialized when the server.py file is executed (Backend execution file)

### 3) Frontend Setup  

Prerequisites (npm Packages)
- react@19.1.0
- react-dom@19.1.0
- react-scripts@3.0.1
- web-vitals@2.1.4
- http-proxy-middleware@3.0.5

Frontend Execution  
The "App.js" file located in /frontend/client/src has to be excuted with the following commands:
- cd frontend/client
- npm start
