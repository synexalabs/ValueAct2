"""
Solvency II Quantitative Reporting Templates (QRT) Generator.
Generates S.02.01 (Balance Sheet), S.12.01 (Life Technical Provisions),
and S.25.01 (Solvency Capital Requirement).
"""
from typing import Dict, Any, List
from datetime import datetime
import pandas as pd
import os

class QRTGenerator:
    """Generates Solvency II QRT reports from calculation results."""

    def __init__(self, calculation_results: Dict[str, Any]):
        """
        Initialize with calculation results.
        
        Args:
            calculation_results: Dictionary containing solvency calculation results
                                 (e.g., {'technical_provisions': 100, 'scr': 50, ...})
        """
        self.results = calculation_results
        self.reporting_date = datetime.now()

    def generate_s02_01(self) -> pd.DataFrame:
        """
        S.02.01 - Balance Sheet.
        Reports Own Funds, Technical Provisions, SCR, MCR, and Solvency Ratio.
        """
        # Extract values with defaults
        tp = self.results.get('technical_provisions', 0)
        best_estimate = self.results.get('best_estimate', 0)
        risk_margin = self.results.get('risk_margin', 0)
        own_funds = self.results.get('own_funds', 0)
        total_scr = self.results.get('total_scr', 0)
        mcr = self.results.get('mcr', 0)
        
        # Calculate ratio safely
        solvency_ratio = own_funds / total_scr if total_scr > 0 else 0

        return pd.DataFrame({
            'Item': [
                'Technical Provisions - Life',
                'Best Estimate',
                'Risk Margin',
                'Own Funds',
                'Solvency Capital Requirement (SCR)',
                'Minimum Capital Requirement (MCR)',
                'Solvency Ratio'
            ],
            'Value': [
                tp,
                best_estimate,
                risk_margin,
                own_funds,
                total_scr,
                mcr,
                solvency_ratio
            ],
            'Currency': ['EUR'] * 7,
            'Date': [self.reporting_date.strftime('%Y-%m-%d')] * 7
        })

    def generate_s25_01(self) -> pd.DataFrame:
        """
        S.25.01 - Solvency Capital Requirement - for undertakings on Standard Formula.
        Detailed breakdown of SCR components (Market, Life, Health, etc.).
        """
        scr_components = self.results.get('scr_components', {})
        
        # Standard formula risk modules
        # If components provided, map them. Otherwise return empty structure.
        risk_modules = [
            'Market risk',
            'Counterparty default risk',
            'Life underwriting risk',
            'Health underwriting risk',
            'Non-life underwriting risk',
            'Diversification',
            'Intangible asset risk',
            'Basic Solvency Capital Requirement'
        ]
        
        values = []
        for module in risk_modules:
            # Try to match key from results (assuming keys like 'market_risk', 'life_risk')
            key = module.lower().replace(' ', '_')
            values.append(scr_components.get(key, 0))

        return pd.DataFrame({
            'Risk Module': risk_modules,
            'SCR Value': values
        })

    def generate_summary_report(self) -> str:
        """Generates a text summary of the solvency position."""
        df = self.generate_s02_01()
        ratio = df.loc[df['Item'] == 'Solvency Ratio', 'Value'].values[0]
        
        status = "HEALTHY" if ratio >= 1.5 else ("WARNING" if ratio >= 1.0 else "CRITICAL")
        
        return f"""
        SOLVENCY II REPORT SUMMARY
        ==========================
        Date: {self.reporting_date.strftime('%Y-%m-%d')}
        Status: {status}
        
        Solvency Ratio: {ratio:.2%}
        Own Funds: {df.loc[df['Item'] == 'Own Funds', 'Value'].values[0]:,.2f}
        SCR: {df.loc[df['Item'] == 'Solvency Capital Requirement (SCR)', 'Value'].values[0]:,.2f}
        """

    def export_to_excel(self, output_path: str) -> None:
        """
        Export all generated templates to a single Excel file.
        
        Args:
            output_path: File path to save the Excel report.
        """
        # Ensure directory exists
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        with pd.ExcelWriter(output_path, engine='openpyxl') as writer:
            self.generate_s02_01().to_excel(writer, sheet_name='S.02.01 Balance Sheet', index=False)
            self.generate_s25_01().to_excel(writer, sheet_name='S.25.01 SCR', index=False)
            
            # Metadata sheet
            pd.DataFrame({
                'Property': ['Generated At', 'Generator Version'],
                'Value': [datetime.now(), '1.0.0']
            }).to_excel(writer, sheet_name='Metadata', index=False)

# Example usage (for testing)
if __name__ == "__main__":
    mock_results = {
        'technical_provisions': 5000000,
        'best_estimate': 4800000,
        'risk_margin': 200000,
        'own_funds': 2000000,
        'total_scr': 1000000,
        'mcr': 250000,
        'solvency_ratio': 2.0,
        'scr_components': {
            'market_risk': 400000,
            'life_underwriting_risk': 500000,
            'couterparty_default_risk': 50000,
            'diversification': -150000
        }
    }
    
    generator = QRTGenerator(mock_results)
    print(generator.generate_summary_report())
    # generator.export_to_excel('output/solvency_report.xlsx')
