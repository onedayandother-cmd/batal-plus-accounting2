
import React, { useState, useMemo } from 'react';
import { 
  Search, Eye, X, Edit, ShoppingBag, ArrowUpDown, Calendar, Filter
} from 'lucide-react';
import { Sale, PaymentMethod, Product, Customer } from '../types';

interface SalesManagementProps {
  sales: Sale[];
  setSales: React.Dispatch<React.SetStateAction<Sale[]>>;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
}

const SalesManagement: React.FC<SalesManagementProps> = ({ sales, setSales, products, setProducts, customers, setCustomers }) => {
  const [filter, setFilter] = useState<PaymentMethod | 'الكل'>('الكل');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingSale, setViewingSale] = useState<Sale | null>(null);
  
  // Sorting state
  const [sortConfig, setSortConfig] = useState<{ key: keyof Sale | 'status', direction: 'asc' | 'desc' }>({ key: 'date', direction: 'desc' });
  
  // Date filter state
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleRequestEdit = (saleId: string) => {
    setSales(prev => prev.map(s => s.id === saleId ? { ...s, modificationRequested: true } : s));
    alert('تم إرسال طلب التعديل للمسؤول بنجاح. سيتم مراجعة الفاتورة قريباً.');
  };

  const handleSort = (key: keyof Sale | 'status') => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredSales = useMemo(() => {
    let data = sales.filter(s => {
      const matchesSearch = s.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || s.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filter === 'الكل' || s.paymentType === filter;
      const matchesDate = (!startDate || s.date >= startDate) && (!endDate || s.date <= endDate);
      return matchesSearch && matchesType && matchesDate;
    });

    data.sort((a, b) => {
      const aValue = a[sortConfig.key as keyof Sale];
      const bValue = b[sortConfig.key as keyof Sale];

      if (aValue === undefined || bValue === undefined) return 0;

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    return data;
  }, [sales, searchTerm, filter, startDate, endDate, sortConfig]);

  const SortIcon = ({ column }: { column: keyof Sale | 'status' }) => {
    if (sortConfig.key !== column) return <ArrowUpDown size={14} className="text-slate-300" />;
    return <ArrowUpDown size={14} className={sortConfig.direction === 'asc' ? 'text-blue-600 rotate-180' : 'text-blue-600'} />;
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 font-['Cairo'] text-right pb-20">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8">
        <div>
          <h2 className="text-3xl font-black text-slate-800">سجل المبيعات</h2>
          <p className="text-slate-500 font-bold">تتبع الفواتير الصادرة وطلبات التعديل</p>
        </div>
      </div>

      <div className="bg-white rounded-[45px] shadow-sm border border-slate-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-8 border-b border-slate-50 flex flex-col xl:flex-row justify-between items-end xl:items-center gap-6 bg-slate-50/30">
           <div className="flex flex-col gap-4 w-full xl:w-auto">
             <h3 className="text-xl font-black text-slate-800">الفواتير المعتمدة</h3>
             <div className="flex gap-2">
                <div className="relative group">
                   <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold outline-none focus:border-blue-500" />
                   <span className="absolute -top-2.5 right-3 bg-white px-1 text-[9px] font-black text-slate-400">من تاريخ</span>
                </div>
                <div className="relative group">
                   <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold outline-none focus:border-blue-500" />
                   <span className="absolute -top-2.5 right-3 bg-white px-1 text-[9px] font-black text-slate-400">إلى تاريخ</span>
                </div>
             </div>
           </div>

           <div className="flex gap-4 w-full xl:w-auto">
              <div className="flex bg-slate-100 p-1.5 rounded-xl">
                 {(['الكل', 'كاش', 'آجل'] as const).map(t => (
                   <button key={t} onClick={() => setFilter(t)} className={`px-4 py-2 rounded-lg text-[10px] font-black transition-all ${filter === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>{t}</button>
                 ))}
              </div>
              <div className="relative flex-1 xl:w-80">
                  <input type="text" placeholder="رقم الفاتورة أو العميل..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-3 font-bold text-sm pr-12 outline-none focus:ring-2 focus:ring-blue-500" />
                  <Search size={18} className="absolute right-4 top-3.5 text-slate-400" />
              </div>
           </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b">
              <tr>
                <th className="px-8 py-6 cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => handleSort('invoiceNumber')}>
                   <div className="flex items-center gap-2">رقم الفاتورة <SortIcon column="invoiceNumber" /></div>
                </th>
                <th className="px-8 py-6 cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => handleSort('customerName')}>
                   <div className="flex items-center gap-2">العميل <SortIcon column="customerName" /></div>
                </th>
                <th className="px-8 py-6 text-center cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => handleSort('date')}>
                   <div className="flex items-center justify-center gap-2">التاريخ <SortIcon column="date" /></div>
                </th>
                <th className="px-8 py-6 text-center cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => handleSort('totalAmount')}>
                   <div className="flex items-center justify-center gap-2">القيمة <SortIcon column="totalAmount" /></div>
                </th>
                <th className="px-8 py-6 text-center">الحالة</th>
                <th className="px-8 py-6 text-left">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredSales.map((s) => (
                <tr key={s.id} className={`hover:bg-slate-50 transition-colors group ${s.modificationRequested ? 'bg-amber-50' : ''}`}>
                  <td className="px-8 py-6 font-black text-blue-600">{s.invoiceNumber}</td>
                  <td className="px-8 py-6 font-black text-slate-800">{s.customerName}</td>
                  <td className="px-8 py-6 text-center text-xs font-bold text-slate-400">
                     <span className="block">{s.date}</span>
                     <span className="text-[9px] opacity-60">{s.time}</span>
                  </td>
                  <td className="px-8 py-6 text-center font-black">{s.totalAmount.toLocaleString()} ج.م</td>
                  <td className="px-8 py-6 text-center">
                    {s.modificationRequested ? (
                      <span className="bg-amber-100 text-amber-600 px-3 py-1 rounded-full text-[10px] font-black">مطلوب تعديل</span>
                    ) : (
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black ${s.paymentType === 'كاش' ? 'bg-green-50 text-green-600' : 'bg-indigo-50 text-indigo-600'}`}>
                         {s.paymentType} {s.isReturned ? '(مرتجع)' : ''}
                      </span>
                    )}
                  </td>
                  <td className="px-8 py-6 text-left flex justify-end gap-2">
                     <button onClick={() => setViewingSale(s)} className="p-3 bg-slate-100 text-slate-500 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm" title="معاينة"><Eye size={18} /></button>
                     {!s.modificationRequested && !s.isReturned && (
                       <button onClick={() => handleRequestEdit(s.id)} className="p-3 bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-600 hover:text-white transition-all shadow-sm" title="طلب تعديل"><Edit size={18} /></button>
                     )}
                  </td>
                </tr>
              ))}
              {filteredSales.length === 0 && (
                 <tr>
                    <td colSpan={6} className="py-20 text-center opacity-30">
                       <Filter size={48} className="mx-auto mb-4" />
                       <p className="font-black text-xl">لا توجد فواتير تطابق شروط البحث</p>
                    </td>
                 </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {viewingSale && (
        <div className="fixed inset-0 z-[250] bg-slate-900/90 backdrop-blur-2xl flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-4xl rounded-[60px] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] animate-in zoom-in duration-300">
              <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
                 <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center"><ShoppingBag size={28} /></div>
                    <div><h2 className="text-2xl font-black">فاتورة رقم {viewingSale.invoiceNumber}</h2><p className="text-xs text-blue-400 font-bold uppercase">{viewingSale.customerName} - {viewingSale.date}</p></div>
                 </div>
                 <button onClick={() => setViewingSale(null)} className="p-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl"><X /></button>
              </div>
              <div className="p-12 overflow-y-auto no-scrollbar space-y-12">
                 <div className="border border-slate-100 rounded-[40px] overflow-hidden">
                    <table className="w-full text-right">
                       <thead className="bg-slate-50 text-[10px] font-black text-slate-400"><tr><th className="px-8 py-5">الصنف</th><th className="px-8 py-5 text-center">الكمية</th><th className="px-8 py-6 text-left">الإجمالي</th></tr></thead>
                       <tbody className="divide-y font-bold">
                          {viewingSale.items.map((item, idx) => (
                            <tr key={idx}>
                               <td className="px-8 py-6"><p className="text-slate-800">{item.productName}</p><span className="text-[9px] text-slate-400">{item.unit}</span></td>
                               <td className="px-8 py-6 text-center text-lg">{item.quantity}</td>
                               <td className="px-8 py-6 text-left text-slate-900 text-lg">{item.total.toLocaleString()} ج.م</td>
                            </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
                 <div className="p-10 rounded-[45px] text-white flex justify-between items-center bg-slate-900 shadow-xl">
                    <div className="text-left"><p className="text-[10px] font-black text-white/50 uppercase mb-2">القيمة الإجمالية</p><h4 className="text-5xl font-black">{viewingSale.totalAmount.toLocaleString()} <span className="text-sm">ج.م</span></h4></div>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default SalesManagement;
