
import React, { useState } from 'react';
import { Plus, Trash2, Calendar, DollarSign, Tag, FileText, ArrowDownCircle } from 'lucide-react';
import { Expense, Shift } from '../types';

interface ExpensesProps {
  expenses: Expense[];
  setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
  activeShift?: Shift;
  branch: string;
}

const Expenses: React.FC<ExpensesProps> = ({ expenses, setExpenses, activeShift, branch }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('نثريات');

  const addExpense = () => {
    if (!description || !amount) return;
    const newExpense: Expense = {
      id: Date.now().toString(),
      description,
      amount: parseFloat(amount),
      date: new Date().toISOString().split('T')[0],
      category,
      shiftId: activeShift?.id,
      branch
    };
    setExpenses([newExpense, ...expenses]);
    setDescription('');
    setAmount('');
  };

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 text-right">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-800">المصروفات اليومية</h2>
          <p className="text-slate-500">إدارة وتسجيل النفقات التشغيلية للمؤسسة</p>
        </div>
        <div className="bg-red-50 px-6 py-4 rounded-3xl border border-red-100 flex flex-col items-end">
          <span className="text-xs font-bold text-red-400">إجمالي المصروفات</span>
          <span className="text-2xl font-black text-red-600">{totalExpenses.toLocaleString('ar-EG')} ج.م</span>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
          <Plus className="text-blue-600" />
          تسجيل مصروف جديد
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 pr-2">البيان / الوصف</label>
            <input 
              type="text" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="مثال: فاتورة كهرباء"
              className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 pr-2">القيمة (ج.م)</label>
            <input 
              type="number" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none font-bold"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 pr-2">التصنيف</label>
            <select 
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 outline-none"
            >
              <option value="نثريات">نثريات</option>
              <option value="رواتب">رواتب</option>
              <option value="إيجار">إيجار</option>
              <option value="فواتير">فواتير</option>
              <option value="بضاعة">مشتريات بضاعة</option>
            </select>
          </div>
          <button 
            onClick={addExpense}
            className="h-[52px] bg-slate-900 text-white rounded-2xl font-bold hover:bg-black transition-all shadow-xl shadow-slate-200"
          >
            إضافة المصروف
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-right">
          <thead className="bg-slate-50 border-b">
            <tr className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
              <th className="px-8 py-5">تاريخ المصروف</th>
              <th className="px-8 py-5">البيان</th>
              <th className="px-8 py-5 text-center">التصنيف</th>
              <th className="px-8 py-5 text-center">المبلغ</th>
              <th className="px-8 py-5">العمليات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {expenses.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-8 py-20 text-center text-slate-300 italic font-bold">لم يتم تسجيل أي مصروفات بعد</td>
              </tr>
            ) : (
              expenses.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-5 font-bold text-slate-400 text-xs">{e.date}</td>
                  <td className="px-8 py-5 font-black text-slate-700">{e.description}</td>
                  <td className="px-8 py-5 text-center">
                    <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-black">
                      {e.category}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-center font-black text-red-600">{e.amount.toLocaleString()} ج.م</td>
                  <td className="px-8 py-5">
                    <button 
                      onClick={() => setExpenses(expenses.filter(x => x.id !== e.id))}
                      className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Expenses;
