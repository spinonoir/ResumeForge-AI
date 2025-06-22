from fastapi import FastAPI, HTTPException, Body
from typing import Dict, Any

from .config import settings
from .types.tools import (
    ResearchCompanyProfileInput,
    FetchJobMarketDataInput,
    AnalyzeGithubPresenceInput,
    GetGlassdoorInsightsInput,
)
from .tools import company_research, market_data

app = FastAPI()

# In a real application, you might have a more sophisticated tool registry
# that could be generated from the tools directory.
TOOL_REGISTRY = {
    "research_company_profile": {
        "handler": company_research.research_company_profile,
        "input_model": ResearchCompanyProfileInput,
    },
    "fetch_job_market_data": {
        "handler": market_data.fetch_job_market_data,
        "input_model": FetchJobMarketDataInput,
    },
    "analyze_github_presence": {
        "handler": market_data.analyze_github_presence,
        "input_model": AnalyzeGithubPresenceInput,
    },
    "get_glassdoor_insights": {
        "handler": market_data.get_glassdoor_insights,
        "input_model": GetGlassdoorInsightsInput,
    },
}

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.get("/tools")
def list_tools():
    # In a real MCP server, you'd return the full JSON schema.
    # For now, we'll just return the names.
    return {"tools": list(TOOL_REGISTRY.keys())}

@app.post("/tools/{tool_name}/call")
async def call_tool(tool_name: str, body: Dict[str, Any]):
    if tool_name not in TOOL_REGISTRY:
        raise HTTPException(status_code=404, detail=f"Tool '{tool_name}' not found.")

    tool_info = TOOL_REGISTRY[tool_name]
    handler = tool_info["handler"]
    input_model = tool_info["input_model"]

    try:
        # Validate input
        validated_args = input_model(**body)
        result = await handler(validated_args)
        return result
    except Exception as e:
        # Proper error handling should be more nuanced
        raise HTTPException(status_code=500, detail=str(e)) 