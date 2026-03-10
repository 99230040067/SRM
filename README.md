# EconoMind AI 🌱 – Predictive Employment & Economic Opportunity Platform

EconoMind AI is a demo web application for a hackathon that showcases:

- AI-powered **job demand forecasting** using Prophet
- **Opportunity heatmap** for South Indian cities
- **Skill gap analysis** and semantic **job matching**
- **Wage fairness detection** using a RandomForestRegressor
- **Micro‐gig generation**, **worker trust score**, and **voice job search**

The project is designed so a judge can understand the value in under 3 minutes.

## Project structure

- `backend/` – FastAPI app with ML models and synthetic data
- `frontend/` – React + Vite + Tailwind dashboard UI

## Prerequisites

- Python 3.10+
- Node.js 18+

## Backend setup

```bash
cd backend
py -3 -m pip install -r requirements.txt
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

This starts the FastAPI backend at `http://127.0.0.1:8000`.

### Implemented endpoints

- `GET /` – health check
- `GET /demand-forecast?city=Chennai` – Prophet-based demand forecast for 5 job categories
- `GET /jobs?city=Chennai&skill=electrician` – list of mock nearby jobs
- `POST /skill-gap` – sentence-transformer based skill gap analysis
- `POST /predict-wage` – RandomForest wage fairness estimator
- `POST /generate-gigs` – rule-based micro-gig decomposition
- `GET /trust-score?worker_id=1` – simulated worker trust score
- `GET /heatmap-data` – mock GeoJSON-like heatmap data

All ML models use **synthetic, India-specific data** and run locally (no external APIs).

## Frontend setup

```bash
cd frontend
npm install
npm run dev
```

This starts the React/Tailwind dashboard at `http://127.0.0.1:5173`.

The frontend expects the backend to be running at `http://127.0.0.1:8000`. CORS is enabled on the API.

## Demo script for judges

1. **Registration** – on first load, register as Ravi (Name=Ravi, Skills=Electrician, City=Chennai). You’ll see “Hi Ravi from Chennai 👋”.
2. **Demand Forecast** – the Job Demand panel animates in. Call out the EV Technician demand spike and the alert card.
3. **Heatmap** – switch to Opportunity Map. Click on Chennai and nearby cities to see colour-coded opportunity scores and top jobs.
4. **Skill Gap** – open Skill Gap Analyzer, select skills and EV Technician. Show the “You are 70% qualified” style card and missing skills list.
5. **Smart Job Matching** – go to Smart Jobs. Show ranked job cards and click one to open the Wage Fairness insight on the right.
6. **Wage Fairness** – open the dedicated Wage Fairness module, enter a low offer and highlight the red underpayment warning vs. market.
7. **Voice Search** – go to Voice Search, tap the mic, say “Find electrician jobs near me” (if supported). The app routes you to Jobs filtered for electrician.
8. **Trust Score** – show the circular trust gauge spinning to a high score with badges like “On-time ✅” and “Top Rated ⭐”.

## Notes on data & auth

- All data is **synthetic** and tuned for realism for workers in Tamil Nadu / South India (₹ wages, local cities, typical green jobs).
- ML models (Prophet, sentence-transformers, scikit-learn) are fully functional and run locally.
- Authentication is intentionally simplified for the hackathon demo (mocked registration flow for Ravi). Firebase Auth can be plugged in later if desired.

## Customisation

- To tweak synthetic job and wage data, edit:
  - `backend/models/demand_forecast.py`
  - `backend/models/wage_predictor.py`
  - `backend/data/jobs.json`
- To adjust UI/UX, edit React components under `frontend/src/components/`.

