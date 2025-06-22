import logging
import os
from fastapi import FastAPI
from firebase_admin import initialize_app
from firebase_functions import options, https_fn
from dotenv import load_dotenv
from google.cloud import secretmanager
from a2wsgi import ASGIMiddleware

# Load environment variables from .env file for local development
load_dotenv()

# --- Google Cloud Secret Manager ---
def access_secret_version(secret_id, version_id="latest"):
    """
    Access the payload of the given secret version.
    """
    # Create the Secret Manager client.
    client = secretmanager.SecretManagerServiceClient()

    # Build the resource name of the secret version.
    project_id = os.environ.get("GCP_PROJECT")
    if not project_id:
        logging.warning("GCP_PROJECT environment variable not set.")
        return None
        
    name = f"projects/{project_id}/secrets/{secret_id}/versions/{version_id}"

    # Access the secret version.
    try:
        response = client.access_secret_version(name=name)
        payload = response.payload.data.decode("UTF-8")
        return payload
    except Exception as e:
        logging.error(f"Failed to access secret {secret_id}: {e}")
        return None

# --- Firebase and FastAPI Setup ---

# Set the region to 'us-central1'
options.set_global_options(region=options.SupportedRegion.US_CENTRAL1)

# Initialize Firebase app
try:
    initialize_app()
except ValueError:
    # app is already initialized
    pass

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="ResumeForge AI Scoring Engine",
    description="Python service for scoring and ML operations.",
    version="0.1.0",
)

# --- API Endpoints ---

@app.get("/health")
async def health_check():
    """
    A basic health check endpoint to confirm the service is running.
    """
    logger.info("Health check endpoint was called.")
    return {"status": "ok"}

# --- Cloud Function Entrypoint ---

# Wrap the FastAPI app with ASGIMiddleware to make it a WSGI app.
# Firebase Cloud Functions for Python (2nd gen) are built on top of a WSGI server.
# This middleware translates WSGI requests to ASGI for FastAPI to handle.
wsgi_app = ASGIMiddleware(app)

@https_fn.on_request()
def scoring_engine(req: https_fn.Request) -> https_fn.Response:
    """
    Main entry point for the Firebase Cloud Function.
    This function passes the incoming request to the WSGI-wrapped FastAPI app.
    """
    return https_fn.Response.from_app(wsgi_app, req.environ) 