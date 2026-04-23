'use client';

import { useState, useRef, useEffect } from 'react';
import type { ConversationMessage, AppError } from '@/types';
import { LoadingIndicator } from './LoadingIndicator';
import { ErrorDisplay } from './ErrorDisplay';

interface Props {
  messages: ConversationMessage[];
  isActive: boolean;
  isConnecting: boolean;
  error: AppError | null;
  onSendMessage: (content: string) => void;
  onRetry: () => void;
}

export function ConversationInterface({ messages, isActive, isConnecting, error, onSendMessage, onRetry }: Props) {
  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages.length]);

  const send = () => {
    if (!input.trim()) return;
    onSendMessage(input.trim());
    setInput('');
  };

  if (isConnecting) return <LoadingIndicator message="Connecting..." />;
  if (error) return <ErrorDisplay error={error} onRetry={onRetry} />;

  return (
    <div className="flex flex-col rounded-lg bg-gray-800">
      {isActive && (
        <div className="flex items-center gap-2 border-b border-gray-700 px-4 py-2">
          <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
          <span className="text-xs text-gray-400">Live</span>
        </div>
      )}

      <div className="flex-1 space-y-3 overflow-y-auto p-4" style={{ maxHeight: 400 }}>
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            <span className="text-lg">{msg.role === 'user' ? '👤' : '🤖'}</span>
            <div className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${
              msg.role === 'user' ? 'bg-blue-700 text-white' : 'bg-gray-700 text-gray-200'
            }`}>
              <p>{msg.content}</p>
              <p className="mt-1 text-xs opacity-50">{new Date(msg.timestamp).toLocaleTimeString()}</p>
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <div className="flex gap-2 border-t border-gray-700 p-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder="Type a message..."
          className="flex-1 rounded bg-gray-900 px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={send}
          disabled={!input.trim()}
          className="rounded bg-blue-600 px-4 py-2 text-sm text-white disabled:opacity-50 hover:bg-blue-500"
        >
          Send
        </button>
      </div>
    </div>
  );
}
