
import React, { useState } from 'react';
import { Target, Plus, TrendingDown, TrendingUp, AlertTriangle, CheckCircle, PieChart, Calendar, X } from 'lucide-react';
import { Budget, Expense, Voucher } from '../types';

interface BudgetManagerProps {
  budgets: Budget[];
  setBudgets: React.Dispatch<React.SetStateAction<Budget[]>>;
  expenses: Expense[];
  vouchers: Voucher[];
}

const BudgetManager: React.FC<BudgetManagerProps> = ({ budgets, setBudgets, expenses, vouchers }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Partial<Budget>>({ category: 'رواتب', amount: 0, period: new Date().toISOString().slice(0, 7) });

  const getActualSpending = (category: string, period: string) => {
    const expTotal = expenses
      .filter(e => e.category === category && e.date.startsWith(period))
      .reduce((a, b) => a + b.amount, 0);
    const voucherTotal = vouchers
      .filter(v => v.type === 'صرف' && v.category === category && v.date.startsWith(period))
      .reduce((a, b) => a + b.amount, 0);
    return expTotal + voucherTotal;
  };

  const handleSave = () => {
    if (!formData.amount) return;
    const newBudget: Budget = { ...formData as Budget, id: Date.now().toString() };
    setBudgets([...budgets, newBudget]);
    setIsAdding(false);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 font-['Cairo'] text-right pb-20">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white p-10 rounded-[50px] shadow-sm border">
        <div>
          <h2 className="text-3xl font-black text-slate-800 flex items-center gap-4"><Target size={36} className="text-pink-600"/> الرقابة على الموازنات Budgeting</h2>
          <p className="text-slate-500 font-bold mt-1">تحديد سقف المصروفات ومراقبة الانحرافات المالية</p>
        </div>
        <button onClick={() => setIsAdding(true)} className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black shadow-xl hover:bg-black transition-all flex items-center gap-3">
          <Plus size={20} /> إضافة موازنة جديدة
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {budgets.map(b => {
          const actual = getActualSpending(b.category, b.period);
          const percent = Math.min(100, (actual / b.amount) * 100);
          const isOver = actual > b.amount;

          return (
            <div key={b.id} className="bg-white p-8 rounded-[45px] border border-slate-100 shadow-sm hover:shadow-xl transition-all relative overflow-hidden group">
               <div className={`absolute top-0 right-0 w-2 h-full ${isOver ? 'bg-red-500' : percent > 80 ? 'bg-orange-500' : 'bg-green-500'}`}></div>
               <div className="flex justify-between items-start mb-8">
                  <div>
                    <h3 className="text-xl font-black text-slate-800">{b.category}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Calendar size={12}/> الفترة: {b.period}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isOver ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                    {isOver ? <AlertTriangle size={24}/> : <CheckCircle size={24}/>}
                  </div>
               </div>

               <div className="space-y-6">
                  <div className="flex justify-between items-end">
                     <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase">الإنفاق الفعلي</p>
                        <p className={`text-2xl font-black ${isOver ? 'text-red-600' : 'text-slate-800'}`}>{actual.toLocaleString()} <span className="text-xs">ج.م</span></p>
                     </div>
                     <div className="text-left">
                        <p className="text-[9px] font-black text-slate-400 uppercase">الميزانية</p>
                        <p className="font-black text-blue-600">{b.amount.toLocaleString()}</p>
                     </div>
                  </div>

                  <div className="space-y-2">
                     <div className="flex justify-between text-[9px] font-black uppercase">
                        <span className="text-slate-400">معدل الاستهلاك</span>
                        <span className={isOver ? 'text-red-600' : 'text-slate-800'}>{Math.round((actual/b.amount)*100)}%</span>
                     </div>
                     <div className="h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                        <div 
                          className={`h-full transition-all duration-1000 ${isOver ? 'bg-red-500' : percent > 80 ? 'bg-orange-500' : 'bg-blue-600'}`} 
                          style={{width: `${percent}%`}}
                        ></div>
                     </div>
                  </div>
                  
                  {isOver && (
                    <div className="p-3 bg-red-50 text-red-600 rounded-xl text-[10px] font-bold flex items-center gap-2 animate-pulse">
                       <TrendingUp size={14}/> تنبيه: لقد تجاوزت الميزانية المخططة بـ {(actual - b.amount).toLocaleString()} ج.م
                    </div>
                  )}
               </div>
            </div>
          );
        })}
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-[300] bg-slate-900/60 backdrop-blur-2xl flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-lg rounded-[50px] overflow-hidden shadow-2xl animate-in zoom-in border-4 border-white">
              <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
                 <h2 className="text-2xl font-black">تعيين ميزانية جديدة</h2>
                 <button onClick={() => setIsAdding(false)}><X /></button>
              </div>
              <div className="p-10 space-y-6">
                 <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 pr-4">البند (التصنيف)</label>
                    <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-slate-50 p-4 rounded-2xl font-black border-none outline-none shadow-inner">
                       <option value="رواتب">رواتب ومستحقات</option>
                       <option value="إيجار">إيجارات ومرافق</option>
                       <option value="فواتير">فواتير (كهرباء/ماء)</option>
                       <option value="نثريات">مصاريف نثرية</option>
                       <option value="تسويق">تسويق وإعلان</option>
                    </select>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-xs font-black text-slate-400 pr-4">الشهر المستهدف</label>
                       <input type="month" value={formData.period} onChange={e => setFormData({...formData, period: e.target.value})} className="w-full bg-slate-50 p-4 rounded-2xl font-black border-none outline-none shadow-inner" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-xs font-black text-slate-400 pr-4">المبلغ المستهدف (Max)</label>
                       <input type="number" value={formData.amount || ''} onChange={e => setFormData({...formData, amount: parseFloat(e.target.value) || 0})} className="w-full bg-slate-100 p-4 rounded-2xl font-black text-xl text-center" placeholder="0.00" />
                    </div>
                 </div>
                 <button onClick={handleSave} className="w-full py-6 bg-pink-600 text-white rounded-[30px] font-black text-xl shadow-xl hover:bg-pink-700 transition-all flex items-center justify-center gap-3">
                    <CheckCircle /> اعتماد الموازنة
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default BudgetManager;
