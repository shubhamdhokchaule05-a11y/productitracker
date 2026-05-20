from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import bcrypt
import models
import schemas
from database import engine, get_db

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="ProductiTrack API")

# Password hashing setup
def get_password_hash(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
    except Exception:
        return False

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "ProductiTrack API is running!"}

# --- Users ---

@app.post("/users/", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    hashed_password = get_password_hash(user.password)
    new_user = models.User(email=user.email, hashed_password=hashed_password, name=user.name, role=user.role)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/login/", response_model=schemas.User)
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    # verify_password handles checking the plaintext password against the bcrypt hash
    if not db_user or not verify_password(user.password, db_user.hashed_password):
        # We also want to support users created with the old fake hash temporarily (optional),
        # but it's better to just enforce the new one.
        if db_user and db_user.hashed_password == user.password + "notreallyhashed":
            pass # Old temporary user - allow login
        else:
            raise HTTPException(status_code=400, detail="Incorrect email or password")
    return db_user

@app.put("/users/{user_id}", response_model=schemas.User)
def update_user(user_id: int, user: schemas.UserUpdate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    update_data = user.model_dump(exclude_unset=True)
    if "password" in update_data:
        update_data["hashed_password"] = get_password_hash(update_data["password"])
        del update_data["password"]
        
    for key, value in update_data.items():
        setattr(db_user, key, value)
        
    db.commit()
    db.refresh(db_user)
    return db_user

@app.get("/users/", response_model=list[schemas.User])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.User).offset(skip).limit(limit).all()

# --- Tasks ---

@app.get("/tasks/", response_model=list[schemas.Task])
def read_tasks(db: Session = Depends(get_db)):
    return db.query(models.Task).order_by(models.Task.id.desc()).all()

@app.post("/tasks/", response_model=schemas.Task)
def create_task(task: schemas.TaskCreate, db: Session = Depends(get_db)):
    # Using .model_dump() for pydantic v2 compatibility
    db_task = models.Task(**task.model_dump())
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

@app.put("/tasks/{task_id}", response_model=schemas.Task)
def update_task(task_id: int, task: schemas.TaskUpdate, db: Session = Depends(get_db)):
    db_task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    update_data = task.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_task, key, value)
        
    db.commit()
    db.refresh(db_task)
    return db_task

@app.delete("/tasks/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db)):
    db_task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(db_task)
    db.commit()
    return {"message": "Task deleted"}

# --- Attendance ---

@app.get("/attendance/", response_model=list[schemas.Attendance])
def read_attendance(db: Session = Depends(get_db)):
    return db.query(models.Attendance).order_by(models.Attendance.id.desc()).all()

@app.post("/attendance/", response_model=schemas.Attendance)
def create_attendance(att: schemas.AttendanceCreate, db: Session = Depends(get_db)):
    db_att = models.Attendance(**att.model_dump())
    db.add(db_att)
    db.commit()
    db.refresh(db_att)
    return db_att

@app.put("/attendance/{att_id}", response_model=schemas.Attendance)
def update_attendance(att_id: int, att: schemas.AttendanceUpdate, db: Session = Depends(get_db)):
    db_att = db.query(models.Attendance).filter(models.Attendance.id == att_id).first()
    if not db_att:
        raise HTTPException(status_code=404, detail="Attendance not found")
    
    update_data = att.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_att, key, value)
        
    db.commit()
    db.refresh(db_att)
    return db_att

@app.delete("/attendance/{att_id}")
def delete_attendance(att_id: int, db: Session = Depends(get_db)):
    db_att = db.query(models.Attendance).filter(models.Attendance.id == att_id).first()
    if not db_att:
        raise HTTPException(status_code=404, detail="Attendance not found")
    db.delete(db_att)
    db.commit()
    return {"message": "Attendance deleted"}
