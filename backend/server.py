from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import shutil
import uuid

# Import from our modules
from database import get_db, PodModel, ImageModel, create_tables
from schemas import Pod, PodCreate, ImageSchema

# Create a directory for image uploads if it doesn't exist
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Initialize FastAPI app
app = FastAPI(title="Plant Pod Tracker API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount uploads directory to serve images
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# API endpoints
@app.post("/api/pods", response_model=Pod)
async def create_pod(
    name: str = Form(...),
    plant_type: str = Form(...),
    planting_date: str = Form(...),
    description: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    # Create new pod record
    db_pod = PodModel(
        name=name,
        plant_type=plant_type,
        planting_date=planting_date,
        description=description
    )
    db.add(db_pod)
    db.commit()
    db.refresh(db_pod)
    
    # Handle optional initial image upload
    if image:
        # Generate unique filename
        file_extension = os.path.splitext(image.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)
        
        # Save the image file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)
        
        # Create image record in database
        db_image = ImageModel(filename=unique_filename, pod_id=db_pod.id)
        db.add(db_image)
        db.commit()
        db.refresh(db_pod)
    
    return db_pod

@app.get("/api/pods", response_model=List[Pod])
def get_all_pods(db: Session = Depends(get_db)):
    pods = db.query(PodModel).all()
    return pods

@app.get("/api/pods/{pod_id}", response_model=Pod)
def get_pod(pod_id: int, db: Session = Depends(get_db)):
    pod = db.query(PodModel).filter(PodModel.id == pod_id).first()
    if pod is None:
        raise HTTPException(status_code=404, detail="Pod not found")
    return pod

@app.post("/api/pods/{pod_id}/images", response_model=ImageSchema)
async def add_image_to_pod(
    pod_id: int,
    image: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # Check if pod exists
    pod = db.query(PodModel).filter(PodModel.id == pod_id).first()
    if pod is None:
        raise HTTPException(status_code=404, detail="Pod not found")
    
    # Generate unique filename
    file_extension = os.path.splitext(image.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    # Save the image file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(image.file, buffer)
    
    # Create image record in database
    db_image = ImageModel(filename=unique_filename, pod_id=pod_id)
    db.add(db_image)
    db.commit()
    db.refresh(db_image)
    
    return db_image

@app.get("/api/uploads/{filename}")
async def get_image(filename: str):
    file_path = os.path.join(UPLOAD_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Image not found")
    return FileResponse(file_path)

@app.delete("/api/pods/{pod_id}")
def delete_pod(pod_id: int, db: Session = Depends(get_db)):
    pod = db.query(PodModel).filter(PodModel.id == pod_id).first()
    if pod is None:
        raise HTTPException(status_code=404, detail="Pod not found")
    
    # Delete associated image files
    for image in pod.images:
        file_path = os.path.join(UPLOAD_DIR, image.filename)
        if os.path.exists(file_path):
            os.remove(file_path)
    
    # Delete pod record (cascade will delete image records)
    db.delete(pod)
    db.commit()
    
    return {"message": "Pod deleted successfully"}

@app.on_event("startup")
def startup_db_client():
    create_tables()
    print("Database initialized")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
