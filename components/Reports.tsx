
import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, Wallet, PieChart, BarChart3, Clock4, 
  CalendarDays, CalendarRange, Filter, Package, ShoppingBag,
  ArrowUpRight, ArrowDownRight, Calculator, FileText, Download,
  Target, AlertTriangle, Layers, Users, Store, Info, Search,
  Receipt, Landmark, LandmarkIcon, Zap, DollarSign, Activity,
  CreditCard, ArrowRightLeft
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart as RePieChart, Pie, Legend
} from 'recharts';
import { Sale, Product, Expense, UnitType, PricingTier, Customer, Supplier, Voucher } from '../types';

interface ReportsProps {
  sales: Sale[];
  products: Product[];
  expenses: Expense[];
  customers: Customer[];
  suppliers: Supplier[];
  vouchers: Voucher[];
}

type ReportTab = 'overview' | 'sales' | 'inventory' | 'accounts' | 'expenses' | 'pl';

const Reports: React.FC<ReportsProps> = ({ sales, products, expenses, customers, suppliers, vouchers }) => {
  const [activeTab, setActiveTab] = useState<ReportTab>('pl');
  
  const stats = useMemo(() => {
    const validSales = sales.filter(s => !s.isReturned);
    const totalSales = validSales.reduce((a, b) => a + b.totalAmount, 0);
    
    // حساب تكلفة البضاعة المباعة (COGS) بدقة بناءً على أسعار التكلفة وقت البيع
    const totalCOGS = validSales.reduce((acc, s) => {
      return acc + s.items.reduce((sum, item) => sum + (item.costPriceAtSale * item.quantity), 0);
    }, 0);

    // حساب المصروفات من شاشة المصاريف ومن سندات الصرف العامة
    const expenseTotal = expenses.reduce((a, b) => a + b.amount, 0);
    const voucherExpenseTotal = vouchers.filter(v => v.type === 'صرف' && v.category !== 'بضاعة').reduce((a,b) => a + b.amount, 0);
    const totalExpenses = expenseTotal + voucherExpenseTotal;

    const grossProfit = totalSales - totalCOGS;
    const netProfit = grossProfit - totalExpenses;
    
    return { 
      totalSales, 
      totalCOGS, 
      totalExpenses, 
      grossProfit, 
      netProfit,
      taxAmount: totalSales * 0.14,
      totalPaymentsReceived: vouchers.filter(v => v.type === 'قبض').reduce((a,b) => a+b.amount, 0)
    };
  }, [sales, expenses, vouchers]);

  // تجهيز بيانات المصروفات
  const expensesData = useMemo(() => {
    const categories: { [key: string]: number } = {};
    
    // من المصروفات المباشرة
    expenses.forEach(e => {
      categories[e.category] = (categories[e.category] || 0) + e.amount;
    });
    
    // من السندات
    vouchers.filter(v => v.type === 'صرف' && v.category !== 'بضاعة').forEach(v => {
      categories[v.category] = (categories[v.category] || 0) + v.amount;
    });

    const data = Object.keys(categories).map(key => ({ name: key, value: categories[key] }));
    const total = data.reduce((a,b) => a + b.value, 0);
    
    return { data, total };
  }, [expenses, vouchers]);

  // تجهيز بيانات الديون
  const accountsData = useMemo(() => {
    const receivables = customers.filter(c => c.balance > 0).sort((a,b) => b.balance - a.balance);
    const payables = suppliers.filter(s => s.balance > 0).sort((a,b) => b.balance - a.balance); // فرضنا أن الرصيد الموجب للمورد يعني أن له فلوس
    
    const totalReceivables = receivables.reduce((a,b) => a + b.balance, 0);
    const totalPayables = payables.reduce((a,b) => a + b.balance, 0);

    return { receivables, payables, totalReceivables, totalPayables };
  }, [customers, suppliers]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  return (
    <div className="space-y-10 text-right animate-in fade-in duration-500 font-['Cairo'] pb-20">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8 bg-white p-10 rounded-[50px] shadow-sm border border-slate-100">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">الذكاء المالي <span className="text-blue-600">ERP Analytics</span></h2>
          <p className="text-slate-500 font-bold">تقارير الربحية المدمجة والتحليل اللحظي للأداء المؤسسي</p>
        </div>
        <div className="flex bg-slate-100 p-2 rounded-[25px] gap-1 overflow-x-auto no-scrollbar w-full xl:w-auto shadow-inner">
          <ReportTabBtn active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={<Activity size={16}/>} label="المركز المالي" />
          <ReportTabBtn active={activeTab === 'pl'} onClick={() => setActiveTab('pl')} icon={<Landmark size={16}/>} label="قائمة الدخل P&L" />
          <ReportTabBtn active={activeTab === 'expenses'} onClick={() => setActiveTab('expenses')} icon={<PieChart size={16}/>} label="المصروفات" />
          <ReportTabBtn active={activeTab === 'accounts'} onClick={() => setActiveTab('accounts')} icon={<Users size={16}/>} label="المديونيات" />
        </div>
      </div>

      {activeTab === 'expenses' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 animate-in slide-in-from-bottom-10">
           <div className="bg-white p-10 rounded-[50px] border shadow-sm flex flex-col justify-center items-center relative overflow-hidden">
              <h3 className="text-xl font-black text-slate-800 mb-8 absolute top-8 right-8">توزيع المصروفات</h3>
              <div className="w-full h-[350px]">
                 <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                       <Pie
                          data={expensesData.data}
                          cx="50%"
                          cy="50%"
                          innerRadius={80}
                          outerRadius={120}
                          paddingAngle={5}
                          dataKey="value"
                       >
                          {expensesData.data.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                       </Pie>
                       <Tooltip />
                    </RePieChart>
                 </ResponsiveContainer>
              </div>
              <div className="text-center absolute bottom-1/2 translate-y-4">
                 <p className="text-[10px] font-bold text-slate-400 uppercase">الإجمالي</p>
                 <p className="text-2xl font-black text-slate-800">{expensesData.total.toLocaleString()}</p>
              </div>
           </div>

           <div className="lg:col-span-2 space-y-6">
              <div className="bg-red-50 p-8 rounded-[40px] border border-red-100 flex justify-between items-center">
                 <div>
                    <p className="text-[10px] font-black text-red-400 uppercase mb-1">إجمالي المصروفات المسجلة</p>
                    <h2 className="text-4xl font-black text-red-600">{expensesData.total.toLocaleString()} <span className="text-sm">ج.م</span></h2>
                 </div>
                 <div className="w-16 h-16 bg-red-200 text-red-600 rounded-3xl flex items-center justify-center">
                    <TrendingUp size={32} />
                 </div>
              </div>

              <div className="bg-white rounded-[40px] border shadow-sm overflow-hidden">
                 <table className="w-full text-right">
                    <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b">
                       <tr>
                          <th className="px-8 py-5">بند المصروف</th>
                          <th className="px-8 py-5 text-center">القيمة</th>
                          <th className="px-8 py-5 text-center">النسبة</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                       {expensesData.data.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50 transition-colors">
                             <td className="px-8 py-5 font-black text-slate-800 flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[idx % COLORS.length]}}></div>
                                {item.name}
                             </td>
                             <td className="px-8 py-5 text-center font-bold text-slate-600">{item.value.toLocaleString()} ج.م</td>
                             <td className="px-8 py-5 text-center">
                                <div className="flex items-center gap-2 justify-center">
                                   <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                                      <div className="h-full rounded-full" style={{width: `${(item.value/expensesData.total)*100}%`, backgroundColor: COLORS[idx % COLORS.length]}}></div>
                                   </div>
                                   <span className="text-[10px] font-bold text-slate-400">{Math.round((item.value/expensesData.total)*100)}%</span>
                                </div>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>
      )}

      {activeTab === 'accounts' && (
        <div className="space-y-10 animate-in slide-in-from-bottom-10">
           {/* Summary Cards */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-blue-600 p-8 rounded-[40px] text-white shadow-xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl rounded-full"></div>
                 <p className="text-[10px] font-black text-blue-200 uppercase mb-2">إجمالي مستحقاتنا (العملاء)</p>
                 <h2 className="text-4xl font-black">{accountsData.totalReceivables.toLocaleString()} <span className="text-sm">ج.م</span></h2>
                 <ArrowUpRight className="absolute bottom-8 left-8 text-blue-300 opacity-50" size={40} />
              </div>
              <div className="bg-orange-500 p-8 rounded-[40px] text-white shadow-xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl rounded-full"></div>
                 <p className="text-[10px] font-black text-orange-100 uppercase mb-2">إجمالي التزاماتنا (الموردين)</p>
                 <h2 className="text-4xl font-black">{accountsData.totalPayables.toLocaleString()} <span className="text-sm">ج.م</span></h2>
                 <ArrowDownRight className="absolute bottom-8 left-8 text-orange-200 opacity-50" size={40} />
              </div>
              <div className="bg-slate-900 p-8 rounded-[40px] text-white shadow-xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl rounded-full"></div>
                 <p className="text-[10px] font-black text-slate-400 uppercase mb-2">صافي السيولة الخارجية</p>
                 <h2 className={`text-4xl font-black ${accountsData.totalReceivables - accountsData.totalPayables >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {(accountsData.totalReceivables - accountsData.totalPayables).toLocaleString()} <span className="text-sm text-slate-500">ج.م</span>
                 </h2>
                 <ArrowRightLeft className="absolute bottom-8 left-8 text-slate-600 opacity-50" size={40} />
              </div>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Top Debtors */}
              <div className="bg-white rounded-[45px] shadow-sm border border-slate-100 overflow-hidden">
                 <div className="p-8 border-b bg-blue-50/50 flex items-center gap-3">
                    <Users className="text-blue-600" size={20}/>
                    <h3 className="font-black text-slate-800">أعلى العملاء مديونية (Top 5)</h3>
                 </div>
                 <table className="w-full text-right">
                    <tbody className="divide-y divide-slate-50">
                       {accountsData.receivables.slice(0, 5).map((c, idx) => (
                          <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                             <td className="px-8 py-5 text-sm font-bold text-slate-500 w-10">#{idx+1}</td>
                             <td className="px-8 py-5 font-black text-slate-800">{c.name}</td>
                             <td className="px-8 py-5 text-left font-black text-blue-600">{c.balance.toLocaleString()} ج.م</td>
                          </tr>
                       ))}
                       {accountsData.receivables.length === 0 && <tr><td colSpan={3} className="py-10 text-center opacity-30">لا توجد مديونيات عملاء</td></tr>}
                    </tbody>
                 </table>
              </div>

              {/* Top Creditors */}
              <div className="bg-white rounded-[45px] shadow-sm border border-slate-100 overflow-hidden">
                 <div className="p-8 border-b bg-orange-50/50 flex items-center gap-3">
                    <Store className="text-orange-600" size={20}/>
                    <h3 className="font-black text-slate-800">أعلى الموردين دائنية (Top 5)</h3>
                 </div>
                 <table className="w-full text-right">
                    <tbody className="divide-y divide-slate-50">
                       {accountsData.payables.slice(0, 5).map((s, idx) => (
                          <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                             <td className="px-8 py-5 text-sm font-bold text-slate-500 w-10">#{idx+1}</td>
                             <td className="px-8 py-5 font-black text-slate-800">{s.name}</td>
                             <td className="px-8 py-5 text-left font-black text-orange-600">{s.balance.toLocaleString()} ج.م</td>
                          </tr>
                       ))}
                       {accountsData.payables.length === 0 && <tr><td colSpan={3} className="py-10 text-center opacity-30">لا توجد مستحقات موردين</td></tr>}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>
      )}

      {activeTab === 'pl' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 animate-in slide-in-from-bottom-10">
           <div className="lg:col-span-2 bg-white p-16 rounded-[60px] shadow-xl border-t-[12px] border-slate-900 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-slate-50 rounded-bl-full opacity-50"></div>
              <div className="flex justify-between items-start mb-16 relative z-10">
                 <div>
                    <h3 className="text-4xl font-black text-slate-900 mb-2">قائمة الأرباح والخسائر</h3>
                    <p className="text-slate-400 font-bold text-sm uppercase tracking-[0.2em]">Statement of Comprehensive Income</p>
                 </div>
                 <div className="text-left bg-slate-50 p-4 rounded-3xl border border-slate-100">
                    <p className="font-black text-slate-900 text-xs">إغلاق الفترة المالية</p>
                    <p className="text-[10px] text-blue-600 font-black italic">{new Date().toLocaleDateString('ar-EG', {day: 'numeric', month: 'long', year: 'numeric'})}</p>
                 </div>
              </div>

              <div className="space-y-8">
                 <PLRow label="إجمالي مبيعات البضائع والخدمات" value={stats.totalSales} isBold />
                 <PLRow label="تكلفة المبيعات (COGS)" value={-stats.totalCOGS} isNegative />
                 <div className="h-px bg-slate-100 mx-4"></div>
                 <PLRow label="إجمالي الربح التشغيلي" value={stats.grossProfit} isTotal />
                 
                 <div className="pt-8 space-y-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-6 mb-4">المصروفات العامة والإدارية</p>
                    <PLRow label="إجمالي المصروفات (تشغيل/رواتب/نثريات)" value={-stats.totalExpenses} isNegative />
                    <PLRow label="مخصص ضريبة القيمة المضافة التقديري" value={-stats.taxAmount} isNegative />
                 </div>

                 <div className="mt-16 p-10 bg-slate-900 text-white rounded-[40px] shadow-2xl flex justify-between items-center relative overflow-hidden border-4 border-white/5">
                    <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-blue-600/30 to-transparent"></div>
                    <div className="relative z-10">
                       <h4 className="text-2xl font-black mb-1">صافي الربح النهائي</h4>
                       <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Net Net Profit (After Tax & Expenses)</p>
                    </div>
                    <h2 className="text-6xl font-black relative z-10 tracking-tighter">{(stats.netProfit - stats.taxAmount).toLocaleString()} <span className="text-lg">ج.م</span></h2>
                 </div>
              </div>

              <div className="mt-20 border-t pt-10 flex justify-between items-center opacity-40">
                 <p className="text-[10px] font-bold">نظام البطل بلاس - إصدار المؤسسات الذكي 2.5</p>
                 <button className="flex items-center gap-2 text-xs font-black hover:text-blue-600 transition-colors"><Download size={14}/> تصدير التقرير PDF</button>
              </div>
           </div>

           <div className="space-y-8">
              <div className="bg-indigo-900 p-10 rounded-[55px] text-white shadow-2xl relative overflow-hidden group border-4 border-indigo-800">
                 <div className="absolute top-0 left-0 w-full h-full bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                 <h3 className="text-xl font-black mb-8 flex items-center gap-3"><Zap className="text-yellow-400" /> تحليل التدفق النقدي</h3>
                 <div className="space-y-6">
                    <div className="p-6 bg-white/10 rounded-3xl border border-white/10 flex justify-between items-center">
                       <div>
                          <p className="text-[9px] font-black text-indigo-300 uppercase mb-1">نسبة التحصيل</p>
                          <h4 className="text-3xl font-black">{stats.totalSales > 0 ? Math.round((stats.totalPaymentsReceived / stats.totalSales) * 100) : 0}%</h4>
                       </div>
                       <TrendingUp className="text-indigo-300 opacity-20" size={40} />
                    </div>
                    <div className="p-6 bg-white/10 rounded-3xl border border-white/10">
                       <p className="text-[9px] font-black text-indigo-300 uppercase mb-1">القيمة السوقية للمخزن</p>
                       <h4 className="text-3xl font-black">{products.reduce((a,b)=>a+(b.stock * b.retailPrice), 0).toLocaleString()} <span className="text-xs">ج.م</span></h4>
                    </div>
                 </div>
                 <p className="text-[10px] font-bold text-slate-400 mt-10 leading-relaxed italic border-r-4 border-yellow-500 pr-4">
                    "تنبيه ذكي: لديك نمو في المبيعات بنسبة 12% هذا الشهر، يُنصح بزيادة وتيرة التحصيل من العملاء الآجلين لضمان سيولة الشراء القادمة."
                 </p>
              </div>

              <div className="bg-white p-10 rounded-[50px] border shadow-sm space-y-6">
                 <h4 className="font-black text-slate-800 flex items-center gap-2"><PieChart size={18} className="text-pink-500" /> هيكل التكاليف</h4>
                 <div className="space-y-5">
                    <CostBar label="تكلفة البضاعة" percent={stats.totalSales > 0 ? Math.round((stats.totalCOGS / stats.totalSales) * 100) : 0} color="bg-blue-600" />
                    <CostBar label="المصروفات" percent={stats.totalSales > 0 ? Math.round((stats.totalExpenses / stats.totalSales) * 100) : 0} color="bg-red-500" />
                    <CostBar label="هامش الربح" percent={stats.totalSales > 0 ? Math.round((stats.netProfit / stats.totalSales) * 100) : 0} color="bg-green-500" />
                 </div>
              </div>
           </div>
        </div>
      )}

      {activeTab === 'overview' && (
        <div className="space-y-10 animate-in slide-in-from-bottom-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
             <QuickStat label="إيرادات المبيعات" value={stats.totalSales} color="blue" icon={<TrendingUp />} />
             <QuickStat label="صافي الربح" value={stats.netProfit} color="green" icon={<Calculator />} />
             <QuickStat label="إجمالي المصروفات" value={stats.totalExpenses} color="red" icon={<Receipt />} />
             <QuickStat label="مديونيات السوق" value={customers.reduce((a,b)=>a+b.balance,0)} color="indigo" icon={<Layers />} />
          </div>
          <div className="h-[450px] bg-white p-12 rounded-[60px] border shadow-sm relative">
             <div className="flex justify-between items-center mb-10">
                <h3 className="text-xl font-black text-slate-800">منحنى التدفق النقدي والأرباح</h3>
                <div className="flex gap-4">
                   <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-600"></div><span className="text-[10px] font-black text-slate-400 uppercase">المبيعات</span></div>
                   <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500"></div><span className="text-[10px] font-black text-slate-400 uppercase">الأرباح</span></div>
                </div>
             </div>
             <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sales.slice(-10).map(s => ({name: s.date, val: s.totalAmount, p: s.profit}))}>
                   <defs>
                      <linearGradient id="gSales" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#2563eb" stopOpacity={0.2}/><stop offset="95%" stopColor="#2563eb" stopOpacity={0}/></linearGradient>
                      <linearGradient id="gProfit" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
                   </defs>
                   <XAxis dataKey="name" hide />
                   <Tooltip contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)'}} />
                   <Area type="monotone" dataKey="val" stroke="#2563eb" fill="url(#gSales)" strokeWidth={5} />
                   <Area type="monotone" dataKey="p" stroke="#10b981" fill="url(#gProfit)" strokeWidth={5} />
                </AreaChart>
             </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

const CostBar = ({ label, percent, color }: any) => (
  <div className="space-y-1.5">
    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
       <span className="text-slate-400">{label}</span>
       <span className="text-slate-800">{percent}%</span>
    </div>
    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
       <div className={`h-full ${color} rounded-full transition-all duration-1000`} style={{width: `${percent}%`}}></div>
    </div>
  </div>
);

const PLRow = ({ label, value, isBold, isNegative, isTotal }: any) => (
  <div className={`flex justify-between items-center p-5 rounded-[25px] transition-all ${isTotal ? 'bg-blue-50 border-2 border-blue-100 shadow-sm' : 'hover:bg-slate-50'}`}>
    <span className={`${isBold || isTotal ? 'font-black text-slate-800' : 'font-bold text-slate-500'} text-sm`}>{label}</span>
    <span className={`${isBold || isTotal ? 'text-2xl font-black text-slate-900' : 'font-black text-slate-700'} ${isNegative ? 'text-red-500' : ''}`}>
      {value.toLocaleString()} <span className="text-xs opacity-50">ج.م</span>
    </span>
  </div>
);

const ReportTabBtn = ({ active, onClick, icon, label }: any) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-3 px-8 py-3.5 rounded-[20px] font-black text-[11px] whitespace-nowrap transition-all ${active ? 'bg-white text-blue-600 shadow-lg scale-105' : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'}`}
  >
    {icon} {label}
  </button>
);

const QuickStat = ({ label, value, color, icon }: any) => {
  const colors: any = { 
    blue: 'bg-blue-600 shadow-blue-100 text-white', 
    green: 'bg-emerald-600 shadow-emerald-100 text-white', 
    red: 'bg-red-600 shadow-red-100 text-white',
    indigo: 'bg-indigo-600 shadow-indigo-100 text-white'
  };
  return (
    <div className={`p-10 rounded-[45px] shadow-xl ${colors[color]} relative overflow-hidden group hover:-translate-y-1 transition-all`}>
       <div className="absolute top-0 right-0 p-4 opacity-10 scale-[2.5] group-hover:scale-[3] transition-transform">{icon}</div>
       <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-2">{label}</p>
       <h4 className="text-3xl font-black tracking-tighter">{value.toLocaleString()} <span className="text-xs font-bold opacity-60">ج.م</span></h4>
    </div>
  );
};

export default Reports;
