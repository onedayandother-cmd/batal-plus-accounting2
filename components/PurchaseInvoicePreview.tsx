
import React, { useRef, useState } from 'react';
import { 
  Printer, X, Download, FileText, Truck, Calendar, Hash,
  MapPin, Phone, CheckCircle2, Store, Image as ImageIcon
} from 'lucide-react';
import { Purchase, AppSettings } from '../types';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface PurchaseInvoicePreviewProps {
  purchase: Purchase;
  settings: AppSettings;
  onClose: () => void;
}

const PurchaseInvoicePreview: React.FC<PurchaseInvoicePreviewProps> = ({ purchase, settings, onClose }) => {
  const printRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const exportAsImage = async () => {
    if (!printRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(printRef.current, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
      const link = document.createElement('a');
      link.download = `purchase-${purchase.invoiceNumber}.png`;
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
      pdf.save(`purchase-${purchase.invoiceNumber}.pdf`);
    } catch (err) {
      console.error("PDF Export Error:", err);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    const printContent = document.getElementById('printable-purchase');
    const windowUrl = window.open('', '', 'left=0,top=0,width=900,height=900,toolbar=0,scrollbars=0,status=0');
    if (windowUrl && printContent) {
      windowUrl.document.write(`
        <html dir="rtl">
          <head>
            <title>طباعة فاتورة شراء - ${purchase.invoiceNumber}</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap" rel="stylesheet">
            <style>
              body { font-family: 'Cairo', sans-serif; margin: 0; padding: 0; }
              @media print {
                .no-print { display: none !important; }
                @page { margin: 0; }
                body { padding: 5mm; }
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
    <div className="fixed inset-0 z-[550] bg-slate-950/95 backdrop-blur-3xl flex items-center justify-center p-4 overflow-y-auto no-scrollbar font-['Cairo']">
      <div className="my-10 w-full max-w-[900px] animate-in slide-in-from-bottom-12 duration-500">
        
        {/* Toolbar */}
        <div className="bg-white/10 backdrop-blur-xl p-6 rounded-t-[40px] border-x border-t border-white/10 flex flex-wrap justify-between items-center gap-6 no-print">
           <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-2xl">
                 <Truck size={28} />
              </div>
              <div>
                <h3 className="text-white font-black text-lg">سند استلام بضاعة (وارد)</h3>
                <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest">نسخة المستودع والحسابات</p>
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
              <button onClick={onClose} className="p-3 bg-white/5 text-white hover:bg-red-500 rounded-2xl transition-all border border-white/5">
                 <X size={24}/>
              </button>
           </div>
        </div>

        {/* Printable Area */}
        <div ref={printRef} id="printable-purchase" className="bg-white shadow-2xl overflow-hidden text-right text-slate-800 rounded-b-[40px]">
          
          {/* Header */}
          <div className="bg-slate-900 text-white p-12 rounded-t-[40px]">
            <div className="flex justify-between items-start">
               <div>
                  <h1 className="text-4xl font-black tracking-tighter">{settings.storeName}</h1>
                  <p className="font-bold opacity-70 mt-2 text-lg">قسم المشتريات والمخازن</p>
                  <div className="mt-4 space-y-1 text-sm font-bold opacity-80">
                     {settings.address && <p className="flex items-center gap-2"><MapPin size={14}/> {settings.address}</p>}
                     {settings.phone && <p className="flex items-center gap-2"><Phone size={14}/> {settings.phone}</p>}
                  </div>
               </div>
               <div className="text-left space-y-6">
                  <div className="bg-white/10 p-6 rounded-[30px] inline-block min-w-[200px] shadow-inner text-center">
                     <p className="text-[10px] font-black uppercase opacity-60 mb-1 tracking-[0.2em]">رقم مستند الوارد</p>
                     <h2 className="text-3xl font-black">{purchase.invoiceNumber}</h2>
                  </div>
                  <div className="text-sm font-black opacity-60 space-y-1">
                     <p><Calendar size={14} className="inline ml-2 text-indigo-400"/> {purchase.date}</p>
                  </div>
               </div>
            </div>
          </div>

          {/* Supplier Info */}
          <div className="p-12 grid grid-cols-1 md:grid-cols-2 gap-10 bg-white border-b">
             <div className="bg-slate-50 p-10 rounded-[40px] border border-slate-100 shadow-sm relative overflow-hidden">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">بيانات المورد</p>
                <h4 className="text-2xl font-black text-slate-900 mb-3 flex items-center gap-3"><Truck size={24} className="text-indigo-500"/> {purchase.supplierName}</h4>
                <div className="flex gap-4">
                   <span className="bg-indigo-600 text-white px-4 py-1 rounded-full text-[10px] font-black">{purchase.paymentType}</span>
                </div>
             </div>

             <div className="bg-slate-900 p-10 rounded-[40px] text-white shadow-2xl relative overflow-hidden flex flex-col justify-center">
                <div className="relative z-10 text-center">
                   <p className="text-[10px] font-black text-indigo-300 uppercase mb-2">إجمالي قيمة الفاتورة</p>
                   <p className="text-4xl font-black">{purchase.totalAmount.toLocaleString()} <span className="text-sm opacity-50">ج.م</span></p>
                </div>
             </div>
          </div>

          {/* Items Table */}
          <div className="px-12 pb-16 pt-8 bg-white">
             <h3 className="font-black text-slate-800 mb-6 flex items-center gap-2"><FileText size={20} className="text-slate-400"/> تفاصيل الأصناف المستلمة</h3>
             <table className="w-full text-right border-collapse">
                <thead>
                   <tr className="bg-slate-50 text-slate-500 font-black text-[10px] uppercase rounded-2xl overflow-hidden">
                      <th className="py-6 px-8 rounded-r-2xl">الصنف</th>
                      <th className="py-6 px-4 text-center">الكمية</th>
                      <th className="py-6 px-4 text-center">الوحدة</th>
                      <th className="py-6 px-4 text-center">سعر الشراء</th>
                      <th className="py-6 px-8 text-left rounded-l-2xl">الإجمالي</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                   {purchase.items.map((item, idx) => (
                     <tr key={idx} className="font-bold hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 px-8 text-slate-900">{item.productName}</td>
                        <td className="py-4 px-4 text-center">{item.quantity}</td>
                        <td className="py-4 px-4 text-center text-xs text-slate-500">{item.unit}</td>
                        <td className="py-4 px-4 text-center">{item.pricePerUnit.toLocaleString()}</td>
                        <td className="py-4 px-8 text-left text-slate-900 font-black">{item.total.toLocaleString()}</td>
                     </tr>
                   ))}
                </tbody>
             </table>
          </div>

          {/* Footer */}
          <div className="bg-slate-50 p-10 rounded-b-[40px] border-t">
             <div className="flex justify-between items-end">
                <div className="flex items-center gap-10 opacity-30">
                   <p className="text-[10px] font-black uppercase flex items-center gap-2"><CheckCircle2 size={12}/> استلام مخزني</p>
                   <p className="text-[10px] font-black uppercase flex items-center gap-2"><Store size={12}/> {settings.storeName}</p>
                </div>
                <div className="text-left">
                   <p className="text-[10px] font-black uppercase mb-1">توقيع المستلم (أمين المخزن)</p>
                   <div className="w-48 h-12 border-b-2 border-slate-300 border-dashed"></div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseInvoicePreview;
