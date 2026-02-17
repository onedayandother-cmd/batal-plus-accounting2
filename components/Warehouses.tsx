
import React, { useState } from 'react';
import { 
  Building2, ArrowRightLeft, PackageCheck, Truck, 
  Plus, Search, ChevronRight, CheckCircle, X, MapPin, 
  Box, History, Warehouse as WarehouseIcon, LayoutGrid,
  TrendingDown, AlertTriangle, ArrowUpRight, Boxes
} from 'lucide-react';
import { Product, AppSettings, UnitType, Warehouse } from '../types';

interface WarehousesProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  warehouses: Warehouse[];
  setWarehouses: React.Dispatch<React.SetStateAction<Warehouse[]>>;
  settings: AppSettings;
}

const Warehouses: React.FC<WarehousesProps> = ({ products, setProducts, warehouses, setWarehouses, settings }) => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'transfers'>('inventory');
  const [selectedLocationId, setSelectedLocationId] = useState('main'); // 'main' or warehouseId
  const [isTransferring, setIsTransferring] = useState(false);
  
  const [transferData, setTransferData] = useState({
    productId: '',
    from: 'main',
    to: '',
    quantity: 0,
    unit: UnitType.PIECE
  });

  const locations = [
    { id: 'main', name: 'المخزن الرئيسي', isVehicle: false, driverName: 'مدير المستودع' },
    ...warehouses
  ];

  const currentLocation = locations.find(l => l.id === selectedLocationId);

  const formatStockUnits = (totalPieces: number, product: Product) => {
    const cartonRatio = product.conversion.cartonToPiece || 24;
    const cartons = Math.floor(totalPieces / cartonRatio);
    const pieces = totalPieces % cartonRatio;

    return (
      <div className="flex gap-1 items-center justify-center font-black">
        {cartons > 0 && <span className="bg-indigo-600 text-white px-2 py-0.5 rounded text-[10px]">{cartons} ك</span>}
        <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded text-[10px]">{pieces} ق</span>
      </div>
    );
  };

  const handleTransfer = () => {
    if (!transferData.productId || transferData.quantity <= 0 || !transferData.to) return;
    
    const product = products.find(p => p.id === transferData.productId);
    if (!product) return;

    let piecesToMove = transferData.quantity;
    if (transferData.unit === UnitType.DOZEN) piecesToMove *= product.conversion.dozenToPiece;
    if (transferData.unit === UnitType.CARTON) piecesToMove *= product.conversion.cartonToPiece;

    if (transferData.from === 'main') {
        if (product.stock < piecesToMove) return alert('الكمية المطلوبة غير متوفرة في المخزن الرئيسي');
        
        // 1. خصم من الرئيسي
        setProducts(prev => prev.map(p => p.id === product.id ? {...p, stock: p.stock - piecesToMove} : p));
        
        // 2. إضافة للهدف
        setWarehouses(prev => prev.map(w => {
            if (w.id === transferData.to) {
                const newStock = { ...w.stock };
                newStock[product.id] = (newStock[product.id] || 0) + piecesToMove;
                return { ...w, stock: newStock };
            }
            return w;
        }));
    }

    setIsTransferring(false);
    setTransferData({ productId: '', from: 'main', to: '', quantity: 0, unit: UnitType.PIECE });
    alert('تم التحويل بنجاح');
  };

  return (
    <div className="space-y-10 font-['Cairo'] text-right animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 bg-white p-10 rounded-[50px] shadow-sm border">
        <div>
          <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3">
             <WarehouseIcon className="text-pink-500" /> إدارة المخزون اللوجستي
          </h2>
          <p className="text-slate-500 font-bold">توزيع البضاعة بين المخزن الرئيسي وسيارات التوزيع</p>
        </div>
        <div className="flex bg-slate-100 p-2 rounded-[25px] shadow-inner gap-2">
           <button onClick={() => setIsTransferring(true)} className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black text-xs shadow-xl hover:bg-black transition-all flex items-center gap-2">
              <ArrowRightLeft size={18} /> تحويل بضاعة
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* قائمة المواقع */}
        <div className="xl:col-span-1 space-y-4">
           <div className="bg-slate-900 p-8 rounded-[40px] text-white space-y-6 shadow-2xl">
              <h3 className="text-lg font-black flex items-center gap-3"><MapPin className="text-pink-500" /> مواقع التخزين</h3>
              <div className="space-y-2">
                 {locations.map(loc => (
                   <button 
                    key={loc.id} 
                    onClick={() => setSelectedLocationId(loc.id)}
                    className={`w-full p-5 rounded-2xl font-black text-xs text-right transition-all flex items-center justify-between group ${selectedLocationId === loc.id ? 'bg-pink-600 text-white shadow-xl' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
                   >
                     <div className="flex items-center gap-3">
                        {loc.isVehicle ? <Truck size={16} /> : <Building2 size={16} />}
                        {loc.name}
                     </div>
                     {selectedLocationId === loc.id && <CheckCircle size={14} />}
                   </button>
                 ))}
              </div>
           </div>
           
           <div className="bg-white p-8 rounded-[40px] border shadow-sm space-y-4">
              <h4 className="text-sm font-black text-slate-800">إحصاء سريع للفرع</h4>
              <div className="p-4 bg-blue-50 rounded-2xl">
                 <p className="text-[10px] font-black text-blue-500 uppercase">إجمالي الأصناف المتوفرة</p>
                 <p className="text-2xl font-black text-blue-700">
                    {selectedLocationId === 'main' 
                      ? products.filter(p => p.stock > 0).length 
                      // Fix: Added explicit type cast to resolve 'unknown' comparison error
                      : Object.values(warehouses.find(w => w.id === selectedLocationId)?.stock || {}).filter((q: any) => (q as number) > 0).length
                    }
                 </p>
              </div>
           </div>
        </div>

        {/* محتويات الموقع المختار */}
        <div className="xl:col-span-3 bg-white rounded-[50px] shadow-sm border overflow-hidden flex flex-col">
           <div className="p-8 border-b bg-slate-50/50 flex justify-between items-center">
              <div>
                 <h3 className="text-xl font-black text-slate-800">جرد: {currentLocation?.name}</h3>
                 <p className="text-xs text-slate-400 font-bold uppercase mt-1">المسؤول: {currentLocation?.driverName}</p>
              </div>
              <div className="relative w-64">
                 <input type="text" placeholder="بحث في الجرد..." className="w-full bg-white border-none rounded-xl px-10 py-2.5 text-xs font-bold outline-none shadow-sm" />
                 <Search size={16} className="absolute right-3 top-2.5 text-slate-300" />
              </div>
           </div>
           
           <div className="flex-1 overflow-y-auto no-scrollbar">
              <table className="w-full text-right">
                 <thead>
                    <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b">
                       <th className="px-8 py-6">اسم الصنف</th>
                       <th className="px-8 py-6 text-center">الرصيد (ك/ق)</th>
                       <th className="px-8 py-6 text-center">إجمالي القطع</th>
                       <th className="px-8 py-6 text-center">القيمة التقديرية</th>
                       <th className="px-8 py-6 text-left">الحالة</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {products.map(p => {
                      const qty = selectedLocationId === 'main' ? p.stock : (warehouses.find(w => w.id === selectedLocationId)?.stock[p.id] || 0);
                      if (qty === 0) return null;
                      return (
                        <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                           <td className="px-8 py-6">
                              <span className="font-black text-slate-800 block text-sm">{p.name}</span>
                              <span className="text-[9px] text-pink-500 font-black uppercase">{p.brand}</span>
                           </td>
                           <td className="px-8 py-6 text-center">
                              {formatStockUnits(qty, p)}
                           </td>
                           <td className="px-8 py-6 text-center font-black text-slate-500">{qty}</td>
                           <td className="px-8 py-6 text-center font-black text-indigo-600">{(qty * p.costPrice).toLocaleString()} ج.م</td>
                           <td className="px-8 py-6 text-left">
                              <span className={`px-4 py-1.5 rounded-full text-[9px] font-black ${qty > p.minStockLevel ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                 {qty > p.minStockLevel ? 'كافٍ' : 'منخفض'}
                              </span>
                           </td>
                        </tr>
                      );
                    })}
                 </tbody>
              </table>
              {/* Fix: Added explicit type cast to resolve 'unknown' comparison error */}
              {((selectedLocationId === 'main' ? products.filter(p => p.stock > 0).length : Object.values(warehouses.find(w => w.id === selectedLocationId)?.stock || {}).filter((q: any) => (q as number) > 0).length) === 0) && (
                <div className="py-32 text-center opacity-20">
                   <Boxes size={80} className="mx-auto mb-4" />
                   <p className="text-2xl font-black italic">لا توجد بضاعة في هذا الموقع حالياً</p>
                </div>
              )}
           </div>
        </div>
      </div>

      {/* مودال التحويل */}
      {isTransferring && (
        <div className="fixed inset-0 z-[300] bg-slate-900/80 backdrop-blur-xl flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-2xl rounded-[50px] overflow-hidden shadow-2xl animate-in zoom-in border-4 border-white">
              <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
                 <h2 className="text-2xl font-black flex items-center gap-3"><ArrowRightLeft /> تحويل بضاعة داخلي</h2>
                 <button onClick={() => setIsTransferring(false)} className="p-2 hover:bg-white/10 rounded-full transition-all"><X /></button>
              </div>
              <div className="p-10 space-y-6">
                 <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 pr-4">الصنف المراد تحويله</label>
                    <select 
                      value={transferData.productId} 
                      onChange={e => setTransferData({...transferData, productId: e.target.value})}
                      className="w-full bg-slate-50 p-4 rounded-2xl font-black outline-none border-none"
                    >
                       <option value="">-- اختر من المخزن الرئيسي --</option>
                       {products.map(p => <option key={p.id} value={p.id}>{p.name} (رصيد: {p.stock})</option>)}
                    </select>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-xs font-black text-slate-400 pr-4">إلى (الوجهة)</label>
                       <select 
                        value={transferData.to} 
                        onChange={e => setTransferData({...transferData, to: e.target.value})}
                        className="w-full bg-slate-50 p-4 rounded-2xl font-black outline-none border-none"
                       >
                          <option value="">-- اختر سيارة/مخزن --</option>
                          {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-xs font-black text-slate-400 pr-4">الوحدة</label>
                       <select 
                        value={transferData.unit} 
                        onChange={e => setTransferData({...transferData, unit: e.target.value as any})}
                        className="w-full bg-slate-50 p-4 rounded-2xl font-black outline-none border-none"
                       >
                          <option value={UnitType.PIECE}>قطعة</option>
                          <option value={UnitType.DOZEN}>دستة</option>
                          <option value={UnitType.CARTON}>كرتونة</option>
                       </select>
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 pr-4">الكمية</label>
                    <input 
                      type="number" 
                      value={transferData.quantity || ''} 
                      onChange={e => setTransferData({...transferData, quantity: parseInt(e.target.value) || 0})}
                      className="w-full bg-slate-100 p-6 rounded-3xl font-black text-3xl text-center outline-none border-2 border-transparent focus:border-pink-500" 
                      placeholder="0"
                    />
                 </div>

                 <button 
                  onClick={handleTransfer}
                  className="w-full py-6 bg-slate-900 text-white rounded-[30px] font-black text-xl shadow-2xl hover:bg-black transition-all flex items-center justify-center gap-3"
                 >
                    <CheckCircle /> تنفيذ التحويل المخزني
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Warehouses;
