
import React, { useState } from 'react';
import { 
  Building2, Plus, Trash2, Calendar, DollarSign, 
  TrendingDown, Truck, Monitor, Sofa, Package, X, 
  CheckCircle, ShieldCheck, History, Info
} from 'lucide-react';
import { Asset } from '../types';

interface AssetsProps {
  assets: Asset[];
  setAssets: React.Dispatch<React.SetStateAction<Asset[]>>;
}

const Assets: React.FC<AssetsProps> = ({ assets, setAssets }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Partial<Asset>>({
    name: '',
    category: 'other',
    purchaseDate: new Date().toISOString().split('T')[0],
    purchaseValue: 0,
    depreciationRate: 10
  });

  const handleSave = () => {
    if (!formData.name || !formData.purchaseValue) return;
    const newAsset: Asset = {
      ...(formData as Asset),
      id: Date.now().toString()
    };
    setAssets([...assets, newAsset]);
    setIsAdding(false);
    setFormData({ name: '', category: 'other', purchaseDate: new Date().toISOString().split('T')[0], purchaseValue: 0, depreciationRate: 10 });
  };

  const calculateDepreciation = (asset: Asset) => {
    const purchaseDate = new Date(asset.purchaseDate);
    const today = new Date();
    const yearsElapsed = (today.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    const accumulatedDepreciation = Math.min(asset.purchaseValue, (asset.purchaseValue * (asset.depreciationRate / 100)) * Math.max(0, yearsElapsed));
    const currentValue = asset.purchaseValue - accumulatedDepreciation;
    
    return { accumulatedDepreciation, currentValue };
  };

  const getCategoryIcon = (cat: string) => {
    switch(cat) {
      case 'vehicles': return <Truck size={24}/>;
      case 'electronics': return <Monitor size={24}/>;
      case 'furniture': return <Sofa size={24}/>;
      case 'buildings': return <Building2 size={24}/>;
      default: return <Package size={24}/>;
    }
  };

  const totalOriginalValue = assets.reduce((a, b) => a + b.purchaseValue, 0);
  const totalCurrentValue = assets.reduce((a, b) => a + calculateDepreciation(b).currentValue, 0);

  return (
    <div className="space-y-10 animate-in fade-in duration-500 font-['Cairo'] text-right pb-20">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white p-10 rounded-[50px] shadow-sm border">
        <div>
          <h2 className="text-3xl font-black text-slate-800 flex items-center gap-4"><Building2 size={36} className="text-blue-600"/> إدارة الأصول الثابتة</h2>
          <p className="text-slate-500 font-bold mt-1">تتبع الممتلكات المؤسسية وحساب الإهلاك السنوي</p>
        </div>
        <button onClick={() => setIsAdding(true)} className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black shadow-xl hover:bg-blue-700 flex items-center gap-3">
          <Plus size={20} /> إضافة أصل جديد
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <div className="bg-slate-900 p-8 rounded-[45px] text-white flex justify-between items-center shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full"></div>
            <div className="relative z-10">
               <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">إجمالي تكلفة الشراء</p>
               <h4 className="text-4xl font-black">{totalOriginalValue.toLocaleString()} <span className="text-sm">ج.م</span></h4>
            </div>
            <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center"><DollarSign size={32} /></div>
         </div>
         <div className="bg-white p-8 rounded-[45px] border-2 border-slate-100 flex justify-between items-center shadow-sm">
            <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">صافي القيمة الدفترية الحالية</p>
               <h4 className="text-4xl font-black text-slate-800">{totalCurrentValue.toLocaleString()} <span className="text-sm text-slate-400">ج.م</span></h4>
            </div>
            <div className="w-16 h-16 bg-green-50 text-green-600 rounded-3xl flex items-center justify-center"><TrendingDown size={32} /></div>
         </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {assets.map(asset => {
          const { accumulatedDepreciation, currentValue } = calculateDepreciation(asset);
          const depPercent = (accumulatedDepreciation / asset.purchaseValue) * 100;

          return (
            <div key={asset.id} className="bg-white p-8 rounded-[45px] border border-slate-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
               <div className="flex justify-between items-start mb-8">
                  <div className="w-14 h-14 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                     {getCategoryIcon(asset.category)}
                  </div>
                  <button onClick={() => setAssets(assets.filter(a => a.id !== asset.id))} className="p-2.5 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={18}/></button>
               </div>
               
               <h3 className="text-xl font-black text-slate-800 mb-1">{asset.name}</h3>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-2"><Calendar size={12}/> تاريخ الشراء: {asset.purchaseDate}</p>

               <div className="space-y-6">
                  <div className="flex justify-between items-end">
                     <div className="text-right">
                        <p className="text-[9px] font-black text-slate-400 uppercase">قيمة الأصل حالياً</p>
                        <p className="text-2xl font-black text-blue-600">{currentValue.toLocaleString()} <span className="text-xs">ج.م</span></p>
                     </div>
                     <div className="text-left">
                        <p className="text-[9px] font-black text-slate-400 uppercase">مجمع الإهلاك</p>
                        <p className="font-black text-red-500">{accumulatedDepreciation.toLocaleString()}</p>
                     </div>
                  </div>

                  <div className="space-y-2">
                     <div className="flex justify-between text-[9px] font-black uppercase">
                        <span className="text-slate-400">نسبة الإهلاك المطبقة</span>
                        <span className="text-slate-800">{Math.round(depPercent)}%</span>
                     </div>
                     <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-red-500 rounded-full" style={{width: `${depPercent}%`}}></div>
                     </div>
                  </div>
               </div>
            </div>
          );
        })}
        {assets.length === 0 && (
          <div className="col-span-full py-32 text-center opacity-20"><Building2 size={80} className="mx-auto mb-4" /><p className="text-2xl font-black italic">لا يوجد أصول مسجلة في النظام بعد</p></div>
        )}
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-[300] bg-slate-900/60 backdrop-blur-2xl flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-xl rounded-[50px] overflow-hidden shadow-2xl animate-in zoom-in border-4 border-white">
              <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
                 <h2 className="text-2xl font-black">إضافة أصل جديد للمؤسسة</h2>
                 <button onClick={() => setIsAdding(false)}><X /></button>
              </div>
              <div className="p-10 space-y-6">
                 <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 pr-4">اسم الأصل (مثلاً: سيارة دايو توزيع)</label>
                    <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 p-4 rounded-2xl font-black outline-none border-2 border-transparent focus:border-blue-500 shadow-inner" />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-xs font-black text-slate-400 pr-4">التصنيف المحاسبي</label>
                       <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as any})} className="w-full bg-slate-50 p-4 rounded-2xl font-black border-none outline-none shadow-inner">
                          <option value="vehicles">وسائل نقل وانتقال</option>
                          <option value="electronics">أجهزة إلكترونية</option>
                          <option value="furniture">أثاث ومفروشات</option>
                          <option value="buildings">عقارات ومباني</option>
                          <option value="other">أخرى</option>
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-xs font-black text-slate-400 pr-4">تاريخ الشراء</label>
                       <input type="date" value={formData.purchaseDate} onChange={e => setFormData({...formData, purchaseDate: e.target.value})} className="w-full bg-slate-50 p-4 rounded-2xl font-black border-none outline-none shadow-inner" />
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-xs font-black text-slate-400 pr-4">تكلفة الشراء (ج.م)</label>
                       <input type="number" value={formData.purchaseValue || ''} onChange={e => setFormData({...formData, purchaseValue: parseFloat(e.target.value) || 0})} className="w-full bg-slate-50 p-4 rounded-2xl font-black text-blue-600 shadow-inner" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-xs font-black text-slate-400 pr-4">نسبة الإهلاك السنوي (%)</label>
                       <input type="number" value={formData.depreciationRate || ''} onChange={e => setFormData({...formData, depreciationRate: parseFloat(e.target.value) || 0})} className="w-full bg-slate-50 p-4 rounded-2xl font-black text-red-500 shadow-inner" />
                    </div>
                 </div>
                 <button onClick={handleSave} className="w-full py-6 bg-slate-900 text-white rounded-[30px] font-black text-xl shadow-xl hover:bg-black transition-all flex items-center justify-center gap-3">
                    <CheckCircle /> اعتماد الأصل وتدشينه
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Assets;
