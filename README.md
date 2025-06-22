# ResumeForge AI

*AI-powered resume optimization and job application management platform*

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-039BE5?style=for-the-badge&logo=Firebase&logoColor=white)](https://firebase.google.com/)
[![Google AI](https://img.shields.io/badge/Google%20AI-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)

## 🚀 Overview

ResumeForge AI is an intelligent resume optimization and job application management platform that helps job seekers create perfectly tailored resumes, cover letters, and track their application process. Using advanced AI powered by Google's Gemini 2.0 Flash model, it analyzes job descriptions and matches them against user profiles to generate highly targeted application materials.

### ✨ Key Features

#### **AI-Powered Content Generation**
- **Smart Resume Builder**: Generate LaTeX-formatted resumes tailored to specific job descriptions
- **Dynamic Cover Letters**: Create compelling, company-specific cover letters
- **Intelligent Background Builder**: Interactive AI assistant helps articulate professional experiences
- **Natural Language Input**: Add employment history, projects, and skills using conversational AI

#### **Profile Management**
- **Comprehensive Profiles**: Store employment history, skills, projects, education, and personal details
- **AI Text Parsing**: Describe your experience in natural language and let AI structure the data
- **Smart Skill Categorization**: Automatic categorization of technical and soft skills
- **Flexible Data Entry**: Choose between traditional forms or AI-powered text input

#### **Application Tracking**
- **Complete Application Management**: Track applications from creation to outcome
- **Status Tracking**: Monitor progress through saved, submitted, interviewing, offer, and rejection stages
- **Correspondence Logging**: Keep track of all communications with employers
- **Resume Versioning**: Manage multiple resume variants for different applications

#### **Advanced Analysis**
- **Match Scoring**: Detailed analysis of how well your profile fits target positions
- **ATS Optimization**: Resume generation optimized for Applicant Tracking Systems
- **Customizable Templates**: Multiple LaTeX templates (regular, compact, ultra-compact)
- **Visual Customization**: Custom accent colors and page limits

## 🛠 Technology Stack

### **Frontend**
- **Next.js 15** - React framework with App Router and Turbopack
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling with custom design system
- **Radix UI** - Accessible, unstyled component primitives
- **Zustand** - Lightweight state management
- **TanStack Query** - Data fetching, caching, and synchronization

### **Backend & AI**
- **Firebase** - Authentication, Firestore database, and cloud storage
- **Google Genkit** - AI workflow orchestration framework
- **Gemini 2.0 Flash** - Google's latest large language model
- **Microservices Architecture** - Separate services for profile management and scoring

### **Development & Deployment**
- **ESLint & TypeScript** - Code quality and type checking
- **Firebase Hosting** - Production deployment
- **Docker Compose** - Local development environment
- **GitHub Actions** - CI/CD pipeline (future implementation)

## 🚀 Getting Started

### **Prerequisites**
- Node.js 18 or later
- npm or yarn package manager
- Firebase project with Firestore enabled
- Google AI API key (Gemini 2.0 Flash access)

### **Installation**

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/resumeforge-ai.git
   cd resumeforge-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   
   Create `.env.local` in the root directory:
   ```env
   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

   # Google AI Configuration
   GOOGLE_GENAI_API_KEY=your_google_ai_api_key
   ```

4. **Firebase Setup**
   ```bash
   # Install Firebase CLI globally
   npm install -g firebase-tools
   
   # Login to Firebase
   firebase login
   
   # Initialize Firestore (if not already done)
   firebase init firestore
   ```

5. **Development Server**
   ```bash
   # Start Next.js development server with Turbopack
   npm run dev
   ```
   
   The application will be available at [http://localhost:9002](http://localhost:9002)

6. **AI Development (Optional)**
   ```bash
   # Start Genkit development server for AI flows
   npm run genkit:dev
   
   # Or with hot reload
   npm run genkit:watch
   ```

## 📁 Project Architecture

```
resumeforge-ai/
├── src/
│   ├── app/                      # Next.js App Router pages
│   │   ├── applications/         # Saved applications management
│   │   ├── layout.tsx           # Root layout with providers
│   │   └── page.tsx             # Main dashboard
│   ├── components/               # React components
│   │   ├── applications/         # Application tracking components
│   │   ├── auth/                # Authentication components
│   │   ├── profile/             # Profile management UI
│   │   ├── tabs/                # Main application tabs
│   │   └── ui/                  # Reusable UI components
│   ├── contexts/                # React contexts (Auth)
│   ├── hooks/                   # Custom React hooks
│   ├── lib/                     # Utilities and configurations
│   │   ├── firebase.ts          # Firebase configuration
│   │   ├── profile-management-service.ts # Profile API client
│   │   ├── scoring-service.ts   # AI services client
│   │   └── store.ts             # Zustand store definitions
│   └── types/                   # TypeScript type definitions
├── services/                    # Microservices
│   ├── profile-management/      # Profile and AI workflow service
│   │   └── src/ai/             # Genkit AI flows and templates
│   ├── scoring-engine/          # Future scoring service
│   └── shared/                  # Shared types and utilities
├── docs/                        # Project documentation
└── [config files]              # Configuration files
```

## 🎨 Design System

ResumeForge AI uses a professional design system optimized for job application workflows:

- **Primary**: Soft Blue (#64B5F6) - Confidence and reliability
- **Background**: Light Gray (#F0F4F8) - Clean, professional canvas  
- **Accent**: Muted Teal (#4DB6AC) - Key element highlights
- **Typography**:
  - **Body**: Inter - Modern, highly readable
  - **Headlines**: Space Grotesk - Tech-friendly, approachable
  - **Code**: JetBrains Mono - LaTeX and technical content

## 🔧 Core Features Deep Dive

### **AI-Powered Profile Building**
- **Natural Language Processing**: Describe your experience conversationally
- **Automatic Data Structuring**: AI parses and organizes information
- **Smart Skill Recognition**: Identifies and categorizes technical and soft skills
- **Context-Aware Parsing**: Understands employment vs. project contexts

### **Intelligent Resume Generation**
- **Job-Specific Tailoring**: Content selection based on job requirements
- **ATS Optimization**: Hidden skill keywords for applicant tracking systems
- **Multiple Templates**: Professional LaTeX templates with customization options
- **Dynamic Formatting**: Automatic adjustment for page limits and visual preferences

### **Application Lifecycle Management**
- **End-to-End Tracking**: From initial application to final outcome
- **Status Progression**: Saved → Submitted → Interviewing → Offer/Rejection
- **Communication History**: Log all employer interactions and important dates
- **Resume Versioning**: Track which resume variant was used for each application

### **Smart Matching & Analysis**
- **Multi-Dimensional Scoring**: Skills, experience, cultural fit, growth potential
- **Gap Analysis**: Identify missing skills and improvement opportunities
- **Recommendation Engine**: Actionable suggestions for profile enhancement
- **Performance Tracking**: Monitor application success rates and patterns

## 🚀 Usage Guide

### **1. Profile Setup**
- **Personal Details**: Add contact information and social links
- **Background Information**: Use AI assistant to articulate your professional story
- **Employment History**: Add jobs manually or describe them in natural language
- **Skills & Projects**: Comprehensive tracking with automatic categorization

### **2. Application Creation**
- **Job Description Analysis**: Paste job posting for AI analysis
- **Customization Options**: Choose template, colors, and page limits
- **Content Generation**: AI creates tailored resume, cover letter, and summary
- **Review & Refine**: Edit generated content and add company-specific information

### **3. Application Management**
- **Save & Track**: Store complete application packages
- **Status Updates**: Progress through application stages
- **Communication Logging**: Record interviews, emails, and follow-ups
- **Outcome Analysis**: Learn from rejections and successful applications

## 🔮 Planned Features

### **Enhanced AI Capabilities**
- **Resume Upload Parsing**: Extract information from existing resumes
- **LinkedIn Integration**: Import and sync profile data
- **Company Research**: Automatic company information gathering
- **Interview Preparation**: AI-generated questions and talking points

### **Advanced Analytics**
- **Success Metrics**: Track application-to-interview conversion rates
- **Market Analysis**: Industry and role-specific insights
- **Skill Trend Analysis**: Identify in-demand skills in your field
- **Salary Insights**: Compensation data and negotiation guidance

### **Collaboration Features**
- **Mentor Reviews**: Share profiles for feedback
- **Template Sharing**: Community-contributed resume templates
- **Success Stories**: Learn from others' successful applications

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](docs/CONTRIBUTING.md) for details.

### **Development Workflow**
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### **Development Setup**
```bash
# Install dependencies
npm install

# Run type checking
npm run typecheck

# Run linting
npm run lint

# Start development servers
npm run dev          # Next.js frontend
npm run genkit:dev   # AI development server
```

## 📊 Performance & Security

### **Performance Optimizations**
- **Turbopack**: Fast development builds and hot reload
- **TanStack Query**: Efficient data fetching and caching
- **Zustand**: Minimal re-renders with optimized state management
- **Firebase SDK**: Optimized for web performance

### **Security Measures**
- **Firebase Authentication**: Secure user management
- **Firestore Security Rules**: Database-level access control
- **Environment Variables**: Secure API key management
- **HTTPS Everywhere**: Encrypted data transmission

## 📱 Browser Support

- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google AI**: Gemini 2.0 Flash for powerful language understanding
- **Vercel**: Next.js framework and development tools
- **Firebase**: Backend infrastructure and authentication
- **Radix UI**: Accessible component primitives
- **shadcn/ui**: Beautiful, customizable component library

---

**Ready to transform your job search with AI?** [Get started now](http://localhost:9002) and create your first optimized resume in minutes.

<!-- forcing a deployment -->
