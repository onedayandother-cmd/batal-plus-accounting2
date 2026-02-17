
import React, { useMemo } from 'react';
import { BarChart3, Download, Printer } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { Sale } from '../types';

interface MonthlyReportProps {
  sales: Sale[];
}

const MonthlyReport: React.FC<MonthlyReportProps> = ({ sales }) => {
  const monthlyData = useMemo(() => {
    const data: { [key: string]: { name: string, sales: number, profit: number, count: number } } = {};

    sales.forEach(sale => {
      if (sale.isReturned) return;
      const date = new Date(sale.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' });

      if (!data[key]) {
        data[key] = { name: monthName, sales: 0, profit: 0, count: 0 };
      }
      data[key].sales += sale.totalAmount;
      data[key].profit += (sale.profit || 0);
      data[key].count += 1;
    });

    return Object.keys(data).sort().map(key => data[key]);
  }, [sales]);

  return (
    <div className="space-y-10 animate-in fade-in duration-500 font-['Cairo'] text-right pb-20">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white p-10 rounded-[50px] shadow-sm border">
        <div>
          <h2 className="text-3xl font-black text-slate-800 flex items-center gap-4">
            <BarChart3 size={36} className="text-indigo-600"/> التقرير الشهري المفصل
          </h2>
          <p className="text-slate-500 font-bold mt-1">تحليل أداء المبيعات والأرباح على مدار الشهور</p>
        </div>
        <div className="flex gap-3">
           <button className="p-4 bg-slate-100 rounded-2xl hover:bg-slate-200 transition-colors"><Printer size={20}/></button>
           <button className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black shadow-xl hover:bg-black transition-all flex items-center gap-3"><Download size={20}/> تصدير التقرير</button>
        </div>
      </div>

      <div className="space-y-10">
        <div className="bg-white p-10 rounded-[50px] border shadow-sm space-y-8">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3">
              <BarChart3 className="text-indigo-600" /> تحليل المبيعات والأرباح الشهرية
            </h3>
          </div>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{top: 20, right: 30, left: 20, bottom: 5}}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 700, fill: '#94a3b8'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 700, fill: '#94a3b8'}} tickFormatter={(value) => `${value / 1000}k`} />
                <Tooltip 
                  contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)', padding: '15px'}}
                  cursor={{fill: '#f8fafc'}} 
                />
                <Legend wrapperStyle={{paddingTop: '20px'}} iconType="circle" />
                <Bar dataKey="sales" name="المبيعات" fill="#3b82f6" radius={[10, 10, 0, 0]} barSize={40} />
                <Bar dataKey="profit" name="صافي الربح" fill="#10b981" radius={[10, 10, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-[45px] border shadow-sm overflow-hidden">
          <table className="w-full text-right">
            <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b">
              <tr>
                <th className="px-8 py-5">الشهر</th>
                <th className="px-8 py-5 text-center">عدد الفواتير</th>
                <th className="px-8 py-5 text-center">إجمالي المبيعات</th>
                <th className="px-8 py-5 text-center">صافي الربح</th>
                <th className="px-8 py-5 text-center">نسبة الربح</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {monthlyData.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-8 py-6 font-black text-slate-800">{row.name}</td>
                  <td className="px-8 py-6 text-center text-slate-500 font-bold">{row.count} فاتورة</td>
                  <td className="px-8 py-6 text-center font-black text-blue-600">{row.sales.toLocaleString()} ج.م</td>
                  <td className="px-8 py-6 text-center font-black text-emerald-600">{row.profit.toLocaleString()} ج.م</td>
                  <td className="px-8 py-6 text-center">
                    <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black">
                      {row.sales > 0 ? `${Math.round((row.profit / row.sales) * 100)}%` : '0%'}
                    </span>
                  </td>
                </tr>
              ))}
              {monthlyData.length === 0 && (
                <tr><td colSpan={5} className="py-20 text-center text-slate-300 font-black italic">لا توجد بيانات مبيعات لعرضها</td></tr>
              )}
            </tbody>
             <tfoot>
                <tr className="bg-slate-100 font-black border-t-2">
                    <td className="px-8 py-5">الإجمالي</td>
                    <td className="px-8 py-5 text-center">{monthlyData.reduce((a,b)=>a+b.count, 0)}</td>
                    <td className="px-8 py-5 text-center">{monthlyData.reduce((a,b)=>a+b.sales, 0).toLocaleString()} ج.م</td>
                    <td className="px-8 py-5 text-center">{monthlyData.reduce((a,b)=>a+b.profit, 0).toLocaleString()} ج.م</td>
                    <td className="px-8 py-5 text-center">--</td>
                </tr>
             </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MonthlyReport;
