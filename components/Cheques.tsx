
import React, { useState } from 'react';
import { 
  ScrollText, Plus, Search, Calendar, DollarSign, 
  ArrowUpRight, ArrowDownRight, CheckCircle, XCircle, 
  AlertTriangle, RotateCcw, Landmark, Filter, Check
} from 'lucide-react';
import { Cheque, ChequeType, ChequeStatus, BankAccount, Customer, Supplier } from '../types';

interface ChequesProps {
  cheques: Cheque[];
  setCheques: React.Dispatch<React.SetStateAction<Cheque[]>>;
  bankAccounts: BankAccount[];
  setBankAccounts: React.Dispatch<React.SetStateAction<BankAccount[]>>;
  customers: Customer[];
  suppliers: Supplier[];
}

const Cheques: React.FC<ChequesProps> = ({ cheques, setCheques, bankAccounts, setBankAccounts, customers, suppliers }) => {
  const [activeTab, setActiveTab] = useState<ChequeType>('receivable');
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState<Partial<Cheque>>({
    chequeNumber: '',
    bankName: '',
    amount: 0,
    dueDate: new Date().toISOString().split('T')[0],
    issueDate: new Date().toISOString().split('T')[0],
    beneficiary: '',
    status: 'pending',
    note: ''
  });

  const handleSave = () => {
    if (!formData.chequeNumber || !formData.amount || !formData.beneficiary) return;
    const newCheque: Cheque = {
      ...formData as Cheque,
      id: Date.now().toString(),
      type: activeTab
    };
    setCheques([newCheque, ...cheques]);
    setIsAdding(false);
    setFormData({
        chequeNumber: '', bankName: '', amount: 0, 
        dueDate: new Date().toISOString().split('T')[0], 
        issueDate: new Date().toISOString().split('T')[0], 
        beneficiary: '', status: 'pending', note: ''
    });
  };

  const updateStatus = (id: string, newStatus: ChequeStatus) => {
    const cheque = cheques.find(c => c.id === id);
    if (!cheque) return;

    if (newStatus === 'cleared') {
        const bankId = prompt('الرجاء إدخال رقم تعريف الحساب البنكي (أو اختر من القائمة في التحديث القادم):', bankAccounts[0]?.id);
        if (bankId) {
            const bank = bankAccounts.find(b => b.id === bankId);
            if (bank) {
                // Update Bank Balance
                const amount = cheque.amount;
                const newBalance = cheque.type === 'receivable' ? bank.balance + amount : bank.balance - amount;
                
                setBankAccounts(prev => prev.map(b => b.id === bankId ? { ...b, balance: newBalance } : b));
                alert(`تم تحديث رصيد حساب ${bank.bankName} بنجاح.`);
            } else {
                alert('حساب بنكي غير موجود، سيتم تغيير الحالة فقط دون التأثير المالي.');
            }
        }
    }

    setCheques(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
  };

  const filteredCheques = cheques.filter(c => 
    c.type === activeTab && 
    (c.chequeNumber.includes(searchTerm) || c.beneficiary.includes(searchTerm))
  );

  const pendingAmount = filteredCheques.filter(c => c.status === 'pending').reduce((a, b) => a + b.amount, 0);

  return (
    <div className="space-y-10 animate-in fade-in duration-500 font-['Cairo'] text-right pb-20">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 bg-white p-10 rounded-[50px] shadow-sm border border-slate-100">
        <div>
          <h2 className="text-3xl font-black text-slate-800 flex items-center gap-4">
             <ScrollText className="text-indigo-600" size={36} /> إدارة الشيكات والأوراق المالية
          </h2>
          <p className="text-slate-500 font-bold mt-1">متابعة أوراق القبض والدفع وتواريخ الاستحقاق البنكي</p>
        </div>
        <div className="flex bg-slate-100 p-2 rounded-[25px] gap-2">
           <button onClick={() => setActiveTab('receivable')} className={`px-8 py-3 rounded-2xl font-black text-xs transition-all flex items-center gap-2 ${activeTab === 'receivable' ? 'bg-green-600 text-white shadow-lg' : 'text-slate-500 hover:bg-white'}`}>
              <ArrowDownRight size={16}/> أوراق قبض (وارد)
           </button>
           <button onClick={() => setActiveTab('payable')} className={`px-8 py-3 rounded-2xl font-black text-xs transition-all flex items-center gap-2 ${activeTab === 'payable' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-500 hover:bg-white'}`}>
              <ArrowUpRight size={16}/> أوراق دفع (صادر)
           </button>
        </div>
      </div>

      {/* Stats & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-1 bg-slate-900 p-8 rounded-[45px] text-white shadow-2xl flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 blur-3xl rounded-full"></div>
            <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">إجمالي الشيكات تحت التحصيل</p>
               <h3 className="text-4xl font-black">{pendingAmount.toLocaleString()} <span className="text-sm text-slate-500">ج.م</span></h3>
            </div>
            <button onClick={() => setIsAdding(true)} className="mt-8 w-full py-4 bg-white text-slate-900 rounded-2xl font-black text-sm hover:bg-indigo-50 transition-all flex items-center justify-center gap-2">
               <Plus size={18}/> تسجيل شيك جديد
            </button>
         </div>

         <div className="lg:col-span-2 bg-white rounded-[45px] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
            <div className="p-8 border-b bg-slate-50/50 flex justify-between items-center">
               <h3 className="font-black text-slate-800">سجل الشيكات</h3>
               <div className="relative w-64">
                  <input 
                    type="text" 
                    placeholder="بحث برقم الشيك..." 
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold outline-none"
                  />
                  <Search className="absolute right-3 top-2.5 text-slate-400" size={14} />
               </div>
            </div>
            <div className="flex-1 overflow-y-auto max-h-[400px] no-scrollbar">
               <table className="w-full text-right">
                  <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest sticky top-0">
                     <tr>
                        <th className="px-6 py-4">رقم الشيك</th>
                        <th className="px-6 py-4">البنك</th>
                        <th className="px-6 py-4 text-center">الاستحقاق</th>
                        <th className="px-6 py-4 text-center">المبلغ</th>
                        <th className="px-6 py-4 text-center">الحالة</th>
                        <th className="px-6 py-4 text-left">إجراءات</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                     {filteredCheques.map(c => {
                        const isOverdue = new Date(c.dueDate) < new Date() && c.status === 'pending';
                        return (
                        <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                           <td className="px-6 py-4 font-black text-slate-800">{c.chequeNumber}</td>
                           <td className="px-6 py-4 text-xs font-bold text-slate-500">{c.bankName}</td>
                           <td className="px-6 py-4 text-center">
                              <span className={`text-xs font-black ${isOverdue ? 'text-red-600 animate-pulse' : 'text-slate-700'}`}>
                                 {c.dueDate}
                              </span>
                           </td>
                           <td className="px-6 py-4 text-center font-black text-indigo-600">{c.amount.toLocaleString()}</td>
                           <td className="px-6 py-4 text-center">
                              <span className={`px-3 py-1 rounded-full text-[9px] font-black ${
                                 c.status === 'cleared' ? 'bg-green-100 text-green-700' :
                                 c.status === 'bounced' ? 'bg-red-100 text-red-700' :
                                 c.status === 'returned' ? 'bg-orange-100 text-orange-700' :
                                 'bg-slate-100 text-slate-600'
                              }`}>
                                 {c.status === 'pending' ? 'تحت التحصيل' : c.status === 'cleared' ? 'تم الصرف' : c.status === 'bounced' ? 'مرفوض' : 'مرتجع'}
                              </span>
                           </td>
                           <td className="px-6 py-4 text-left">
                              {c.status === 'pending' && (
                                 <div className="flex justify-end gap-2">
                                    <button onClick={() => updateStatus(c.id, 'cleared')} title="تحصيل/صرف" className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-600 hover:text-white transition-all"><Check size={14}/></button>
                                    <button onClick={() => updateStatus(c.id, 'bounced')} title="رفض البنك" className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all"><XCircle size={14}/></button>
                                 </div>
                              )}
                           </td>
                        </tr>
                     )})}
                     {filteredCheques.length === 0 && (
                        <tr><td colSpan={6} className="py-20 text-center opacity-30 font-bold">لا توجد شيكات</td></tr>
                     )}
                  </tbody>
               </table>
            </div>
         </div>
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-[300] bg-slate-900/80 backdrop-blur-xl flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-2xl rounded-[50px] overflow-hidden shadow-2xl animate-in zoom-in border-4 border-white">
              <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
                 <h2 className="text-2xl font-black flex items-center gap-3">
                    {activeTab === 'receivable' ? <ArrowDownRight className="text-green-400"/> : <ArrowUpRight className="text-red-400"/>}
                    تسجيل {activeTab === 'receivable' ? 'ورقة قبض' : 'ورقة دفع'}
                 </h2>
                 <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-white/10 rounded-full"><XCircle/></button>
              </div>
              <div className="p-10 space-y-6">
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-xs font-black text-slate-400 pr-4">رقم الشيك</label>
                       <input type="text" value={formData.chequeNumber} onChange={e => setFormData({...formData, chequeNumber: e.target.value})} className="w-full bg-slate-50 p-4 rounded-2xl font-black outline-none border-2 border-transparent focus:border-indigo-500" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-xs font-black text-slate-400 pr-4">البنك المسحوب عليه</label>
                       <input type="text" value={formData.bankName} onChange={e => setFormData({...formData, bankName: e.target.value})} className="w-full bg-slate-50 p-4 rounded-2xl font-black outline-none border-2 border-transparent focus:border-indigo-500" placeholder="مثلاً: CIB" />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 pr-4">قيمة الشيك</label>
                    <input type="number" value={formData.amount || ''} onChange={e => setFormData({...formData, amount: parseFloat(e.target.value) || 0})} className="w-full bg-slate-100 p-5 rounded-3xl font-black text-3xl text-center outline-none border-2 border-transparent focus:border-indigo-500 text-indigo-700" placeholder="0.00" />
                 </div>

                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-xs font-black text-slate-400 pr-4">تاريخ الاستحقاق</label>
                       <input type="date" value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} className="w-full bg-slate-50 p-4 rounded-2xl font-black outline-none" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-xs font-black text-slate-400 pr-4">{activeTab === 'receivable' ? 'اسم العميل (الساحب)' : 'اسم المورد (المستفيد)'}</label>
                       <input 
                        type="text" 
                        value={formData.beneficiary} 
                        onChange={e => setFormData({...formData, beneficiary: e.target.value})} 
                        className="w-full bg-slate-50 p-4 rounded-2xl font-black outline-none" 
                        list="contacts"
                       />
                       <datalist id="contacts">
                          {activeTab === 'receivable' ? customers.map(c => <option key={c.id} value={c.name}/>) : suppliers.map(s => <option key={s.id} value={s.name}/>)}
                       </datalist>
                    </div>
                 </div>

                 <button onClick={handleSave} className="w-full py-5 bg-slate-900 text-white rounded-[30px] font-black text-xl shadow-xl hover:bg-black transition-all flex items-center justify-center gap-3">
                    <CheckCircle size={20}/> حفظ الشيك في الحافظة
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Cheques;
