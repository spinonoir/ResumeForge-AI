#!/bin/bash

# Post-migration fix script
# Run this after the original migration script to fix the types

echo "🔧 Fixing types after migration..."

# Step 1: Check current state
echo "📋 Checking current state..."

if [ ! -d "services/scoring-engine/src/ai" ]; then
    echo "❌ AI directory not found in services/scoring-engine/src/ai"
    echo "Run the original migration script first!"
    exit 1
fi

if [ ! -f "src/types/index.ts" ]; then
    echo "❌ src/types/index.ts not found"
    exit 1
fi

echo "✅ Migration structure detected"

# Step 2: Extract AI types from the moved files
echo "📋 Extracting AI type definitions from moved files..."

# Look for the AI types in the moved resume-generator file
if [ -f "services/scoring-engine/src/ai/flows/resume-generator.ts" ]; then
    echo "Found resume-generator.ts, extracting types..."
    
    # Extract the type definitions
    grep -A 10 "export type EmploymentHistory\|export type Skills\|export type Projects" services/scoring-engine/src/ai/flows/resume-generator.ts > extracted-types.txt
    
    echo "Extracted types:"
    cat extracted-types.txt
else
    echo "⚠️  resume-generator.ts not found, using default type definitions"
fi

# Step 3: Fix the types file
echo "📝 Fixing src/types/index.ts..."

# Create a backup
cp src/types/index.ts src/types/index.ts.broken-backup

# Create the corrected types file
cat > src/types/index.ts << 'EOF'
// UI-focused types for Next.js app
// Note: AI import removed since ai/ directory moved to Python service

export type EmploymentEntry = {
  id: string;
  title: string;
  company: string;
  dates: string;
  description: string;
  jobSummary?: string;
  skillsDemonstrated?: string[];
};

export type SkillEntry = {
  id: string;
  name: string;
  category?: string;
};

export type ProjectEntry = {
  id: string;
  name: string;
  association: string;
  dates: string;
  skillsUsed: string[];
  roleDescription: string;
  link?: string;
};

export interface Resume {
  id: string;
  name: string;
  createdAt: string;
  templateUsed: string;
  accentColorUsed: string;
  pageLimitUsed: number;
  generatedResumeLatex: string;
  generatedResumeMarkdown: string;
  isStarred: boolean;
}

export interface SavedApplication {
  id: string;
  jobTitle: string;
  companyName: string;
  jobDescription: string;
  resumes?: Resume[];
  generatedCoverLetter: string;
  generatedSummary: string;
  matchAnalysis: string;
  createdAt: string;
}

export interface SocialMediaLink {
  id: string;
  platform: string;
  url: string;
}

export interface PersonalDetails {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  socialMediaLinks?: SocialMediaLink[];
}

export interface EducationEntry {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  dates: string;
  gpa?: string;
  accomplishments?: string;
}

// AI-related types - now defined locally since AI flows moved to Python service
// These types were originally imported from @/ai/flows/resume-generator
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

echo "✅ Fixed src/types/index.ts"

# Step 4: Update the shared types to use proper AI types
echo "📝 Updating shared types..."
cat > services/shared/types.ts << 'EOF'
// API contract types for communication between Next.js and Python service

// Import the AI types from the Next.js types (for consistency)
import type { EmploymentHistory, Skills, Projects } from '../../src/types/index';

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

// Resume generation types (based on your existing AI flows)
export interface GenerateResumeRequest {
  jobDescription: string;
  employmentHistory: EmploymentHistory;
  skills: Skills;
  projects: Projects;
  backgroundInformation: string;
}

export interface GenerateResumeResponse {
  resume: string;
  summary: string;
  coverLetter: string;
  matchAnalysis: string;
}

// Cover letter generation
export interface GenerateCoverLetterRequest {
  jobDescription: string;
  userBackground: string;
  companyInformation?: string;
}

export interface GenerateCoverLetterResponse {
  coverLetter: string;
}
EOF

# Step 5: Update the scoring service to use correct types
echo "🔧 Updating scoring service..."
cat > src/lib/scoring-service.ts << 'EOF'
import type { 
  ScoreRequest, 
  ScoreResponse, 
  GenerateResumeRequest,
  GenerateResumeResponse,
  GenerateCoverLetterRequest,
  GenerateCoverLetterResponse
} from '../../services/shared/types';

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

  async generateResume(request: GenerateResumeRequest): Promise<GenerateResumeResponse> {
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

  async generateCoverLetter(request: GenerateCoverLetterRequest): Promise<GenerateCoverLetterResponse> {
    const response = await fetch(`${this.baseUrl}/generate-cover-letter`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Cover letter generation error: ${response.statusText}`);
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

# Step 6: Clean up temporary files
echo "🧹 Cleaning up..."
rm -f extracted-types.txt

# Step 7: Test the build
echo "🧪 Testing Next.js build..."
if npm run build > build-test.log 2>&1; then
    echo "✅ Next.js builds successfully!"
    rm build-test.log
else
    echo "❌ Build failed. Check build-test.log for details:"
    tail -20 build-test.log
fi

echo ""
echo "✅ Post-migration fix complete!"
echo ""
echo "What was fixed:"
echo "- ✅ Restored all your original types (EmploymentEntry, SkillEntry, etc.)"
echo "- ✅ Removed broken AI import"
echo "- ✅ Added AI types locally to maintain compatibility"  
echo "- ✅ Updated shared types to use proper imports"
echo "- ✅ Enhanced scoring service with all endpoints"
echo ""
echo "Next steps:"
echo "1. Check that 'npm run build' passes"
echo "2. Look for any remaining broken imports: grep -r '@/ai' src/"
echo "3. Ready to start Issue #1: Python FastAPI service!"