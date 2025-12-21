"""
Batch processing engine for large portfolios.
Splits portfolios into chunks and processes them in parallel using ProcessPoolExecutor.
"""
import concurrent.futures
from typing import List, Dict, Any, Callable
import time
import math

# Placeholder for actual calculation function imports
# from ..calculations.ifrs17 import calculate_csm
# from ..calculations.solvency import calculate_scr

# Mock calculation functions for structure
def _mock_calculate_chunk_ifrs17(policies: List[Dict], assumptions: Dict) -> Dict:
    # Simulate processing time
    # time.sleep(0.1) 
    total_csm = 0
    total_fcf = 0
    results = []
    
    for pol in policies:
        # Simple Mock Logic
        prem = pol.get('premium', 0)
        csm = prem * 0.1
        fcf = prem * 0.8
        total_csm += csm
        total_fcf += fcf
        results.append({
            'policy_id': pol.get('id'),
            'csm': csm,
            'fcf': fcf
        })
        
    return {
        'aggregate_results': {
            'total_csm': total_csm,
            'total_fcf': total_fcf,
            'policy_count': len(policies)
        },
        'policy_results': results
    }

def _mock_calculate_chunk_solvency(policies: List[Dict], assumptions: Dict) -> Dict:
    total_scr = 0
    results = []
    
    for pol in policies:
        scr = pol.get('premium', 0) * 0.15
        total_scr += scr
        results.append({
            'policy_id': pol.get('id'),
            'scr': scr
        })
        
    return {
        'aggregate_results': {
            'total_scr': total_scr,
            'policy_count': len(policies)
        },
        'policy_results': results
    }


class BatchProcessor:
    def __init__(self, max_workers: int = 4, chunk_size: int = 1000):
        self.max_workers = max_workers
        self.chunk_size = chunk_size

    def process_portfolio(
        self, 
        policies: List[Dict], 
        calculation_type: str, 
        assumptions: Dict
    ) -> Dict[str, Any]:
        """
        Process a large portfolio in parallel chunks.
        """
        start_time = time.time()
        
        # Determine calculation function
        if calculation_type == 'ifrs17':
            calc_func = _mock_calculate_chunk_ifrs17
        elif calculation_type == 'solvency':
            calc_func = _mock_calculate_chunk_solvency
        else:
            raise ValueError(f"Unknown calculation type: {calculation_type}")

        # Create chunks
        chunks = [
            policies[i:i + self.chunk_size] 
            for i in range(0, len(policies), self.chunk_size)
        ]
        
        chunk_results = []
        
        # Parallel Execution
        with concurrent.futures.ProcessPoolExecutor(max_workers=self.max_workers) as executor:
            # map assumes order is preserved if needed, or use submit for more control
            futures = [
                executor.submit(calc_func, chunk, assumptions) 
                for chunk in chunks
            ]
            
            for future in concurrent.futures.as_completed(futures):
                try:
                    chunk_results.append(future.result())
                except Exception as exc:
                    print(f'Chunk processing generated an exception: {exc}')
                    # Handle or re-raise. For resilience, we might log and continue or fail batch.
                    raise exc

        # Aggregate Results
        aggregated = self._aggregate_results(chunk_results)
        
        aggregated['processing_stats'] = {
            'total_policies': len(policies),
            'chunk_count': len(chunks),
            'duration_seconds': time.time() - start_time,
            'max_workers': self.max_workers
        }
        
        return aggregated

    def _aggregate_results(self, chunk_results: List[Dict]) -> Dict:
        """Combine results from all chunks into a single response structure."""
        if not chunk_results:
            return {}
            
        final_agg = {}
        all_policy_results = []
        
        # Initialize keys from first chunk's aggregate
        first_agg = chunk_results[0].get('aggregate_results', {})
        for k in first_agg.keys():
            final_agg[k] = 0

        for batch in chunk_results:
            agg = batch.get('aggregate_results', {})
            # Sum numeric aggregates
            for k in final_agg.keys():
                final_agg[k] += agg.get(k, 0)
            
            # Extend policy list
            all_policy_results.extend(batch.get('policy_results', []))

        return {
            'aggregate_results': final_agg,
            'policy_results': all_policy_results
        }

# Example Usage
if __name__ == "__main__":
    # Create dummy portfolio
    portfolio = [{'id': i, 'premium': 1000} for i in range(5000)]
    
    processor = BatchProcessor(max_workers=4, chunk_size=1000)
    result = processor.process_portfolio(portfolio, 'ifrs17', {})
    
    print("Processing Complete")
    print(f"Stats: {result['processing_stats']}")
    print(f"Total CSM: {result['aggregate_results']['total_csm']}")
