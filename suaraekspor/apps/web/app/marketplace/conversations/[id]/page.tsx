'use client';
// PATH: suaraekspor/apps/web/app/marketplace/conversations/[id]/page.tsx
// Halaman percakapan BUYER dengan seller — setelah mengirim pesan dari product page

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Send, ChevronLeft, Globe, Shield, Clock, CheckCheck } from 'lucide-react';

interface Message {
  id: number;
  role: 'buyer' | 'seller';
  text: string;
  originalText?: string;
  translatedNote?: string;
  time: string;
  status: 'sent' | 'delivered' | 'read';
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: 1,
    role: 'buyer',
    text: 'Hi, I\'m interested in ordering 5 pieces. What is the shipping cost to the US?',
    time: '10:23',
    status: 'read',
  },
  {
    id: 2,
    role: 'seller',
    text: 'Hello John! Thank you for your interest in our Batik Pekalongan. For 5 pieces, the total would be $225. Shipping to the US typically costs $25–35 via DHL Express (5–7 business days). Would you like to proceed?',
    translatedNote: 'Auto-replied by AI · Seller notified in Javanese',
    time: '10:23',
    status: 'read',
  },
  {
    id: 3,
    role: 'buyer',
    text: 'That sounds good. Can you do $200 for 5 pieces?',
    time: '10:31',
    status: 'read',
  },
  {
    id: 4,
    role: 'seller',
    text: 'We appreciate your offer! The best we can do is $210 for 5 pieces — that includes a small discount from our standard price. This still includes our certificate of authenticity for each piece. Would that work for you?',
    translatedNote: 'Auto-replied by AI · Seller approved',
    time: '10:31',
    status: 'read',
  },
];

const QUICK_REPLIES = [
  'Yes, $210 works! How do I pay?',
  'Can I see more photos of the product?',
  'What payment methods do you accept?',
  'How long is the production time?',
];

export default function BuyerConversationPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSend(text?: string) {
    const msgText = text ?? input;
    if (!msgText.trim()) return;

    setSending(true);
    setShowQuickReplies(false);

    const buyerMsg: Message = {
      id: messages.length + 1,
      role: 'buyer',
      text: msgText,
      time: new Date().toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' }),
      status: 'sent',
    };

    setMessages(prev => [...prev, buyerMsg]);
    setInput('');

    // Simulate AI seller reply after delay
    await new Promise(r => setTimeout(r, 1800));

    const sellerReply: Message = {
      id: messages.length + 2,
      role: 'seller',
      text: 'Great choice! You can pay via PayPal or bank transfer. I\'ll send you the payment details and invoice shortly. Your order will be shipped within 3 business days after payment confirmation.',
      translatedNote: 'Auto-replied by AI · Seller notified',
      time: new Date().toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' }),
      status: 'delivered',
    };

    setMessages(prev => [...prev, sellerReply]);
    setSending(false);
  }

  return (
    <div className="min-h-screen bg-[#F7F7F5] flex flex-col">
      {/* HEADER */}
      <div className="bg-[#0F4A33] px-5 py-4 flex-shrink-0">
        <button onClick={() => router.back()} className="flex items-center gap-1.5 text-[#7EE8BC] text-sm mb-3">
          <ChevronLeft size={16} /> Back
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-base">🧵</span>
          </div>
          <div className="flex-1">
            <h1 className="text-white font-bold text-sm">Pak Slamet · Batik Pekalongan</h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              <span className="text-[#A8D5C2] text-[10px]">AI-powered · Responds instantly</span>
            </div>
          </div>
        </div>

        {/* AI trust badge */}
        <div className="mt-3 bg-white/10 rounded-xl px-3 py-2 flex items-center gap-2">
          <Shield size={13} className="text-[#7EE8BC]" />
          <p className="text-[#A8D5C2] text-[10px]">Messages are auto-translated. Seller receives voice notification in local language.</p>
        </div>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 px-4 py-4 flex flex-col gap-3 overflow-y-auto">
        {/* Product context card */}
        <div className="bg-white border border-gray-100 rounded-xl p-3 flex items-center gap-3">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">🧵</div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-gray-800 truncate">Handwoven Batik Pekalongan — Classic Parang Motif</p>
            <p className="text-xs text-green-700 font-semibold mt-0.5">$45 / piece · Min. 1 piece</p>
          </div>
          <button onClick={() => router.back()} className="text-[10px] text-[#0F4A33] font-semibold bg-green-50 px-2 py-1 rounded-lg">
            View
          </button>
        </div>

        {/* Date separator */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-[10px] text-gray-400 font-medium">Today</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {messages.map(m => (
          <div key={m.id} className={`flex ${m.role === 'buyer' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[82%] ${m.role === 'buyer' ? '' : ''}`}>
              {/* Seller avatar */}
              {m.role === 'seller' && (
                <div className="flex items-center gap-1.5 mb-1">
                  <div className="w-5 h-5 bg-[#0F4A33] rounded-full flex items-center justify-center">
                    <Globe size={9} className="text-[#7EE8BC]" />
                  </div>
                  <span className="text-[10px] text-gray-400">AI SuaraEkspor · {m.time}</span>
                </div>
              )}

              {/* Message bubble */}
              <div className={`rounded-2xl px-4 py-3 shadow-sm ${
                m.role === 'buyer'
                  ? 'bg-[#0F4A33] text-white rounded-tr-none'
                  : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none'
              }`}>
                <p className="text-sm leading-relaxed">{m.text}</p>
              </div>

              {/* Buyer timestamp + status */}
              {m.role === 'buyer' && (
                <div className="flex items-center gap-1 justify-end mt-1">
                  <span className="text-[10px] text-gray-400">{m.time}</span>
                  <CheckCheck size={12} className={m.status === 'read' ? 'text-blue-500' : 'text-gray-400'} />
                </div>
              )}

              {/* AI translation note */}
              {m.translatedNote && (
                <div className="flex items-center gap-1.5 mt-1.5">
                  <Globe size={9} className="text-gray-400" />
                  <p className="text-[9px] text-gray-400">{m.translatedNote}</p>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {sending && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
              <div className="flex gap-1 items-center">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                <span className="text-[10px] text-gray-400 ml-1">AI translating & replying...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* QUICK REPLIES */}
      {showQuickReplies && (
        <div className="px-4 py-2 bg-white border-t border-gray-100">
          <p className="text-[10px] text-gray-400 font-semibold mb-2">QUICK REPLIES</p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {QUICK_REPLIES.map((qr, i) => (
              <button key={i} onClick={() => handleSend(qr)}
                className="flex-shrink-0 text-xs bg-green-50 border border-green-200 text-green-800 font-medium px-3 py-2 rounded-full whitespace-nowrap">
                {qr}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* INPUT */}
      <div className="px-4 py-3 bg-white border-t border-gray-100 flex items-end gap-2 flex-shrink-0">
        <div className="flex-1">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="Type a message in any language..."
            rows={input.length > 80 ? 3 : 1}
            className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#0F4A33] resize-none transition-colors"
          />
        </div>
        <button onClick={() => handleSend()} disabled={!input.trim() || sending}
          className="w-10 h-10 bg-[#0F4A33] rounded-xl flex items-center justify-center flex-shrink-0 disabled:opacity-40 transition-all active:scale-95">
          {sending
            ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            : <Send size={16} className="text-white" />
          }
        </button>
      </div>
    </div>
  );
}