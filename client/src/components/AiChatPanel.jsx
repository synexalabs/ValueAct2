'use client';
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, Loader2, X, ChevronDown } from 'lucide-react';
import axios from 'axios';

export default function AiChatPanel({ calculationContext, calcType }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  const STARTERS = calcType === 'ifrs17'
    ? [
        'Was bedeutet diese CSM für das Portfolio?',
        'Warum ist der Vertrag belastend?',
        'Wie wird die Risikoanpassung berechnet?',
      ]
    : [
        'Wie interpretiere ich die Solvenzquote?',
        'Was treibt den SCR in diesem Portfolio?',
        'Erkläre den Diversifikationsvorteil.',
      ];

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const send = async (text) => {
    const q = (text || input).trim();
    if (!q || loading) return;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text: q }]);
    setLoading(true);
    try {
      const { data } = await axios.post('/api/chat', {
        message: q,
        calculationContext: calculationContext
          ? { type: calcType, ...calculationContext }
          : null,
      });
      setMessages((prev) => [...prev, { role: 'ai', text: data.response }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'ai', text: 'Fehler beim Abrufen der Antwort. Bitte erneut versuchen.' }]);
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <button onClick={() => setOpen(true)}
        className="w-full flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 hover:border-trust-200 transition-colors">
        <MessageCircle size={15} />
        KI-Assistent fragen
      </button>
    );
  }

  return (
    <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-trust-950 text-white">
        <div className="flex items-center gap-2 text-sm font-medium">
          <MessageCircle size={14} />
          KI-Assistent (Gemini)
        </div>
        <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white">
          <X size={15} />
        </button>
      </div>

      {/* Messages */}
      <div className="h-64 overflow-y-auto px-4 py-3 space-y-3 bg-gray-50">
        {messages.length === 0 && (
          <div className="space-y-2">
            <p className="text-xs text-gray-400">Stellen Sie Fragen zu den Berechnungsergebnissen:</p>
            {STARTERS.map((s) => (
              <button key={s} onClick={() => send(s)}
                className="block w-full text-left text-xs px-3 py-2 bg-white border border-gray-100 rounded-lg hover:border-trust-200 text-gray-600 transition-colors">
                {s}
              </button>
            ))}
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] px-3 py-2 rounded-xl text-sm leading-relaxed whitespace-pre-wrap ${
              msg.role === 'user'
                ? 'bg-trust-950 text-white rounded-br-sm'
                : 'bg-white border border-gray-100 text-gray-700 rounded-bl-sm'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-100 px-3 py-2 rounded-xl rounded-bl-sm">
              <Loader2 size={14} className="animate-spin text-gray-400" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 px-3 py-2 border-t border-gray-100 bg-white">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send()}
          placeholder="Frage stellen…"
          className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-trust-400"
        />
        <button onClick={() => send()} disabled={loading || !input.trim()}
          className="p-1.5 bg-trust-950 text-white rounded-lg hover:bg-trust-900 transition-colors disabled:opacity-50">
          <Send size={14} />
        </button>
      </div>
    </div>
  );
}
