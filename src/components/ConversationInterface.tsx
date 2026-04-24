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
  onDone?: () => void;
}

export function ConversationInterface({ messages, isConnecting, error, onSendMessage, onRetry, onDone }: Props) {
  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages.length]);

  const send = () => {
    if (!input.trim()) return;
    onSendMessage(input.trim());
    setInput('');
  };

  if (isConnecting) return <LoadingIndicator message="Connecting to your future self..." />;
  if (error) return <ErrorDisplay error={error} onRetry={onRetry} />;

  return (
    <div className="flex flex-col rounded-2xl border border-gray-800 bg-gray-900/60 overflow-hidden">
      <div className="flex items-center gap-2 border-b border-gray-800/60 px-4 sm:px-5 py-2.5 sm:py-3">
        <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
        <span className="text-[11px] sm:text-xs font-medium text-gray-400">Future You — Live</span>
      </div>

      <div className="flex-1 space-y-3 sm:space-y-4 overflow-y-auto p-3 sm:p-5" style={{ maxHeight: 360 }}>
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-2 sm:gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'agent' && (
              <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full bg-violet-500/20 text-xs sm:text-sm">🔮</div>
            )}
            <div className={`max-w-[80%] sm:max-w-[75%] rounded-2xl px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm leading-relaxed ${
              msg.role === 'user'
                ? 'rounded-br-md bg-blue-600 text-white'
                : 'rounded-bl-md bg-gray-800 text-gray-200'
            }`}>
              <p>{msg.content}</p>
              <p className="mt-1 text-[9px] sm:text-[10px] opacity-40">{new Date(msg.timestamp).toLocaleTimeString()}</p>
            </div>
            {msg.role === 'user' && (
              <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-xs sm:text-sm">👤</div>
            )}
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <div className="flex gap-2 sm:gap-3 border-t border-gray-800/60 p-3 sm:p-4">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder="Ask your future self..."
          className="flex-1 rounded-xl border border-gray-800 bg-gray-950 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-gray-100 placeholder-gray-600 transition focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/30"
        />
        <button
          onClick={send}
          disabled={!input.trim()}
          className="rounded-xl bg-blue-600 px-3 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-white transition disabled:opacity-40 hover:bg-blue-500"
        >
          Send
        </button>
      </div>
      {onDone && messages.length > 1 && (
        <div className="flex justify-end border-t border-gray-800/60 px-3 sm:px-4 py-2.5 sm:py-3">
          <button onClick={onDone} className="rounded-full border border-gray-700 px-4 sm:px-5 py-1.5 sm:py-2 text-[11px] sm:text-xs font-medium text-gray-400 transition hover:border-gray-500 hover:text-white">
            Done chatting → Compare
          </button>
        </div>
      )}
    </div>
  );
}
