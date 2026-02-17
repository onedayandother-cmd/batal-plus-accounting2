
import React, { useState, useRef } from 'react';
import { 
  FileText, Plus, Search, Trash2, CheckCircle, 
  ArrowRight, X, Printer, ShoppingBag, Receipt, Minus,
  History, PenTool, User, Calendar, LayoutGrid, List
} from 'lucide-react';
import { Product, Quotation, Customer, InvoiceItem, UnitType, PricingTier } from '../types';

interface QuotationsProps {
  products: Product[];
  customers: Customer[];
  quotations: Quotation[];
  setQuotations: React.Dispatch<React.SetStateAction<Quotation[]>>;
  onConvertToSale: (quote: Quotation) => void;
}

const Quotations: React.FC<QuotationsProps> = ({ products, customers, quotations, setQuotations, onConvertToSale }) => {
  const [activeTab, setActiveTab] = useState<'new' | 'history'>('new');
  
  // New Quotation State
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [cart, setCart] = useState<InvoiceItem[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // History State
  const [historySearch, setHistorySearch] = useState('');

  // --- Logic for New Quotation ---
  const addToCart = (p: Product) => {
    const existingIndex = cart.findIndex(i => i.productId === p.id);
    if (existingIndex !== -1) {
       updateItemQuantity(cart[existingIndex].id, cart[existingIndex].quantity + 1);
    } else {
      const item: InvoiceItem = {
        id: Math.random().toString(36).substr(2, 9),
        productId: p.id,
        productName: p.name,
        unit: UnitType.PIECE,
        tier: PricingTier.RETAIL,
        quantity: 1,
        pricePerUnit: p.prices[UnitType.PIECE][PricingTier.RETAIL],
        discount: 0,
        costPriceAtSale: p.costPrice,
        total: p.prices[UnitType.PIECE][PricingTier.RETAIL]
      };
      setCart([...cart, item]);
    }
    setProductSearch('');
    setShowSuggestions(false);
    searchInputRef.current?.focus();
  };

  const updateItemQuantity = (itemId: string, newQty: number) => {
    const qty = Math.max(1, newQty);
    setCart(prev => prev.map(item => 
       item.id === itemId ? { ...item, quantity: qty, total: (qty * item.pricePerUnit) - (item.discount || 0) } : item
    ));
  };

  const updateItemPrice = (itemId: string, newPrice: number) => {
    setCart(prev => prev.map(item => 
       item.id === itemId ? { ...item, pricePerUnit: newPrice, total: (item.quantity * newPrice) - (item.discount || 0) } : item
    ));
  };

  const handleSave = () => {
    if (cart.length === 0) return alert('السلة فارغة!');
    
    const customer = customers.find(c => c.id === selectedCustomerId);
    const newQuote: Quotation = {
      id: Date.now().toString(),
      customerId: selectedCustomerId,
      customerName: customer?.name || 'عميل نقدي/غير مسجل',
      date: new Date().toISOString().split('T')[0],
      items: cart,
      totalAmount: cart.reduce((s, i) => s + i.total, 0),
      status: 'pending'
    };
    
    setQuotations([newQuote, ...quotations]);
    setCart([]);
    setSelectedCustomerId('');
    setActiveTab('history'); // Switch to history to see the new quote
  };

  // --- Filtered Data ---
  const filteredHistory = quotations.filter(q => 
    q.customerName.includes(historySearch) || q.id.includes(historySearch)
  );

  const searchedProducts = products.filter(p => 
    p.name.includes(productSearch) || p.barcode.includes(productSearch)
  ).slice(0, 8);

  const totalAmount = cart.reduce((sum, item) => sum + item.total, 0);

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] font-['Cairo'] -mt-4 bg-slate-100 overflow-hidden text-right rounded-t-[30px] border border-slate-200 shadow-sm">
      
      {/* Header Tabs */}
      <div className="bg-white px-6 py-4 border-b border-slate-200 shadow-sm z-20 flex justify-between items-center">
         <div className="flex items-center gap-4">
            <div className="bg-purple-50 p-3 rounded-2xl text-purple-600">
               <FileText size={24} />
            </div>
            <div>
               <h2 className="text-xl font-black text-slate-800">عروض الأسعار (المقايسات)</h2>
               <p className="text-[10px] font-bold text-slate-400">إصدار عروض مهنية للعملاء دون حجز المخزون</p>
            </div>
         </div>
         <div className="flex bg-slate-100 p-1.5 rounded-xl gap-2">
            <button 
              onClick={() => setActiveTab('new')}
              className={`px-6 py-2 rounded-lg text-xs font-black transition-all flex items-center gap-2 ${activeTab === 'new' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
               <Plus size={14}/> عرض جديد
            </button>
            <button 
              onClick={() => setActiveTab('history')}
              className={`px-6 py-2 rounded-lg text-xs font-black transition-all flex items-center gap-2 ${activeTab === 'history' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
               سجل العروض <History size={14}/>
            </button>
         </div>
      </div>

      {activeTab === 'new' ? (
        <div className="flex-1 flex overflow-hidden">
           {/* Right Side: Product Search & Cart */}
           <div className="flex-1 flex flex-col border-l border-slate-200 bg-slate-50">
              <div className="p-6 border-b border-slate-200 bg-white">
                 <div className="relative group">
                    <input 
                      ref={searchInputRef}
                      type="text" 
                      placeholder="ابحث عن صنف لإضافته..." 
                      value={productSearch}
                      onChange={e => { setProductSearch(e.target.value); setShowSuggestions(true); }}
                      className="w-full bg-slate-100 border-2 border-transparent focus:bg-white focus:border-purple-500 rounded-2xl px-12 py-4 font-black text-sm outline-none transition-all shadow-inner"
                    />
                    <Search className="absolute right-4 top-4 text-slate-400" size={20} />
                    
                    {showSuggestions && productSearch && (
                       <div className="absolute top-full right-0 w-full mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden">
                          {searchedProducts.map(p => (
                             <button 
                                key={p.id} 
                                onClick={() => addToCart(p)}
                                className="w-full p-4 text-right hover:bg-purple-50 flex justify-between items-center border-b border-slate-50 last:border-0 group"
                             >
                                <div>
                                   <p className="font-bold text-slate-800 text-xs">{p.name}</p>
                                   <p className="text-[10px] text-slate-400">السعر: {p.prices[UnitType.PIECE][PricingTier.RETAIL]} ج.م</p>
                                </div>
                                <Plus size={16} className="text-purple-600 opacity-0 group-hover:opacity-100 transition-all"/>
                             </button>
                          ))}
                          {searchedProducts.length === 0 && <div className="p-4 text-center text-xs text-slate-400">لا توجد نتائج</div>}
                       </div>
                    )}
                 </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-3 no-scrollbar">
                 {cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center opacity-30">
                       <ShoppingBag size={64} className="mb-4 text-purple-300" />
                       <p className="font-black text-lg text-slate-500">سلة العرض فارغة</p>
                       <p className="text-xs font-bold text-slate-400 mt-2">ابدأ بإضافة منتجات لإنشاء العرض</p>
                    </div>
                 ) : (
                    cart.map(item => (
                       <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between group hover:border-purple-200 transition-all">
                          <div className="flex-1">
                             <h4 className="font-black text-slate-800 text-xs mb-1">{item.productName}</h4>
                             <div className="flex items-center gap-2">
                                <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] font-bold text-slate-500">{item.unit}</span>
                                <input 
                                  type="number" 
                                  value={item.pricePerUnit} 
                                  onChange={e => updateItemPrice(item.id, parseFloat(e.target.value)||0)}
                                  className="w-16 bg-slate-50 border border-slate-200 rounded px-1 text-center text-[10px] font-bold outline-none focus:border-purple-500"
                                />
                                <span className="text-[10px] text-slate-400">ج.م</span>
                             </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                             <div className="flex items-center bg-slate-100 rounded-lg h-8">
                                <button onClick={() => updateItemQuantity(item.id, item.quantity - 1)} className="w-8 h-full flex items-center justify-center hover:bg-slate-200 rounded-r-lg text-slate-500"><Minus size={12}/></button>
                                <span className="w-8 text-center font-black text-xs">{item.quantity}</span>
                                <button onClick={() => updateItemQuantity(item.id, item.quantity + 1)} className="w-8 h-full flex items-center justify-center hover:bg-slate-200 rounded-l-lg text-slate-500"><Plus size={12}/></button>
                             </div>
                             <div className="text-left w-20">
                                <p className="font-black text-purple-600 text-sm">{item.total.toLocaleString()}</p>
                             </div>
                             <button onClick={() => setCart(cart.filter(c => c.id !== item.id))} className="text-slate-300 hover:text-red-500 p-2"><Trash2 size={16}/></button>
                          </div>
                       </div>
                    ))
                 )}
              </div>
           </div>

           {/* Left Side: Summary & Customer */}
           <div className="w-96 bg-white border-r border-slate-200 flex flex-col p-6 shadow-xl z-10">
              <div className="space-y-6 flex-1">
                 <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">العميل المستهدف</label>
                    <div className="relative">
                       <select 
                         value={selectedCustomerId} 
                         onChange={e => setSelectedCustomerId(e.target.value)} 
                         className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-3 pl-10 font-bold text-sm outline-none focus:border-purple-500 appearance-none cursor-pointer"
                       >
                          <option value="">-- عميل نقدي / غير محدد --</option>
                          {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                       </select>
                       <User size={16} className="absolute left-3 top-3.5 text-slate-400 pointer-events-none"/>
                    </div>
                 </div>

                 <div className="bg-purple-50 p-6 rounded-[30px] border border-purple-100 space-y-4">
                    <h3 className="font-black text-purple-900 flex items-center gap-2"><Receipt size={18}/> ملخص العرض</h3>
                    <div className="space-y-2">
                       <div className="flex justify-between text-xs font-bold text-slate-600">
                          <span>عدد الأصناف</span>
                          <span>{cart.length}</span>
                       </div>
                       <div className="flex justify-between text-xs font-bold text-slate-600">
                          <span>إجمالي الكميات</span>
                          <span>{cart.reduce((a,b)=>a+b.quantity,0)}</span>
                       </div>
                       <div className="h-px bg-purple-200 my-2"></div>
                       <div className="flex justify-between items-center">
                          <span className="font-black text-purple-900">الإجمالي النهائي</span>
                          <span className="font-black text-2xl text-purple-600">{totalAmount.toLocaleString()} <span className="text-xs">ج.م</span></span>
                       </div>
                    </div>
                 </div>
              </div>

              <button 
                onClick={handleSave}
                disabled={cart.length === 0}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-lg shadow-xl hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                 <CheckCircle size={20} /> حفظ العرض
              </button>
           </div>
        </div>
      ) : (
        // History Tab
        <div className="flex-1 overflow-auto bg-slate-50 p-8">
           <div className="bg-white rounded-[40px] shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
              <div className="p-6 border-b flex justify-between items-center bg-slate-50/50">
                 <h3 className="font-black text-slate-700 text-lg">أرشيف عروض الأسعار</h3>
                 <div className="relative w-64">
                    <input 
                      type="text" 
                      placeholder="بحث برقم العرض أو العميل..." 
                      value={historySearch}
                      onChange={e => setHistorySearch(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-purple-200"
                    />
                    <Search className="absolute right-3 top-3 text-slate-400" size={14} />
                 </div>
              </div>
              
              <div className="flex-1 overflow-y-auto no-scrollbar">
                 <table className="w-full text-right">
                    <thead className="bg-slate-100 text-[10px] font-black text-slate-500 uppercase tracking-widest sticky top-0">
                       <tr>
                          <th className="px-8 py-5">رقم العرض</th>
                          <th className="px-8 py-5">العميل</th>
                          <th className="px-8 py-5 text-center">التاريخ</th>
                          <th className="px-8 py-5 text-center">القيمة</th>
                          <th className="px-8 py-5 text-center">الحالة</th>
                          <th className="px-8 py-5 text-left">إجراءات</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                       {filteredHistory.map(q => (
                          <tr key={q.id} className="hover:bg-slate-50 transition-colors group">
                             <td className="px-8 py-6 font-black text-purple-600 text-sm">#{q.id.slice(-6)}</td>
                             <td className="px-8 py-6 font-bold text-slate-800">{q.customerName}</td>
                             <td className="px-8 py-6 text-center text-xs font-bold text-slate-500">{q.date}</td>
                             <td className="px-8 py-6 text-center font-black text-slate-900">{q.totalAmount.toLocaleString()} ج.م</td>
                             <td className="px-8 py-6 text-center">
                                <span className={`px-3 py-1 rounded-full text-[9px] font-black ${q.status === 'converted' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                   {q.status === 'converted' ? 'تم البيع' : 'نشط'}
                                </span>
                             </td>
                             <td className="px-8 py-6 text-left">
                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                   {q.status === 'pending' && (
                                     <button 
                                       onClick={() => onConvertToSale(q)}
                                       className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-600 hover:text-white transition-all flex items-center gap-1 text-[10px] font-black"
                                       title="تحويل لفاتورة"
                                     >
                                        <ArrowRight size={14}/> تحويل
                                     </button>
                                   )}
                                   <button onClick={() => setQuotations(quotations.filter(x => x.id !== q.id))} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all"><Trash2 size={14}/></button>
                                </div>
                             </td>
                          </tr>
                       ))}
                       {filteredHistory.length === 0 && (
                          <tr><td colSpan={6} className="py-20 text-center opacity-30 font-bold text-lg">لا توجد عروض أسعار مسجلة</td></tr>
                       )}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Quotations;
