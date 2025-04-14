from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# Pydantic models for API
class ImageSchema(BaseModel):
    id: int
    filename: str
    upload_date: datetime
    
    class Config:
        orm_mode = True

class PodBase(BaseModel):
    name: str
    plant_type: str
    planting_date: str
    description: Optional[str] = None

class PodCreate(PodBase):
    pass

class Pod(PodBase):
    id: int
    created_at: datetime
    images: List[ImageSchema] = []
    
    class Config:
        orm_mode = True