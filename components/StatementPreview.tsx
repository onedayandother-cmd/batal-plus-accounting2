
import React, { useRef, useState, useMemo } from 'react';
import { 
  X, Printer, Download, Image as ImageIcon, FileText, 
  User, Truck, Calendar, Search, MapPin, Phone, Filter
} from 'lucide-react';
import { AppSettings, AccountTransaction } from '../types';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface StatementPreviewProps {
  partyName: string;
  partyType: 'customer' | 'supplier';
  balance: number; // Current total balance in system
  transactions: AccountTransaction[];
  settings: AppSettings;
  onClose: () => void;
}

const StatementPreview: React.FC<StatementPreviewProps> = ({ partyName, partyType, balance, transactions, settings, onClose }) => {
  const printRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  
  // Date Filtering State
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(1); // Default to first day of current month
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  // Logic to calculate Statement Data
  const statementData = useMemo(() => {
    // 1. Sort transactions by date ascending (String comparison is safe for YYYY-MM-DD)
    const sorted = [...transactions].sort((a, b) => a.date.localeCompare(b.date));

    // 2. Identify transaction direction based on party type and transaction type
    const getDirection = (t: AccountTransaction) => {
      const type = t.type;
      
      if (partyType === 'customer') {
        // Customer Balance = Receivables (Asset).
        // Debit (+1) Increases Debt: Sales, Withdrawals ('سحب', 'شراء', 'صرف')
        // Credit (-1) Decreases Debt: Payments, Returns, Deposits ('إيداع', 'قبض', 'مرتجع')
        if (['سحب', 'شراء', 'صرف'].includes(type) || (type === 'init' && t.amount > 0)) return 1;
        return -1;
      } else {
        // Supplier Balance = Payables (Liability).
        // Credit (+1) Increases Debt (We owe them): Purchases ('شراء', 'إيداع منه')
        // Debit (-1) Decreases Debt (We paid): Payments, Returns ('سداد للمورد', 'مرتجع', 'صرف')
        if (['شراء', 'إيداع منه', 'قبض'].includes(type)) return 1;
        return -1;
      }
    };

    // 3. Filter and Calculate Opening Balance
    let openingBal = 0;
    
    // Calculate total balance impact before start date
    const previousTrans = sorted.filter(t => t.date < startDate);
    previousTrans.forEach(t => {
      openingBal += (t.amount * getDirection(t));
    });
    
    let runningBal = openingBal;
    const periodTransactions: any[] = [];

    // Process period transactions
    const currentTrans = sorted.filter(t => t.date >= startDate && t.date <= endDate);
    
    currentTrans.forEach(t => {
      const direction = getDirection(t);
      const debit = direction === 1 ? t.amount : 0; // Increases Debt
      const credit = direction === -1 ? t.amount : 0; // Decreases Debt
      
      runningBal += (debit - credit);
      
      periodTransactions.push({
        ...t,
        debit,
        credit,
        balanceAfter: runningBal
      });
    });

    const totalDebit = periodTransactions.reduce((sum, t) => sum + t.debit, 0);
    const totalCredit = periodTransactions.reduce((sum, t) => sum + t.credit, 0);

    return {
      openingBalance: openingBal,
      transactions: periodTransactions,
      closingBalance: runningBal,
      totalDebit,
      totalCredit
    };
  }, [transactions, startDate, endDate, partyType]);

  const exportAsImage = async () => {
    if (!printRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(printRef.current, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
      const link = document.createElement('a');
      link.download = `كشف-حساب-${partyName}-${startDate}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error("Export Error:", err);
    } finally {
      setIsExporting(false);
    }
  };

  const exportAsPDF = async () => {
    if (!printRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(printRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgProps = pdf.getImageProperties(imgData);
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`كشف-حساب-${partyName}-${startDate}.pdf`);
    } catch (err) {
      console.error("PDF Export Error:", err);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    const printContent = document.getElementById('printable-statement');
    const windowUrl = window.open('', '', 'left=0,top=0,width=900,height=900,toolbar=0,scrollbars=0,status=0');
    if (windowUrl && printContent) {
      windowUrl.document.write(`
        <html dir="rtl">
          <head>
            <title>طباعة كشف حساب - ${partyName}</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap" rel="stylesheet">
            <style>
              body { font-family: 'Cairo', sans-serif; margin: 0; padding: 0; }
              @media print {
                .no-print { display: none !important; }
                @page { size: auto; margin: 5mm; }
                body { padding: 10px; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              }
            </style>
          </head>
          <body>
            ${printContent.innerHTML}
            <script>
              window.onload = () => {
                window.print();
                setTimeout(() => window.close(), 500);
              }
            </script>
          </body>
        </html>
      `);
      windowUrl.document.close();
    }
  };

  return (
    <div className="fixed inset-0 z-[550] bg-slate-950/90 backdrop-blur-2xl flex items-center justify-center p-4 overflow-y-auto no-scrollbar font-['Cairo']">
      <div className="my-10 w-full max-w-[900px] animate-in slide-in-from-bottom-10 duration-500">
        
        {/* شريط التحكم والفلترة */}
        <div className="bg-white/10 backdrop-blur-md p-6 rounded-t-[35px] border-x border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6 no-print">
           <div className="flex items-center gap-3 text-white">
              <div className="bg-white/20 p-2 rounded-xl"><Filter size={20}/></div>
              <div className="flex gap-2 items-center bg-slate-900/50 p-1.5 rounded-xl border border-white/10">
                 <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="bg-transparent border-none text-white text-xs font-bold outline-none cursor-pointer" />
                 <span className="text-white/50 text-[10px]">إلى</span>
                 <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="bg-transparent border-none text-white text-xs font-bold outline-none cursor-pointer" />
              </div>
           </div>
           
           <div className="flex gap-2">
              <button onClick={handlePrint} className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold text-xs hover:bg-black transition-all flex items-center gap-2 border border-white/10">
                 <Printer size={16}/> طباعة
              </button>
              <button onClick={exportAsImage} disabled={isExporting} className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs hover:bg-indigo-700 transition-all flex items-center gap-2">
                 <ImageIcon size={16}/> صورة
              </button>
              <button onClick={exportAsPDF} disabled={isExporting} className="px-4 py-2 bg-red-600 text-white rounded-xl font-bold text-xs hover:bg-red-700 transition-all flex items-center gap-2">
                 <Download size={16}/> PDF
              </button>
              <button onClick={onClose} className="p-2 bg-white/5 text-white hover:bg-red-500 rounded-xl transition-all">
                 <X size={20}/>
              </button>
           </div>
        </div>

        {/* جسم الكشف المحاسبي */}
        <div ref={printRef} id="printable-statement" className="bg-white shadow-2xl p-12 text-right text-slate-800 rounded-b-[35px] min-h-[800px]">
          
          {/* هيدر الكشف */}
          <div className="flex justify-between items-start border-b-4 border-slate-900 pb-8 mb-8">
             <div>
                <h1 className="text-3xl font-black tracking-tighter text-slate-900">{settings.storeName}</h1>
                <p className="font-bold opacity-60 mt-1 text-sm">{settings.ownerName} للتجارة والتوزيع</p>
                <div className="mt-4 text-[10px] font-bold space-y-1 opacity-80">
                   {settings.address && <p className="flex items-center gap-2 justify-start"><MapPin size={10}/> {settings.address}</p>}
                   {settings.phone && <p className="flex items-center gap-2 justify-start"><Phone size={10}/> {settings.phone}</p>}
                </div>
             </div>
             <div className="text-left">
                <div className="bg-slate-900 text-white px-6 py-3 rounded-2xl inline-block mb-2 shadow-lg">
                   <h2 className="text-lg font-black uppercase tracking-widest">كشف حساب {partyType === 'customer' ? 'عميل' : 'مورد'}</h2>
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase">فترة الكشف</p>
                <p className="font-black text-xs dir-ltr">From {startDate} To {endDate}</p>
             </div>
          </div>

          {/* بيانات العميل/المورد */}
          <div className="bg-slate-50 p-6 rounded-[30px] border border-slate-100 relative overflow-hidden mb-8 flex justify-between items-center">
             <div>
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">السادة / المحترمين</p>
                <h4 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                   {partyType === 'customer' ? <User className="text-blue-500" size={24}/> : <Truck className="text-indigo-500" size={24}/>}
                   {partyName}
                </h4>
             </div>
             <div className="text-left">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">الرصيد النهائي في {endDate}</p>
                <h3 className={`text-2xl font-black ${statementData.closingBalance > 0 ? (partyType==='customer'?'text-red-600':'text-green-600') : 'text-slate-800'}`}>
                   {statementData.closingBalance.toLocaleString()} <span className="text-xs text-slate-400">ج.م</span>
                </h3>
             </div>
          </div>

          {/* ملخص الحركة */}
          <div className="grid grid-cols-4 gap-4 mb-8">
             <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 text-center">
                <p className="text-[9px] font-black text-blue-400 uppercase mb-1">الرصيد الافتتاحي</p>
                <p className="font-black text-slate-800">{statementData.openingBalance.toLocaleString()}</p>
             </div>
             <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">{partyType==='customer' ? 'مبيعات/مسحوبات (+)' : 'مشتريات/دائن (+)'}</p>
                <p className="font-black text-slate-800">{statementData.totalDebit.toLocaleString()}</p>
             </div>
             <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">{partyType==='customer' ? 'سداد/مرتجع (-)' : 'سداد/مدين (-)'}</p>
                <p className="font-black text-slate-800">{statementData.totalCredit.toLocaleString()}</p>
             </div>
             <div className="p-4 rounded-2xl bg-slate-900 text-white text-center shadow-lg">
                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">رصيد الإغلاق</p>
                <p className="font-black text-white">{statementData.closingBalance.toLocaleString()}</p>
             </div>
          </div>

          {/* جدول الحركات التفصيلي */}
          <div className="mb-10 min-h-[400px]">
             <table className="w-full text-right border-collapse">
                <thead>
                   <tr className="bg-slate-100 text-[10px] font-black text-slate-600 uppercase tracking-widest border-y-2 border-slate-200">
                      <th className="py-3 px-4 w-24">التاريخ</th>
                      <th className="py-3 px-4">البيان / تفاصيل الحركة</th>
                      <th className="py-3 px-4 text-center w-24 bg-slate-200/50">{partyType==='customer' ? 'مدين (+)' : 'دائن (+)'}</th>
                      <th className="py-3 px-4 text-center w-24 bg-slate-200/50">{partyType==='customer' ? 'دائن (-)' : 'مدين (-)'}</th>
                      <th className="py-3 px-4 text-left w-28">الرصيد</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                   {/* Opening Balance Row */}
                   <tr className="bg-blue-50/30 font-bold text-slate-500">
                      <td className="py-4 px-4 text-xs">{startDate}</td>
                      <td className="py-4 px-4">رصيد افتتاحي (مرحل من ما قبل الفترة)</td>
                      <td className="py-4 px-4 text-center">-</td>
                      <td className="py-4 px-4 text-center">-</td>
                      <td className="py-4 px-4 text-left font-black text-slate-800">{statementData.openingBalance.toLocaleString()}</td>
                   </tr>

                   {statementData.transactions.map((t, idx) => (
                     <tr key={idx} className="hover:bg-slate-50 transition-colors font-bold">
                        <td className="py-3 px-4 text-xs text-slate-500 font-mono">{t.date}</td>
                        <td className="py-3 px-4 text-slate-800 text-xs">{t.note}</td>
                        <td className="py-3 px-4 text-center text-slate-700 bg-slate-50/50">
                           {t.debit > 0 ? t.debit.toLocaleString() : '-'}
                        </td>
                        <td className="py-3 px-4 text-center text-slate-700 bg-slate-50/50">
                           {t.credit > 0 ? t.credit.toLocaleString() : '-'}
                        </td>
                        <td className="py-3 px-4 text-left text-slate-900 font-black">
                           {t.balanceAfter.toLocaleString()}
                        </td>
                     </tr>
                   ))}
                   {statementData.transactions.length === 0 && (
                     <tr><td colSpan={5} className="py-10 text-center text-slate-300 italic font-bold">لا يوجد حركات مسجلة خلال هذه الفترة</td></tr>
                   )}
                </tbody>
             </table>
          </div>

          {/* تذييل الكشف */}
          <div className="mt-10 pt-8 border-t-2 border-slate-100 flex justify-between items-center opacity-60">
             <div className="text-right">
                <p className="text-[10px] font-black uppercase">المحاسب المسؤول</p>
                <div className="h-10 mt-2">.....................</div>
             </div>
             <div className="text-center">
                <p className="text-[10px] font-bold">تم الاستخراج بواسطة نظام البطل بلس للمحاسبة</p>
                <p className="text-[8px] uppercase tracking-widest">{new Date().toLocaleString('en-US')}</p>
             </div>
             <div className="text-left">
                <p className="text-[10px] font-black uppercase">المدير المالي / التدقيق</p>
                <div className="h-10 mt-2">.....................</div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default StatementPreview;
