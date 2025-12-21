# Data Format Quick Reference

## File Upload Requirements

### Supported Formats
- **CSV files only** (.csv extension)
- **Maximum file size**: 50MB recommended
- **Encoding**: UTF-8
- **Delimiter**: Comma (,)

### Required Columns by Module

#### IFRS 17 Module (policies.csv)
| Column | Type | Required | Description | Example |
|--------|------|----------|-------------|---------|
| `policy_id` | String | ✅ | Unique policy identifier | "POL001" |
| `premium` | Number | ✅ | Annual premium amount | 2205.45 |
| `claims_y1` | Number | ✅ | Claims for year 1 | 225.84 |
| `claims_y2` | Number | ✅ | Claims for year 2 | 148.03 |
| `claims_y3` | Number | ✅ | Claims for year 3 | 124.92 |
| `expenses_y1` | Number | ✅ | Expenses for year 1 | 27.86 |
| `expenses_y2` | Number | ✅ | Expenses for year 2 | 33.62 |
| `expenses_y3` | Number | ✅ | Expenses for year 3 | 32.37 |
| `profit_sharing_factor` | Number | ✅ | Profit sharing % (0-1) | 0.438 |

#### Pricing/GLM Module (customer_data.csv)
| Column | Type | Required | Description | Example |
|--------|------|----------|-------------|---------|
| `customer_id` | String | ✅ | Unique customer identifier | "CUST001" |
| `age` | Number | ✅ | Customer age (0-120) | 35 |
| `gender` | String | ✅ | M or F | "M" |
| `channel` | String | ✅ | Sales channel | "digital" |
| `premium_amount` | Number | ✅ | Premium amount (≥0) | 5000 |
| `lapse_indicator` | Number | ✅ | Lapse status (0 or 1) | 0 |
| `policy_term` | Number | ✅ | Policy term in years | 20 |

#### Solvency II Module (assets.csv)
| Column | Type | Required | Description | Example |
|--------|------|----------|-------------|---------|
| `asset_class` | String | ✅ | Asset classification | "Government Bonds" |
| `market_value` | Number | ✅ | Current market value | 1000000 |
| `duration` | Number | ✅ | Asset duration | 5.2 |
| `credit_rating` | String | ✅ | Credit rating | "AAA" |
| `risk_weight` | Number | ✅ | Risk weight factor | 0.0 |

## Data Validation Rules

### Numeric Fields
- Must be valid numbers (no text)
- Cannot be negative (unless specified)
- Cannot be empty/null
- Decimal values allowed

### String Fields
- Cannot be empty
- Will be trimmed of whitespace
- Case-sensitive for exact matches

### Date Fields
- Format: YYYY-MM-DD or MM/DD/YYYY
- Must be valid dates
- Cannot be in the future (for issue dates)

### ID Fields
- Must be unique within the dataset
- Cannot contain special characters
- Recommended format: alphanumeric

## Common Validation Errors

### Missing Required Columns
```
Error: Missing required columns: policy_id, premium
```
**Solution**: Ensure all required columns are present in your CSV header

### Invalid Data Types
```
Error: Row 5: premium must be a positive number
```
**Solution**: Check that numeric columns contain only numbers

### Duplicate IDs
```
Warning: Duplicate policy IDs found in the dataset
```
**Solution**: Ensure all ID values are unique

### Empty Values
```
Error: Row 10: policy_id cannot be empty
```
**Solution**: Fill in all required fields

## Sample Data Templates

### Minimal IFRS 17 Data
```csv
policy_id,premium,claims_y1,claims_y2,claims_y3,expenses_y1,expenses_y2,expenses_y3,profit_sharing_factor
POL001,1000,100,120,110,50,60,55,0.1
POL002,1500,150,180,165,75,90,82,0.15
```

### Minimal Pricing Data
```csv
customer_id,age,gender,channel,premium_amount,lapse_indicator,policy_term
CUST001,35,M,digital,5000,0,20
CUST002,42,F,agent,7500,1,15
```

### Minimal Solvency Data
```csv
asset_class,market_value,duration,credit_rating,risk_weight
Government Bonds,1000000,5.2,AAA,0.0
Corporate Bonds,500000,3.8,AA,0.1
```

## Tips for Success

1. **Use the sample files** as templates
2. **Check your data** before uploading
3. **Start small** with 10-20 rows for testing
4. **Validate manually** using Excel or similar tools
5. **Keep backups** of your original data
6. **Test incrementally** - upload small batches first

## Troubleshooting

### File Won't Upload
- Check file extension is .csv
- Verify file size is reasonable
- Ensure file is not corrupted

### Validation Errors
- Check column names match exactly
- Verify data types are correct
- Look for empty cells in required fields

### Processing Errors
- Reduce file size if too large
- Check for special characters in data
- Ensure consistent data formats

### Performance Issues
- Split large files into smaller chunks
- Remove unnecessary columns
- Check for duplicate data

## Support

If you encounter issues not covered in this guide:
1. Check the browser console for error messages
2. Verify your data matches the required format
3. Try with the provided sample data first
4. Contact support with specific error messages
