
import React, { useState } from 'react';
import { 
  Truck, Phone, Briefcase, Plus, Search, FileText, X, 
  ArrowUpCircle, ArrowDownCircle, Store, Edit2, Trash2, 
  History, Wallet, CreditCard, Smartphone, CheckCircle, AlertTriangle,
  Building, User, ArrowRightLeft
} from 'lucide-react';
import { Supplier, AccountTransaction, PaymentMethod, AppSettings, Voucher, Shift } from '../types';
import StatementPreview from './StatementPreview';

interface SuppliersProps {
  suppliers: Supplier[];
  setSuppliers: React.Dispatch<React.SetStateAction<Supplier[]>>;
  settings: AppSettings;
  setVouchers?: React.Dispatch<React.SetStateAction<Voucher[]>>;
  activeShift?: Shift;
}

const Suppliers: React.FC<SuppliersProps> = ({ suppliers, setSuppliers, settings, setVouchers, activeShift }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [isPaying, setIsPaying] = useState<Supplier | null>(null);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [statementSupplier, setStatementSupplier] = useState<Supplier | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [paymentForm, setPaymentForm] = useState({
    amount: 0,
    method: 'كاش' as PaymentMethod,
    note: ''
  });

  const [formData, setFormData] = useState({ 
    name: '', 
    company: '', 
    phone: '',
    initialDebit: 0, // رصيد لنا عندهم (مدين)
    initialCredit: 0 // رصيد لهم عندنا (دائن)
  });

  const handleSave = () => {
    if (!formData.name) return;
    
    if (editingSupplier) {
      setSuppliers(suppliers.map(s => s.id === editingSupplier.id ? { ...s, name: formData.name, company: formData.company, phone: formData.phone } : s));
      setEditingSupplier(null);
    } else {
      // الرصيد الموجب للمورد يعني أن له أموال (دائن)، والسالب يعني أن لنا أموال (مدين)
      const balance = formData.initialCredit - formData.initialDebit;
      const newSupplier: Supplier = {
        id: Date.now().toString(),
        name: formData.name,
        company: formData.company,
        phone: formData.phone,
        balance: balance,
        transactions: balance !== 0 ? [{
          id: 'init',
          date: new Date().toISOString().split('T')[0],
          note: 'رصيد افتتاحي سابق (قبل النظام)',
          type: balance > 0 ? 'شراء' : 'مرتجع', // شراء يزيد الدين، مرتجع يقلله/يجعلنا دائنين
          amount: Math.abs(balance),
          balanceAfter: balance
        }] : []
      };
      setSuppliers([...suppliers, newSupplier]);
    }
    setFormData({ name: '', company: '', phone: '', initialDebit: 0, initialCredit: 0 });
    setIsAdding(false);
  };

  const handleProcessPayment = () => {
    if (!isPaying || paymentForm.amount <= 0) return;
    if (!activeShift && paymentForm.method === 'كاش') {
      alert('يجب فتح وردية أولاً لسداد مبالغ نقدية من الخزينة');
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const voucherId = Date.now().toString();
    const vNum = `PAY-${voucherId.slice(-5)}`;

    // 1. تحديث حساب المورد (خصم المبلغ من رصيده)
    setSuppliers(suppliers.map(s => {
      if (s.id === isPaying.id) {
        const newBalance = s.balance - paymentForm.amount;
        const newTransaction: AccountTransaction = {
          id: voucherId,
          date: today,
          note: `سداد دفعة نقدية للمورد - سند ${vNum} ${paymentForm.note ? `(${paymentForm.note})` : ''}`,
          type: 'سداد للمورد', // يقلل الرصيد
          amount: paymentForm.amount,
          balanceAfter: newBalance
        };
        return {
          ...s,
          balance: newBalance,
          transactions: [newTransaction, ...s.transactions]
        };
      }
      return s;
    }));

    // 2. إنشاء سند صرف آلي وتحديث الخزينة
    if (setVouchers && activeShift) {
       const newVoucher: Voucher = {
          id: voucherId,
          voucherNumber: vNum,
          date: today,
          time: new Date().toLocaleTimeString('ar-EG'),
          type: 'صرف',
          amount: paymentForm.amount,
          partyName: isPaying.name,
          category: 'بضاعة', // تصنيف تلقائي
          note: `سداد مديونية مورد تلقائي - ${paymentForm.note}`,
          shiftId: activeShift.id
       };
       setVouchers(prev => [newVoucher, ...prev]);
    }

    setIsPaying(null);
    setPaymentForm({ amount: 0, method: 'كاش', note: '' });
    alert(`تم تسديد مبلغ ${paymentForm.amount.toLocaleString()} للمورد بنجاح وتم تسجيل سند الصرف.`);
  };

  const filteredSuppliers = suppliers.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.company.toLowerCase().includes(searchTerm.toLowerCase()));

  // إحصائيات سريعة
  const totalPayables = suppliers.reduce((sum, s) => sum + (s.balance > 0 ? s.balance : 0), 0); // إجمالي المستحق للموردين
  const totalReceivables = suppliers.reduce((sum, s) => sum + (s.balance < 0 ? Math.abs(s.balance) : 0), 0); // إجمالي المستحق لنا (مرتجعات/دفعات مقدمة)

  return (
    <div className="space-y-10 animate-in fade-in duration-500 text-right font-['Cairo'] pb-20">
      
      {/* Header Section */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8 bg-white p-10 rounded-[50px] shadow-sm border border-slate-100">
        <div>
          <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3">
             <Truck className="text-indigo-600" size={36} /> إدارة الموردين والمستحقات
          </h2>
          <p className="text-slate-500 font-bold mt-2 text-sm">قاعدة بيانات الموردين، متابعة التوريدات، وسداد المديونيات</p>
        </div>
        
        <div className="flex gap-4 items-center">
           <div className="hidden md:flex gap-4">
              <div className="px-6 py-3 bg-orange-50 rounded-2xl border border-orange-100 text-center">
                 <p className="text-[9px] font-black text-orange-400 uppercase">مستحقات علينا</p>
                 <p className="font-black text-orange-700 text-lg">{totalPayables.toLocaleString()} ج.م</p>
              </div>
              <div className="px-6 py-3 bg-green-50 rounded-2xl border border-green-100 text-center">
                 <p className="text-[9px] font-black text-green-500 uppercase">أرصدة لنا (مقدم)</p>
                 <p className="font-black text-green-700 text-lg">{totalReceivables.toLocaleString()} ج.م</p>
              </div>
           </div>
           
           <button onClick={() => {setFormData({name: '', company: '', phone: '', initialDebit: 0, initialCredit: 0}); setEditingSupplier(null); setIsAdding(true);}} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs shadow-xl hover:bg-black transition-all flex items-center gap-2">
            <Plus size={18} /> مورد جديد
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-2 rounded-[25px] shadow-sm border w-full max-w-lg mx-auto flex gap-2">
         <div className="relative flex-1">
            <input type="text" placeholder="بحث باسم المورد أو الشركة..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-slate-50 border-none rounded-2xl px-12 py-3 outline-none font-bold text-sm" />
            <Search size={18} className="absolute right-4 top-3 text-slate-400" />
         </div>
      </div>

      {/* Suppliers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {filteredSuppliers.map((s) => {
          const isCreditor = s.balance > 0; // له فلوس
          const isDebtor = s.balance < 0; // عليه فلوس (لنا)
          
          return (
          <div 
            key={s.id} 
            className="bg-white p-8 rounded-[45px] border border-slate-100 shadow-sm hover:shadow-xl transition-all relative group overflow-hidden"
          >
            {/* Status Indicator Stripe */}
            <div className={`absolute top-0 right-0 w-2 h-full ${isCreditor ? 'bg-orange-500' : isDebtor ? 'bg-green-500' : 'bg-slate-200'}`}></div>
            
            <div className="flex items-start justify-between mb-6 pl-2">
              <div className="flex items-center gap-4">
                 <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm">
                   <Building size={24} />
                 </div>
                 <div>
                    <h3 className="text-lg font-black text-slate-800 leading-tight">{s.name}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{s.company || 'مورد عام'}</p>
                 </div>
              </div>
              
              <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all absolute top-6 left-6">
                 <button onClick={() => {setEditingSupplier(s); setFormData({name: s.name, company: s.company, phone: s.phone, initialDebit: 0, initialCredit: 0}); setIsAdding(true);}} className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"><Edit2 size={14}/></button>
                 <button onClick={() => { if(confirm('حذف المورد وسجله بالكامل؟')) setSuppliers(suppliers.filter(x => x.id !== s.id)) }} className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"><Trash2 size={14}/></button>
              </div>
            </div>
            
            <div className="flex items-center gap-2 mb-6 bg-slate-50 w-fit px-4 py-2 rounded-xl">
               <Phone size={14} className="text-slate-400"/>
               <span className="text-xs font-bold text-slate-600 dir-ltr">{s.phone || 'غير مسجل'}</span>
            </div>

            <div className={`p-6 rounded-[30px] flex flex-col items-center justify-center mb-6 border-2 ${isCreditor ? 'bg-orange-50 border-orange-100' : isDebtor ? 'bg-green-50 border-green-100' : 'bg-slate-50 border-slate-100'}`}>
               <span className="text-[9px] font-black text-slate-400 uppercase mb-1">
                  {isCreditor ? 'المستحق له (دائن)' : isDebtor ? 'المستحق لنا (مدين)' : 'الرصيد'}
               </span>
               <span className={`font-black text-3xl ${isCreditor ? 'text-orange-600' : isDebtor ? 'text-green-600' : 'text-slate-600'}`}>
                  {Math.abs(s.balance).toLocaleString()} <span className="text-xs">ج.م</span>
               </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
               <button 
                 onClick={() => {setIsPaying(s); setPaymentForm({ ...paymentForm, amount: s.balance > 0 ? s.balance : 0 });}}
                 className="py-3 bg-slate-900 text-white rounded-2xl font-black text-[10px] hover:bg-black transition-all flex items-center justify-center gap-2 shadow-lg"
               >
                 <Wallet size={14} /> سداد دفعة
               </button>
               <button 
                 onClick={() => setStatementSupplier(s)}
                 className="py-3 bg-white border-2 border-slate-100 text-slate-500 rounded-2xl font-black text-[10px] hover:border-indigo-200 hover:text-indigo-600 transition-all flex items-center justify-center gap-2"
               >
                 <History size={14} /> كشف حساب
               </button>
            </div>
          </div>
        )})}
        
        {filteredSuppliers.length === 0 && (
           <div className="col-span-full py-20 text-center opacity-30">
              <Truck size={64} className="mx-auto mb-4 text-slate-400" />
              <p className="text-xl font-black text-slate-500">لا يوجد موردين بهذا الاسم</p>
           </div>
        )}
      </div>

      {/* Payment Modal */}
      {isPaying && (
        <div className="fixed inset-0 z-[300] bg-slate-900/60 backdrop-blur-2xl flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[50px] overflow-hidden shadow-2xl animate-in zoom-in duration-300 border-4 border-white">
             <div className="p-10 bg-slate-900 text-white flex justify-between items-center">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center shadow-lg"><Wallet size={24}/></div>
                   <div>
                      <h2 className="text-2xl font-black">سداد دفعة لمورد</h2>
                      <p className="text-[10px] font-bold text-indigo-200">خصم من الخزينة ← المورد</p>
                   </div>
                </div>
                <button onClick={() => setIsPaying(null)} className="p-2 hover:bg-white/10 rounded-full transition-all"><X /></button>
             </div>
             
             <div className="p-10 space-y-8">
                <div className="bg-orange-50 p-6 rounded-[30px] border border-orange-100 text-center relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-20 h-20 bg-orange-100 rounded-full -translate-y-10 translate-x-10 opacity-50"></div>
                   <p className="text-[10px] font-black text-orange-400 uppercase mb-2 tracking-widest">المورد المستفيد</p>
                   <p className="font-black text-slate-800 text-2xl mb-2">{isPaying.name}</p>
                   <div className="inline-flex items-center gap-2 px-4 py-1 bg-white rounded-full shadow-sm border border-orange-100">
                      <span className="text-[10px] text-slate-400 font-bold">المديونية الحالية:</span>
                      <span className="text-sm font-black text-orange-600">{isPaying.balance.toLocaleString()} ج.م</span>
                   </div>
                </div>

                <div className="space-y-4">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase pr-4">المبلغ المدفوع (ج.م)</label>
                      <input 
                        type="number" 
                        value={paymentForm.amount || ''}
                        onChange={(e) => setPaymentForm({...paymentForm, amount: parseFloat(e.target.value) || 0})}
                        className="w-full bg-slate-50 border-2 border-transparent rounded-[25px] px-8 py-5 focus:border-indigo-500 outline-none font-black text-3xl text-center text-indigo-600 transition-all shadow-inner"
                        placeholder="0.00"
                        autoFocus
                      />
                   </div>
                   
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase pr-4">ملاحظات السند</label>
                      <input 
                        type="text" 
                        value={paymentForm.note}
                        onChange={(e) => setPaymentForm({...paymentForm, note: e.target.value})}
                        className="w-full bg-white border-2 border-slate-100 rounded-[20px] px-6 py-4 font-bold text-sm outline-none focus:border-indigo-500"
                        placeholder="مثال: دفعة تحت حساب الفاتورة رقم..."
                      />
                   </div>
                </div>

                {!activeShift && (
                  <div className="flex items-center gap-3 p-4 bg-red-50 text-red-600 rounded-2xl text-[10px] font-black border border-red-100">
                     <AlertTriangle size={16}/> تنبيه: الوردية مغلقة. السداد سيتم دفترياً ولن يخصم فعلياً من الدرج.
                  </div>
                )}

                <button 
                  onClick={handleProcessPayment}
                  disabled={paymentForm.amount <= 0}
                  className="w-full py-5 bg-green-600 text-white rounded-[30px] font-black text-lg shadow-xl hover:bg-green-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                   <CheckCircle size={22}/> تأكيد السداد
                </button>
             </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-[250] bg-slate-900/60 backdrop-blur-2xl flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-xl rounded-[50px] p-12 shadow-2xl animate-in zoom-in duration-300 my-8 border-4 border-white">
            <div className="flex justify-between items-center mb-10">
               <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center"><User size={24}/></div>
                  <h2 className="text-2xl font-black text-slate-800">{editingSupplier ? 'تحديث بيانات المورد' : 'إضافة مورد جديد'}</h2>
               </div>
               <button onClick={() => setIsAdding(false)} className="p-3 bg-slate-50 rounded-full hover:bg-red-50 hover:text-red-500 transition-all"><X/></button>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase pr-4">اسم المورد (الشخص المسؤول)</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 border-2 border-transparent rounded-[25px] px-8 py-5 focus:border-indigo-500 outline-none font-black text-sm transition-all shadow-inner" placeholder="الاسم ثلاثي..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase pr-4">الشركة / العلامة التجارية</label>
                    <input type="text" value={formData.company} onChange={(e) => setFormData({...formData, company: e.target.value})} className="w-full bg-slate-50 border-none rounded-[25px] px-6 py-4 font-black text-sm shadow-inner outline-none focus:ring-2 focus:ring-indigo-500/20" placeholder="اسم الشركة..." />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase pr-4">رقم الهاتف</label>
                    <input type="text" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full bg-slate-50 border-none rounded-[25px] px-6 py-4 font-black text-sm shadow-inner outline-none focus:ring-2 focus:ring-indigo-500/20" placeholder="01xxxxxxxxx" />
                 </div>
              </div>

              {!editingSupplier && (
                <div className="p-8 bg-blue-50 rounded-[40px] border-2 border-blue-100 space-y-6 relative overflow-hidden">
                   <div className="absolute -top-10 -left-10 w-32 h-32 bg-blue-200/50 rounded-full blur-2xl"></div>
                   <h4 className="font-black text-blue-700 flex items-center gap-3 text-sm relative z-10"><History size={18}/> الرصيد الافتتاحي (قبل استخدام البرنامج)</h4>
                   <div className="grid grid-cols-2 gap-6 relative z-10">
                      <div className="space-y-2">
                         <label className="text-[9px] font-black text-green-600 uppercase pr-4 flex items-center gap-1"><ArrowDownCircle size={10}/> مدين (لنا أموال)</label>
                         <input type="number" value={formData.initialDebit || ''} onChange={(e) => setFormData({...formData, initialDebit: parseFloat(e.target.value) || 0})} className="w-full bg-white border-none rounded-[20px] px-6 py-4 font-black text-center text-green-600 shadow-sm outline-none focus:ring-2 focus:ring-green-200" placeholder="0" />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[9px] font-black text-orange-600 uppercase pr-4 flex items-center gap-1"><ArrowUpCircle size={10}/> دائن (علينا مستحقات)</label>
                         <input type="number" value={formData.initialCredit || ''} onChange={(e) => setFormData({...formData, initialCredit: parseFloat(e.target.value) || 0})} className="w-full bg-white border-none rounded-[20px] px-6 py-4 font-black text-center text-orange-600 shadow-sm outline-none focus:ring-2 focus:ring-orange-200" placeholder="0" />
                      </div>
                   </div>
                </div>
              )}

              <button onClick={handleSave} className="w-full py-6 bg-slate-900 text-white font-black rounded-[30px] shadow-2xl hover:bg-black transition-all flex items-center justify-center gap-3 active:scale-95">
                <CheckCircle size={24} /> حفظ واعتماد البيانات
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Statement Modal */}
      {statementSupplier && (
        <StatementPreview 
          partyName={statementSupplier.name}
          partyType="supplier"
          balance={statementSupplier.balance}
          transactions={statementSupplier.transactions}
          settings={settings}
          onClose={() => setStatementSupplier(null)}
        />
      )}
    </div>
  );
};

export default Suppliers;
