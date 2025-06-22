from pydantic import BaseModel, Field
from typing import Optional

class ResearchCompanyProfileInput(BaseModel):
    company_name: str
    role_title: Optional[str] = None

class FetchJobMarketDataInput(BaseModel):
    role_title: str
    location: str

class AnalyzeGithubPresenceInput(BaseModel):
    company_name: str

class GetGlassdoorInsightsInput(BaseModel):
    company_name: str 