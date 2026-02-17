
import React, { useState } from 'react';
import { 
  CalendarClock, Search, CheckCircle, 
  AlertTriangle, Clock, Wallet, User, 
  ArrowLeftRight, Filter, ChevronRight, X
} from 'lucide-react';
import { Sale, Customer } from '../types';

interface InstallmentsProps {
  sales: Sale[];
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
}

const Installments: React.FC<InstallmentsProps> = ({ sales, customers, setCustomers }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'pending' | 'overdue' | 'all'>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const debts = customers.filter(c => c.balance > 0).sort((a, b) => b.balance - a.balance);

  const filteredDebts = debts.filter(d => 
    d.name.includes(searchTerm) || d.phone.includes(searchTerm)
  );

  const handlePayBalance = (customerId: string, amount: number) => {
    if (amount <= 0) return;
    
    setCustomers(customers.map(c => {
      if (c.id === customerId) {
        const newBalance = c.balance - amount;
        return {
          ...c,
          balance: newBalance,
          transactions: [{
            id: Date.now().toString(),
            date: new Date().toISOString().split('T')[0],
            note: `سداد جزء من المديونية - نقدي`,
            type: 'إيداع' as const,
            amount: amount,
            balanceAfter: newBalance
          }, ...c.transactions]
        };
      }
      return c;
    }));
    alert('تم تسجيل عملية التحصيل بنجاح وتعديل رصيد العميل');
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 font-['Cairo'] text-right pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800">إدارة الأقساط والتحصيل</h2>
          <p className="text-slate-500 font-bold">متابعة مديونيات العملاء الآجلة وجدولة السداد</p>
        </div>
        <div className="bg-white p-2 rounded-2xl shadow-sm border flex gap-2">
           <div className="relative">
              <input 
                type="text" 
                placeholder="بحث عن عميل مدين..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="bg-slate-50 border-none rounded-xl px-10 py-2.5 text-xs font-bold outline-none w-64"
              />
              <Search className="absolute right-3 top-2.5 text-slate-400" size={16} />
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="إجمالي المديونيات" value={debts.reduce((a, b) => a + b.balance, 0)} color="red" icon={<Wallet size={20}/>} />
        <StatCard label="عدد العملاء المدينين" value={debts.length} color="indigo" icon={<User size={20}/>} />
        <StatCard label="تحصيل متوقع اليوم" value={0} color="green" icon={<CheckCircle size={20}/>} />
      </div>

      <div className="bg-white rounded-[45px] shadow-sm border overflow-hidden">
        <table className="w-full text-right">
           <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b">
              <tr>
                 <th className="px-8 py-6">العميل</th>
                 <th className="px-8 py-6">رقم الهاتف</th>
                 <th className="px-8 py-6 text-center">إجمالي المديونية</th>
                 <th className="px-8 py-6 text-center">آخر حركة</th>
                 <th className="px-8 py-6 text-left">إجراءات التحصيل</th>
              </tr>
           </thead>
           <tbody className="divide-y divide-slate-50">
              {filteredDebts.map(c => (
                <tr key={c.id} className="hover:bg-slate-50/50 transition-colors group">
                   <td className="px-8 py-6">
                      <p className="font-black text-slate-800">{c.name}</p>
                      <span className="text-[9px] text-blue-500 font-black uppercase">رقم الحساب: #{c.id.slice(-4)}</span>
                   </td>
                   <td className="px-8 py-6 text-xs font-bold text-slate-500">{c.phone || '---'}</td>
                   <td className="px-8 py-6 text-center">
                      <span className="font-black text-red-600 text-lg">{c.balance.toLocaleString()} ج.م</span>
                   </td>
                   <td className="px-8 py-6 text-center text-xs text-slate-400 font-bold">
                      {c.transactions[0]?.date || '---'}
                   </td>
                   <td className="px-8 py-6 text-left">
                      <div className="flex justify-end gap-2">
                         <button 
                          onClick={() => {
                            const amount = prompt(`أدخل المبلغ المحصل من ${c.name}:`, c.balance.toString());
                            if (amount) handlePayBalance(c.id, parseFloat(amount));
                          }}
                          className="px-6 py-2 bg-green-600 text-white rounded-xl font-black text-[10px] shadow-lg shadow-green-200 hover:bg-green-700 transition-all"
                         >
                            تحصيل مبلغ
                         </button>
                         <button className="p-2 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-900 hover:text-white transition-all"><CalendarClock size={16}/></button>
                      </div>
                   </td>
                </tr>
              ))}
              {filteredDebts.length === 0 && (
                <tr><td colSpan={5} className="py-20 text-center text-slate-300 font-bold italic">لا يوجد عملاء مدينون حالياً</td></tr>
              )}
           </tbody>
        </table>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, color, icon }: any) => {
  const colors: any = { red: 'bg-red-50 text-red-600', indigo: 'bg-indigo-50 text-indigo-600', green: 'bg-green-50 text-green-600' };
  return (
    <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex items-center gap-6">
       <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${colors[color]}`}>{icon}</div>
       <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
          <h4 className="text-xl font-black text-slate-800">{value.toLocaleString()} {typeof value === 'number' && value > 100 ? 'ج.م' : ''}</h4>
       </div>
    </div>
  );
};

export default Installments;
