# Resume Scoring Engine

Python FastAPI service for AI-powered resume scoring and analysis.

## Setup

1. Install Poetry: `pip install poetry`
2. Install dependencies: `poetry install`
3. Run service: `poetry run uvicorn src.main:app --reload --port 8001`

## Endpoints

- `GET /health` - Health check
- `POST /score-resume` - Score resume against job description
- `POST /generate-resume` - Generate optimized resume

## Development

This service contains the AI flows moved from the Next.js app:
- Resume generation
- Job description analysis  
- Company intelligence
- Recommendation engine
