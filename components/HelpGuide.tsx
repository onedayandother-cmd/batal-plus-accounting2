
import React, { useState } from 'react';
import { 
  BookOpen, HelpCircle, ShoppingCart, Truck, 
  Box, PieChart, ShieldCheck, Zap, 
  ChevronDown, ChevronUp, PlayCircle, 
  MessageCircle, Star, Lightbulb, 
  FileText, Download, UserPlus, Save, Edit, RefreshCw
} from 'lucide-react';

const HelpGuide: React.FC = () => {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const sections = [
    {
      id: 'automation',
      title: 'الأتمتة والحفظ التلقائي',
      icon: <RefreshCw className="text-orange-500" />,
      steps: [
        'يقوم البرنامج بحفظ مسودة الفاتورة تلقائياً كل ثانية.',
        'إذا فقدت الاتصال أو أغلق المتصفح، ستجد زر "استعادة" بالأعلى.',
        'لا يتم حذف المسودة إلا بعد حفظ الفاتورة رسمياً أو إلغائها يدوياً.',
        'هذه الميزة تعمل في شاشتي البيع والشراء لضمان سلامة بياناتك.'
      ]
    },
    {
      id: 'editing',
      title: 'طلب تعديل فواتير',
      icon: <Edit className="text-blue-500" />,
      steps: [
        'الفواتير المعتمدة تصبح محمية من التعديل العشوائي.',
        'لطلب تعديل فاتورة قديمة، اذهب إلى "سجل المبيعات" أو "سجل المشتريات".',
        'اضغط على زر "طلب تعديل" بجانب الفاتورة المطلوبة.',
        'سيظهر الطلب للمسؤول ليتمكن من فتح الفاتورة لك مرة أخرى.'
      ]
    },
    {
      id: 'inventory',
      title: 'إدارة الوحدات والعبوات',
      icon: <Box className="text-green-500" />,
      steps: [
        'يمكنك تعريف سعة الكرتونة والدستة لكل صنف بشكل مستقل.',
        'النظام يحسب الأسعار آلياً بناءً على سعر القطعة ونسبة التحويل.',
        'عند البيع بـ "الكرتونة"، يخصم النظام عدد قطع الصنف الفعلي من المخزن.',
        'تظهر "الكرتونة" في البحث ببيان سعتها (مثلاً: كرتونة x24).'
      ]
    }
  ];

  const faqs = [
    {
      q: "كيف أغير اسم المؤسسة المطبوع على الفاتورة؟",
      a: "اذهب إلى 'الإعدادات' من القائمة الجانبية، ثم 'بيانات الفاتورة المطبوعة'، وقم بتغيير اسم المؤسسة والعنوان ورقم الهاتف."
    },
    {
      q: "هل يمكنني البيع لعميل لم أسجله بعد؟",
      a: "نعم، يمكنك اختيار 'عميل نقدي (كاش)' من شريط بيانات العميل العلوي في شاشة البيع، وهذا لن يسجل مديونية على أحد."
    },
    {
      q: "ماذا أفعل إذا ظهر لي تنبيه 'يوجد فاتورة لم تكتمل'؟",
      a: "هذا يعني أنك بدأت فاتورة ولم تحفظها. اضغط 'استعادة' لإكمالها أو 'تجاهل' لمسحها والبدء من جديد."
    }
  ];

  return (
    <div className="space-y-12 text-right font-['Cairo'] animate-in fade-in duration-700 pb-20">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-12 rounded-[50px] text-white relative overflow-hidden shadow-2xl">
         <div className="absolute top-0 left-0 w-64 h-64 bg-blue-600/10 blur-[120px] rounded-full"></div>
         <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
            <div>
               <h2 className="text-4xl font-black mb-4 flex items-center gap-4">
                  <BookOpen size={40} className="text-blue-400" /> دليل مستخدم البطل بلس +
               </h2>
               <p className="text-slate-400 font-bold max-w-2xl leading-relaxed">
                  أهلاً بك في دليلك الكامل. قمنا بتطوير ميزات ذكية لتسهيل عملك وضمان دقة حساباتك المالية والمخزنية.
               </p>
            </div>
            <div className="bg-white/5 p-6 rounded-3xl border border-white/10 text-center">
               <h4 className="text-blue-400 font-black text-2xl">نظام ذكي</h4>
               <p className="text-[10px] uppercase font-black text-slate-500">مبني لراحتك</p>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {sections.map((sec) => (
           <div key={sec.id} className="bg-white p-10 rounded-[45px] shadow-sm border border-slate-100 hover:shadow-xl transition-all group">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">{sec.icon}</div>
              <h3 className="text-xl font-black text-slate-800 mb-6">{sec.title}</h3>
              <ul className="space-y-4">
                 {sec.steps.map((step, idx) => (
                   <li key={idx} className="flex gap-3 items-start text-sm font-bold text-slate-500 leading-relaxed">
                      <div className="w-5 h-5 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-[10px]">{idx + 1}</div>
                      {step}
                   </li>
                 ))}
              </ul>
           </div>
         ))}
      </div>

      <div className="bg-white p-12 rounded-[50px] shadow-sm border border-slate-100">
         <h3 className="text-2xl font-black text-slate-800 mb-10 flex items-center gap-4"><HelpCircle className="text-slate-400" /> الأسئلة الشائعة</h3>
         <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="border border-slate-100 rounded-[30px] overflow-hidden">
                 <button onClick={() => setActiveFaq(activeFaq === idx ? null : idx)} className="w-full p-6 text-right flex justify-between items-center hover:bg-slate-50 transition-all">
                    <span className="font-black text-slate-700">{faq.q}</span>
                    {activeFaq === idx ? <ChevronUp className="text-blue-500" /> : <ChevronDown className="text-slate-300" />}
                 </button>
                 {activeFaq === idx && (
                   <div className="p-8 bg-slate-50 text-slate-500 font-bold text-sm leading-relaxed border-t border-slate-100 animate-in slide-in-from-top-4">{faq.a}</div>
                 )}
              </div>
            ))}
         </div>
      </div>
    </div>
  );
};

export default HelpGuide;
