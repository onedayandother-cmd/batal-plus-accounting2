
import React from 'react';
import { Scale, Download, Printer, Search, ArrowRightLeft, CheckCircle2 } from 'lucide-react';
import { Product, Sale, Expense, Customer, Supplier, BankAccount, Voucher, JournalEntry, Asset } from '../types';

interface TrialBalanceProps {
  products: Product[];
  sales: Sale[];
  expenses: Expense[];
  customers: Customer[];
  suppliers: Supplier[];
  bankAccounts: BankAccount[];
  vouchers: Voucher[];
  journalEntries: JournalEntry[];
  assets: Asset[];
}

const TrialBalance: React.FC<TrialBalanceProps> = (props) => {
  // دالة مساعدة لحساب الإهلاك
  const calculateDepreciation = (asset: Asset) => {
    const purchaseDate = new Date(asset.purchaseDate);
    const today = new Date();
    const yearsElapsed = (today.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    const accumulatedDepreciation = Math.min(asset.purchaseValue, (asset.purchaseValue * (asset.depreciationRate / 100)) * Math.max(0, yearsElapsed));
    return accumulatedDepreciation;
  };

  const totalAssetsOriginal = props.assets.reduce((a,b) => a + b.purchaseValue, 0);
  const totalAssetsAccumulatedDep = props.assets.reduce((a,b) => a + calculateDepreciation(b), 0);

  // تجميع الأرصدة من كافة مصادر النظام
  const accounts = [
    { name: 'الخزينة (النقدية)', debit: props.vouchers.filter(v => v.type === 'قبض').reduce((a,b)=>a+b.amount,0), credit: props.vouchers.filter(v => v.type === 'صرف').reduce((a,b)=>a+b.amount,0) },
    { name: 'العملاء (المدينون)', debit: props.customers.reduce((a,b)=>a+(b.balance > 0 ? b.balance : 0), 0), credit: props.customers.reduce((a,b)=>a+(b.balance < 0 ? Math.abs(b.balance) : 0), 0) },
    { name: 'الموردون (الدائنون)', debit: props.suppliers.reduce((a,b)=>a+(b.balance < 0 ? Math.abs(b.balance) : 0), 0), credit: props.suppliers.reduce((a,b)=>a+(b.balance > 0 ? b.balance : 0), 0) },
    { name: 'المبيعات', debit: 0, credit: props.sales.reduce((a,b)=>a+b.totalAmount,0) },
    { name: 'المصروفات', debit: props.expenses.reduce((a,b)=>a+b.amount,0), credit: 0 },
    { name: 'المخزون (القيمة الشرائية)', debit: props.products.reduce((a,b)=>a+(b.stock*b.costPrice), 0), credit: 0 },
    { name: 'الأصول الثابتة (التكلفة)', debit: totalAssetsOriginal, credit: 0 },
    { name: 'مجمع إهلاك الأصول', debit: 0, credit: totalAssetsAccumulatedDep },
    ...props.bankAccounts.map(b => ({ name: `بنك: ${b.bankName}`, debit: b.balance, credit: 0 }))
  ];

  const totalDebit = accounts.reduce((a, b) => a + b.debit, 0);
  const totalCredit = accounts.reduce((a, b) => a + b.credit, 0);

  return (
    <div className="space-y-10 animate-in fade-in duration-500 font-['Cairo'] text-right pb-20">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white p-10 rounded-[50px] shadow-sm border">
        <div>
          <h2 className="text-3xl font-black text-slate-800 flex items-center gap-4"><Scale size={36} className="text-indigo-600"/> ميزان المراجعة Trial Balance</h2>
          <p className="text-slate-500 font-bold mt-1">نظرة شمولية على توازن كافة الحسابات المالية للمؤسسة</p>
        </div>
        <div className="flex gap-3">
           <button className="p-4 bg-slate-100 rounded-2xl hover:bg-slate-200 transition-colors"><Printer size={20}/></button>
           <button className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black shadow-xl hover:bg-black transition-all flex items-center gap-3"><Download size={20}/> تصدير التقرير</button>
        </div>
      </div>

      <div className="bg-white rounded-[50px] shadow-xl border overflow-hidden">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="bg-slate-900 text-white text-[11px] font-black uppercase tracking-widest">
              <th className="px-10 py-6">اسم الحساب العام</th>
              <th className="px-10 py-6 text-center">أرصدة مدينة (Debit)</th>
              <th className="px-10 py-6 text-center">أرصدة دائنة (Credit)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {accounts.map((acc, idx) => (
              <tr key={idx} className="hover:bg-slate-50/50 transition-colors group font-bold">
                <td className="px-10 py-6 text-slate-800">{acc.name}</td>
                <td className="px-10 py-6 text-center text-blue-600">{acc.debit > 0 ? acc.debit.toLocaleString() : '-'}</td>
                <td className="px-10 py-6 text-center text-red-600">{acc.credit > 0 ? acc.credit.toLocaleString() : '-'}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-slate-50 border-t-4 border-slate-900 font-black text-lg">
              <td className="px-10 py-8 text-slate-900">إجمالي ميزان المراجعة</td>
              <td className="px-10 py-8 text-center text-blue-700">{totalDebit.toLocaleString()} ج.م</td>
              <td className="px-10 py-8 text-center text-red-700">{totalCredit.toLocaleString()} ج.م</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className={`p-8 rounded-[40px] border-4 flex items-center gap-6 ${Math.abs(totalDebit - totalCredit) < 1 ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
         <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${Math.abs(totalDebit - totalCredit) < 1 ? 'bg-green-600' : 'bg-red-600'} text-white`}>
            {Math.abs(totalDebit - totalCredit) < 1 ? <CheckCircle2 size={32}/> : <ArrowRightLeft size={32}/>}
         </div>
         <div>
            <h4 className="text-xl font-black">{Math.abs(totalDebit - totalCredit) < 1 ? 'الميزان متزن' : 'يوجد فارق في الميزان'}</h4>
            <p className="font-bold opacity-80">{Math.abs(totalDebit - totalCredit) < 1 ? 'جميع الحسابات المدينة والدائنة مطابقة تماماً، النظام المالي سليم.' : `هناك فارق قدره ${(totalDebit - totalCredit).toLocaleString()} ج.م يرجى مراجعة القيود اليدوية.`}</p>
         </div>
      </div>
    </div>
  );
};

export default TrialBalance;
