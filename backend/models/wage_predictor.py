from dataclasses import dataclass
from typing import Tuple, List

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline


CITIES = ["Chennai", "Coimbatore", "Madurai", "Hyderabad", "Bengaluru"]
JOB_CATS = ["EV Technician", "Solar Installer", "Drone Operator", "Construction Worker", "Healthcare Aide"]


@dataclass
class WageModel:
    pipeline: Pipeline


def _generate_synthetic_wages(n_rows: int = 500) -> pd.DataFrame:
    rng = np.random.default_rng(123)
    cities = rng.choice(CITIES, size=n_rows)
    job_cats = rng.choice(JOB_CATS, size=n_rows)
    experience = rng.integers(0, 15, size=n_rows)
    demand_score = rng.uniform(0.4, 0.95, size=n_rows)

    base_map = {
        "EV Technician": 800,
        "Solar Installer": 780,
        "Drone Operator": 900,
        "Construction Worker": 650,
        "Healthcare Aide": 700,
    }

    city_factor = {
        "Chennai": 1.0,
        "Coimbatore": 0.9,
        "Madurai": 0.85,
        "Hyderabad": 1.05,
        "Bengaluru": 1.1,
    }

    wages = []
    for c, j, exp, d in zip(cities, job_cats, experience, demand_score):
        base = base_map[j] * city_factor[c]
        wage = base + exp * 40 + d * 200 + rng.normal(0, 50)
        wages.append(max(400, wage))

    return pd.DataFrame(
        {
            "city": cities,
            "job_category": job_cats,
            "experience": experience,
            "demand_score": demand_score,
            "fair_wage": wages,
        }
    )


_MODEL: WageModel | None = None


def get_wage_model() -> WageModel:
    global _MODEL
    if _MODEL is not None:
        return _MODEL

    df = _generate_synthetic_wages()
    X = df[["city", "job_category", "experience", "demand_score"]]
    y = df["fair_wage"]

    categorical_features = ["city", "job_category"]
    numeric_features = ["experience", "demand_score"]

    preprocessor = ColumnTransformer(
        transformers=[
            ("cat", OneHotEncoder(handle_unknown="ignore"), categorical_features),
            ("num", "passthrough", numeric_features),
        ]
    )

    model = RandomForestRegressor(n_estimators=120, random_state=42)
    pipeline = Pipeline(steps=[("preprocessor", preprocessor), ("model", model)])
    pipeline.fit(X, y)

    _MODEL = WageModel(pipeline=pipeline)
    return _MODEL


def predict_wage(job_title: str, city: str, experience: int, offered_wage: float, demand_score: float) -> dict:
    model = get_wage_model()
    X_input = pd.DataFrame(
        [
            {
                "city": city if city in CITIES else "Chennai",
                "job_category": job_title if job_title in JOB_CATS else "EV Technician",
                "experience": experience,
                "demand_score": demand_score,
            }
        ]
    )
    market_wage = float(model.pipeline.predict(X_input)[0])
    fair = offered_wage >= market_wage * 0.95

    if fair:
        warning = "✅ Offered wage looks fair or above the local market."
    else:
        warning = "⚠️ Possible underpayment detected for this profile in this city."

    return {
        "market_wage": round(market_wage, 0),
        "offered_wage": offered_wage,
        "fair": fair,
        "warning_message": warning,
    }

