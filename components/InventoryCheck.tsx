
import React, { useState, useMemo } from 'react';
import { 
  ClipboardCheck, Search, Filter, CheckCircle, 
  AlertTriangle, Save, X, ArrowLeftRight, Package,
  RotateCcw, History, TrendingDown, TrendingUp, Boxes,
  Minus, Plus
} from 'lucide-react';
import { Product, StockAdjustment } from '../types';

interface InventoryCheckProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  adjustments: StockAdjustment[];
  setAdjustments: React.Dispatch<React.SetStateAction<StockAdjustment[]>>;
}

const InventoryCheck: React.FC<InventoryCheckProps> = ({ products, setProducts, adjustments, setAdjustments }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('الكل');
  // تخزين الكميات الفعلية المدخلة مفتاحها هو معرف الصنف
  const [actualCounts, setActualCounts] = useState<{ [id: string]: number }>({});
  const [isProcessing, setIsProcessing] = useState(false);

  const categories = useMemo(() => ['الكل', ...Array.from(new Set(products.map(p => p.category)))], [products]);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.includes(searchTerm) || p.barcode.includes(searchTerm);
    const matchesCat = categoryFilter === 'الكل' || p.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const handleInputChange = (productId: string, value: string) => {
    const num = parseInt(value);
    setActualCounts(prev => ({ ...prev, [productId]: isNaN(num) ? 0 : num }));
  };

  const adjustCount = (productId: string, delta: number, currentStock: number) => {
    const currentActual = actualCounts[productId] ?? currentStock;
    const newCount = Math.max(0, currentActual + delta);
    setActualCounts(prev => ({ ...prev, [productId]: newCount }));
  };

  const handleCommitInventory = () => {
    const itemsToAdjust = Object.entries(actualCounts).filter(([id, count]) => {
        const prod = products.find(p => p.id === id);
        return prod && prod.stock !== count;
    });

    if (itemsToAdjust.length === 0) {
        alert('لم يتم رصد أي اختلافات في الجرد حتى الآن');
        return;
    }

    if (!confirm(`هل أنت متأكد من اعتماد الجرد؟ سيتم تعديل أرصدة ${itemsToAdjust.length} صنف وتسجيلها كعمليات تسوية.`)) return;

    setIsProcessing(true);

    const newAdjustments: StockAdjustment[] = [];
    const updatedProducts = products.map(p => {
        if (actualCounts[p.id] !== undefined && actualCounts[p.id] !== p.stock) {
            const count = actualCounts[p.id];
            const diff = count - p.stock;
            
            newAdjustments.push({
                id: Date.now().toString() + Math.random(),
                date: new Date().toISOString().split('T')[0],
                productId: p.id,
                productName: p.name,
                oldStock: p.stock,
                newStock: count,
                type: diff > 0 ? 'زيادة' : 'عجز',
                reason: 'جرد دوري شامل للمخزن',
                user: 'المسؤول'
            });
            return { ...p, stock: count };
        }
        return p;
    });

    setProducts(updatedProducts);
    setAdjustments([...newAdjustments, ...adjustments]);
    setActualCounts({});
    setIsProcessing(false);
    alert('تم تحديث المخازن بنجاح بناءً على نتائج الجرد الفعلي.');
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 font-['Cairo'] text-right pb-20">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8 bg-white p-10 rounded-[50px] shadow-sm border border-slate-100">
        <div>
          <h2 className="text-3xl font-black text-slate-800 flex items-center gap-4">
             <ClipboardCheck className="text-indigo-600" size={36} /> منصة الجرد الدوري الذكي
          </h2>
          <p className="text-slate-500 font-bold mt-1">مطابقة الأرصدة الدفترية مع الواقع الفعلي للمخازن</p>
        </div>
        <div className="flex gap-4">
           <div className="bg-slate-100 p-2 rounded-[25px] flex gap-2">
              <input 
                type="text" 
                placeholder="بحث سريع..." 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
                className="bg-white border-none rounded-2xl px-6 py-2.5 font-bold text-xs shadow-sm w-48" 
              />
              <select 
                value={categoryFilter} 
                onChange={e => setCategoryFilter(e.target.value)}
                className="bg-white border-none rounded-2xl px-4 py-2.5 font-bold text-[10px] shadow-sm outline-none cursor-pointer"
              >
                 {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
           </div>
           <button 
             onClick={handleCommitInventory}
             disabled={Object.keys(actualCounts).length === 0}
             className="bg-slate-900 text-white px-10 py-4 rounded-[20px] font-black shadow-xl hover:bg-black transition-all flex items-center gap-3 disabled:opacity-30 disabled:cursor-not-allowed"
           >
              <Save size={20} /> اعتماد نتائج الجرد
           </button>
        </div>
      </div>

      <div className="bg-white rounded-[50px] shadow-sm border border-slate-100 overflow-hidden relative">
         <div className="p-8 bg-indigo-50 border-b border-indigo-100 flex justify-between items-center">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg"><Boxes size={20}/></div>
               <h3 className="font-black text-indigo-900">قائمة المطابقة الجردية</h3>
            </div>
            <div className="flex gap-8">
               <div className="text-center"><p className="text-[10px] font-black text-indigo-400 uppercase">الأصناف المعدلة</p><p className="font-black text-xl text-indigo-700">{Object.keys(actualCounts).length}</p></div>
               <div className="h-10 w-px bg-indigo-200"></div>
               <div className="text-center"><p className="text-[10px] font-black text-indigo-400 uppercase">قيمة الفروقات</p><p className="font-black text-xl text-red-600">0.00 ج.م</p></div>
            </div>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-right">
               <thead className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b">
                  <tr>
                     <th className="px-8 py-5">الصنف / الماركة</th>
                     <th className="px-8 py-5 text-center">الرصيد الدفتري</th>
                     <th className="px-8 py-5 text-center">الرصيد الفعلي (الآن)</th>
                     <th className="px-8 py-5 text-center">الفارق</th>
                     <th className="px-8 py-5 text-left">الحالة</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {filteredProducts.map(p => {
                    const actual = actualCounts[p.id] ?? p.stock;
                    const diff = actual - p.stock;
                    return (
                      <tr key={p.id} className={`hover:bg-slate-50/50 transition-colors ${diff !== 0 ? 'bg-indigo-50/20' : ''}`}>
                         <td className="px-8 py-6">
                            <p className="font-black text-slate-800 text-sm">{p.name}</p>
                            <span className="text-[9px] text-slate-400 font-bold uppercase">{p.brand} | {p.category}</span>
                         </td>
                         <td className="px-8 py-6 text-center">
                            <span className="bg-slate-100 px-4 py-1.5 rounded-full font-black text-slate-600">{p.stock}</span>
                         </td>
                         <td className="px-8 py-6 text-center">
                            <div className="relative inline-flex items-center gap-2 group">
                               <button onClick={() => adjustCount(p.id, -1, p.stock)} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"><Minus size={14}/></button>
                               <input 
                                 type="number" 
                                 value={actualCounts[p.id] ?? ''} 
                                 onChange={e => handleInputChange(p.id, e.target.value)}
                                 placeholder={p.stock.toString()}
                                 className={`w-24 bg-white border-2 rounded-xl p-2 text-center font-black outline-none transition-all ${diff !== 0 ? 'border-indigo-500 shadow-md text-indigo-700' : 'border-slate-100 focus:border-blue-500'}`}
                               />
                               <button onClick={() => adjustCount(p.id, 1, p.stock)} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-500 hover:bg-blue-50 transition-all opacity-0 group-hover:opacity-100"><Plus size={14}/></button>
                            </div>
                         </td>
                         <td className="px-8 py-6 text-center">
                            {diff !== 0 ? (
                               <div className={`flex items-center justify-center gap-1 font-black ${diff > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {diff > 0 ? <TrendingUp size={14}/> : <TrendingDown size={14}/>}
                                  <span>{diff > 0 ? `+${diff}` : diff}</span>
                               </div>
                            ) : <span className="text-slate-300">---</span>}
                         </td>
                         <td className="px-8 py-6 text-left">
                            <span className={`px-3 py-1 rounded-full text-[9px] font-black ${diff === 0 ? 'bg-slate-100 text-slate-400' : 'bg-amber-100 text-amber-600'}`}>
                               {diff === 0 ? 'مطابق' : 'بحاجة لتسوية'}
                            </span>
                         </td>
                      </tr>
                    );
                  })}
                  {filteredProducts.length === 0 && (
                    <tr><td colSpan={5} className="py-40 text-center opacity-20"><Search size={80} className="mx-auto mb-4" /><p className="text-2xl font-black">لا توجد أصناف تطابق البحث</p></td></tr>
                  )}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
};

export default InventoryCheck;
