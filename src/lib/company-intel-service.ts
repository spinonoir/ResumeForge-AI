import { MCPClient } from './mcp-client'; // Assuming a generic MCPClient will be created

const MCP_SERVER_URL = process.env.NEXT_PUBLIC_MCP_COMPANY_INTEL_URL || 'http://localhost:4000';

class CompanyIntelClient extends MCPClient {
  constructor() {
    super(MCP_SERVER_URL);
  }

  async researchCompany(companyName: string, roleTitle?: string) {
    return this.callTool('research_company_profile', {
      company_name: companyName,
      role_title: roleTitle,
    });
  }

  async fetchJobMarketData(roleTitle: string, location: string) {
    return this.callTool('fetch_job_market_data', {
      role_title: roleTitle,
      location: location,
    });
  }

  async analyzeGithubPresence(companyName: string) {
    return this.callTool('analyze_github_presence', {
      company_name: companyName,
    });
  }

  async getGlassdoorInsights(companyName: string) {
    return this.callTool('get_glassdoor_insights', {
      company_name: companyName,
    });
  }
}

export const companyIntelService = new CompanyIntelClient(); 