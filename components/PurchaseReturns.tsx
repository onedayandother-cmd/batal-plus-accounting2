
import React, { useState } from 'react';
import { 
  Undo2, Search, Hash, Truck, 
  Calendar, CheckCircle, AlertTriangle, 
  Trash2, X, AlertOctagon, Save, Box,
  History, ClipboardList
} from 'lucide-react';
import { Purchase, Product, Supplier, InvoiceItem, AccountTransaction, ReturnRecord } from '../types';

interface PurchaseReturnsProps {
  purchases: Purchase[];
  setPurchases: React.Dispatch<React.SetStateAction<Purchase[]>>;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  suppliers: Supplier[];
  setSuppliers: React.Dispatch<React.SetStateAction<Supplier[]>>;
  returnRecords: ReturnRecord[];
  setReturnRecords: React.Dispatch<React.SetStateAction<ReturnRecord[]>>;
}

const PurchaseReturns: React.FC<PurchaseReturnsProps> = ({ purchases, setPurchases, products, setProducts, suppliers, setSuppliers, returnRecords, setReturnRecords }) => {
  const [activeTab, setActiveTab] = useState<'new' | 'history'>('new');
  const [purchaseSearch, setPurchaseSearch] = useState('');
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [itemsToReturn, setItemsToReturn] = useState<InvoiceItem[]>([]);
  const [returnSuccess, setReturnSuccess] = useState(false);
  const [returnReason, setReturnReason] = useState('تالف');

  const handleFindPurchase = () => {
    if (!purchaseSearch.trim()) return;
    const purchase = purchases.find(p => p.invoiceNumber === purchaseSearch || p.id.slice(-6) === purchaseSearch || p.invoiceNumber.endsWith(purchaseSearch));
    if (purchase) {
      if (purchase.isReturned) {
        alert('تنبيه: تم تسجيل مرتجع سابق لهذه الفاتورة.');
      }
      setSelectedPurchase(purchase);
      setItemsToReturn(purchase.items.map(item => ({ ...item, quantity: 0, total: 0 })));
    } else {
      alert('فاتورة الشراء غير موجودة');
    }
  };

  const updateReturnQuantity = (index: number, newQty: number) => {
    if (!selectedPurchase) return;
    const maxQty = selectedPurchase.items[index].quantity;
    const qty = Math.min(Math.max(0, newQty), maxQty);
    
    const newItems = [...itemsToReturn];
    newItems[index].quantity = qty;
    newItems[index].total = qty * newItems[index].pricePerUnit;
    setItemsToReturn(newItems);
  };

  const processReturn = () => {
    if (!selectedPurchase) return;

    const returnTotal = itemsToReturn.reduce((sum, i) => sum + i.total, 0);
    if (returnTotal === 0) {
        alert("يجب تحديد كميات للرد.");
        return;
    }

    if (!window.confirm('سيتم خصم الكميات من المخزن وتخفيض مديونية المورد. هل تستمر؟')) return;

    // 1. الخصم من المخزن
    setProducts(prevProducts => prevProducts.map(p => {
      const returnedItem = itemsToReturn.find(it => it.productId === p.id && it.quantity > 0);
      if (returnedItem) {
        let piecesToDeduct = returnedItem.quantity;
        if (returnedItem.unit === 'دستة') piecesToDeduct *= p.conversion.dozenToPiece;
        if (returnedItem.unit === 'كرتونة') piecesToDeduct *= p.conversion.cartonToPiece;
        return { ...p, stock: Math.max(0, p.stock - piecesToDeduct) };
      }
      return p;
    }));

    // 2. تحديث حساب المورد
    setSuppliers(prevSuppliers => prevSuppliers.map(s => {
      if (s.name === selectedPurchase.supplierName) {
        const newBalance = s.balance - returnTotal;
        const transaction: AccountTransaction = {
          id: Date.now().toString(),
          date: new Date().toISOString().split('T')[0],
          note: `مرتجع مشتريات فاتورة رقم ${selectedPurchase.invoiceNumber} (${returnReason})`,
          type: 'مرتجع',
          amount: returnTotal,
          balanceAfter: newBalance
        };
        return { ...s, balance: newBalance, transactions: [transaction, ...s.transactions] };
      }
      return s;
    }));

    // 3. Mark invoice and Create Record
    setPurchases(prev => prev.map(p => p.id === selectedPurchase.id ? { ...p, isReturned: true } : p));

    const newRecord: ReturnRecord = {
      id: Date.now().toString(),
      originalInvoiceNumber: selectedPurchase.invoiceNumber,
      date: new Date().toISOString().split('T')[0],
      partyName: selectedPurchase.supplierName,
      items: itemsToReturn.filter(i => i.quantity > 0),
      totalRefund: returnTotal,
      reason: returnReason,
      type: 'purchase'
    };

    setReturnRecords([newRecord, ...returnRecords]);
    setReturnSuccess(true);
  };

  if (returnSuccess) {
    return (
        <div className="flex flex-col h-[calc(100vh-120px)] items-center justify-center -mt-4 bg-slate-100 rounded-t-[30px] border border-slate-200 shadow-sm animate-in zoom-in">
           <div className="bg-white p-16 rounded-[50px] shadow-xl text-center max-w-md border-b-8 border-orange-500">
              <div className="w-24 h-24 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
                 <CheckCircle size={48} className="animate-bounce" />
              </div>
              <h2 className="text-3xl font-black text-slate-800 mb-2">تم رد البضاعة</h2>
              <p className="text-slate-500 font-bold mb-8">تم تحديث المخزن وحساب المورد وتسجيل المرتجع.</p>
              <button 
                onClick={() => { setReturnSuccess(false); setSelectedPurchase(null); setPurchaseSearch(''); setItemsToReturn([]); }}
                className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black shadow-lg hover:bg-black transition-all"
              >
                بدء عملية جديدة
              </button>
           </div>
        </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] font-['Cairo'] -mt-4 bg-slate-100 overflow-hidden text-right rounded-t-[30px] border border-slate-200 shadow-sm">
      {/* Header */}
      <div className="bg-white px-6 py-4 border-b border-slate-200 shadow-sm z-20 flex justify-between items-center">
         <div className="flex items-center gap-4">
            <div className="bg-orange-50 p-3 rounded-2xl text-orange-600">
               <Undo2 size={24} />
            </div>
            <div>
               <h2 className="text-xl font-black text-slate-800">مرتجع مشتريات</h2>
               <p className="text-[10px] font-bold text-slate-400">رد بضاعة للمورد (صادر مخزني)</p>
            </div>
         </div>
         <div className="flex bg-slate-100 p-1.5 rounded-xl gap-2">
            <button 
              onClick={() => setActiveTab('new')}
              className={`px-6 py-2 rounded-lg text-xs font-black transition-all ${activeTab === 'new' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
               رد بضاعة جديد
            </button>
            <button 
              onClick={() => setActiveTab('history')}
              className={`px-6 py-2 rounded-lg text-xs font-black transition-all flex items-center gap-2 ${activeTab === 'history' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
               سجل المردودات <History size={14}/>
            </button>
         </div>
      </div>

      {activeTab === 'new' ? (
        <>
          {/* Search */}
          <div className="p-6 bg-slate-50 border-b border-slate-200">
             <div className="flex gap-3 max-w-2xl mx-auto">
                <div className="relative flex-1">
                   <input 
                     type="text" 
                     placeholder="ابحث برقم فاتورة التوريد..." 
                     value={purchaseSearch}
                     onChange={e => setPurchaseSearch(e.target.value)}
                     onKeyPress={e => e.key === 'Enter' && handleFindPurchase()}
                     className="w-full bg-white border-2 border-slate-200 focus:border-orange-500 rounded-xl px-4 py-3 font-bold text-sm outline-none"
                   />
                   <Search className="absolute right-4 top-3.5 text-slate-400" size={18} />
                </div>
                <button onClick={handleFindPurchase} className="bg-orange-600 text-white px-8 rounded-xl font-black text-xs hover:bg-orange-700 shadow-lg shadow-orange-100">بحث</button>
             </div>

             {selectedPurchase && (
                <div className="mt-6 pt-4 border-t border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-4 animate-in slide-in-from-top-2 max-w-4xl mx-auto">
                   <div className="bg-white p-3 rounded-xl border border-slate-200">
                      <p className="text-[9px] font-black text-slate-400 uppercase">رقم الفاتورة</p>
                      <p className="font-black text-slate-800 flex items-center gap-2"><Hash size={14} className="text-orange-500"/> {selectedPurchase.invoiceNumber}</p>
                   </div>
                   <div className="bg-white p-3 rounded-xl border border-slate-200">
                      <p className="text-[9px] font-black text-slate-400 uppercase">المورد</p>
                      <p className="font-black text-slate-800 flex items-center gap-2"><Truck size={14} className="text-orange-500"/> {selectedPurchase.supplierName}</p>
                   </div>
                   <div className="bg-white p-3 rounded-xl border border-slate-200">
                      <p className="text-[9px] font-black text-slate-400 uppercase">تاريخ التوريد</p>
                      <p className="font-black text-slate-800 flex items-center gap-2"><Calendar size={14} className="text-orange-500"/> {selectedPurchase.date}</p>
                   </div>
                   <div className="bg-white p-3 rounded-xl border border-slate-200">
                      <p className="text-[9px] font-black text-slate-400 uppercase">الأصل</p>
                      <p className="font-black text-slate-800 flex items-center gap-2"><Box size={14} className="text-orange-500"/> {selectedPurchase.paymentType}</p>
                   </div>
                </div>
             )}
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto bg-slate-50 p-6">
             {!selectedPurchase ? (
                <div className="h-full flex flex-col items-center justify-center opacity-30">
                   <Undo2 size={80} className="mb-4 text-slate-400" />
                   <p className="text-2xl font-black text-slate-500">أدخل رقم فاتورة التوريد للبدء</p>
                </div>
             ) : (
                <div className="bg-white rounded-[30px] shadow-sm border border-slate-200 overflow-hidden max-w-5xl mx-auto">
                   <table className="w-full text-right border-collapse">
                      <thead className="bg-slate-100 text-[11px] font-black text-slate-600 uppercase">
                         <tr>
                            <th className="py-4 px-6 border-b">الصنف</th>
                            <th className="py-4 px-6 border-b text-center">الوحدة</th>
                            <th className="py-4 px-6 border-b text-center">التكلفة</th>
                            <th className="py-4 px-6 border-b text-center">الكمية المستلمة</th>
                            <th className="py-4 px-6 border-b text-center w-40">كمية الرد</th>
                            <th className="py-4 px-6 border-b text-center">إجمالي المردود</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                         {itemsToReturn.map((item, idx) => (
                            <tr key={idx} className={`hover:bg-orange-50/10 transition-colors ${item.quantity > 0 ? 'bg-orange-50/30' : ''}`}>
                               <td className="py-4 px-6">
                                  <p className="font-bold text-sm text-slate-800">{item.productName}</p>
                               </td>
                               <td className="py-4 px-6 text-center">
                                  <span className="bg-slate-100 px-2 py-1 rounded text-[10px] font-bold">{item.unit}</span>
                               </td>
                               <td className="py-4 px-6 text-center font-bold text-slate-500">{item.pricePerUnit}</td>
                               <td className="py-4 px-6 text-center font-bold text-slate-800">{selectedPurchase.items[idx].quantity}</td>
                               <td className="py-4 px-6 text-center">
                                  <input 
                                    type="number" 
                                    value={item.quantity}
                                    onChange={e => updateReturnQuantity(idx, parseFloat(e.target.value) || 0)}
                                    className="w-full bg-slate-50 border border-slate-300 rounded-lg py-2 px-2 text-center font-black text-orange-600 focus:border-orange-500 outline-none"
                                  />
                               </td>
                               <td className="py-4 px-6 text-center font-black text-orange-600">
                                  {item.total.toLocaleString()}
                               </td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             )}
          </div>

          {/* Footer */}
          {selectedPurchase && (
             <div className="bg-slate-900 text-white px-8 py-5 shrink-0 z-30 shadow-2xl rounded-t-[30px] flex justify-between items-center">
                <div className="flex items-center gap-6">
                   <div className="bg-white/10 px-6 py-3 rounded-2xl border border-white/5">
                      <p className="text-[10px] text-slate-400 uppercase font-black">إجمالي قيمة المرتجع</p>
                      <p className="text-2xl font-black text-orange-400">{itemsToReturn.reduce((a,b)=>a+b.total, 0).toLocaleString()} <span className="text-sm">ج.م</span></p>
                   </div>
                   <div className="bg-white/10 px-4 py-2 rounded-2xl border border-white/5 flex flex-col">
                      <label className="text-[10px] text-slate-400 font-bold mb-1">سبب الرد</label>
                      <select 
                        value={returnReason} 
                        onChange={e => setReturnReason(e.target.value)}
                        className="bg-transparent font-bold text-sm outline-none text-white cursor-pointer"
                      >
                         <option value="تالف" className="text-slate-900">تالف / غير مطابق</option>
                         <option value="منتهى الصلاحية" className="text-slate-900">منتهى الصلاحية</option>
                         <option value="زيادة في الطلب" className="text-slate-900">زيادة في الطلب</option>
                         <option value="خطأ في التوريد" className="text-slate-900">خطأ في التوريد</option>
                      </select>
                   </div>
                   {selectedPurchase.isReturned && (
                      <div className="flex items-center gap-2 text-yellow-400 font-bold bg-yellow-900/30 px-4 py-2 rounded-xl">
                         <AlertOctagon size={18} />
                         <span className="text-xs">تنبيه: الفاتورة معدلة بمرتجع سابق</span>
                      </div>
                   )}
                </div>
                <div className="flex gap-3">
                   <button onClick={() => setSelectedPurchase(null)} className="px-6 py-4 bg-white/10 hover:bg-white/20 rounded-2xl font-bold text-xs transition-all">إلغاء</button>
                   <button 
                      onClick={processReturn}
                      disabled={itemsToReturn.every(i => i.quantity === 0)}
                      className="px-10 py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl font-black shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
                   >
                      <Save size={18} /> تأكيد الرد للمورد
                   </button>
                </div>
             </div>
          )}
        </>
      ) : (
        // HISTORY TAB
        <div className="flex-1 overflow-auto bg-slate-50 p-8">
           <div className="bg-white rounded-[40px] shadow-sm border border-slate-200 overflow-hidden">
              <table className="w-full text-right">
                 <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    <tr>
                       <th className="px-8 py-5">تاريخ الرد</th>
                       <th className="px-8 py-5">رقم فاتورة التوريد</th>
                       <th className="px-8 py-5">المورد</th>
                       <th className="px-8 py-5">السبب</th>
                       <th className="px-8 py-5 text-center">الأصناف المردودة</th>
                       <th className="px-8 py-5 text-center">قيمة المردود</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                    {returnRecords.length === 0 ? (
                       <tr>
                          <td colSpan={6} className="py-20 text-center opacity-30">
                             <ClipboardList size={48} className="mx-auto mb-4" />
                             <p className="font-black text-xl">لا يوجد سجلات مردودات</p>
                          </td>
                       </tr>
                    ) : (
                       returnRecords.map((record) => (
                          <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                             <td className="px-8 py-6 font-bold text-slate-500 text-xs">{record.date}</td>
                             <td className="px-8 py-6 font-black text-orange-600">{record.originalInvoiceNumber}</td>
                             <td className="px-8 py-6 font-bold text-slate-800">{record.partyName}</td>
                             <td className="px-8 py-6"><span className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-[10px] font-black">{record.reason}</span></td>
                             <td className="px-8 py-6 text-center">
                                <div className="text-xs font-bold text-slate-600">
                                   {record.items.map(i => <div key={i.productId}>{i.productName} ({i.quantity})</div>)}
                                </div>
                             </td>
                             <td className="px-8 py-6 text-center font-black text-orange-600">{record.totalRefund.toLocaleString()} ج.م</td>
                          </tr>
                       ))
                    )}
                 </tbody>
              </table>
           </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseReturns;
