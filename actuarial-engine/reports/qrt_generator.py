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

    def generate_s12_01(self) -> pd.DataFrame:
        """
        S.12.01 - Life and Health SLT Technical Provisions.
        Detailed breakdown of technical provisions components.
        """
        # Extract values with defaults
        best_estimate = self.results.get('best_estimate', 0)
        risk_margin = self.results.get('risk_margin', 0)
        gross_tp = self.results.get('technical_provisions', best_estimate + risk_margin)
        reins_recoverable = self.results.get('reinsurance_recoverables', 0)
        net_tp = gross_tp - reins_recoverable
        
        # IFRS 17 specific fields if available
        csm = self.results.get('total_csm', 0)
        loss_component = self.results.get('loss_component', 0)
        
        items = [
            ('R0010', 'Technical provisions calculated as a whole', 0),
            ('R0020', 'Best Estimate', best_estimate),
            ('R0030', 'Risk margin', risk_margin),
            ('R0040', 'Technical provisions - total (gross)', gross_tp),
            ('R0050', 'Reinsurance recoverables', reins_recoverable),
            ('R0060', 'Technical provisions minus recoverables (net)', net_tp),
            ('R0070', 'CSM (IFRS 17)', csm),
            ('R0080', 'Loss component (IFRS 17)', loss_component),
        ]
        
        return pd.DataFrame({
            'Row ID': [i[0] for i in items],
            'Item': [i[1] for i in items],
            'Value': [i[2] for i in items],
            'Currency': ['EUR'] * len(items),
            'Date': [self.reporting_date.strftime('%Y-%m-%d')] * len(items)
        })

    def generate_s25_01(self) -> pd.DataFrame:
        """
        S.25.01 - Solvency Capital Requirement - for undertakings on Standard Formula.
        Detailed breakdown of SCR components (Market, Life, Health, etc.).
        """
        scr_components = self.results.get('scr_components', {})
        aggregate = self.results.get('aggregate_results', self.results)
        
        # Standard formula risk modules with sub-risks
        risk_items = [
            # Market risk module
            ('R0010', 'Interest rate risk', scr_components.get('interest_rate_risk', aggregate.get('interest_rate_risk', 0))),
            ('R0020', 'Equity risk', scr_components.get('equity_risk', aggregate.get('equity_risk', 0))),
            ('R0030', 'Property risk', scr_components.get('property_risk', aggregate.get('property_risk', 0))),
            ('R0040', 'Spread risk', scr_components.get('spread_risk', aggregate.get('spread_risk', 0))),
            ('R0050', 'Currency risk', scr_components.get('currency_risk', aggregate.get('currency_risk', 0))),
            ('R0060', 'Concentration risk', scr_components.get('concentration_risk', 0)),
            ('R0100', 'Total Market risk', scr_components.get('market_risk', aggregate.get('market_risk', 0))),
            # Life underwriting risk module
            ('R0110', 'Mortality risk', scr_components.get('mortality_risk', aggregate.get('mortality_risk', 0))),
            ('R0120', 'Longevity risk', scr_components.get('longevity_risk', aggregate.get('longevity_risk', 0))),
            ('R0130', 'Disability-morbidity risk', scr_components.get('disability_risk', 0)),
            ('R0140', 'Lapse risk', scr_components.get('lapse_risk', aggregate.get('lapse_risk', 0))),
            ('R0150', 'Expense risk', scr_components.get('expense_risk', aggregate.get('expense_risk', 0))),
            ('R0160', 'Life catastrophe risk', scr_components.get('life_cat_risk', aggregate.get('life_cat_risk', 0))),
            ('R0200', 'Total Life underwriting risk', scr_components.get('life_underwriting_risk', aggregate.get('life_underwriting_risk', 0))),
            # Other modules
            ('R0210', 'Counterparty default risk', scr_components.get('counterparty_default_risk', aggregate.get('counterparty_default_risk', 0))),
            ('R0220', 'Health underwriting risk', scr_components.get('health_underwriting_risk', aggregate.get('health_underwriting_risk', 0))),
            # Aggregation
            ('R0300', 'Basic Solvency Capital Requirement', scr_components.get('bscr', aggregate.get('bscr', 0))),
            ('R0310', 'Operational risk', scr_components.get('operational_risk', aggregate.get('operational_risk_charge', 0))),
            ('R0400', 'Solvency Capital Requirement (SCR)', self.results.get('total_scr', aggregate.get('total_scr', 0))),
        ]

        return pd.DataFrame({
            'Row ID': [i[0] for i in risk_items],
            'Risk Module': [i[1] for i in risk_items],
            'SCR Value': [i[2] for i in risk_items],
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
