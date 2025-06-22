#!/bin/bash

# Migration script for Issue #2: Project Structure Refactoring
# Run this from your project root directory

echo "🚀 Starting project structure migration..."

# Step 1: Create new directory structure
echo "📁 Creating service directories..."
mkdir -p services/scoring-engine/src
mkdir -p services/shared
mkdir -p services/company-intel

# Step 2: Move AI code (preserving git history)
echo "🔄 Moving AI code to scoring engine..."
git mv src/ai services/scoring-engine/src/

# Step 3: Create shared types file
echo "📝 Creating shared types..."
cat > services/shared/types.ts << 'EOF'
// Types for communication between Next.js and Python service
export interface ScoreRequest {
  resumeText: string;
  jobDescription: string;
  userProfile: {
    employmentHistory: EmploymentHistory;
    skills: Skills;
    projects: Projects;
    backgroundInformation: string;
  };
}

export interface ScoreResponse {
  overallScore: number;
  breakdown: {
    skillsMatch: number;
    experienceRelevance: number;
    culturalFit: number;
    growthPotential: number;
  };
  recommendations: Recommendation[];
  analysis: {
    missingSkills: string[];
    strongMatches: string[];
    suggestionsCount: number;
  };
}

export interface Recommendation {
  type: 'skill_addition' | 'experience_reframe' | 'presentation_improvement';
  title: string;
  description: string;
  confidence: number;
  risk: 'low' | 'medium' | 'high';
}

// AI Flow Types (moved from your current types)
export type EmploymentHistory = Array<{
  title: string;
  company: string;
  dates: string;
  description: string;
}>;

export type Skills = string[];

export type Projects = Array<{
  name: string;
  description: string;
  link?: string;
}>;
EOF

# Step 4: Create scoring service
echo "🔧 Creating scoring service..."
cat > src/lib/scoring-service.ts << 'EOF'
import type { ScoreRequest, ScoreResponse } from '../../services/shared/types';

export class ScoringService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_SCORING_SERVICE_URL || 'http://localhost:8001';
  }

  async scoreResume(request: ScoreRequest): Promise<ScoreResponse> {
    const response = await fetch(`${this.baseUrl}/score-resume`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Scoring service error: ${response.statusText}`);
    }

    return response.json();
  }

  async generateResume(request: ScoreRequest) {
    const response = await fetch(`${this.baseUrl}/generate-resume`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Resume generation error: ${response.statusText}`);
    }

    return response.json();
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }
}

export const scoringService = new ScoringService();
EOF

# Step 5: Create basic docker-compose for future use
echo "🐳 Creating docker-compose configuration..."
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  nextjs-app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_SCORING_SERVICE_URL=http://scoring-engine:8001
    depends_on:
      - scoring-engine
    volumes:
      - .:/app
      - /app/node_modules

  scoring-engine:
    build: ./services/scoring-engine
    ports:
      - "8001:8001"
    environment:
      - LOG_LEVEL=INFO
    volumes:
      - ./services/scoring-engine:/app
EOF

# Step 6: Create placeholder files for scoring engine
echo "📄 Creating scoring engine placeholder files..."
mkdir -p services/scoring-engine
cat > services/scoring-engine/README.md << 'EOF'
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
EOF

# Step 7: Update environment variables
echo "🔧 Updating environment configuration..."
if [ ! -f .env.local ]; then
    touch .env.local
fi

if ! grep -q "NEXT_PUBLIC_SCORING_SERVICE_URL" .env.local; then
    echo "NEXT_PUBLIC_SCORING_SERVICE_URL=http://localhost:8001" >> .env.local
fi

# Step 8: Update README
echo "📚 Updating README..."
cat >> README.md << 'EOF'

## Architecture

This project uses a microservices architecture:

- **Next.js App** (`src/`): UI, authentication, user management
- **Scoring Engine** (`services/scoring-engine/`): AI/ML operations, resume scoring
- **Shared Types** (`services/shared/`): Common interfaces between services

## Development

### Next.js App
```bash
npm run dev
```

### Scoring Engine (Python)
```bash
cd services/scoring-engine
poetry run uvicorn src.main:app --reload --port 8001
```

### Full Stack (Docker)
```bash
docker-compose up --build
```
EOF

echo "✅ Migration complete!"
echo ""
echo "Next steps:"
echo "1. Run 'npm run build' to verify Next.js still works"
echo "2. Commit these changes: git add . && git commit -m 'Refactor: Move AI flows to microservice structure'"
echo "3. Update any component imports that reference the old AI flows"
echo "4. Ready for Issue #1: Python FastAPI service setup!"
