# Data Management Guide

## Overview

The Valuact Data Management module provides a comprehensive solution for uploading, validating, and processing Term Life insurance actuarial data. This guide covers the complete workflow from file upload to IFRS 17 computation.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Data Structure](#data-structure)
3. [File Templates](#file-templates)
4. [Upload Process](#upload-process)
5. [Validation Rules](#validation-rules)
6. [API Reference](#api-reference)
7. [Troubleshooting](#troubleshooting)
8. [Examples](#examples)

## Getting Started

### Prerequisites

- Access to Valuact platform
- Term Life insurance data in CSV or Excel format
- Understanding of actuarial data requirements

### Quick Start

1. Navigate to **Data Management** in the sidebar
2. Upload your data files using the drag-and-drop interface
3. Preview and validate your data
4. Save validated data to Firestore
5. Run IFRS 17 valuation

## Data Structure

The Valuact platform uses a unified JSON structure for Term Life data:

```json
{
  "meta": {
    "run_id": "run_20250125_001",
    "upload_time": "2025-01-25T10:30:00Z",
    "user_id": "user_123",
    "version": "1.0",
    "scenario": "base",
    "product_type": "TermLife",
    "description": "Q4 2024 Term Life Valuation",
    "valuation_date": "2024-12-31T00:00:00Z"
  },
  "assumptions": {
    "discount_rates": {
      "risk_free_rate": 0.03,
      "credit_spread": 0.01,
      "liquidity_premium": 0.005
    },
    "mortality_tables": {
      "table_name": "2008VBT",
      "adjustment_factor": 1.0,
      "improvement_factor": 0.01
    },
    "expense_assumptions": {
      "initial_expense_ratio": 0.15,
      "renewal_expense_ratio": 0.05,
      "claim_expense_ratio": 0.05
    },
    "lapse_rates": {
      "first_year_lapse": 0.10,
      "renewal_lapse": 0.05,
      "lapse_improvement": 0.01
    }
  },
  "policies": [
    {
      "policy_id": "POL001",
      "issue_date": "2020-01-15",
      "issue_age": 35,
      "gender": "M",
      "sum_assured": 100000,
      "premium": 500,
      "policy_term": 20,
      "underwriting_class": "Standard",
      "payment_frequency": "Annual",
      "smoking_status": "NonSmoker",
      "occupation_class": "Office"
    }
  ],
  "actuals": [
    {
      "policy_id": "POL001",
      "period": 1,
      "date": "2021-01-15",
      "premium_received": 500,
      "claims_paid": 0,
      "expenses_incurred": 75,
      "lapses": 0,
      "surrenders": 0,
      "policy_count": 1
    }
  ]
}
```

## File Templates

### 1. Metadata Template (`meta_template.csv`)

**Purpose**: Run metadata and configuration

**Required Fields**:
- `run_id`: Unique identifier for the run
- `upload_time`: ISO timestamp of upload
- `user_id`: User identifier
- `product_type`: Must be "TermLife"
- `valuation_date`: Date for valuation

**Optional Fields**:
- `version`: Version number (default: "1.0")
- `scenario`: Scenario name (default: "base")
- `description`: Description of the run

**Example**:
```csv
run_id,upload_time,user_id,version,scenario,product_type,description,valuation_date
run_20250125_001,2025-01-25T10:30:00Z,user_123,1.0,base,TermLife,Q4 2024 Term Life Valuation,2024-12-31T00:00:00Z
```

### 2. Assumptions Template (`assumptions_template.csv`)

**Purpose**: Economic and actuarial assumptions

**Required Fields**:
- `category`: Assumption category (discount_rates, mortality_tables, expense_assumptions, lapse_rates)
- `subcategory`: Subcategory within the main category
- `parameter`: Parameter name
- `value`: Parameter value

**Example**:
```csv
category,subcategory,parameter,value,description
discount_rates,risk_free_rate,0.03,Risk-free interest rate for discounting
discount_rates,credit_spread,0.01,Credit spread for insurance liabilities
mortality_tables,table_name,2008VBT,Mortality table reference
expense_assumptions,initial_expense_ratio,0.15,Initial expense ratio
lapse_rates,first_year_lapse,0.10,First year lapse rate
```

### 3. Policies Template (`policies_template.csv`)

**Purpose**: Policy master data

**Required Fields**:
- `policy_id`: Unique policy identifier
- `issue_date`: Policy issue date (ISO format)
- `issue_age`: Issue age (18-80)
- `gender`: Gender (M/F)
- `sum_assured`: Sum assured amount
- `premium`: Annual premium
- `policy_term`: Policy term in years (1-50)

**Optional Fields**:
- `underwriting_class`: Preferred/Standard/Substandard
- `payment_frequency`: Annual/SemiAnnual/Quarterly/Monthly
- `smoking_status`: NonSmoker/Smoker
- `occupation_class`: Professional/Office/Manual/Hazardous

**Example**:
```csv
policy_id,issue_date,issue_age,gender,sum_assured,premium,policy_term,underwriting_class,payment_frequency,smoking_status,occupation_class
POL001,2020-01-15,35,M,100000,500,20,Standard,Annual,NonSmoker,Office
POL002,2020-02-20,42,F,150000,750,15,Preferred,Annual,NonSmoker,Professional
```

### 4. Actuals Template (`actuals_template.csv`)

**Purpose**: Historical cash flows and transactions

**Required Fields**:
- `policy_id`: Policy identifier (must match policies)
- `period`: Period number (1-50)
- `date`: Transaction date (ISO format)

**Optional Fields**:
- `premium_received`: Premium received in period
- `claims_paid`: Claims paid in period
- `expenses_incurred`: Expenses incurred in period
- `lapses`: Lapse rate for period (0-1)
- `surrenders`: Surrender rate for period (0-1)
- `policy_count`: Number of policies (default: 1)

**Example**:
```csv
policy_id,period,date,premium_received,claims_paid,expenses_incurred,lapses,surrenders,policy_count
POL001,1,2021-01-15,500,0,75,0,0,1
POL001,2,2022-01-15,500,0,25,0,0,1
POL002,1,2021-02-20,750,0,112.5,0,0,1
```

## Upload Process

### Step 1: Upload Files

1. Navigate to the Data Ingestion page
2. Use the drag-and-drop interface to upload files
3. Supported formats: CSV, XLSX, XLS
4. Maximum file size: 50MB per file
5. Maximum files: 4 (one per type)

### Step 2: Preview Data

1. Review uploaded data in the tabbed interface
2. Edit metadata if needed
3. Download individual files for verification
4. Check data statistics and quality

### Step 3: Validate

1. System automatically validates data structure
2. Review validation results and errors
3. Fix any validation issues
4. Download validation report if needed

### Step 4: Confirm & Store

1. Convert validated data to unified JSON
2. Save to Firestore with unique run ID
3. Confirm successful storage

### Step 5: Run Valuation

1. Trigger IFRS 17 computation
2. Monitor computation status
3. View results when complete

## Validation Rules

### Metadata Validation

- `run_id`: Required, alphanumeric with underscores/hyphens
- `upload_time`: Required, valid ISO date
- `user_id`: Required, non-empty string
- `product_type`: Required, must be "TermLife"
- `valuation_date`: Required, valid ISO date

### Assumptions Validation

- `category`: Required, must be one of: discount_rates, mortality_tables, expense_assumptions, lapse_rates
- `subcategory`: Required, non-empty string
- `parameter`: Required, non-empty string
- `value`: Optional, must be numeric if provided

### Policies Validation

- `policy_id`: Required, unique, alphanumeric
- `issue_date`: Required, valid ISO date
- `issue_age`: Required, integer between 18-80
- `gender`: Required, M or F
- `sum_assured`: Required, positive number
- `premium`: Required, non-negative number
- `policy_term`: Required, integer between 1-50

**Business Rules**:
- Issue age + policy term ≤ 120
- Premium should be < 10% of sum assured (warning)

### Actuals Validation

- `policy_id`: Required, must exist in policies
- `period`: Required, integer between 1-50
- `date`: Required, valid ISO date
- All cash flow fields: Non-negative numbers
- Lapse/surrender rates: Between 0-1

## API Reference

### Upload Files

**Endpoint**: `POST /api/data-management/upload`

**Request**: Multipart form data with files

**Response**:
```json
{
  "success": true,
  "parsedFiles": {
    "meta": { "data": [...], "columns": [...] },
    "assumptions": { "data": [...], "columns": [...] },
    "policies": { "data": [...], "columns": [...] },
    "actuals": { "data": [...], "columns": [...] }
  },
  "validationResults": { ... },
  "errors": []
}
```

### Validate Data

**Endpoint**: `POST /api/data-management/validate`

**Request**:
```json
{
  "parsedFiles": { ... }
}
```

**Response**:
```json
{
  "success": true,
  "validationResults": {
    "meta": { "isValid": true, "errors": [], "warnings": [] },
    "assumptions": { "isValid": true, "errors": [], "warnings": [] },
    "policies": { "isValid": true, "errors": [], "warnings": [] },
    "actuals": { "isValid": true, "errors": [], "warnings": [] }
  },
  "completeValidation": {
    "isValid": true,
    "errors": [],
    "warnings": []
  }
}
```

### Convert to JSON

**Endpoint**: `POST /api/data-management/convert`

**Request**:
```json
{
  "parsedFiles": { ... }
}
```

**Response**:
```json
{
  "success": true,
  "unifiedJson": { ... },
  "conversionValidation": {
    "isValid": true,
    "errors": [],
    "warnings": []
  }
}
```

### Save Data

**Endpoint**: `POST /api/data-management/save`

**Request**:
```json
{
  "unifiedJson": { ... },
  "userId": "user_123"
}
```

**Response**:
```json
{
  "success": true,
  "runId": "run_20250125_001",
  "metadata": { ... }
}
```

### Run Valuation

**Endpoint**: `POST /api/data-management/run-valuation`

**Request**:
```json
{
  "runId": "run_20250125_001",
  "userId": "user_123"
}
```

**Response**:
```json
{
  "success": true,
  "runId": "run_20250125_001",
  "status": "running",
  "message": "Valuation started"
}
```

### Check Status

**Endpoint**: `GET /api/data-management/status/:runId`

**Response**:
```json
{
  "success": true,
  "runId": "run_20250125_001",
  "status": "completed",
  "metadata": { ... }
}
```

## Troubleshooting

### Common Issues

#### 1. File Upload Errors

**Problem**: Files not uploading
**Solutions**:
- Check file format (CSV, XLSX, XLS only)
- Verify file size (< 50MB)
- Ensure file is not corrupted
- Check browser console for errors

#### 2. Validation Failures

**Problem**: Data validation errors
**Solutions**:
- Check required columns are present
- Verify data types match requirements
- Ensure numeric fields contain valid numbers
- Check date formats are ISO compliant

#### 3. Missing Required Files

**Problem**: Required files not uploaded
**Solutions**:
- Upload metadata file (meta_template.csv)
- Upload assumptions file (assumptions_template.csv)
- Upload policies file (policies_template.csv)
- Actuals file is optional but recommended

#### 4. Data Type Errors

**Problem**: Invalid data types
**Solutions**:
- Ensure numeric fields contain only numbers
- Check date fields are in ISO format (YYYY-MM-DD)
- Verify boolean fields are true/false
- Remove special characters from IDs

#### 5. Business Rule Violations

**Problem**: Business validation warnings
**Solutions**:
- Check age + term ≤ 120
- Verify premium is reasonable (< 10% of sum assured)
- Ensure policy IDs are unique
- Check date chronology

### Error Codes

| Code | Description | Solution |
|------|-------------|----------|
| FILE_TOO_LARGE | File exceeds 50MB limit | Compress or split file |
| INVALID_FORMAT | Unsupported file format | Convert to CSV/XLSX |
| MISSING_COLUMNS | Required columns missing | Add missing columns |
| INVALID_DATA_TYPE | Wrong data type | Fix data format |
| DUPLICATE_ID | Duplicate policy IDs | Make IDs unique |
| BUSINESS_RULE | Business rule violation | Fix data values |

## Examples

### Complete Example Dataset

See the `examples/` directory for complete sample datasets:

- `example_meta.csv` - Single row metadata
- `example_assumptions.csv` - Complete assumptions set
- `example_policies.csv` - 100 sample policies
- `example_actuals.csv` - Historical data for sample policies

### Sample Policy Data

```csv
policy_id,issue_date,issue_age,gender,sum_assured,premium,policy_term,underwriting_class,payment_frequency,smoking_status,occupation_class
POL001,2020-01-15,35,M,100000,500,20,Standard,Annual,NonSmoker,Office
POL002,2020-02-20,42,F,150000,750,15,Preferred,Annual,NonSmoker,Professional
POL003,2020-03-10,28,M,200000,1200,25,Standard,SemiAnnual,Smoker,Manual
POL004,2020-04-05,55,F,75000,600,10,Substandard,Annual,Smoker,Hazardous
POL005,2020-05-12,30,M,300000,1800,30,Preferred,Quarterly,NonSmoker,Professional
```

### Sample Assumptions Data

```csv
category,subcategory,parameter,value,description
discount_rates,risk_free_rate,0.03,Risk-free interest rate
discount_rates,credit_spread,0.01,Credit spread
discount_rates,liquidity_premium,0.005,Liquidity premium
mortality_tables,table_name,2008VBT,Mortality table
mortality_tables,adjustment_factor,1.0,Adjustment factor
mortality_tables,improvement_factor,0.01,Improvement factor
expense_assumptions,initial_expense_ratio,0.15,Initial expenses
expense_assumptions,renewal_expense_ratio,0.05,Renewal expenses
expense_assumptions,claim_expense_ratio,0.05,Claim expenses
lapse_rates,first_year_lapse,0.10,First year lapse
lapse_rates,renewal_lapse,0.05,Renewal lapse
lapse_rates,lapse_improvement,0.01,Lapse improvement
```

### Sample Actuals Data

```csv
policy_id,period,date,premium_received,claims_paid,expenses_incurred,lapses,surrenders,policy_count
POL001,1,2021-01-15,500,0,75,0,0,1
POL001,2,2022-01-15,500,0,25,0,0,1
POL001,3,2023-01-15,500,0,25,0,0,1
POL002,1,2021-02-20,750,0,112.5,0,0,1
POL002,2,2022-02-20,750,0,37.5,0,0,1
POL003,1,2021-03-10,600,0,90,0,0,1
POL003,2,2021-09-10,600,0,30,0,0,1
POL003,3,2022-03-10,600,0,30,0,0,1
```

## Best Practices

### Data Preparation

1. **Clean Data**: Remove duplicates, fix formatting issues
2. **Consistent Formats**: Use standard date formats, consistent naming
3. **Complete Data**: Fill in all required fields
4. **Validate Locally**: Check data before uploading

### File Organization

1. **Naming Convention**: Use descriptive filenames
2. **File Size**: Keep files under 50MB
3. **Backup**: Keep original files as backup
4. **Version Control**: Track changes to data files

### Quality Assurance

1. **Review Templates**: Use provided templates as guides
2. **Test with Samples**: Start with small datasets
3. **Validate Results**: Check validation reports carefully
4. **Document Changes**: Keep track of data modifications

## Support

For additional support:

1. Check the troubleshooting section above
2. Review the API documentation
3. Contact the Valuact support team
4. Check the platform status page

## Changelog

### Version 1.0 (2025-01-25)

- Initial release of Data Ingestion module
- Support for CSV and Excel file formats
- Comprehensive validation system
- Firestore integration
- IFRS 17 computation trigger
- Complete documentation and examples
