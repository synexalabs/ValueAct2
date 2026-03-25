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
from datetime import datetime, timezone
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
    redoc_url="/redoc" if os.getenv("ENVIRONMENT") != "production" else None,
)

# Get allowed origins from environment or use defaults
allowed_origins = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:5173,http://localhost:3000,http://localhost:3001",
).split(",")

# Add CORS middleware with origin whitelist for production
app.add_middleware(
    CORSMiddleware,
    allow_origins=(
        allowed_origins if os.getenv("ENVIRONMENT") == "production" else ["*"]
    ),
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)

# Add trusted host middleware for production
if os.getenv("ENVIRONMENT") == "production":
    allowed_hosts = os.getenv(
        "ALLOWED_HOSTS", "valuact-rechner.de,localhost,127.0.0.1"
    ).split(",")
    app.add_middleware(TrustedHostMiddleware, allowed_hosts=allowed_hosts)


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "Valuact Actuarial Engine",
        "version": "1.0.0",
        "status": "healthy",
    }


@app.get("/health")
async def health_check():
    """Detailed health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "version": "1.0.0",
        "environment": os.getenv("ENVIRONMENT", "development"),
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
        logger.info(
            f"Starting IFRS 17 calculation for {len(request.policies)} policies"
        )

        # Convert policies to dict format for calculation
        policies_dict = [policy.model_dump() for policy in request.policies]
        assumptions_dict = request.assumptions.model_dump()

        # Perform calculation
        results = calculate_portfolio_csm(
            policies=policies_dict, assumptions=assumptions_dict
        )

        logger.info(f"IFRS 17 calculation completed successfully")
        return results

    except HTTPException:
        raise
    except Exception as e:
        error_msg = sanitize_error_message(e, "IFRS 17 calculation failed")
        raise HTTPException(status_code=500, detail=error_msg)


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
        logger.info(
            f"Starting Solvency II calculation for {len(request.policies)} policies"
        )

        # Convert policies to dict format for calculation
        policies_dict = [policy.model_dump() for policy in request.policies]
        assumptions_dict = request.assumptions.model_dump()

        # Perform calculation
        results = calculate_portfolio_scr(
            policies=policies_dict, assumptions=assumptions_dict
        )

        logger.info(f"Solvency II calculation completed successfully")
        return results

    except HTTPException:
        raise
    except Exception as e:
        error_msg = sanitize_error_message(e, "Solvency II calculation failed")
        raise HTTPException(status_code=500, detail=error_msg)


@app.post("/api/v1/calculate/csm-rollforward")
async def calculate_csm_rollforward_endpoint(request: dict):
    """
    Calculate IFRS 17 CSM roll-forward (Überleitung) for a reporting period.

    Expected body:
      opening_balance: { csm: float }
      new_business: [ { premium, fcf, ra } ]
      assumptions: { discount_rate, coverage_units_current, coverage_units_future,
                     delta_estimates?, experience_adjustments?, fx_impact? }
      economic_data: {}
    """
    try:
        from calculations.csm_rollforward import calculate_csm_rollforward

        opening_balance = request.get("opening_balance", {"csm": 0.0})
        new_business = request.get("new_business", [])
        assumptions = request.get("assumptions", {})
        economic_data = request.get("economic_data", {})

        movement = calculate_csm_rollforward(
            opening_balance=opening_balance,
            new_business=new_business,
            assumptions=assumptions,
            economic_data=economic_data,
        )

        result = movement.to_dict()
        result["is_valid"] = movement.validate()
        return result

    except Exception as e:
        error_msg = sanitize_error_message(e, "CSM roll-forward calculation failed")
        raise HTTPException(status_code=500, detail=error_msg)


@app.post("/api/v1/calculate/bav")
async def calculate_bav(request: dict):
    """
    bAV-Bewertung: DBO nach IAS 19 oder HGB/BilMoG.

    Body:
      commitment: { id, birth_date, entry_date, gender, annual_pension, ... }
      assumptions: { discount_rate?, retirement_age?, pension_trend?, ... }
      valuation_date: "2024-12-31"
      standard: "ias19" | "hgb" | "comparison"
    """
    try:
        from calculations.bav import (
            calculate_dbo_ias19, calculate_dbo_hgb,
            calculate_bav_comparison, calculate_bav_portfolio,
        )

        commitment = request.get("commitment")
        commitments = request.get("commitments")
        assumptions = request.get("assumptions", {})
        valuation_date = request.get("valuation_date", "2024-12-31")
        standard = request.get("standard", "ias19")

        if commitments:
            return calculate_bav_portfolio(commitments, assumptions, valuation_date, standard)
        elif commitment:
            if standard == "comparison":
                return calculate_bav_comparison(commitment, assumptions, valuation_date)
            elif standard == "hgb":
                return calculate_dbo_hgb(commitment, assumptions, valuation_date)
            else:
                return calculate_dbo_ias19(commitment, assumptions, valuation_date)
        else:
            raise HTTPException(status_code=400, detail="commitment oder commitments erforderlich")

    except HTTPException:
        raise
    except Exception as e:
        error_msg = sanitize_error_message(e, "bAV-Berechnung fehlgeschlagen")
        raise HTTPException(status_code=500, detail=error_msg)


@app.get("/api/v1/mortality-tables")
async def get_mortality_tables():
    """
    Get available mortality tables

    Returns:
        List of available mortality tables with their metadata
    """
    try:
        from data.dav_mortality_tables import get_available_dav_tables

        dav_tables = get_available_dav_tables()

        tables = dav_tables + [
            {
                "id": "CSO_2017",
                "name": "CSO 2017 (US-Referenz)",
                "description": "US-Sterbetafel – nur als Vergleichsreferenz",
                "gender": "unisex",
                "year": 2017,
                "type": "reference",
                "publisher": "SOA",
            }
        ]

        return {"mortality_tables": tables}

    except Exception as e:
        logger.error(f"Failed to get mortality tables: {str(e)}")
        raise HTTPException(
            status_code=500, detail="Failed to retrieve mortality tables"
        )


@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    """Custom HTTP exception handler"""
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": True, "message": exc.detail, "status_code": exc.status_code},
    )


@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """General exception handler"""
    logger.error(f"Unhandled exception: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={"error": True, "message": "Internal server error", "status_code": 500},
    )


if __name__ == "__main__":
    import os

    port = int(os.getenv("PORT", 8080))

    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False, log_level="info")
