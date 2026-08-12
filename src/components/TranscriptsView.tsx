import React, { useEffect, useRef, useState } from 'react';
import { Bot, MessageSquare, Send, Sparkles, Trash2, User } from 'lucide-react';
import { TranscriptItem } from '../types';

interface TranscriptsViewProps {
  transcripts: TranscriptItem[];
  onSendTextMessage: (text: string) => void;
  onClearTranscripts?: () => void;
  isConnected: boolean;
}

export const TranscriptsView: React.FC<TranscriptsViewProps> = ({
  transcripts,
  onSendTextMessage,
  onClearTranscripts,
  isConnected,
}) => {
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcripts]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendTextMessage(inputText.trim());
    setInputText('');
  };

  return (
    <div className="flex flex-col h-full bg-[#1c1c1e]/40 rounded-3xl border border-white/5 overflow-hidden backdrop-blur-2xl">
      {/* Header */}
      <div className="px-5 py-4 bg-black/40 border-b border-white/5 flex items-center justify-between text-xs text-zinc-300">
        <div className="flex items-center gap-2 font-semibold">
          <MessageSquare className="w-4 h-4 text-[#4facfe]" />
          <span>Realtime Chat Transcript</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-zinc-500">{transcripts.length} entries</span>
          {onClearTranscripts && transcripts.length > 0 && (
            <button
              type="button"
              onClick={onClearTranscripts}
              className="px-2.5 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-[11px] font-medium flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              title="Clear transcript history"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          )}
        </div>
      </div>

      {/* Transcript Log List */}
      <div ref={scrollRef} className="flex-1 p-5 overflow-y-auto space-y-4 scrollbar-hide">
        {transcripts.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-500">
            <Sparkles className="w-10 h-10 text-[#00f2fe]/40 mb-3 animate-pulse" />
            <p className="text-sm font-semibold text-zinc-300">Live Transcript Ready</p>
            <p className="text-xs text-zinc-500 max-w-xs mt-1.5 leading-relaxed">
              Speak into your microphone or send a message. Realtime speech output from Beatrice will stream here.
            </p>
          </div>
        ) : (
          transcripts.map((t) => {
            const isUser = t.role === 'user';
            const isSystem = t.role === 'system';

            if (isSystem) {
              return (
                <div key={t.id} className="text-center my-3 animate-fade-in">
                  <span className="px-3 py-1.5 rounded-full bg-white/5 text-zinc-400 text-[10px] font-mono border border-white/10 uppercase tracking-wider">
                    {t.text}
                  </span>
                </div>
              );
            }

            return (
              <div
                key={t.id}
                className={`flex gap-3 animate-fade-in ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    isUser
                      ? 'bg-gradient-to-br from-[#00f2fe] to-[#4facfe] text-white shadow-lg'
                      : 'bg-gradient-to-br from-[#e67e22] to-[#8e44ad] text-white shadow-lg'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div
                  className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-[13px] leading-relaxed shadow-sm ${
                    isUser
                      ? 'bg-[#007aff] text-white rounded-tr-sm'
                      : 'bg-[#2c2c2e] text-[#f2f2f7] rounded-tl-sm'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 mb-1 text-[10px] opacity-70">
                    <span className="font-semibold">{isUser ? 'You' : 'Beatrice'}</span>
                    <span>{new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="whitespace-pre-wrap">{t.text}</p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input Box for Text Prompting */}
      <form onSubmit={handleSubmit} className="p-4 bg-black/60 border-t border-white/5 flex items-center gap-3">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={isConnected ? 'Message Beatrice...' : 'Connecting...'}
          disabled={!isConnected}
          className="flex-1 bg-[#2c2c2e] border border-transparent focus:border-[#007aff] rounded-full px-4 py-2.5 text-[13px] text-white focus:outline-none transition-all placeholder:text-[#8e8e93] shadow-inner"
        />
        <button
          type="submit"
          disabled={!isConnected || !inputText.trim()}
          className="w-10 h-10 rounded-full flex items-center justify-center bg-[#007aff] text-white disabled:opacity-40 disabled:bg-[#3a3a3c] hover:bg-[#0056b3] transition-all shrink-0"
        >
          <Send className="w-4 h-4 ml-0.5" />
        </button>
      </form>
    </div>
  );
};

