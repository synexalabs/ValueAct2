/**
 * React hook for running actuarial calculations via the API
 * Uses the generalized API utility from ../utils/api
 */

import { useState, useCallback } from 'react';
import { calculations } from '../utils/api';

export function useCalculation() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [results, setResults] = useState(null);
    const [progress, setProgress] = useState(0);

    /**
     * Run IFRS 17 calculation
     */
    const runIFRS17 = useCallback(async (portfolio, assumptions) => {
        setLoading(true);
        setError(null);
        setProgress(0);

        try {
            const response = await calculations.runIFRS17(portfolio, assumptions);
            setResults(response.data);
            setProgress(100);
            return response.data;
        } catch (err) {
            const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message;
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Run Solvency II calculation
     */
    const runSolvency = useCallback(async (portfolio, assumptions) => {
        setLoading(true);
        setError(null);
        setProgress(0);

        try {
            const response = await calculations.runSolvency(portfolio, assumptions);
            setResults(response.data);
            setProgress(100);
            return response.data;
        } catch (err) {
            const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message;
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Get calculation history
     */
    const getHistory = useCallback(async (params) => {
        try {
            const response = await calculations.getHistory(params);
            return response.data;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, []);

    /**
      * Get single calculation result
      */
    const getResult = useCallback(async (calculationId) => {
        try {
            const response = await calculations.getResult(calculationId);
            return response.data;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, []);


    /**
     * Reset state
     */
    const reset = useCallback(() => {
        setResults(null);
        setError(null);
        setProgress(0);
        setLoading(false);
    }, []);

    return {
        loading,
        error,
        results,
        progress,
        runIFRS17,
        runSolvency,
        getHistory,
        getResult,
        reset,
    };
}

export default useCalculation;
