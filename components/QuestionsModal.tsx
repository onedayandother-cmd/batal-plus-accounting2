
import React from 'react';
import { X, HelpCircle, ArrowLeft } from 'lucide-react';

interface QuestionsModalProps {
  onClose: () => void;
}

const QuestionsModal: React.FC<QuestionsModalProps> = ({ onClose }) => {
  const questions = [
    "هل ترغب في تفعيل نظام جرد المخزون التلقائي (الربط بين الفواتير والكمية المتبقية)؟",
    "هل هناك ضريبة قيمة مضافة (VAT) محددة يجب حسابها تلقائياً؟",
    "هل تحتاج لنظام 'صلاحية' وتواريخ انتهاء للأصناف؟",
    "هل تفضل أن تكون واجهة 'الفاتورة الجديدة' تدعم قارئ الباركود (Barcode Scanner)؟",
    "هل ترغب في ربط العملاء بخصومات محددة مسبقاً (مثلاً عميل معين يأخذ دائماً سعر 'جملة الجملة')؟",
    "بالنسبة لتصدير الفاتورة كصورة، هل هناك تصميم معين للترويسة (Logo/Header)؟"
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="bg-blue-600 p-6 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <HelpCircle size={28} />
            <div>
              <h2 className="text-xl font-bold">أسئلة التطوير الاحترافي</h2>
              <p className="text-sm text-blue-100 opacity-80">ساعدنا لنبني لك أفضل نظام محاسبي</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-blue-500 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-4 max-h-[70vh] overflow-y-auto">
          <p className="text-slate-600 leading-relaxed mb-6">
            أهلاً بك! لقد قمت بإعداد الهيكل الأساسي للبرنامج المحاسبي. لضمان خروج البرنامج بأفضل صورة تناسب عملك، نحتاج منك الإجابة على هذه الاستفسارات:
          </p>
          
          {questions.map((q, idx) => (
            <div key={idx} className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 items-start hover:border-blue-200 transition-colors">
              <span className="bg-blue-100 text-blue-700 w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                {idx + 1}
              </span>
              <p className="text-slate-800 font-medium pt-0.5">{q}</p>
            </div>
          ))}
        </div>

        <div className="p-6 bg-slate-50 border-t flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center gap-2"
          >
            <span>بدء الاستخدام</span>
            <ArrowLeft size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuestionsModal;
