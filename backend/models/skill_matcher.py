from functools import lru_cache
from typing import List, Dict

import numpy as np
from sentence_transformers import SentenceTransformer, util


JOB_PROFILES = [
    {
        "job_title": "EV Technician",
        "requirements": [
            "EV battery diagnostics",
            "High voltage safety",
            "Charging system calibration",
            "Electrical wiring",
        ],
    },
    {
        "job_title": "Solar Installer",
        "requirements": [
            "Solar panel installation",
            "Rooftop safety",
            "Inverter configuration",
            "Basic electrical wiring",
        ],
    },
    {
        "job_title": "Drone Operator",
        "requirements": [
            "Drone piloting",
            "Safety compliance",
            "Aerial photography",
            "Battery maintenance",
        ],
    },
    {
        "job_title": "Construction Worker",
        "requirements": [
            "Masonry assistance",
            "Material handling",
            "Site safety",
            "Scaffolding",
        ],
    },
    {
        "job_title": "Healthcare Aide",
        "requirements": [
            "Patient support",
            "Sanitisation",
            "Wheelchair handling",
            "Basic first aid",
        ],
    },
]


@lru_cache(maxsize=1)
def get_model() -> SentenceTransformer:
    return SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")


def _embed(texts: List[str]):
    model = get_model()
    return model.encode(texts, convert_to_tensor=True)


def analyze_skill_gap(worker_skills: List[str], target_job_title: str) -> Dict:
    worker_text = ", ".join(worker_skills) if worker_skills else ""

    job = next((j for j in JOB_PROFILES if j["job_title"] == target_job_title), JOB_PROFILES[0])
    job_text = ", ".join(job["requirements"])

    embeddings = _embed([worker_text, job_text])
    sim = float(util.cos_sim(embeddings[0], embeddings[1]).item())
    score_pct = int(max(0, min(100, round(sim * 100))))

    missing_skills = []
    if worker_text:
        for req in job["requirements"]:
            if req.lower() not in worker_text.lower():
                missing_skills.append(req)
    else:
        missing_skills = job["requirements"]

    courses = [
        {
            "title": "EV Technician Basics - India Focus",
            "provider": "YouTube",
            "url": "https://www.youtube.com/results?search_query=ev+technician+training+india",
        },
        {
            "title": f"{target_job_title} Foundations",
            "provider": "Coursera",
            "url": "https://www.coursera.org",
        },
        {
            "title": "Safety & Compliance for Field Technicians",
            "provider": "YouTube",
            "url": "https://www.youtube.com/results?search_query=field+technician+safety",
        },
    ]

    return {
        "job_title": job["job_title"],
        "match_score": score_pct,
        "missing_skills": missing_skills,
        "courses": courses,
    }


def match_jobs(worker_skills: List[str], jobs: List[Dict]) -> List[Dict]:
    if not jobs:
        return []

    worker_text = ", ".join(worker_skills) if worker_skills else ""
    worker_emb = _embed([worker_text])[0]

    job_texts = [", ".join(j.get("skills_required", [])) for j in jobs]
    job_embs = _embed(job_texts)

    sims = util.cos_sim(worker_emb, job_embs)[0].cpu().numpy()

    scored_jobs = []
    for job, sim in zip(jobs, sims):
        score = int(max(0, min(100, round(float(sim) * 100))))
        scored = dict(job)
        scored["match_score"] = score
        scored_jobs.append(scored)

    scored_jobs.sort(key=lambda j: j.get("match_score", 0), reverse=True)
    return scored_jobs

