# Valuact Actuarial Engine

A high-performance Python FastAPI service for portfolio-level actuarial calculations, supporting IFRS 17 and Solvency II standards.

## Features

- **IFRS 17 Calculations**: Contractual Service Margin (CSM) calculations for insurance portfolios
- **Solvency II Calculations**: Solvency Capital Requirement (SCR) calculations
- **High Performance**: Vectorized calculations using NumPy and Pandas
- **Scalable**: Designed to handle portfolios with 10,000+ policies
- **RESTful API**: Clean FastAPI-based API with automatic documentation
- **Validation**: Comprehensive input validation using Pydantic models

## API Endpoints

### Health Check
- `GET /` - Basic health check
- `GET /health` - Detailed health status

### Calculations
- `POST /api/v1/calculate/ifrs17` - IFRS 17 CSM calculations
- `POST /api/v1/calculate/solvency` - Solvency II SCR calculations

### Utilities
- `GET /api/v1/mortality-tables` - Available mortality tables

## Installation

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. Run the application:
```bash
python main.py
```

The API will be available at `http://localhost:8000` with interactive documentation at `http://localhost:8000/docs`.

## Usage

### IFRS 17 Calculation

```python
import requests

data = {
    "policies": [
        {
            "policy_id": "POL001",
            "issue_date": "2024-01-01",
            "face_amount": 100000,
            "premium": 5000,
            "policy_type": "term_life"
        }
    ],
    "assumptions": {
        "discount_rate": 0.03,
        "lapse_rate": 0.05,
        "mortality_table": "CSO_2017",
        "expense_inflation": 0.02
    }
}

response = requests.post("http://localhost:8000/api/v1/calculate/ifrs17", json=data)
result = response.json()
```

### Solvency II Calculation

```python
data = {
    "policies": [...],  # Same policy structure
    "assumptions": {
        "confidence_level": 0.995,
        "time_horizon": 1,
        "market_risk_factor": 0.25,
        "credit_risk_factor": 0.15,
        "underwriting_risk_factor": 0.20,
        "operational_risk_factor": 0.10
    }
}

response = requests.post("http://localhost:8000/api/v1/calculate/solvency", json=data)
result = response.json()
```

## Architecture

The engine is built with a modular architecture:

- **Models**: Pydantic models for request/response validation
- **Calculations**: Core actuarial calculation logic
- **Utils**: Utility functions for common actuarial operations
- **Main**: FastAPI application with endpoint definitions

## Performance

- Optimized for portfolios with 10,000+ policies
- Vectorized calculations using NumPy and Pandas
- Typical calculation time: < 5 seconds for 10,000 policies
- Memory efficient processing of large datasets

## Development

To run in development mode:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## Deployment

The engine is designed to be deployed as a Google Cloud Function or similar serverless platform. See the deployment configuration in the main project directory.

## License

Part of the Valuact project. See main project license.
