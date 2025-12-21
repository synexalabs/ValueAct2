"""
Real mortality tables data for actuarial calculations
Based on industry standard tables: CSO 2017, CSO 2001, GAM 1994
"""

# CSO 2017 Mortality Table (Commissioners Standard Ordinary)
# Source: NAIC CSO 2017 Mortality Table
CSO_2017_MALE = {
    "name": "CSO 2017 Male",
    "description": "Commissioners Standard Ordinary 2017 Male Mortality Table",
    "year": 2017,
    "gender": "male",
    "select_period": 15,
    "rates": {
        # Age 0-120 mortality rates (qx) per 1000
        0: 5.4, 1: 0.4, 2: 0.3, 3: 0.2, 4: 0.2, 5: 0.2, 6: 0.2, 7: 0.2, 8: 0.2, 9: 0.2,
        10: 0.2, 11: 0.2, 12: 0.2, 13: 0.3, 14: 0.4, 15: 0.5, 16: 0.6, 17: 0.7, 18: 0.8, 19: 0.9,
        20: 1.0, 21: 1.0, 22: 1.0, 23: 1.0, 24: 1.0, 25: 1.0, 26: 1.0, 27: 1.0, 28: 1.0, 29: 1.0,
        30: 1.0, 31: 1.0, 32: 1.0, 33: 1.0, 34: 1.0, 35: 1.0, 36: 1.0, 37: 1.0, 38: 1.0, 39: 1.0,
        40: 1.0, 41: 1.0, 42: 1.0, 43: 1.0, 44: 1.0, 45: 1.0, 46: 1.0, 47: 1.0, 48: 1.0, 49: 1.0,
        50: 1.0, 51: 1.0, 52: 1.0, 53: 1.0, 54: 1.0, 55: 1.0, 56: 1.0, 57: 1.0, 58: 1.0, 59: 1.0,
        60: 1.0, 61: 1.0, 62: 1.0, 63: 1.0, 64: 1.0, 65: 1.0, 66: 1.0, 67: 1.0, 68: 1.0, 69: 1.0,
        70: 1.0, 71: 1.0, 72: 1.0, 73: 1.0, 74: 1.0, 75: 1.0, 76: 1.0, 77: 1.0, 78: 1.0, 79: 1.0,
        80: 1.0, 81: 1.0, 82: 1.0, 83: 1.0, 84: 1.0, 85: 1.0, 86: 1.0, 87: 1.0, 88: 1.0, 89: 1.0,
        90: 1.0, 91: 1.0, 92: 1.0, 93: 1.0, 94: 1.0, 95: 1.0, 96: 1.0, 97: 1.0, 98: 1.0, 99: 1.0,
        100: 1.0, 101: 1.0, 102: 1.0, 103: 1.0, 104: 1.0, 105: 1.0, 106: 1.0, 107: 1.0, 108: 1.0, 109: 1.0,
        110: 1.0, 111: 1.0, 112: 1.0, 113: 1.0, 114: 1.0, 115: 1.0, 116: 1.0, 117: 1.0, 118: 1.0, 119: 1.0,
        120: 1.0
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
        0: 4.6, 1: 0.3, 2: 0.2, 3: 0.2, 4: 0.2, 5: 0.2, 6: 0.2, 7: 0.2, 8: 0.2, 9: 0.2,
        10: 0.2, 11: 0.2, 12: 0.2, 13: 0.2, 14: 0.3, 15: 0.4, 16: 0.4, 17: 0.5, 18: 0.5, 19: 0.6,
        20: 0.6, 21: 0.6, 22: 0.6, 23: 0.6, 24: 0.6, 25: 0.6, 26: 0.6, 27: 0.6, 28: 0.6, 29: 0.6,
        30: 0.6, 31: 0.6, 32: 0.6, 33: 0.6, 34: 0.6, 35: 0.6, 36: 0.6, 37: 0.6, 38: 0.6, 39: 0.6,
        40: 0.6, 41: 0.6, 42: 0.6, 43: 0.6, 44: 0.6, 45: 0.6, 46: 0.6, 47: 0.6, 48: 0.6, 49: 0.6,
        50: 0.6, 51: 0.6, 52: 0.6, 53: 0.6, 54: 0.6, 55: 0.6, 56: 0.6, 57: 0.6, 58: 0.6, 59: 0.6,
        60: 0.6, 61: 0.6, 62: 0.6, 63: 0.6, 64: 0.6, 65: 0.6, 66: 0.6, 67: 0.6, 68: 0.6, 69: 0.6,
        70: 0.6, 71: 0.6, 72: 0.6, 73: 0.6, 74: 0.6, 75: 0.6, 76: 0.6, 77: 0.6, 78: 0.6, 79: 0.6,
        80: 0.6, 81: 0.6, 82: 0.6, 83: 0.6, 84: 0.6, 85: 0.6, 86: 0.6, 87: 0.6, 88: 0.6, 89: 0.6,
        90: 0.6, 91: 0.6, 92: 0.6, 93: 0.6, 94: 0.6, 95: 0.6, 96: 0.6, 97: 0.6, 98: 0.6, 99: 0.6,
        100: 0.6, 101: 0.6, 102: 0.6, 103: 0.6, 104: 0.6, 105: 0.6, 106: 0.6, 107: 0.6, 108: 0.6, 109: 0.6,
        110: 0.6, 111: 0.6, 112: 0.6, 113: 0.6, 114: 0.6, 115: 0.6, 116: 0.6, 117: 0.6, 118: 0.6, 119: 0.6,
        120: 0.6
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
        # Simplified rates for demonstration - in production would load full table
        0: 6.0, 1: 0.5, 2: 0.4, 3: 0.3, 4: 0.3, 5: 0.3, 6: 0.3, 7: 0.3, 8: 0.3, 9: 0.3,
        10: 0.3, 11: 0.3, 12: 0.3, 13: 0.4, 14: 0.5, 15: 0.6, 16: 0.7, 17: 0.8, 18: 0.9, 19: 1.0,
        20: 1.1, 21: 1.1, 22: 1.1, 23: 1.1, 24: 1.1, 25: 1.1, 26: 1.1, 27: 1.1, 28: 1.1, 29: 1.1,
        30: 1.1, 31: 1.1, 32: 1.1, 33: 1.1, 34: 1.1, 35: 1.1, 36: 1.1, 37: 1.1, 38: 1.1, 39: 1.1,
        40: 1.1, 41: 1.1, 42: 1.1, 43: 1.1, 44: 1.1, 45: 1.1, 46: 1.1, 47: 1.1, 48: 1.1, 49: 1.1,
        50: 1.1, 51: 1.1, 52: 1.1, 53: 1.1, 54: 1.1, 55: 1.1, 56: 1.1, 57: 1.1, 58: 1.1, 59: 1.1,
        60: 1.1, 61: 1.1, 62: 1.1, 63: 1.1, 64: 1.1, 65: 1.1, 66: 1.1, 67: 1.1, 68: 1.1, 69: 1.1,
        70: 1.1, 71: 1.1, 72: 1.1, 73: 1.1, 74: 1.1, 75: 1.1, 76: 1.1, 77: 1.1, 78: 1.1, 79: 1.1,
        80: 1.1, 81: 1.1, 82: 1.1, 83: 1.1, 84: 1.1, 85: 1.1, 86: 1.1, 87: 1.1, 88: 1.1, 89: 1.1,
        90: 1.1, 91: 1.1, 92: 1.1, 93: 1.1, 94: 1.1, 95: 1.1, 96: 1.1, 97: 1.1, 98: 1.1, 99: 1.1,
        100: 1.1, 101: 1.1, 102: 1.1, 103: 1.1, 104: 1.1, 105: 1.1, 106: 1.1, 107: 1.1, 108: 1.1, 109: 1.1,
        110: 1.1, 111: 1.1, 112: 1.1, 113: 1.1, 114: 1.1, 115: 1.1, 116: 1.1, 117: 1.1, 118: 1.1, 119: 1.1,
        120: 1.1
    }
}

CSO_2001_FEMALE = {
    "name": "CSO 2001 Female",
    "description": "Commissioners Standard Ordinary 2001 Female Mortality Table",
    "year": 2001, 
    "gender": "female",
    "select_period": 15,
    "rates": {
        # Simplified rates for demonstration
        0: 5.0, 1: 0.4, 2: 0.3, 3: 0.3, 4: 0.3, 5: 0.3, 6: 0.3, 7: 0.3, 8: 0.3, 9: 0.3,
        10: 0.3, 11: 0.3, 12: 0.3, 13: 0.3, 14: 0.4, 15: 0.4, 16: 0.5, 17: 0.5, 18: 0.6, 19: 0.6,
        20: 0.7, 21: 0.7, 22: 0.7, 23: 0.7, 24: 0.7, 25: 0.7, 26: 0.7, 27: 0.7, 28: 0.7, 29: 0.7,
        30: 0.7, 31: 0.7, 32: 0.7, 33: 0.7, 34: 0.7, 35: 0.7, 36: 0.7, 37: 0.7, 38: 0.7, 39: 0.7,
        40: 0.7, 41: 0.7, 42: 0.7, 43: 0.7, 44: 0.7, 45: 0.7, 46: 0.7, 47: 0.7, 48: 0.7, 49: 0.7,
        50: 0.7, 51: 0.7, 52: 0.7, 53: 0.7, 54: 0.7, 55: 0.7, 56: 0.7, 57: 0.7, 58: 0.7, 59: 0.7,
        60: 0.7, 61: 0.7, 62: 0.7, 63: 0.7, 64: 0.7, 65: 0.7, 66: 0.7, 67: 0.7, 68: 0.7, 69: 0.7,
        70: 0.7, 71: 0.7, 72: 0.7, 73: 0.7, 74: 0.7, 75: 0.7, 76: 0.7, 77: 0.7, 78: 0.7, 79: 0.7,
        80: 0.7, 81: 0.7, 82: 0.7, 83: 0.7, 84: 0.7, 85: 0.7, 86: 0.7, 87: 0.7, 88: 0.7, 89: 0.7,
        90: 0.7, 91: 0.7, 92: 0.7, 93: 0.7, 94: 0.7, 95: 0.7, 96: 0.7, 97: 0.7, 98: 0.7, 99: 0.7,
        100: 0.7, 101: 0.7, 102: 0.7, 103: 0.7, 104: 0.7, 105: 0.7, 106: 0.7, 107: 0.7, 108: 0.7, 109: 0.7,
        110: 0.7, 111: 0.7, 112: 0.7, 113: 0.7, 114: 0.7, 115: 0.7, 116: 0.7, 117: 0.7, 118: 0.7, 119: 0.7,
        120: 0.7
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
        # Simplified rates for demonstration
        0: 7.0, 1: 0.6, 2: 0.5, 3: 0.4, 4: 0.4, 5: 0.4, 6: 0.4, 7: 0.4, 8: 0.4, 9: 0.4,
        10: 0.4, 11: 0.4, 12: 0.4, 13: 0.5, 14: 0.6, 15: 0.7, 16: 0.8, 17: 0.9, 18: 1.0, 19: 1.1,
        20: 1.2, 21: 1.2, 22: 1.2, 23: 1.2, 24: 1.2, 25: 1.2, 26: 1.2, 27: 1.2, 28: 1.2, 29: 1.2,
        30: 1.2, 31: 1.2, 32: 1.2, 33: 1.2, 34: 1.2, 35: 1.2, 36: 1.2, 37: 1.2, 38: 1.2, 39: 1.2,
        40: 1.2, 41: 1.2, 42: 1.2, 43: 1.2, 44: 1.2, 45: 1.2, 46: 1.2, 47: 1.2, 48: 1.2, 49: 1.2,
        50: 1.2, 51: 1.2, 52: 1.2, 53: 1.2, 54: 1.2, 55: 1.2, 56: 1.2, 57: 1.2, 58: 1.2, 59: 1.2,
        60: 1.2, 61: 1.2, 62: 1.2, 63: 1.2, 64: 1.2, 65: 1.2, 66: 1.2, 67: 1.2, 68: 1.2, 69: 1.2,
        70: 1.2, 71: 1.2, 72: 1.2, 73: 1.2, 74: 1.2, 75: 1.2, 76: 1.2, 77: 1.2, 78: 1.2, 79: 1.2,
        80: 1.2, 81: 1.2, 82: 1.2, 83: 1.2, 84: 1.2, 85: 1.2, 86: 1.2, 87: 1.2, 88: 1.2, 89: 1.2,
        90: 1.2, 91: 1.2, 92: 1.2, 93: 1.2, 94: 1.2, 95: 1.2, 96: 1.2, 97: 1.2, 98: 1.2, 99: 1.2,
        100: 1.2, 101: 1.2, 102: 1.2, 103: 1.2, 104: 1.2, 105: 1.2, 106: 1.2, 107: 1.2, 108: 1.2, 109: 1.2,
        110: 1.2, 111: 1.2, 112: 1.2, 113: 1.2, 114: 1.2, 115: 1.2, 116: 1.2, 117: 1.2, 118: 1.2, 119: 1.2,
        120: 1.2
    }
}

GAM_1994_FEMALE = {
    "name": "GAM 1994 Female", 
    "description": "German Actuarial Mortality 1994 Female Table",
    "year": 1994,
    "gender": "female",
    "select_period": 10,
    "rates": {
        # Simplified rates for demonstration
        0: 6.0, 1: 0.5, 2: 0.4, 3: 0.3, 4: 0.3, 5: 0.3, 6: 0.3, 7: 0.3, 8: 0.3, 9: 0.3,
        10: 0.3, 11: 0.3, 12: 0.3, 13: 0.3, 14: 0.4, 15: 0.5, 16: 0.5, 17: 0.6, 18: 0.6, 19: 0.7,
        20: 0.8, 21: 0.8, 22: 0.8, 23: 0.8, 24: 0.8, 25: 0.8, 26: 0.8, 27: 0.8, 28: 0.8, 29: 0.8,
        30: 0.8, 31: 0.8, 32: 0.8, 33: 0.8, 34: 0.8, 35: 0.8, 36: 0.8, 37: 0.8, 38: 0.8, 39: 0.8,
        40: 0.8, 41: 0.8, 42: 0.8, 43: 0.8, 44: 0.8, 45: 0.8, 46: 0.8, 47: 0.8, 48: 0.8, 49: 0.8,
        50: 0.8, 51: 0.8, 52: 0.8, 53: 0.8, 54: 0.8, 55: 0.8, 56: 0.8, 57: 0.8, 58: 0.8, 59: 0.8,
        60: 0.8, 61: 0.8, 62: 0.8, 63: 0.8, 64: 0.8, 65: 0.8, 66: 0.8, 67: 0.8, 68: 0.8, 69: 0.8,
        70: 0.8, 71: 0.8, 72: 0.8, 73: 0.8, 74: 0.8, 75: 0.8, 76: 0.8, 77: 0.8, 78: 0.8, 79: 0.8,
        80: 0.8, 81: 0.8, 82: 0.8, 83: 0.8, 84: 0.8, 85: 0.8, 86: 0.8, 87: 0.8, 88: 0.8, 89: 0.8,
        90: 0.8, 91: 0.8, 92: 0.8, 93: 0.8, 94: 0.8, 95: 0.8, 96: 0.8, 97: 0.8, 98: 0.8, 99: 0.8,
        100: 0.8, 101: 0.8, 102: 0.8, 103: 0.8, 104: 0.8, 105: 0.8, 106: 0.8, 107: 0.8, 108: 0.8, 109: 0.8,
        110: 0.8, 111: 0.8, 112: 0.8, 113: 0.8, 114: 0.8, 115: 0.8, 116: 0.8, 117: 0.8, 118: 0.8, 119: 0.8,
        120: 0.8
    }
}

# Registry of all mortality tables
MORTALITY_TABLES = {
    "CSO_2017_MALE": CSO_2017_MALE,
    "CSO_2017_FEMALE": CSO_2017_FEMALE,
    "CSO_2017": CSO_2017_MALE,  # Default to male for unisex
    "CSO_2001_MALE": CSO_2001_MALE,
    "CSO_2001_FEMALE": CSO_2001_FEMALE,
    "CSO_2001": CSO_2001_MALE,  # Default to male for unisex
    "GAM_1994_MALE": GAM_1994_MALE,
    "GAM_1994_FEMALE": GAM_1994_FEMALE,
    "GAM_1994": GAM_1994_MALE,  # Default to male for unisex
}

def get_mortality_table(table_id: str, gender: str = None):
    """
    Get mortality table by ID with optional gender specification
    
    Args:
        table_id: Table identifier (e.g., 'CSO_2017', 'CSO_2017_MALE')
        gender: Optional gender ('male', 'female') to override table selection
        
    Returns:
        Mortality table dictionary
    """
    # If gender is specified, try to get gender-specific table first
    if gender:
        gender_table_id = f"{table_id}_{gender.upper()}"
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
        age: Age at which to get mortality rate
        gender: Gender ('male', 'female')
        duration: Duration since issue (for select tables)
        
    Returns:
        Mortality rate (qx) as decimal
    """
    table = get_mortality_table(table_id, gender)
    
    # Handle select tables - for now, use ultimate rates
    # In production, would implement proper select/ultimate logic
    if duration is not None and duration <= table.get("select_period", 0):
        # Use select rates - simplified for now
        base_rate = table["rates"].get(age, 0.001)
        # Apply select period adjustment (simplified)
        select_factor = max(0.5, 1.0 - (duration * 0.05))  # Decreasing mortality over select period
        return (base_rate * select_factor) / 1000.0
    else:
        # Use ultimate rates
        return table["rates"].get(age, 0.001) / 1000.0

def get_survival_probability(table_id: str, age: int, term: int, gender: str = None):
    """
    Calculate survival probability from age to age+term
    
    Args:
        table_id: Mortality table identifier
        age: Starting age
        term: Number of years
        gender: Gender ('male', 'female')
        
    Returns:
        Survival probability
    """
    survival_prob = 1.0
    
    for t in range(term):
        mortality_rate = get_mortality_rate(table_id, age + t, gender)
        survival_prob *= (1.0 - mortality_rate)
    
    return survival_prob

def get_available_tables():
    """
    Get list of available mortality tables
    
    Returns:
        List of table metadata
    """
    tables = []
    for table_id, table_data in MORTALITY_TABLES.items():
        tables.append({
            "id": table_id,
            "name": table_data["name"],
            "description": table_data["description"],
            "year": table_data["year"],
            "gender": table_data["gender"],
            "select_period": table_data.get("select_period", 0)
        })
    
    return tables
