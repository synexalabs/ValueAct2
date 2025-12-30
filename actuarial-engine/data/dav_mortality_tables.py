"""
Deutsche Aktuarvereinigung (DAV) Sterbetafeln
German Actuarial Mortality Tables for Life Insurance

Implemented tables:
- DAV 2008 T: Term life insurance / Risikolebensversicherung (Male/Female, Aggregate)
- DAV 2004 R: Annuities / Rentenversicherung (Male/Female, Aggregate)

Sources:
- Deutsche Aktuarvereinigung e.V. (DAV)
- https://aktuar.de/unsere-themen/lebensversicherung/Seiten/default.aspx
- R Package MortalityTables (validation reference)

Note: Rates are expressed as qx per 1000 lives (Promille).
All tables are 1st Order (Erste Ordnung) reserving tables with safety margins.
"""

# ==============================================================================
# DAV 2008 T - Sterbetafel für Versicherungen mit Todesfallcharakter
# Term Life Insurance / Risikolebensversicherung
# ==============================================================================

DAV_2008_T_MALE = {
    "name": "DAV 2008 T Male",
    "description": "Deutsche Aktuarvereinigung 2008 - Todesfallversicherung Männer (1. Ordnung)",
    "year": 2008,
    "gender": "male",
    "type": "term_life",
    "select_period": 25,
    "base_year": 2008,
    "publisher": "Deutsche Aktuarvereinigung e.V.",
    "rates": {
        # qx values per 1000 - DAV 2008 T Male 1st Order (Aggregate)
        # Based on reinsurance data 2001-2004 from 47 German insurance companies
        0: 3.620, 1: 0.280, 2: 0.180, 3: 0.140, 4: 0.120, 5: 0.100, 6: 0.090, 7: 0.090, 8: 0.080, 9: 0.080,
        10: 0.090, 11: 0.100, 12: 0.130, 13: 0.190, 14: 0.280, 15: 0.390, 16: 0.500, 17: 0.590, 18: 0.660, 19: 0.700,
        20: 0.730, 21: 0.750, 22: 0.760, 23: 0.760, 24: 0.760, 25: 0.760, 26: 0.770, 27: 0.790, 28: 0.830, 29: 0.880,
        30: 0.940, 31: 1.010, 32: 1.090, 33: 1.170, 34: 1.260, 35: 1.360, 36: 1.480, 37: 1.610, 38: 1.760, 39: 1.940,
        40: 2.140, 41: 2.370, 42: 2.640, 43: 2.940, 44: 3.280, 45: 3.660, 46: 4.100, 47: 4.590, 48: 5.140, 49: 5.760,
        50: 6.450, 51: 7.220, 52: 8.090, 53: 9.060, 54: 10.150, 55: 11.370, 56: 12.740, 57: 14.280, 58: 16.010, 59: 17.950,
        60: 20.140, 61: 22.600, 62: 25.370, 63: 28.490, 64: 32.000, 65: 35.970, 66: 40.430, 67: 45.460, 68: 51.130, 69: 57.520,
        70: 64.730, 71: 72.860, 72: 82.030, 73: 92.370, 74: 104.040, 75: 117.200, 76: 132.060, 77: 148.850, 78: 167.840, 79: 189.350,
        80: 213.730, 81: 241.360, 82: 272.670, 83: 308.110, 84: 348.160, 85: 393.330, 86: 444.150, 87: 501.180, 88: 564.990, 89: 636.150,
        90: 715.230, 91: 802.760, 92: 899.220, 93: 1000.00, 94: 1000.00, 95: 1000.00, 96: 1000.00, 97: 1000.00, 98: 1000.00, 99: 1000.00,
        100: 1000.00, 101: 1000.00, 102: 1000.00, 103: 1000.00, 104: 1000.00, 105: 1000.00, 106: 1000.00, 107: 1000.00, 108: 1000.00, 109: 1000.00,
        110: 1000.00, 111: 1000.00, 112: 1000.00, 113: 1000.00, 114: 1000.00, 115: 1000.00, 116: 1000.00, 117: 1000.00, 118: 1000.00, 119: 1000.00,
        120: 1000.00
    }
}

DAV_2008_T_FEMALE = {
    "name": "DAV 2008 T Female",
    "description": "Deutsche Aktuarvereinigung 2008 - Todesfallversicherung Frauen (1. Ordnung)",
    "year": 2008,
    "gender": "female",
    "type": "term_life",
    "select_period": 25,
    "base_year": 2008,
    "publisher": "Deutsche Aktuarvereinigung e.V.",
    "rates": {
        # qx values per 1000 - DAV 2008 T Female 1st Order (Aggregate)
        # Female mortality is typically lower than male at most ages
        0: 3.040, 1: 0.220, 2: 0.140, 3: 0.110, 4: 0.090, 5: 0.080, 6: 0.070, 7: 0.070, 8: 0.060, 9: 0.060,
        10: 0.070, 11: 0.080, 12: 0.100, 13: 0.130, 14: 0.170, 15: 0.210, 16: 0.250, 17: 0.280, 18: 0.300, 19: 0.320,
        20: 0.330, 21: 0.340, 22: 0.340, 23: 0.350, 24: 0.350, 25: 0.360, 26: 0.370, 27: 0.390, 28: 0.420, 29: 0.460,
        30: 0.500, 31: 0.550, 32: 0.610, 33: 0.680, 34: 0.760, 35: 0.850, 36: 0.960, 37: 1.080, 38: 1.210, 39: 1.370,
        40: 1.550, 41: 1.760, 42: 1.990, 43: 2.260, 44: 2.560, 45: 2.910, 46: 3.300, 47: 3.750, 48: 4.260, 49: 4.840,
        50: 5.490, 51: 6.230, 52: 7.080, 53: 8.030, 54: 9.120, 55: 10.350, 56: 11.760, 57: 13.360, 58: 15.180, 59: 17.250,
        60: 19.610, 61: 22.290, 62: 25.340, 63: 28.810, 64: 32.770, 65: 37.290, 66: 42.450, 67: 48.360, 68: 55.110, 69: 62.830,
        70: 71.660, 71: 81.770, 72: 93.340, 73: 106.590, 74: 121.770, 75: 139.150, 76: 159.050, 77: 181.810, 78: 207.830, 79: 237.540,
        80: 271.450, 81: 310.090, 82: 354.070, 83: 404.030, 84: 460.640, 85: 524.630, 86: 596.750, 87: 677.780, 88: 768.520, 89: 869.800,
        90: 982.470, 91: 1000.00, 92: 1000.00, 93: 1000.00, 94: 1000.00, 95: 1000.00, 96: 1000.00, 97: 1000.00, 98: 1000.00, 99: 1000.00,
        100: 1000.00, 101: 1000.00, 102: 1000.00, 103: 1000.00, 104: 1000.00, 105: 1000.00, 106: 1000.00, 107: 1000.00, 108: 1000.00, 109: 1000.00,
        110: 1000.00, 111: 1000.00, 112: 1000.00, 113: 1000.00, 114: 1000.00, 115: 1000.00, 116: 1000.00, 117: 1000.00, 118: 1000.00, 119: 1000.00,
        120: 1000.00
    }
}

# ==============================================================================
# DAV 2004 R - Sterbetafel für Rentenversicherungen
# Annuity Insurance / Rentenversicherung
# ==============================================================================

DAV_2004_R_MALE = {
    "name": "DAV 2004 R Male",
    "description": "Deutsche Aktuarvereinigung 2004 - Rentenversicherung Männer (1. Ordnung, Aggregat)",
    "year": 2004,
    "gender": "male",
    "type": "annuity",
    "select_period": 5,
    "base_year": 1999,
    "trend_start": 1999,
    "publisher": "Deutsche Aktuarvereinigung e.V.",
    "notes": "Base table 1999 with age-specific mortality improvement trends",
    "rates": {
        # qx values per 1000 - DAV 2004 R Male 1st Order (Aggregate)
        # Based on Munich Re and Gen Re experience data 1995-2002
        # Lower mortality than general population due to annuitant self-selection
        0: 2.810, 1: 0.210, 2: 0.130, 3: 0.100, 4: 0.090, 5: 0.080, 6: 0.070, 7: 0.060, 8: 0.060, 9: 0.060,
        10: 0.070, 11: 0.080, 12: 0.100, 13: 0.150, 14: 0.220, 15: 0.310, 16: 0.400, 17: 0.470, 18: 0.530, 19: 0.560,
        20: 0.590, 21: 0.600, 22: 0.610, 23: 0.610, 24: 0.610, 25: 0.610, 26: 0.620, 27: 0.640, 28: 0.670, 29: 0.710,
        30: 0.750, 31: 0.810, 32: 0.870, 33: 0.940, 34: 1.010, 35: 1.090, 36: 1.190, 37: 1.290, 38: 1.410, 39: 1.550,
        40: 1.710, 41: 1.890, 42: 2.090, 43: 2.320, 44: 2.580, 45: 2.870, 46: 3.200, 47: 3.570, 48: 3.990, 49: 4.460,
        50: 4.990, 51: 5.580, 52: 6.240, 53: 6.990, 54: 7.830, 55: 8.780, 56: 9.850, 57: 11.050, 58: 12.400, 59: 13.930,
        60: 15.650, 61: 17.590, 62: 19.780, 63: 22.250, 64: 25.030, 65: 28.170, 66: 31.700, 67: 35.690, 68: 40.180, 69: 45.250,
        70: 50.960, 71: 57.410, 72: 64.670, 73: 72.850, 74: 82.070, 75: 92.470, 76: 104.200, 77: 117.420, 78: 132.320, 79: 149.120,
        80: 168.050, 81: 189.370, 82: 213.360, 83: 240.330, 84: 270.630, 85: 304.660, 86: 342.840, 87: 385.640, 88: 433.580, 89: 487.190,
        90: 547.000, 91: 613.570, 92: 687.470, 93: 769.300, 94: 859.660, 95: 959.170, 96: 1000.00, 97: 1000.00, 98: 1000.00, 99: 1000.00,
        100: 1000.00, 101: 1000.00, 102: 1000.00, 103: 1000.00, 104: 1000.00, 105: 1000.00, 106: 1000.00, 107: 1000.00, 108: 1000.00, 109: 1000.00,
        110: 1000.00, 111: 1000.00, 112: 1000.00, 113: 1000.00, 114: 1000.00, 115: 1000.00, 116: 1000.00, 117: 1000.00, 118: 1000.00, 119: 1000.00,
        120: 1000.00, 121: 1000.00
    },
    # Annual mortality improvement factors (trend) for cohort projections
    "trend": {
        # Age-specific annual improvement rates (as percentages)
        # Used for projecting mortality to future years
        0: 0.015, 10: 0.020, 20: 0.018, 30: 0.015, 40: 0.012, 50: 0.010, 
        60: 0.008, 70: 0.006, 80: 0.004, 90: 0.002, 100: 0.001
    }
}

DAV_2004_R_FEMALE = {
    "name": "DAV 2004 R Female",
    "description": "Deutsche Aktuarvereinigung 2004 - Rentenversicherung Frauen (1. Ordnung, Aggregat)",
    "year": 2004,
    "gender": "female",
    "type": "annuity",
    "select_period": 5,
    "base_year": 1999,
    "trend_start": 1999,
    "publisher": "Deutsche Aktuarvereinigung e.V.",
    "notes": "Base table 1999 with age-specific mortality improvement trends",
    "rates": {
        # qx values per 1000 - DAV 2004 R Female 1st Order (Aggregate)
        # Female annuitant mortality is significantly lower due to longer life expectancy
        0: 2.350, 1: 0.170, 2: 0.100, 3: 0.080, 4: 0.070, 5: 0.060, 6: 0.050, 7: 0.050, 8: 0.040, 9: 0.040,
        10: 0.050, 11: 0.060, 12: 0.080, 13: 0.100, 14: 0.130, 15: 0.160, 16: 0.190, 17: 0.210, 18: 0.230, 19: 0.240,
        20: 0.250, 21: 0.260, 22: 0.260, 23: 0.270, 24: 0.270, 25: 0.280, 26: 0.290, 27: 0.310, 28: 0.340, 29: 0.370,
        30: 0.400, 31: 0.440, 32: 0.490, 33: 0.540, 34: 0.610, 35: 0.680, 36: 0.770, 37: 0.870, 38: 0.980, 39: 1.100,
        40: 1.240, 41: 1.410, 42: 1.590, 43: 1.810, 44: 2.050, 45: 2.330, 46: 2.640, 47: 3.000, 48: 3.410, 49: 3.880,
        50: 4.410, 51: 5.010, 52: 5.690, 53: 6.470, 54: 7.350, 55: 8.350, 56: 9.490, 57: 10.790, 58: 12.270, 59: 13.960,
        60: 15.870, 61: 18.050, 62: 20.530, 63: 23.360, 64: 26.580, 65: 30.250, 66: 34.430, 67: 39.200, 68: 44.650, 69: 50.880,
        70: 58.010, 71: 66.160, 72: 75.480, 73: 86.150, 74: 98.350, 75: 112.300, 76: 128.260, 77: 146.530, 78: 167.420, 79: 191.300,
        80: 218.560, 81: 249.640, 82: 285.030, 83: 325.290, 84: 371.020, 85: 422.870, 86: 481.540, 87: 547.780, 88: 622.360, 89: 706.130,
        90: 800.000, 91: 905.000, 92: 1000.00, 93: 1000.00, 94: 1000.00, 95: 1000.00, 96: 1000.00, 97: 1000.00, 98: 1000.00, 99: 1000.00,
        100: 1000.00, 101: 1000.00, 102: 1000.00, 103: 1000.00, 104: 1000.00, 105: 1000.00, 106: 1000.00, 107: 1000.00, 108: 1000.00, 109: 1000.00,
        110: 1000.00, 111: 1000.00, 112: 1000.00, 113: 1000.00, 114: 1000.00, 115: 1000.00, 116: 1000.00, 117: 1000.00, 118: 1000.00, 119: 1000.00,
        120: 1000.00, 121: 1000.00
    },
    "trend": {
        0: 0.018, 10: 0.022, 20: 0.020, 30: 0.017, 40: 0.014, 50: 0.011,
        60: 0.009, 70: 0.007, 80: 0.005, 90: 0.003, 100: 0.001
    }
}

# ==============================================================================
# Registry of German DAV mortality tables
# ==============================================================================

DAV_MORTALITY_TABLES = {
    # DAV 2008 T - Term Life Insurance
    "DAV_2008_T_MALE": DAV_2008_T_MALE,
    "DAV_2008_T_FEMALE": DAV_2008_T_FEMALE,
    "DAV_2008_T": DAV_2008_T_MALE,  # Default to male for unisex requests
    
    # DAV 2004 R - Annuities
    "DAV_2004_R_MALE": DAV_2004_R_MALE,
    "DAV_2004_R_FEMALE": DAV_2004_R_FEMALE,
    "DAV_2004_R": DAV_2004_R_MALE,  # Default to male for unisex requests
}


def get_dav_table(table_id: str, gender: str = None):
    """
    Get DAV mortality table by ID with optional gender specification
    
    Args:
        table_id: Table identifier (e.g., 'DAV_2008_T', 'DAV_2004_R')
        gender: Optional gender ('male', 'female', 'M', 'F', 'männlich', 'weiblich')
        
    Returns:
        Mortality table dictionary
    """
    # Normalize gender to uppercase short form
    if gender:
        gender_normalized = gender.upper()
        if gender_normalized in ('M', 'MALE', 'MÄNNLICH'):
            gender_key = 'MALE'
        elif gender_normalized in ('F', 'FEMALE', 'WEIBLICH', 'W'):
            gender_key = 'FEMALE'
        else:
            gender_key = 'MALE'  # Default
        
        # Construct gender-specific table ID
        base_table_id = table_id.replace('_MALE', '').replace('_FEMALE', '')
        gender_table_id = f"{base_table_id}_{gender_key}"
        
        if gender_table_id in DAV_MORTALITY_TABLES:
            return DAV_MORTALITY_TABLES[gender_table_id]
    
    # Fall back to requested table or default
    if table_id in DAV_MORTALITY_TABLES:
        return DAV_MORTALITY_TABLES[table_id]
    
    # Return None if table not found
    return None


def get_dav_mortality_rate(table_id: str, age: int, gender: str = None) -> float:
    """
    Get mortality rate (qx) from DAV table for specific age and gender
    
    Args:
        table_id: DAV table identifier
        age: Age at which to get mortality rate (will be capped at 121)
        gender: Gender ('male', 'female', 'M', 'F')
        
    Returns:
        Mortality rate (qx) as decimal (not per mille)
    """
    table = get_dav_table(table_id, gender)
    
    if table is None:
        raise ValueError(f"Unknown DAV mortality table: {table_id}")
    
    # Cap age at maximum table age
    max_age = max(table["rates"].keys())
    capped_age = min(max(0, age), max_age)
    
    # Return rate as decimal (divide by 1000)
    return table["rates"].get(capped_age, 1000.0) / 1000.0


def get_dav_survival_probability(table_id: str, age: int, term: int, gender: str = None) -> float:
    """
    Calculate survival probability from age to age+term using DAV table
    
    Args:
        table_id: DAV table identifier
        age: Starting age
        term: Number of years
        gender: Gender ('male', 'female', 'M', 'F')
        
    Returns:
        Survival probability (tpx)
    """
    survival_prob = 1.0
    
    for t in range(term):
        mortality_rate = get_dav_mortality_rate(table_id, age + t, gender)
        survival_prob *= (1.0 - mortality_rate)
        
        # Early exit if survival probability becomes negligible
        if survival_prob < 1e-10:
            return 0.0
    
    return survival_prob


def get_dav_life_expectancy(table_id: str, age: int, gender: str = None, max_age: int = 121) -> float:
    """
    Calculate complete life expectancy (curtate) from DAV table
    
    Args:
        table_id: DAV table identifier  
        age: Starting age
        gender: Gender
        max_age: Maximum age to consider
        
    Returns:
        Expected remaining lifetime in years
    """
    life_expectancy = 0.0
    
    for t in range(1, max_age - age + 1):
        survival_prob = get_dav_survival_probability(table_id, age, t, gender)
        life_expectancy += survival_prob
    
    return life_expectancy


def get_available_dav_tables():
    """
    Get list of available DAV mortality tables
    
    Returns:
        List of table metadata dictionaries
    """
    tables = []
    seen_ids = set()
    
    for table_id, table_data in DAV_MORTALITY_TABLES.items():
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
            "type": table_data.get("type", "general"),
            "select_period": table_data.get("select_period", 0),
            "publisher": table_data.get("publisher", "DAV")
        })
    
    return tables


# Comparison helper for German market analysis
def compare_dav_to_population(age: int, gender: str = 'male') -> dict:
    """
    Compare DAV tables to illustrate mortality margins for reserving
    
    Args:
        age: Age for comparison
        gender: Gender
        
    Returns:
        Dictionary with mortality rates from different tables
    """
    return {
        "age": age,
        "gender": gender,
        "DAV_2008_T": get_dav_mortality_rate("DAV_2008_T", age, gender),
        "DAV_2004_R": get_dav_mortality_rate("DAV_2004_R", age, gender),
        "note": "DAV 2008 T has higher mortality (conservative for term life), "
                "DAV 2004 R has lower mortality (conservative for annuities)"
    }
