# ResumeForge AI

*AI-powered resume optimization and job matching platform*

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-039BE5?style=for-the-badge&logo=Firebase&logoColor=white)](https://firebase.google.com/)
[![Google AI](https://img.shields.io/badge/Google%20AI-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)

## 🚀 Overview

ResumeForge AI is an intelligent resume optimization platform that helps job seekers create perfectly tailored resumes and cover letters. Using advanced AI and machine learning techniques, it analyzes job descriptions and matches them against user profiles to generate highly targeted application materials.

### ✨ Key Features

- **AI-Powered Resume Generation**: Create LaTeX-formatted resumes tailored to specific job descriptions
- **Dynamic Cover Letter Creation**: Generate compelling cover letters with company-specific customization
- **Intelligent Background Builder**: Interactive AI assistant helps articulate professional experiences
- **Match Analysis**: Detailed scoring of how well your profile fits target positions
- **Profile Management**: Secure cloud storage of employment history, skills, and projects
- **Real-time Recommendations**: Smart suggestions for improving resume effectiveness

## 🎯 How It Works

1. **Build Your Profile**: Add employment history, skills, and projects through intuitive forms or AI-assisted conversation
2. **Paste Job Description**: Input any job posting to analyze requirements and company context
3. **AI Analysis**: Advanced algorithms score your fit and identify optimization opportunities
4. **Generate Materials**: Create tailored resume and cover letter optimized for the specific role
5. **Refine & Apply**: Review AI recommendations and export polished application materials

## 🛠 Technology Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Radix UI** - Accessible component primitives
- **Zustand** - State management

### Backend & AI
- **Firebase** - Authentication and cloud storage
- **Google Genkit** - AI workflow orchestration
- **Gemini 2.0 Flash** - Large language model
- **TanStack Query** - Data fetching and caching

### Development
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **TypeScript** - Static type checking

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Firebase project
- Google AI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/resumeforge-ai.git
   cd resumeforge-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   
   Create `.env.local` file:
   ```env
   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   
   # Google AI
   GOOGLE_GENAI_API_KEY=your_google_ai_api_key
   ```

4. **Firebase Setup**
   
   Initialize Firebase in your project:
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase init firestore
   ```

5. **Run Development Server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:9002](http://localhost:9002) in your browser.

### AI Development

For AI workflow development:

```bash
# Start Genkit development server
npm run genkit:dev

# Watch mode for AI flows
npm run genkit:watch
```

## 📁 Project Structure

```
resumeforge-ai/
├── src/
│   ├── ai/                    # AI workflows and prompts
│   │   ├── flows/            # Genkit flow definitions
│   │   └── genkit.ts         # AI configuration
│   ├── app/                  # Next.js app directory
│   ├── components/           # React components
│   │   ├── auth/            # Authentication components
│   │   ├── profile/         # Profile management
│   │   ├── tabs/            # Main application tabs
│   │   └── ui/              # Reusable UI components
│   ├── contexts/            # React contexts
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utilities and configurations
│   └── types/               # TypeScript type definitions
├── docs/                    # Documentation
├── public/                  # Static assets
└── [config files]          # Various configuration files
```

## 🎨 Design System

ResumeForge AI uses a carefully crafted design system optimized for professional resume building:

- **Primary Color**: Soft Blue (#64B5F6) - Inspires confidence and reliability
- **Background**: Light Gray (#F0F4F8) - Clean, professional canvas
- **Accent**: Muted Teal (#4DB6AC) - Highlights key elements
- **Typography**: 
  - Body: Inter (modern, readable)
  - Headlines: Space Grotesk (tech-friendly)
  - Code: Monospace (for LaTeX output)

## 🔮 Upcoming Features

ResumeForge AI is actively developed with exciting features planned:

### Advanced Scoring System
- **Multi-dimensional Analysis**: Cosine similarity, semantic matching, and contextual scoring
- **Company Intelligence**: Automated research of target companies for better personalization
- **Skills Gap Analysis**: Identify missing skills and suggest relevant additions

### Dynamic Experience Engine
- **Multi-variant Generation**: Express the same experience in different ways for different roles
- **Context-aware Selection**: Automatically choose optimal experience descriptions
- **Intelligent Reframing**: Suggest better ways to present existing accomplishments

### Enhanced Recommendations
- **Hidden Skills Detection**: Identify unexpressed skills based on experience
- **Risk-assessed Suggestions**: Smart recommendations that avoid misrepresentation
- **Industry-specific Optimization**: Tailor language for different industries and company cultures

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Issue Labels

- `type:feature` - New feature implementation
- `type:bug` - Bug fixes
- `type:enhancement` - Improvements to existing features
- `priority:high/medium/low` - Issue priority
- `good-first-issue` - Great for new contributors

## 📊 Performance

ResumeForge AI is optimized for performance:

- **Client-side Rendering**: Fast, responsive user interface
- **Efficient State Management**: Zustand for minimal re-renders
- **Firebase Optimization**: Efficient data fetching and caching
- **AI Workflow Optimization**: Parallel processing where possible

## 🔒 Security & Privacy

- **Secure Authentication**: Firebase Auth with Google SSO support
- **Data Encryption**: All user data encrypted in transit and at rest
- **Privacy-first**: User data used only for resume optimization
- **GDPR Compliant**: Full data portability and deletion rights

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Firebase](https://firebase.google.com/) for backend infrastructure
- [Google AI](https://ai.google.dev/) for powerful language models
- [Radix UI](https://www.radix-ui.com/) for accessible components
- [Tailwind CSS](https://tailwindcss.com/) for styling system

## 📞 Support

- **Documentation**: [View Docs](docs/)
- **Issues**: [GitHub Issues](https://github.com/yourusername/resumeforge-ai/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/resumeforge-ai/discussions)

---

**Made with ❤️ by the ResumeForge AI team**

*Empowering job seekers with AI-driven resume optimization*