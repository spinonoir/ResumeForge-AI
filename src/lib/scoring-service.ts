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

  private extractJobTitleFromJD(jobDescription: string): string {
    // Try to extract job title from job description using common patterns
    const jd = jobDescription.toLowerCase();
    
    // Pattern 1: "We are looking for a [Job Title]" or "Seeking a [Job Title]"
    let match = jd.match(/(?:we are looking for|seeking|hiring|recruiting)\s+(?:a\s+|an\s+)?([^.!?\n]+?)(?:\s+to|\s+who|\s+with|\.|!|\?|$)/);
    if (match) {
      return this.cleanJobTitle(match[1]);
    }
    
    // Pattern 2: "[Job Title] - [Company Name]" or "[Job Title] at [Company]"
    match = jd.match(/^([^-\n]+?)(?:\s*-|\s+at)\s+/);
    if (match) {
      return this.cleanJobTitle(match[1]);
    }
    
    // Pattern 3: "Position: [Job Title]" or "Role: [Job Title]"
    match = jd.match(/(?:position|role|job title):\s*([^.\n!?]+)/);
    if (match) {
      return this.cleanJobTitle(match[1]);
    }
    
    // Pattern 4: Common job titles at the beginning
    const commonTitles = [
      'software engineer', 'frontend engineer', 'backend engineer', 'full stack engineer',
      'senior software engineer', 'lead software engineer', 'principal engineer',
      'data scientist', 'data analyst', 'product manager', 'project manager',
      'ui/ux designer', 'designer', 'developer', 'programmer',
      'devops engineer', 'site reliability engineer', 'security engineer',
      'machine learning engineer', 'ai engineer', 'qa engineer',
      'marketing manager', 'sales manager', 'account manager',
      'business analyst', 'financial analyst', 'consultant'
    ];
    
    for (const title of commonTitles) {
      if (jd.includes(title)) {
        return this.formatJobTitle(title);
      }
    }
    
    return '';
  }
  
  private extractCompanyNameFromJD(jobDescription: string): string {
    // Pattern 1: "at [Company Name]," or "Join [Company Name]"
    let match = jobDescription.match(/(?:at|join)\s+([A-Z][a-zA-Z0-9\s&.,-]+?)(?:\s*,|\s+we|\s+and|$|\.)/i);
    if (match) {
      return this.cleanCompanyName(match[1]);
    }
    
    // Pattern 2: "[Company Name] is looking for" or "[Company Name] seeks"
    match = jobDescription.match(/^([A-Z][a-zA-Z0-9\s&.,-]+?)\s+(?:is\s+looking\s+for|seeks|is\s+hiring|is\s+seeking)/i);
    if (match) {
      return this.cleanCompanyName(match[1]);
    }

    // Pattern 3: Look for company after job title like "Software Engineer at [Company Name]"
    match = jobDescription.match(/(?:engineer|developer|manager|analyst|scientist|designer)\s+at\s+([A-Z][a-zA-Z0-9\s&.,-]+?)(?:\s*,|\s+we|\s+and|$|\.)/i);
    if (match) {
        return this.cleanCompanyName(match[1]);
    }
    
    // Pattern 4: "Company: [Company Name]"
    match = jobDescription.match(/company:\s*([^.\n!?]+)/i);
    if (match) {
      return this.cleanCompanyName(match[1]);
    }
    
    // Pattern 5: Email domains that might indicate company names
    match = jobDescription.match(/@([a-zA-Z0-9-]+)\.(com|org|net|io|ai)/i);
    if (match) {
      const domain = match[1];
      if (['gmail', 'yahoo', 'hotmail', 'outlook'].indexOf(domain.toLowerCase()) === -1) {
        return this.formatCompanyName(domain);
      }
    }
    
    return '';
  }
  
  private cleanJobTitle(title: string): string {
    return title
      .replace(/^(a|an|the)\s+/i, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
  
  private cleanCompanyName(name: string): string {
    return name
      .replace(/\s+(inc|llc|corp|corporation|company|ltd|limited)\.?$/i, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
  
  private formatJobTitle(title: string): string {
    return title
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
  
  private formatCompanyName(name: string): string {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  private async mockGenerateResume(request: GenerateResumeRequest): Promise<GenerateResumeResponse> {
    // Extract job title and company name from job description
    const extractedJobTitle = this.extractJobTitleFromJD(request.jobDescription);
    const extractedCompanyName = this.extractCompanyNameFromJD(request.jobDescription);
    
    // Mock data for development when service is unavailable
    const mockLatexResume = `\\documentclass[11pt,letterpaper]{article}
\\usepackage[left=0.75in,right=0.75in,top=0.75in,bottom=0.75in]{geometry}
\\usepackage{xcolor}
\\usepackage{hyperref}
\\usepackage{enumitem}
\\usepackage{titlesec}

\\definecolor{AccentColor}{RGB}{0,0,0}

\\pagestyle{empty}
\\setlength{\\parindent}{0pt}

\\titleformat{\\section}{\\Large\\bfseries\\color{AccentColor}}{}{0em}{}[\\titlerule]
\\titlespacing{\\section}{0pt}{10pt}{5pt}

\\begin{document}

{\\Huge\\bfseries ${request.personalDetails?.name || 'Your Name'}}

\\vspace{5pt}
{\\large ${request.personalDetails?.email || 'your.email@example.com'} | ${request.personalDetails?.phone || '(555) 123-4567'}}

\\section{Professional Summary}
Experienced professional with strong background in ${request.skills?.[0] || 'technology'} and ${request.skills?.[1] || 'project management'}. Seeking to leverage expertise in a challenging new role.

\\section{Experience}
${request.employmentHistory.map((job, index) => `
\\textbf{${job.title}} \\hfill ${job.dates}\\\\
\\textit{${job.company}}
\\begin{itemize}[leftmargin=*]
\\item ${job.description || 'Contributed to team success and project delivery'}
\\end{itemize}
${index < request.employmentHistory.length - 1 ? '\\vspace{8pt}' : ''}
`).join('')}

\\section{Skills}
${request.skills.join(', ')}

${request.projects.length > 0 ? `\\section{Projects}
${request.projects.map((project, index) => `
\\textbf{${project.name}} \\hfill ${project.dates || 'Recent'}\\\\
\\textit{${project.association}}
\\begin{itemize}[leftmargin=*]
\\item ${project.roleDescription || project.description || 'Led project development and implementation'}
\\end{itemize}
${index < request.projects.length - 1 ? '\\vspace{8pt}' : ''}
`).join('')}` : ''}

\\end{document}`;

    return {
      resume: mockLatexResume,
      summary: `Experienced ${request.employmentHistory[0]?.title || 'professional'} with ${request.employmentHistory.length} years of experience in ${request.skills.slice(0, 3).join(', ')}. Strong track record of delivering results and contributing to team success.`,
      coverLetter: `Dear Hiring Manager,

I am writing to express my strong interest in the position described in your job posting. With my background in ${request.skills.slice(0, 2).join(' and ')}, I am confident I would be a valuable addition to your team.

In my previous role as ${request.employmentHistory[0]?.title || 'a professional'} at ${request.employmentHistory[0]?.company || 'my previous company'}, I ${request.employmentHistory[0]?.description?.slice(0, 100) || 'contributed to important projects and initiatives'}...

I am excited about the opportunity to bring my skills in ${request.skills.slice(0, 3).join(', ')} to your organization and contribute to your continued success.

Thank you for your consideration.

Sincerely,
${request.personalDetails?.name || 'Your Name'}`,
      matchAnalysis: `**Match Analysis:**

**Strengths:**
- Strong background in ${request.skills.slice(0, 2).join(' and ')}
- ${request.employmentHistory.length} years of relevant experience
- Demonstrated experience in ${request.employmentHistory[0]?.title || 'leadership roles'}

**Areas for Development:**
- Consider highlighting specific achievements with quantifiable results
- Could benefit from additional certifications in emerging technologies

**Overall Match:** Strong candidate with relevant experience and skills.`,
      selectionRationale: `**Resume Strategy:**
- **Highlighted Experience:** Focused on your role as '${request.employmentHistory[0]?.title || 'N/A'}' at ${request.employmentHistory[0]?.company || 'N/A'} because it's the most recent and relevant experience.
- **Prioritized Skills:** Emphasized skills like '${request.skills.slice(0, 3).join("', '")}' as they directly align with the core requirements mentioned in the job description.
- **Showcased Project:** The project '${request.projects[0]?.name || 'N/A'}' was included to demonstrate hands-on application of key technologies.`,
      resumeMarkdown: `# ${request.personalDetails?.name || 'Your Name'}

${request.personalDetails?.email || 'your.email@example.com'} | ${request.personalDetails?.phone || '(555) 123-4567'}

## Professional Summary
Experienced professional with strong background in ${request.skills?.[0] || 'technology'} and ${request.skills?.[1] || 'project management'}.

## Experience
${request.employmentHistory.map(job => `
### ${job.title} | ${job.company}
*${job.dates}*

- ${job.description || 'Contributed to team success and project delivery'}
`).join('')}

## Skills
${request.skills.join(', ')}

${request.projects.length > 0 ? `## Projects
${request.projects.map(project => `
### ${project.name} | ${project.association}
*${project.dates || 'Recent'}*

- ${project.roleDescription || project.description || 'Led project development and implementation'}
`).join('')}` : ''}`,
      jobTitleFromJD: extractedJobTitle,
      companyNameFromJD: extractedCompanyName
    };
  }

  async scoreResume(request: ScoreRequest): Promise<ScoreResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/score-resume`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`Scoring service error: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.warn('Scoring service unavailable, using mock data:', error);
      // Return mock scoring data
      return {
        overallScore: 75,
        breakdown: {
          skillsMatch: 80,
          experienceRelevance: 70,
          culturalFit: 75,
          growthPotential: 75
        },
        recommendations: [
          {
            type: 'skill_addition',
            title: 'Add Relevant Keywords',
            description: 'Consider adding more industry-specific keywords to improve ATS matching.',
            confidence: 0.8,
            risk: 'low'
          }
        ],
        analysis: {
          missingSkills: ['Cloud Computing', 'Data Analysis'],
          strongMatches: request.userProfile.skills.slice(0, 3),
          suggestionsCount: 3
        }
      };
    }
  }

  async generateResume(request: GenerateResumeRequest): Promise<GenerateResumeResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/generate-resume`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`Resume generation error: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.warn('Resume generation service unavailable, using mock generation:', error);
      return this.mockGenerateResume(request);
    }
  }

  async generateCoverLetter(request: GenerateCoverLetterRequest): Promise<GenerateCoverLetterResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/generate-cover-letter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`Cover letter generation error: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.warn('Cover letter service unavailable, using mock generation:', error);
      return {
        coverLetter: `Dear Hiring Manager,

I am writing to express my strong interest in the position described in your job posting. ${request.userBackground}

${request.companyInformation ? `I am particularly drawn to your company because ${request.companyInformation}` : ''}

I am excited about the opportunity to contribute to your team and look forward to discussing how my background and skills can benefit your organization.

Thank you for your consideration.

Sincerely,
[Your Name]`
      };
    }
  }

  async buildBackgroundInformation(input: any): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/build-background`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        throw new Error(`Background building error: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.warn('Background service unavailable, using mock response:', error);
      return {
        backgroundInformation: "Experienced professional with a strong track record of success in technology and project management. Skilled in problem-solving and team collaboration."
      };
    }
  }

  async parseEmploymentText(input: any): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/parse-employment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        throw new Error(`Employment parsing error: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.warn('Employment parsing service unavailable, using mock response:', error);
      return {
        employmentEntries: []
      };
    }
  }

  async parseAndCategorizeSkills(input: any): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/parse-skills`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        throw new Error(`Skills parsing error: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.warn('Skills parsing service unavailable, using mock response:', error);
      return {
        skills: []
      };
    }
  }

  async parseProjectText(input: any): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/parse-project`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        throw new Error(`Project parsing error: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.warn('Project parsing service unavailable, using mock response:', error);
      return {
        projects: []
      };
    }
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
export const scoreResume = (input: any) => scoringService.scoreResume(input);
export const buildBackgroundInformation = (input: any) => scoringService.buildBackgroundInformation(input);
export const parseEmploymentText = (input: any) => scoringService.parseEmploymentText(input);
export const parseAndCategorizeSkills = (input: any) => scoringService.parseAndCategorizeSkills(input);
export const parseProjectText = (input: any) => scoringService.parseProjectText(input);

// For backwards compatibility with any existing function names
export const refineCoverLetterFlow = generateCoverLetter;
