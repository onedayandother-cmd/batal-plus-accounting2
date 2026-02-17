
import React, { useState } from 'react';
import { 
  Plus, Search, Trash2, Edit3, X, Tag,
  Info, Barcode, Layers, DollarSign, Save, 
  Calculator, Sparkles, Palette, Boxes, AlertTriangle, ArrowRightLeft,
  ChevronDown, LayoutGrid, Printer, FileSpreadsheet, Box
} from 'lucide-react';
import { Product, PricingTier, UnitType, AppSettings, Customer } from '../types';
import BarcodeGenerator from './BarcodeGenerator';
import PriceListGenerator from './PriceListGenerator';

interface InventoryProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  categories: string[];
  settings: AppSettings;
  customers: Customer[];
}

const Inventory: React.FC<InventoryProps> = ({ products, setProducts, categories, settings, customers }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [barcodeProduct, setBarcodeProduct] = useState<Product | null>(null);
  const [showPriceList, setShowPriceList] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'basic' | 'pricing' | 'stock'>('basic');

  const initialFormData: Partial<Product> = {
    name: '', brand: '', barcode: '', category: 'عام', 
    costPrice: 0, retailPrice: 0, minStockLevel: 5,
    conversion: { dozenToPiece: 12, cartonToPiece: 24 },
    prices: {
      [UnitType.PIECE]: { [PricingTier.SUPER_WHOLESALE]: 0, [PricingTier.WHOLESALE]: 0, [PricingTier.SEMI_WHOLESALE]: 0, [PricingTier.PHARMACIST]: 0, [PricingTier.RETAIL]: 0 },
      [UnitType.DOZEN]: { [PricingTier.SUPER_WHOLESALE]: 0, [PricingTier.WHOLESALE]: 0, [PricingTier.SEMI_WHOLESALE]: 0, [PricingTier.PHARMACIST]: 0, [PricingTier.RETAIL]: 0 },
      [UnitType.CARTON]: { [PricingTier.SUPER_WHOLESALE]: 0, [PricingTier.WHOLESALE]: 0, [PricingTier.SEMI_WHOLESALE]: 0, [PricingTier.PHARMACIST]: 0, [PricingTier.RETAIL]: 0 },
    },
    stock: 0,
  };

  const [formData, setFormData] = useState<Partial<Product>>(initialFormData);
  
  const applyMarginAndSetPrice = (cost: number, category: string, currentPrices: any) => {
    const margin = settings.categoryMargins?.[category] ?? settings.categoryMargins?.['عام'] ?? 0;
    
    if (cost > 0 && margin > 0) {
        const newRetailPrice = cost * (1 + margin / 100);
        const roundedRetailPrice = parseFloat(newRetailPrice.toFixed(2));
        
        const updatedPrices = JSON.parse(JSON.stringify(currentPrices));
        updatedPrices[UnitType.PIECE][PricingTier.RETAIL] = roundedRetailPrice;
        
        const dozenConversion = formData.conversion?.dozenToPiece || 12;
        const cartonConversion = formData.conversion?.cartonToPiece || 24;

        updatedPrices[UnitType.DOZEN][PricingTier.RETAIL] = roundedRetailPrice * dozenConversion;
        updatedPrices[UnitType.CARTON][PricingTier.RETAIL] = roundedRetailPrice * cartonConversion;
        
        return { retailPrice: roundedRetailPrice, prices: updatedPrices };
    }
    return {};
  };

  const handleCostPriceChange = (costVal: any) => {
      const cost = parseFloat(costVal) || 0;
      let updates: Partial<Product> = { costPrice: cost };

      // Apply margin only if retail price hasn't been set manually
      if (!formData.retailPrice || formData.retailPrice === 0) {
        const priceUpdates = applyMarginAndSetPrice(cost, formData.category || 'عام', formData.prices);
        updates = { ...updates, ...priceUpdates };
      }
      
      setFormData(prev => ({ ...prev, ...updates }));
  };
  
  const handleCategoryChange = (category: string) => {
      const cost = formData.costPrice || 0;
      let updates: Partial<Product> = { category };
      
      const priceUpdates = applyMarginAndSetPrice(cost, category, formData.prices);
      updates = { ...updates, ...priceUpdates };
      
      setFormData(prev => ({ ...prev, ...updates }));
  };

  const handlePriceChange = (unit: UnitType, tier: PricingTier, value: number) => {
    const updatedPrices = JSON.parse(JSON.stringify(formData.prices));
    updatedPrices[unit][tier] = value;
    
    const updates: any = { prices: updatedPrices };
    if (unit === UnitType.PIECE && tier === PricingTier.RETAIL) {
      updates.retailPrice = value;
    }
    
    // Auto-calculate dozen and carton prices from piece price if they are not set
    if (unit === UnitType.PIECE && value > 0) {
        const dozenConversion = formData.conversion?.dozenToPiece || 12;
        const cartonConversion = formData.conversion?.cartonToPiece || 24;

        if (updatedPrices[UnitType.DOZEN][tier] === 0) {
            updatedPrices[UnitType.DOZEN][tier] = value * dozenConversion;
        }
        if (updatedPrices[UnitType.CARTON][tier] === 0) {
            updatedPrices[UnitType.CARTON][tier] = value * cartonConversion;
        }
    }
    
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const syncRetailPrice = (val: number) => {
    const updatedPrices = JSON.parse(JSON.stringify(formData.prices));
    updatedPrices[UnitType.PIECE][PricingTier.RETAIL] = val;

    // Also auto-calculate dozen and carton prices
    if (val > 0) {
        const dozenConversion = formData.conversion?.dozenToPiece || 12;
        const cartonConversion = formData.conversion?.cartonToPiece || 24;

        if (updatedPrices[UnitType.DOZEN][PricingTier.RETAIL] === 0) {
            updatedPrices[UnitType.DOZEN][PricingTier.RETAIL] = val * dozenConversion;
        }
        if (updatedPrices[UnitType.CARTON][PricingTier.RETAIL] === 0) {
            updatedPrices[UnitType.CARTON][PricingTier.RETAIL] = val * cartonConversion;
        }
    }

    setFormData(prev => ({ ...prev, retailPrice: val, prices: updatedPrices }));
  };
  
  const handleConversionChange = (unit: 'dozen' | 'carton', value: number) => {
    const newConversionValue = Math.max(1, value);
    const key = unit === 'dozen' ? 'dozenToPiece' : 'cartonToPiece';
    const updatedConversion = {
        ...(formData.conversion || { dozenToPiece: 12, cartonToPiece: 24 }),
        [key]: newConversionValue
    };
    
    const updatedPrices = JSON.parse(JSON.stringify(formData.prices));

    // Recalculate prices based on new conversion, assuming piece price is the source of truth
    Object.values(PricingTier).forEach(tier => {
        const piecePrice = updatedPrices[UnitType.PIECE][tier as PricingTier] || 0;
        if (piecePrice > 0) {
            if (unit === 'dozen') {
                updatedPrices[UnitType.DOZEN][tier as PricingTier] = piecePrice * newConversionValue;
            } else { // carton
                updatedPrices[UnitType.CARTON][tier as PricingTier] = piecePrice * newConversionValue;
            }
        }
    });

    setFormData(prev => ({
        ...prev,
        conversion: updatedConversion,
        prices: updatedPrices
    }));
  };

  const handleSave = () => {
    if (!formData.name) return alert("يرجى إدخل اسم الصنف");
    if (editingProduct) {
      setProducts(products.map(p => p.id === editingProduct.id ? { ...p, ...formData as Product } : p));
    } else {
      const finalBarcode = formData.barcode || `BP-${Date.now().toString().slice(-8)}`;
      setProducts([...products, { ...(formData as Product), id: Date.now().toString(), barcode: finalBarcode, totalStock: formData.stock || 0 }]);
    }
    setIsAdding(false);
    setEditingProduct(null);
  };

  return (
    <div className="space-y-10 text-right font-['Cairo'] pb-20">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8 bg-white p-10 rounded-[50px] shadow-sm border">
        <div>
           <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3"><Palette className="text-pink-500" /> المخزن والأسعار</h2>
           <p className="text-slate-500 font-bold">إدارة الوحدات وأسعار التجزئة والجملة لكل صنف</p>
        </div>
        <div className="flex bg-slate-100 p-2 rounded-[25px] w-full xl:w-auto gap-2">
           <div className="relative flex-1 xl:w-64">
              <input type="text" placeholder="بحث باسم الصنف..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-white border-none rounded-2xl px-6 py-3 pr-12 outline-none font-bold text-sm shadow-sm" />
              <Search size={18} className="absolute right-4 top-3 text-slate-400" />
           </div>
           <button onClick={() => setShowPriceList(true)} className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black text-xs shadow-xl hover:bg-indigo-700 transition-all flex items-center gap-2">
              <FileSpreadsheet size={18} /> قوائم الأسعار
           </button>
           <button onClick={() => {setFormData(initialFormData); setEditingProduct(null); setIsAdding(true);}} className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black text-xs shadow-xl hover:bg-black transition-all flex items-center gap-2 whitespace-nowrap">
              <Plus size={18} /> إضافة صنف
           </button>
        </div>
      </div>

      <div className="bg-white rounded-[45px] shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-right">
          <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b">
            <tr>
              <th className="px-8 py-6">الصنف / الماركة</th>
              <th className="px-8 py-6 text-center">سعر التجزئة</th>
              <th className="px-8 py-6 text-center">الرصيد المتاح</th>
              <th className="px-8 py-6 text-center">الباركود</th>
              <th className="px-8 py-6 text-left">تحكم</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {products.filter(p => p.name.includes(searchTerm) || p.barcode.includes(searchTerm)).map(p => {
              const isLowStock = p.stock <= p.minStockLevel;
              return (
              <tr key={p.id} className={`transition-all group ${isLowStock ? 'bg-red-50/20 hover:bg-red-50/40' : 'hover:bg-slate-50'}`}>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-3">
                     {isLowStock && <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>}
                     <div>
                        <p className={`font-black ${isLowStock ? 'text-red-700' : 'text-slate-800'}`}>{p.name}</p>
                        <span className="text-[9px] text-pink-500 font-black tracking-widest uppercase">{p.brand}</span>
                     </div>
                  </div>
                </td>
                <td className="px-8 py-6 text-center font-black text-indigo-600">
                  <span className="bg-indigo-50 px-4 py-1 rounded-xl">{p.retailPrice?.toLocaleString()} ج.م</span>
                </td>
                <td className="px-8 py-6 text-center">
                   <div className="flex flex-col items-center gap-1">
                      <span className={`font-black ${isLowStock ? 'text-red-600' : 'text-slate-500'}`}>
                         {p.stock} قطعة
                      </span>
                      {isLowStock && (
                         <span className="flex items-center gap-1 text-[9px] bg-red-100 text-red-600 px-2 py-0.5 rounded-lg font-bold">
                            <AlertTriangle size={10} /> وشك النفاذ
                         </span>
                      )}
                   </div>
                </td>
                <td className="px-8 py-6 text-center font-bold text-xs text-slate-400">
                   <div className="flex flex-col items-center gap-1">
                      <span className="font-mono text-[10px]">{p.barcode}</span>
                      <button onClick={() => setBarcodeProduct(p)} className="text-blue-500 hover:text-blue-700 flex items-center gap-1 text-[9px] font-black uppercase"><Printer size={10}/> طباعة</button>
                   </div>
                </td>
                <td className="px-8 py-6 text-left">
                  <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-all">
                    <button onClick={() => {setFormData(p); setEditingProduct(p); setIsAdding(true);}} className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"><Edit3 size={16}/></button>
                    <button onClick={() => {if(confirm('حذف الصنف نهائياً؟')) setProducts(products.filter(it => it.id !== p.id))}} className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"><Trash2 size={16}/></button>
                  </div>
                </td>
              </tr>
            )})}
          </tbody>
        </table>
      </div>

      {isAdding && (
         <div className="fixed inset-0 z-[200] bg-slate-900/95 backdrop-blur-2xl flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white w-full max-w-5xl rounded-[60px] shadow-2xl overflow-hidden flex flex-col my-8 border-4 border-white animate-in zoom-in">
               <div className="px-10 py-8 border-b flex justify-between items-center bg-slate-50/50">
                  <div className="flex items-center gap-6">
                     <div className="w-16 h-16 bg-slate-900 text-white rounded-[25px] flex items-center justify-center">
                        <Sparkles size={32} className="text-pink-400" />
                     </div>
                     <div>
                        <h2 className="text-2xl font-black text-slate-800">{editingProduct ? 'تعديل بيانات الصنف' : 'إضافة صنف جديد للمخازن'}</h2>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">قم بملء كافة الحقول لضمان دقة التقارير</p>
                     </div>
                  </div>
                  <button onClick={() => setIsAdding(false)} className="p-4 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-full transition-all">
                     <X size={24} />
                  </button>
               </div>

               <div className="flex flex-1 overflow-hidden h-[60vh]">
                  <div className="w-64 bg-white border-l p-8 space-y-3 shrink-0">
                     <TabBtn active={activeTab === 'basic'} onClick={() => setActiveTab('basic')} icon={<Info size={18}/>} label="البيانات العامة" />
                     <TabBtn active={activeTab === 'pricing'} onClick={() => setActiveTab('pricing')} icon={<Calculator size={18}/>} label="جدول الأسعار والوحدات" />
                     <TabBtn active={activeTab === 'stock'} onClick={() => setActiveTab('stock')} icon={<Layers size={18}/>} label="المخزون" />
                  </div>
                  
                  <div className="flex-1 p-10 bg-slate-50/50 overflow-y-auto no-scrollbar">
                     {activeTab === 'basic' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           <ModernInput label="اسم الصنف المطبوع" value={formData.name} onChange={(v:string) => setFormData({...formData, name: v})} icon={<Tag size={16}/>} />
                           <ModernInput label="الماركة / المورد" value={formData.brand} onChange={(v:string) => setFormData({...formData, brand: v})} icon={<Palette size={16}/>} />
                           <ModernInput label="رقم الباركود (اتركه فارغاً للتوليد الآلي)" value={formData.barcode} onChange={(v:string) => setFormData({...formData, barcode: v})} icon={<Barcode size={16}/>} />
                           <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-400 uppercase pr-4">التصنيف الرئيسي</label>
                             <div className="relative">
                                <select value={formData.category} onChange={e => handleCategoryChange(e.target.value)} className="w-full bg-white border-2 border-transparent rounded-[20px] px-6 py-4 font-black outline-none focus:border-pink-500 shadow-sm appearance-none cursor-pointer">
                                   {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                                <ChevronDown className="absolute left-6 top-5 text-slate-300 pointer-events-none" />
                             </div>
                           </div>
                        </div>
                     )}

                     {activeTab === 'pricing' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                           {/* Main Price Card */}
                           <div className="bg-slate-900 p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden group">
                              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 blur-[100px] rounded-full group-hover:bg-pink-600/20 transition-all duration-1000"></div>
                              <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                                 <div>
                                    <h4 className="font-black text-lg mb-2 flex items-center gap-2 text-indigo-300">
                                       <DollarSign size={20} /> السعر الأساسي (قطاعي)
                                    </h4>
                                    <p className="text-slate-400 text-xs font-bold leading-relaxed max-w-xs">
                                       هذا السعر سيتم استخدامه كمرجع لحساب باقي الأسعار تلقائياً إذا لم يتم تحديدها.
                                    </p>
                                 </div>
                                 <div className="relative w-full md:w-auto">
                                    <input 
                                       type="number" 
                                       value={formData.retailPrice || ''} 
                                       onChange={e => syncRetailPrice(parseFloat(e.target.value) || 0)} 
                                       className="w-full md:w-64 bg-white/10 border-2 border-white/20 rounded-[30px] px-8 py-5 font-black text-4xl text-center outline-none focus:border-pink-500 focus:bg-white/20 transition-all placeholder:text-white/20 shadow-inner" 
                                       placeholder="0.00"
                                    />
                                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-sm font-bold opacity-50">ج.م</span>
                                 </div>
                              </div>
                           </div>

                           {/* Modern Pricing Grid */}
                           <div className="space-y-4">
                              <div className="flex items-center justify-between px-2">
                                 <div className="flex items-center gap-3">
                                    <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl"><LayoutGrid size={20} /></div>
                                    <h4 className="font-black text-slate-800">هيكلة الأسعار والوحدات</h4>
                                 </div>
                                 <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">العملة: جنيه مصري</span>
                              </div>
                              
                              <div className="bg-white rounded-[35px] border border-slate-200 overflow-hidden shadow-sm">
                                 <div className="overflow-x-auto">
                                    <table className="w-full text-right min-w-[900px]">
                                       <thead>
                                          <tr className="bg-slate-50 border-b border-slate-100">
                                             <th className="px-6 py-5 text-right font-black text-slate-500 text-xs w-32">الوحدة</th>
                                             <th className="px-3 py-5 text-center font-black text-indigo-600 text-xs bg-indigo-50/30 border-r border-l border-indigo-100 w-32">
                                                <div className="flex flex-col items-center gap-1">
                                                   <span>قطاعي</span>
                                                   <span className="text-[8px] opacity-60 font-bold bg-indigo-100 px-2 rounded-full">السعر الرسمي</span>
                                                </div>
                                             </th>
                                             {/* Other Tiers Header */}
                                             {[PricingTier.PHARMACIST, PricingTier.SEMI_WHOLESALE, PricingTier.WHOLESALE, PricingTier.SUPER_WHOLESALE].map((tier) => (
                                                <th key={tier} className="px-3 py-5 text-center font-bold text-slate-500 text-xs w-32">{tier}</th>
                                             ))}
                                          </tr>
                                       </thead>
                                       <tbody className="divide-y divide-slate-50">
                                          {[UnitType.PIECE, UnitType.DOZEN, UnitType.CARTON].map((unit, idx) => {
                                             const unitIcon = idx === 0 ? <Tag size={14}/> : idx === 1 ? <Layers size={14}/> : <Box size={14}/>;
                                             const unitColor = idx === 0 ? 'bg-blue-500' : idx === 1 ? 'bg-purple-500' : 'bg-orange-500';
                                             
                                             return (
                                             <tr key={unit} className="group hover:bg-slate-50/80 transition-colors">
                                                <td className="px-6 py-4">
                                                   <div className="flex items-center gap-3">
                                                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-sm ${unitColor}`}>
                                                         {unitIcon}
                                                      </div>
                                                      <div>
                                                         <p className="font-black text-slate-700 text-xs">{unit}</p>
                                                         <p className="text-[9px] font-bold text-slate-400">
                                                            {idx === 0 ? '1 قطعة' : idx === 1 ? `x${formData.conversion?.dozenToPiece}` : `x${formData.conversion?.cartonToPiece}`}
                                                         </p>
                                                      </div>
                                                   </div>
                                                </td>
                                                {/* Retail Price Input */}
                                                <td className="px-3 py-4 bg-indigo-50/20 border-r border-l border-indigo-50 group-hover:bg-indigo-50/40 transition-colors">
                                                   <div className="relative group/input">
                                                      <input
                                                         type="number"
                                                         value={formData.prices?.[unit]?.[PricingTier.RETAIL] || ''}
                                                         onChange={e => handlePriceChange(unit, PricingTier.RETAIL, parseFloat(e.target.value) || 0)}
                                                         className="w-full bg-white border-2 border-indigo-200 text-indigo-700 rounded-xl py-3 px-3 text-center font-black text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all shadow-sm"
                                                         placeholder="0"
                                                      />
                                                   </div>
                                                </td>
                                                {/* Other Tiers Inputs */}
                                                {[PricingTier.PHARMACIST, PricingTier.SEMI_WHOLESALE, PricingTier.WHOLESALE, PricingTier.SUPER_WHOLESALE].map((tier) => (
                                                   <td key={tier} className="px-3 py-4">
                                                      <input
                                                         type="number"
                                                         value={formData.prices?.[unit]?.[tier] || ''}
                                                         onChange={e => handlePriceChange(unit, tier, parseFloat(e.target.value) || 0)}
                                                         className="w-full bg-slate-50 border-2 border-transparent text-slate-600 rounded-xl py-3 px-3 text-center font-bold text-sm focus:bg-white focus:border-slate-300 outline-none transition-all hover:bg-slate-100"
                                                         placeholder="-"
                                                      />
                                                   </td>
                                                ))}
                                             </tr>
                                          )})}
                                       </tbody>
                                    </table>
                                 </div>
                              </div>
                           </div>
                           <div className="bg-orange-50 p-8 rounded-[40px] border-2 border-orange-100">
                              <h4 className="font-black text-orange-800 mb-6 flex items-center gap-2"><ArrowRightLeft size={18}/> نسب تحويل العبوات</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                 <div className="space-y-2">
                                    <label className="text-[10px] font-black text-orange-600 uppercase pr-4">سعة الدستة (كم قطعة؟)</label>
                                    <input 
                                      type="number" 
                                      value={formData.conversion?.dozenToPiece} 
                                      onChange={e => handleConversionChange('dozen', parseInt(e.target.value) || 1)}
                                      className="w-full bg-white p-4 rounded-2xl font-black text-center outline-none border-2 border-transparent focus:border-orange-500" 
                                    />
                                 </div>
                                 <div className="space-y-2">
                                    <label className="text-[10px] font-black text-orange-600 uppercase pr-4">سعة الكرتونة (كم قطعة؟)</label>
                                    <input 
                                      type="number" 
                                      value={formData.conversion?.cartonToPiece} 
                                      onChange={e => handleConversionChange('carton', parseInt(e.target.value) || 1)}
                                      className="w-full bg-white p-4 rounded-2xl font-black text-center outline-none border-2 border-transparent focus:border-orange-500" 
                                    />
                                 </div>
                              </div>
                           </div>
                        </div>
                     )}

                     {activeTab === 'stock' && (
                        <div className="space-y-8">
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              <ModernInput label="تكلفة الشراء (للقطعة الواحدة)" type="number" value={formData.costPrice} onChange={handleCostPriceChange} icon={<DollarSign size={16}/>} />
                              <ModernInput label="رصيد المخزن الحالي (قطع)" type="number" value={formData.stock} onChange={(v:any) => setFormData({...formData, stock: parseInt(v) || 0})} icon={<Boxes size={16}/>} />
                              <ModernInput label="حد الطلب (تنبيه النواقص)" type="number" value={formData.minStockLevel} onChange={(v:any) => setFormData({...formData, minStockLevel: parseInt(v) || 0})} icon={<AlertTriangle size={16}/>} />
                           </div>
                        </div>
                     )}
                  </div>
               </div>

               <div className="px-10 py-8 border-t flex justify-end gap-4 bg-white shrink-0">
                  <button onClick={() => setIsAdding(false)} className="px-10 py-4 text-slate-400 font-black hover:text-slate-600 transition-colors">تجاهل</button>
                  <button onClick={handleSave} className="px-20 py-4 bg-slate-900 text-white rounded-3xl font-black shadow-2xl hover:bg-black transition-all flex items-center gap-3">
                     <Save size={18} /> حفظ بيانات الصنف
                  </button>
               </div>
            </div>
         </div>
      )}

      {barcodeProduct && (
        <BarcodeGenerator 
          product={barcodeProduct} 
          storeName={settings.storeName} 
          onClose={() => setBarcodeProduct(null)} 
        />
      )}

      {showPriceList && (
        <PriceListGenerator 
          products={products} 
          categories={categories} 
          customers={customers}
          storeName={settings.storeName}
          onClose={() => setShowPriceList(false)}
        />
      )}
    </div>
  );
};

const TabBtn = ({ active, onClick, icon, label }: any) => (
  <button onClick={onClick} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-xs transition-all ${active ? 'bg-pink-600 text-white shadow-xl translate-x-2' : 'text-slate-400 hover:bg-pink-50'}`}>
    {icon} {label}
  </button>
);

{/* FIX: Renamed `type` prop to `inputType` to avoid potential naming conflicts. */}
const ModernInput = ({ label, value, onChange, type: inputType = "text", icon }: any) => (
  <div className="space-y-2 w-full">
    <label className="text-[10px] font-black text-slate-400 uppercase pr-4 tracking-widest">{label}</label>
    <div className="relative group">
      <input type={inputType} value={value === undefined ? '' : value} onChange={e => onChange(e.target.value)} className="w-full bg-white border-2 border-transparent rounded-[20px] px-6 py-4 pr-12 font-black text-sm outline-none focus:border-pink-500 transition-all shadow-sm" />
      <div className="absolute right-5 top-5 text-slate-300 group-focus-within:text-pink-500 transition-colors">{icon}</div>
    </div>
  </div>
);

export default Inventory;