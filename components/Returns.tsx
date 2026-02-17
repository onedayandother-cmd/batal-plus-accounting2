
import React, { useState } from 'react';
import { 
  RotateCcw, Search, Hash, ShoppingBag, 
  User, Calendar, CheckCircle, AlertTriangle, 
  Trash2, X, AlertOctagon, CheckSquare, Save,
  History, FileText, ArrowRight, ClipboardList
} from 'lucide-react';
import { Sale, Product, Customer, Shift, InvoiceItem, AccountTransaction, ReturnRecord } from '../types';

interface ReturnsProps {
  sales: Sale[];
  setSales: React.Dispatch<React.SetStateAction<Sale[]>>;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  activeShift?: Shift;
  returnRecords: ReturnRecord[];
  setReturnRecords: React.Dispatch<React.SetStateAction<ReturnRecord[]>>;
}

const Returns: React.FC<ReturnsProps> = ({ sales, setSales, products, setProducts, customers, setCustomers, activeShift, returnRecords, setReturnRecords }) => {
  const [activeTab, setActiveTab] = useState<'new' | 'history'>('new');
  const [invoiceSearch, setInvoiceSearch] = useState('');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [itemsToReturn, setItemsToReturn] = useState<InvoiceItem[]>([]);
  const [returnSuccess, setReturnSuccess] = useState(false);
  const [returnReason, setReturnReason] = useState('تالف');

  const handleFindInvoice = () => {
    if (!invoiceSearch.trim()) return;
    const sale = sales.find(s => s.invoiceNumber === invoiceSearch || s.id.slice(-6) === invoiceSearch || s.invoiceNumber.endsWith(invoiceSearch));
    if (sale) {
      if (sale.isReturned) {
        alert('تنبيه: هذه الفاتورة مسجل لها مرتجع سابق.');
      }
      setSelectedSale(sale);
      // Initialize return items with 0 quantity
      setItemsToReturn(sale.items.map(item => ({ ...item, quantity: 0, total: 0 })));
    } else {
      alert('الفاتورة غير موجودة، يرجى التأكد من الرقم');
    }
  };

  const updateReturnQuantity = (index: number, newQty: number) => {
    if (!selectedSale) return;
    const maxQty = selectedSale.items[index].quantity;
    const qty = Math.min(Math.max(0, newQty), maxQty);
    
    const newItems = [...itemsToReturn];
    newItems[index].quantity = qty;
    newItems[index].total = qty * newItems[index].pricePerUnit;
    setItemsToReturn(newItems);
  };

  const processReturn = () => {
    if (!selectedSale || !activeShift) {
        if(!activeShift) alert("عفواً، لا يمكن عمل مرتجع مالي والوردية مغلقة.");
        return;
    }

    const returnTotal = itemsToReturn.reduce((sum, i) => sum + i.total, 0);
    if (returnTotal === 0) {
        alert("يجب تحديد صنف واحد على الأقل للمرتجع.");
        return;
    }

    if (!window.confirm('هل أنت متأكد من اعتماد المرتجع؟ سيتم إعادة البضاعة للمخزن وتعديل الحسابات.')) return;

    // 1. Stock Update
    setProducts(prevProducts => prevProducts.map(p => {
      const returnedItem = itemsToReturn.find(it => it.productId === p.id && it.quantity > 0);
      if (returnedItem) {
        let piecesToReturn = returnedItem.quantity;
        if (returnedItem.unit === 'دستة') piecesToReturn *= p.conversion.dozenToPiece;
        if (returnedItem.unit === 'كرتونة') piecesToReturn *= p.conversion.cartonToPiece;
        // Don't restock if damaged
        if (returnReason !== 'تالف') {
           return { ...p, stock: p.stock + piecesToReturn };
        }
      }
      return p;
    }));

    // 2. Financial Update
    if (selectedSale.customerId) {
      setCustomers(prevCustomers => prevCustomers.map(c => {
        if (c.id === selectedSale.customerId) {
          const newBalance = c.balance - returnTotal;
          const transaction: AccountTransaction = {
            id: Date.now().toString(),
            date: new Date().toISOString().split('T')[0],
            note: `مرتجع مبيعات فاتورة رقم ${selectedSale.invoiceNumber} (${returnReason})`,
            type: 'إيداع', 
            amount: returnTotal,
            balanceAfter: newBalance
          };
          return {
            ...c,
            balance: newBalance,
            loyaltyPoints: Math.max(0, c.loyaltyPoints - Math.floor(returnTotal / 100)),
            transactions: [transaction, ...c.transactions]
          };
        }
        return c;
      }));
    }

    // 3. Mark as Returned and Create Record
    setSales(prevSales => prevSales.map(s => s.id === selectedSale.id ? { ...s, isReturned: true } : s));

    const newRecord: ReturnRecord = {
      id: Date.now().toString(),
      originalInvoiceNumber: selectedSale.invoiceNumber,
      date: new Date().toISOString().split('T')[0],
      partyName: selectedSale.customerName,
      items: itemsToReturn.filter(i => i.quantity > 0),
      totalRefund: returnTotal,
      reason: returnReason,
      type: 'sales'
    };

    setReturnRecords([newRecord, ...returnRecords]);
    setReturnSuccess(true);
  };

  if (returnSuccess) {
    return (
        <div className="flex flex-col h-[calc(100vh-120px)] items-center justify-center -mt-4 bg-slate-100 rounded-t-[30px] border border-slate-200 shadow-sm animate-in zoom-in">
           <div className="bg-white p-16 rounded-[50px] shadow-xl text-center max-w-md">
              <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                 <CheckCircle size={48} className="animate-bounce" />
              </div>
              <h2 className="text-3xl font-black text-slate-800 mb-2">تم المرتجع بنجاح</h2>
              <p className="text-slate-500 font-bold mb-8">تم تسجيل العملية في سجل المرتجعات وتحديث الأرصدة.</p>
              <button 
                onClick={() => { setReturnSuccess(false); setSelectedSale(null); setInvoiceSearch(''); setItemsToReturn([]); }}
                className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black shadow-lg hover:bg-black transition-all"
              >
                مرتجع جديد
              </button>
           </div>
        </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] font-['Cairo'] -mt-4 bg-slate-100 overflow-hidden text-right rounded-t-[30px] border border-slate-200 shadow-sm">
      {/* Header Tabs */}
      <div className="bg-white px-6 py-4 border-b border-slate-200 shadow-sm z-20 flex justify-between items-center">
         <div className="flex items-center gap-4">
            <div className="bg-red-50 p-3 rounded-2xl text-red-600">
               <RotateCcw size={24} />
            </div>
            <div>
               <h2 className="text-xl font-black text-slate-800">إدارة مرتجع المبيعات</h2>
               <p className="text-[10px] font-bold text-slate-400">تسجيل ومتابعة المردودات من العملاء</p>
            </div>
         </div>
         <div className="flex bg-slate-100 p-1.5 rounded-xl gap-2">
            <button 
              onClick={() => setActiveTab('new')}
              className={`px-6 py-2 rounded-lg text-xs font-black transition-all ${activeTab === 'new' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
               مرتجع جديد
            </button>
            <button 
              onClick={() => setActiveTab('history')}
              className={`px-6 py-2 rounded-lg text-xs font-black transition-all flex items-center gap-2 ${activeTab === 'history' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
               سجل المرتجعات <History size={14}/>
            </button>
         </div>
      </div>

      {activeTab === 'new' ? (
        <>
          {/* Search Content */}
          <div className="p-6 bg-slate-50 border-b border-slate-200">
             <div className="flex gap-3 max-w-2xl mx-auto">
                <div className="relative flex-1">
                   <input 
                     type="text" 
                     placeholder="ابحث برقم الفاتورة (مثال: 1005)..." 
                     value={invoiceSearch}
                     onChange={e => setInvoiceSearch(e.target.value)}
                     onKeyPress={e => e.key === 'Enter' && handleFindInvoice()}
                     className="w-full bg-white border-2 border-slate-200 focus:border-red-500 rounded-xl px-4 py-3 font-bold text-sm outline-none shadow-sm"
                   />
                   <Search className="absolute right-4 top-3.5 text-slate-400" size={18} />
                </div>
                <button onClick={handleFindInvoice} className="bg-slate-900 text-white px-8 rounded-xl font-black text-xs hover:bg-black shadow-lg">بحث</button>
             </div>

             {selectedSale && (
                <div className="mt-6 pt-4 border-t border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-4 animate-in slide-in-from-top-2 max-w-4xl mx-auto">
                   <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                      <p className="text-[9px] font-black text-slate-400 uppercase">رقم الفاتورة</p>
                      <p className="font-black text-slate-800 flex items-center gap-2"><Hash size={14} className="text-blue-500"/> {selectedSale.invoiceNumber}</p>
                   </div>
                   <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                      <p className="text-[9px] font-black text-slate-400 uppercase">العميل</p>
                      <p className="font-black text-slate-800 flex items-center gap-2"><User size={14} className="text-blue-500"/> {selectedSale.customerName}</p>
                   </div>
                   <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                      <p className="text-[9px] font-black text-slate-400 uppercase">التاريخ</p>
                      <p className="font-black text-slate-800 flex items-center gap-2"><Calendar size={14} className="text-blue-500"/> {selectedSale.date}</p>
                   </div>
                   <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                      <p className="text-[9px] font-black text-slate-400 uppercase">طريقة الدفع</p>
                      <p className="font-black text-slate-800 flex items-center gap-2"><ShoppingBag size={14} className="text-blue-500"/> {selectedSale.paymentType}</p>
                   </div>
                </div>
             )}
          </div>

          {/* Items Table */}
          <div className="flex-1 overflow-auto bg-slate-50 p-6">
             {!selectedSale ? (
                <div className="h-full flex flex-col items-center justify-center opacity-30">
                   <RotateCcw size={80} className="mb-4 text-slate-400" />
                   <p className="text-2xl font-black text-slate-500">قم بالبحث عن الفاتورة لبدء عملية المرتجع</p>
                </div>
             ) : (
                <div className="bg-white rounded-[30px] shadow-sm border border-slate-200 overflow-hidden max-w-5xl mx-auto">
                   <table className="w-full text-right border-collapse">
                      <thead className="bg-slate-100 text-[11px] font-black text-slate-600 uppercase">
                         <tr>
                            <th className="py-4 px-6 border-b">الصنف</th>
                            <th className="py-4 px-6 border-b text-center">الوحدة</th>
                            <th className="py-4 px-6 border-b text-center">السعر</th>
                            <th className="py-4 px-6 border-b text-center">الكمية الأصلية</th>
                            <th className="py-4 px-6 border-b text-center w-40">كمية المرتجع</th>
                            <th className="py-4 px-6 border-b text-center">القيمة المستردة</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                         {itemsToReturn.map((item, idx) => (
                            <tr key={idx} className={`hover:bg-red-50/10 transition-colors ${item.quantity > 0 ? 'bg-red-50/30' : ''}`}>
                               <td className="py-4 px-6">
                                  <p className="font-bold text-sm text-slate-800">{item.productName}</p>
                               </td>
                               <td className="py-4 px-6 text-center">
                                  <span className="bg-slate-100 px-2 py-1 rounded text-[10px] font-bold">{item.unit}</span>
                               </td>
                               <td className="py-4 px-6 text-center font-bold text-slate-500">{item.pricePerUnit}</td>
                               <td className="py-4 px-6 text-center font-bold text-slate-800">{selectedSale.items[idx].quantity}</td>
                               <td className="py-4 px-6 text-center">
                                  <input 
                                    type="number" 
                                    value={item.quantity}
                                    onChange={e => updateReturnQuantity(idx, parseFloat(e.target.value) || 0)}
                                    className="w-full bg-slate-50 border border-slate-300 rounded-lg py-2 px-2 text-center font-black text-red-600 focus:border-red-500 outline-none"
                                  />
                               </td>
                               <td className="py-4 px-6 text-center font-black text-red-600">
                                  {item.total.toLocaleString()}
                               </td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             )}
          </div>

          {/* Footer Actions */}
          {selectedSale && (
             <div className="bg-slate-900 text-white px-8 py-5 shrink-0 z-30 shadow-2xl rounded-t-[30px] flex justify-between items-center">
                <div className="flex items-center gap-6">
                   <div className="bg-white/10 px-6 py-3 rounded-2xl border border-white/5">
                      <p className="text-[10px] text-slate-400 uppercase font-black">إجمالي قيمة المرتجع</p>
                      <p className="text-2xl font-black text-red-400">{itemsToReturn.reduce((a,b)=>a+b.total, 0).toLocaleString()} <span className="text-sm">ج.م</span></p>
                   </div>
                   <div className="bg-white/10 px-4 py-2 rounded-2xl border border-white/5 flex flex-col">
                      <label className="text-[10px] text-slate-400 font-bold mb-1">سبب الإرجاع</label>
                      <select 
                        value={returnReason} 
                        onChange={e => setReturnReason(e.target.value)}
                        className="bg-transparent font-bold text-sm outline-none text-white cursor-pointer"
                      >
                         <option value="تالف" className="text-slate-900">تالف / عيوب صناعة</option>
                         <option value="منتهى الصلاحية" className="text-slate-900">منتهى الصلاحية</option>
                         <option value="خطأ في الطلب" className="text-slate-900">خطأ في الطلب</option>
                         <option value="استبدال" className="text-slate-900">استبدال</option>
                         <option value="لم يعجب العميل" className="text-slate-900">لم يعجب العميل</option>
                      </select>
                   </div>
                   {selectedSale.isReturned && (
                      <div className="flex items-center gap-2 text-orange-400 font-bold bg-orange-900/30 px-4 py-2 rounded-xl">
                         <AlertOctagon size={18} />
                         <span className="text-xs">تحذير: تم عمل مرتجع لهذه الفاتورة مسبقاً</span>
                      </div>
                   )}
                </div>
                <div className="flex gap-3">
                   <button onClick={() => setSelectedSale(null)} className="px-6 py-4 bg-white/10 hover:bg-white/20 rounded-2xl font-bold text-xs transition-all">إلغاء</button>
                   <button 
                      onClick={processReturn}
                      disabled={itemsToReturn.every(i => i.quantity === 0)}
                      className="px-10 py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
                   >
                      <Save size={18} /> اعتماد المرتجع
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
                       <th className="px-8 py-5">تاريخ المرتجع</th>
                       <th className="px-8 py-5">رقم الفاتورة الأصلية</th>
                       <th className="px-8 py-5">العميل</th>
                       <th className="px-8 py-5">السبب</th>
                       <th className="px-8 py-5 text-center">الأصناف المردودة</th>
                       <th className="px-8 py-5 text-center">قيمة الاسترداد</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                    {returnRecords.length === 0 ? (
                       <tr>
                          <td colSpan={6} className="py-20 text-center opacity-30">
                             <ClipboardList size={48} className="mx-auto mb-4" />
                             <p className="font-black text-xl">لا يوجد سجلات مرتجعات</p>
                          </td>
                       </tr>
                    ) : (
                       returnRecords.map((record) => (
                          <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                             <td className="px-8 py-6 font-bold text-slate-500 text-xs">{record.date}</td>
                             <td className="px-8 py-6 font-black text-blue-600">{record.originalInvoiceNumber}</td>
                             <td className="px-8 py-6 font-bold text-slate-800">{record.partyName}</td>
                             <td className="px-8 py-6"><span className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-[10px] font-black">{record.reason}</span></td>
                             <td className="px-8 py-6 text-center">
                                <div className="text-xs font-bold text-slate-600">
                                   {record.items.map(i => <div key={i.productId}>{i.productName} ({i.quantity})</div>)}
                                </div>
                             </td>
                             <td className="px-8 py-6 text-center font-black text-red-600">{record.totalRefund.toLocaleString()} ج.م</td>
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

export default Returns;
