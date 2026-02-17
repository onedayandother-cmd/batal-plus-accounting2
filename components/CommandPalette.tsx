
import React, { useState, useEffect, useRef } from 'react';
import { Search, Package, Users, FileText, Settings, ArrowRight, Command, X, ShoppingCart, Truck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Product, Customer } from '../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  customers: Customer[];
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, products, customers }) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredProducts = products.filter(p => p.name.includes(query)).slice(0, 3);
  const filteredCustomers = customers.filter(c => c.name.includes(query)).slice(0, 3);

  const quickLinks = [
    { label: 'إنشاء فاتورة بيع', path: '/sales', icon: <ShoppingCart size={16}/> },
    { label: 'جرد المخزون', path: '/inventory', icon: <Package size={16}/> },
    { label: 'تقارير الأداء', path: '/reports', icon: <FileText size={16}/> },
    { label: 'إعدادات النظام', path: '/settings', icon: <Settings size={16}/> },
  ].filter(l => l.label.includes(query));

  const handleAction = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[600] flex items-start justify-center pt-[15vh] px-4">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose}></div>
      
      <div className="bg-white w-full max-w-2xl rounded-[35px] shadow-2xl border border-slate-100 overflow-hidden relative z-10 animate-in zoom-in duration-200 font-['Cairo'] text-right">
        <div className="p-6 border-b flex items-center gap-4 bg-slate-50/50">
          <Search className="text-slate-400" size={24} />
          <input 
            ref={inputRef}
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث عن أي شيء (صنف، عميل، أمر...)" 
            className="w-full bg-transparent border-none outline-none font-black text-xl text-slate-800 placeholder:text-slate-300"
          />
          <div className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm">
             <span className="text-[10px] font-black text-slate-400">ESC</span>
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-6 no-scrollbar">
          {query.length === 0 && (
            <div className="px-4 py-2">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">روابط سريعة</p>
               <div className="grid grid-cols-2 gap-3">
                  {quickLinks.map((link, i) => (
                    <button key={i} onClick={() => handleAction(link.path)} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 hover:bg-blue-600 hover:text-white transition-all group border border-transparent hover:border-blue-400 shadow-sm">
                       <span className="p-2 bg-white rounded-xl text-blue-600 shadow-sm group-hover:bg-blue-500 group-hover:text-white">{link.icon}</span>
                       <span className="font-black text-xs">{link.label}</span>
                    </button>
                  ))}
               </div>
            </div>
          )}

          {filteredProducts.length > 0 && (
            <div className="space-y-2">
              <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Package size={12}/> المنتجات المكتشفة</p>
              {filteredProducts.map(p => (
                <button key={p.id} onClick={() => handleAction('/inventory')} className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 group">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-black">{p.name[0]}</div>
                      <div className="text-right">
                         <p className="font-black text-sm text-slate-800">{p.name}</p>
                         <p className="text-[10px] text-slate-400 font-bold">الرصيد الحالي: {p.stock} قطعة</p>
                      </div>
                   </div>
                   <ArrowRight size={16} className="text-slate-300 group-hover:text-blue-600 transition-colors" />
                </button>
              ))}
            </div>
          )}

          {filteredCustomers.length > 0 && (
            <div className="space-y-2">
              <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Users size={12}/> العملاء</p>
              {filteredCustomers.map(c => (
                <button key={c.id} onClick={() => handleAction('/customers')} className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 group">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-black">{c.name[0]}</div>
                      <div className="text-right">
                         <p className="font-black text-sm text-slate-800">{c.name}</p>
                         <p className="text-[10px] text-slate-400 font-bold">المديونية: {c.balance.toLocaleString()} ج.م</p>
                      </div>
                   </div>
                   <ArrowRight size={16} className="text-slate-300 group-hover:text-indigo-600 transition-colors" />
                </button>
              ))}
            </div>
          )}
        </div>
        
        <div className="p-4 bg-slate-900 text-white flex justify-between items-center px-8 shrink-0">
           <div className="flex items-center gap-4 text-[10px] font-black opacity-60">
              <span className="flex items-center gap-1"><Command size={10}/>K البحث العالمي</span>
              <span className="flex items-center gap-1">↑↓ للتنقل</span>
              <span className="flex items-center gap-1">↵ للاختيار</span>
           </div>
           <p className="text-[9px] font-bold text-blue-400">نظام البطل بلاس + v2.5</p>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
