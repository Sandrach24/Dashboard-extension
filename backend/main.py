import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from database import SessionLocal, engine, Base
from models import ValidationResult, ValidationResultSchema
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
from typing import List

# Crear todas las tablas
Base.metadata.create_all(bind=engine)

# Inicializar la aplicación FastAPI
app = FastAPI()

# Configuración de CORS
origins = [
    "http://localhost",
    "http://127.0.0.1:8000",
    "chrome-extension://bfbjilkhphegcbnheikpnojianlbkdak"  # ID de tu extensión de Chrome
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependencia de base de datos
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/check-phishing")
def check_phishing(data: dict):
    # Simulación de verificación de phishing
    is_phishing = "phishing" in data['text'].lower()  # Aquí deberías poner tu lógica real
    return {"isPhishing": is_phishing}

@app.post("/validate/")
def create_validation(field_name: str, validation_message: str, email_date: str, url: str, recipient: str, content: str, is_phishing: bool, db: Session = Depends(get_db)):
    db_validation = ValidationResult(
        field_name=field_name,
        validation_message=validation_message,
        email_date=email_date,
        url=url,
        recipient=recipient,
        content=content,
        is_phishing=is_phishing,
    )
    db.add(db_validation)
    db.commit()
    db.refresh(db_validation)
    return db_validation

@app.get("/validations/", response_model=List[ValidationResultSchema])
def read_validations(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    validations = db.query(ValidationResult).offset(skip).limit(limit).all()
    return validations

@app.get("/api/dashboard")
def get_dashboard_data(db: Session = Depends(get_db)):
    # Aquí puedes ajustar la lógica para obtener los datos del dashboard
    data = {
        "money": "$53,000",
        "users": 2300,
        "orders": 1400,
        "sales": "$23,000",
        "line_chart_data": {
            "labels": ["Page A", "Page B", "Page C", "Page D", "Page E", "Page F"],
            "datasets": [
                {
                    "label": "PV",
                    "data": [2400, 1398, 9800, 3908, 4800, 3800],
                    "fill": False,
                    "borderColor": "rgba(75,192,192,1)"
                },
                {
                    "label": "UV",
                    "data": [4000, 3000, 2000, 2780, 1890, 2390],
                    "fill": False,
                    "borderColor": "rgba(153,102,255,1)"
                }
            ]
        },
        "pie_chart_data": {
            "labels": ["Group A", "Group B", "Group C", "Group D", "Group E", "Group F"],
            "datasets": [
                {
                    "data": [300, 50, 100, 40, 120, 70],
                    "backgroundColor": ["#FF6384", "#36A2EB", "#FFCE56", "#FF6384", "#36A2EB", "#FFCE56"]
                }
            ]
        }
    }

    return data

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

