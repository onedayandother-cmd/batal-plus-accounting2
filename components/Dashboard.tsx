
import React, { useMemo } from 'react';
import { 
  TrendingUp, RefreshCw, Crown, ShieldCheck, HeartPulse, 
  ArrowUpRight, AlertTriangle, BarChart3, Sparkles, Calendar,
  Wallet, ShoppingBag, ArrowDownRight, Package, Clock, Users, CheckCircle2
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { Link } from 'react-router-dom';
import { Product, Expense, Customer, Sale } from '../types';

interface DashboardProps {
  products: Product[];
  expenses: Expense[];
  customers: Customer[];
  sales: Sale[];
}

const Dashboard: React.FC<DashboardProps> = ({ products, expenses, customers, sales }) => {
  const stats = useMemo(() => {
    const validSales = sales.filter(s => !s.isReturned);
    const today = new Date().toISOString().split('T')[0];
    
    // Totals
    const totalSales = validSales.reduce((sum, s) => sum + s.totalAmount, 0);
    const netProfit = validSales.reduce((sum, s) => sum + (s.profit || 0), 0);
    const totalDebts = customers.reduce((a, b) => a + b.balance, 0);
    const totalInventoryValue = products.reduce((a, b) => a + (b.stock * b.costPrice), 0);
    
    // Today's Metrics
    const todaySales = validSales.filter(s => s.date === today).reduce((sum, s) => sum + s.totalAmount, 0);
    const todayTransactions = validSales.filter(s => s.date === today).length;
    
    // Health Score
    const collectionEfficiency = 100 - Math.min(100, Math.round((totalDebts / (totalSales || 1)) * 50));
    const profitMargin = Math.min(50, Math.round((netProfit / (totalSales || 1)) * 100));
    const healthScore = Math.min(100, collectionEfficiency + profitMargin);

    return { 
      totalSales, netProfit, totalDebts, totalInventoryValue, healthScore, 
      todaySales, todayTransactions,
      lowStock: products.filter(p => p.stock <= p.minStockLevel) 
    };
  }, [products, customers, sales]);

  const chartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    return last7Days.map(date => {
      const dailySales = sales.filter(s => s.date === date && !s.isReturned).reduce((a, b) => a + b.totalAmount, 0);
      const dailyProfit = sales.filter(s => s.date === date && !s.isReturned).reduce((a, b) => a + (b.profit || 0), 0);
      return {
        name: new Date(date).toLocaleDateString('ar-EG', { weekday: 'short' }),
        sales: dailySales,
        profit: dailyProfit
      };
    });
  }, [sales]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'صباح الخير، يوم موفق!';
    if (hour < 18) return 'طاب مساؤك، استمرار مميز!';
    return 'مساء الخير، حصاد اليوم!';
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 text-right font-['Cairo'] pb-20">
      
      {/* Welcome & Quick Actions Header */}
      <div className="flex flex-col xl:flex-row gap-8 justify-between items-end">
         <div>
            <div className="flex items-center gap-2 mb-2">
               <span className="text-3xl">👋</span>
               <h2 className="text-3xl font-black text-slate-800">{getGreeting()}</h2>
            </div>
            <p className="text-slate-500 font-bold text-sm">إليك ملخص أداء المؤسسة المالي والتشغيلي لليوم.</p>
         </div>
         <div className="flex gap-3">
            <Link to="/sales" className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs hover:bg-black hover:scale-105 transition-all shadow-xl">
               <ShoppingBag size={16}/> فاتورة بيع جديدة
            </Link>
            <Link to="/inventory" className="flex items-center gap-2 px-6 py-3 bg-white text-slate-700 border border-slate-200 rounded-2xl font-black text-xs hover:border-blue-500 hover:text-blue-600 transition-all shadow-sm">
               <Package size={16}/> إضافة منتج
            </Link>
            <Link to="/customers" className="flex items-center gap-2 px-6 py-3 bg-white text-slate-700 border border-slate-200 rounded-2xl font-black text-xs hover:border-green-500 hover:text-green-600 transition-all shadow-sm">
               <Users size={16}/> عميل جديد
            </Link>
         </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <KPICard 
          title="مبيعات اليوم" 
          value={stats.todaySales} 
          subValue={`${stats.todayTransactions} عملية ناجحة`}
          icon={<ShoppingBag className="text-white" size={24} />}
          color="bg-gradient-to-br from-blue-500 to-indigo-600"
          textColor="text-white"
          trend="+4.5%"
        />
        <KPICard 
          title="صافي الأرباح (الكلي)" 
          value={stats.netProfit} 
          subValue="هامش ربح صحي"
          icon={<Wallet className="text-emerald-600" size={24} />}
          color="bg-emerald-50 border border-emerald-100"
          textColor="text-emerald-900"
          trend="+12%"
          iconBg="bg-emerald-200"
        />
        <KPICard 
          title="قيمة المخزون" 
          value={stats.totalInventoryValue} 
          subValue={`${products.length} صنف نشط`}
          icon={<Package className="text-orange-600" size={24} />}
          color="bg-orange-50 border border-orange-100"
          textColor="text-orange-900"
          iconBg="bg-orange-200"
        />
        <KPICard 
          title="المديونيات السوقية" 
          value={stats.totalDebts} 
          subValue="مستحقات لدى العملاء"
          icon={<Users className="text-rose-600" size={24} />}
          color="bg-rose-50 border border-rose-100"
          textColor="text-rose-900"
          iconBg="bg-rose-200"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Main Chart Section */}
        <div className="xl:col-span-2 bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 flex flex-col h-[450px]">
           <div className="flex justify-between items-center mb-8">
              <div>
                 <h3 className="text-xl font-black text-slate-800 flex items-center gap-2"><BarChart3 size={20} className="text-blue-500"/> تحليل الأداء المالي</h3>
                 <p className="text-xs font-bold text-slate-400 mt-1">مقارنة المبيعات والأرباح لآخر 7 أيام</p>
              </div>
              <div className="flex gap-4 bg-slate-50 p-1.5 rounded-xl">
                 <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-lg shadow-sm"><div className="w-2 h-2 bg-blue-500 rounded-full"></div><span className="text-[10px] font-black text-slate-600">المبيعات</span></div>
                 <div className="flex items-center gap-2 px-3 py-1"><div className="w-2 h-2 bg-emerald-500 rounded-full"></div><span className="text-[10px] font-black text-slate-500">الأرباح</span></div>
              </div>
           </div>
           
           <div className="flex-1 w-full">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                       <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient>
                       <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11, fontWeight: 700, fill: '#94a3b8'}} dy={10} />
                    <YAxis hide />
                    <Tooltip 
                      contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)', padding: '12px'}}
                      labelStyle={{fontSize: '12px', fontWeight: 'bold', color: '#64748b', marginBottom: '8px'}}
                      itemStyle={{fontSize: '12px', fontWeight: 'bold', padding: '2px 0'}}
                    />
                    <Area type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorSales)" />
                    <Area type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorProfit)" />
                 </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Side Widgets */}
        <div className="space-y-6">
           
           {/* Business Health */}
           <div className="bg-slate-900 p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 blur-[80px] rounded-full group-hover:bg-purple-600/20 transition-all duration-1000"></div>
              <div className="relative z-10">
                 <div className="flex justify-between items-start mb-6">
                    <div>
                       <h3 className="text-lg font-black">صحة الأعمال</h3>
                       <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Business Health Score</p>
                    </div>
                    <div className="p-2 bg-white/10 rounded-xl"><HeartPulse className="text-rose-400" size={24}/></div>
                 </div>
                 
                 <div className="flex items-end gap-2 mb-4">
                    <span className="text-5xl font-black">{stats.healthScore}</span>
                    <span className="text-lg font-bold text-slate-400 mb-1">/100</span>
                 </div>
                 
                 <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden mb-2">
                    <div className="h-full bg-gradient-to-r from-rose-400 to-blue-500" style={{width: `${stats.healthScore}%`}}></div>
                 </div>
                 <p className="text-[10px] font-bold text-slate-400 text-left">مؤشر ممتاز بناءً على التحصيل والربحية</p>
              </div>
           </div>

           {/* Alerts Section */}
           <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 flex-1">
              <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2"><AlertTriangle size={20} className="text-amber-500"/> تنبيهات المخزون</h3>
              <div className="space-y-3 max-h-[180px] overflow-y-auto no-scrollbar">
                 {stats.lowStock.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">
                       <CheckCircle2 size={32} className="mx-auto mb-2 text-green-500"/>
                       <p className="text-xs font-bold">المخزون في حالة ممتازة</p>
                    </div>
                 ) : (
                    stats.lowStock.slice(0, 4).map(p => (
                       <div key={p.id} className="flex items-center justify-between p-3 bg-red-50 rounded-2xl border border-red-100">
                          <div>
                             <p className="text-xs font-black text-slate-800 truncate max-w-[120px]">{p.name}</p>
                             <p className="text-[9px] font-bold text-red-500">الرصيد: {p.stock} قطعة</p>
                          </div>
                          <Link to="/inventory" className="p-2 bg-white rounded-xl text-slate-400 hover:text-red-600 shadow-sm"><ArrowUpRight size={14}/></Link>
                       </div>
                    ))
                 )}
              </div>
           </div>

        </div>
      </div>
    </div>
  );
};

const KPICard = ({ title, value, subValue, icon, color, textColor, trend, iconBg }: any) => (
  <div className={`p-6 rounded-[35px] shadow-lg relative overflow-hidden group hover:-translate-y-1 transition-all ${color} h-40 flex flex-col justify-between`}>
     <div className="flex justify-between items-start">
        <div className={`p-3 rounded-2xl ${iconBg || 'bg-white/20'} backdrop-blur-sm`}>{icon}</div>
        {trend && <span className="bg-white/20 px-2 py-1 rounded-lg text-[10px] font-black text-white flex items-center gap-1"><TrendingUp size={10}/> {trend}</span>}
     </div>
     <div>
        <h3 className={`text-3xl font-black mb-1 tracking-tight ${textColor}`}>{value.toLocaleString()} <span className="text-sm opacity-60 font-bold">ج.م</span></h3>
        <div className="flex justify-between items-end">
           <p className={`text-[11px] font-black opacity-70 ${textColor}`}>{title}</p>
           <p className={`text-[9px] font-bold opacity-60 ${textColor}`}>{subValue}</p>
        </div>
     </div>
  </div>
);

export default Dashboard;
