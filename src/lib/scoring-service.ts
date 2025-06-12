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

  async parseEmploymentText(input: any): Promise<any> {
    const response = await fetch(`${this.baseUrl}/parse-employment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      throw new Error(`Employment parsing error: ${response.statusText}`);
    }

    return response.json();
  }

  async parseAndCategorizeSkills(input: any): Promise<any> {
    const response = await fetch(`${this.baseUrl}/parse-skills`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      throw new Error(`Skills parsing error: ${response.statusText}`);
    }

    return response.json();
  }

  async parseProjectText(input: any): Promise<any> {
    const response = await fetch(`${this.baseUrl}/parse-project`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      throw new Error(`Project parsing error: ${response.statusText}`);
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
export const parseEmploymentText = (input: any) => scoringService.parseEmploymentText(input);
export const parseAndCategorizeSkills = (input: any) => scoringService.parseAndCategorizeSkills(input);
export const parseProjectText = (input: any) => scoringService.parseProjectText(input);

// For backwards compatibility with any existing function names
export const refineCoverLetterFlow = generateCoverLetter;
