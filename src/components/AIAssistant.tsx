import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Loader2, MessageSquare, Trash2, Sparkles, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { Language, translations } from '../lib/translations';
import { getGeminiResponseStream, getGeminiTTS } from '../services/geminiService';
import { useAppData } from '../hooks/useAppData';

interface AIAssistantProps {
  lang: Language;
  compact?: boolean;
}

export function AIAssistant({ lang, compact = false }: AIAssistantProps) {
  const t = translations[lang];
  const { chatMessages, addChatMessage, updateChatMessage, clearChatHistory, assignments, incidents, reports, zoneReports, user } = useAppData();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const recognitionRef = useRef<any>(null);
  
  // Speech Recognition setup
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput((prev) => prev + (prev ? ' ' : '') + transcript);
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognitionRef.current = recognition;
    }
  }, []);

  // Update recognition language when lang changes
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = lang === 'am' ? 'am-ET' : 'en-US';
    }
  }, [lang]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert(lang === 'am' ? 'ይቅርታ፣ የእርስዎ ብሮውዘር የድምፅ ትዕዛዝን አይደግፍም።' : 'Sorry, your browser does not support speech recognition.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.error("Failed to start recognition:", e);
      }
    }
  };

  const stopPlayback = () => {
    if (audioSourceRef.current) {
      try {
        audioSourceRef.current.stop();
      } catch (e) { /* Already stopped */ }
      audioSourceRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  const speakText = async (text: string) => {
    // If already speaking, toggle means STOP
    if (isSpeaking) {
      stopPlayback();
      return;
    }

    if (!text) return;

    // Use Gemini TTS for Amharic for high quality
    if (lang === 'am') {
      setIsSpeaking(true);
      try {
        const base64Audio = await getGeminiTTS(text);
        if (base64Audio) {
          const binaryString = window.atob(base64Audio);
          const len = binaryString.length;
          const bytes = new Uint8Array(len);
          for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          
          const pcmData = new Int16Array(bytes.buffer);
          const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
          audioContextRef.current = audioCtx;

          const audioBuffer = audioCtx.createBuffer(1, pcmData.length, 24000);
          const channelData = audioBuffer.getChannelData(0);
          
          // Normalize Int16 to Float32 [-1.0, 1.0]
          for (let i = 0; i < pcmData.length; i++) {
            channelData[i] = pcmData[i] / 32768;
          }
          
          const source = audioCtx.createBufferSource();
          source.buffer = audioBuffer;
          source.connect(audioCtx.destination);
          audioSourceRef.current = source;
          
          source.onended = () => {
            setIsSpeaking(false);
            if (audioCtx.state !== 'closed') {
              audioCtx.close();
            }
          };
          
          source.start();
        } else {
          // Fallback to browser TTS ONLY if an Amharic voice is available
          if ('speechSynthesis' in window) {
            const voices = window.speechSynthesis.getVoices();
            const amharicVoice = voices.find(v => v.lang.includes('am'));
            
            if (amharicVoice) {
              const utterance = new SpeechSynthesisUtterance(text);
              utterance.voice = amharicVoice;
              utterance.lang = 'am-ET';
              utterance.onend = () => setIsSpeaking(false);
              utterance.onerror = () => setIsSpeaking(false);
              window.speechSynthesis.speak(utterance);
            } else {
              console.warn("No Amharic voice found for browser fallback");
              setIsSpeaking(false);
            }
          } else {
            setIsSpeaking(false);
          }
        }
      } catch (error) {
        console.error("TTS Error:", error);
        setIsSpeaking(false);
      }
    } else {
      // Browser TTS for English
      if (!('speechSynthesis' in window)) return;
      
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Global cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioSourceRef.current) {
        try { audioSourceRef.current.stop(); } catch (e) {}
      }
      if (audioContextRef.current) {
        try { audioContextRef.current.close(); } catch (e) {}
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current && isListening) {
        recognitionRef.current.stop();
      }
    };
  }, [isListening]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (chatMessages.length > 0 || loading) {
      scrollToBottom();
    }
  }, [chatMessages, loading]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      await addChatMessage({
        text: lang === 'am' ? 'የGemini API ቁልፍ (API Key) አልተገኘም። እባክዎ በቅንብሮች ውስጥ ያረጋግጡ።' : "Gemini API key is missing. Please provide VITE_GEMINI_API_KEY.",
        sender: 'ai'
      });
      return;
    }

    const userMessageText = input;
    setInput('');
    setLoading(true);

    try {
      // 1. Add User Message First
      await addChatMessage({
        text: userMessageText,
        sender: 'user'
      });

      // 2. Add AI Placeholder Message and wait for its actual ID
      const aiMessageId = await addChatMessage({
        text: '...',
        sender: 'ai'
      });

      if (!aiMessageId) throw new Error("Failed to create AI message reference ID");

      // 3. Initiate Stream with safely resolved dynamic document references
      const aiResponse = await getGeminiResponseStream(
        userMessageText, 
        chatMessages.map(m => ({
          ...m,
          timestamp: new Date(m.timestamp)
        })),
        { assignments, incidents, reports, zoneReports, user },
        async (text) => {
          await updateChatMessage(aiMessageId, text);
        }
      );
      
      // Auto-play TTS on completion
      speakText(aiResponse);
    } catch (error) {
      console.error('Chat error:', error);
      await addChatMessage({
        text: lang === 'am' ? 'ይቅርታ፣ ምላሽ መስጠት አልቻልኩም። እባክዎ እንደገና ይሞክሩ።' : "Sorry, I couldn't generate a response. Please try again.",
        sender: 'ai'
      });
    } finally {
      setLoading(false);
    }
  };

  const clearChat = async () => {
    stopPlayback();
    await clearChatHistory();
  };

  return (
    <div className={`flex flex-col ${compact ? 'h-[260px] w-full' : 'h-[calc(100vh-12rem)] max-w-4xl mx-auto'}`}>
      <div className={`flex items-center justify-between ${compact ? 'mb-0.5' : 'mb-6'}`}>
        <div>
          <h1 className={`${compact ? 'text-[11px]' : 'text-3xl'} font-bold tracking-tight flex items-center gap-1`}>
            <Bot className="text-brand-accent" size={compact ? 12 : 32} />
            {lang === 'am' ? 'የምዕራብ ጎጃም ዞን ፖሊስ ዲጂታል ረዳት' : 'WG Police Digital Assistant'}
            {!(import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY) && (
              <span className="ml-2 px-1.5 py-0.5 bg-rose-500/20 text-rose-400 text-[8px] rounded-full border border-rose-500/30 animate-pulse">
                {lang === 'am' ? 'ቁልፍ ይጎድላል' : 'Key Missing'}
              </span>
            )}
          </h1>
          {!compact && (
            <p className="text-brand-text-secondary mt-1 text-sm">
              {lang === 'am' ? 'ስለ ወንጀል መረጃዎች፣ የሰራተኛ ፕሮግራም፣ መመሪያዎች እና ሪፖርቶች ይጠይቁ።' : 'Ask about crime data, duty schedules, procedures, and reports.'}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1">
          {isSpeaking && (
            <button 
              onClick={stopPlayback}
              className="p-1 text-brand-accent hover:text-brand-accent/80 transition-colors flex items-center gap-0.5 text-[10px] bg-brand-accent/10 rounded-md"
            >
