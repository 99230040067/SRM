from typing import List, Dict

import json
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from models.demand_forecast import forecast_demand
from models.skill_matcher import analyze_skill_gap, match_jobs
from models.wage_predictor import predict_wage


BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"


class SkillGapRequest(BaseModel):
    worker_skills: List[str]
    job_title: str


class WageRequest(BaseModel):
    job_title: str
    city: str
    experience: int
    offered_wage: float


class GigRequest(BaseModel):
    project_title: str


app = FastAPI(title="EconoMind AI Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def load_jobs(city: str | None = None) -> List[Dict]:
    with (DATA_DIR / "jobs.json").open("r", encoding="utf-8") as f:
        jobs = json.load(f)
    if city:
        jobs = [j for j in jobs if j.get("location") == city]
    return jobs


@app.get("/demand-forecast")
def get_demand_forecast(city: str = "Chennai"):
    forecasts = forecast_demand()
    top_alert = max(forecasts, key=lambda f: f["pct_change"])
    return {"city": city, "forecasts": forecasts, "top_alert": top_alert}


@app.get("/jobs")
def get_jobs(city: str = "Chennai", skill: str | None = None):
    jobs = load_jobs(city)
    if skill:
        jobs = [j for j in jobs if skill.lower() in " ".join(j.get("skills_required", [])).lower()]
    return {"jobs": jobs}


@app.post("/skill-gap")
def post_skill_gap(payload: SkillGapRequest):
    result = analyze_skill_gap(payload.worker_skills, payload.job_title)
    return result


@app.post("/predict-wage")
def post_predict_wage(payload: WageRequest):
    jobs = load_jobs(payload.city)
    job = next((j for j in jobs if j["title"] == payload.job_title), jobs[0] if jobs else None)
    demand_score = job.get("demand_score", 0.7) if job else 0.7
    result = predict_wage(payload.job_title, payload.city, payload.experience, payload.offered_wage, demand_score)
    return result


@app.post("/generate-gigs")
def post_generate_gigs(payload: GigRequest):
    title = payload.project_title.lower()
    gigs: List[Dict] = []

    if "solar" in title:
        gigs = [
            {"title": "Site survey & sun path check", "duration_hours": 2, "pay_estimate": 400},
            {"title": "Panel mounting & wiring", "duration_hours": 4, "pay_estimate": 800},
            {"title": "Inverter & battery setup", "duration_hours": 3, "pay_estimate": 650},
            {"title": "Testing & commissioning", "duration_hours": 2, "pay_estimate": 450},
            {"title": "Customer walkthrough & safety briefing", "duration_hours": 1, "pay_estimate": 250},
        ]
    elif "ev" in title or "charging" in title:
        gigs = [
            {"title": "Site electrical assessment", "duration_hours": 2, "pay_estimate": 450},
            {"title": "Cabling & conduit work", "duration_hours": 3, "pay_estimate": 700},
            {"title": "Charger mounting & configuration", "duration_hours": 2, "pay_estimate": 500},
            {"title": "Testing with demo vehicle", "duration_hours": 1, "pay_estimate": 300},
        ]
    else:
        gigs = [
            {"title": "Requirement clarification call", "duration_hours": 1, "pay_estimate": 200},
            {"title": "Material & tool preparation", "duration_hours": 2, "pay_estimate": 350},
            {"title": "On-site execution", "duration_hours": 4, "pay_estimate": 900},
            {"title": "Quality checks & photos", "duration_hours": 1, "pay_estimate": 250},
        ]

    return {"project_title": payload.project_title, "gigs": gigs}


@app.get("/trust-score")
def get_trust_score(worker_id: int = 1):
    completion_rate = 0.94
    punctuality = 0.9
    feedback_avg = 4.6 / 5.0

    score = (completion_rate * 0.4 + punctuality * 0.3 + feedback_avg * 0.3) * 100
    score = round(score, 1)

    badges = ["On-time ✅", "Top Rated ⭐", "Trusted by local clients"]

    return {
        "worker_id": worker_id,
        "trust_score": score,
        "completion_rate": completion_rate,
        "punctuality": punctuality,
        "feedback_avg": feedback_avg,
        "badges": badges,
    }


@app.get("/heatmap-data")
def get_heatmap_data():
    cities = [
        {
            "name": "Chennai",
            "lat": 13.0827,
            "lng": 80.2707,
            "opportunity_score": 0.88,
            "top_jobs": ["EV Technician", "Solar Installer", "Healthcare Aide"],
        },
        {
            "name": "Coimbatore",
            "lat": 11.0168,
            "lng": 76.9558,
            "opportunity_score": 0.72,
            "top_jobs": ["Solar Installer", "Construction Worker", "EV Technician"],
        },
        {
            "name": "Madurai",
            "lat": 9.9252,
            "lng": 78.1198,
            "opportunity_score": 0.55,
            "top_jobs": ["Construction Worker", "Healthcare Aide", "Solar Installer"],
        },
        {
            "name": "Hyderabad",
            "lat": 17.385,
            "lng": 78.4867,
            "opportunity_score": 0.8,
            "top_jobs": ["Drone Operator", "EV Technician", "Healthcare Aide"],
        },
        {
            "name": "Bengaluru",
            "lat": 12.9716,
            "lng": 77.5946,
            "opportunity_score": 0.9,
            "top_jobs": ["EV Technician", "Drone Operator", "Solar Installer"],
        },
    ]
    return {"cities": cities}


@app.get("/")
def root():
    return {"message": "EconoMind AI backend is running"}

