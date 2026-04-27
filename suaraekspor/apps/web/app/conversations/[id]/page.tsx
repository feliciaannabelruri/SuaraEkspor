'use client';
// PATH: suaraekspor/apps/web/app/conversations/[id]/page.tsx
// Chat detail seller — AI suggested reply + voice input (REPLACE existing file)

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Volume2, Send, Mic, MicOff, RefreshCw, ChevronLeft, CheckCheck, Globe, Sparkles } from 'lucide-react';

interface Message {
  id: number;
  role: 'buyer' | 'ai';
  lang: string;
  text: string;
  time: string;
  summary?: string;
  audioPlaying?: boolean;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: 1, role: 'buyer', lang: 'en', time: '10:23',
    text: 'Hi, I am interested in ordering 5 pieces. What is the shipping cost to the US?',
  },
  {
    id: 2, role: 'ai', lang: 'en', time: '10:23',
    text: 'Hello John! Thank you for your interest in our Batik Pekalongan. For 5 pieces, the total would be $225. Shipping to the US typically costs $25–35 via DHL Express (5–7 business days). Would you like to proceed?',
    summary: 'John mau pesan 5 lembar. Kita kasih harga $225 + ongkir $25-35 ke Amerika via DHL. Dia minta konfirmasi.',
  },
  {
    id: 3, role: 'buyer', lang: 'en', time: '10:31',
    text: 'That sounds good. Can you do $200 for 5 pieces? Also, can I get custom colors?',
  },
  {
    id: 4, role: 'ai', lang: 'en', time: '10:31',
    text: 'We appreciate your offer! The best we can do is $210 for 5 pieces — that includes a small discount. For custom colors, yes! We can accommodate natural indigo, soga brown, or custom requests with a 2-week lead time. Would that work?',
    summary: 'John nawar $200 untuk 5 lembar + minta custom warna. Kita counter $210 dengan diskon. Custom warna bisa, butuh 2 minggu. Tunggu konfirmasi.',
  },
];

const AI_SUGGESTIONS = [
  'Terima kasih atas tawaranmu! Kami bisa berikan harga $210 untuk 5 lembar. Pengiriman ke US via DHL sekitar 5-7 hari kerja.',
  'Harga terbaik kami $210 untuk 5 lembar. Untuk custom warna tersedia dengan waktu produksi 2 minggu.',
  'Kami senang kamu tertarik! $210 sudah termasuk diskon spesial. Mau lanjut dengan pesanan?',
];

export default function ConversationDetailPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [replyText, setReplyText] = useState('');
  const [playingId, setPlayingId] = useState<number | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionIdx, setSuggestionIdx] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedText, setRecordedText] = useState('');
  const [sending, setSending] = useState(false);
  const [aiMode, setAiMode] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function playAudio(id: number) {
    setPlayingId(id);
    setTimeout(() => setPlayingId(null), 3000);
  }

  function useSuggestion(text: string) {
    setReplyText(text);
    setShowSuggestions(false);
  }

  function nextSuggestion() {
    setSuggestionIdx(i => (i + 1) % AI_SUGGESTIONS.length);
  }

  function toggleRecording() {
    if (isRecording) {
      setIsRecording(false);
      // Simulate voice transcription
      setRecordedText('Terima kasih John! Harga $210 sudah termasuk diskon spesial.');
      setReplyText('Terima kasih John! Harga $210 sudah termasuk diskon spesial.');
    } else {
      setRecordedText('');
      setIsRecording(true);
      // Auto stop after 5s
      setTimeout(() => {
        setIsRecording(false);
        setRecordedText('Terima kasih John! Harga $210 sudah termasuk diskon spesial.');
        setReplyText('Terima kasih John! Harga $210 sudah termasuk diskon spesial.');
      }, 5000);
    }
  }

  async function handleSend() {
    if (!replyText.trim()) return;
    setSending(true);

    // Add seller message
    const newMsg: Message = {
      id: messages.length + 1,
      role: 'ai',
      lang: 'en',
      time: new Date().toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' }),
      text: replyText,
      summary: 'Kamu sudah balas ke John dengan konfirmasi harga. Tunggu respons selanjutnya.',
    };

    await new Promise(r => setTimeout(r, 800));
    setMessages(prev => [...prev, newMsg]);
    setReplyText('');
    setSending(false);
    setShowSuggestions(false);
  }

  return (
    <div className="min-h-screen bg-[#F7F7F5] flex flex-col">
      {/* HEADER */}
      <div className="bg-[#0F4A33] px-5 py-4 flex-shrink-0">
        <button onClick={() => router.back()} className="flex items-center gap-1.5 text-[#7EE8BC] text-sm mb-3">
          <ChevronLeft size={16} /> Semua Pesan
        </button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-white font-bold text-base">John Smith</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <Globe size={10} className="text-[#A8D5C2]" />
              <p className="text-[#A8D5C2] text-xs">USA · English</p>
            </div>
            <p className="text-[#7EE8BC]/70 text-[10px] mt-0.5">Batik Tulis Pekalongan</p>
          </div>
          <button onClick={() => setAiMode(!aiMode)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all ${
              aiMode ? 'bg-[#7EE8BC] text-[#0F4A33]' : 'bg-white/10 text-white'
            }`}>
            <Sparkles size={10} />
            AI {aiMode ? 'ON' : 'OFF'}
          </button>
        </div>
        {aiMode && (
          <div className="mt-2 flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full w-fit">
            <div className="w-1.5 h-1.5 bg-[#7EE8BC] rounded-full animate-pulse" />
            <p className="text-[#7EE8BC] text-[10px] font-semibold">AI menangani balasan & terjemahan otomatis</p>
          </div>
        )}
      </div>

      {/* MESSAGES */}
      <div className="flex-1 px-4 py-4 flex flex-col gap-3 overflow-y-auto">
        {messages.map(m => (
          <div key={m.id}>
            {m.role === 'buyer' ? (
              <div className="flex justify-start">
                <div className="max-w-[80%]">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-[8px] font-bold">J</span>
                    </div>
                    <p className="text-[10px] text-gray-400">John · {m.time}</p>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
                    <p className="text-sm text-gray-800">{m.text}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex justify-end">
                <div className="max-w-[85%]">
                  <div className="flex items-center gap-2 mb-1 justify-end">
                    <p className="text-[10px] text-gray-400">{m.time}</p>
                    <div className="w-5 h-5 bg-[#0F4A33] rounded-full flex items-center justify-center">
                      <Sparkles size={10} className="text-[#7EE8BC]" />
                    </div>
                  </div>
                  <div className="bg-[#0F4A33] rounded-2xl rounded-tr-none px-4 py-3 shadow-sm">
                    <p className="text-sm text-white leading-relaxed">{m.text}</p>
                    <div className="flex items-center gap-1 mt-1.5 justify-end">
                      <CheckCheck size={12} className="text-[#7EE8BC]" />
                      <span className="text-[9px] text-[#7EE8BC]">Terkirim</span>
                    </div>
                  </div>

                  {/* RINGKASAN */}
                  {m.summary && (
                    <div className="mt-2 bg-amber-50 border border-amber-200 rounded-xl p-3">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">📋 Ringkasan untuk Anda</p>
                        <button onClick={() => playAudio(m.id)}
                          className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full transition-all ${
                            playingId === m.id ? 'bg-amber-600 text-white animate-pulse' : 'bg-amber-200 text-amber-800'
                          }`}>
                          <Volume2 size={9} />
                          {playingId === m.id ? 'Memutar...' : 'Dengar'}
                        </button>
                      </div>
                      <p className="text-xs text-amber-800 leading-relaxed">{m.summary}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* AI SUGGESTED REPLY */}
      {showSuggestions && (
        <div className="px-4 py-3 bg-white border-t border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-bold text-[#0F4A33] uppercase tracking-wider flex items-center gap-1">
              <Sparkles size={10} /> Saran Balasan AI
            </p>
            <button onClick={nextSuggestion} className="flex items-center gap-1 text-[10px] text-gray-500">
              <RefreshCw size={10} /> Ganti
            </button>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-xl p-3">
            <p className="text-sm text-gray-700 leading-relaxed">{AI_SUGGESTIONS[suggestionIdx]}</p>
          </div>
          <div className="flex gap-2 mt-2">
            <button onClick={() => useSuggestion(AI_SUGGESTIONS[suggestionIdx])}
              className="flex-1 bg-[#0F4A33] text-white font-bold py-2.5 rounded-xl text-xs">
              ✓ Gunakan Saran Ini
            </button>
            <button onClick={() => setShowSuggestions(false)}
              className="px-4 border border-gray-300 text-gray-600 font-semibold py-2.5 rounded-xl text-xs">
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* INPUT BAR */}
      <div className="px-4 py-3 bg-white border-t border-gray-100 flex-shrink-0">
        {/* Voice recording indicator */}
        {isRecording && (
          <div className="mb-2 flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
            <div className="flex gap-0.5 items-end h-4">
              {[3,5,4,6,3,5,4].map((h,i) => (
                <div key={i} className="w-1 bg-red-500 rounded-full animate-pulse" style={{ height: `${h*2}px`, animationDelay: `${i*0.1}s` }} />
              ))}
            </div>
            <p className="text-xs text-red-700 font-semibold">Merekam suara... (ketuk mic untuk berhenti)</p>
          </div>
        )}

        {recordedText && !isRecording && (
          <div className="mb-2 bg-blue-50 border border-blue-200 rounded-xl px-3 py-2">
            <p className="text-[10px] text-blue-600 font-semibold mb-0.5">Hasil rekaman (AI translate):</p>
            <p className="text-xs text-blue-800">{recordedText}</p>
          </div>
        )}

        <div className="flex items-end gap-2">
          {/* Sparkle/AI suggestion button */}
          <button onClick={() => setShowSuggestions(!showSuggestions)}
            className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
              showSuggestions ? 'bg-[#0F4A33] text-[#7EE8BC]' : 'bg-green-100 text-[#0F4A33]'
            }`}>
            <Sparkles size={18} />
          </button>

          {/* Text input */}
          <div className="flex-1 relative">
            <textarea
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              placeholder="Ketik balasan (AI akan translate ke bahasa buyer)..."
              rows={replyText.length > 80 ? 3 : 1}
              className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#0F4A33] resize-none transition-colors"
            />
          </div>

          {/* Voice button */}
          <button onClick={toggleRecording}
            className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
              isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-100 text-gray-600'
            }`}>
            {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
          </button>

          {/* Send button */}
          <button onClick={handleSend} disabled={!replyText.trim() || sending}
            className="w-10 h-10 bg-[#0F4A33] rounded-xl flex items-center justify-center flex-shrink-0 disabled:opacity-40 transition-all active:scale-95">
            {sending
              ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <Send size={16} className="text-white" />
            }
          </button>
        </div>
        <p className="text-center text-[10px] text-gray-400 mt-1.5">
          💡 Ketuk <span className="font-bold">✨</span> untuk saran balasan AI · <span className="font-bold">🎙</span> untuk rekam suara
        </p>
      </div>
    </div>
  );
}