from pydantic import BaseModel
import os

class Settings(BaseModel):
    port: int = int(os.getenv("PORT", 8000))
    log_level: str = os.getenv("LOG_LEVEL", "INFO")
    project_id: str = os.getenv("PROJECT_ID")
    mcp_secret: str = os.getenv("MCP_SECRET")

settings = Settings() 