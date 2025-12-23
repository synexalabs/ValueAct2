"""
Valuact Actuarial Engine - FastAPI Application
Main entry point for the actuarial calculation engine
"""

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import logging
from typing import List, Dict, Any
import os

from models.request import IFRS17Request, SolvencyRequest
from models.response import IFRS17Response, SolvencyResponse, ErrorResponse
from calculations.ifrs17 import calculate_portfolio_csm
from calculations.solvency import calculate_portfolio_scr
from utils.actuarial import validate_assumptions, get_mortality_table
from utils.logging_config import setup_logging

# Setup logging
setup_logging()
logger = logging.getLogger(__name__)


def sanitize_error_message(error: Exception, context: str) -> str:
    """
    Sanitize error messages for production responses.
    Logs full error details but returns safe message to client.
    """
    logger.error(f"{context}: {str(error)}", exc_info=True)
    if os.getenv("ENVIRONMENT") == "development":
        return f"{context}: {str(error)}"
    return f"{context} - Please contact support if this persists."

# Create FastAPI application
app = FastAPI(
    title="Valuact Actuarial Engine",
    description="Portfolio-level actuarial calculations for IFRS 17 and Solvency II",
    version="1.0.0",
    docs_url="/docs" if os.getenv("ENVIRONMENT") != "production" else None,
    redoc_url="/redoc" if os.getenv("ENVIRONMENT") != "production" else None
)

# Get allowed origins from environment or use defaults
allowed_origins = os.getenv(
    "ALLOWED_ORIGINS", 
    "http://localhost:5173,http://localhost:3000,http://localhost:3001"
).split(",")

# Add CORS middleware with origin whitelist for production
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins if os.getenv("ENVIRONMENT") == "production" else ["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)

# Add trusted host middleware for production
if os.getenv("ENVIRONMENT") == "production":
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=["*"]  # Configure appropriately for production
    )

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "Valuact Actuarial Engine",
        "version": "1.0.0",
        "status": "healthy"
    }

@app.get("/health")
async def health_check():
    """Detailed health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": "2024-01-01T00:00:00Z",
        "version": "1.0.0",
        "environment": os.getenv("ENVIRONMENT", "development")
    }

@app.post("/api/v1/calculate/ifrs17", response_model=IFRS17Response)
async def calculate_ifrs17(request: IFRS17Request):
    """
    Calculate IFRS 17 CSM for a portfolio of insurance policies
    
    This endpoint processes an entire portfolio of insurance policies and calculates
    the Contractual Service Margin (CSM) according to IFRS 17 standards.
    
    Args:
        request: IFRS17Request containing policies and assumptions
        
    Returns:
        IFRS17Response with CSM calculations and results
        
    Raises:
        HTTPException: If validation fails or calculation errors occur
    """
    try:
        logger.info(f"Starting IFRS 17 calculation for {len(request.policies)} policies")
        
        # Convert policies to dict format for calculation
        policies_dict = [policy.dict() for policy in request.policies]
        assumptions_dict = request.assumptions.dict()
        
        # Perform calculation
        results = calculate_portfolio_csm(
            policies=policies_dict,
            assumptions=assumptions_dict
        )
        
        logger.info(f"IFRS 17 calculation completed successfully")
        return results
        
    except HTTPException:
        raise
    except Exception as e:
        error_msg = sanitize_error_message(e, "IFRS 17 calculation failed")
        raise HTTPException(
            status_code=500,
            detail=error_msg
        )

@app.post("/api/v1/calculate/solvency", response_model=SolvencyResponse)
async def calculate_solvency(request: SolvencyRequest):
    """
    Calculate Solvency II SCR for a portfolio of insurance policies
    
    This endpoint processes an entire portfolio of insurance policies and calculates
    the Solvency Capital Requirement (SCR) according to Solvency II standards.
    
    Args:
        request: SolvencyRequest containing policies and assumptions
        
    Returns:
        SolvencyResponse with SCR calculations and results
        
    Raises:
        HTTPException: If validation fails or calculation errors occur
    """
    try:
        logger.info(f"Starting Solvency II calculation for {len(request.policies)} policies")
        
        # Convert policies to dict format for calculation
        policies_dict = [policy.dict() for policy in request.policies]
        assumptions_dict = request.assumptions.dict()
        
        # Perform calculation
        results = calculate_portfolio_scr(
            policies=policies_dict,
            assumptions=assumptions_dict
        )
        
        logger.info(f"Solvency II calculation completed successfully")
        return results
        
    except HTTPException:
        raise
    except Exception as e:
        error_msg = sanitize_error_message(e, "Solvency II calculation failed")
        raise HTTPException(
            status_code=500,
            detail=error_msg
        )

@app.get("/api/v1/mortality-tables")
async def get_mortality_tables():
    """
    Get available mortality tables
    
    Returns:
        List of available mortality tables with their metadata
    """
    try:
        tables = [
            {
                "id": "CSO_2017",
                "name": "Commissioners Standard Ordinary 2017",
                "description": "US mortality table for life insurance",
                "gender": "unisex",
                "year": 2017
            },
            {
                "id": "CSO_2001",
                "name": "Commissioners Standard Ordinary 2001",
                "description": "US mortality table for life insurance",
                "gender": "unisex",
                "year": 2001
            },
            {
                "id": "GAM_1994",
                "name": "German Actuarial Mortality 1994",
                "description": "German mortality table for life insurance",
                "gender": "unisex",
                "year": 1994
            }
        ]
        
        return {"mortality_tables": tables}
        
    except Exception as e:
        logger.error(f"Failed to get mortality tables: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to retrieve mortality tables"
        )

@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    """Custom HTTP exception handler"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": True,
            "message": exc.detail,
            "status_code": exc.status_code
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """General exception handler"""
    logger.error(f"Unhandled exception: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={
            "error": True,
            "message": "Internal server error",
            "status_code": 500
        }
    )

if __name__ == "__main__":
    import os
    port = int(os.getenv("PORT", 8080))
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=False,
        log_level="info"
    )
