'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles, Copy, ThumbsUp, ThumbsDown, RotateCcw, MessageCircle, ArrowRight, Zap } from 'lucide-react';
import AxiomAIIcon from '../../components/AxiomAIIcon';
import 'katex/dist/katex.min.css';

const AxiomAIChatPage = () => {
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const suggestedPrompts = [
        {
            title: "IFRS 17 Calculations",
            description: "Calculate CSM, BEL, and technical provisions",
            prompt: "How do I calculate CSM under IFRS 17?"
        },
        {
            title: "Solvency II Requirements",
            description: "Understand SCR and MCR calculations",
            prompt: "What's the difference between SCR and MCR?"
        },
        {
            title: "Risk Management",
            description: "Longevity and lapse risk strategies",
            prompt: "Explain longevity risk hedging strategies"
        },
        {
            title: "Pricing Models",
            description: "Life insurance pricing methodologies",
            prompt: "How to model lapse rates in pricing?"
        },
        {
            title: "Regulatory Compliance",
            description: "Compare IFRS 17 vs Solvency II",
            prompt: "IFRS 17 vs Solvency II requirements"
        }
    ];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        // Focus input on page load
        inputRef.current?.focus();
    }, []);

    // Auto-resize textarea
    useEffect(() => {
        const textarea = inputRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
        }
    }, [inputMessage]);

    const handleSendMessage = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        if (!inputMessage.trim() || isLoading) return;

        const userMessage = {
            id: Date.now(),
            type: 'user',
            content: inputMessage,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsLoading(true);
        setIsTyping(true);

        try {
            const response = await fetch('/api/chat', { // Updated to relative path
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: inputMessage })
            });

            const data = await response.json();

            // Simulate typing delay for better UX
            setTimeout(() => {
                const botMessage = {
                    id: Date.now() + 1,
                    type: 'bot',
                    content: data.response || "I'm here to help with your actuarial questions. Could you please rephrase your question?",
                    timestamp: new Date(),
                    isTyping: false
                };

                setMessages(prev => [...prev, botMessage]);
                setIsLoading(false);
                setIsTyping(false);
            }, 1500);
        } catch (error) {
            console.error('Error sending message:', error);
            const errorMessage = {
                id: Date.now() + 1,
                type: 'bot',
                content: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
                timestamp: new Date(),
                isTyping: false
            };
            setMessages(prev => [...prev, errorMessage]);
            setIsLoading(false);
            setIsTyping(false);
        }
    };

    const handleSuggestedPrompt = (prompt) => {
        setInputMessage(prompt);
        inputRef.current?.focus();
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
    };

    const regenerateResponse = (messageId) => {
        // Find the user message before this bot response
        const messageIndex = messages.findIndex(msg => msg.id === messageId);
        if (messageIndex > 0) {
            const userMessage = messages[messageIndex - 1];
            // Remove the current bot response and regenerate
            setMessages(prev => prev.slice(0, messageIndex));
            setInputMessage(userMessage.content);
            setTimeout(() => {
                handleSendMessage();
            }, 0);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="relative">
                                <AxiomAIIcon className="w-10 h-10" />
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">AxiomAI</h1>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="max-w-6xl mx-auto px-4 py-8 pt-20 min-h-screen flex flex-col justify-center">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Chat Interface */}
                    <div className="flex-1">
                        {/* Messages Area */}
                        <div className="space-y-6 mb-8">
                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in group`}
                                >
                                    <div className={`flex max-w-[85%] ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'} space-x-4`}>
                                        {/* Avatar */}
                                        <div className={`flex-shrink-0 ${message.type === 'user' ? 'ml-4' : 'mr-4'}`}>
                                            <div className={`h-10 w-10 rounded-2xl flex items-center justify-center shadow-lg ${message.type === 'user'
                                                    ? 'bg-gradient-to-br from-blue-500 to-green-500'
                                                    : 'bg-white border-2 border-gray-200'
                                                }`}>
                                                {message.type === 'user' ? (
                                                    <User className="h-5 w-5 text-white" />
                                                ) : (
                                                    <AxiomAIIcon className="h-6 w-6" />
                                                )}
                                            </div>
                                        </div>

                                        {/* Message Content */}
                                        <div className={`flex-1 ${message.type === 'user' ? 'text-right' : 'text-left'}`}>
                                            <div className={`inline-block px-6 py-4 rounded-3xl shadow-lg ${message.type === 'user'
                                                    ? 'bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-br-lg'
                                                    : 'bg-white text-gray-900 rounded-bl-lg border border-gray-200'
                                                }`}>
                                                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                                            </div>

                                            {/* Message Actions */}
                                            {message.type === 'bot' && (
                                                <div className="flex items-center space-x-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                    <button
                                                        onClick={() => copyToClipboard(message.content)}
                                                        className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition-all duration-200"
                                                        title="Copy message"
                                                    >
                                                        <Copy className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        className="p-2 text-gray-400 hover:text-green-600 rounded-xl hover:bg-gray-100 transition-all duration-200"
                                                        title="Good response"
                                                    >
                                                        <ThumbsUp className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        className="p-2 text-gray-400 hover:text-red-600 rounded-xl hover:bg-gray-100 transition-all duration-200"
                                                        title="Poor response"
                                                    >
                                                        <ThumbsDown className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => regenerateResponse(message.id)}
                                                        className="p-2 text-gray-400 hover:text-blue-600 rounded-xl hover:bg-gray-100 transition-all duration-200"
                                                        title="Regenerate response"
                                                    >
                                                        <RotateCcw className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            )}

                                            {/* Timestamp */}
                                            <div className={`text-xs text-gray-500 mt-2 ${message.type === 'user' ? 'text-right' : 'text-left'}`}>
                                                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Typing indicator */}
                            {isTyping && (
                                <div className="flex justify-start animate-fade-in">
                                    <div className="flex max-w-4xl flex-row space-x-4">
                                        <div className="flex-shrink-0 mr-4">
                                            <div className="h-10 w-10 rounded-2xl bg-white border-2 border-gray-200 flex items-center justify-center shadow-lg">
                                                <Bot className="h-5 w-5 text-blue-600" />
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <div className="inline-block px-6 py-4 rounded-3xl rounded-bl-lg bg-white border border-gray-200 shadow-lg">
                                                <div className="flex items-center space-x-2">
                                                    <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                                                    <span className="text-sm text-gray-600">AxiomAI is thinking...</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 p-4 shadow-lg mt-8">
                            <form onSubmit={handleSendMessage} className="w-full">
                                <div className="flex items-center space-x-3">
                                    <textarea
                                        ref={inputRef}
                                        rows={1}
                                        value={inputMessage}
                                        onChange={(e) => setInputMessage(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSendMessage();
                                            }
                                        }}
                                        placeholder="Ask AxiomAI anything about actuarial science..."
                                        className="flex-1 px-4 py-3 bg-white border border-gray-300 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                                        disabled={isLoading}
                                    />
                                    <button
                                        type="submit"
                                        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-xl hover:from-blue-600 hover:to-green-600 transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 disabled:transform-none"
                                        disabled={isLoading || !inputMessage.trim()}
                                    >
                                        {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Suggested Prompts Sidebar */}
                    {messages.length === 0 && (
                        <div className="lg:w-80">
                            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg sticky top-24">
                                <div className="flex items-center mb-6">
                                    <Zap className="h-5 w-5 text-green-500 mr-2" />
                                    <span className="font-bold text-lg text-gray-900">Quick Start</span>
                                </div>
                                <div className="space-y-3">
                                    {suggestedPrompts.map((item, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleSuggestedPrompt(item.prompt)}
                                            className="w-full text-left p-4 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-blue-50 hover:to-green-50 rounded-xl transition-all duration-200 border border-gray-200 hover:border-blue-200 hover:shadow-md group"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-gray-900 text-sm mb-1 group-hover:text-blue-600 transition-colors">
                                                        {item.title}
                                                    </h4>
                                                    <p className="text-xs text-gray-600 mb-2">{item.description}</p>
                                                </div>
                                                <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors flex-shrink-0 ml-2" />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AxiomAIChatPage;
