from datetime import datetime
from typing import List, Dict

import numpy as np
import pandas as pd
from prophet import Prophet


JOB_CATEGORIES = [
    "EV Technician",
    "Solar Installer",
    "Drone Operator",
    "Construction Worker",
    "Healthcare Aide",
]


def _generate_synthetic_history() -> pd.DataFrame:
    """Generate 24 months of synthetic monthly job posting data per category."""
    end = datetime.today().replace(day=1)
    start = (end.replace(year=end.year - 2))
    dates = pd.date_range(start=start, end=end, freq="MS")

    rows = []
    rng = np.random.default_rng(42)

    for job in JOB_CATEGORIES:
        base = {
            "EV Technician": 80,
            "Solar Installer": 70,
            "Drone Operator": 40,
            "Construction Worker": 90,
            "Healthcare Aide": 75,
        }[job]

        trend = {
            "EV Technician": 2.2,
            "Solar Installer": 2.0,
            "Drone Operator": 1.8,
            "Construction Worker": 0.5,
            "Healthcare Aide": 1.5,
        }[job]

        for i, d in enumerate(dates):
            seasonal = 10 * np.sin(2 * np.pi * (i % 12) / 12.0)
            noise = rng.normal(0, 5)
            y = max(5, base + trend * i + seasonal + noise)
            rows.append({"ds": d, "y": y, "job_title": job})

    return pd.DataFrame(rows)


def forecast_demand() -> List[Dict]:
    """Fit Prophet per job category and forecast 6 months."""
    history = _generate_synthetic_history()
    results: List[Dict] = []

    for job in JOB_CATEGORIES:
        df_job = history[history["job_title"] == job][["ds", "y"]].copy()
        model = Prophet(seasonality_mode="additive", yearly_seasonality=True)
        model.fit(df_job)

        future = model.make_future_dataframe(periods=6, freq="MS")
        forecast = model.predict(future)

        current_demand = float(forecast.iloc[-7]["yhat"])
        forecast_6mo = float(forecast.iloc[-1]["yhat"])
        pct_change = (forecast_6mo - current_demand) / max(current_demand, 1e-6) * 100

        results.append(
            {
                "job_title": job,
                "current_demand": round(current_demand, 1),
                "forecast_6mo": round(forecast_6mo, 1),
                "pct_change": round(pct_change, 1),
            }
        )

    return results
