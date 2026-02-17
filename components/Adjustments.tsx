
import React, { useState, useEffect } from 'react';
import { 
  ClipboardCheck, Plus, Search, Trash2, AlertTriangle, 
  CheckCircle, Minus, ArrowRight, TrendingDown, TrendingUp,
  Package, FileText, History, AlertOctagon, X
} from 'lucide-react';
import { Product, StockAdjustment } from '../types';

interface AdjustmentsProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  adjustments: StockAdjustment[];
  setAdjustments: React.Dispatch<React.SetStateAction<StockAdjustment[]>>;
}

const Adjustments: React.FC<AdjustmentsProps> = ({ products, setProducts, adjustments, setAdjustments }) => {
  const [selectedProductId, setSelectedProductId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    actualStock: 0,
    type: 'عجز' as 'هالك' | 'عجز' | 'زيادة',
    reason: ''
  });

  const selectedProduct = products.find(p => p.id === selectedProductId);
  const difference = selectedProduct ? formData.actualStock - selectedProduct.stock : 0;

  // Auto-set type based on difference
  useEffect(() => {
    if (difference < 0) {
      setFormData(prev => ({ ...prev, type: 'عجز' }));
    } else if (difference > 0) {
      setFormData(prev => ({ ...prev, type: 'زيادة' }));
    }
  }, [difference]);

  // Reset form when product changes
  useEffect(() => {
    if (selectedProduct) {
      setFormData(prev => ({ ...prev, actualStock: selectedProduct.stock, reason: '' }));
    }
  }, [selectedProductId]);

  const handleAdjust = () => {
    if (!selectedProduct || difference === 0) {
      alert('لا يوجد اختلاف في الرصيد لتسويته');
      return;
    }
    
    if (!formData.reason.trim()) {
      alert('يرجى ذكر سبب التسوية');
      return;
    }

    const newAdj: StockAdjustment = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      oldStock: selectedProduct.stock,
      newStock: formData.actualStock,
      type: formData.type,
      reason: formData.reason,
      user: 'المسؤول' // Can be dynamic based on auth context
    };

    setAdjustments([newAdj, ...adjustments]);
    setProducts(products.map(p => p.id === selectedProduct.id ? { ...p, stock: formData.actualStock } : p));
    
    alert('تم اعتماد التسوية وتحديث المخزون بنجاح');
    setSelectedProductId('');
    setSearchTerm('');
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.barcode.includes(searchTerm)
  ).slice(0, 10); // Limit results for performance

  return (
    <div className="space-y-10 animate-in fade-in duration-500 font-['Cairo'] text-right pb-20">
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 bg-white p-10 rounded-[50px] shadow-sm border border-slate-100">
        <div>
          <h2 className="text-3xl font-black text-slate-800 flex items-center gap-4">
             <div className="p-3 bg-red-50 text-red-600 rounded-2xl"><ClipboardCheck size={32}/></div>
             التسويات الجردية (Inventory Adjustments)
          </h2>
          <p className="text-slate-500 font-bold mt-2 mr-2">معالجة الفروقات المخزنية، الهالك، والتسويات اليدوية للأرصدة</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Adjustment Form */}
        <div className="lg:col-span-1 bg-white p-8 rounded-[45px] shadow-xl border border-slate-100 relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
           
           <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-2">
              <Plus className="text-blue-600"/> تسجيل تسوية جديدة
           </h3>
           
           <div className="space-y-6">
              {/* Product Selection */}
              <div className="space-y-2">
                 <label className="text-xs font-black text-slate-400 pr-2">البحث عن صنف</label>
                 <div className="relative group">
                    <Search className="absolute right-4 top-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                    <input 
                      type="text" 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="اسم الصنف أو الباركود..."
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-12 py-3.5 font-bold text-sm outline-none focus:border-blue-500 focus:bg-white transition-all shadow-inner"
                    />
                    {searchTerm && !selectedProductId && (
                      <div className="absolute top-full right-0 w-full bg-white rounded-2xl shadow-xl border border-slate-100 mt-2 z-50 max-h-60 overflow-y-auto">
                        {filteredProducts.map(p => (
                          <div 
                            key={p.id} 
                            onClick={() => { setSelectedProductId(p.id); setSearchTerm(p.name); }}
                            className="p-3 hover:bg-blue-50 cursor-pointer border-b border-slate-50 flex justify-between items-center"
                          >
                            <span className="text-xs font-bold text-slate-700">{p.name}</span>
                            <span className="text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-500">رصيد: {p.stock}</span>
                          </div>
                        ))}
                      </div>
                    )}
                 </div>
              </div>

              {selectedProduct ? (
                 <div className="space-y-6 animate-in zoom-in duration-300">
                    {/* Current Stock Display */}
                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 flex justify-between items-center">
                       <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase mb-1">الرصيد الدفتري الحالي</p>
                          <p className="text-2xl font-black text-slate-800">{selectedProduct.stock} <span className="text-xs text-slate-400">قطعة</span></p>
                       </div>
                       <Package size={32} className="text-slate-300" />
                    </div>

                    {/* Actual Stock Input */}
                    <div className="space-y-2">
                       <label className="text-xs font-black text-slate-400 pr-2">الرصيد الفعلي (الجرد)</label>
                       <div className="flex items-center gap-3">
                          <button onClick={() => setFormData(prev => ({...prev, actualStock: Math.max(0, prev.actualStock - 1)}))} className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-all"><Minus/></button>
                          <input 
                            type="number" 
                            value={formData.actualStock}
                            onChange={(e) => setFormData(prev => ({...prev, actualStock: parseInt(e.target.value) || 0}))}
                            className="flex-1 bg-white border-2 border-slate-200 rounded-2xl py-3 text-center text-2xl font-black text-blue-600 outline-none focus:border-blue-500"
                          />
                          <button onClick={() => setFormData(prev => ({...prev, actualStock: prev.actualStock + 1}))} className="w-12 h-12 rounded-2xl bg-green-50 text-green-500 flex items-center justify-center hover:bg-green-100 transition-all"><Plus/></button>
                       </div>
                    </div>

                    {/* Difference Indicator */}
                    <div className={`p-4 rounded-2xl border-2 flex items-center justify-between ${difference === 0 ? 'bg-slate-50 border-slate-100' : difference > 0 ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'}`}>
                       <div className="flex items-center gap-2">
                          {difference > 0 ? <TrendingUp size={20}/> : difference < 0 ? <TrendingDown size={20}/> : <CheckCircle size={20} className="text-slate-400"/>}
                          <span className="font-black text-sm">الفارق:</span>
                       </div>
                       <span className="font-black text-xl dir-ltr">{difference > 0 ? `+${difference}` : difference}</span>
                    </div>

                    {/* Type & Reason */}
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 pr-2">نوع الحركة</label>
                          <select 
                            value={formData.type}
                            onChange={(e) => setFormData(prev => ({...prev, type: e.target.value as any}))}
                            className="w-full bg-slate-50 border-none rounded-xl p-3 text-xs font-bold outline-none"
                          >
                             <option value="عجز">عجز (Shortage)</option>
                             <option value="هالك">هالك (Damage)</option>
                             <option value="زيادة">زيادة (Overstock)</option>
                          </select>
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 pr-2">السبب</label>
                          <input 
                            type="text"
                            value={formData.reason}
                            onChange={(e) => setFormData(prev => ({...prev, reason: e.target.value}))}
                            placeholder="سبب التعديل..."
                            className="w-full bg-slate-50 border-none rounded-xl p-3 text-xs font-bold outline-none"
                          />
                       </div>
                    </div>

                    <button 
                      onClick={handleAdjust}
                      disabled={difference === 0}
                      className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black shadow-xl hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                       <CheckCircle size={18}/> اعتماد التسوية
                    </button>
                 </div>
              ) : (
                 <div className="py-20 text-center opacity-40">
                    <Package size={64} className="mx-auto mb-4 text-slate-300"/>
                    <p className="font-bold text-slate-500">اختر صنفاً للبدء</p>
                 </div>
              )}
           </div>
        </div>

        {/* History Log */}
        <div className="lg:col-span-2 bg-white rounded-[45px] shadow-sm border border-slate-100 overflow-hidden flex flex-col">
           <div className="p-8 border-b bg-slate-50/50 flex justify-between items-center">
              <h3 className="font-black text-slate-800 flex items-center gap-3">
                 <History size={20} className="text-purple-500"/> سجل الحركات المخزنية
              </h3>
              <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100 text-xs font-bold text-slate-500">
                 آخر 50 عملية
              </div>
           </div>
           
           <div className="flex-1 overflow-auto no-scrollbar">
              <table className="w-full text-right">
                 <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest sticky top-0">
                    <tr>
                       <th className="px-8 py-5">التاريخ</th>
                       <th className="px-8 py-5">الصنف</th>
                       <th className="px-8 py-5 text-center">النوع</th>
                       <th className="px-8 py-5 text-center">الكمية</th>
                       <th className="px-8 py-5">السبب / الملاحظات</th>
                       <th className="px-8 py-5">بواسطة</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {adjustments.length === 0 ? (
                       <tr>
                          <td colSpan={6} className="py-20 text-center opacity-30">
                             <FileText size={48} className="mx-auto mb-4"/>
                             <p className="font-bold text-lg">لا توجد تسويات سابقة</p>
                          </td>
                       </tr>
                    ) : (
                       adjustments.map((adj) => {
                          const diff = adj.newStock - adj.oldStock;
                          return (
                             <tr key={adj.id} className="hover:bg-slate-50 transition-colors text-sm">
                                <td className="px-8 py-5 font-bold text-slate-500 text-xs">{adj.date}</td>
                                <td className="px-8 py-5 font-black text-slate-800">{adj.productName}</td>
                                <td className="px-8 py-5 text-center">
                                   <span className={`px-3 py-1 rounded-full text-[10px] font-black ${
                                      adj.type === 'زيادة' ? 'bg-green-100 text-green-700' : 
                                      adj.type === 'هالك' ? 'bg-red-100 text-red-700' : 
                                      'bg-orange-100 text-orange-700'
                                   }`}>
                                      {adj.type}
                                   </span>
                                </td>
                                <td className="px-8 py-5 text-center dir-ltr font-black">
                                   <span className={diff > 0 ? 'text-green-600' : 'text-red-600'}>
                                      {diff > 0 ? `+${diff}` : diff}
                                   </span>
                                </td>
                                <td className="px-8 py-5 text-slate-600 font-medium max-w-xs truncate">{adj.reason}</td>
                                <td className="px-8 py-5 text-xs font-bold text-slate-400">{adj.user}</td>
                             </tr>
                          );
                       })
                    )}
                 </tbody>
              </table>
           </div>
        </div>

      </div>
    </div>
  );
};

export default Adjustments;
