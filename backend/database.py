from sqlalchemy import create_engine, Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime

# Database setup
DATABASE_URL = "sqlite:///./plant_pods.db"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Database models
class PodModel(Base):
    __tablename__ = "pods"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    plant_type = Column(String)
    planting_date = Column(String)
    description = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.now)
    
    # Relationship: one pod can have many images
    images = relationship("ImageModel", back_populates="pod", cascade="all, delete-orphan")

class ImageModel(Base):
    __tablename__ = "images"
    
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, unique=True, index=True)
    pod_id = Column(Integer, ForeignKey("pods.id"))
    upload_date = Column(DateTime, default=datetime.now)
    
    # Relationship: many images belong to one pod
    pod = relationship("PodModel", back_populates="images")

# Function to create all tables
def create_tables():
    Base.metadata.create_all(bind=engine)

# Database dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Initialize the database tables
if __name__ == "__main__":
    create_tables()
    print("Database tables created successfully!")