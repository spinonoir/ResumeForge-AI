# ResumeForge AI Architecture

## Overview

ResumeForge AI is built with a modern, scalable architecture that combines a Next.js frontend with microservices backend and AI-powered workflows. The system is designed for reliability, performance, and extensibility.

## System Architecture

### High-Level Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Next.js App   │ ──▶│   Firebase Auth  │ ──▶│   Firestore DB  │
│   (Frontend)    │    │   & Storage      │    │   (User Data)   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │
         ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  Profile Mgmt   │ ──▶│  Google Genkit   │ ──▶│  Gemini 2.0     │
│  Service        │    │  (AI Workflows)  │    │  Flash Model    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │
         ▼
┌─────────────────┐
│  Scoring Engine │
│  Service        │
└─────────────────┘
```

## Frontend Architecture

### Next.js App Router Structure

```
src/
├── app/                    # App Router pages
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx           # Main dashboard
│   └── applications/      # Saved applications management
├── components/            # React components
│   ├── ui/               # Reusable UI components (shadcn/ui)
│   ├── auth/             # Authentication components
│   ├── profile/          # Profile management
│   ├── applications/     # Application tracking
│   └── tabs/             # Main application sections
├── contexts/             # React context providers
├── hooks/                # Custom React hooks
├── lib/                  # Utilities and services
└── types/                # TypeScript definitions
```

### Component Architecture

#### Design System
- **Base Layer**: Radix UI primitives for accessibility
- **Styled Layer**: shadcn/ui components with Tailwind CSS
- **Composite Layer**: Application-specific components
- **Feature Layer**: Page and tab components

#### State Management
- **Zustand**: Global state management
  - User profile store
  - Applications store
  - UI state management
- **TanStack Query**: Server state management
  - Data fetching and caching
  - Mutation handling
  - Background updates

### Key Frontend Components

#### Profile Management
- **ProfileTabContent**: Main profile management interface
- **AITextInput**: Natural language data entry
- **PersonalDetailsForm**: Contact information management
- **BackgroundBuilder**: AI-assisted background information
- **SkillDetailsDialog**: Skill categorization and management

#### Application Creation
- **NewApplicationTabContent**: Job application creation workflow
- **ResumeManager**: Resume variant management
- **ResumeCustomizationDialog**: Template and styling options

#### Application Tracking
- **SavedApplicationsTabContent**: Application lifecycle management
- **CorrespondenceCard**: Communication tracking
- **DatesCard**: Important dates and follow-ups
- **StatusTracking**: Application progress monitoring

## Backend Architecture

### Microservices Structure

```
services/
├── profile-management/     # Profile and AI workflow service
│   └── src/ai/            # Genkit AI flows
│       ├── flows/         # Individual AI workflows
│       ├── templates/     # LaTeX resume templates
│       └── genkit.ts      # AI configuration
├── scoring-engine/        # Future scoring service
└── shared/               # Common types and utilities
```

### Profile Management Service

#### AI Workflows (Google Genkit)
- **Resume Generation**: LaTeX resume creation with job-specific tailoring
- **Cover Letter Generation**: Personalized cover letter creation
- **Background Information Builder**: Interactive profile building
- **Text Parsing Flows**:
  - Employment history parsing
  - Project description parsing
  - Skill recognition and categorization

#### Templates
- **regular.tex.hbs**: Standard professional template
- **compact.tex.hbs**: Space-efficient template
- **ultraCompact.tex.hbs**: Maximum content density template

### Data Architecture

#### Firestore Collections

```
users/
├── {userId}/
│   ├── profile/           # Personal details and background
│   ├── employment/        # Employment history entries
│   ├── skills/           # Skills with categories
│   ├── projects/         # Project entries
│   ├── education/        # Education history
│   └── applications/     # Saved application packages
```

#### Data Models

**User Profile**
```typescript
interface UserProfile {
  personalDetails: PersonalDetails;
  backgroundInformation: string;
  employmentHistory: EmploymentEntry[];
  skills: SkillEntry[];
  projects: ProjectEntry[];
  educationHistory: EducationEntry[];
}
```

**Application Package**
```typescript
interface SavedApplication {
  id: string;
  jobTitle: string;
  companyName: string;
  jobDescription: string;
  resumes: Resume[];
  generatedCoverLetter: string;
  generatedSummary: string;
  matchAnalysis: string;
  status: ApplicationStatus;
  correspondence: CorrespondenceEntry[];
  importantDates: ImportantDate[];
}
```

## AI Architecture

### Google Genkit Integration

#### Workflow Orchestration
- **Flow Definition**: Structured AI workflows with input/output schemas
- **Prompt Engineering**: Template-based prompts with Handlebars
- **Model Integration**: Gemini 2.0 Flash for language understanding
- **Error Handling**: Graceful degradation and retry logic

#### Key AI Flows

**Resume Generation Flow**
1. Job description analysis
2. Profile relevance scoring
3. Content selection and prioritization
4. LaTeX generation with template application
5. ATS optimization with hidden keywords

**Text Parsing Flows**
1. Natural language understanding
2. Entity extraction (dates, companies, skills)
3. Categorization and structuring
4. Validation and enhancement

### AI Prompt Engineering

#### Template System
- **Handlebars Integration**: Dynamic prompt generation
- **Context Awareness**: Job-specific and profile-specific prompts
- **Output Schemas**: Structured AI responses with validation
- **Best Practices**: Clear instructions and examples

## Security Architecture

### Authentication & Authorization
- **Firebase Authentication**: Secure user management
- **Google OAuth**: Single sign-on integration
- **Session Management**: Secure token handling
- **Route Protection**: Authenticated route guards

### Data Security
- **Firestore Security Rules**: Database-level access control
- **Environment Variables**: Secure API key management
- **HTTPS**: Encrypted data transmission
- **Client-side Validation**: Input sanitization

### Privacy & Compliance
- **Data Minimization**: Only collect necessary information
- **User Control**: Profile data ownership and deletion
- **Audit Logging**: Security event tracking
- **GDPR Considerations**: Data portability and privacy rights

## Performance Architecture

### Frontend Performance
- **Turbopack**: Fast development builds
- **Code Splitting**: Route-based lazy loading
- **Image Optimization**: Next.js image optimization
- **Caching Strategy**: Browser and CDN caching

### Backend Performance
- **Firebase SDK**: Optimized client libraries
- **Query Optimization**: Efficient Firestore queries
- **Connection Pooling**: Database connection management
- **Caching**: Server-side response caching

### AI Performance
- **Batch Processing**: Multiple AI requests optimization
- **Prompt Optimization**: Efficient token usage
- **Response Caching**: Common query result caching
- **Parallel Execution**: Concurrent AI workflow processing

## Deployment Architecture

### Development Environment
- **Local Development**: Next.js dev server with hot reload
- **AI Development**: Genkit development server
- **Database**: Local Firestore emulator
- **Environment Management**: dotenv configuration

### Production Environment
- **Frontend**: Firebase Hosting with CDN
- **Database**: Firestore in production mode
- **AI Services**: Google Cloud AI Platform
- **Monitoring**: Firebase Analytics and Performance

### CI/CD Pipeline (Planned)
- **Source Control**: GitHub with branch protection
- **Testing**: Automated unit and integration tests
- **Building**: Continuous integration builds
- **Deployment**: Automated deployment to staging/production

## Monitoring & Observability

### Application Monitoring
- **Error Tracking**: Client and server error monitoring
- **Performance Metrics**: Core web vitals tracking
- **User Analytics**: Usage patterns and feature adoption
- **AI Metrics**: Model performance and accuracy tracking

### Infrastructure Monitoring
- **Database Performance**: Firestore operation metrics
- **API Performance**: Response times and error rates
- **Resource Usage**: Memory and CPU utilization
- **Security Events**: Authentication and access patterns

## Scalability Considerations

### Horizontal Scaling
- **Stateless Architecture**: Session-independent request handling
- **Database Sharding**: User-based data partitioning
- **Service Decomposition**: Independent service scaling
- **Load Distribution**: Geographic content distribution

### Vertical Scaling
- **Resource Optimization**: Efficient resource utilization
- **Caching Strategy**: Multi-layer caching implementation
- **Database Optimization**: Query and index optimization
- **AI Optimization**: Model performance tuning

## Future Architecture Enhancements

### Planned Improvements
- **Real-time Features**: WebSocket integration for live collaboration
- **Advanced Analytics**: Machine learning for user insights
- **Multi-tenant Architecture**: Enterprise customer support
- **API Gateway**: External API access and rate limiting

### Technology Evolution
- **Edge Computing**: CDN-based processing
- **Serverless Functions**: Event-driven architecture
- **Microservices Expansion**: Additional specialized services
- **AI Model Upgrades**: Latest language model integration 