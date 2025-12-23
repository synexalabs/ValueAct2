'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import {
    ChevronRight,
    ChevronLeft,
    CheckCircle,
    Play,
    Loader,
    AlertCircle,
    ArrowRight
} from 'lucide-react';

import FileUploader from '../../../components/DataManagement/FileUploader';
import ValidationStatus from '../../../components/DataManagement/ValidationStatus';
import DataPreview from '../../../components/DataManagement/DataPreview';

/**
 * DataManagement Page
 * Unified data management with wizard-style flow for actuarial data processing
 */
const DataManagement = () => {
    const router = useRouter();
    const { user } = useAuth();
    const [mode, setMode] = useState('actuarial'); // 'actuarial' or 'general' (for future)
    const [currentStep, setCurrentStep] = useState(1);
    const [files, setFiles] = useState([]);
    const [parsedFiles, setParsedFiles] = useState(null);
    const [validationResults, setValidationResults] = useState(null);
    const [completeValidation, setCompleteValidation] = useState(null);
    const [unifiedJson, setUnifiedJson] = useState(null);
    const [runId, setRunId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const steps = [
        { id: 1, name: 'Upload Files', description: 'Upload your data files' },
        { id: 2, name: 'Preview Data', description: 'Review uploaded data' },
        { id: 3, name: 'Validate', description: 'Validate data structure' },
        { id: 4, name: 'Confirm & Store', description: 'Save validated data' },
        { id: 5, name: 'Run Valuation', description: 'Execute IFRS 17 computation' }
    ];

    const uploadFiles = useCallback(async () => {
        if (files.length === 0) {
            setError('Please upload at least one file');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const formData = new FormData();
            files.forEach(file => {
                formData.append('files', file.file);
            });

            const response = await fetch('/api/data-management/upload', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || 'Upload failed');
            }

            setParsedFiles(result.parsedFiles);
            setCurrentStep(2);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [files]);

    const validateData = useCallback(async () => {
        if (!parsedFiles) {
            setError('No parsed files available');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/data-management/validate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ parsedFiles })
            });

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || 'Validation failed');
            }

            setValidationResults(result.validationResults);
            setCompleteValidation(result.completeValidation);
            setCurrentStep(3);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [parsedFiles]);

    const convertToJson = useCallback(async () => {
        if (!parsedFiles) {
            setError('No parsed files available');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/data-management/convert', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ parsedFiles })
            });

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || 'Conversion failed');
            }

            setUnifiedJson(result.unifiedJson);
            setCurrentStep(4);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [parsedFiles]);

    const saveData = useCallback(async () => {
        if (!unifiedJson) {
            setError('No unified JSON available');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/data-management/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    unifiedJson,
                    userId: user?.id || user?.email || 'guest'
                })
            });

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || 'Save failed');
            }

            setRunId(result.runId);
            setCurrentStep(5);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [unifiedJson]);

    const runValuation = useCallback(async () => {
        if (!runId) {
            setError('No run ID available');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/data-management/run-valuation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    runId,
                    userId: user?.id || user?.email || 'guest'
                })
            });

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || 'Valuation failed');
            }

            // TODO: Handle valuation completion
            console.log('Valuation started:', result);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [runId]);

    const handleFilesChange = useCallback((newFiles) => {
        setFiles(newFiles);
    }, []);

    const handleMetadataEdit = useCallback((metadata) => {
        // Update metadata in parsed files
        if (parsedFiles && parsedFiles.meta) {
            setParsedFiles(prev => ({
                ...prev,
                meta: {
                    ...prev.meta,
                    data: [metadata]
                }
            }));
        }
    }, [parsedFiles]);

    const nextStep = useCallback(() => {
        switch (currentStep) {
            case 1:
                uploadFiles();
                break;
            case 2:
                validateData();
                break;
            case 3:
                convertToJson();
                break;
            case 4:
                saveData();
                break;
            case 5:
                runValuation();
                break;
            default:
                break;
        }
    }, [currentStep, uploadFiles, validateData, convertToJson, saveData, runValuation]);

    const prevStep = useCallback(() => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    }, [currentStep]);

    const canProceed = () => {
        switch (currentStep) {
            case 1:
                return files.length > 0;
            case 2:
                return parsedFiles !== null;
            case 3:
                return completeValidation?.isValid || false;
            case 4:
                return unifiedJson !== null;
            case 5:
                return runId !== null;
            default:
                return false;
        }
    };

    const getStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <FileUploader
                        onFilesChange={handleFilesChange}
                        className="min-h-96"
                    />
                );
            case 2:
                return (
                    <DataPreview
                        parsedFiles={parsedFiles}
                        onMetadataEdit={handleMetadataEdit}
                        className="min-h-96"
                    />
                );
            case 3:
                return (
                    <ValidationStatus
                        validationResults={validationResults}
                        completeValidation={completeValidation}
                        className="min-h-96"
                    />
                );
            case 4:
                return (
                    <div className="min-h-96 flex items-center justify-center">
                        <div className="text-center space-y-4">
                            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
                            <h3 className="text-xl font-semibold text-gray-900">
                                Data Ready for Storage
                            </h3>
                            <p className="text-gray-600">
                                Your validated data will be saved to Firestore with run ID: <code className="bg-gray-100 px-2 py-1 rounded">{runId || 'pending...'}</code>
                            </p>
                        </div>
                    </div>
                );
            case 5:
                return (
                    <div className="min-h-96 flex items-center justify-center">
                        <div className="text-center space-y-4">
                            <Play className="h-16 w-16 text-blue-500 mx-auto" />
                            <h3 className="text-xl font-semibold text-gray-900">
                                Run IFRS 17 Valuation
                            </h3>
                            <p className="text-gray-600">
                                Execute actuarial computations on your validated data
                            </p>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Data Management</h1>
                    <p className="mt-2 text-gray-600">
                        Upload, validate, and process your Term Life actuarial data
                    </p>
                </div>

                {/* Stepper */}
                <div className="mb-8 overflow-x-auto pb-4">
                    <div className="flex items-center min-w-max">
                        {steps.map((step, index) => {
                            const isActive = currentStep === step.id;
                            const isCompleted = currentStep > step.id;
                            const isClickable = currentStep >= step.id;

                            return (
                                <div key={step.id} className="flex items-center">
                                    <button
                                        onClick={() => isClickable && setCurrentStep(step.id)}
                                        disabled={!isClickable}
                                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${isActive
                                            ? 'bg-blue-600 text-white'
                                            : isCompleted
                                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            }`}
                                    >
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isActive
                                            ? 'bg-white text-blue-600'
                                            : isCompleted
                                                ? 'bg-green-600 text-white'
                                                : 'bg-gray-300 text-gray-500'
                                            }`}>
                                            {isCompleted ? (
                                                <CheckCircle className="h-4 w-4" />
                                            ) : (
                                                <span className="text-xs font-medium">{step.id}</span>
                                            )}
                                        </div>
                                        <div className="text-left">
                                            <div className="font-medium">{step.name}</div>
                                            <div className="text-xs opacity-75">{step.description}</div>
                                        </div>
                                    </button>

                                    {index < steps.length - 1 && (
                                        <ChevronRight className="h-5 w-5 text-gray-400 mx-2" />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Error Display */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
                        >
                            <div className="flex items-center space-x-2">
                                <AlertCircle className="h-5 w-5 text-red-500" />
                                <span className="text-red-700">{error}</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Main Content */}
                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                >
                    {getStepContent()}
                </motion.div>

                {/* Navigation */}
                <div className="mt-8 flex items-center justify-between">
                    <button
                        onClick={prevStep}
                        disabled={currentStep === 1}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${currentStep === 1
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                    >
                        <ChevronLeft className="h-4 w-4" />
                        <span>Previous</span>
                    </button>

                    <div className="flex items-center space-x-4">
                        {currentStep === 5 && (
                            <button
                                onClick={() => router.push('/')}
                                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                            >
                                <span>Go to Home</span>
                                <ArrowRight className="h-4 w-4" />
                            </button>
                        )}

                        <button
                            onClick={nextStep}
                            disabled={!canProceed() || loading}
                            className={`flex items-center space-x-2 px-6 py-2 rounded-lg transition-colors ${canProceed() && !loading
                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                }`}
                        >
                            {loading ? (
                                <Loader className="h-4 w-4 animate-spin" />
                            ) : (
                                <ChevronRight className="h-4 w-4" />
                            )}
                            <span>
                                {currentStep === 5 ? 'Run Valuation' : 'Next'}
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DataManagement;
