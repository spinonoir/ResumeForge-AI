export class MCPClient {
  constructor(private baseUrl: string) {}

  async listTools() {
    const response = await fetch(`${this.baseUrl}/tools`);
    if (!response.ok) {
      throw new Error('Failed to fetch tools from MCP server');
    }
    return response.json();
  }

  async callTool(toolName: string, args: Record<string, any>) {
    const response = await fetch(`${this.baseUrl}/tools/${toolName}/call`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(args),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(`Failed to call tool ${toolName}: ${errorData.message || response.statusText}`);
    }

    return response.json();
  }
} 