# ResumeForge AI API Reference

## Overview

ResumeForge AI provides a comprehensive set of APIs for profile management, AI-powered content generation, and application tracking. The system is built with a microservices architecture using TypeScript and Google Genkit for AI workflows.

## Service Architecture

```
Frontend (Next.js) → Profile Management Service → Google Genkit → Gemini 2.0 Flash
                  → Scoring Engine Service (Future)
                  → Firebase (Auth & Database)
```

## Profile Management Service

### Base Types

#### Personal Details
```typescript
interface PersonalDetails {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  socialMediaLinks?: Array<{
    id?: string;
    platform: string;
    url: string;
  }>;
}
```

#### Employment History
```typescript
interface EmploymentEntry {
  id: string;
  title: string;
  company: string;
  dates: string;
  description: string;
  jobSummary?: string;
  skillsDemonstrated?: string[];
}

type EmploymentHistory = EmploymentEntry[];
```

#### Skills
```typescript
interface SkillEntry {
  id: string;
  name: string;
  category?: string;
}

type Skills = string[]; // For AI service communication
```

#### Projects
```typescript
interface ProjectEntry {
  id: string;
  name: string;
  association: string;
  dates: string;
  skillsUsed: string[];
  roleDescription: string;
  link?: string;
}

type Projects = Array<{
  name: string;
  association: string;
  dates: string;
  skillsUsed: string[];
  roleDescription: string;
  link?: string;
}>;
```

#### Education
```typescript
interface EducationEntry {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  dates: string;
  gpa?: string;
  accomplishments?: string;
}

type EducationHistory = EducationEntry[];
```

## AI Workflow APIs

### Resume Generation

#### `generateResume`

Generates a complete resume package tailored to a specific job description.

**Input Schema:**
```typescript
interface GenerateResumeRequest {
  jobDescription: string;
  personalDetails?: PersonalDetails;
  educationHistory?: EducationHistory;
  employmentHistory: EmploymentHistory;
  skills: Skills;
  projects: Projects;
  backgroundInformation: string;
  resumeTemplate?: 'regular' | 'compact' | 'ultraCompact';
  accentColor?: string;
  pageLimit?: number;
}
```

**Output Schema:**
```typescript
interface GenerateResumeResponse {
  resume: string;                    // LaTeX formatted resume
  resumeMarkdown?: string;           // Markdown formatted resume
  summary: string;                   // Professional summary
  coverLetter: string;               // Tailored cover letter
  matchAnalysis: string;             // Job fit analysis
  selectionRationale: string;        // Content selection reasoning
  jobTitleFromJD?: string;          // Extracted job title
  companyNameFromJD?: string;       // Extracted company name
}
```

**Usage Example:**
```typescript
import { generateResume } from '@/lib/scoring-service';

const request: GenerateResumeRequest = {
  jobDescription: "Software Engineer at Google...",
  personalDetails: {
    name: "John Doe",
    email: "john@example.com",
    // ...
  },
  employmentHistory: [
    {
      title: "Senior Developer",
      company: "Tech Corp",
      dates: "2020-2023",
      description: "Led development team...",
    }
  ],
  skills: ["JavaScript", "React", "Node.js"],
  projects: [],
  backgroundInformation: "Experienced full-stack developer...",
  resumeTemplate: "regular",
  accentColor: "#64B5F6",
  pageLimit: 2
};

const response = await generateResume(request);
console.log(response.resume); // LaTeX formatted resume
```

### Cover Letter Generation

#### `generateCoverLetter`

Refines and enhances cover letters with company-specific information.

**Input Schema:**
```typescript
interface GenerateCoverLetterRequest {
  jobDescription: string;
  userBackground: string;
  companyInformation?: string;
}
```

**Output Schema:**
```typescript
interface GenerateCoverLetterResponse {
  coverLetter: string;
}
```

**Usage Example:**
```typescript
import { generateCoverLetter } from '@/lib/scoring-service';

const request: GenerateCoverLetterRequest = {
  jobDescription: "Software Engineer position...",
  userBackground: "Full-stack developer with 5 years experience...",
  companyInformation: "Google is known for innovation and scale..."
};

const response = await generateCoverLetter(request);
console.log(response.coverLetter);
```

### Text Parsing APIs

#### `parseEmploymentText`

Parses natural language employment descriptions into structured data.

**Input Schema:**
```typescript
interface ParseEmploymentTextInput {
  textBlock: string;
}
```

**Output Schema:**
```typescript
interface ParseEmploymentTextOutput {
  jobTitle: string;
  company: string;
  employmentDates: string;
  jobDescription: string;
  jobSummary: string;
  skillsDemonstrated: string[];
}
```

**Usage Example:**
```typescript
import { parseEmploymentText } from '@/lib/profile-management-service';

const input: ParseEmploymentTextInput = {
  textBlock: `Software Engineer at Google from Jan 2020 to Dec 2022. 
             Led development of customer portal using React and Node.js. 
             Managed team of 5 developers and improved performance by 30%.`
};

const result = await parseEmploymentText(input);
console.log(result.jobTitle); // "Software Engineer"
console.log(result.company); // "Google"
console.log(result.skillsDemonstrated); // ["React", "Node.js", ...]
```

#### `parseProjectText`

Parses project descriptions into structured project entries.

**Input Schema:**
```typescript
interface ParseProjectTextInput {
  textBlock: string;
}
```

**Output Schema:**
```typescript
interface ParseProjectTextOutput {
  projectName: string;
  projectAssociation: string;
  projectDates: string;
  projectSkillsUsed: string[];
  projectRoleDescription: string;
  projectLink?: string;
}
```

**Usage Example:**
```typescript
import { parseProjectText } from '@/lib/profile-management-service';

const input: ParseProjectTextInput = {
  textBlock: `Personal Portfolio Website - Built from Jan to Mar 2023. 
             Created responsive site using Next.js, TypeScript, Tailwind. 
             Features dark mode and contact form. Live at mysite.com`
};

const result = await parseProjectText(input);
console.log(result.projectName); // "Personal Portfolio Website"
console.log(result.projectSkillsUsed); // ["Next.js", "TypeScript", "Tailwind"]
```

#### `parseAndCategorizeSkills`

Parses skill lists and automatically categorizes them.

**Input Schema:**
```typescript
interface ParseSkillsInput {
  textBlock: string;
}
```

**Output Schema:**
```typescript
interface SkillDetail {
  name: string;
  category: string;
}

interface ParseSkillsOutput {
  skills: SkillDetail[];
}
```

**Usage Example:**
```typescript
import { parseAndCategorizeSkills } from '@/lib/profile-management-service';

const input: ParseSkillsInput = {
  textBlock: "JavaScript, React, Node.js, PostgreSQL, AWS, Docker, leadership"
};

const result = await parseAndCategorizeSkills(input);
// Result: [
//   { name: "JavaScript", category: "Programming Language" },
//   { name: "React", category: "Web Framework" },
//   { name: "leadership", category: "Soft Skill" },
//   ...
// ]
```

### Background Information Builder

#### `buildBackgroundInformation`

Interactive AI assistant for building comprehensive background information.

**Input Schema:**
```typescript
interface BackgroundInformationInput {
  question: string;
  previousAnswers?: string[];
  accumulatedBackground?: string;
}
```

**Output Schema:**
```typescript
interface BackgroundInformationOutput {
  nextQuestion: string;
  updatedBackground: string;
  isDone: boolean;
}
```

**Usage Flow:**
```typescript
import { buildBackgroundInformation } from '@/lib/profile-management-service';

// Start conversation
let input: BackgroundInformationInput = {
  question: "start",
  previousAnswers: [],
  accumulatedBackground: ""
};

let response = await buildBackgroundInformation(input);
console.log(response.nextQuestion); // "What type of work do you do?"

// Continue conversation
input = {
  question: response.nextQuestion,
  previousAnswers: ["I'm a software engineer"],
  accumulatedBackground: response.updatedBackground
};

response = await buildBackgroundInformation(input);
// Continue until response.isDone === true
```

## Error Handling

### Standard Error Response
```typescript
interface APIError {
  error: {
    message: string;
    code: string;
    details?: any;
  };
}
```

### Common Error Codes
- `INVALID_INPUT`: Missing or malformed request data
- `AI_SERVICE_ERROR`: AI service unavailable or failed
- `AUTHENTICATION_ERROR`: Invalid or expired authentication
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `INTERNAL_ERROR`: Unexpected server error

### Error Handling Example
```typescript
try {
  const result = await generateResume(request);
  // Handle success
} catch (error) {
  if (error.code === 'AI_SERVICE_ERROR') {
    // Handle AI service issues
    console.error('AI service temporarily unavailable');
  } else {
    // Handle other errors
    console.error('Request failed:', error.message);
  }
}
```

## Rate Limiting

### Current Limits
- **Resume Generation**: 10 requests per minute per user
- **Text Parsing**: 20 requests per minute per user
- **Background Building**: 5 requests per minute per user

### Rate Limit Headers
```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 7
X-RateLimit-Reset: 1640995200
```

## Authentication

### Firebase Authentication
All API requests require valid Firebase authentication tokens.

```typescript
import { getAuth } from 'firebase/auth';

const auth = getAuth();
const user = auth.currentUser;

if (user) {
  const token = await user.getIdToken();
  // Use token in API requests
}
```

### Request Headers
```http
Authorization: Bearer <firebase-id-token>
Content-Type: application/json
```

## Client Libraries

### Profile Management Service Client
```typescript
// lib/profile-management-service.ts
export async function parseEmploymentText(
  input: ParseEmploymentTextInput
): Promise<ParseEmploymentTextOutput>;

export async function parseProjectText(
  input: ParseProjectTextInput
): Promise<ParseProjectTextOutput>;

export async function parseAndCategorizeSkills(
  input: ParseSkillsInput
): Promise<ParseSkillsOutput>;

export async function buildBackgroundInformation(
  input: BackgroundInformationInput
): Promise<BackgroundInformationOutput>;
```

### Scoring Service Client
```typescript
// lib/scoring-service.ts
export async function generateResume(
  input: GenerateResumeRequest
): Promise<GenerateResumeResponse>;

export async function generateCoverLetter(
  input: GenerateCoverLetterRequest
): Promise<GenerateCoverLetterResponse>;
```

## Development Tools

### AI Development Server
```bash
# Start Genkit development server
npm run genkit:dev

# Access at http://localhost:4000
# - View and test AI flows
# - Inspect prompts and responses
# - Debug workflow execution
```

### Testing
```typescript
// Example test for AI workflow
import { generateResume } from '../src/ai/flows/resume-generator';

describe('Resume Generation', () => {
  it('should generate resume with valid input', async () => {
    const input: GenerateResumeInput = {
      jobDescription: "Software Engineer...",
      employmentHistory: [],
      skills: ["JavaScript"],
      projects: [],
      backgroundInformation: "Developer with experience"
    };

    const result = await generateResume(input);
    
    expect(result.resume).toBeTruthy();
    expect(result.summary).toBeTruthy();
    expect(result.coverLetter).toBeTruthy();
  });
});
```

## Performance Optimization

### Best Practices
1. **Batch Requests**: Combine multiple operations when possible
2. **Caching**: Cache frequently accessed data client-side
3. **Parallel Processing**: Use Promise.all for independent operations
4. **Input Optimization**: Provide detailed, well-structured input for better AI results

### Monitoring
- Track API response times
- Monitor error rates by endpoint
- Analyze AI workflow performance
- Monitor token usage for cost optimization

## Versioning

### API Versioning Strategy
- Current version: `v1`
- Breaking changes increment major version
- New features increment minor version
- Bug fixes increment patch version

### Compatibility
- Previous versions supported for 6 months
- Deprecation notices provided 3 months in advance
- Migration guides provided for breaking changes

---

**Need help with integration?** Check our [User Guide](USER_GUIDE.md) or [Architecture Documentation](ARCHITECTURE.md) for more detailed information. 