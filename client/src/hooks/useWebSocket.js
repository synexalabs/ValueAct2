/**
 * React hook for WebSocket connection
 * Handles real-time calculation updates and notifications
 *
 * @module hooks/useWebSocket
 */

'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Custom hook for WebSocket connection with calculation subscriptions
 * @returns {Object} WebSocket state and methods
 */
export function useWebSocket() {
    const socketRef = useRef(null);
    const [connected, setConnected] = useState(false);
    const [lastMessage, setLastMessage] = useState(null);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        // Only run in browser environment
        if (typeof window === 'undefined') return;

        const token = localStorage.getItem('authToken');

        socketRef.current = io(SOCKET_URL, {
            auth: { token },
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
        });

        socketRef.current.on('connect', () => {
            console.log('WebSocket connected');
            setConnected(true);
        });

        socketRef.current.on('disconnect', (reason) => {
            console.log('WebSocket disconnected:', reason);
            setConnected(false);
        });

        socketRef.current.on('connect_error', (error) => {
            console.error('WebSocket connection error:', error.message);
        });

        // Listen for notifications
        socketRef.current.on('notification', (data) => {
            setNotifications((prev) => [data, ...prev].slice(0, 50)); // Keep last 50
            setLastMessage(data);
        });

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, []);

    /**
     * Subscribe to calculation updates
     * @param {string} calculationId - Calculation ID to subscribe to
     * @param {Object} handlers - Event handlers
     * @param {Function} handlers.onProgress - Called on progress updates
     * @param {Function} handlers.onComplete - Called when calculation completes
     * @param {Function} handlers.onError - Called on calculation error
     * @returns {Function} Unsubscribe function
     */
    const subscribeToCalculation = useCallback((calculationId, handlers = {}) => {
        const socket = socketRef.current;
        if (!socket) {
            console.warn('WebSocket not connected');
            return () => { };
        }

        // Subscribe to calculation room
        socket.emit('subscribe:calculation', calculationId);

        // Set up event handlers
        const progressHandler = (data) => {
            if (data.calculationId === calculationId && handlers.onProgress) {
                handlers.onProgress(data);
            }
        };

        const completeHandler = (data) => {
            if (data.calculationId === calculationId && handlers.onComplete) {
                handlers.onComplete(data);
            }
        };

        const errorHandler = (data) => {
            if (data.calculationId === calculationId && handlers.onError) {
                handlers.onError(data);
            }
        };

        // Legacy update handler for backward compatibility
        const updateHandler = (data) => {
            if (data.calculationId === calculationId) {
                if (data.status === 'completed' && handlers.onComplete) {
                    handlers.onComplete(data);
                } else if (data.status === 'error' && handlers.onError) {
                    handlers.onError(data);
                } else if (handlers.onProgress) {
                    handlers.onProgress(data);
                }
            }
        };

        socket.on('calculation:progress', progressHandler);
        socket.on('calculation:complete', completeHandler);
        socket.on('calculation:error', errorHandler);
        socket.on('calculation:update', updateHandler);

        // Return unsubscribe function
        return () => {
            socket.emit('unsubscribe:calculation', calculationId);
            socket.off('calculation:progress', progressHandler);
            socket.off('calculation:complete', completeHandler);
            socket.off('calculation:error', errorHandler);
            socket.off('calculation:update', updateHandler);
        };
    }, []);

    /**
     * Subscribe to user's calculation notifications
     */
    const subscribeToUserCalculations = useCallback(() => {
        const socket = socketRef.current;
        if (!socket) return () => { };

        socket.emit('subscribe:user');

        return () => {
            // No explicit unsubscribe needed, handled on disconnect
        };
    }, []);

    /**
     * Clear notifications
     */
    const clearNotifications = useCallback(() => {
        setNotifications([]);
    }, []);

    /**
     * Dismiss a single notification
     */
    const dismissNotification = useCallback((index) => {
        setNotifications((prev) => prev.filter((_, i) => i !== index));
    }, []);

    return {
        connected,
        lastMessage,
        notifications,
        subscribeToCalculation,
        subscribeToUserCalculations,
        clearNotifications,
        dismissNotification,
        socket: socketRef.current,
    };
}

export default useWebSocket;
