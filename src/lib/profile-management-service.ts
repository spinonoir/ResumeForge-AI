import { parseEmploymentText } from '../../services/profile-management/src/ai/flows/employment-text-parser-flow';
import { parseProjectText } from '../../services/profile-management/src/ai/flows/project-text-parser-flow';
import { parseAndCategorizeSkills } from '../../services/profile-management/src/ai/flows/skill-parser-categorizer-flow';
import { buildBackgroundInformation } from '../../services/profile-management/src/ai/flows/background-information-builder';

// Re-export types for the UI components
export type { 
  ParseEmploymentTextInput, 
  ParseEmploymentTextOutput 
} from '../../services/profile-management/src/ai/flows/employment-text-parser-flow';

export type { 
  ParseProjectTextInput, 
  ParseProjectTextOutput 
} from '../../services/profile-management/src/ai/flows/project-text-parser-flow';

export type { 
  ParseSkillsInput as ParseAndCategorizeSkillsInput, 
  ParseSkillsOutput as ParseAndCategorizeSkillsOutput 
} from '../../services/profile-management/src/ai/flows/skill-parser-categorizer-flow';

export type { 
  BackgroundInformationInput as BackgroundInformationBuilderInput, 
  BackgroundInformationOutput as BackgroundInformationBuilderOutput 
} from '../../services/profile-management/src/ai/flows/background-information-builder';

// Direct exports of the AI functions
export { 
  parseEmploymentText, 
  parseProjectText, 
  parseAndCategorizeSkills, 
  buildBackgroundInformation 
};

// Wrapper class for consistent API
export class ProfileManagementService {
  async parseEmploymentText(input: any): Promise<any> {
    return parseEmploymentText(input);
  }

  async parseProjectText(input: any): Promise<any> {
    return parseProjectText(input);
  }

  async parseAndCategorizeSkills(input: any): Promise<any> {
    return parseAndCategorizeSkills(input);
  }

  async buildBackgroundInformation(input: any): Promise<any> {
    return buildBackgroundInformation(input);
  }
}

export const profileManagementService = new ProfileManagementService(); 