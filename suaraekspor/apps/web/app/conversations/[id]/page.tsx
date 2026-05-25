'use client';
// PATH: suaraekspor/apps/web/app/conversations/[id]/page.tsx
// Chat detail seller — AI suggested reply + voice input

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Volume2, Send, Mic, MicOff, RefreshCw, ChevronLeft, CheckCheck, Globe, Sparkles } from 'lucide-react';
import { useMiddleman } from "../../context/middleman-context";

interface Message {
  id: number;
  role: 'buyer' | 'ai';
  lang: string;
  time: string;
  text: string;
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
  const [showProfile, setShowProfile] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { isMiddleman, activeUMKM, handleToggleMiddleman } = useMiddleman();

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

  // Rotate through suggestion options
  function nextSuggestion() {
    setSuggestionIdx(i => (i + 1) % AI_SUGGESTIONS.length);
  }

  function toggleRecording() {
    if (isRecording) {
      setIsRecording(false);
      setRecordedText('Terima kasih John! Harga $210 sudah termasuk diskon spesial.');
      setReplyText('Terima kasih John! Harga $210 sudah termasuk diskon spesial.');
    } else {
      setRecordedText('');
      setIsRecording(true);
      setTimeout(() => {
        setIsRecording(false);
        setRecordedText('Terima kasih John! Harga $210 sudah termasuk diskon spesial.');
        setReplyText('Terima kasih John! Harga $210 sudah termasuk diskon spesial.');
      }, 4000);
    }
  }

  async function handleSend() {
    if (!replyText.trim()) return;
    setSending(true);

    const newMsg: Message = {
      id: messages.length + 1,
      role: 'ai',
      lang: 'en',
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
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
    <div className="flex min-h-screen bg-[#FDF0E8] text-[#1c1b1b] font-body-md overflow-x-hidden">
      
      {/* MAIN CONTENT */}
      <main className="w-full h-screen bg-[#FDF0E8] flex flex-col relative">
        
        {/* HEADER */}
        <header className="h-20 bg-white flex items-center justify-between px-8 border-b border-[#c1c8c4]/20 z-10">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 cursor-pointer hover:opacity-90 transition-opacity" onClick={() => setShowProfile(!showProfile)}>
              <button onClick={(e) => { e.stopPropagation(); router.back() }} className="flex items-center gap-1 text-gray-500 hover:text-[#0F4A33] transition-colors mr-2">
                <ChevronLeft size={20} />
              </button>
              
              {/* Circular US badge */}
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-700 border border-gray-200 shadow-sm">
                US
              </div>

              <div>
                <h1 className="text-[#0F4A33] font-bold text-sm md:text-base flex items-center gap-1">
                  USA · English
                  <span className="material-symbols-outlined text-[16px] opacity-70">{showProfile ? 'expand_less' : 'expand_more'}</span>
                </h1>
                <p className="text-gray-500 text-[10px] font-medium leading-none mt-0.5">Produk: Batik Tulis Pekalongan</p>
              </div>
            </div>
            
            {/* Status Pills */}
            <div className="flex items-center gap-2 ml-2 sm:ml-4">
              <button 
                onClick={() => setAiMode(!aiMode)}
                className={`flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[9px] sm:text-[10px] font-bold transition-all shadow-sm border ${aiMode ? 'bg-[#7EE8BC] text-[#0F4A33] border-transparent' : 'bg-gray-100 text-gray-500 border-gray-200'}`}
              >
                <Sparkles size={10} className="mr-0.5" />
                AI {aiMode ? 'ON' : 'OFF'}
              </button>
              {aiMode && (
                <div className="hidden sm:flex items-center gap-1.5 bg-white border border-[#6eae78]/30 px-3 py-1.5 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-[#6eae78] animate-pulse"></span>
                  <p className="text-[#6eae78] text-[9px] font-bold tracking-widest uppercase">AI MENANGANI BALASAN & TERJEMAHAN</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowProfile(!showProfile)}
              className={`w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 bg-white hover:bg-gray-50 shadow-sm transition-colors ${showProfile ? 'bg-gray-100 text-[#0F4A33]' : 'text-gray-600'}`}
            >
              <span className="material-symbols-outlined text-[20px]">account_circle</span>
            </button>
          </div>
        </header>

        {/* CONTENT LAYOUT: SPLIT ON DESKTOP */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* LEFT: CHAT AREA */}
          <div className="flex-1 flex flex-col min-w-0 bg-[#FDF0E8]">
            {/* MESSAGES */}
            <div className="flex-1 px-8 py-6 flex flex-col gap-6 overflow-y-auto scrollbar-hide">
              {messages.map(m => (
                <div key={m.id}>
                  {m.role === 'buyer' ? (
                    /* Buyer Bubble (Received - Left) */
                    <div className="flex flex-col items-start max-w-[85%] md:max-w-[70%]">
                      <div className="flex items-center gap-1 mb-1">
                        <span className="text-gray-700 font-bold text-xs">John (Buyer)</span>
                        <span className="text-gray-400 text-[10px] ml-1">us EN</span>
                        <span className="text-gray-400 text-[10px] ml-1.5">{m.time}</span>
                      </div>
                      <div className="bg-white border border-[#c1c8c4]/30 rounded-2xl rounded-tl-none p-4 shadow-sm text-gray-800 text-[14px] leading-relaxed">
                        {m.text}
                      </div>
                    </div>
                  ) : (
                    /* AI/Seller Bubble (Sent - Right) */
                    <div className="flex flex-col items-end w-full">
                      <div className="max-w-[85%] md:max-w-[70%] flex flex-col items-end">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-gray-400 text-[10px]">{m.time}</span>
                          <span className="text-[#0F4A33] font-bold text-xs">AI Assistant</span>
                        </div>
                        <div className="bg-[#0F4A33] text-white rounded-2xl rounded-tr-none p-4 shadow-md w-full text-[14px] leading-relaxed relative">
                          {m.text}
                          <div className="flex items-center gap-1 mt-2 justify-end opacity-90">
                            <span className="text-[9px] text-[#7EE8BC] font-medium">✓ Terkirim</span>
                          </div>
                        </div>

                        {/* AI SUMMARY BOX */}
                        {m.summary && (
                          <div className="mt-3 w-full bg-[#FFF9C4] border border-[#FBC02D]/30 rounded-xl p-4 flex items-center justify-between shadow-sm">
                            <div className="flex items-start gap-3">
                              <Sparkles size={16} className="text-[#fe802f] mt-0.5 flex-shrink-0" />
                              <p className="text-gray-800 text-[13px] leading-relaxed">
                                <span className="font-bold text-[#fe802f]">Ringkasan AI:</span> {m.summary}
                              </p>
                            </div>
                            <button 
                              onClick={() => playAudio(m.id)}
                              className={`ml-4 flex items-center gap-1.5 px-4 py-1.5 rounded-full font-bold text-[10px] uppercase tracking-wider transition-all active:scale-95 ${playingId === m.id ? 'bg-[#fe802f] text-white animate-pulse shadow-md' : 'bg-white text-[#fe802f] border border-[#fe802f]/20 hover:bg-[#fe802f]/5'}`}
                            >
                              <Volume2 size={12} />
                              {playingId === m.id ? 'Memutar...' : 'DENGAR'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* INPUT AREA */}
            <footer className="bg-white px-4 md:px-8 py-4 md:py-6 border-t border-[#c1c8c4]/30">
              
              {/* Recording Indicator */}
              {isRecording && (
                <div className="mb-4 flex items-center gap-3 bg-red-50 border border-red-100 rounded-2xl px-4 py-3">
                  <div className="flex gap-1 items-end h-4">
                    {[3, 5, 4, 6, 3, 5, 4].map((h, i) => (
                      <div key={i} className="w-1 bg-red-500 rounded-full animate-pulse" style={{ height: `${h * 2}px`, animationDelay: `${i * 0.1}s` }} />
                    ))}
                  </div>
                  <p className="text-[11px] text-red-700 font-bold">Merekam suara... (ketuk mic untuk berhenti)</p>
                </div>
              )}

              {/* Suggestions Toolbar */}
              <div className="flex items-center gap-2 mb-4">
                <button 
                  onClick={() => setShowSuggestions(!showSuggestions)} 
                  className={`bg-[#fe802f] text-white px-4 py-2 rounded-full flex items-center gap-2 font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all active:scale-95 ${showSuggestions ? 'bg-[#0F4A33]' : ''}`}
                >
                  <Sparkles size={12} /> AI SUGGESTION
                </button>
                
                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar flex-1">
                  {showSuggestions ? (
                     <button onClick={nextSuggestion} className="px-4 py-2 rounded-full bg-gray-100 text-gray-600 text-[10px] md:text-[11px] font-bold flex items-center gap-1 border border-gray-200">
                       <RefreshCw size={12} /> Ganti Saran
                     </button>
                  ) : (
                     AI_SUGGESTIONS.map((s, idx) => (
                       <button 
                         key={idx} 
                         onClick={() => useSuggestion(s)} 
                         className="whitespace-nowrap bg-white border border-[#c1c8c4]/30 px-4 py-2 rounded-full text-xs font-medium text-gray-750 hover:bg-gray-50 flex-shrink-0 transition-colors"
                       >
                         {s.substring(0, 30)}...
                       </button>
                     ))
                  )}
                </div>
              </div>

              {/* Suggestions Drawer */}
              {showSuggestions && (
                <div className="mb-4 bg-[#0F4A33]/5 border border-[#0F4A33]/10 rounded-2xl p-4">
                  <p className="text-[13px] text-gray-700 leading-relaxed mb-4">{AI_SUGGESTIONS[suggestionIdx]}</p>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => useSuggestion(AI_SUGGESTIONS[suggestionIdx])}
                      className="flex-1 bg-[#0F4A33] text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all active:scale-95"
                    >
                      Gunakan Ini
                    </button>
                    <button 
                      onClick={() => setShowSuggestions(false)}
                      className="px-6 border border-gray-300 text-gray-500 font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all hover:bg-gray-50"
                    >
                      Tutup
                    </button>
                  </div>
                </div>
              )}

              {/* Input Bar */}
              <div className="flex items-end gap-3">
                <div className="flex-1 bg-[#f6f3f2] rounded-2xl border border-[#c1c8c4]/50 focus-within:border-[#fe802f] transition-colors px-4 py-3 flex flex-col">
                  <textarea
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                    placeholder="Ketik balasan (AI akan otomatis translate ke bahasa buyer)..."
                    rows={1}
                    className="w-full bg-transparent border-none p-0 text-[14px] outline-none focus:ring-0 resize-none text-gray-800 placeholder-gray-400 py-1"
                  />
                  <div className="flex justify-between items-center mt-2 pt-2 border-t border-[#c1c8c4]/10">
                    <div className="flex gap-4 text-gray-500">
                      <button className="hover:text-[#fe802f] transition-colors"><span className="material-symbols-outlined text-xl">attach_file</span></button>
                      <button className="hover:text-[#fe802f] transition-colors"><span className="material-symbols-outlined text-xl">image</span></button>
                    </div>
                    <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider text-gray-400">TEKAN SHIFT + ENTER UNTUK BARIS BARU</span>
                  </div>
                </div>
                
                <div className="flex gap-2 flex-shrink-0">
                  <button 
                    onClick={toggleRecording}
                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all shadow-sm active:scale-95 ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-[#ffdbca] text-[#fe802f] hover:bg-[#ffdbca]/85'}`}
                  >
                    <span className="material-symbols-outlined text-[24px]">mic</span>
                  </button>
                  
                  <button 
                    onClick={handleSend} 
                    disabled={!replyText.trim() || sending}
                    className="w-12 h-12 bg-[#83a69c] text-white rounded-xl flex items-center justify-center shadow-md disabled:opacity-40 transition-all active:scale-95 hover:bg-[#43655c]"
                  >
                    <span className="material-symbols-outlined text-[24px]">send</span>
                  </button>
                </div>
              </div>
            </footer>
          </div>

          {/* Backdrop overlay */}
          {showProfile && (
            <div 
              className="absolute inset-0 bg-black/20 z-40 transition-opacity" 
              onClick={() => setShowProfile(false)}
            />
          )}

          {/* RIGHT PANEL: BUYER PROFILE (Drawer) */}
          <div className={`absolute right-0 top-0 bottom-0 w-80 bg-white border-l border-[#c1c8c4]/20 flex-col overflow-y-auto shrink-0 z-50 shadow-2xl transition-transform duration-300 ${showProfile ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider">Profil Pembeli</h3>
                <button onClick={() => setShowProfile(false)} className="text-gray-400 hover:text-gray-700 transition-colors">
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>
                
                <div className="flex flex-col items-center mb-8">
                  <div className="w-24 h-24 rounded-full bg-[#0F4A33] text-white flex items-center justify-center text-3xl font-bold mb-4 shadow-md">
                    JD
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">John Doe</h2>
                  <p className="text-gray-500 text-sm flex items-center justify-center gap-1 mt-1">
                    <span className="material-symbols-outlined text-[16px]">location_on</span> Oregon, USA
                  </p>
                </div>

                <div className="mb-8">
                  <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Statistik Pembelian</h4>
                  <div className="flex gap-3">
                    <div className="flex-1 bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
                      <p className="text-2xl font-bold text-gray-900 mb-1">0</p>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Order</p>
                    </div>
                    <div className="flex-1 bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
                      <p className="text-2xl font-bold text-gray-900 mb-1">$0</p>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Total</p>
                    </div>
                  </div>
                </div>

                <div className="mb-8">
                  <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Produk Yang Dilihat</h4>
                  <div className="bg-white border border-[#c1c8c4]/30 rounded-xl p-3 flex gap-4 items-center shadow-sm cursor-pointer hover:border-[#0F4A33] transition-colors">
                    <div className="w-14 h-14 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <img 
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuAm1rmy2wRqElvx-tI6arxloke-i3IBxDqWv9QN5VI6Kc2OFOkwTo3-C3xRu06mxGzM2QsfQTaTNIcKIPLAV3_9woNWQ3_Xj9xCEAyHz_pSsyYNILiPgd8QCx5ixJvQ8Bh0qLaV8nh4gZ5ioWAMindMQXEIbm2c3jEM7Off-zEfhtUWyPp2qS0E4DRSFaEfqzulb4NRBYeeFccu8x-Q2uA8IigIe5s6SylzeAHnIZZWx-NOHZWBHgQQUGN4qOOmOzeDijm8rgxuFxdt" 
                        alt="Batik" 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 leading-tight mb-1 truncate">Batik Tulis Pekalongan Indigo</p>
                      <p className="text-[#fe802f] font-bold text-sm">$45.00 <span className="text-gray-400 text-xs font-normal">/ pcs</span></p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-[11px] font-bold text-[#fe802f] uppercase tracking-wider mb-3 flex items-center gap-1">
                    <Sparkles size={14} /> Catatan AI
                  </h4>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCheck size={16} className="text-[#fe802f] mt-0.5 flex-shrink-0" />
                      <span>Pembeli serius, responsif di jam kerja AS.</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCheck size={16} className="text-[#fe802f] mt-0.5 flex-shrink-0" />
                      <span>Sedang mempertimbangkan custom warna (indigo).</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

        </div>
      </main>
    </div>
  );
}