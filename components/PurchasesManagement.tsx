
import React, { useState } from 'react';
import { 
  TrendingUp, Truck, Search, Filter, Eye, RotateCcw, 
  Download, Printer, AlertCircle, CheckCircle, Clock,
  ArrowUpRight, ArrowDownRight, Package, BarChart3, 
  X, ReceiptText, ShieldAlert, History, Wallet, Edit
} from 'lucide-react';
import { Purchase, PaymentMethod } from '../types';
import PurchaseInvoicePreview from './PurchaseInvoicePreview';

interface PurchasesManagementProps {
  purchases: Purchase[];
  setPurchases: React.Dispatch<React.SetStateAction<Purchase[]>>;
}

const PurchasesManagement: React.FC<PurchasesManagementProps> = ({ purchases, setPurchases }) => {
  const [filter, setFilter] = useState<PaymentMethod | 'الكل'>('الكل');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingPurchase, setViewingPurchase] = useState<Purchase | null>(null);

  const handleRequestEdit = (purchaseId: string) => {
    setPurchases(prev => prev.map(p => p.id === purchaseId ? { ...p, modificationRequested: true } : p));
    alert('تم إرسال طلب تعديل فاتورة الوارد للمسؤول.');
  };

  const filteredPurchases = purchases.filter(p => {
    const matchesSearch = p.supplierName.includes(searchTerm) || p.id.includes(searchTerm);
    const matchesType = filter === 'الكل' || p.paymentType === filter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-10 animate-in fade-in duration-500 font-['Cairo'] text-right pb-20">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8">
        <div>
          <h2 className="text-3xl font-black text-slate-800">إدارة سجل المشتريات والوارد</h2>
          <p className="text-slate-500 font-bold">تتبع فواتير التوريد وطلبات التعديل</p>
        </div>
      </div>

      <div className="bg-white rounded-[45px] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6 bg-slate-50/30">
           <h3 className="text-xl font-black text-slate-800">سجل فواتير الوارد</h3>
           <div className="relative w-full md:w-96">
              <input type="text" placeholder="بحث برقم الفاتورة أو المورد..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-3 font-bold text-sm pr-12 outline-none focus:ring-2 focus:ring-indigo-500" />
              <Search size={18} className="absolute right-4 top-3.5 text-slate-400" />
           </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b">
              <tr>
                <th className="px-8 py-6">الفاتورة</th>
                <th className="px-8 py-6">المورد</th>
                <th className="px-8 py-6 text-center">التاريخ</th>
                <th className="px-8 py-6 text-center">القيمة</th>
                <th className="px-8 py-6 text-center">طلب تعديل</th>
                <th className="px-8 py-6 text-left">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredPurchases.map((p) => (
                <tr key={p.id} className={`hover:bg-slate-50 transition-colors group ${p.modificationRequested ? 'bg-orange-50/30' : ''}`}>
                  <td className="px-8 py-6 font-black text-indigo-600">#{p.id.slice(-6)}</td>
                  <td className="px-8 py-6 font-black text-slate-800">{p.supplierName}</td>
                  <td className="px-8 py-6 text-center text-xs font-bold text-slate-400">{new Date(p.date).toLocaleDateString('ar-EG')}</td>
                  <td className="px-8 py-6 text-center font-black">{p.totalAmount.toLocaleString()} ج.م</td>
                  <td className="px-8 py-6 text-center">
                    {p.modificationRequested ? (
                      <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-[10px] font-black">مطلوب تعديل</span>
                    ) : (
                      <button onClick={() => handleRequestEdit(p.id)} className="text-indigo-500 hover:text-indigo-700 font-black text-[10px] flex items-center justify-center gap-1 mx-auto"><Edit size={12}/> طلب تعديل</button>
                    )}
                  </td>
                  <td className="px-8 py-6 text-left">
                     <button onClick={() => setViewingPurchase(p)} className="p-3 bg-slate-100 text-slate-500 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm"><Eye size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {viewingPurchase && (
        <PurchaseInvoicePreview 
          purchase={viewingPurchase} 
          // Assuming AppSettings is globally available or passed down. 
          // Since it's not passed as prop here, we'll construct a minimal one or pass empty if not strict.
          // However, typically PurchaseInvoicePreview requires settings for store info.
          // For now, we'll try to retrieve from localStorage or use a default since this component is focused on display.
          settings={JSON.parse(localStorage.getItem('b_settings') || '{}')}
          onClose={() => setViewingPurchase(null)} 
        />
      )}
    </div>
  );
};

const FilterButton: React.FC<{ active: boolean; onClick: () => void; label: string }> = ({ active, onClick, label }) => (
  <button onClick={onClick} className={`px-10 py-3 rounded-2xl font-black text-xs transition-all ${active ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>{label}</button>
);

export default PurchasesManagement;
