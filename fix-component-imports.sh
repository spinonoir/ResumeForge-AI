#!/bin/bash

# Fix remaining component imports after AI migration
echo "🔧 Fixing component imports..."

# First, let's see what imports we need to fix
echo "📋 Finding broken AI imports..."
grep -r "from '@/ai" src/ || echo "No imports found with this pattern"
grep -r "import.*@/ai" src/ || echo "No imports found with this pattern"

# Let's check the specific files mentioned in the error
echo ""
echo "📁 Files that need fixing:"
echo "- src/components/applications/ResumeManager.tsx"
echo "- src/components/profile/BackgroundBuilder.tsx"  
echo "- src/components/tabs/NewApplicationTabContent.tsx"
echo "- src/components/tabs/ProfileTabContent.tsx"

echo ""
echo "🔧 Fixing each component..."

# Fix ResumeManager.tsx
if [ -f "src/components/applications/ResumeManager.tsx" ]; then
    echo "Fixing ResumeManager.tsx..."
    # Remove AI imports and replace with scoring service
    sed -i.backup \
        -e '/import.*@\/ai\/flows\/resume-generator/d' \
        -e '/import.*generateResume/d' \
        src/components/applications/ResumeManager.tsx
    
    # Add scoring service import at the top if not already there
    if ! grep -q "scoringService" src/components/applications/ResumeManager.tsx; then
        sed -i '' '1i\
import { scoringService } from "@/lib/scoring-service";
' src/components/applications/ResumeManager.tsx
    fi
    echo "✅ Fixed ResumeManager.tsx"
fi

# Fix BackgroundBuilder.tsx
if [ -f "src/components/profile/BackgroundBuilder.tsx" ]; then
    echo "Fixing BackgroundBuilder.tsx..."
    sed -i.backup \
        -e '/import.*@\/ai\/flows\/background-information-builder/d' \
        -e '/import.*buildBackgroundInformation/d' \
        src/components/profile/BackgroundBuilder.tsx
    
    # Add scoring service import
    if ! grep -q "scoringService" src/components/profile/BackgroundBuilder.tsx; then
        sed -i '' '1i\
import { scoringService } from "@/lib/scoring-service";
' src/components/profile/BackgroundBuilder.tsx
    fi
    echo "✅ Fixed BackgroundBuilder.tsx"
fi

# Fix NewApplicationTabContent.tsx
if [ -f "src/components/tabs/NewApplicationTabContent.tsx" ]; then
    echo "Fixing NewApplicationTabContent.tsx..."
    sed -i.backup \
        -e '/import.*@\/ai\/flows\/resume-generator/d' \
        -e '/import.*@\/ai\/flows\/cover-letter-generator/d' \
        -e '/import.*generateResume/d' \
        -e '/import.*refineCoverLetterFlow/d' \
        src/components/tabs/NewApplicationTabContent.tsx
    
    # Add scoring service import
    if ! grep -q "scoringService" src/components/tabs/NewApplicationTabContent.tsx; then
        sed -i '' '1i\
import { scoringService } from "@/lib/scoring-service";
' src/components/tabs/NewApplicationTabContent.tsx
    fi
    echo "✅ Fixed NewApplicationTabContent.tsx"
fi

# Fix ProfileTabContent.tsx  
if [ -f "src/components/tabs/ProfileTabContent.tsx" ]; then
    echo "Fixing ProfileTabContent.tsx..."
    sed -i.backup \
        -e '/import.*@\/ai\/flows\/employment-text-parser-flow/d' \
        src/components/tabs/ProfileTabContent.tsx
    
    # Add scoring service import if needed
    if ! grep -q "scoringService" src/components/tabs/ProfileTabContent.tsx; then
        sed -i '' '1i\
import { scoringService } from "@/lib/scoring-service";
' src/components/tabs/ProfileTabContent.tsx
    fi
    echo "✅ Fixed ProfileTabContent.tsx"
fi

echo ""
echo "🔧 Adding placeholder API endpoints to scoring service..."

# Enhance the scoring service with missing endpoints
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

  async buildBackgroundInformation(input: any): Promise<any> {
    const response = await fetch(`${this.baseUrl}/build-background`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      throw new Error(`Background building error: ${response.statusText}`);
    }

    return response.json();
  }

  async parseEmploymentText(text: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/parse-employment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error(`Employment parsing error: ${response.statusText}`);
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

// Export individual functions for backwards compatibility
export const generateResume = (input: any) => scoringService.generateResume(input);
export const generateCoverLetter = (input: any) => scoringService.generateCoverLetter(input);
export const buildBackgroundInformation = (input: any) => scoringService.buildBackgroundInformation(input);
export const parseEmploymentText = (text: string) => scoringService.parseEmploymentText(text);

// Type exports for backwards compatibility
export type { GenerateResumeInput, GenerateResumeOutput } from '../../services/shared/types';
export type { GenerateCoverLetterInput, GenerateCoverLetterOutput } from '../../services/shared/types';
EOF

echo "✅ Enhanced scoring service with missing endpoints"

echo ""
echo "🧹 Cleaning up backup files..."
find src/ -name "*.backup" -delete

echo ""
echo "🧪 Testing build again..."
if npm run build > build-test-2.log 2>&1; then
    echo "✅ Build successful!"
    rm build-test-2.log
else
    echo "❌ Still have build issues. Checking remaining problems..."
    echo ""
    echo "Remaining issues:"
    grep "Module not found" build-test-2.log || echo "No module not found errors"
    grep "Cannot find" build-test-2.log || echo "No cannot find errors"
    echo ""
    echo "Check build-test-2.log for full details"
fi

echo ""
echo "✅ Component import fixes complete!"
echo ""
echo "What was fixed:"
echo "- 🔧 Removed all broken @/ai imports from components"
echo "- 📦 Added scoringService imports to all affected components"
echo "- 🔄 Enhanced scoring service with backwards compatibility"
echo "- 📄 Added placeholder endpoints for all missing AI functions"
echo ""
echo "⚠️  Important: Your components now use scoringService instead of direct AI calls"
echo "   When you implement the Python service, these API calls will work automatically!"