
import React, { useState } from 'react';
import { Landmark, Plus, Trash2, ArrowUpRight, ArrowDownRight, Search, X, CheckCircle, Wallet } from 'lucide-react';
import { BankAccount } from '../types';

interface BankManagerProps {
  accounts: BankAccount[];
  setAccounts: React.Dispatch<React.SetStateAction<BankAccount[]>>;
}

const BankManager: React.FC<BankManagerProps> = ({ accounts, setAccounts }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ bankName: '', accountNumber: '', balance: 0 });

  const handleSave = () => {
    if (!formData.bankName || !formData.accountNumber) return;
    const newAcc: BankAccount = { ...formData, id: Date.now().toString() };
    setAccounts([...accounts, newAcc]);
    setIsAdding(false);
    setFormData({ bankName: '', accountNumber: '', balance: 0 });
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 font-['Cairo'] text-right pb-20">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white p-10 rounded-[50px] shadow-sm border border-slate-100">
        <div>
          <h2 className="text-3xl font-black text-slate-800 flex items-center gap-4"><Landmark size={36} className="text-indigo-600"/> إدارة الحسابات البنكية</h2>
          <p className="text-slate-500 font-bold mt-1">تتبع التحويلات البنكية، أرصدة المؤسسة، وحركة الشيكات</p>
        </div>
        <button onClick={() => setIsAdding(true)} className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black shadow-xl hover:bg-indigo-700 flex items-center gap-3">
          <Plus size={20} /> إضافة حساب بنكي
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {accounts.map(acc => (
          <div key={acc.id} className="bg-white p-8 rounded-[45px] border border-slate-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
             <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full"></div>
             <div className="flex justify-between items-start mb-8 relative z-10">
                <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-all">
                   <Landmark size={32} />
                </div>
                <button onClick={() => setAccounts(accounts.filter(a => a.id !== acc.id))} className="p-3 text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={18}/></button>
             </div>
             
             <h3 className="text-xl font-black text-slate-800 mb-1">{acc.bankName}</h3>
             <p className="text-xs font-bold text-slate-400 mb-8 tracking-widest">{acc.accountNumber}</p>

             <div className="bg-indigo-50 p-6 rounded-[30px] border border-indigo-100">
                <p className="text-[10px] font-black text-indigo-400 uppercase mb-1">الرصيد المتاح</p>
                <h4 className="text-3xl font-black text-indigo-700 tracking-tighter">{acc.balance.toLocaleString()} <span className="text-sm">ج.م</span></h4>
             </div>
          </div>
        ))}
        {accounts.length === 0 && (
          <div className="col-span-full py-20 text-center opacity-20"><Landmark size={80} className="mx-auto mb-4" /><p className="text-2xl font-black">لم يتم تسجيل حسابات بنكية بعد</p></div>
        )}
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-[300] bg-slate-900/60 backdrop-blur-2xl flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-lg rounded-[50px] p-12 shadow-2xl animate-in zoom-in border-4 border-white">
              <div className="flex justify-between items-center mb-10">
                 <h2 className="text-3xl font-black">حساب بنكي جديد</h2>
                 <button onClick={() => setIsAdding(false)} className="p-3 bg-slate-50 rounded-full"><X /></button>
              </div>
              <div className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase pr-4">اسم البنك</label>
                    <input type="text" value={formData.bankName} onChange={e => setFormData({...formData, bankName: e.target.value})} className="w-full bg-slate-50 p-5 rounded-3xl font-black outline-none border-2 border-transparent focus:border-indigo-500" placeholder="مثلاً: البنك الأهلي المصري" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase pr-4">رقم الحساب (IBAN)</label>
                    <input type="text" value={formData.accountNumber} onChange={e => setFormData({...formData, accountNumber: e.target.value})} className="w-full bg-slate-50 p-5 rounded-3xl font-black outline-none border-2 border-transparent focus:border-indigo-500" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase pr-4">الرصيد الافتتاحي</label>
                    <input type="number" value={formData.balance} onChange={e => setFormData({...formData, balance: parseFloat(e.target.value) || 0})} className="w-full bg-slate-100 p-5 rounded-3xl font-black text-2xl text-center" />
                 </div>
                 <button onClick={handleSave} className="w-full py-6 bg-indigo-600 text-white rounded-[30px] font-black text-xl shadow-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-3">
                    <CheckCircle size={24}/> اعتماد الحساب
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default BankManager;
