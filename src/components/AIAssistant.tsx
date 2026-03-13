import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Loader2, MessageSquare, Trash2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Language, translations } from '../lib/translations';
import { getGeminiResponse } from '../services/geminiService';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface AIAssistantProps {
  lang: Language;
}

export function AIAssistant({ lang }: AIAssistantProps) {
  const t = translations[lang];
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const aiResponse = await getGeminiResponse(input);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: lang === 'am' ? 'ይቅርታ፣ ምላሽ መስጠት አልቻልኩም። እባክዎ እንደገና ይሞክሩ።' : "Sorry, I couldn't generate a response. Please try again.",
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Bot className="text-brand-accent" size={32} />
            {lang === 'am' ? 'AI ረዳት' : 'AI Assistant'}
          </h1>
          <p className="text-brand-text-secondary mt-1">
            {lang === 'am' ? 'ስለ ፖሊስ አገልግሎቶች፣ መመሪያዎች እና ሌሎች ጥያቄዎችን ይጠይቁ።' : 'Ask questions about police services, manuals, and more.'}
          </p>
        </div>
        {messages.length > 0 && (
          <button 
            onClick={clearChat}
            className="p-2 text-brand-text-secondary hover:text-rose-400 transition-colors flex items-center gap-2 text-sm"
          >
            <Trash2 size={18} />
            {lang === 'am' ? 'አጥፋ' : 'Clear'}
          </button>
        )}
      </div>

      <div className="flex-1 glass-card overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-brand-border">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
              <div className="w-16 h-16 bg-brand-accent/10 rounded-full flex items-center justify-center border border-brand-accent/20">
                <MessageSquare size={32} className="text-brand-accent" />
              </div>
              <div>
                <p className="text-lg font-medium">
                  {lang === 'am' ? 'ውይይት ይጀምሩ' : 'Start a conversation'}
                </p>
                <p className="text-sm">
                  {lang === 'am' ? 'ለምሳሌ፡ "የፖሊስ ዋና ተግባራት ምንድን ናቸው?"' : 'Try: "What are the main duties of the police?"'}
                </p>
              </div>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-3 max-w-[80%] ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`
                      w-8 h-8 rounded-lg flex items-center justify-center shrink-0
                      ${msg.sender === 'user' ? 'bg-brand-accent text-brand-bg' : 'bg-white/10 text-brand-accent border border-white/10'}
                    `}>
                      {msg.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
                    </div>
                    <div className={`
                      p-4 rounded-2xl text-sm leading-relaxed
                      ${msg.sender === 'user' 
                        ? 'bg-brand-accent text-brand-bg font-medium rounded-tr-none' 
                        : 'bg-white/5 border border-white/10 text-white rounded-tl-none'}
                    `}>
                      {msg.text}
                      <div className={`text-[10px] mt-2 opacity-50 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 text-brand-accent border border-white/10 flex items-center justify-center">
                  <Bot size={16} />
                </div>
                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl rounded-tl-none">
                  <Loader2 className="animate-spin text-brand-accent" size={20} />
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-brand-bg/50 border-t border-brand-border">
          <form onSubmit={handleSend} className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={lang === 'am' ? 'እዚህ ይጻፉ...' : 'Type your message here...'}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-4 pr-14 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-brand-accent/50 transition-all"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-brand-accent text-brand-bg rounded-lg hover:bg-brand-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Send size={20} />
            </button>
          </form>
          <div className="mt-2 flex items-center justify-center gap-2 text-[10px] text-brand-text-secondary">
            <Sparkles size={10} className="text-brand-accent" />
            Powered by Gemini AI
          </div>
        </div>
      </div>
    </div>
  );
}
