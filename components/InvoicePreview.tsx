
import React, { useRef, useState } from 'react';
import { 
  QrCode, Phone, MapPin, Store, Calendar, Hash, 
  FileText, User, CreditCard, Award, ArrowLeftRight,
  Printer, X, Share2, Download, CheckCircle2, MessageCircle, Image as ImageIcon,
  Copy, Share, Wallet, TrendingUp
} from 'lucide-react';
import { Sale, AppSettings, PrintTemplate, UnitType } from '../types';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface InvoicePreviewProps {
  sale: Sale;
  settings: AppSettings;
  onClose: () => void;
}

const InvoicePreview: React.FC<InvoicePreviewProps> = ({ sale, settings, onClose }) => {
  const printRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const getTemplateConfig = () => {
    switch (settings.selectedTemplate) {
      case PrintTemplate.MODERN:
        return {
          container: "bg-white shadow-2xl overflow-hidden text-right text-slate-800 rounded-b-[40px] print:shadow-none print:rounded-none print:overflow-visible",
          headerWrapper: "bg-slate-900 text-white p-12 rounded-t-[40px] print:bg-white print:text-black print:p-0 print:border-b-2 print:border-black print:rounded-none",
          headerContent: "flex justify-between items-start print:flex-row",
          storeInfoClass: "",
          invoiceInfoClass: "text-left space-y-6 print:text-right print:space-y-2",
          tableHead: "bg-slate-50 text-slate-500 font-black text-[10px] uppercase rounded-2xl overflow-hidden print:bg-transparent print:text-black print:border-b-2 print:border-black",
          footer: "bg-slate-50 p-10 rounded-b-[40px] border-t print:bg-transparent print:p-0 print:mt-4"
        };
      case PrintTemplate.CLASSIC:
        return {
          container: "bg-white shadow-none text-right text-black p-8 font-serif print:p-0",
          headerWrapper: "border-b-4 border-double border-black pb-8 mb-8 print:mb-4",
          headerContent: "flex flex-col items-center text-center gap-6 print:flex-row print:justify-between print:text-right",
          storeInfoClass: "flex flex-col items-center print:items-start",
          invoiceInfoClass: "w-full flex justify-between border-t-2 border-black pt-6 mt-4 print:border-0 print:mt-0 print:block print:w-auto",
          tableHead: "border-y-2 border-black bg-white text-black font-bold uppercase text-xs",
          footer: "border-t-4 border-double border-black p-8 text-center mt-8 print:border-t-2 print:mt-4 print:p-2"
        };
      case PrintTemplate.COMPACT:
        return {
          container: "bg-white shadow-sm text-right text-slate-900 text-sm max-w-[500px] mx-auto print:max-w-full print:shadow-none",
          headerWrapper: "p-6 border-b border-slate-300 border-dashed print:p-2",
          headerContent: "flex flex-col gap-4 text-center print:flex-row print:justify-between print:text-right",
          storeInfoClass: "",
          invoiceInfoClass: "flex justify-between font-mono text-xs border-t border-dashed border-slate-300 pt-2 print:border-0 print:block",
          tableHead: "bg-slate-100 text-slate-800 font-bold text-[9px] border-b border-slate-300 print:bg-transparent",
          footer: "p-4 border-t border-slate-300 border-dashed text-center text-xs mt-4 print:p-2"
        };
      default:
        // Default Modern
        return {
          container: "bg-white shadow-2xl overflow-hidden text-right text-slate-800 rounded-b-[40px] print:shadow-none print:rounded-none print:overflow-visible",
          headerWrapper: "bg-slate-900 text-white p-12 rounded-t-[40px] print:bg-white print:text-black print:p-0 print:border-b-2 print:border-black print:rounded-none",
          headerContent: "flex justify-between items-start print:flex-row",
          storeInfoClass: "",
          invoiceInfoClass: "text-left space-y-6 print:text-right print:space-y-2",
          tableHead: "bg-slate-50 text-slate-500 font-black text-[10px] uppercase rounded-2xl overflow-hidden print:bg-transparent print:text-black print:border-b-2 print:border-black",
          footer: "bg-slate-50 p-10 rounded-b-[40px] border-t print:bg-transparent print:p-0 print:mt-4"
        };
    }
  };

  const config = getTemplateConfig();
  const vatAmount = settings.vatEnabled ? (sale.totalAmount * settings.vatRate / 100) : 0;
  const grandTotal = sale.totalAmount + vatAmount;
  
  // حساب الرصيد الحالي (النهائي) للعميل بعد هذه الفاتورة
  // الرصيد السابق + المتبقي من هذه الفاتورة
  const currentCustomerBalance = (sale.previousBalance || 0) + sale.remainingAmount;

  // Configuration for columns
  const columns = settings.invoiceColumns?.[settings.selectedTemplate] || { 
    product: true, quantity: true, unit: true, price: true, discount: true, total: true 
  };

  // تصدير كصورة للتحميل
  const exportAsImage = async () => {
    if (!printRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      const link = document.createElement('a');
      link.download = `فاتورة-${sale.invoiceNumber}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error("Image Export Error:", err);
    } finally {
      setIsExporting(false);
    }
  };

  // تصدير كـ PDF للتحميل
  const exportAsPDF = async () => {
    if (!printRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(printRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`فاتورة-${sale.invoiceNumber}.pdf`);
    } catch (err) {
      console.error("PDF Export Error:", err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleSmartShare = async () => {
    if (!printRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(printRef.current, { scale: 2 });
      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
      if (!blob) return;

      const file = new File([blob], `invoice-${sale.invoiceNumber}.png`, { type: 'image/png' });
      
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `فاتورة رقم ${sale.invoiceNumber}`,
          text: `فاتورة مبيعات من ${settings.storeName}`
        });
      } else {
        const message = `*فاتورة مبيعات رقم: ${sale.invoiceNumber}*\n*من: ${settings.storeName}*\n\nالعميل: ${sale.customerName}\nالإجمالي: ${grandTotal.toLocaleString()} ج.م\nالتاريخ: ${sale.date}\n\nشكراً لتعاملكم معنا!`;
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
      }
    } catch (err) {
      console.error("Share Error:", err);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    const printContent = document.getElementById('printable-area');
    const windowUrl = window.open('', '', 'left=0,top=0,width=900,height=900,toolbar=0,scrollbars=0,status=0');
    if (windowUrl && printContent) {
      windowUrl.document.write(`
        <html dir="rtl">
          <head>
            <title>طباعة فاتورة - ${sale.invoiceNumber}</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap" rel="stylesheet">
            <style>
              body { font-family: 'Cairo', sans-serif; margin: 0; padding: 0; }
              @media print {
                .no-print { display: none !important; }
                @page { size: auto; margin: 5mm; }
                body { padding: 10px; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                table { page-break-inside: auto; width: 100%; border-collapse: collapse; }
                tr { page-break-inside: avoid; page-break-after: auto; }
                thead { display: table-header-group; }
                tfoot { display: table-footer-group; }
                div { overflow: visible !important; box-shadow: none !important; }
                .bg-slate-900 { background-color: #0f172a !important; color: white !important; }
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

  const StoreInfoBlock = () => (
    <div className={config.storeInfoClass}>
      <h1 className={`font-black tracking-tighter ${settings.selectedTemplate === PrintTemplate.MODERN ? 'text-6xl' : 'text-3xl'}`}>{settings.storeName}</h1>
      <p className="font-bold opacity-70 mt-2 text-lg">{settings.ownerName} للتجارة والتوزيع</p>
      <div className="mt-4 space-y-1 text-sm font-bold opacity-80">
         {settings.address && <p className="flex items-center gap-2 justify-center lg:justify-start"><MapPin size={14}/> {settings.address}</p>}
         {settings.phone && <p className="flex items-center gap-2 justify-center lg:justify-start"><Phone size={14}/> {settings.phone}</p>}
         {settings.taxNumber && <p className="text-xs">الرقم الضريبي: {settings.taxNumber}</p>}
      </div>
    </div>
  );

  const InvoiceMetaBlock = () => (
    <div className={config.invoiceInfoClass}>
       {settings.selectedTemplate === PrintTemplate.CLASSIC ? (
         <>
           <div><strong>رقم الفاتورة:</strong> {sale.invoiceNumber}</div>
           <div><strong>التاريخ:</strong> {sale.date}</div>
           <div><strong>الوقت:</strong> {sale.time}</div>
         </>
       ) : settings.selectedTemplate === PrintTemplate.COMPACT ? (
         <>
           <span>#{sale.invoiceNumber}</span>
           <span>{sale.date} {sale.time}</span>
         </>
       ) : (
         <>
            <div className="bg-white/10 p-8 rounded-[35px] inline-block min-w-[240px] shadow-inner print:p-2 print:bg-transparent print:border-2 print:border-black print:text-black">
               <p className="text-[11px] font-black uppercase opacity-60 mb-1 tracking-[0.2em] print:text-black">فاتورة مبيعات رقم</p>
               <h2 className="text-4xl font-black">{sale.invoiceNumber}</h2>
            </div>
            <div className="text-sm font-black opacity-60 space-y-1 pr-4 print:text-black print:opacity-100">
               <p><Calendar size={14} className="inline ml-2 text-blue-400 print:text-black"/> {sale.date}</p>
               <p><Hash size={14} className="inline ml-2 text-blue-400 print:text-black"/> {sale.time}</p>
            </div>
         </>
       )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-[550] bg-slate-950/95 backdrop-blur-3xl flex items-center justify-center p-4 overflow-y-auto no-scrollbar font-['Cairo']">
      <div className="my-10 w-full max-w-[900px] animate-in slide-in-from-bottom-12 duration-500">
        
        {/* Toolbar */}
        <div className="bg-white/10 backdrop-blur-xl p-6 rounded-t-[40px] border-x border-t border-white/10 flex flex-wrap justify-between items-center gap-6 no-print">
           <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-2xl rotate-3">
                 <FileText size={28} />
              </div>
              <div>
                <h3 className="text-white font-black text-lg">مركز الفواتير الرقمية</h3>
                <p className="text-[10px] text-blue-300 font-bold uppercase tracking-widest">تصدير، طباعة، ومشاركة سريعة</p>
              </div>
           </div>
           <div className="flex flex-wrap gap-3">
              <button onClick={handlePrint} className="px-6 py-3 bg-white/10 text-white rounded-2xl font-black text-xs hover:bg-white/20 transition-all flex items-center gap-2 border border-white/5">
                 <Printer size={18}/> طباعة
              </button>
              <button onClick={exportAsImage} disabled={isExporting} className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/20">
                 <ImageIcon size={18}/> صورة
              </button>
              <button onClick={exportAsPDF} disabled={isExporting} className="px-6 py-3 bg-red-600 text-white rounded-2xl font-black text-xs hover:bg-red-700 transition-all flex items-center gap-2 shadow-lg shadow-red-600/20">
                 <Download size={18}/> PDF
              </button>
              <button onClick={handleSmartShare} disabled={isExporting} className="px-8 py-3 bg-green-600 text-white rounded-2xl font-black text-xs hover:bg-green-700 transition-all flex items-center gap-2 shadow-lg shadow-green-600/20">
                 <MessageCircle size={18}/> مشاركة
              </button>
              <button onClick={onClose} className="p-3 bg-white/5 text-white hover:bg-red-500 rounded-2xl transition-all border border-white/5">
                 <X size={24}/>
              </button>
           </div>
        </div>

        {/* Printable Area */}
        <div ref={printRef} id="printable-area" className={config.container}>
          
          <div className={config.headerWrapper}>
            <div className={config.headerContent}>
               <StoreInfoBlock />
               <InvoiceMetaBlock />
            </div>
          </div>

          {settings.selectedTemplate !== PrintTemplate.COMPACT && (
            <div className="p-12 grid grid-cols-1 md:grid-cols-2 gap-10 bg-white print:p-0 print:block">
               <div className="bg-slate-50 p-10 rounded-[40px] border border-slate-100 shadow-sm relative overflow-hidden group print:shadow-none print:border-0 print:p-2 print:bg-transparent">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 print:text-black">بيانات جهة التعامل</p>
                  <h4 className="text-2xl font-black text-slate-900 mb-3 flex items-center gap-3"><User size={24} className="text-blue-500 print:hidden"/> {sale.customerName}</h4>
                  <div className="flex gap-4">
                     <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-[10px] font-black print:border print:border-black print:bg-white print:text-black">{sale.paymentType}</span>
                     {sale.customerId && <span className="bg-white border border-slate-200 text-slate-400 px-4 py-1 rounded-full text-[10px] font-black print:text-black print:border-black">#{sale.customerId.slice(-4)}</span>}
                  </div>
                  
                  {/* عرض الأرصدة (سابق وحالي) فقط إذا كان هناك عميل مسجل */}
                  {sale.customerId && (
                    <div className="flex gap-6 mt-6 pt-6 border-t border-slate-200 print:mt-2 print:pt-2 print:border-black">
                        <div className="text-right">
                            <p className="text-[9px] font-black text-slate-400 uppercase mb-1 print:text-black">الحساب السابق</p>
                            <p className="font-bold text-slate-700 text-lg print:text-black">{(sale.previousBalance || 0).toLocaleString()} <span className="text-[9px]">ج.م</span></p>
                        </div>
                        <div className="w-px bg-slate-200 print:bg-black"></div>
                        <div className="text-right">
                            <p className="text-[9px] font-black text-slate-400 uppercase mb-1 print:text-black">الحساب الحالي</p>
                            <p className={`font-black text-lg ${currentCustomerBalance > 0 ? 'text-red-600' : 'text-green-600'} print:text-black`}>
                                {currentCustomerBalance.toLocaleString()} <span className="text-[9px] text-slate-400 print:text-black">ج.م</span>
                            </p>
                        </div>
                    </div>
                  )}
               </div>

               <div className="bg-indigo-900 p-10 rounded-[40px] text-white shadow-2xl relative overflow-hidden flex flex-col justify-center print:hidden">
                  <div className="relative z-10 grid grid-cols-2 gap-6 text-center divide-x divide-white/10 divide-x-reverse">
                     <div className="px-4">
                        <p className="text-[10px] font-black text-indigo-300 uppercase mb-2">النقاط المكتسبة</p>
                        <p className="text-3xl font-black">+{Math.floor(sale.totalAmount / 100)}</p>
                     </div>
                     <div className="px-4">
                        <p className="text-[10px] font-black text-indigo-300 uppercase mb-2">الرصيد المتبقي</p>
                        <p className="text-3xl font-black">{sale.remainingAmount.toLocaleString()}</p>
                     </div>
                  </div>
               </div>
            </div>
          )}

          <div className={`${settings.selectedTemplate === PrintTemplate.COMPACT ? 'px-6 pb-6' : 'px-12 pb-16'} bg-white print:p-0`}>
             <table className="w-full text-right border-collapse">
                <thead>
                   <tr className={config.tableHead}>
                      {columns.product && <th className={`py-6 ${settings.selectedTemplate === PrintTemplate.COMPACT ? 'px-2' : 'px-8'}`}>الصنف</th>}
                      {columns.quantity && <th className={`py-6 px-4 text-center`}>الكمية</th>}
                      {columns.unit && <th className={`py-6 px-4 text-center`}>الوحدة</th>}
                      {columns.price && <th className={`py-6 px-4 text-center`}>السعر</th>}
                      {columns.discount && <th className={`py-6 px-4 text-center`}>الخصم</th>}
                      {columns.total && <th className={`py-6 ${settings.selectedTemplate === PrintTemplate.COMPACT ? 'px-2' : 'px-8'} text-left`}>الإجمالي</th>}
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 print:divide-black">
                   {sale.items.map((item, idx) => (
                     <tr key={idx} className="font-bold hover:bg-slate-50/50 transition-colors">
                        {columns.product && (
                          <td className={`py-4 ${settings.selectedTemplate === PrintTemplate.COMPACT ? 'px-2' : 'px-8'}`}>
                             <p className="text-slate-900 mb-1">{item.productName}</p>
                          </td>
                        )}
                        {columns.quantity && <td className="py-4 px-4 text-center">{item.quantity}</td>}
                        {columns.unit && <td className="py-4 px-4 text-center text-[10px] font-bold text-slate-500 bg-slate-100/50 rounded print:bg-transparent print:text-black">{item.unit}</td>}
                        {columns.price && <td className="py-4 px-4 text-center">{item.pricePerUnit.toLocaleString()}</td>}
                        {columns.discount && <td className="py-4 px-4 text-center text-red-500 print:text-black">{item.discount && item.discount > 0 ? item.discount : '-'}</td>}
                        {columns.total && <td className={`py-4 ${settings.selectedTemplate === PrintTemplate.COMPACT ? 'px-2' : 'px-8'} text-left text-slate-900 font-black`}>{item.total.toLocaleString()}</td>}
                     </tr>
                   ))}
                </tbody>
             </table>
          </div>

          <div className={config.footer}>
             <div className="flex flex-col md:flex-row justify-between items-end gap-12 print:block">
                {settings.selectedTemplate === PrintTemplate.MODERN && (
                  <div className="text-center space-y-6 md:self-start print:hidden">
                     <div className="p-6 border-4 border-slate-50 rounded-[45px] inline-block bg-white shadow-xl">
                        <QrCode size={120} className="text-slate-900" />
                     </div>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">فاتورة إلكترونية</p>
                  </div>
                )}

                <div className={`w-full ${settings.selectedTemplate === PrintTemplate.COMPACT ? '' : 'md:w-[420px]'} space-y-5 print:w-full`}>
                   {settings.vatEnabled && (
                     <div className="flex justify-between items-center px-4 py-2 border-b print:border-black">
                        <span className="text-xs font-bold text-slate-500 print:text-black">ضريبة ({settings.vatRate}%)</span>
                        <span className="font-black text-orange-600 print:text-black">{vatAmount.toLocaleString()}</span>
                     </div>
                   )}
                   <div className={`${settings.selectedTemplate === PrintTemplate.MODERN ? 'p-10 bg-slate-900 text-white rounded-[45px] print:bg-white print:text-black print:border-2 print:border-black print:p-4' : 'py-4 border-t-2 border-black'} flex justify-between items-center`}>
                      <span className="text-lg font-black uppercase">الإجمالي النهائي</span>
                      <h2 className="text-4xl font-black tracking-tighter">
                         {grandTotal.toLocaleString()} <span className="text-sm font-bold opacity-70">ج.م</span>
                      </h2>
                   </div>
                   
                   {/* عرض الأرصدة في الفاتورة المصغرة أو الكلاسيكية أسفل المجموع */}
                   {sale.customerId && settings.selectedTemplate !== PrintTemplate.MODERN && (
                       <div className="pt-2 text-xs border-t border-dashed border-slate-300 print:border-black">
                           <div className="flex justify-between py-1">
                               <span>الحساب السابق:</span>
                               <span>{(sale.previousBalance || 0).toLocaleString()}</span>
                           </div>
                           <div className="flex justify-between py-1 font-bold">
                               <span>الحساب الحالي:</span>
                               <span>{currentCustomerBalance.toLocaleString()}</span>
                           </div>
                       </div>
                   )}

                   {/* Profit Display - Internal Only (Hidden on Print & Export) */}
                   <div
                     data-html2canvas-ignore="true"
                     className="print:hidden flex justify-between items-center p-3 bg-emerald-50 rounded-xl border border-emerald-100 mt-2 shadow-sm"
                   >
                     <span className="text-[10px] font-black text-emerald-600 flex items-center gap-1">
                       <TrendingUp size={12}/> ربح الفاتورة (داخلي)
                     </span>
                     <span className="font-black text-emerald-700 text-lg">
                       {(sale.profit || 0).toLocaleString()} <span className="text-[10px]">ج.م</span>
                     </span>
                   </div>
                </div>
             </div>

             <div className="mt-12 text-center pt-8 border-t border-slate-200 print:border-black print:mt-4 print:pt-4">
                {settings.footerText && (
                  <p className="font-bold text-slate-500 text-sm mb-4 italic px-10 print:text-black">"{settings.footerText}"</p>
                )}
                {settings.selectedTemplate === PrintTemplate.MODERN && (
                  <div className="flex justify-center items-center gap-10 opacity-30 print:hidden">
                     <p className="text-[10px] font-black uppercase flex items-center gap-2"><CheckCircle2 size={12}/> معتمد</p>
                     <p className="text-[10px] font-black uppercase flex items-center gap-2"><Store size={12}/> البطل بلس</p>
                  </div>
                )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePreview;
