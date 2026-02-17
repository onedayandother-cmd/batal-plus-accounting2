
import React, { useState } from 'react';
import { BookText, Plus, Trash2, CheckCircle, X, ArrowRightLeft, Search, Save, History } from 'lucide-react';
import { JournalEntry, JournalLine, Customer, Supplier, BankAccount } from '../types';

interface JournalEntriesProps {
  entries: JournalEntry[];
  setEntries: React.Dispatch<React.SetStateAction<JournalEntry[]>>;
  customers: Customer[];
  suppliers: Supplier[];
  bankAccounts: BankAccount[];
}

const JournalEntries: React.FC<JournalEntriesProps> = ({ entries, setEntries, customers, suppliers, bankAccounts }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Partial<JournalEntry>>({
    date: new Date().toISOString().split('T')[0],
    description: '',
    lines: [
      { accountId: '', accountName: '', debit: 0, credit: 0 },
      { accountId: '', accountName: '', debit: 0, credit: 0 }
    ]
  });

  // توليد قائمة الحسابات المتاحة للقيد
  const allAccounts = [
    ...customers.map(c => ({ id: `cust-${c.id}`, name: `عميل: ${c.name}` })),
    ...suppliers.map(s => ({ id: `supp-${s.id}`, name: `مورد: ${s.name}` })),
    ...bankAccounts.map(b => ({ id: `bank-${b.id}`, name: `بنك: ${b.bankName}` })),
    { id: 'cash', name: 'الخزينة النقدية' },
    { id: 'sales', name: 'حساب المبيعات' },
    { id: 'purchases', name: 'حساب المشتريات' },
    { id: 'expenses', name: 'حساب المصروفات العامة' }
  ];

  const addLine = () => {
    setFormData({ ...formData, lines: [...(formData.lines || []), { accountId: '', accountName: '', debit: 0, credit: 0 }] });
  };

  const removeLine = (index: number) => {
    setFormData({ ...formData, lines: formData.lines?.filter((_, i) => i !== index) });
  };

  const updateLine = (index: number, key: keyof JournalLine, value: any) => {
    const newLines = [...(formData.lines || [])];
    if (key === 'accountId') {
      const acc = allAccounts.find(a => a.id === value);
      newLines[index] = { ...newLines[index], accountId: value, accountName: acc?.name || '' };
    } else {
      newLines[index] = { ...newLines[index], [key]: value };
    }
    setFormData({ ...formData, lines: newLines });
  };

  const totalDebit = formData.lines?.reduce((a, b) => a + (b.debit || 0), 0) || 0;
  const totalCredit = formData.lines?.reduce((a, b) => a + (b.credit || 0), 0) || 0;
  const isBalanced = totalDebit === totalCredit && totalDebit > 0;

  const handleSave = () => {
    if (!isBalanced || !formData.description) return;
    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      date: formData.date!,
      description: formData.description!,
      lines: formData.lines as JournalLine[]
    };
    setEntries([newEntry, ...entries]);
    setIsAdding(false);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 font-['Cairo'] text-right pb-20">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white p-10 rounded-[50px] shadow-sm border">
        <div>
          <h2 className="text-3xl font-black text-slate-800 flex items-center gap-4"><BookText size={36} className="text-blue-600"/> القيود اليومية</h2>
          <p className="text-slate-500 font-bold mt-1">تسجيل التسويات المالية اليدوية والقيود المزدوجة</p>
        </div>
        <button onClick={() => setIsAdding(true)} className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black shadow-xl hover:bg-blue-700 flex items-center gap-3">
          <Plus size={20} /> إضافة قيد جديد
        </button>
      </div>

      <div className="bg-white rounded-[45px] shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-right">
          <thead className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest">
            <tr>
              <th className="px-8 py-6">التاريخ</th>
              <th className="px-8 py-6">البيان / الوصف</th>
              <th className="px-8 py-6 text-center">إجمالي القيد</th>
              <th className="px-8 py-6 text-left">تحكم</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {entries.map(e => (
              <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-8 py-6 font-bold text-slate-400">{e.date}</td>
                <td className="px-8 py-6 font-black text-slate-800">{e.description}</td>
                <td className="px-8 py-6 text-center font-black text-blue-600">
                  {e.lines.reduce((a, b) => a + b.debit, 0).toLocaleString()} ج.م
                </td>
                <td className="px-8 py-6 text-left">
                   <button onClick={() => setEntries(entries.filter(it => it.id !== e.id))} className="p-3 text-slate-300 hover:text-red-500"><Trash2 size={18}/></button>
                </td>
              </tr>
            ))}
            {entries.length === 0 && (
              <tr><td colSpan={4} className="py-20 text-center opacity-20 font-black">لا يوجد قيود مسجلة بعد</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-[300] bg-slate-900/60 backdrop-blur-2xl flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-4xl rounded-[50px] overflow-hidden shadow-2xl animate-in zoom-in border-4 border-white flex flex-col max-h-[90vh]">
              <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
                 <h2 className="text-2xl font-black flex items-center gap-3"><ArrowRightLeft /> تحرير قيد يومية</h2>
                 <button onClick={() => setIsAdding(false)}><X /></button>
              </div>
              <div className="p-10 overflow-y-auto space-y-8 flex-1">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-xs font-black text-slate-400 pr-4">تاريخ القيد</label>
                       <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full bg-slate-50 p-4 rounded-2xl font-black outline-none" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-xs font-black text-slate-400 pr-4">وصف العملية</label>
                       <input type="text" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-slate-50 p-4 rounded-2xl font-black outline-none" placeholder="مثلاً: سحب مسحوبات شخصية" />
                    </div>
                 </div>

                 <div className="space-y-4">
                    <table className="w-full text-right border-collapse">
                       <thead className="text-[10px] font-black text-slate-400 uppercase border-b">
                          <tr>
                             <th className="py-4">الحساب</th>
                             <th className="py-4 text-center">مدين (+)</th>
                             <th className="py-4 text-center">دائن (-)</th>
                             <th className="py-4"></th>
                          </tr>
                       </thead>
                       <tbody className="divide-y">
                          {formData.lines?.map((line, idx) => (
                            <tr key={idx}>
                               <td className="py-4">
                                  <select value={line.accountId} onChange={e => updateLine(idx, 'accountId', e.target.value)} className="w-full bg-slate-100 p-3 rounded-xl font-bold border-none outline-none">
                                     <option value="">-- اختر الحساب --</option>
                                     {allAccounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                                  </select>
                               </td>
                               <td className="py-4 px-2">
                                  <input type="number" value={line.debit || ''} onChange={e => updateLine(idx, 'debit', parseFloat(e.target.value) || 0)} className="w-full bg-slate-50 p-3 rounded-xl font-black text-center text-blue-600" placeholder="0" />
                               </td>
                               <td className="py-4 px-2">
                                  <input type="number" value={line.credit || ''} onChange={e => updateLine(idx, 'credit', parseFloat(e.target.value) || 0)} className="w-full bg-slate-50 p-3 rounded-xl font-black text-center text-red-600" placeholder="0" />
                               </td>
                               <td className="py-4 text-left">
                                  <button onClick={() => removeLine(idx)} className="text-red-300 hover:text-red-500"><Trash2 size={16}/></button>
                               </td>
                            </tr>
                          ))}
                       </tbody>
                    </table>
                    <button onClick={addLine} className="text-blue-600 font-black text-xs flex items-center gap-2 hover:underline"><Plus size={14}/> إضافة طرف آخر للقيد</button>
                 </div>
              </div>

              <div className="p-8 bg-slate-50 border-t flex justify-between items-center">
                 <div className="flex gap-10">
                    <div className="text-center"><p className="text-[10px] font-black text-slate-400">إجمالي المدين</p><p className="font-black text-blue-600">{totalDebit.toLocaleString()}</p></div>
                    <div className="text-center"><p className="text-[10px] font-black text-slate-400">إجمالي الدائن</p><p className="font-black text-red-600">{totalCredit.toLocaleString()}</p></div>
                 </div>
                 <button 
                  onClick={handleSave}
                  disabled={!isBalanced}
                  className={`px-12 py-4 rounded-2xl font-black text-lg shadow-xl transition-all ${isBalanced ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                 >
                    <Save className="inline ml-2"/> اعتماد القيد
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default JournalEntries;
