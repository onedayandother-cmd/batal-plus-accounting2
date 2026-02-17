
import React, { useState, useEffect, useRef } from 'react';
import { 
  ShoppingCart, Truck, CheckCircle, ScanBarcode, Plus, Trash2, Search,
  ArrowRight, FilePlus, Wallet, CreditCard, Minus, X, History, Save, Hash,
  User, Calendar, Warehouse, FileText, AlertCircle, Printer, ClipboardList,
  Eye, Filter
} from 'lucide-react';
import { Product, UnitType, InvoiceItem, Supplier, Purchase, AppSettings, PaymentMethod, PricingTier, Shift, AccountTransaction } from '../types';
import ScannerModal from './ScannerModal';
import PurchaseInvoicePreview from './PurchaseInvoicePreview';

interface PurchasesProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  suppliers: Supplier[];
  setSuppliers: React.Dispatch<React.SetStateAction<Supplier[]>>;
  purchases: Purchase[]; // Added prop to view history
  setGlobalPurchases: React.Dispatch<React.SetStateAction<Purchase[]>>;
  settings: AppSettings;
  activeShift?: Shift;
  onComplete: () => void;
}

const Purchases: React.FC<PurchasesProps> = ({ products, setProducts, suppliers, setSuppliers, purchases, setGlobalPurchases, settings, activeShift, onComplete }) => {
  const [activeTab, setActiveTab] = useState<'new' | 'history'>('new');
  
  // New Purchase State
  const [activeCartItems, setActiveCartItems] = useState<(InvoiceItem & { barcode?: string, packSize?: number })[]>([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [paymentType, setPaymentType] = useState<PaymentMethod>('آجل');
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [productSearch, setProductSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);
  const [lastPurchase, setLastPurchase] = useState<Purchase | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [supplierRefNumber, setSupplierRefNumber] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // History State
  const [historySearch, setHistorySearch] = useState('');
  const [viewingHistoryPurchase, setViewingHistoryPurchase] = useState<Purchase | null>(null);

  const selectedSupplier = suppliers.find(s => s.id === selectedSupplierId);
  const subTotal = activeCartItems.reduce((sum, item) => sum + (item.pricePerUnit * item.quantity), 0);
  const totalDiscount = activeCartItems.reduce((sum, item) => sum + (item.discount || 0), 0);
  const totalAmount = subTotal - totalDiscount;

  useEffect(() => {
    const draft = localStorage.getItem('draft_purchase');
    if (draft) setHasDraft(true);
  }, []);

  useEffect(() => {
    if (paymentType === 'كاش') {
        setPaidAmount(totalAmount);
    }
  }, [totalAmount, paymentType]);

  useEffect(() => {
    if (activeCartItems.length > 0) {
      localStorage.setItem('draft_purchase', JSON.stringify({ activeCartItems, selectedSupplierId, paymentType, paidAmount }));
    }
  }, [activeCartItems, selectedSupplierId, paymentType, paidAmount]);

  const loadDraft = () => {
    const draft = JSON.parse(localStorage.getItem('draft_purchase') || '{}');
    if (draft.activeCartItems) {
      setActiveCartItems(draft.activeCartItems);
      setSelectedSupplierId(draft.selectedSupplierId || '');
      setPaymentType(draft.paymentType || 'آجل');
      setPaidAmount(draft.paidAmount || 0);
    }
    setHasDraft(false);
  };

  const clearDraft = () => {
    localStorage.removeItem('draft_purchase');
    setHasDraft(false);
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    setActiveCartItems(prev => prev.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        updatedItem.total = (updatedItem.pricePerUnit * updatedItem.quantity) - (updatedItem.discount || 0);
        return updatedItem;
      }
      return item;
    }));
  };

  const handleCompletePurchase = () => {
    if (activeCartItems.length === 0 || !selectedSupplierId) return;
    
    const purchaseId = Date.now().toString();
    const invoiceNumber = `PUR-${settings.nextPurchasesNum}`;

    if (settings.autoInventorySync) {
      setProducts(prevProducts => prevProducts.map(p => {
        const productItems = activeCartItems.filter(it => it.productId === p.id);
        
        if (productItems.length > 0) {
          const totalPiecesToAdd = productItems.reduce((acc, item) => {
            let qty = item.quantity;
            if (item.unit === UnitType.DOZEN) qty *= p.conversion.dozenToPiece;
            if (item.unit === UnitType.CARTON) qty *= p.conversion.cartonToPiece;
            return acc + qty;
          }, 0);

          const lastItem = productItems[productItems.length - 1];

          return { 
            ...p, 
            stock: p.stock + totalPiecesToAdd, 
            costPrice: lastItem.pricePerUnit 
          }; 
        }
        return p;
      }));
    }

    setSuppliers(prevSuppliers => prevSuppliers.map(s => {
      if (s.id === selectedSupplierId) {
        const debtToSupplier = paymentType === 'آجل' ? (totalAmount - paidAmount) : 0;
        const newBalance = s.balance + debtToSupplier; 
        
        const transaction: AccountTransaction = {
          id: Date.now().toString(),
          date: invoiceDate,
          note: `فاتورة مشتريات رقم ${invoiceNumber} ${supplierRefNumber ? `(مرجع: ${supplierRefNumber})` : ''}`,
          type: 'شراء',
          amount: debtToSupplier,
          balanceAfter: newBalance
        };

        return {
          ...s,
          balance: newBalance,
          transactions: debtToSupplier !== 0 ? [transaction, ...s.transactions] : s.transactions
        };
      }
      return s;
    }));

    const newPurchase: Purchase = {
      id: purchaseId,
      invoiceNumber: invoiceNumber,
      supplierName: selectedSupplier?.name || 'مورد غير معروف',
      date: invoiceDate,
      items: [...activeCartItems],
      totalAmount,
      paymentType,
      branch: settings.currentBranch || 'المركز الرئيسي'
    };
    
    setGlobalPurchases(prev => [newPurchase, ...prev]);
    setLastPurchase(newPurchase);
    onComplete();
    localStorage.removeItem('draft_purchase');
    setIsSuccess(true);
    setActiveCartItems([]);
    setSelectedSupplierId('');
    setSupplierRefNumber('');
  };

  const addToCart = (product: Product) => {
    setActiveCartItems([...activeCartItems, {
      id: Math.random().toString(36).substr(2, 9),
      productId: product.id,
      productName: product.name,
      barcode: product.barcode,
      unit: UnitType.PIECE, 
      tier: PricingTier.RETAIL, 
      quantity: 1, 
      pricePerUnit: product.costPrice, 
      discount: 0, 
      total: product.costPrice, 
      costPriceAtSale: product.costPrice
    }]);
    setProductSearch('');
    setShowSuggestions(false);
    searchInputRef.current?.focus();
  };

  const filteredHistory = purchases.filter(p => 
    p.invoiceNumber.includes(historySearch) || 
    p.supplierName.includes(historySearch) ||
    p.date.includes(historySearch)
  );

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] font-['Cairo'] -mt-4 bg-slate-100 overflow-hidden text-right rounded-t-[30px] border border-slate-200 shadow-sm">
      
      {/* Top Navigation Tabs */}
      <div className="bg-white px-6 py-4 border-b border-slate-200 shadow-sm z-20 flex justify-between items-center">
         <div className="flex items-center gap-4">
            <div className="bg-indigo-50 p-3 rounded-2xl text-indigo-600">
               <Truck size={24} />
            </div>
            <div>
               <h2 className="text-xl font-black text-slate-800">إدارة المشتريات</h2>
               <p className="text-[10px] font-bold text-slate-400">توريد البضاعة وتسجيل الفواتير</p>
            </div>
         </div>
         <div className="flex bg-slate-100 p-1.5 rounded-xl gap-2">
            <button 
              onClick={() => setActiveTab('new')}
              className={`px-6 py-2 rounded-lg text-xs font-black transition-all ${activeTab === 'new' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
               فاتورة توريد جديدة
            </button>
            <button 
              onClick={() => setActiveTab('history')}
              className={`px-6 py-2 rounded-lg text-xs font-black transition-all flex items-center gap-2 ${activeTab === 'history' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
               سجل الفواتير <History size={14}/>
            </button>
         </div>
      </div>

      {activeTab === 'new' ? (
        <>
          {hasDraft && (
            <div className="bg-orange-100 text-orange-800 px-4 py-1 text-xs font-bold flex justify-between items-center border-b border-orange-200 shrink-0">
               <span className="flex items-center gap-2"><History size={14}/> توجد مسودة غير محفوظة</span>
               <div className="flex gap-2">
                  <button onClick={loadDraft} className="underline">استعادة</button>
                  <button onClick={clearDraft} className="text-orange-600">حذف</button>
               </div>
            </div>
          )}

          {/* New Invoice Header */}
          <div className="bg-white px-4 py-3 border-b border-slate-300 shadow-sm z-20 shrink-0">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end">
               
               <div className="md:col-span-3 space-y-0.5">
                  <label className="text-[10px] font-bold text-slate-500">المورد</label>
                  <div className="relative">
                    <select 
                        value={selectedSupplierId} 
                        onChange={e => setSelectedSupplierId(e.target.value)} 
                        className="w-full bg-white border border-slate-300 rounded px-2 h-8 text-sm font-bold focus:border-indigo-500 outline-none"
                    >
                        <option value="">-- اختر المورد --</option>
                        {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    <Truck size={14} className="absolute left-2 top-2 text-slate-400 pointer-events-none"/>
                  </div>
               </div>

               <div className="md:col-span-2 space-y-0.5">
                  <label className="text-[10px] font-bold text-slate-500">رقم الفاتورة (النظام)</label>
                  <div className="flex items-center bg-slate-100 border border-slate-300 rounded px-2 h-8">
                     <Hash size={14} className="text-slate-400 ml-2"/>
                     <span className="font-black text-slate-700 text-sm">{`PUR-${settings.nextPurchasesNum}`}</span>
                  </div>
               </div>

               <div className="md:col-span-2 space-y-0.5">
                  <label className="text-[10px] font-bold text-slate-500">رقم فاتورة المورد</label>
                  <input 
                    type="text" 
                    value={supplierRefNumber}
                    onChange={e => setSupplierRefNumber(e.target.value)}
                    placeholder="مرجع ورقي..."
                    className="w-full bg-white border border-slate-300 rounded px-2 h-8 text-sm font-bold outline-none focus:border-indigo-500"
                  />
               </div>

               <div className="md:col-span-2 space-y-0.5">
                  <label className="text-[10px] font-bold text-slate-500">تاريخ التوريد</label>
                  <input 
                    type="date" 
                    value={invoiceDate}
                    onChange={e => setInvoiceDate(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-2 h-8 text-sm font-bold outline-none"
                  />
               </div>

               <div className="md:col-span-3 space-y-0.5">
                  <label className="text-[10px] font-bold text-slate-500">نوع السداد</label>
                  <select 
                    value={paymentType} 
                    onChange={e => setPaymentType(e.target.value as PaymentMethod)}
                    className="w-full bg-white border border-slate-300 rounded px-2 h-8 text-sm font-bold outline-none"
                  >
                    <option value="آجل">آجل (Credit)</option>
                    <option value="كاش">نقدي (Cash)</option>
                  </select>
               </div>

               {selectedSupplier && (
                 <div className="md:col-span-12 flex gap-4 items-center bg-slate-50 px-2 py-1 rounded border border-slate-200 mt-2">
                    <p className="text-[10px] text-slate-500 font-bold">رصيد المورد السابق: <span className={`font-black ${selectedSupplier.balance > 0 ? 'text-orange-600' : 'text-green-600'}`}>{selectedSupplier.balance.toLocaleString()}</span></p>
                    <div className="h-4 w-px bg-slate-300"></div>
                    <p className="text-[10px] text-slate-500 font-bold">الحساب بعد الفاتورة: <span className="font-black text-slate-800">{(selectedSupplier.balance + (totalAmount - paidAmount)).toLocaleString()}</span></p>
                 </div>
               )}
            </div>
          </div>

          <div className="flex-1 flex flex-col min-w-0 bg-slate-50 overflow-hidden">
              {/* Search Bar */}
              <div className="px-4 py-2 bg-white border-b border-slate-300 flex gap-2 items-center shrink-0">
                 <div className="relative flex-1 group">
                    <input 
                        ref={searchInputRef}
                        type="text" 
                        placeholder="ابحث عن صنف لإضافته (اسم أو باركود)..." 
                        value={productSearch} 
                        onChange={e => {setProductSearch(e.target.value); setShowSuggestions(true);}} 
                        className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-indigo-500 rounded px-8 py-2 font-bold text-sm outline-none transition-all h-9" 
                    />
                    <Search className="absolute right-2 top-2.5 text-slate-400" size={16} />
                    
                    {showSuggestions && productSearch.length > 0 && (
                      <div className="absolute top-full right-0 w-full mt-1 bg-white rounded shadow-xl border border-slate-200 z-[100] max-h-80 overflow-y-auto">
                         {products.filter(p => p.name.includes(productSearch) || p.barcode.includes(productSearch)).slice(0, 10).map(p => (
                           <div key={p.id} className="p-2 border-b flex justify-between items-center hover:bg-indigo-50 cursor-pointer text-sm" onClick={() => addToCart(p)}>
                              <div className="text-right">
                                 <p className="font-bold text-slate-800">{p.name}</p>
                                 <div className="flex gap-2">
                                    <span className="text-[10px] text-slate-500">كود: {p.barcode}</span>
                                    <span className="text-[10px] text-blue-600">تكلفة: {p.costPrice}</span>
                                 </div>
                              </div>
                              <Plus size={16} className="text-indigo-500" />
                           </div>
                         ))}
                      </div>
                    )}
                 </div>
                 <button onClick={() => setShowScanner(true)} className="px-3 h-9 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-all shadow-sm flex items-center gap-2">
                    <ScanBarcode size={18} />
                 </button>
              </div>

              {/* Grid */}
              <div className="flex-1 overflow-auto bg-white m-2 border border-slate-300 shadow-inner">
                 <table className="w-full text-right border-collapse">
                    <thead className="bg-slate-200 sticky top-0 z-10 text-[11px] font-bold text-slate-700 uppercase tracking-tight">
                       <tr>
                          <th className="py-2 px-2 border border-slate-300 w-10 text-center">#</th>
                          <th className="py-2 px-2 border border-slate-300">الصنف الوارد</th>
                          <th className="py-2 px-2 border border-slate-300 w-24 text-center">الوحدة</th>
                          <th className="py-2 px-2 border border-slate-300 w-20 text-center">الكمية</th>
                          <th className="py-2 px-2 border border-slate-300 w-24 text-center">سعر الشراء</th>
                          <th className="py-2 px-2 border border-slate-300 w-20 text-center">خصم</th>
                          <th className="py-2 px-2 border border-slate-300 w-28 text-center">الإجمالي</th>
                          <th className="py-2 px-2 border border-slate-300 w-10 text-center"></th>
                       </tr>
                    </thead>
                    <tbody className="bg-white">
                       {activeCartItems.map((item, idx) => (
                         <tr key={item.id} className="hover:bg-indigo-50 transition-colors text-sm">
                            <td className="py-1 px-2 border border-slate-200 text-center text-slate-500 bg-slate-50">{idx + 1}</td>
                            <td className="py-1 px-2 border border-slate-200">
                               <span className="font-bold text-slate-800 block truncate">{item.productName}</span>
                            </td>
                            <td className="py-1 px-2 border border-slate-200 text-center p-0">
                               <select 
                                value={item.unit}
                                onChange={(e) => updateItem(item.id, 'unit', e.target.value)}
                                className="w-full h-full bg-transparent text-xs font-bold outline-none text-center appearance-none cursor-pointer"
                               >
                                  <option value={UnitType.PIECE}>قطعة</option>
                                  <option value={UnitType.DOZEN}>دستة</option>
                                  <option value={UnitType.CARTON}>كرتونة</option>
                               </select>
                            </td>
                            <td className="py-1 px-2 border border-slate-200 text-center p-0">
                               <input 
                                 type="number" 
                                 min="1"
                                 value={item.quantity} 
                                 onChange={e => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                                 className="w-full h-full text-center font-bold text-indigo-700 outline-none focus:bg-indigo-50"
                               />
                            </td>
                            <td className="py-1 px-2 border border-slate-200 text-center p-0">
                               <input 
                                 type="number" 
                                 value={item.pricePerUnit} 
                                 onChange={e => updateItem(item.id, 'pricePerUnit', parseFloat(e.target.value) || 0)}
                                 className="w-full h-full text-center font-bold text-slate-700 outline-none focus:bg-indigo-50"
                               />
                            </td>
                            <td className="py-1 px-2 border border-slate-200 text-center p-0">
                               <input 
                                 type="number" 
                                 value={item.discount || 0} 
                                 onChange={e => updateItem(item.id, 'discount', parseFloat(e.target.value) || 0)}
                                 className="w-full h-full text-center font-bold text-red-600 outline-none focus:bg-red-50"
                                 placeholder="0"
                               />
                            </td>
                            <td className="py-1 px-2 border border-slate-200 text-center font-black text-slate-900 bg-slate-50">{item.total.toLocaleString()}</td>
                            <td className="py-1 px-2 border border-slate-200 text-center">
                               <button onClick={() => setActiveCartItems(activeCartItems.filter(i => i.id !== item.id))} className="text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={14}/></button>
                            </td>
                         </tr>
                       ))}
                       {/* Filler rows */}
                       {Array.from({ length: Math.max(0, 10 - activeCartItems.length) }).map((_, i) => (
                          <tr key={`empty-${i}`} className="h-8">
                             <td className="border border-slate-100 bg-slate-50"></td>
                             <td className="border border-slate-100"></td>
                             <td className="border border-slate-100"></td>
                             <td className="border border-slate-100"></td>
                             <td className="border border-slate-100"></td>
                             <td className="border border-slate-100"></td>
                             <td className="border border-slate-100 bg-slate-50"></td>
                             <td className="border border-slate-100"></td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
          </div>

          {/* Footer Section */}
          <div className="bg-slate-800 text-white px-6 py-4 shrink-0 z-30 shadow-inner">
             <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
                
                <div className="flex gap-4 items-center text-sm">
                   <div className="flex flex-col items-center border-l border-slate-600 pl-4">
                      <span className="text-[10px] text-indigo-200 font-bold uppercase">إجمالي</span>
                      <span className="font-bold">{subTotal.toLocaleString()}</span>
                   </div>
                   <div className="flex flex-col items-center border-l border-slate-600 pl-4">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">خصم</span>
                      <span className="font-bold text-green-400">-{totalDiscount.toLocaleString()}</span>
                   </div>
                   <div className="flex flex-col items-center px-4 bg-indigo-900 rounded-lg py-1 border border-indigo-700">
                      <span className="text-[10px] text-indigo-300 font-bold uppercase">صافي الفاتورة</span>
                      <span className="text-xl font-black">{totalAmount.toLocaleString()}</span>
                   </div>
                </div>

                <div className="flex gap-3 items-end">
                   <div className="flex flex-col space-y-1">
                      <label className="text-[10px] text-slate-400 font-bold">المدفوع للمورد</label>
                      <input 
                        type="number" 
                        value={paidAmount} 
                        onChange={e => setPaidAmount(parseFloat(e.target.value) || 0)}
                        disabled={paymentType === 'كاش'}
                        className={`w-24 bg-white text-slate-900 rounded px-2 py-1.5 font-bold text-center outline-none ${paymentType === 'كاش' ? 'opacity-70 cursor-not-allowed' : ''}`}
                      />
                   </div>
                   <div className="flex flex-col space-y-1">
                      <label className="text-[10px] text-slate-400 font-bold">متبقي آجل</label>
                      <div className="w-24 bg-slate-700 text-orange-400 rounded px-2 py-1.5 font-bold text-center border border-slate-600">
                         {(totalAmount - paidAmount).toLocaleString()}
                      </div>
                   </div>
                   <button 
                     onClick={handleCompletePurchase} 
                     disabled={activeCartItems.length === 0 || !selectedSupplierId}
                     className="h-10 bg-indigo-500 hover:bg-indigo-600 text-white px-6 rounded font-bold shadow-lg transition-all disabled:opacity-50 flex items-center gap-2 mr-2"
                   >
                      <FilePlus size={18} /> اعتماد (F10)
                   </button>
                </div>
             </div>
          </div>
        </>
      ) : (
        // HISTORY TAB
        <div className="flex-1 overflow-auto bg-slate-50 p-6">
           <div className="bg-white rounded-[30px] shadow-sm border border-slate-200 overflow-hidden h-full flex flex-col">
              <div className="p-6 border-b flex justify-between items-center bg-slate-50/50">
                 <h3 className="font-black text-slate-700">سجل الفواتير السابقة</h3>
                 <div className="relative w-64">
                    <input 
                      type="text" 
                      placeholder="بحث..." 
                      value={historySearch}
                      onChange={e => setHistorySearch(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2 text-xs font-bold outline-none"
                    />
                    <Search className="absolute right-3 top-2.5 text-slate-400" size={14} />
                 </div>
              </div>
              <div className="flex-1 overflow-y-auto no-scrollbar">
                 <table className="w-full text-right">
                    <thead className="bg-slate-100 text-[10px] font-black text-slate-500 uppercase tracking-widest sticky top-0">
                       <tr>
                          <th className="px-6 py-4">رقم الفاتورة</th>
                          <th className="px-6 py-4">المورد</th>
                          <th className="px-6 py-4 text-center">التاريخ</th>
                          <th className="px-6 py-4 text-center">القيمة</th>
                          <th className="px-6 py-4 text-center">النوع</th>
                          <th className="px-6 py-4 text-left">إجراءات</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                       {filteredHistory.map(p => (
                          <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                             <td className="px-6 py-4 font-black text-indigo-600 text-sm">{p.invoiceNumber}</td>
                             <td className="px-6 py-4 font-bold text-slate-700 text-sm">{p.supplierName}</td>
                             <td className="px-6 py-4 text-center text-xs font-bold text-slate-500">{p.date}</td>
                             <td className="px-6 py-4 text-center font-black text-slate-800">{p.totalAmount.toLocaleString()}</td>
                             <td className="px-6 py-4 text-center">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black ${p.paymentType === 'كاش' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                                   {p.paymentType}
                                </span>
                             </td>
                             <td className="px-6 py-4 text-left">
                                <button onClick={() => setViewingHistoryPurchase(p)} className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-all">
                                   <Eye size={16}/>
                                </button>
                             </td>
                          </tr>
                       ))}
                       {filteredHistory.length === 0 && (
                          <tr><td colSpan={6} className="py-20 text-center opacity-30 font-bold">لا توجد فواتير</td></tr>
                       )}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>
      )}

      {showScanner && <ScannerModal onScan={(b) => {
        const p = products.find(prod => prod.barcode === b);
        if(p) { addToCart(p); setShowScanner(false); }
        else { alert('المنتج غير مسجل في النظام'); }
      }} onClose={() => setShowScanner(false)} />}

      {isSuccess && (
        <div className="fixed inset-0 z-[250] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-md rounded-2xl p-8 shadow-2xl text-center animate-in zoom-in border-b-8 border-indigo-600">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                 <CheckCircle size={32} />
              </div>
              <h3 className="text-2xl font-black mb-2 text-slate-800">تم الاستلام</h3>
              <p className="text-slate-500 font-bold mb-6 text-sm">فاتورة وارد رقم {lastPurchase?.invoiceNumber} تم ترحيلها.</p>
              <div className="flex gap-3">
                 <button onClick={() => {setIsSuccess(false); setShowPreview(true);}} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"><Printer size={16}/> طباعة الفاتورة</button>
                 <button onClick={() => setIsSuccess(false)} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all">متابعة</button>
              </div>
           </div>
        </div>
      )}

      {showPreview && lastPurchase && (
        <PurchaseInvoicePreview 
          purchase={lastPurchase} 
          settings={settings} 
          onClose={() => setShowPreview(false)} 
        />
      )}

      {viewingHistoryPurchase && (
        <PurchaseInvoicePreview 
          purchase={viewingHistoryPurchase} 
          settings={settings} 
          onClose={() => setViewingHistoryPurchase(null)} 
        />
      )}
    </div>
  );
};

export default Purchases;
