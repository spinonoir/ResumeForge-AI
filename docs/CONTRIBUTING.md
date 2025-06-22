# Contributing to ResumeForge AI

Thank you for your interest in contributing to ResumeForge AI! This guide will help you get started with contributing to our AI-powered resume optimization platform.

## 🎯 Ways to Contribute

- **Bug Reports**: Help us identify and fix issues
- **Feature Requests**: Suggest new features and improvements
- **Code Contributions**: Submit bug fixes and new features
- **Documentation**: Improve our guides and API documentation
- **Testing**: Help test new features and report issues
- **UI/UX Improvements**: Enhance the user experience

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or later
- npm or yarn
- Git
- Firebase project (for development)
- Google AI API key

### Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/your-username/resumeforge-ai.git
   cd resumeforge-ai
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **AI Development (Optional)**
   ```bash
   npm run genkit:dev
   ```

## 📋 Development Workflow

### Branch Strategy

- `master`: Production-ready code
- `develop`: Integration branch for features
- `feature/feature-name`: New features
- `bugfix/bug-description`: Bug fixes
- `hotfix/critical-fix`: Critical production fixes

### Making Changes

1. **Create a Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Your Changes**
   - Follow our coding standards
   - Write tests for new functionality
   - Update documentation as needed

3. **Test Your Changes**
   ```bash
   npm run typecheck
   npm run lint
   npm test # When tests are available
   ```

4. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

5. **Push and Create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

## 🎨 Code Style Guidelines

### TypeScript/JavaScript

- Use TypeScript for all new code
- Follow ESLint configuration
- Use descriptive variable and function names
- Add type annotations for clarity
- Prefer async/await over Promises

```typescript
// Good
async function generateResume(request: GenerateResumeRequest): Promise<GenerateResumeResponse> {
  try {
    const result = await aiService.generateResume(request);
    return result;
  } catch (error) {
    console.error('Resume generation failed:', error);
    throw error;
  }
}

// Avoid
function generateResume(req: any) {
  return aiService.generateResume(req).then(res => res).catch(err => { throw err; });
}
```

### React Components

- Use functional components with hooks
- Implement proper prop types
- Use meaningful component names
- Extract custom hooks for reusable logic

```typescript
// Good
interface ResumeCardProps {
  resume: Resume;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ResumeCard({ resume, onEdit, onDelete }: ResumeCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  // Component logic here
}
```

### AI Workflow Development

- Use clear prompt templates
- Define comprehensive input/output schemas
- Include error handling
- Add validation for inputs

```typescript
// Good
const parseEmploymentPrompt = ai.definePrompt({
  name: 'parseEmployment',
  input: { schema: ParseEmploymentInputSchema },
  output: { schema: ParseEmploymentOutputSchema },
  prompt: `Parse the following employment description...`
});
```

## 🧪 Testing Guidelines

### Unit Tests

- Test individual functions and components
- Mock external dependencies
- Use descriptive test names
- Cover edge cases and error scenarios

```typescript
describe('parseEmploymentText', () => {
  it('should extract job title and company from description', async () => {
    const input = {
      textBlock: 'Software Engineer at Google from 2020 to 2022'
    };
    
    const result = await parseEmploymentText(input);
    
    expect(result.jobTitle).toBe('Software Engineer');
    expect(result.company).toBe('Google');
  });
});
```

### AI Workflow Testing

- Test with various input formats
- Validate output schema compliance
- Test error handling scenarios
- Performance testing for large inputs

## 📝 Documentation Standards

### Code Documentation

- Use JSDoc for functions and classes
- Document complex algorithms
- Explain AI prompt engineering decisions
- Include usage examples

```typescript
/**
 * Generates a tailored resume based on job description and user profile
 * @param request - Resume generation parameters
 * @returns Promise resolving to generated resume and metadata
 * @throws {AIServiceError} When AI service is unavailable
 * @example
 * ```typescript
 * const result = await generateResume({
 *   jobDescription: "Software Engineer at Google...",
 *   skills: ["JavaScript", "React"],
 *   // ...
 * });
 * ```
 */
async function generateResume(request: GenerateResumeRequest): Promise<GenerateResumeResponse>
```

### README Updates

- Keep installation instructions current
- Update feature lists
- Include new configuration options
- Add troubleshooting for common issues

## 🐛 Bug Reports

### Before Submitting

- Check existing issues
- Reproduce the bug consistently
- Test in different browsers/environments
- Gather relevant information

### Bug Report Template

```markdown
**Describe the Bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected Behavior**
A clear and concise description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment**
- OS: [e.g. macOS 12.0]
- Browser: [e.g. Chrome 96]
- Version: [e.g. 1.0.0]

**Additional Context**
Add any other context about the problem here.
```

## ✨ Feature Requests

### Before Submitting

- Check existing feature requests
- Consider if it aligns with project goals
- Think about implementation complexity
- Provide detailed use cases

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
A clear and concise description of what the problem is.

**Describe the solution you'd like**
A clear and concise description of what you want to happen.

**Describe alternatives you've considered**
A clear and concise description of any alternative solutions.

**Additional context**
Add any other context or screenshots about the feature request.
```

## 🎯 Priority Features

We're especially interested in contributions for:

### AI Enhancements
- **Resume Upload Parsing**: Extract information from PDF/DOCX resumes
- **LinkedIn Integration**: Import profile data automatically
- **Company Research**: Automatic company information gathering
- **Interview Preparation**: AI-generated interview questions

### User Experience
- **Mobile Responsiveness**: Optimize for mobile devices
- **Accessibility**: Improve WCAG compliance
- **Performance**: Optimize loading times and responsiveness
- **Internationalization**: Multi-language support

### Application Management
- **Advanced Analytics**: Application success metrics
- **Collaboration**: Team resume review features
- **Templates**: Additional resume templates
- **Export Options**: Multiple export formats

## 🔧 Technical Areas

### Frontend Development
- React component development
- UI/UX improvements
- State management optimization
- Performance enhancements

### AI Development
- Google Genkit workflow creation
- Prompt engineering
- AI model integration
- Response parsing and validation

### Backend Development
- Microservice architecture
- API development
- Database optimization
- Security enhancements

## 📋 Pull Request Guidelines

### PR Checklist

- [ ] Code follows style guidelines
- [ ] Self-review of the code
- [ ] Added tests for new functionality
- [ ] Updated documentation
- [ ] No merge conflicts
- [ ] Passes all checks

### PR Description Template

```markdown
## Description
Brief description of changes made.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Screenshots (if applicable)
Add screenshots to help explain your changes.

## Additional Notes
Any additional information or context.
```

## 🎉 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes for significant contributions
- GitHub contributor statistics
- Project documentation

## 📞 Getting Help

- **Discord**: Join our developer community
- **GitHub Discussions**: Ask questions and share ideas
- **Issues**: Report bugs and request features
- **Email**: Contact maintainers for sensitive issues

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to ResumeForge AI!** Your efforts help make job searching better for everyone. 