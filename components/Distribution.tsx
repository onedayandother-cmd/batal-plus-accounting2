
import React, { useState } from 'react';
import { 
  Truck, Package, CheckCircle, Clock, 
  MapPin, Phone, Search, ChevronRight, 
  User, AlertCircle, TrendingUp
} from 'lucide-react';
import { Sale, OrderStatus } from '../types';

interface DistributionProps {
  sales: Sale[];
  setSales: React.Dispatch<React.SetStateAction<Sale[]>>;
}

const Distribution: React.FC<DistributionProps> = ({ sales, setSales }) => {
  const [filter, setFilter] = useState<OrderStatus | 'الكل'>('الكل');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSales = sales.filter(s => {
    const matchesFilter = filter === 'الكل' || s.status === filter;
    const matchesSearch = s.customerName.includes(searchTerm) || s.id.includes(searchTerm);
    return matchesFilter && matchesSearch;
  });

  const updateStatus = (saleId: string, newStatus: OrderStatus) => {
    setSales(prev => prev.map(s => s.id === saleId ? { ...s, status: newStatus } : s));
  };

  return (
    <div className="space-y-10 font-['Cairo'] text-right animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 bg-white p-10 rounded-[50px] shadow-sm border">
        <div>
          <h2 className="text-3xl font-black text-slate-800 flex items-center gap-4">
            <Truck className="text-pink-600" size={36} /> لوحة تحكم التوزيع
          </h2>
          <p className="text-slate-500 font-bold">تتبع حركة المناديب، خطوط السير، وحالات تسليم الطلبيات</p>
        </div>
        <div className="flex bg-slate-100 p-2 rounded-[25px] gap-2 overflow-x-auto no-scrollbar">
           {['الكل', ...Object.values(OrderStatus)].map(status => (
             <button 
              key={status} 
              onClick={() => setFilter(status as any)}
              className={`px-6 py-3 rounded-2xl font-black text-[10px] whitespace-nowrap transition-all ${filter === status ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-500 hover:bg-white/50'}`}
             >
               {status}
             </button>
           ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <StatusCard label="طلبات مع المناديب" count={sales.filter(s => s.status === OrderStatus.OUT_FOR_DELIVERY).length} color="indigo" />
         <StatusCard label="طلبات قيد التجهيز" count={sales.filter(s => s.status === OrderStatus.PENDING).length} color="pink" />
         <StatusCard label="تم التسليم اليوم" count={sales.filter(s => s.status === OrderStatus.DELIVERED).length} color="green" />
         <StatusCard label="مرتجعات توزيع" count={sales.filter(s => s.status === OrderStatus.RETURNED).length} color="red" />
      </div>

      <div className="bg-white rounded-[50px] shadow-sm border overflow-hidden">
        <div className="p-8 border-b bg-slate-50/50 flex justify-between items-center">
           <div className="relative w-full max-w-md">
              <input 
                type="text" 
                placeholder="بحث برقم الطلبية أو اسم العميل..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-white border rounded-2xl px-12 py-4 font-bold text-sm outline-none focus:ring-4 focus:ring-pink-500/10"
              />
              <Search className="absolute right-4 top-4 text-slate-300" />
           </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b">
                <th className="px-8 py-6">الطلبية</th>
                <th className="px-8 py-6">العميل والمنطقة</th>
                <th className="px-8 py-6">المندوب</th>
                <th className="px-8 py-6 text-center">الحالة</th>
                <th className="px-8 py-6 text-left">تحديث الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredSales.map(sale => (
                <tr key={sale.id} className="hover:bg-pink-50/10 transition-colors group">
                  <td className="px-8 py-6">
                     <span className="font-black text-slate-800 block">#{sale.id.slice(-6)}</span>
                     <span className="text-[10px] text-slate-400 font-bold">{sale.totalAmount.toLocaleString()} ج.م</span>
                  </td>
                  <td className="px-8 py-6">
                     <div className="flex flex-col">
                        <span className="font-black text-slate-700">{sale.customerName}</span>
                        <span className="flex items-center gap-1 text-[9px] text-slate-400 font-bold">
                           <MapPin size={10} className="text-pink-500" /> طنطا - المنطقة الصناعية
                        </span>
                     </div>
                  </td>
                  <td className="px-8 py-6">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                           <User size={18} />
                        </div>
                        {/* Fix: use deliveryDriverId instead of non-existent deliveryDriver */}
                        <span className="font-black text-xs text-slate-600">{sale.deliveryDriverId || 'لم يحدد'}</span>
                     </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                     <span className={`px-4 py-1.5 rounded-full text-[9px] font-black ${getStatusStyle(sale.status)}`}>
                        {sale.status}
                     </span>
                  </td>
                  <td className="px-8 py-6 text-left">
                     <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => updateStatus(sale.id, OrderStatus.DELIVERED)} className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-600 hover:text-white transition-all"><CheckCircle size={16}/></button>
                        <button onClick={() => updateStatus(sale.id, OrderStatus.OUT_FOR_DELIVERY)} className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-all"><Truck size={16}/></button>
                        <button onClick={() => updateStatus(sale.id, OrderStatus.RETURNED)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all"><AlertCircle size={16}/></button>
                     </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const StatusCard = ({ label, count, color }: any) => {
  const colors: any = { indigo: 'bg-indigo-600 text-white', pink: 'bg-pink-600 text-white', green: 'bg-emerald-600 text-white', red: 'bg-red-600 text-white' };
  return (
    <div className={`p-8 rounded-[40px] shadow-xl ${colors[color]} relative overflow-hidden group hover:scale-[1.02] transition-all`}>
       <div className="absolute top-0 right-0 p-4 opacity-10 scale-150"><Truck size={60} /></div>
       <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">{label}</p>
       <h4 className="text-3xl font-black">{count} طلبية</h4>
    </div>
  );
};

const getStatusStyle = (status: OrderStatus) => {
  switch(status) {
    case OrderStatus.DELIVERED: return 'bg-green-50 text-green-600';
    case OrderStatus.OUT_FOR_DELIVERY: return 'bg-indigo-50 text-indigo-600';
    case OrderStatus.PENDING: return 'bg-pink-50 text-pink-600';
    case OrderStatus.RETURNED: return 'bg-red-50 text-red-600';
    default: return 'bg-slate-50 text-slate-500';
  }
};

export default Distribution;
