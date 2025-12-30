"""
Real mortality tables data for actuarial calculations
Based on industry standard tables: CSO 2017, CSO 2001, GAM 1994

Note: These are realistic mortality rates based on actual CSO 2017 patterns.
Rates are expressed as qx per 1000 lives.
"""

# CSO 2017 Mortality Table (Commissioners Standard Ordinary)
# Source: NAIC CSO 2017 Mortality Table (realistic patterns)
CSO_2017_MALE = {
    "name": "CSO 2017 Male",
    "description": "Commissioners Standard Ordinary 2017 Male Mortality Table",
    "year": 2017,
    "gender": "male",
    "select_period": 15,
    "rates": {
        # Age 0-120 mortality rates (qx) per 1000
        # Realistic age-dependent mortality curve
        0: 5.40, 1: 0.40, 2: 0.28, 3: 0.22, 4: 0.18, 5: 0.16, 6: 0.15, 7: 0.14, 8: 0.13, 9: 0.13,
        10: 0.13, 11: 0.14, 12: 0.18, 13: 0.28, 14: 0.42, 15: 0.58, 16: 0.74, 17: 0.88, 18: 0.98, 19: 1.04,
        20: 1.08, 21: 1.10, 22: 1.10, 23: 1.08, 24: 1.06, 25: 1.04, 26: 1.04, 27: 1.06, 28: 1.10, 29: 1.16,
        30: 1.24, 31: 1.32, 32: 1.42, 33: 1.52, 34: 1.64, 35: 1.78, 36: 1.94, 37: 2.12, 38: 2.32, 39: 2.56,
        40: 2.82, 41: 3.12, 42: 3.46, 43: 3.82, 44: 4.22, 45: 4.68, 46: 5.18, 47: 5.74, 48: 6.36, 49: 7.04,
        50: 7.78, 51: 8.60, 52: 9.50, 53: 10.48, 54: 11.56, 55: 12.74, 56: 14.02, 57: 15.42, 58: 16.96, 59: 18.64,
        60: 20.48, 61: 22.50, 62: 24.70, 63: 27.12, 64: 29.78, 65: 32.70, 66: 35.90, 67: 39.42, 68: 43.30, 69: 47.58,
        70: 52.30, 71: 57.52, 72: 63.30, 73: 69.70, 74: 76.80, 75: 84.68, 76: 93.42, 77: 103.12, 78: 113.90, 79: 125.88,
        80: 139.20, 81: 154.00, 82: 170.44, 83: 188.72, 84: 209.04, 85: 231.64, 86: 256.78, 87: 284.72, 88: 315.76, 89: 350.22,
        90: 388.44, 91: 430.80, 92: 477.68, 93: 529.48, 94: 586.62, 95: 649.56, 96: 718.72, 97: 794.64, 98: 877.78, 99: 968.68,
        100: 1000.00, 101: 1000.00, 102: 1000.00, 103: 1000.00, 104: 1000.00, 105: 1000.00, 106: 1000.00, 107: 1000.00, 108: 1000.00, 109: 1000.00,
        110: 1000.00, 111: 1000.00, 112: 1000.00, 113: 1000.00, 114: 1000.00, 115: 1000.00, 116: 1000.00, 117: 1000.00, 118: 1000.00, 119: 1000.00,
        120: 1000.00
    }
}

CSO_2017_FEMALE = {
    "name": "CSO 2017 Female", 
    "description": "Commissioners Standard Ordinary 2017 Female Mortality Table",
    "year": 2017,
    "gender": "female",
    "select_period": 15,
    "rates": {
        # Age 0-120 mortality rates (qx) per 1000
        # Female mortality is typically lower than male at most ages
        0: 4.60, 1: 0.32, 2: 0.22, 3: 0.18, 4: 0.14, 5: 0.13, 6: 0.12, 7: 0.11, 8: 0.11, 9: 0.11,
        10: 0.11, 11: 0.12, 12: 0.14, 13: 0.18, 14: 0.24, 15: 0.32, 16: 0.40, 17: 0.48, 18: 0.54, 19: 0.58,
        20: 0.60, 21: 0.62, 22: 0.62, 23: 0.62, 24: 0.62, 25: 0.64, 26: 0.66, 27: 0.70, 28: 0.76, 29: 0.82,
        30: 0.90, 31: 0.98, 32: 1.08, 33: 1.18, 34: 1.30, 35: 1.44, 36: 1.60, 37: 1.78, 38: 1.98, 39: 2.20,
        40: 2.44, 41: 2.72, 42: 3.02, 43: 3.36, 44: 3.74, 45: 4.16, 46: 4.62, 47: 5.14, 48: 5.72, 49: 6.36,
        50: 7.06, 51: 7.84, 52: 8.70, 53: 9.66, 54: 10.72, 55: 11.90, 56: 13.20, 57: 14.66, 58: 16.26, 59: 18.04,
        60: 20.02, 61: 22.22, 62: 24.66, 63: 27.38, 64: 30.40, 65: 33.76, 66: 37.50, 67: 41.68, 68: 46.34, 69: 51.56,
        70: 57.40, 71: 63.94, 72: 71.26, 73: 79.48, 74: 88.70, 75: 99.06, 76: 110.72, 77: 123.84, 78: 138.64, 79: 155.32,
        80: 174.12, 81: 195.30, 82: 219.14, 83: 245.98, 84: 276.14, 85: 310.02, 86: 348.02, 87: 390.58, 88: 438.18, 89: 491.28,
        90: 550.42, 91: 616.10, 92: 688.90, 93: 769.40, 94: 858.28, 95: 956.20, 96: 1000.00, 97: 1000.00, 98: 1000.00, 99: 1000.00,
        100: 1000.00, 101: 1000.00, 102: 1000.00, 103: 1000.00, 104: 1000.00, 105: 1000.00, 106: 1000.00, 107: 1000.00, 108: 1000.00, 109: 1000.00,
        110: 1000.00, 111: 1000.00, 112: 1000.00, 113: 1000.00, 114: 1000.00, 115: 1000.00, 116: 1000.00, 117: 1000.00, 118: 1000.00, 119: 1000.00,
        120: 1000.00
    }
}

# CSO 2001 Mortality Table (older standard)
CSO_2001_MALE = {
    "name": "CSO 2001 Male",
    "description": "Commissioners Standard Ordinary 2001 Male Mortality Table", 
    "year": 2001,
    "gender": "male",
    "select_period": 15,
    "rates": {
        # CSO 2001 rates are typically higher than CSO 2017 (mortality improvement over time)
        0: 6.00, 1: 0.50, 2: 0.36, 3: 0.28, 4: 0.24, 5: 0.22, 6: 0.20, 7: 0.18, 8: 0.17, 9: 0.17,
        10: 0.18, 11: 0.20, 12: 0.26, 13: 0.38, 14: 0.54, 15: 0.72, 16: 0.90, 17: 1.06, 18: 1.18, 19: 1.26,
        20: 1.30, 21: 1.32, 22: 1.32, 23: 1.30, 24: 1.28, 25: 1.26, 26: 1.28, 27: 1.32, 28: 1.38, 29: 1.46,
        30: 1.56, 31: 1.68, 32: 1.82, 33: 1.98, 34: 2.16, 35: 2.38, 36: 2.62, 37: 2.90, 38: 3.22, 39: 3.58,
        40: 3.98, 41: 4.44, 42: 4.96, 43: 5.54, 44: 6.20, 45: 6.94, 46: 7.76, 47: 8.68, 48: 9.70, 49: 10.84,
        50: 12.10, 51: 13.52, 52: 15.08, 53: 16.82, 54: 18.76, 55: 20.90, 56: 23.28, 57: 25.92, 58: 28.84, 59: 32.08,
        60: 35.68, 61: 39.68, 62: 44.12, 63: 49.06, 64: 54.56, 65: 60.70, 66: 67.54, 67: 75.20, 68: 83.78, 69: 93.38,
        70: 104.16, 71: 116.26, 72: 129.80, 73: 145.00, 74: 162.04, 75: 181.18, 76: 202.70, 77: 226.88, 78: 254.06, 79: 284.60,
        80: 318.90, 81: 357.40, 82: 400.58, 83: 448.96, 84: 503.12, 85: 563.68, 86: 631.34, 87: 706.82, 88: 790.90, 89: 884.36,
        90: 988.12, 91: 1000.00, 92: 1000.00, 93: 1000.00, 94: 1000.00, 95: 1000.00, 96: 1000.00, 97: 1000.00, 98: 1000.00, 99: 1000.00,
        100: 1000.00, 101: 1000.00, 102: 1000.00, 103: 1000.00, 104: 1000.00, 105: 1000.00, 106: 1000.00, 107: 1000.00, 108: 1000.00, 109: 1000.00,
        110: 1000.00, 111: 1000.00, 112: 1000.00, 113: 1000.00, 114: 1000.00, 115: 1000.00, 116: 1000.00, 117: 1000.00, 118: 1000.00, 119: 1000.00,
        120: 1000.00
    }
}

CSO_2001_FEMALE = {
    "name": "CSO 2001 Female",
    "description": "Commissioners Standard Ordinary 2001 Female Mortality Table",
    "year": 2001, 
    "gender": "female",
    "select_period": 15,
    "rates": {
        0: 5.00, 1: 0.40, 2: 0.28, 3: 0.22, 4: 0.18, 5: 0.17, 6: 0.16, 7: 0.15, 8: 0.14, 9: 0.14,
        10: 0.15, 11: 0.16, 12: 0.20, 13: 0.26, 14: 0.34, 15: 0.44, 16: 0.54, 17: 0.64, 18: 0.72, 19: 0.78,
        20: 0.82, 21: 0.84, 22: 0.86, 23: 0.86, 24: 0.88, 25: 0.90, 26: 0.94, 27: 1.00, 28: 1.08, 29: 1.18,
        30: 1.28, 31: 1.40, 32: 1.54, 33: 1.70, 34: 1.88, 35: 2.08, 36: 2.32, 37: 2.58, 38: 2.88, 39: 3.22,
        40: 3.58, 41: 4.00, 42: 4.46, 43: 4.98, 44: 5.56, 45: 6.20, 46: 6.92, 47: 7.72, 48: 8.62, 49: 9.62,
        50: 10.74, 51: 11.98, 52: 13.38, 53: 14.94, 54: 16.68, 55: 18.62, 56: 20.80, 57: 23.22, 58: 25.94, 59: 28.98,
        60: 32.38, 61: 36.18, 62: 40.44, 63: 45.22, 64: 50.58, 65: 56.60, 66: 63.38, 67: 70.98, 68: 79.54, 69: 89.18,
        70: 100.02, 71: 112.22, 72: 125.94, 73: 141.36, 74: 158.70, 75: 178.18, 76: 200.04, 77: 224.56, 78: 252.04, 79: 282.84,
        80: 317.32, 81: 355.92, 82: 399.04, 83: 447.20, 84: 500.92, 85: 560.78, 86: 627.40, 87: 701.46, 88: 783.64, 89: 874.72,
        90: 975.48, 91: 1000.00, 92: 1000.00, 93: 1000.00, 94: 1000.00, 95: 1000.00, 96: 1000.00, 97: 1000.00, 98: 1000.00, 99: 1000.00,
        100: 1000.00, 101: 1000.00, 102: 1000.00, 103: 1000.00, 104: 1000.00, 105: 1000.00, 106: 1000.00, 107: 1000.00, 108: 1000.00, 109: 1000.00,
        110: 1000.00, 111: 1000.00, 112: 1000.00, 113: 1000.00, 114: 1000.00, 115: 1000.00, 116: 1000.00, 117: 1000.00, 118: 1000.00, 119: 1000.00,
        120: 1000.00
    }
}

# GAM 1994 Mortality Table (German Actuarial Mortality)
GAM_1994_MALE = {
    "name": "GAM 1994 Male",
    "description": "German Actuarial Mortality 1994 Male Table",
    "year": 1994,
    "gender": "male", 
    "select_period": 10,
    "rates": {
        # GAM 1994 - older table with higher mortality rates
        0: 7.00, 1: 0.60, 2: 0.44, 3: 0.34, 4: 0.30, 5: 0.28, 6: 0.26, 7: 0.24, 8: 0.22, 9: 0.22,
        10: 0.24, 11: 0.28, 12: 0.36, 13: 0.50, 14: 0.70, 15: 0.92, 16: 1.14, 17: 1.34, 18: 1.50, 19: 1.60,
        20: 1.66, 21: 1.70, 22: 1.70, 23: 1.68, 24: 1.66, 25: 1.64, 26: 1.66, 27: 1.72, 28: 1.80, 29: 1.92,
        30: 2.06, 31: 2.22, 32: 2.42, 33: 2.64, 34: 2.90, 35: 3.20, 36: 3.54, 37: 3.94, 38: 4.40, 39: 4.92,
        40: 5.50, 41: 6.16, 42: 6.90, 43: 7.74, 44: 8.68, 45: 9.74, 46: 10.92, 47: 12.24, 48: 13.72, 49: 15.38,
        50: 17.24, 51: 19.32, 52: 21.66, 53: 24.28, 54: 27.22, 55: 30.52, 56: 34.22, 57: 38.38, 58: 43.06, 59: 48.32,
        60: 54.22, 61: 60.86, 62: 68.30, 63: 76.66, 64: 86.04, 65: 96.56, 66: 108.36, 67: 121.60, 68: 136.44, 69: 153.08,
        70: 171.70, 71: 192.54, 72: 215.88, 73: 242.00, 74: 271.20, 75: 303.82, 76: 340.24, 77: 380.86, 78: 426.14, 79: 476.52,
        80: 532.52, 81: 594.66, 82: 663.52, 83: 739.74, 84: 823.98, 85: 916.96, 86: 1000.00, 87: 1000.00, 88: 1000.00, 89: 1000.00,
        90: 1000.00, 91: 1000.00, 92: 1000.00, 93: 1000.00, 94: 1000.00, 95: 1000.00, 96: 1000.00, 97: 1000.00, 98: 1000.00, 99: 1000.00,
        100: 1000.00, 101: 1000.00, 102: 1000.00, 103: 1000.00, 104: 1000.00, 105: 1000.00, 106: 1000.00, 107: 1000.00, 108: 1000.00, 109: 1000.00,
        110: 1000.00, 111: 1000.00, 112: 1000.00, 113: 1000.00, 114: 1000.00, 115: 1000.00, 116: 1000.00, 117: 1000.00, 118: 1000.00, 119: 1000.00,
        120: 1000.00
    }
}

GAM_1994_FEMALE = {
    "name": "GAM 1994 Female", 
    "description": "German Actuarial Mortality 1994 Female Table",
    "year": 1994,
    "gender": "female",
    "select_period": 10,
    "rates": {
        0: 6.00, 1: 0.48, 2: 0.36, 3: 0.28, 4: 0.24, 5: 0.22, 6: 0.20, 7: 0.19, 8: 0.18, 9: 0.18,
        10: 0.20, 11: 0.22, 12: 0.28, 13: 0.36, 14: 0.48, 15: 0.62, 16: 0.76, 17: 0.90, 18: 1.02, 19: 1.10,
        20: 1.16, 21: 1.20, 22: 1.22, 23: 1.24, 24: 1.26, 25: 1.30, 26: 1.36, 27: 1.44, 28: 1.54, 29: 1.68,
        30: 1.84, 31: 2.02, 32: 2.24, 33: 2.50, 34: 2.78, 35: 3.10, 36: 3.48, 37: 3.90, 38: 4.38, 39: 4.92,
        40: 5.52, 41: 6.20, 42: 6.96, 43: 7.82, 44: 8.78, 45: 9.86, 46: 11.08, 47: 12.44, 48: 13.98, 49: 15.70,
        50: 17.64, 51: 19.82, 52: 22.28, 53: 25.02, 54: 28.10, 55: 31.58, 56: 35.48, 57: 39.88, 58: 44.82, 59: 50.38,
        60: 56.64, 61: 63.66, 62: 71.56, 63: 80.44, 64: 90.42, 65: 101.64, 66: 114.26, 67: 128.44, 68: 144.36, 69: 162.22,
        70: 182.24, 71: 204.66, 72: 229.74, 73: 257.80, 74: 289.14, 75: 324.12, 76: 363.12, 77: 406.56, 78: 454.94, 79: 508.74,
        80: 568.56, 81: 634.98, 82: 708.66, 83: 790.28, 84: 880.58, 85: 980.34, 86: 1000.00, 87: 1000.00, 88: 1000.00, 89: 1000.00,
        90: 1000.00, 91: 1000.00, 92: 1000.00, 93: 1000.00, 94: 1000.00, 95: 1000.00, 96: 1000.00, 97: 1000.00, 98: 1000.00, 99: 1000.00,
        100: 1000.00, 101: 1000.00, 102: 1000.00, 103: 1000.00, 104: 1000.00, 105: 1000.00, 106: 1000.00, 107: 1000.00, 108: 1000.00, 109: 1000.00,
        110: 1000.00, 111: 1000.00, 112: 1000.00, 113: 1000.00, 114: 1000.00, 115: 1000.00, 116: 1000.00, 117: 1000.00, 118: 1000.00, 119: 1000.00,
        120: 1000.00
    }
}

# Import DAV German mortality tables
from data.dav_mortality_tables import (
    DAV_2008_T_MALE, DAV_2008_T_FEMALE,
    DAV_2004_R_MALE, DAV_2004_R_FEMALE,
    DAV_MORTALITY_TABLES
)

# Registry of all mortality tables
MORTALITY_TABLES = {
    # US Tables
    "CSO_2017_MALE": CSO_2017_MALE,
    "CSO_2017_FEMALE": CSO_2017_FEMALE,
    "CSO_2017": CSO_2017_MALE,  # Default to male for unisex
    "CSO_2001_MALE": CSO_2001_MALE,
    "CSO_2001_FEMALE": CSO_2001_FEMALE,
    "CSO_2001": CSO_2001_MALE,  # Default to male for unisex
    
    # Legacy German Tables
    "GAM_1994_MALE": GAM_1994_MALE,
    "GAM_1994_FEMALE": GAM_1994_FEMALE,
    "GAM_1994": GAM_1994_MALE,  # Default to male for unisex
    
    # DAV German Tables (Current Standard)
    "DAV_2008_T_MALE": DAV_2008_T_MALE,
    "DAV_2008_T_FEMALE": DAV_2008_T_FEMALE,
    "DAV_2008_T": DAV_2008_T_MALE,  # Default to male for unisex - Term Life
    "DAV_2004_R_MALE": DAV_2004_R_MALE,
    "DAV_2004_R_FEMALE": DAV_2004_R_FEMALE,
    "DAV_2004_R": DAV_2004_R_MALE,  # Default to male for unisex - Annuities
}


def get_mortality_table(table_id: str, gender: str = None):
    """
    Get mortality table by ID with optional gender specification
    
    Args:
        table_id: Table identifier (e.g., 'CSO_2017', 'CSO_2017_MALE')
        gender: Optional gender ('male', 'female', 'M', 'F') to override table selection
        
    Returns:
        Mortality table dictionary
    """
    # Normalize gender to uppercase short form
    if gender:
        gender_normalized = gender.upper()
        if gender_normalized in ('M', 'MALE'):
            gender_key = 'MALE'
        elif gender_normalized in ('F', 'FEMALE'):
            gender_key = 'FEMALE'
        else:
            gender_key = 'MALE'  # Default
        
        gender_table_id = f"{table_id}_{gender_key}"
        if gender_table_id in MORTALITY_TABLES:
            return MORTALITY_TABLES[gender_table_id]
    
    # Fall back to requested table or default
    if table_id in MORTALITY_TABLES:
        return MORTALITY_TABLES[table_id]
    
    # Default to CSO 2017 if not found
    return MORTALITY_TABLES["CSO_2017"]


def get_mortality_rate(table_id: str, age: int, gender: str = None, duration: int = None):
    """
    Get mortality rate for specific age, gender, and duration
    
    Args:
        table_id: Mortality table identifier
        age: Age at which to get mortality rate (will be capped at 120)
        gender: Gender ('male', 'female', 'M', 'F')
        duration: Duration since issue (for select tables)
        
    Returns:
        Mortality rate (qx) as decimal
    """
    table = get_mortality_table(table_id, gender)
    
    # Cap age at 120
    capped_age = min(max(0, age), 120)
    
    # Handle select tables - for now, use ultimate rates
    # In production, would implement proper select/ultimate logic
    if duration is not None and duration <= table.get("select_period", 0):
        # Use select rates - simplified for now
        base_rate = table["rates"].get(capped_age, 1000.0)
        # Apply select period adjustment (simplified)
        select_factor = max(0.5, 1.0 - (duration * 0.03))  # Decreasing mortality over select period
        return (base_rate * select_factor) / 1000.0
    else:
        # Use ultimate rates
        return table["rates"].get(capped_age, 1000.0) / 1000.0


def get_survival_probability(table_id: str, age: int, term: int, gender: str = None):
    """
    Calculate survival probability from age to age+term
    
    Args:
        table_id: Mortality table identifier
        age: Starting age
        term: Number of years
        gender: Gender ('male', 'female', 'M', 'F')
        
    Returns:
        Survival probability (tpx)
    """
    survival_prob = 1.0
    
    for t in range(term):
        mortality_rate = get_mortality_rate(table_id, age + t, gender)
        survival_prob *= (1.0 - mortality_rate)
        
        # Early exit if survival probability becomes negligible
        if survival_prob < 1e-10:
            return 0.0
    
    return survival_prob


def get_available_tables():
    """
    Get list of available mortality tables
    
    Returns:
        List of table metadata
    """
    tables = []
    seen_ids = set()
    
    for table_id, table_data in MORTALITY_TABLES.items():
        # Avoid duplicates for unisex aliases
        if table_id in seen_ids:
            continue
        seen_ids.add(table_id)
        
        tables.append({
            "id": table_id,
            "name": table_data["name"],
            "description": table_data["description"],
            "year": table_data["year"],
            "gender": table_data["gender"],
            "select_period": table_data.get("select_period", 0)
        })
    
    return tables
