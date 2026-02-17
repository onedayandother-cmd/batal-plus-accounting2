
import React, { useState } from 'react';
import { 
  Trophy, Users, DollarSign, Calendar, 
  ArrowUpRight, CheckCircle, Search, Truck,
  Wallet, Filter, ChevronRight, X, Clock
} from 'lucide-react';
import { Sale, User, CommissionPayment } from '../types';

interface CommissionsProps {
  sales: Sale[];
  users: User[];
  commissionPayments: CommissionPayment[];
  setCommissionPayments: React.Dispatch<React.SetStateAction<CommissionPayment[]>>;
}

const Commissions: React.FC<CommissionsProps> = ({ sales, users, commissionPayments, setCommissionPayments }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isPaying, setIsPaying] = useState<User | null>(null);
  const [paymentAmount, setPaymentAmount] = useState(0);

  const drivers = users.filter(u => u.role === 'DRIVER');

  const getDriverStats = (driverId: string) => {
    const driverSales = sales.filter(s => s.deliveryDriverId === driverId && !s.isReturned);
    const totalSalesAmount = driverSales.reduce((a, b) => a + b.totalAmount, 0);
    const totalCommission = driverSales.reduce((a, b) => a + (b.commissionAmount || 0), 0);
    const totalPaid = commissionPayments.filter(p => p.driverId === driverId).reduce((a, b) => a + b.amount, 0);
    const remaining = totalCommission - totalPaid;

    return { totalSalesAmount, totalCommission, totalPaid, remaining, salesCount: driverSales.length };
  };

  const handlePayCommission = () => {
    if (!isPaying || paymentAmount <= 0) return;
    const newPayment: CommissionPayment = {
      id: Date.now().toString(),
      driverId: isPaying.id,
      amount: paymentAmount,
      date: new Date().toISOString().split('T')[0],
      note: `صرف عمولة المندوب: ${isPaying.name}`
    };
    setCommissionPayments([...commissionPayments, newPayment]);
    setIsPaying(null);
    setPaymentAmount(0);
    alert('تم تسجيل صرف العمولة بنجاح');
  };

  return (
    <div className="space-y-10 font-['Cairo'] text-right animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 bg-white p-10 rounded-[50px] shadow-sm border">
        <div>
          <h2 className="text-3xl font-black text-slate-800 flex items-center gap-4">
            <Trophy className="text-yellow-500" size={36} /> نظام عمولات التوزيع
          </h2>
          <p className="text-slate-500 font-bold">تتبع مستحقات المناديب بناءً على نسب المبيعات المحققة</p>
        </div>
        <div className="flex bg-slate-100 p-2 rounded-[25px] gap-2">
           <div className="relative">
              <input 
                type="text" 
                placeholder="بحث عن مندوب..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="bg-white border-none rounded-xl px-10 py-3 text-xs font-bold outline-none w-64 shadow-sm"
              />
              <Search className="absolute right-3 top-3 text-slate-400" size={16} />
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <StatCard label="إجمالي العمولات المستحقة" value={drivers.reduce((a,d) => a + getDriverStats(d.id).remaining, 0)} color="red" icon={<Wallet />} />
         <StatCard label="عمولات تم صرفها" value={commissionPayments.reduce((a,p) => a + p.amount, 0)} color="green" icon={<CheckCircle />} />
         <StatCard label="عدد المناديب النشطين" value={drivers.length} color="indigo" icon={<Users />} />
         <StatCard label="مبيعات التوزيع اليوم" value={sales.filter(s => s.date === new Date().toISOString().split('T')[0]).reduce((a,b) => a+b.totalAmount, 0)} color="blue" icon={<ArrowUpRight />} />
      </div>

      <div className="bg-white rounded-[50px] shadow-sm border overflow-hidden">
        <table className="w-full text-right">
          <thead>
            <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b">
              <th className="px-8 py-6">المندوب</th>
              <th className="px-8 py-6 text-center">إجمالي المبيعات</th>
              <th className="px-8 py-6 text-center">العمولة الكلية</th>
              <th className="px-8 py-6 text-center">المدفوع</th>
              <th className="px-8 py-6 text-center">المتبقي</th>
              <th className="px-8 py-6 text-left">إجراء</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {drivers.filter(d => d.name.includes(searchTerm)).map(driver => {
              const stats = getDriverStats(driver.id);
              return (
                <tr key={driver.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-8 py-6">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-black">
                           {driver.name[0]}
                        </div>
                        <div>
                           <p className="font-black text-slate-800">{driver.name}</p>
                           <p className="text-[10px] text-slate-400 font-bold">نسبة العمولة: {driver.defaultCommissionRate || 0}%</p>
                        </div>
                     </div>
                  </td>
                  <td className="px-8 py-6 text-center font-bold text-slate-600">{stats.totalSalesAmount.toLocaleString()} ج.م</td>
                  <td className="px-8 py-6 text-center font-bold text-slate-600">{stats.totalCommission.toLocaleString()} ج.م</td>
                  <td className="px-8 py-6 text-center font-bold text-green-600">{stats.totalPaid.toLocaleString()} ج.م</td>
                  <td className="px-8 py-6 text-center">
                     <span className="font-black text-red-600 text-lg">{stats.remaining.toLocaleString()} ج.م</span>
                  </td>
                  <td className="px-8 py-6 text-left">
                     <button 
                      onClick={() => {setIsPaying(driver); setPaymentAmount(stats.remaining);}}
                      className="px-6 py-2 bg-slate-900 text-white rounded-xl font-black text-[10px] hover:bg-black shadow-lg shadow-slate-200 transition-all"
                     >
                        صرف عمولة
                     </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {isPaying && (
        <div className="fixed inset-0 z-[300] bg-slate-900/60 backdrop-blur-2xl flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-lg rounded-[50px] overflow-hidden shadow-2xl animate-in zoom-in duration-300">
              <div className="p-10 bg-slate-900 text-white flex justify-between items-center">
                 <h2 className="text-2xl font-black">صرف مستحقات مندوب</h2>
                 <button onClick={() => setIsPaying(null)}><X /></button>
              </div>
              <div className="p-10 space-y-8">
                 <div className="text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-2">المندوب المختار</p>
                    <h3 className="text-2xl font-black text-slate-800">{isPaying.name}</h3>
                 </div>
                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase pr-4">المبلغ المراد صرفه</label>
                    <input 
                      type="number" 
                      value={paymentAmount} 
                      onChange={e => setPaymentAmount(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-50 border-2 border-transparent rounded-[25px] px-8 py-5 text-center text-4xl font-black text-indigo-600 focus:border-indigo-500 outline-none transition-all shadow-inner"
                    />
                 </div>
                 <button 
                  onClick={handlePayCommission}
                  className="w-full py-6 bg-indigo-600 text-white rounded-[30px] font-black text-xl shadow-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-3"
                 >
                    <CheckCircle size={24} /> تأكيد عملية الصرف
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ label, value, color, icon }: any) => {
  const colors: any = { 
    red: 'bg-red-50 text-red-600', 
    indigo: 'bg-indigo-50 text-indigo-600', 
    green: 'bg-green-50 text-green-600', 
    blue: 'bg-blue-50 text-blue-600' 
  };
  return (
    <div className="bg-white p-8 rounded-[45px] shadow-sm border flex items-center gap-6 group hover:shadow-xl transition-all">
       <div className={`w-16 h-16 rounded-3xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform ${colors[color]}`}>
          {icon}
       </div>
       <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
          <h4 className="text-2xl font-black text-slate-800">{value.toLocaleString()}</h4>
       </div>
    </div>
  );
};

export default Commissions;
