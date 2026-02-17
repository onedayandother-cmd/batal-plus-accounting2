
import React, { useState, useEffect, useRef } from 'react';
import { Bot, X, Send, Sparkles, Search } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { Product, Sale, Customer, AppSettings } from '../types';

interface AIAssistantProps {
  products: Product[];
  sales: Sale[];
  customers: Customer[];
  settings: AppSettings;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ products, sales, customers, settings }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'ai', text: string, sources?: any[]}[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userText = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const systemInstruction = `
        أنت مساعد محاسبي ذكي وخبير في تجارة مستحضرات التجميل والعناية الشخصية بالجملة.
        اسم البرنامج: "البطل بلس".
        لديك صلاحية الوصول للبيانات التالية:
        - عدد الأصناف: ${products.length} صنف.
        - المبيعات الكلية المعتمدة: ${sales.reduce((a,b) => a + (b.isReturned ? 0 : b.totalAmount), 0)} ج.م.
        - عدد العملاء المسجلين: ${customers.length}.
        
        مهمتك:
        1. الإجابة على استفسارات المستخدم حول المخزون والمبيعات والديون.
        2. استخدام أداة البحث (googleSearch) إذا سأل المستخدم عن أسعار السوق أو مقارنات المنتجات العالمية.
        3. تحدث بلهجة مصرية احترافية ومحفزة للأعمال.
        4. إذا استخدمت البحث، اذكر الروابط في نهاية الإجابة.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: userText,
        config: { 
          systemInstruction,
          tools: [{ googleSearch: {} }] 
        }
      });

      const aiResponse = response.text || "عذراً، لم أستطع تحليل الطلب حالياً.";
      const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks;

      setMessages(prev => [...prev, { role: 'ai', text: aiResponse, sources }]);
    } catch (err) {
      console.error("AI Error:", err);
      setMessages(prev => [...prev, { role: 'ai', text: "حدث خطأ في الاتصال بمحرك الذكاء الاصطناعي." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 left-8 w-16 h-16 bg-gradient-to-br from-pink-500 to-indigo-600 text-white rounded-full shadow-[0_20px_50px_rgba(236,72,153,0.4)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-[100] group"
      >
        <Sparkles className="group-hover:rotate-12 transition-transform" size={28} />
      </button>

      {isOpen && (
        <div className="fixed bottom-28 left-8 w-full max-w-md bg-white rounded-[40px] shadow-2xl border border-slate-100 z-[100] flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 duration-500 max-h-[70vh]">
          <div className="p-6 bg-slate-900 text-white flex justify-between items-center shadow-lg">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-pink-50 text-white rounded-2xl flex items-center justify-center shadow-inner">
                   <Bot size={20} />
                </div>
                <div className="text-right">
                   <h3 className="text-sm font-black">خبير التجميل الذكي</h3>
                   <div className="flex items-center gap-1.5 mt-0.5 justify-end">
                      <span className="text-[9px] font-bold text-slate-400">متصل بـ Gemini 3 Pro</span>
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                   </div>
                </div>
             </div>
             <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X size={20} />
             </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar bg-slate-50/50">
             {messages.length === 0 && (
               <div className="text-center py-10 space-y-6">
                  <div className="w-20 h-20 bg-pink-50 text-pink-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                     <Search size={32} className="animate-pulse" />
                  </div>
                  <div className="px-6 space-y-2">
                     <p className="text-slate-800 font-black text-sm">مرحباً بك في مركز التحليل الذكي 👋</p>
                     <p className="text-slate-400 font-bold text-xs leading-relaxed">أنا خبيرك المحاسبي والتجاري. اسألني عن أسعار الماركات العالمية أو أداء مبيعاتك.</p>
                  </div>
               </div>
             )}
             {messages.map((m, i) => (
               <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-[25px] font-bold text-[11px] leading-relaxed shadow-sm text-right ${
                    m.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white border border-slate-100 text-slate-700 rounded-bl-none'
                  }`}>
                    {m.text}
                    {m.sources && (
                      <div className="mt-3 pt-3 border-t border-slate-100 space-y-1">
                        <p className="text-[9px] font-black text-blue-500 uppercase">المصادر:</p>
                        {m.sources.map((src: any, idx: number) => (
                          <a key={idx} href={src.web?.uri} target="_blank" className="text-[8px] text-slate-400 hover:text-blue-500 block truncate">
                            🔗 {src.web?.title || src.web?.uri}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
               </div>
             ))}
             {isTyping && (
               <div className="flex justify-start">
                  <div className="bg-white p-4 rounded-[25px] rounded-bl-none shadow-sm flex gap-1.5 items-center">
                     <div className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-bounce"></div>
                     <div className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-bounce delay-75"></div>
                     <div className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-bounce delay-150"></div>
                  </div>
               </div>
             )}
             <div ref={messagesEndRef} />
          </div>

          <div className="p-4 bg-white border-t border-slate-100 flex gap-2">
             <button onClick={handleSend} disabled={!input.trim() || isTyping} className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-xl hover:bg-black transition-all">
                <Send size={20} />
             </button>
             <input 
              type="text" 
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleSend()}
              placeholder="اسألني عن السوق أو حساباتك..."
              className="flex-1 bg-slate-50 rounded-2xl px-6 py-4 font-bold text-xs outline-none focus:ring-2 focus:ring-pink-500 transition-all shadow-inner text-right"
             />
          </div>
        </div>
      )}
    </>
  );
};

export default AIAssistant;