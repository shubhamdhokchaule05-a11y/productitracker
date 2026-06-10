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

import os

origins = [
    "http://localhost:5173",
    "http://localhost:3000",
]
allowed_origins_env = os.getenv("ALLOWED_ORIGINS")
if allowed_origins_env:
    origins = [origin.strip() for origin in allowed_origins_env.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, 
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
    new_user = models.User(
        email=user.email,
        hashed_password=hashed_password,
        name=user.name,
        role=user.role,
        phone=user.phone or "",
        department=user.department or "",
        location=user.location or ""
    )
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
def update_user(user_id: int, user: schemas.UserUpdate, db: Session = Depends(get_db), updater_id: int = None):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if the updater is admin
    is_admin = False
    if updater_id is not None:
        updater = db.query(models.User).filter(models.User.id == updater_id).first()
        if updater and updater.role == "Admin":
            is_admin = True
            
    update_data = user.model_dump(exclude_unset=True)
    
    # Restrict profile details updates to Admins only
    restricted_fields = ["email", "name", "role", "phone", "department", "location"]
    has_restricted_changes = any(field in update_data for field in restricted_fields)
    
    if has_restricted_changes and not is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only Admins can modify profile details. Members can only update their password."
        )
    
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

def send_reset_email(to_email: str, code: str):
    import os
    import smtplib
    from email.mime.text import MIMEText
    from email.mime.multipart import MIMEMultipart
    from dotenv import load_dotenv
    
    load_dotenv(override=True)
    smtp_server = os.getenv("BREVO_SMTP_SERVER", "smtp-relay.brevo.com")
    try:
        smtp_port = int(os.getenv("BREVO_SMTP_PORT", "587"))
    except ValueError:
        smtp_port = 587
        
    smtp_user = os.getenv("BREVO_SMTP_USER")
    smtp_key = os.getenv("BREVO_SMTP_KEY")
    sender = os.getenv("BREVO_SENDER")
    
    if not smtp_user or "your_brevo_verified_email" in smtp_user or not smtp_key or "your_brevo_smtp_master" in smtp_key or not sender:
        raise Exception("Brevo SMTP credentials are not configured in backend/.env file.")
        
    html = f"""<!DOCTYPE html>
<html>
<head>
  <style>
    body {{ font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; }}
    .container {{ max-width: 600px; margin: 30px auto; background-color: #ffffff; padding: 40px; border-radius: 16px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0; }}
    .logo {{ text-align: center; margin-bottom: 30px; }}
    .logo-box {{ display: inline-block; background: linear-gradient(135deg, #6366f1, #a855f7); color: #ffffff; padding: 12px 16px; border-radius: 12px; font-weight: bold; font-size: 20px; text-decoration: none; }}
    .heading {{ font-size: 22px; font-weight: bold; color: #1e293b; text-align: center; margin-bottom: 20px; }}
    .body-text {{ font-size: 15px; color: #475569; line-height: 1.6; margin-bottom: 30px; }}
    .code-container {{ text-align: center; margin: 30px 0; }}
    .code {{ display: inline-block; font-size: 32px; font-weight: bold; color: #4f46e5; background-color: #f5f3ff; border: 2px dashed #c084fc; padding: 12px 24px; border-radius: 12px; letter-spacing: 4px; }}
    .footer {{ font-size: 12px; color: #94a3b8; text-align: center; border-top: 1px solid #f1f5f9; padding-top: 20px; margin-top: 30px; }}
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">
      <span class="logo-box">ProductiTrack</span>
    </div>
    <h1 class="heading">Reset Your Password</h1>
    <p class="body-text">We received a request to reset the password for your ProductiTrack account. Please use the verification code below to verify your identity. This code is valid for 10 minutes.</p>
    <div class="code-container">
      <span class="code">{code}</span>
    </div>
    <p class="body-text" style="font-size: 13px; color: #94a3b8;">If you did not request a password reset, you can safely ignore this email.</p>
    <div class="footer">
      © 2026 ProductiTrack · Secure Workspace Analytics
    </div>
  </div>
</body>
</html>"""

    # Create MIMEMultipart email message
    msg = MIMEMultipart("alternative")
    msg["Subject"] = "ProductiTrack Password Reset Verification"
    msg["From"] = sender
    msg["To"] = to_email
    
    # Attach HTML body
    msg.attach(MIMEText(html, "html"))
    
    # Connect and send
    with smtplib.SMTP(smtp_server, smtp_port) as server:
        server.starttls()
        server.login(smtp_user, smtp_key)
        server.sendmail(sender, [to_email], msg.as_string())
        
    print(f"Brevo SMTP: Reset email successfully sent to {to_email}")

@app.post("/forgot-password/")
def forgot_password(req: schemas.ForgotPasswordRequest, db: Session = Depends(get_db)):
    import random
    import datetime
    db_user = db.query(models.User).filter(models.User.email == req.email).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="Email not registered")
        
    # Generate random 6-digit code
    code = f"{random.randint(100000, 999999)}"
    expires_at = (datetime.datetime.now() + datetime.timedelta(minutes=10)).isoformat()
    
    # Try sending the real email first using Brevo SMTP
    email_sent = True
    try:
        send_reset_email(db_user.email, code)
    except Exception as e:
        # Fallback for local testing: print the OTP to backend terminal console
        print("\n" + "="*80)
        print(f"  [DEVELOPMENT FALLBACK] Email delivery failed for: {db_user.email}")
        print(f"  Reason: {str(e)}")
        print(f"  VERIFICATION CODE (OTP): {code}")
        print("="*80 + "\n")
        email_sent = False
        
    db_user.reset_code = code
    db_user.reset_code_expires_at = expires_at
    db.commit()
    
    if email_sent:
        return {"message": "Verification code has been sent directly to your email."}
    else:
        return {"message": f"Verification code generated. (Dev Fallback: Code printed to backend terminal since Brevo SMTP failed)."}

@app.post("/reset-password/")
def reset_password(req: schemas.ResetPasswordRequest, db: Session = Depends(get_db)):
    import datetime
    db_user = db.query(models.User).filter(models.User.email == req.email).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if not db_user.reset_code or db_user.reset_code != req.code:
        raise HTTPException(status_code=400, detail="Invalid verification code")
        
    # Verify expiration
    if db_user.reset_code_expires_at:
        expiry = datetime.datetime.fromisoformat(db_user.reset_code_expires_at)
        if datetime.datetime.now() > expiry:
            raise HTTPException(status_code=400, detail="Verification code has expired")
            
    # Hash new password
    db_user.hashed_password = get_password_hash(req.new_password)
    # Clear reset code
    db_user.reset_code = None
    db_user.reset_code_expires_at = None
    db.commit()
    
    return {"message": "Password reset successfully. You can now log in."}

# --- Tasks ---

@app.get("/tasks/", response_model=list[schemas.Task])
def read_tasks(user_id: int = None, db: Session = Depends(get_db)):
    query = db.query(models.Task)
    if user_id is not None:
        query = query.filter(models.Task.owner_id == user_id)
    return query.order_by(models.Task.id.desc()).all()

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
def read_attendance(user_id: int = None, db: Session = Depends(get_db)):
    query = db.query(models.Attendance)
    if user_id is not None:
        query = query.filter(models.Attendance.user_id == user_id)
    return query.order_by(models.Attendance.id.desc()).all()

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

# --- Leave Requests ---

@app.get("/leaves/", response_model=list[schemas.LeaveRequest])
def read_leaves(user_id: int = None, db: Session = Depends(get_db)):
    query = db.query(models.LeaveRequest)
    if user_id is not None:
        query = query.filter(models.LeaveRequest.user_id == user_id)
    return query.order_by(models.LeaveRequest.id.desc()).all()

@app.post("/leaves/", response_model=schemas.LeaveRequest)
def create_leave(leave: schemas.LeaveRequestCreate, db: Session = Depends(get_db)):
    import datetime
    db_leave = models.LeaveRequest(**leave.model_dump())
    if not db_leave.applied_on:
        db_leave.applied_on = datetime.date.today().isoformat()
    db_leave.status = "Pending"
    
    db.add(db_leave)
    db.commit()
    db.refresh(db_leave)
    
    # Notify all Admins
    admins = db.query(models.User).filter(models.User.role == "Admin").all()
    now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    applicant = db.query(models.User).filter(models.User.id == db_leave.user_id).first()
    applicant_name = applicant.name if applicant else "An employee"
    
    for admin in admins:
        admin_notification = models.Notification(
            title="New Leave Request",
            message=f"{applicant_name} has applied for {db_leave.leave_type} from {db_leave.start_date} to {db_leave.end_date}.",
            is_read=False,
            created_at=now_str,
            user_id=admin.id
        )
        db.add(admin_notification)
    db.commit()
    
    return db_leave

@app.put("/leaves/{leave_id}", response_model=schemas.LeaveRequest)
def update_leave(leave_id: int, leave_update: schemas.LeaveRequestUpdate, db: Session = Depends(get_db)):
    db_leave = db.query(models.LeaveRequest).filter(models.LeaveRequest.id == leave_id).first()
    if not db_leave:
        raise HTTPException(status_code=404, detail="Leave request not found")
    
    if leave_update.status:
        db_leave.status = leave_update.status
    if leave_update.admin_notes is not None:
        db_leave.admin_notes = leave_update.admin_notes
    
    db.commit()
    db.refresh(db_leave)
    
    # Notify the employee
    import datetime
    now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    title = f"Leave Request {db_leave.status}"
    message = f"Your leave request for {db_leave.start_date} to {db_leave.end_date} has been {db_leave.status.lower()}."
    if db_leave.admin_notes:
        message += f" Admin Note: {db_leave.admin_notes}"
        
    db_notification = models.Notification(
        title=title,
        message=message,
        is_read=False,
        created_at=now_str,
        user_id=db_leave.user_id
    )
    db.add(db_notification)
    db.commit()
    
    return db_leave

@app.delete("/leaves/{leave_id}")
def delete_leave(leave_id: int, db: Session = Depends(get_db)):
    db_leave = db.query(models.LeaveRequest).filter(models.LeaveRequest.id == leave_id).first()
    if not db_leave:
        raise HTTPException(status_code=404, detail="Leave request not found")
    db.delete(db_leave)
    db.commit()
    return {"message": "Leave request deleted"}

# --- Notifications ---

@app.get("/notifications/", response_model=list[schemas.Notification])
def read_notifications(user_id: int = None, db: Session = Depends(get_db)):
    query = db.query(models.Notification)
    if user_id is not None:
        query = query.filter(models.Notification.user_id == user_id)
    return query.order_by(models.Notification.id.desc()).all()

@app.put("/notifications/{notification_id}/read", response_model=schemas.Notification)
def mark_notification_read(notification_id: int, db: Session = Depends(get_db)):
    db_notif = db.query(models.Notification).filter(models.Notification.id == notification_id).first()
    if not db_notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    db_notif.is_read = True
    db.commit()
    db.refresh(db_notif)
    return db_notif

@app.put("/notifications/read-all")
def mark_all_notifications_read(user_id: int, db: Session = Depends(get_db)):
    db.query(models.Notification).filter(
        models.Notification.user_id == user_id, 
        models.Notification.is_read == False
    ).update({models.Notification.is_read: True}, synchronize_session=False)
    db.commit()
    return {"message": "All notifications marked as read"}

# --- App Usage Tracking ---

@app.post("/app-usage/", response_model=schemas.AppUsage)
def log_app_usage(app_log: schemas.AppUsageCreate, db: Session = Depends(get_db)):
    import datetime
    
    # Ensure date is populated
    date_str = app_log.date or datetime.date.today().isoformat()
    now_str = app_log.timestamp or datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    # Calculate productivity status if not explicitly set
    is_productive = app_log.is_productive
    if is_productive is None or is_productive is True:
        app_lower = app_log.app_name.lower()
        UNPRODUCTIVE_APPS = ["youtube", "spotify", "facebook", "twitter", "netflix", "games", "steam", "instagram", "tiktok"]
        if any(unprod in app_lower for unprod in UNPRODUCTIVE_APPS):
            is_productive = False
        else:
            is_productive = True

    # Find existing log for this user, app, and date (Upsert)
    existing_log = db.query(models.AppUsage).filter(
        models.AppUsage.user_id == app_log.user_id,
        models.AppUsage.app_name == app_log.app_name,
        models.AppUsage.date == date_str
    ).first()

    if existing_log:
        existing_log.active_duration += app_log.active_duration
        existing_log.window_title = app_log.window_title or existing_log.window_title
        existing_log.timestamp = now_str
        existing_log.is_productive = is_productive
        db.commit()
        db.refresh(existing_log)
        return existing_log
    else:
        new_log = models.AppUsage(
            user_id=app_log.user_id,
            app_name=app_log.app_name,
            window_title=app_log.window_title,
            active_duration=app_log.active_duration,
            is_productive=is_productive,
            timestamp=now_str,
            date=date_str
        )
        db.add(new_log)
        db.commit()
        db.refresh(new_log)
        return new_log

@app.get("/app-usage/", response_model=list[schemas.AppUsage])
def read_app_usages(
    user_id: int = None,
    date: str = None,
    start_date: str = None,
    end_date: str = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.AppUsage)
    if user_id is not None:
        query = query.filter(models.AppUsage.user_id == user_id)
    if date is not None:
        query = query.filter(models.AppUsage.date == date)
    if start_date is not None:
        query = query.filter(models.AppUsage.date >= start_date)
    if end_date is not None:
        query = query.filter(models.AppUsage.date <= end_date)
    
    return query.order_by(models.AppUsage.date.desc(), models.AppUsage.active_duration.desc()).all()

@app.get("/app-usage/summary/")
def get_app_usage_summary(
    user_id: int = None,
    date: str = None,
    start_date: str = None,
    end_date: str = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.AppUsage)
    if user_id is not None:
        query = query.filter(models.AppUsage.user_id == user_id)
    if date is not None:
        query = query.filter(models.AppUsage.date == date)
    if start_date is not None:
        query = query.filter(models.AppUsage.date >= start_date)
    if end_date is not None:
        query = query.filter(models.AppUsage.date <= end_date)
    
    logs = query.all()
    
    total_time = 0
    productive_time = 0
    unproductive_time = 0
    
    app_durations = {}
    app_productivity = {}
    
    # Timeline grouping
    timeline_data = {} # date -> {productive, unproductive}
    
    for log in logs:
        total_time += log.active_duration
        if log.is_productive:
            productive_time += log.active_duration
        else:
            unproductive_time += log.active_duration
            
        app_durations[log.app_name] = app_durations.get(log.app_name, 0) + log.active_duration
        app_productivity[log.app_name] = log.is_productive
        
        # Timeline
        d = log.date
        if d not in timeline_data:
            timeline_data[d] = {"productive": 0, "unproductive": 0}
        if log.is_productive:
            timeline_data[d]["productive"] += log.active_duration
        else:
            timeline_data[d]["unproductive"] += log.active_duration

    productivity_pct = 0.0
    if total_time > 0:
        productivity_pct = round((productive_time / total_time) * 100, 1)
        
    # Top applications
    sorted_apps = sorted(app_durations.items(), key=lambda x: x[1], reverse=True)
    top_apps = []
    for name, duration in sorted_apps[:10]:
        pct = round((duration / total_time) * 100, 1) if total_time > 0 else 0
        top_apps.append({
            "app_name": name,
            "duration": duration,
            "percentage": pct,
            "is_productive": app_productivity.get(name, True)
        })
        
    # Timeline formatting
    sorted_timeline = []
    for d in sorted(timeline_data.keys()):
        prod = timeline_data[d]["productive"]
        unprod = timeline_data[d]["unproductive"]
        tot = prod + unprod
        pct = round((prod / tot) * 100, 1) if tot > 0 else 0
        sorted_timeline.append({
            "date": d,
            "productive": prod,
            "unproductive": unprod,
            "productivity": pct
        })
        
    return {
        "total_tracked_time": total_time,
        "productive_time": productive_time,
        "unproductive_time": unproductive_time,
        "productivity_percentage": productivity_pct,
        "top_apps": top_apps,
        "timeline": sorted_timeline
    }

@app.delete("/app-usage/")
def delete_app_usages(
    user_id: int = None,
    date: str = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.AppUsage)
    if user_id is not None:
        query = query.filter(models.AppUsage.user_id == user_id)
    if date is not None:
        query = query.filter(models.AppUsage.date == date)
    
    deleted_count = query.delete(synchronize_session=False)
    db.commit()
    return {"message": f"Deleted {deleted_count} app usage records"}

