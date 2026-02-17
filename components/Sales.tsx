
// ... (imports remain the same)
import React, { useState, useEffect, useRef } from 'react';
import { 
  ShoppingCart, Trash2, Printer, CheckCircle, X, Search, 
  Plus, Minus, User, DollarSign, Truck, ScanBarcode,
  Hash, CreditCard, Layers, History, Save, ChevronDown, AlertCircle, ShieldCheck,
  QrCode, Eye, Calculator, Calendar, FileText, Tag, Sparkles
} from 'lucide-react';
import { Product, PricingTier, UnitType, InvoiceItem, Customer, Sale, AppSettings, PaymentMethod, Shift, OrderStatus, AccountTransaction, LoyaltyRank } from '../types';
import ScannerModal from './ScannerModal';
import InvoicePreview from './InvoicePreview';

interface SalesProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  setGlobalSales: React.Dispatch<React.SetStateAction<Sale[]>>;
  settings: AppSettings;
  activeShift?: Shift;
  onComplete: () => void;
}

const Sales: React.FC<SalesProps> = ({ products, setProducts, customers, setCustomers, setGlobalSales, settings, activeShift, onComplete }) => {
  const [activeCartItems, setActiveCartItems] = useState<(InvoiceItem & { barcode?: string })[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedDriverId, setSelectedDriverId] = useState(''); 
  const [paymentType, setPaymentType] = useState<PaymentMethod>('كاش');
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [productSearch, setProductSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [lastSale, setLastSale] = useState<Sale | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);
  
  // حقول إضافية
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [warehouseId, setWarehouseId] = useState('main');
  const [invoiceNote, setInvoiceNote] = useState('');
  const [selectedTierOverride, setSelectedTierOverride] = useState<PricingTier | ''>(''); // لتغيير فئة السعر للفاتورة ككل
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);
  // تحديد فئة السعر: إما المختارة يدوياً للفاتورة أو الافتراضية للعميل أو القطاعي
  const activePricingTier = selectedTierOverride || selectedCustomer?.tier || PricingTier.RETAIL;
  
  const subTotal = activeCartItems.reduce((sum, item) => sum + (item.pricePerUnit * item.quantity), 0);
  const totalDiscount = activeCartItems.reduce((sum, item) => sum + (item.discount || 0), 0);
  const taxAmount = settings.vatEnabled ? ((subTotal - totalDiscount) * settings.vatRate / 100) : 0;
  const netTotal = (subTotal - totalDiscount) + taxAmount;

  const isCreditLimitExceeded = selectedCustomer && paymentType === 'آجل' && (selectedCustomer.balance + (netTotal - paidAmount)) > selectedCustomer.creditLimit;

  // حساب الرصيد المتوقع بعد العملية
  const projectedBalance = selectedCustomer 
    ? selectedCustomer.balance + (paymentType === 'آجل' ? (netTotal - paidAmount) : 0)
    : 0;

  useEffect(() => {
    const draft = localStorage.getItem('draft_sale');
    if (draft) setHasDraft(true);
  }, []);

  // تحديث المبلغ المدفوع تلقائياً عند اختيار كاش
  useEffect(() => {
    if (paymentType === 'كاش') {
      setPaidAmount(netTotal);
    }
  }, [netTotal, paymentType]);

  // تحديث أسعار السلة تلقائياً عند تغيير العميل (وتغير فئة السعر معه)
  useEffect(() => {
    if (activeCartItems.length > 0) {
      setActiveCartItems(prev => prev.map(item => {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          // جلب السعر الجديد بناءً على الفئة النشطة
          const newPrice = product.prices[item.unit]?.[activePricingTier] || item.pricePerUnit;
          // تحديث العنصر فقط إذا تغير السعر لتجنب التحديثات غير الضرورية
          if (item.tier !== activePricingTier || item.pricePerUnit !== newPrice) {
             return {
                ...item,
                tier: activePricingTier,
                pricePerUnit: newPrice,
                total: (newPrice * item.quantity) - (item.discount || 0)
             };
          }
        }
        return item;
      }));
    }
  }, [activePricingTier, selectedCustomerId]); 

  useEffect(() => {
    if (activeCartItems.length > 0) {
      localStorage.setItem('draft_sale', JSON.stringify({ activeCartItems, selectedCustomerId, selectedDriverId, paymentType, paidAmount, invoiceNote }));
    }
  }, [activeCartItems, selectedCustomerId, selectedDriverId, paymentType, paidAmount, invoiceNote]);

  const loadDraft = () => {
    const draft = JSON.parse(localStorage.getItem('draft_sale') || '{}');
    if (draft.activeCartItems) {
      setActiveCartItems(draft.activeCartItems);
      setSelectedCustomerId(draft.selectedCustomerId || '');
      setSelectedDriverId(draft.selectedDriverId || '');
      setPaymentType(draft.paymentType || 'كاش');
      setPaidAmount(draft.paidAmount || 0);
      setInvoiceNote(draft.invoiceNote || '');
    }
    setHasDraft(false);
  };

  const clearDraft = () => {
    localStorage.removeItem('draft_sale');
    setHasDraft(false);
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    setActiveCartItems(prev => prev.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        // عند تغيير الوحدة، قم بتحديث السعر بناءً على فئة السعر الحالية
        if (field === 'unit') {
           const product = products.find(p => p.id === item.productId);
           if (product) {
             updatedItem.pricePerUnit = product.prices[value as UnitType]?.[activePricingTier] || 0;
           }
        }
        // إعادة حساب الإجمالي للصنف
        updatedItem.total = (updatedItem.pricePerUnit * updatedItem.quantity) - (updatedItem.discount || 0);
        return updatedItem;
      }
      return item;
    }));
  };

  const handleCompleteSale = () => {
    if (activeCartItems.length === 0) return;
    if (!activeShift) return alert('يجب فتح وردية أولاً لتنفيذ المبيعات');
    if (isCreditLimitExceeded && !confirm('هذا العميل تجاوز حد الائتمان المسموح به! هل تريد الاستمرار؟')) return;

    const saleId = Date.now().toString();
    const invoiceNumber = `INV-${settings.nextSalesNum}`;
    
    const totalCost = activeCartItems.reduce((acc, item) => acc + (item.costPriceAtSale * item.quantity), 0);
    const profit = (netTotal - taxAmount) - totalCost;

    if (settings.autoInventorySync) {
      setProducts(prevProducts => prevProducts.map(p => {
        const productInCart = activeCartItems.filter(item => item.productId === p.id);
        if (productInCart.length > 0) {
          const totalDeduction = productInCart.reduce((total, item) => {
            let pieces = item.quantity;
            if (item.unit === UnitType.DOZEN) pieces *= p.conversion.dozenToPiece;
            if (item.unit === UnitType.CARTON) pieces *= p.conversion.cartonToPiece;
            return total + pieces;
          }, 0);
          return { 
            ...p, 
            stock: p.stock - totalDeduction,
            totalStock: p.totalStock - totalDeduction
          };
        }
        return p;
      }));
    }

    if (selectedCustomerId) {
      setCustomers(prevCustomers => prevCustomers.map(c => {
        if (c.id === selectedCustomerId) {
          const creditToCharge = paymentType === 'آجل' ? (netTotal - paidAmount) : 0;
          const newBalance = c.balance + creditToCharge;
          const newTotalSpent = c.totalSpent + netTotal;
          
          // تحديث رتبة الولاء تلقائياً
          let newRank = LoyaltyRank.BRONZE;
          if (newTotalSpent >= 100000) newRank = LoyaltyRank.PLATINUM;
          else if (newTotalSpent >= 50000) newRank = LoyaltyRank.GOLD;
          else if (newTotalSpent >= 10000) newRank = LoyaltyRank.SILVER;

          const newTransaction: AccountTransaction = {
            id: Date.now().toString(),
            date: invoiceDate,
            note: `فاتورة مبيعات رقم ${invoiceNumber}`,
            type: 'سحب',
            amount: netTotal,
            balanceAfter: newBalance
          };
          
          return {
            ...c,
            balance: newBalance,
            totalSpent: newTotalSpent,
            loyaltyPoints: c.loyaltyPoints + Math.floor(netTotal / 100),
            loyaltyRank: newRank,
            transactions: [newTransaction, ...c.transactions]
          };
        }
        return c;
      }));
    }

    const qrData = `Store: ${settings.storeName}\nInvoice: ${invoiceNumber}\nDate: ${invoiceDate}\nTotal: ${netTotal} EGP`;

    const newSale: Sale = {
      id: saleId,
      invoiceNumber: invoiceNumber,
      customerName: selectedCustomer ? selectedCustomer.name : 'عميل نقدي',
      customerId: selectedCustomerId,
      date: invoiceDate,
      time: new Date().toLocaleTimeString('ar-EG'),
      items: [...activeCartItems],
      totalAmount: netTotal,
      paidAmount: paidAmount,
      remainingAmount: netTotal - paidAmount,
      previousBalance: selectedCustomer?.balance || 0,
      profit: profit,
      paymentType,
      shiftId: activeShift.id,
      warehouseId: warehouseId,
      status: selectedDriverId ? OrderStatus.OUT_FOR_DELIVERY : OrderStatus.DELIVERED,
      deliveryDriverId: selectedDriverId,
      commissionAmount: selectedDriverId ? (netTotal * 0.02) : 0, 
      qrCodeData: qrData,
    };

    setGlobalSales(prev => [newSale, ...prev]);
    setLastSale(newSale);
    onComplete();
    localStorage.removeItem('draft_sale');
    setIsSuccess(true);
    setActiveCartItems([]);
    setSelectedCustomerId('');
    setPaidAmount(0);
    setInvoiceNote('');
  };

  // ... (rest of the file remains unchanged)
  const addToCart = (product: Product) => {
    const unit = UnitType.PIECE;
    const price = product.prices?.[unit]?.[activePricingTier] || product.retailPrice || 0;
    
    const existingIndex = activeCartItems.findIndex(i => i.productId === product.id && i.unit === unit);
    
    if (existingIndex !== -1) {
      const updated = [...activeCartItems];
      updated[existingIndex].quantity += 1;
      updated[existingIndex].total = (updated[existingIndex].quantity * updated[existingIndex].pricePerUnit) - (updated[existingIndex].discount || 0);
      setActiveCartItems(updated);
    } else {
      setActiveCartItems([...activeCartItems, {
        id: Math.random().toString(36).substr(2, 9),
        productId: product.id,
        productName: product.name,
        barcode: product.barcode,
        unit, 
        tier: activePricingTier, 
        quantity: 1, 
        pricePerUnit: price, 
        discount: 0, 
        total: price, 
        costPriceAtSale: product.costPrice
      }]);
    }
    setProductSearch('');
    setShowSuggestions(false);
    searchInputRef.current?.focus();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] font-['Cairo'] -mt-4 bg-slate-100 overflow-hidden text-right rounded-t-[30px] border border-slate-200 shadow-sm">
      {hasDraft && (
        <div className="bg-amber-100 text-amber-800 px-4 py-1 text-xs font-bold flex justify-between items-center border-b border-amber-200 shrink-0">
           <span className="flex items-center gap-2"><History size={14}/> يوجد فاتورة غير محفوظة</span>
           <div className="flex gap-2">
              <button onClick={loadDraft} className="underline hover:text-amber-900">استعادة</button>
              <button onClick={clearDraft} className="text-amber-600 hover:text-amber-800">تجاهل</button>
           </div>
        </div>
      )}

      {/* Header Section: Data Density Style */}
      <div className="bg-white px-4 py-3 border-b border-slate-300 shadow-sm z-20 shrink-0">
        <div className="flex flex-col gap-3">
          
          {/* Top Row: Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end">
            
            <div className="md:col-span-2 space-y-0.5">
              <label className="text-[10px] font-bold text-slate-500">رقم الفاتورة</label>
              <div className="flex items-center bg-slate-100 border border-slate-300 rounded px-2 h-8">
                <Hash size={14} className="text-slate-400 ml-2"/>
                <span className="font-black text-slate-800 text-sm">{settings.nextSalesNum}</span>
              </div>
            </div>

            <div className="md:col-span-3 space-y-0.5 relative">
              <label className="text-[10px] font-bold text-slate-500">العميل</label>
              {selectedCustomer && selectedCustomer.tier !== PricingTier.RETAIL && !selectedTierOverride && (
                 <div className="absolute -top-3 left-0 bg-indigo-600 text-white text-[9px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 shadow-sm z-10 animate-in zoom-in">
                    <Tag size={10} /> سعر {selectedCustomer.tier}
                 </div>
              )}
              <div className="relative">
                <select 
                  value={selectedCustomerId} 
                  onChange={e => setSelectedCustomerId(e.target.value)} 
                  className="w-full bg-white border border-slate-300 rounded px-2 h-8 text-sm font-bold focus:border-blue-500 outline-none"
                >
                  <option value="">-- عميل نقدي (Direct) --</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <User size={14} className="absolute left-2 top-2 text-slate-400 pointer-events-none"/>
              </div>
            </div>

            <div className="md:col-span-2 space-y-0.5">
              <label className="text-[10px] font-bold text-slate-500">طريقة الدفع</label>
              <select 
                value={paymentType} 
                onChange={e => setPaymentType(e.target.value as PaymentMethod)}
                className="w-full bg-white border border-slate-300 rounded px-2 h-8 text-sm font-bold outline-none"
              >
                <option value="كاش">نقدي (Cash)</option>
                <option value="آجل">آجل (Credit)</option>
                <option value="تحويل بنكي">تحويل بنكي</option>
              </select>
            </div>

            <div className="md:col-span-3 space-y-0.5">
              <label className="text-[10px] font-bold text-slate-500">فئة السعر (تجاوز)</label>
              <div className="relative">
                <select 
                  value={selectedTierOverride} 
                  onChange={e => setSelectedTierOverride(e.target.value as PricingTier)} 
                  className="w-full bg-white border border-slate-300 rounded px-2 h-8 text-xs font-bold outline-none text-blue-700"
                >
                  <option value="">{selectedCustomer ? `الافتراضي (${selectedCustomer.tier})` : 'الافتراضي (قطاعي)'}</option>
                  {Object.values(PricingTier).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <Tag size={14} className="absolute left-2 top-2 text-slate-400 pointer-events-none"/>
              </div>
            </div>

            <div className="md:col-span-2 space-y-0.5">
              <label className="text-[10px] font-bold text-slate-500">التاريخ</label>
              <input 
                type="date" 
                value={invoiceDate}
                onChange={e => setInvoiceDate(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded px-2 h-8 text-sm font-bold outline-none"
              />
            </div>
          </div>

          {/* Bottom Row: Logistics & Details */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end">
             <div className="md:col-span-3 space-y-0.5">
                <label className="text-[10px] font-bold text-slate-500">المخزن</label>
                <select 
                  value={warehouseId} 
                  onChange={e => setWarehouseId(e.target.value)} 
                  className="w-full bg-white border border-slate-300 rounded px-2 h-8 text-xs font-bold outline-none"
                >
                  <option value="main">المخزن الرئيسي</option>
                  {settings.branches.filter(b => b !== 'المركز الرئيسي').map(b => <option key={b} value={b}>{b}</option>)}
                </select>
             </div>

             <div className="md:col-span-3 space-y-0.5">
                <label className="text-[10px] font-bold text-slate-500">المندوب (Delegate)</label>
                <select 
                  value={selectedDriverId} 
                  onChange={e => setSelectedDriverId(e.target.value)} 
                  className="w-full bg-white border border-slate-300 rounded px-2 h-8 text-xs font-bold outline-none"
                >
                  <option value="">-- بدون مندوب --</option>
                  {settings.users.filter(u => u.role === 'DRIVER').map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
             </div>

             <div className="md:col-span-4 space-y-0.5">
                <label className="text-[10px] font-bold text-slate-500">ملاحظات الفاتورة</label>
                <input 
                  type="text" 
                  value={invoiceNote}
                  onChange={e => setInvoiceNote(e.target.value)}
                  placeholder="أضف ملاحظات..."
                  className="w-full bg-white border border-slate-300 rounded px-2 h-8 text-xs outline-none"
                />
             </div>

             <div className="md:col-span-2 flex items-center justify-end h-8">
               {selectedCustomer && (
                 <div className="flex flex-col items-end text-[10px] leading-tight">
                    <span className={`font-black ${selectedCustomer.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        سابق: {selectedCustomer.balance.toLocaleString()}
                    </span>
                    <span className={`font-black ${projectedBalance > 0 ? 'text-red-500' : 'text-green-500'}`}>
                        حالي: {projectedBalance.toLocaleString()}
                    </span>
                 </div>
               )}
             </div>
          </div>

        </div>
      </div>

      {/* Main Content: Search & Grid */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50 overflow-hidden">
        
        {/* Search Bar */}
        <div className="px-4 py-2 bg-white border-b border-slate-300 flex gap-2 items-center shrink-0">
           <div className="relative flex-1 group">
              <input 
                ref={searchInputRef}
                type="text" 
                placeholder="بحث بالاسم أو الباركود (F3)..." 
                value={productSearch} 
                onChange={e => {setProductSearch(e.target.value); setShowSuggestions(true);}} 
                className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-blue-500 rounded px-8 py-2 font-bold text-sm outline-none transition-all h-9" 
              />
              <Search className="absolute right-2 top-2.5 text-slate-400" size={16} />
              
              {showSuggestions && productSearch.length > 0 && (
                <div className="absolute top-full right-0 w-full mt-1 bg-white rounded shadow-xl border border-slate-200 z-[100] max-h-80 overflow-y-auto">
                   {products.filter(p => p.name.includes(productSearch) || p.barcode.includes(productSearch)).slice(0, 10).map(p => (
                     <div 
                      key={p.id} 
                      className="p-2 border-b flex justify-between items-center hover:bg-blue-50 cursor-pointer text-sm" 
                      onClick={() => addToCart(p)}
                     >
                        <div className="text-right">
                           <p className="font-bold text-slate-800">{p.name}</p>
                           <div className="flex gap-2">
                              <span className="text-[10px] text-slate-500">رصيد: {p.stock}</span>
                              <span className="text-[10px] text-green-600">سعر: {(p.prices?.[UnitType.PIECE]?.[activePricingTier] || p.retailPrice).toLocaleString()}</span>
                           </div>
                        </div>
                        <Plus size={16} className="text-blue-500" />
                     </div>
                   ))}
                </div>
              )}
           </div>
           <button onClick={() => setShowScanner(true)} className="px-3 h-9 bg-slate-700 text-white rounded hover:bg-slate-800 transition-all flex items-center gap-2 shadow-sm" title="ماسح الباركود">
              <ScanBarcode size={18} />
           </button>
        </div>

        {/* Data Grid - Desktop Style */}
        <div className="flex-1 overflow-auto bg-white m-2 border border-slate-300 shadow-inner">
           <table className="w-full text-right border-collapse">
              <thead className="bg-slate-200 sticky top-0 z-10 text-[11px] font-bold text-slate-700 uppercase tracking-tight">
                 <tr>
                    <th className="py-2 px-2 border border-slate-300 w-10 text-center">#</th>
                    <th className="py-2 px-2 border border-slate-300">اسم الصنف</th>
                    <th className="py-2 px-2 border border-slate-300 w-24 text-center">الوحدة</th>
                    <th className="py-2 px-2 border border-slate-300 w-20 text-center">الكمية</th>
                    <th className="py-2 px-2 border border-slate-300 w-24 text-center">السعر</th>
                    <th className="py-2 px-2 border border-slate-300 w-20 text-center">خصم</th>
                    <th className="py-2 px-2 border border-slate-300 w-28 text-center">الإجمالي</th>
                    <th className="py-2 px-2 border border-slate-300 w-10 text-center"></th>
                 </tr>
              </thead>
              <tbody className="bg-white">
                 {activeCartItems.map((item, idx) => {
                   const product = products.find(p => p.id === item.productId);
                   const originalPrice = product?.prices[item.unit]?.[PricingTier.RETAIL] || 0;
                   const isDiscounted = item.pricePerUnit < originalPrice;

                   return (
                   <tr key={item.id} className="hover:bg-blue-50 transition-colors text-sm">
                      <td className="py-1 px-2 border border-slate-200 text-center text-slate-500 bg-slate-50">{idx + 1}</td>
                      <td className="py-1 px-2 border border-slate-200">
                         <span className="font-bold text-slate-800 block truncate">{item.productName}</span>
                         {isDiscounted && <span className="text-[10px] text-green-600 flex items-center gap-1"><Sparkles size={8}/> سعر خاص ({item.tier})</span>}
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
                           className="w-full h-full text-center font-bold text-blue-700 outline-none focus:bg-blue-50"
                           onClick={(e) => (e.target as HTMLInputElement).select()}
                         />
                      </td>
                      <td className="py-1 px-2 border border-slate-200 text-center p-0 relative group">
                         <input 
                           type="number" 
                           value={item.pricePerUnit} 
                           onChange={e => updateItem(item.id, 'pricePerUnit', parseFloat(e.target.value) || 0)}
                           className={`w-full h-full text-center font-bold outline-none focus:bg-blue-50 ${isDiscounted ? 'text-green-700' : 'text-slate-700'}`}
                           onClick={(e) => (e.target as HTMLInputElement).select()}
                         />
                         {isDiscounted && (
                            <span className="absolute top-1 right-1 text-[9px] text-slate-400 line-through opacity-60 pointer-events-none">
                               {originalPrice}
                            </span>
                         )}
                      </td>
                      <td className="py-1 px-2 border border-slate-200 text-center p-0">
                         <input 
                           type="number" 
                           value={item.discount || 0} 
                           onChange={e => updateItem(item.id, 'discount', parseFloat(e.target.value) || 0)}
                           className="w-full h-full text-center font-bold text-red-600 outline-none focus:bg-red-50"
                           placeholder="0"
                           onClick={(e) => (e.target as HTMLInputElement).select()}
                         />
                      </td>
                      <td className="py-1 px-2 border border-slate-200 text-center font-black text-slate-900 bg-slate-50">
                         {item.total.toLocaleString()}
                      </td>
                      <td className="py-1 px-2 border border-slate-200 text-center">
                         <button onClick={() => setActiveCartItems(activeCartItems.filter(i => i.id !== item.id))} className="text-slate-400 hover:text-red-500 transition-colors">
                            <Trash2 size={14}/>
                         </button>
                      </td>
                   </tr>
                 )})}
                 {/* Empty rows filler for visual structure */}
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

      {/* Footer Section: Compact Totals */}
      <div className="bg-slate-800 text-white px-6 py-4 shrink-0 z-30 shadow-[0_-4px_10px_rgba(0,0,0,0.1)]">
         <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
            
            {/* Totals Summary */}
            <div className="flex gap-4 items-center text-sm">
               <div className="flex flex-col items-center border-l border-slate-600 pl-4">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">المجموع</span>
                  <span className="font-bold">{subTotal.toLocaleString()}</span>
               </div>
               <div className="flex flex-col items-center border-l border-slate-600 pl-4">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">الخصم</span>
                  <span className="font-bold text-red-400">-{totalDiscount.toLocaleString()}</span>
               </div>
               {settings.vatEnabled && (
                 <div className="flex flex-col items-center border-l border-slate-600 pl-4">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">ضريبة</span>
                    <span className="font-bold text-yellow-400">+{taxAmount.toLocaleString()}</span>
                 </div>
               )}
               <div className="flex flex-col items-center px-4 bg-slate-700 rounded-lg py-1">
                  <span className="text-[10px] text-blue-300 font-bold uppercase">الصافي</span>
                  <span className="text-xl font-black">{netTotal.toLocaleString()}</span>
               </div>
            </div>

            {/* Payment & Save */}
            <div className="flex gap-3 items-end">
               <div className="flex flex-col space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold">المدفوع</label>
                  <input 
                    type="number" 
                    value={paidAmount} 
                    onChange={e => setPaidAmount(parseFloat(e.target.value) || 0)}
                    disabled={paymentType === 'كاش'}
                    className={`w-24 bg-white text-slate-900 rounded px-2 py-1.5 font-bold text-center outline-none ${paymentType === 'كاش' ? 'opacity-70 cursor-not-allowed' : ''}`}
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                  />
               </div>
               <div className="flex flex-col space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold">المتبقي</label>
                  <div className={`w-24 bg-slate-700 text-white rounded px-2 py-1.5 font-bold text-center border border-slate-600 ${(netTotal - paidAmount) > 0 ? 'text-red-300' : 'text-green-300'}`}>
                     {(netTotal - paidAmount).toLocaleString()}
                  </div>
               </div>
               <button 
                 onClick={handleCompleteSale} 
                 disabled={activeCartItems.length === 0}
                 className="h-10 bg-green-600 hover:bg-green-700 text-white px-6 rounded font-bold shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mr-2"
               >
                  <Save size={18} /> حفظ (F10)
               </button>
            </div>
         </div>
      </div>

      {showScanner && <ScannerModal onScan={(b) => {
        const p = products.find(prod => prod.barcode === b);
        if(p) { addToCart(p); setShowScanner(false); }
        else { alert('الباركود غير مسجل'); }
      }} onClose={() => setShowScanner(false)} />}

      {isSuccess && (
        <div className="fixed inset-0 z-[250] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-md rounded-2xl p-8 shadow-2xl text-center animate-in zoom-in">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                 <CheckCircle size={32} />
              </div>
              <h3 className="text-2xl font-black mb-2 text-slate-800">تم الحفظ بنجاح</h3>
              <p className="text-slate-500 font-bold mb-6 text-sm">فاتورة رقم {lastSale?.invoiceNumber} تم ترحيلها.</p>
              <div className="flex gap-3">
                 <button onClick={() => { setIsSuccess(false); setShowPreview(true); }} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all">معاينة وطباعة</button>
                 <button onClick={() => setIsSuccess(false)} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all">جديد</button>
              </div>
           </div>
        </div>
      )}

      {showPreview && lastSale && (
        <InvoicePreview 
          sale={lastSale} 
          settings={settings} 
          onClose={() => setShowPreview(false)} 
        />
      )}
    </div>
  );
};

export default Sales;
