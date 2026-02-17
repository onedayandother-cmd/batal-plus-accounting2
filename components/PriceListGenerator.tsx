
import React, { useState } from 'react';
import { 
  X, FileText, Download, Printer, Filter, CheckCircle, 
  ChevronDown, Table, FileSpreadsheet, Eye, DollarSign, 
  MessageSquare, Users, Search, Check, Send, Copy,
  LayoutGrid, List, Layers, Box
} from 'lucide-react';
import { Product, PricingTier, UnitType, Customer } from '../types';

interface PriceListGeneratorProps {
  products: Product[];
  categories: string[];
  customers: Customer[];
  onClose: () => void;
  storeName: string;
}

const PriceListGenerator: React.FC<PriceListGeneratorProps> = ({ products, categories, customers, onClose, storeName }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('الكل');
  const [selectedTier, setSelectedTier] = useState<PricingTier>(PricingTier.RETAIL);
  const [visibleUnits, setVisibleUnits] = useState<UnitType[]>([UnitType.PIECE]);
  const [layout, setLayout] = useState<'table' | 'grid'>('table');
  const [hideOutOfStock, setHideOutOfStock] = useState(false);
  const [isSelectingCustomers, setIsSelectingCustomers] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  const filteredData = products.filter(p => {
    const categoryMatch = selectedCategory === 'الكل' || p.category === selectedCategory;
    const stockMatch = !hideOutOfStock || p.stock > 0;
    return categoryMatch && stockMatch;
  });

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(customerSearch.toLowerCase()) || 
    c.phone.includes(customerSearch)
  );

  const toggleUnit = (unit: UnitType) => {
    if (visibleUnits.includes(unit)) {
      if (visibleUnits.length > 1) setVisibleUnits(visibleUnits.filter(u => u !== unit));
    } else {
      setVisibleUnits([...visibleUnits, unit]);
    }
  };

  const generatePriceListRawText = () => {
    let text = `*📋 قائمة أسعار: ${storeName}*\n`;
    text += `*📅 تاريخ الاستخراج:* ${new Date().toLocaleDateString('ar-EG')}\n`;
    text += `*🏷️ الفئة:* ${selectedCategory}\n`;
    text += `*💰 فئة السعر:* ${selectedTier}\n`;
    text += `--------------------------------\n\n`;
    
    filteredData.forEach((p, idx) => {
      text += `${idx + 1}. *${p.name}*\n`;
      visibleUnits.forEach(u => {
        const price = p.prices[u]?.[selectedTier] || 0;
        text += `   🔹 ${u}: ${price.toLocaleString()} ج.م\n`;
      });
      if (p.stock <= 0) text += `   ⚠️ (غير متوفر حالياً)\n`;
      text += `\n`;
    });
    
    text += `--------------------------------\n`;
    text += `✅ *نسعد دائماً بخدمتكم*\n`;
    text += `_الأسعار قابلة للتحديث حسب متغيرات السوق_`;
    return text;
  };

  const handleCopyToClipboard = () => {
    const text = generatePriceListRawText();
    navigator.clipboard.writeText(text).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  const handleSendToCustomer = (phone: string) => {
    if (!phone) return;
    const message = encodeURIComponent(generatePriceListRawText());
    let formattedPhone = phone.replace(/\D/g, ''); 
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '20' + formattedPhone.slice(1);
    } else if (!formattedPhone.startsWith('20')) {
      formattedPhone = '20' + formattedPhone;
    }
    window.open(`https://wa.me/${formattedPhone}?text=${message}`, '_blank');
  };

  const handlePrintPDF = () => {
    const windowUrl = window.open('', '', 'left=0,top=0,width=800,height=900,toolbar=0,scrollbars=0,status=0');
    if (windowUrl) {
      const isGrid = layout === 'grid';
      windowUrl.document.write(`
        <html>
          <head>
            <title>قائمة أسعار - ${selectedCategory}</title>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap');
              body { font-family: 'Cairo', sans-serif; margin: 0; padding: 20mm; direction: rtl; color: #334155; background: #fff; }
              header { text-align: center; border-bottom: 4px solid #0f172a; padding-bottom: 10mm; margin-bottom: 10mm; }
              header h1 { margin: 0; font-size: 28pt; font-weight: 900; color: #1e293b; }
              header p { margin: 5px 0; color: #64748b; font-weight: 700; font-size: 14pt; }
              .meta { display: flex; justify-content: space-between; margin-bottom: 10mm; font-size: 11pt; font-weight: bold; border-bottom: 1px dashed #e2e8f0; padding-bottom: 5mm; }
              
              /* Table Layout */
              table { width: 100%; border-collapse: collapse; margin-top: 5mm; }
              th { background: #f8fafc; border: 1px solid #cbd5e1; padding: 4mm; text-align: right; font-size: 11pt; font-weight: 900; }
              td { border: 1px solid #e2e8f0; padding: 3mm 4mm; font-size: 10pt; font-weight: 700; }
              .price-col { text-align: center; color: #2563eb; font-weight: 900; }
              
              /* Grid Layout */
              .grid-container { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8mm; }
              .card { border: 2px solid #f1f5f9; border-radius: 15px; padding: 6mm; background: #f8fafc; }
              .card h3 { margin: 0 0 4mm 0; font-size: 13pt; font-weight: 900; border-bottom: 2px solid #e2e8f0; padding-bottom: 2mm; }
              .card-price { display: flex; justify-content: space-between; margin-bottom: 2mm; padding: 2mm; background: #fff; border-radius: 8px; border: 1px solid #e2e8f0; }
              .card-price span:last-child { font-weight: 900; color: #10b981; }

              .footer { margin-top: 20mm; text-align: center; font-size: 9pt; color: #94a3b8; border-top: 2px solid #e2e8f0; padding-top: 8mm; }
              @media print { .no-print { display: none; } }
            </style>
          </head>
          <body>
            <header>
              <h1>${storeName}</h1>
              <p>كتالوج الأسعار المعتمد - فئة ${selectedTier}</p>
            </header>
            <div class="meta">
              <span>التصنيف: ${selectedCategory}</span>
              <span>عدد الأصناف: ${filteredData.length}</span>
              <span>التاريخ: ${new Date().toLocaleDateString('ar-EG')}</span>
            </div>

            ${!isGrid ? `
              <table>
                <thead>
                  <tr>
                    <th style="width: 40%">اسم الصنف</th>
                    ${visibleUnits.map(u => `<th style="text-align: center">${u}</th>`).join('')}
                    <th style="text-align: center; width: 15%">الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  ${filteredData.map(p => `
                    <tr>
                      <td>${p.name} <br/> <small style="color: #94a3b8">${p.brand}</small></td>
                      ${visibleUnits.map(u => `<td class="price-col">${(p.prices[u]?.[selectedTier] || 0).toLocaleString()}</td>`).join('')}
                      <td style="text-align: center; font-size: 8pt">${p.stock > 0 ? '✔️ متوفر' : '❌ نافذ'}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            ` : `
              <div class="grid-container">
                ${filteredData.map(p => `
                  <div class="card">
                    <h3>${p.name}</h3>
                    <p style="font-size: 9pt; color: #64748b; margin-top: -3mm; margin-bottom: 4mm">${p.brand} | ${p.category}</p>
                    ${visibleUnits.map(u => `
                      <div class="card-price">
                        <span>سعر ${u}</span>
                        <span>${(p.prices[u]?.[selectedTier] || 0).toLocaleString()} ج.م</span>
                      </div>
                    `).join('')}
                  </div>
                `).join('')}
              </div>
            `}

            <div class="footer">
              حقوق الطبع محفوظة - نظام البطل بلاس للمحاسبة v2.5
            </div>
            <script>window.onload = () => { window.print(); window.close(); }</script>
          </body>
        </html>
      `);
      windowUrl.document.close();
    }
  };

  return (
    <div className="fixed inset-0 z-[300] bg-slate-900/80 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-[55px] overflow-hidden shadow-2xl animate-in zoom-in duration-300 font-['Cairo'] border-4 border-white my-8">
        <div className="p-8 bg-gradient-to-br from-indigo-900 to-slate-900 text-white flex justify-between items-center shadow-lg">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center shadow-inner">
              <FileSpreadsheet size={28} className="text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-black">{isSelectingCustomers ? 'توجيه القائمة' : 'تخصيص قائمة الأسعار'}</h2>
              <p className="text-[10px] font-bold text-blue-400/60 uppercase tracking-widest">
                {isSelectingCustomers ? 'اختر عميلاً للمشاركة الفورية' : 'إدارة عرض الوحدات وتصميم القائمة'}
              </p>
            </div>
          </div>
          <button 
            onClick={isSelectingCustomers ? () => setIsSelectingCustomers(false) : onClose} 
            className="p-3 hover:bg-white/10 rounded-full transition-all text-slate-400 hover:text-white"
          >
            <X size={28} />
          </button>
        </div>

        <div className="p-10 space-y-10 text-right bg-slate-50/50">
          {!isSelectingCustomers ? (
            <>
              {/* الفلاتر الأساسية */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-slate-400 uppercase pr-4 flex items-center gap-2 tracking-widest">
                    <Filter size={12} /> تصفية التصنيف
                  </label>
                  <div className="relative">
                    <select 
                      value={selectedCategory}
                      onChange={e => setSelectedCategory(e.target.value)}
                      className="w-full bg-white border-2 border-slate-100 rounded-[22px] px-6 py-4 font-black text-sm outline-none focus:border-indigo-500 transition-all shadow-sm appearance-none shadow-inner"
                    >
                      <option value="الكل">جميع الأصناف</option>
                      {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                    <ChevronDown size={18} className="absolute left-6 top-4.5 text-slate-300 pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-slate-400 uppercase pr-4 flex items-center gap-2 tracking-widest">
                    <DollarSign size={12} /> فئة التسعير
                  </label>
                  <div className="relative">
                    <select 
                      value={selectedTier}
                      onChange={e => setSelectedTier(e.target.value as PricingTier)}
                      className="w-full bg-white border-2 border-slate-100 rounded-[22px] px-6 py-4 font-black text-sm outline-none focus:border-indigo-500 transition-all shadow-sm appearance-none shadow-inner"
                    >
                      {Object.values(PricingTier).map(tier => <option key={tier} value={tier}>{tier}</option>)}
                    </select>
                    <ChevronDown size={18} className="absolute left-6 top-4.5 text-slate-300 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* اختيار الوحدات المرئية */}
              <div className="space-y-4">
                 <label className="text-[11px] font-black text-slate-400 uppercase pr-4 flex items-center gap-2 tracking-widest">
                    <Layers size={14} /> الوحدات المطلوب إظهارها
                 </label>
                 <div className="grid grid-cols-3 gap-4">
                    {[UnitType.PIECE, UnitType.DOZEN, UnitType.CARTON].map(unit => (
                       <button 
                         key={unit}
                         onClick={() => toggleUnit(unit)}
                         className={`p-5 rounded-[25px] border-2 transition-all flex flex-col items-center gap-2 group ${visibleUnits.includes(unit) ? 'bg-white border-indigo-600 shadow-lg' : 'bg-white/50 border-slate-100 text-slate-400 hover:border-slate-200'}`}
                       >
                          <Box size={24} className={visibleUnits.includes(unit) ? 'text-indigo-600' : 'text-slate-200'} />
                          <span className="font-black text-xs">{unit}</span>
                          {visibleUnits.includes(unit) && <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>}
                       </button>
                    ))}
                 </div>
              </div>

              {/* تخطيط التصدير */}
              <div className="space-y-4">
                 <label className="text-[11px] font-black text-slate-400 uppercase pr-4 flex items-center gap-2 tracking-widest">
                    <LayoutGrid size={14} /> نمط العرض (PDF/طباعة)
                 </label>
                 <div className="flex bg-white p-2 rounded-2xl border-2 border-slate-100 shadow-inner">
                    <button 
                      onClick={() => setLayout('table')}
                      className={`flex-1 py-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all ${layout === 'table' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
                    >
                       <List size={16}/> جدول تقليدي
                    </button>
                    <button 
                      onClick={() => setLayout('grid')}
                      className={`flex-1 py-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all ${layout === 'grid' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
                    >
                       <LayoutGrid size={16}/> شبكة بطاقات
                    </button>
                 </div>
              </div>

              <div className="flex items-center gap-4 p-6 bg-white border-2 border-slate-100 rounded-[30px] group hover:border-indigo-200 transition-all shadow-sm">
                <input 
                  type="checkbox" 
                  id="hideOut" 
                  checked={hideOutOfStock} 
                  onChange={e => setHideOutOfStock(e.target.checked)}
                  className="w-6 h-6 rounded-lg border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer" 
                />
                <label htmlFor="hideOut" className="text-sm font-black text-slate-600 cursor-pointer select-none">
                  إخفاء المنتجات غير المتوفرة (الرصيد 0)
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button 
                  onClick={handlePrintPDF}
                  className="py-5 bg-slate-900 text-white rounded-[25px] font-black shadow-xl hover:bg-black transition-all flex items-center justify-center gap-3 active:scale-95"
                >
                  <Printer size={20} /> تصدير {layout === 'table' ? 'PDF' : 'كتالوج'}
                </button>
                <button 
                  onClick={handleCopyToClipboard}
                  className={`py-5 rounded-[25px] font-black shadow-xl transition-all flex items-center justify-center gap-3 active:scale-95 ${copySuccess ? 'bg-green-600 text-white shadow-green-100' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100'}`}
                >
                  {copySuccess ? <Check size={20}/> : <Copy size={20}/>} {copySuccess ? 'تم نسخ النص' : 'نسخ للواتساب'}
                </button>
                <button 
                  onClick={() => setIsSelectingCustomers(true)}
                  className="py-5 bg-emerald-600 text-white rounded-[25px] font-black shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all flex items-center justify-center gap-3 active:scale-95"
                >
                  <MessageSquare size={20} /> إرسال مباشر
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-6 animate-in slide-in-from-left-4 duration-300">
               <div className="relative group">
                  <input 
                    type="text" 
                    placeholder="بحث عن اسم العميل أو هاتفه..." 
                    value={customerSearch}
                    onChange={e => setCustomerSearch(e.target.value)}
                    className="w-full bg-white border-2 border-slate-100 rounded-[22px] px-12 py-5 font-black text-sm outline-none focus:border-indigo-500 transition-all shadow-inner"
                  />
                  <Search className="absolute right-5 top-5 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={20} />
               </div>

               <div className="max-h-[350px] overflow-y-auto pr-2 space-y-3 no-scrollbar">
                  {filteredCustomers.length > 0 ? (
                    filteredCustomers.map(c => (
                      <div key={c.id} className="bg-white p-5 rounded-[30px] border-2 border-slate-100 flex items-center justify-between group hover:border-indigo-500 transition-all shadow-sm">
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-all shadow-sm">
                               <Users size={22} />
                            </div>
                            <div>
                               <p className="font-black text-slate-800">{c.name}</p>
                               <p className="text-[10px] text-slate-400 font-bold tracking-widest">{c.phone || 'بدون هاتف'}</p>
                            </div>
                         </div>
                         <button 
                            onClick={() => handleSendToCustomer(c.phone)}
                            disabled={!c.phone}
                            className={`p-4 rounded-2xl font-black text-xs transition-all flex items-center gap-3 active:scale-90 ${c.phone ? 'bg-green-500 text-white hover:bg-green-600 shadow-lg shadow-green-100' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}
                         >
                            إرسال <Send size={16} />
                         </button>
                      </div>
                    ))
                  ) : (
                    <div className="py-12 text-center opacity-30">
                       <Users size={48} className="mx-auto mb-4" />
                       <p className="text-xl font-black tracking-tighter">لم يتم العثور على عملاء</p>
                    </div>
                  )}
               </div>

               <div className="p-8 bg-blue-50 rounded-[40px] border-2 border-blue-100 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-blue-100/50 rounded-full translate-x-10 -translate-y-10"></div>
                  <p className="text-[11px] font-black text-blue-600 uppercase mb-3 tracking-widest flex items-center gap-2"><Eye size={14}/> ملاحظة التخصيص</p>
                  <p className="text-[11px] font-bold text-slate-600 leading-relaxed italic relative z-10">
                     تم اختيار {visibleUnits.length} وحدات للعرض بأسعار {selectedTier}. سيصل العميل نص منسق وجذاب يشجع على الطلب الفوري.
                  </p>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PriceListGenerator;
