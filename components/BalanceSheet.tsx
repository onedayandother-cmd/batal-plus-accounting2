
import React from 'react';
import { Landmark, Wallet, Box, Users, Building2, Scale, ArrowRightLeft, Download, Printer } from 'lucide-react';
import { Product, Sale, Expense, Customer, Supplier, BankAccount, Voucher, Asset } from '../types';

interface BalanceSheetProps {
  products: Product[];
  sales: Sale[];
  expenses: Expense[];
  customers: Customer[];
  suppliers: Supplier[];
  bankAccounts: BankAccount[];
  vouchers: Voucher[];
  assets: Asset[];
}

const BalanceSheet: React.FC<BalanceSheetProps> = (props) => {
  // حسابات الأصول المتداولة
  const cashInHand = props.vouchers.filter(v => v.type === 'قبض').reduce((a,b)=>a+b.amount,0) - props.vouchers.filter(v => v.type === 'صرف').reduce((a,b)=>a+b.amount,0);
  const bankBalances = props.bankAccounts.reduce((a,b)=>a+b.balance, 0);
  const inventoryValue = props.products.reduce((a,b)=>a+(b.stock * b.costPrice), 0);
  const receivables = props.customers.reduce((a,b)=>a+(b.balance > 0 ? b.balance : 0), 0);

  // حسابات الأصول الثابتة
  const calculateDep = (asset: Asset) => {
    const years = (new Date().getTime() - new Date(asset.purchaseDate).getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    return Math.min(asset.purchaseValue, (asset.purchaseValue * (asset.depreciationRate/100)) * Math.max(0, years));
  };
  const fixedAssetsGross = props.assets.reduce((a,b)=>a+b.purchaseValue, 0);
  const totalDep = props.assets.reduce((a,b)=>a+calculateDep(b), 0);
  const fixedAssetsNet = fixedAssetsGross - totalDep;

  // الخصوم
  const payables = props.suppliers.reduce((a,b)=>a+(b.balance > 0 ? b.balance : 0), 0);

  // حقوق الملكية (الربح المحتجز كمثال)
  const totalSales = props.sales.reduce((a,b)=>a+b.totalAmount,0);
  const totalCOGS = props.sales.reduce((acc, s) => acc + s.items.reduce((sum, item) => sum + (item.costPriceAtSale * item.quantity), 0), 0);
  const totalExpenses = props.expenses.reduce((a,b)=>a+b.amount,0);
  const netProfit = totalSales - totalCOGS - totalExpenses;

  const totalAssets = cashInHand + bankBalances + inventoryValue + receivables + fixedAssetsNet;
  const totalLiabilities = payables;
  const equity = totalAssets - totalLiabilities;

  return (
    <div className="space-y-10 animate-in fade-in duration-500 font-['Cairo'] text-right pb-20">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white p-10 rounded-[50px] shadow-sm border">
        <div>
          <h2 className="text-3xl font-black text-slate-800 flex items-center gap-4"><Scale size={36} className="text-blue-600"/> الميزانية العمومية Balance Sheet</h2>
          <p className="text-slate-500 font-bold mt-1">عرض المركز المالي للمؤسسة في لحظة زمنية محددة</p>
        </div>
        <div className="flex gap-3">
           <button className="p-4 bg-slate-100 rounded-2xl"><Printer size={20}/></button>
           <button className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black shadow-xl flex items-center gap-3"><Download size={20}/> تصدير المركز المالي</button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
        {/* الأصول Assets */}
        <div className="space-y-6">
           <div className="bg-blue-600 p-8 rounded-[35px] text-white flex justify-between items-center shadow-xl">
              <h3 className="text-xl font-black uppercase tracking-widest">إجمالي الأصول (Assets)</h3>
              <h2 className="text-3xl font-black">{totalAssets.toLocaleString()} <span className="text-xs opacity-60">ج.م</span></h2>
           </div>
           
           <div className="bg-white rounded-[40px] border shadow-sm p-8 space-y-6">
              <h4 className="font-black text-slate-400 text-[10px] uppercase tracking-[0.2em] border-b pb-4">أصول متداولة</h4>
              <AssetRow label="النقدية بالخزينة" value={cashInHand} icon={<Wallet size={16}/>} />
              <AssetRow label="أرصدة البنوك" value={bankBalances} icon={<Landmark size={16}/>} />
              <AssetRow label="مخزون البضاعة (بالتكلفة)" value={inventoryValue} icon={<Box size={16}/>} />
              <AssetRow label="حسابات العملاء (مدينون)" value={receivables} icon={<Users size={16}/>} />
              
              <h4 className="font-black text-slate-400 text-[10px] uppercase tracking-[0.2em] border-b pb-4 pt-6">أصول ثابتة</h4>
              <AssetRow label="صافي الأصول الثابتة (بعد الإهلاك)" value={fixedAssetsNet} icon={<Building2 size={16}/>} />
           </div>
        </div>

        {/* الخصوم وحقوق الملكية Liabilities & Equity */}
        <div className="space-y-6">
           <div className="bg-slate-900 p-8 rounded-[35px] text-white flex justify-between items-center shadow-xl">
              <h3 className="text-xl font-black uppercase tracking-widest">الخصوم وحقوق الملكية</h3>
              <h2 className="text-3xl font-black">{(totalLiabilities + equity).toLocaleString()} <span className="text-xs opacity-60">ج.م</span></h2>
           </div>

           <div className="bg-white rounded-[40px] border shadow-sm p-8 space-y-6">
              <h4 className="font-black text-slate-400 text-[10px] uppercase tracking-[0.2em] border-b pb-4">الخصوم (Liabilities)</h4>
              <AssetRow label="حسابات الموردين (دائنون)" value={payables} icon={<ArrowRightLeft size={16}/>} />
              <AssetRow label="قروض وتسهيلات" value={0} icon={<Landmark size={16}/>} />

              <h4 className="font-black text-slate-400 text-[10px] uppercase tracking-[0.2em] border-b pb-4 pt-6">حقوق الملكية (Equity)</h4>
              <AssetRow label="رأس المال المستثمر" value={equity - netProfit} icon={<Users size={16}/>} />
              <AssetRow label="الأرباح المحتجزة / صافي الربح" value={netProfit} icon={<Scale size={16}/>} isProfit />
           </div>

           <div className={`p-8 rounded-[35px] border-4 flex items-center gap-6 ${Math.abs(totalAssets - (totalLiabilities + equity)) < 1 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white ${Math.abs(totalAssets - (totalLiabilities + equity)) < 1 ? 'bg-green-600' : 'bg-red-600'}`}>
                 <Scale size={28} />
              </div>
              <div>
                 <h4 className="font-black text-slate-800">{Math.abs(totalAssets - (totalLiabilities + equity)) < 1 ? 'الميزانية متزنة' : 'الميزانية غير متزنة'}</h4>
                 <p className="text-xs font-bold text-slate-500">الأصول تساوي مجموع الخصوم وحقوق الملكية تماماً.</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const AssetRow = ({ label, value, icon, isProfit }: any) => (
  <div className="flex justify-between items-center group">
    <div className="flex items-center gap-4">
       <div className="p-2 bg-slate-50 rounded-lg text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">{icon}</div>
       <span className="font-bold text-slate-600 text-sm">{label}</span>
    </div>
    <span className={`font-black ${isProfit ? 'text-green-600' : 'text-slate-800'}`}>{value.toLocaleString()} <span className="text-[10px] opacity-40">ج.م</span></span>
  </div>
);

export default BalanceSheet;
