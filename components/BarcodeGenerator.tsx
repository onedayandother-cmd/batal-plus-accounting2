
import React, { useRef } from 'react';
import { X, Printer, Tag, Scissors } from 'lucide-react';
import { Product, UnitType, PricingTier } from '../types';

interface BarcodeGeneratorProps {
  product: Product;
  onClose: () => void;
  storeName: string;
}

const BarcodeGenerator: React.FC<BarcodeGeneratorProps> = ({ product, onClose, storeName }) => {
  const printRef = useRef<HTMLDivElement>(null);
  const [labelCount, setLabelCount] = React.useState(12);

  // استخراج السعر القطاعي للقطعة الواحدة بشكل آمن
  const pieceRetailPrice = product.prices[UnitType.PIECE]?.[PricingTier.RETAIL] || 0;

  const handlePrint = () => {
    const windowUrl = window.open('', '', 'left=0,top=0,width=800,height=900,toolbar=0,scrollbars=0,status=0');
    if (windowUrl) {
      windowUrl.document.write(`
        <html>
          <head>
            <title>طباعة ملصقات - ${product.name}</title>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@700&display=swap');
              body { font-family: 'Cairo', sans-serif; margin: 0; padding: 10mm; direction: rtl; }
              .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 5mm; }
              .label { 
                border: 1px solid #eee; 
                padding: 3mm; 
                text-align: center; 
                border-radius: 2mm;
                height: 25mm;
                display: flex;
                flex-direction: column;
                justify-content: center;
              }
              .store { font-size: 7pt; color: #666; margin-bottom: 1mm; }
              .name { font-size: 9pt; font-weight: bold; margin-bottom: 1mm; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
              .barcode-text { font-size: 8pt; letter-spacing: 2px; margin: 1mm 0; }
              .price { font-size: 10pt; font-weight: 900; background: #000; color: #fff; padding: 1mm; border-radius: 1mm; width: fit-content; margin: 0 auto; }
            </style>
          </head>
          <body>
            <div class="grid">
              ${Array(labelCount).fill(0).map(() => `
                <div class="label">
                  <div class="store">${storeName}</div>
                  <div class="name">${product.name}</div>
                  <div class="barcode-text">*${product.barcode}*</div>
                  <div class="price">${pieceRetailPrice} ج.م</div>
                </div>
              `).join('')}
            </div>
            <script>window.onload = () => { window.print(); window.close(); }</script>
          </body>
        </html>
      `);
      windowUrl.document.close();
    }
  };

  return (
    <div className="fixed inset-0 z-[300] bg-slate-900/80 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-[50px] overflow-hidden shadow-2xl animate-in zoom-in duration-300">
        <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Scissors size={24} />
            </div>
            <h2 className="text-2xl font-black">طباعة ملصقات الباركود</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-all"><X /></button>
        </div>

        <div className="p-10 space-y-8 text-right font-['Cairo']">
          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex items-center gap-6">
             <div className="w-20 h-20 bg-white rounded-2xl border flex items-center justify-center text-slate-300">
                <Tag size={40} />
             </div>
             <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">الصنف المختار</p>
                <div className="flex items-center gap-2">
                   <h3 className="text-xl font-black text-slate-800">{product.name}</h3>
                   <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-lg text-[8px] font-black">{product.category}</span>
                </div>
                <p className="text-sm font-bold text-blue-600">{product.barcode}</p>
             </div>
          </div>

          <div className="space-y-4">
            <label className="text-xs font-black text-slate-400 pr-4">عدد الملصقات المطلوب طباعتها</label>
            <div className="grid grid-cols-4 gap-3">
               {[6, 12, 24, 48].map(count => (
                 <button 
                  key={count} 
                  onClick={() => setLabelCount(count)}
                  className={`py-4 rounded-2xl font-black text-sm transition-all border-2 ${labelCount === count ? 'bg-blue-600 border-blue-600 text-white shadow-xl' : 'bg-white text-slate-400 border-slate-100 hover:border-blue-200'}`}
                 >
                   {count} ملصق
                 </button>
               ))}
            </div>
          </div>

          <div className="p-8 border-2 border-dashed border-slate-100 rounded-[35px] flex flex-col items-center">
             <p className="text-[10px] font-black text-slate-300 uppercase mb-4">معاينة الملصق</p>
             <div className="w-48 h-24 bg-white border border-slate-200 rounded-xl shadow-sm p-4 text-center flex flex-col justify-center">
                <p className="text-[8px] font-bold text-slate-400">{storeName}</p>
                <p className="text-[10px] font-black text-slate-800 truncate">{product.name}</p>
                <div className="text-[10px] font-bold my-1 tracking-widest text-slate-500">|||| || || |||</div>
                <p className="text-xs font-black bg-slate-900 text-white inline-block px-2 py-0.5 rounded-md mx-auto">{pieceRetailPrice} ج.م</p>
             </div>
          </div>

          <button 
            onClick={handlePrint}
            className="w-full py-6 bg-slate-900 text-white rounded-[30px] font-black text-xl shadow-2xl hover:bg-black transition-all flex items-center justify-center gap-4"
          >
            <Printer size={24} /> ابدأ الطباعة الآن
          </button>
        </div>
      </div>
    </div>
  );
};

export default BarcodeGenerator;
