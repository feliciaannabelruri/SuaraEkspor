'use client';
// PATH: suaraekspor/apps/web/app/marketplace/conversations/[id]/page.tsx
// Halaman percakapan BUYER dengan seller — setelah mengirim pesan dari product page

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Volume2, Send, Mic, MicOff, RefreshCw, ChevronLeft, CheckCheck, Globe, Sparkles } from 'lucide-react';

interface Message {
  id: number;
  role: 'buyer' | 'seller';
  text: string;
  originalText?: string;
  summary?: string;
  time: string;
  status: 'sent' | 'delivered' | 'read';
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: 1,
    role: 'buyer',
    text: 'Hi, I am interested in ordering 5 pieces of the premium Batik Tulis Pekalongan. Do you ship to the United States and how long would it take?',
    time: '10:42 AM',
    status: 'read',
  },
  {
    id: 2,
    role: 'seller',
    text: 'Hello John! Thank you for your interest. We definitely ship to the USA. For 5 pieces of premium Batik Tulis, the total would be $225. Shipping to the US typically costs $25–35 via DHL Express, taking about 5–7 business days to reach your doorstep.',
    summary: 'John mau pesan 5 lembar. Kita kasih harga $225 + ongkir $25–35 ke Amerika via DHL. Dia minta konfirmasi.',
    time: '10:43 AM',
    status: 'read',
  },
  {
    id: 3,
    role: 'buyer',
    text: "Can you do $200 for 5 pieces? Also, can I get custom colors for the pattern? I'm looking for a deep indigo shade.",
    time: '10:45 AM',
    status: 'read',
  },
  {
    id: 4,
    role: 'seller',
    text: 'We appreciate your offer! The best we can do for these premium hand-drawn pieces is $210 for the set of 5. As for custom colors, yes! We can certainly create a deep indigo shade for you. Please note that custom orders require an additional 2 weeks for the dyeing and curing process.',
    summary: 'John nawar $200. Kita counter $210 dengan diskon sedikit. Custom warna indigo bisa, tapi butuh proses 2 minggu lagi.',
    time: '10:46 AM',
    status: 'read',
  },
];

const AI_SUGGESTIONS = [
  'Ok, deal $210 untuk 5 lembar. Bagaimana cara pembayarannya?',
  'Bisa tolong kirimkan foto detail untuk warna indigonya?',
  'Apakah ada biaya tambahan untuk kustomisasi warna indigo?',
  'Baik, saya tidak keberatan menunggu 2 minggu untuk proses pembuatan.',
];

export default function BuyerConversationPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [replyText, setReplyText] = useState('');
  const [playingId, setPlayingId] = useState<number | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionIdx, setSuggestionIdx] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedText, setRecordedText] = useState('');
  const [sending, setSending] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [aiMode, setAiMode] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function playAudio(id: number) {
    setPlayingId(id);
    setTimeout(() => setPlayingId(null), 3000);
  }

  // Use quick reply suggestion
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
      setRecordedText('Ok, deal $210 untuk 5 lembar. Kirim detail pembayarannya.');
      setReplyText('Ok, deal $210 untuk 5 lembar. Kirim detail pembayarannya.');
    } else {
      setRecordedText('');
      setIsRecording(true);
      setTimeout(() => {
        setIsRecording(false);
        setRecordedText('Ok, deal $210 untuk 5 lembar. Kirim detail pembayarannya.');
        setReplyText('Ok, deal $210 untuk 5 lembar. Kirim detail pembayarannya.');
      }, 4000);
    }
  }

  async function handleSend() {
    if (!replyText.trim()) return;
    setSending(true);

    const newMsg: Message = {
      id: messages.length + 1,
      role: 'buyer',
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
      text: replyText,
      status: 'sent',
    };

    setMessages(prev => [...prev, newMsg]);
    setReplyText('');
    setSending(false);

    // Simulate AI reply delay
    setTimeout(() => {
      const sellerReply: Message = {
        id: messages.length + 2,
        role: 'seller',
        text: 'Great choice! You can pay via PayPal or bank transfer. I will send you the invoice and custom contract shortly. The 2 weeks lead time for your deep indigo custom dye will start immediately after payment confirmation.',
        summary: 'John setuju harga $210. Kita minta dia bayar lewat PayPal/Transfer Bank. Kontrak kustom dan invoice segera dikirim. Pembuatan 2 minggu dimulai setelah bayar.',
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
        status: 'delivered',
      };
      setMessages(prev => [...prev, sellerReply]);
    }, 1800);
  }

  return (
    <div className="flex flex-col h-screen bg-[#FDF0E8] text-[#1c1b1b] font-body-md overflow-hidden">

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Chat Container */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#FDF0E8]">
          {/* Header Bar */}
          <header className="h-20 bg-white flex items-center justify-between px-4 md:px-8 border-b border-[#c1c8c4]/20 z-10">
            <div className="flex items-center gap-4">
              <button onClick={() => router.back()} className="flex items-center gap-1 text-gray-500 hover:text-gray-700 transition-colors mr-2">
                <ChevronLeft size={20} />
              </button>
              
              <div className="flex items-center gap-3 cursor-pointer hover:opacity-90 transition-opacity" onClick={() => setShowProfile(!showProfile)}>
                {/* Circular ID avatar badge */}
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-700 border border-gray-200 shadow-sm">
                  ID
                </div>

                <div>
                  <h1 className="text-[#0F4A33] font-bold text-sm md:text-base flex items-center gap-1">
                    Indonesia · Indonesian
                    <span className="material-symbols-outlined text-[16px] opacity-70">{showProfile ? 'expand_less' : 'expand_more'}</span>
                  </h1>
                  <p className="text-gray-500 text-[10px] font-medium leading-none mt-0.5">Produk: Batik Tulis Pekalongan</p>
                </div>
              </div>

              {/* No AI badges shown to buyer */}
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

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 space-y-4 md:space-y-8">
            {messages.map(m => (
              <div key={m.id} className="w-full flex flex-col">
                {m.role === 'buyer' ? (
                  /* Buyer messages (Sent) -> Right side, Green bubble */
                  <div className="flex flex-col items-end w-full">
                    <div className="max-w-[85%] md:max-w-[70%] flex flex-col items-end">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-gray-400 text-[10px]">{m.time}</span>
                        <span className="text-[#0F4A33] font-bold text-xs">John (You)</span>
                      </div>
                      <div className="bg-[#1a3c34] text-white rounded-2xl rounded-tr-none p-4 text-[14px] leading-relaxed shadow-md">
                        {m.text}
                        <div className="flex items-center gap-1 mt-2 justify-end opacity-70">
                          <CheckCheck size={14} className="text-[#7EE8BC]" />
                          <span className="text-[9px] text-[#7EE8BC] font-medium capitalize">{m.status}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Seller messages (Received) -> Left side, White bubble */
                  <div className="flex flex-col items-start max-w-[85%] md:max-w-[70%]">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-gray-700 font-bold text-xs">Pak Budi (Seller) <span className="font-normal text-gray-500 ml-1">🇮🇩 ID</span></span>
                      <span className="text-gray-400 text-[10px]">{m.time}</span>
                    </div>
                    <div className="bg-white border border-[#c1c8c4]/30 rounded-2xl rounded-tl-none p-4 text-gray-800 text-[14px] leading-relaxed shadow-sm">
                      {m.text}
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer Area */}
          <footer className="bg-white px-4 md:px-8 py-4 md:py-6 border-t border-[#c1c8c4]/30">
            {/* Voice Recording Alert */}
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


            {/* Input Area */}
            <div className="flex items-end gap-3">
              <div className="flex-1 bg-[#f6f3f2] rounded-2xl border border-[#c1c8c4]/50 focus-within:border-[#fe802f] transition-colors px-3 md:px-4 py-2 md:py-3 flex flex-col">
                <textarea 
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  className="bg-transparent border-none focus:ring-0 text-[#1c1b1b] placeholder:text-[#414846]/50 resize-none w-full text-body-md py-1 outline-none" 
                  placeholder="Ketik pesan..." 
                  rows={1}
                />
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#c1c8c4]/10">
                  <div className="flex items-center gap-4 text-gray-500">
                    <button className="hover:text-[#fe802f] transition-colors"><span className="material-symbols-outlined text-xl">attach_file</span></button>
                    <button className="hover:text-[#fe802f] transition-colors"><span className="material-symbols-outlined text-xl">image</span></button>
                  </div>
                  <span className="text-[10px] text-gray-400">SHIFT + ENTER for new line</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={toggleRecording}
                  className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all active:scale-95 ${isRecording ? 'bg-red-500 text-white animate-pulse shadow-md' : 'bg-[#ffdbca] text-[#fe802f] hover:bg-[#ffdbca]/80'}`}
                >
                  <span className="material-symbols-outlined">mic</span>
                </button>
                <button 
                  onClick={handleSend}
                  disabled={!replyText.trim() || sending}
                  className="w-12 h-12 flex items-center justify-center rounded-xl bg-[#83a69c] text-white shadow-lg hover:bg-[#43655c] active:scale-95 transition-all disabled:opacity-40"
                >
                  <span className="material-symbols-outlined">send</span>
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

        {/* Right Panel: Profil Penjual (Drawer) */}
        <div className={`absolute right-0 top-0 bottom-0 w-80 bg-white border-l border-[#c1c8c4]/20 overflow-y-auto custom-scrollbar z-50 shadow-2xl transition-transform duration-300 ${showProfile ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider">Seller Profile</h3>
              <button onClick={() => setShowProfile(false)} className="text-gray-400 hover:text-gray-700 transition-colors">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-20 h-20 rounded-full overflow-hidden border border-[#c1c8c4]/30 mb-3 bg-gray-100 flex items-center justify-center">
                <img 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDwipalOoPmeBDVAjRY46x5N1p1hac-orQdPu4EJdsjJtY76JUbiyN_kmI23LnU665m5P9-MTtVb0USwLDepoTt1Z6HMpriCe3pG9Eat3PY0h6ugJNy-ooPV1CPDbAU7hpQRMIkaMbQuW2sKPNKhHCUrthR8W3jpweMk0TIf65vhAxZQxlZU1EAZUohTZVfu21bIAmu1X3eGzniRercfpOYC9gwRaok2hr-9xSYiFwYVxGd7uFRzPGZGwBbfABmpjTGp7x9otKKHlrx" 
                  alt="Pak Budi" 
                  className="w-full h-full object-cover" 
                />
              </div>
              <h4 className="font-bold text-lg leading-tight text-gray-900">Pak Budi</h4>
              <p className="text-gray-500 text-sm flex items-center justify-center gap-1 mt-1">
                <span className="material-symbols-outlined text-[16px]">location_on</span>
                Pekalongan, Indonesia
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Store Stats</p>
                <div className="bg-[#f6f3f2] rounded-xl p-3 grid grid-cols-2 gap-2">
                  <div className="text-center">
                    <p className="text-xl font-bold text-[#1a3c34]">4.9</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Rating</p>
                  </div>
                  <div className="text-center border-l border-[#c1c8c4]/30">
                    <p className="text-xl font-bold text-[#1a3c34]">142+</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Transactions</p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Product of Interest</p>
                <div className="border border-[#c1c8c4]/30 rounded-xl p-3 flex gap-3 items-center">
                  <div className="w-12 h-12 rounded bg-gray-100 overflow-hidden flex-shrink-0">
                    <img 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuAm1rmy2wRqElvx-tI6arxloke-i3IBxDqWv9QN5VI6Kc2OFOkwTo3-C3xRu06mxGzM2QsfQTaTNIcKIPLAV3_9woNWQ3_Xj9xCEAyHz_pSsyYNILiPgd8QCx5ixJvQ8Bh0qLaV8nh4gZ5ioWAMindMQXEIbm2c3jEM7Off-zEfhtUWyPp2qS0E4DRSFaEfqzulb4NRBYeeFccu8x-Q2uA8IigIe5s6SylzeAHnIZZWx-NOHZWBHgQQUGN4qOOmOzeDijm8rgxuFxdt" 
                      alt="Batik Pekalongan" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-900 truncate">Batik Tulis Pekalongan Indigo</p>
                    <p className="text-xs text-[#fe802f] font-bold mt-0.5">$45.00/pcs</p>
                  </div>
                </div>
              </div>


            </div>
          </div>
        </div>
      </div>
    </div>
  );
}