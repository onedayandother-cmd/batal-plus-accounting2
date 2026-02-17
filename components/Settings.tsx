
import React, { useRef, useState } from 'react';
import { 
  Store, MapPin, Phone, FileText, DownloadCloud,
  Printer, Info, User as UserIcon, Box, Percent,
  Layout, CheckCircle, Smartphone, Type, UploadCloud, AlertTriangle,
  Share2, Globe, Cpu, ShieldCheck, QrCode as QrIcon, ToggleLeft, ToggleRight, Columns,
  Tag, Cloud, Zap, Users, RefreshCw
} from 'lucide-react';
import { AppSettings, PrintFormat, ThermalSize, PrintTemplate, InvoiceColumnConfig, User } from '../types';

interface SettingsProps {
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  categories: string[];
  currentUser: User;
}

const Settings: React.FC<SettingsProps> = ({ settings, setSettings, categories, currentUser }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showQr, setShowQr] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);

  const updateSetting = (key: keyof AppSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleMarginChange = (category: string, value: string) => {
    const newMargins = { ...settings.categoryMargins, [category]: parseFloat(value) || 0 };
    setSettings({ ...settings, categoryMargins: newMargins });
  };

  const toggleColumn = (col: keyof InvoiceColumnConfig) => {
    const template = settings.selectedTemplate;
    const currentConfig = settings.invoiceColumns[template];
    setSettings(prev => ({
      ...prev,
      invoiceColumns: {
        ...prev.invoiceColumns,
        [template]: {
          ...currentConfig,
          [col]: !currentConfig[col]
        }
      }
    }));
  };

  const handleSync = () => {
    setIsSyncing(true);
    setSyncSuccess(false);
    setTimeout(() => {
      // Mock API call
      setSettings(prev => ({
        ...prev,
        cloudSync: { ...prev.cloudSync, lastSync: new Date().toISOString() }
      }));
      setIsSyncing(false);
      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 3000);
    }, 2000);
  };

  const exportBackup = () => {
    const data = {
      products: JSON.parse(localStorage.getItem('b_products') || '[]'),
      expenses: JSON.parse(localStorage.getItem('b_expenses') || '[]'),
      customers: JSON.parse(localStorage.getItem('b_customers') || '[]'),
      suppliers: JSON.parse(localStorage.getItem('b_suppliers') || '[]'),
      sales: JSON.parse(localStorage.getItem('b_sales') || '[]'),
      vouchers: JSON.parse(localStorage.getItem('b_vouchers') || '[]'),
      shifts: JSON.parse(localStorage.getItem('b_shifts') || '[]'),
      assets: JSON.parse(localStorage.getItem('b_assets') || '[]'),
      budgets: JSON.parse(localStorage.getItem('b_budgets') || '[]'),
      journals: JSON.parse(localStorage.getItem('b_journals') || '[]'),
      settings: JSON.parse(localStorage.getItem('b_settings') || '{}'),
      timestamp: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_batal_plus_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const importBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (confirm('تحذير: استيراد بيانات جديدة سيؤدي لمسح البيانات الحالية على هذا الجهاز. هل تريد الاستمرار؟')) {
          localStorage.setItem('b_products', JSON.stringify(data.products || []));
          localStorage.setItem('b_expenses', JSON.stringify(data.expenses || []));
          localStorage.setItem('b_customers', JSON.stringify(data.customers || []));
          localStorage.setItem('b_suppliers', JSON.stringify(data.suppliers || []));
          localStorage.setItem('b_sales', JSON.stringify(data.sales || []));
          localStorage.setItem('b_vouchers', JSON.stringify(data.vouchers || []));
          localStorage.setItem('b_shifts', JSON.stringify(data.shifts || []));
          localStorage.setItem('b_assets', JSON.stringify(data.assets || []));
          localStorage.setItem('b_budgets', JSON.stringify(data.budgets || []));
          localStorage.setItem('b_journals', JSON.stringify(data.journals || []));
          localStorage.setItem('b_settings', JSON.stringify(data.settings || {}));
          
          alert('تم استيراد البيانات بنجاح! سيتم إعادة تحميل البرنامج الآن.');
          window.location.reload();
        }
      } catch (err) {
        alert('فشل استيراد الملف. تأكد من أنه ملف نسخة احتياطية صحيح من برنامج البطل بلس.');
      }
    };
    reader.readAsText(file);
  };

  const currentColumns = settings.invoiceColumns?.[settings.selectedTemplate] || {
    product: true, quantity: true, unit: true, price: true, discount: true, total: true
  };

  return (
    <div className="space-y-10 text-right animate-in fade-in duration-500 pb-20 font-['Cairo']">
      <div className="flex justify-between items-center bg-white p-8 rounded-[40px] shadow-sm border">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">إعدادات النظام والاتصال</h2>
          <p className="text-slate-500 font-bold">إدارة بيانات المؤسسة، النسخ الاحتياطي، وروابط الوصول السريع</p>
        </div>
        <button 
          onClick={() => setShowQr(true)}
          className="flex items-center gap-3 bg-blue-50 text-blue-600 px-6 py-3 rounded-2xl font-black text-xs hover:bg-blue-600 hover:text-white transition-all shadow-sm"
        >
          <Share2 size={18} /> مشاركة رابط البرنامج
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        <div className="bg-white p-10 rounded-[45px] shadow-sm border border-slate-100 space-y-8">
          <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
            <Printer className="text-pink-600" size={24} /> هوية الفاتورة المطبوعة
          </h3>
          <div className="space-y-4">
             <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">قالب التصميم</label>
             <div className="grid grid-cols-3 gap-3">
                {[PrintTemplate.MODERN, PrintTemplate.CLASSIC, PrintTemplate.COMPACT].map((template) => (
                   <button key={template} onClick={() => updateSetting('selectedTemplate', template)} className={`p-4 rounded-2xl border-2 text-center transition-all ${settings.selectedTemplate === template ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-md' : 'border-slate-100 hover:border-indigo-200 text-slate-400'}`}>
                      <Layout size={24} className="mx-auto mb-2" />
                      <p className="font-black text-[10px]">{template}</p>
                   </button>
                ))}
             </div>
          </div>
          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
            <h4 className="font-black text-slate-700 mb-4 flex items-center gap-2 text-sm"><Columns size={16}/> تخصيص أعمدة الجدول ({settings.selectedTemplate})</h4>
            <div className="grid grid-cols-2 gap-3">
              <ColumnToggle label="اسم الصنف" active={currentColumns.product} onToggle={() => toggleColumn('product')} />
              <ColumnToggle label="الكمية" active={currentColumns.quantity} onToggle={() => toggleColumn('quantity')} />
              <ColumnToggle label="الوحدة" active={currentColumns.unit} onToggle={() => toggleColumn('unit')} />
              <ColumnToggle label="السعر" active={currentColumns.price} onToggle={() => toggleColumn('price')} />
              <ColumnToggle label="الخصم" active={currentColumns.discount} onToggle={() => toggleColumn('discount')} />
              <ColumnToggle label="الإجمالي" active={currentColumns.total} onToggle={() => toggleColumn('total')} />
            </div>
          </div>
          <div className="space-y-6">
            <SettingInput label="اسم المؤسسة" value={settings.storeName} onChange={v => updateSetting('storeName', v)} icon={<Store size={18}/>} />
            <SettingInput label="العنوان" value={settings.address || ''} onChange={v => updateSetting('address', v)} icon={<MapPin size={18}/>} />
            <SettingInput label="الهاتف" value={settings.phone || ''} onChange={v => updateSetting('phone', v)} icon={<Phone size={18}/>} />
            <SettingInput label="الرقم الضريبي" value={settings.taxNumber || ''} onChange={v => updateSetting('taxNumber', v)} icon={<Percent size={18}/>} />
            <SettingInput label="ذيل الفاتورة" value={settings.footerText || ''} onChange={v => updateSetting('footerText', v)} icon={<FileText size={18}/>} />
          </div>
        </div>

        <div className="space-y-8">
            <div className="bg-white p-10 rounded-[45px] shadow-sm border border-slate-100 space-y-8">
               <h3 className="text-xl font-black text-slate-800 flex items-center gap-3"><Percent className="text-orange-600" size={24} /> الضرائب والسياسة المالية</h3>
               <div className="flex items-center justify-between p-6 bg-slate-50 rounded-[30px] border">
                  <div>
                     <h4 className="font-black text-slate-800">تفعيل ضريبة القيمة المضافة</h4>
                     <p className="text-[10px] font-bold text-slate-400">إضافة الضريبة آلياً للفواتير ({settings.vatRate}%)</p>
                  </div>
                  <button onClick={() => updateSetting('vatEnabled', !settings.vatEnabled)} className={`w-14 h-8 rounded-full transition-all relative ${settings.vatEnabled ? 'bg-orange-600' : 'bg-slate-300'}`}>
                     <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all ${settings.vatEnabled ? 'left-7' : 'left-1'}`}></div>
                  </button>
               </div>
            </div>
            <div className="bg-white p-10 rounded-[45px] shadow-sm border border-slate-100 space-y-6">
              <h3 className="text-xl font-black text-slate-800 flex items-center gap-3"><Percent className="text-green-600" size={24} /> هوامش الربح التلقائية</h3>
              <p className="text-xs font-bold text-slate-400 -mt-4">لتسعير المنتجات آلياً عند إدخال تكلفة الشراء.</p>
              <div className="space-y-3 max-h-48 overflow-y-auto pr-2 no-scrollbar">
                {categories.map(cat => (
                  <div key={cat} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border">
                     <div className="flex items-center gap-3">
                       <Tag size={16} className="text-slate-400"/>
                       <span className="font-black text-sm text-slate-700">{cat}</span>
                     </div>
                     <div className="relative w-24">
                       <input type="number" value={settings.categoryMargins[cat] || ''} onChange={(e) => handleMarginChange(cat, e.target.value)} className="w-full bg-white border-2 border-slate-200 rounded-xl px-2 py-1.5 text-center font-black text-green-700 outline-none focus:border-green-500" />
                       <span className="absolute left-2 top-2.5 text-xs font-bold text-slate-400">%</span>
                     </div>
                  </div>
                ))}
              </div>
            </div>
        </div>

        <div className="bg-indigo-600 p-10 rounded-[45px] text-white space-y-8 lg:col-span-2 shadow-2xl relative overflow-hidden">
           <div className="absolute -top-10 -left-10 w-64 h-64 bg-white/5 rounded-full blur-2xl"></div>
           <div className="relative z-10 flex flex-col md:flex-row justify-between gap-10">
              <div>
                 <h3 className="text-2xl font-black flex items-center gap-4"><Cloud size={32} /> المزامنة السحابية والعمل الجماعي</h3>
                 <p className="text-indigo-200 font-bold max-w-xl text-sm mt-3 leading-relaxed">
                    فعّل الحساب السحابي لحفظ بياناتك بأمان، الوصول إليها من أي جهاز، والتعاون مع فريقك في نفس الوقت.
                 </p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-[9px] font-bold text-center">
                 <div className="bg-white/10 p-4 rounded-2xl"><Zap size={16} className="mx-auto mb-1 text-yellow-300"/>مزامنة لحظية</div>
                 <div className="bg-white/10 p-4 rounded-2xl"><ShieldCheck size={16} className="mx-auto mb-1 text-green-300"/>نسخ احتياطي</div>
                 <div className="bg-white/10 p-4 rounded-2xl"><Cpu size={16} className="mx-auto mb-1 text-blue-300"/>وصول متعدد</div>
                 <div className="bg-white/10 p-4 rounded-2xl"><Users size={16} className="mx-auto mb-1 text-pink-300"/>عمل جماعي</div>
              </div>
           </div>
           
           <div className="relative z-10 bg-black/20 p-8 rounded-[30px] border border-white/10 backdrop-blur-sm">
             {currentUser.loginType === 'local' ? (
                <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-right gap-6">
                   <div>
                      <p className="font-black">أنت تستخدم الوضع المحلي حالياً.</p>
                      <p className="text-xs text-indigo-300 font-bold">بياناتك محفوظة على هذا الجهاز فقط وغير قابلة للمشاركة.</p>
                   </div>
                   <button className="px-8 py-4 bg-white text-indigo-700 rounded-2xl font-black shadow-lg hover:bg-yellow-300 transition-all flex-shrink-0">الترقية لحساب سحابي (قريباً)</button>
                </div>
             ) : (
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                   <div className="text-center md:text-right">
                      <p className="text-[10px] font-bold text-green-300 uppercase">متصل بحساب سحابي</p>
                      <p className="font-black text-lg">{currentUser.email}</p>
                      <p className="text-xs text-indigo-300 font-bold">آخر مزامنة: {settings.cloudSync.lastSync ? new Date(settings.cloudSync.lastSync).toLocaleString('ar-EG') : 'لم تتم بعد'}</p>
                   </div>
                   <button onClick={handleSync} disabled={isSyncing} className={`px-10 py-5 rounded-2xl font-black text-base shadow-lg transition-all flex items-center gap-3 ${isSyncing ? 'bg-slate-500 text-white' : syncSuccess ? 'bg-green-500 text-white' : 'bg-white text-indigo-700 hover:bg-yellow-300'}`}>
                      <RefreshCw size={18} className={isSyncing ? 'animate-spin' : ''} />
                      {isSyncing ? 'جاري المزامنة...' : syncSuccess ? 'تم بنجاح!' : 'مزامنة الآن'}
                   </button>
                </div>
             )}
           </div>
        </div>

      </div>

      {showQr && (
        <div className="fixed inset-0 z-[600] bg-slate-900/95 backdrop-blur-2xl flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-md rounded-[60px] p-12 text-center shadow-2xl animate-in zoom-in border-4 border-white">
              <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-[25px] flex items-center justify-center mx-auto mb-8 shadow-xl"><Globe size={40} /></div>
              <h3 className="text-2xl font-black text-slate-800 mb-2">رابط الوصول السريع</h3>
              <p className="text-slate-400 font-bold mb-10 text-sm">امسح الكود التالي بموبايلك لفتح البرنامج أو انسخ الرابط لاستخدامه على كمبيوتر آخر.</p>
              <div className="p-6 border-4 border-slate-50 rounded-[45px] inline-block bg-white shadow-inner mb-10"><QrIcon size={180} className="text-slate-900" /></div>
              <div className="bg-slate-50 p-4 rounded-2xl mb-10 overflow-hidden text-xs font-mono text-blue-600 break-all border">{window.location.href}</div>
              <div className="grid grid-cols-2 gap-4">
                 <button onClick={() => { navigator.clipboard.writeText(window.location.href); alert('تم نسخ الرابط'); }} className="py-4 bg-slate-900 text-white rounded-2xl font-black text-xs hover:bg-black transition-all shadow-lg">نسخ الرابط</button>
                 <button onClick={() => setShowQr(false)} className="py-4 bg-slate-100 text-slate-400 rounded-2xl font-black text-xs hover:bg-red-50 hover:text-red-500 transition-all">إغلاق</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

const InfoRow = ({ label, value }: any) => (
  <div className="flex justify-between items-center text-sm">
     <span className="font-bold text-slate-500">{label}</span>
     <span className="font-black text-blue-400">{value}</span>
  </div>
);

const SettingInput = ({ label, value, onChange, icon }: any) => (
  <div className="space-y-2 w-full text-right">
    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pr-4">{label}</label>
    <div className="relative group">
      <input type="text" value={value} onChange={e => onChange(e.target.value)} className="w-full bg-slate-50 border-2 border-transparent rounded-[22px] px-6 py-4 pr-12 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-bold text-sm transition-all shadow-inner" />
      <div className="absolute right-4 top-4 text-slate-300 group-focus-within:text-blue-600 transition-colors">{icon}</div>
    </div>
  </div>
);

const ColumnToggle = ({ label, active, onToggle }: any) => (
  <button onClick={onToggle} className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${active ? 'bg-white border-blue-500 text-blue-600 shadow-sm' : 'bg-slate-50 border-transparent text-slate-400 hover:bg-slate-100'}`}>
    <span className="font-bold text-xs">{label}</span>
    {active ? <ToggleRight size={24}/> : <ToggleLeft size={24}/>}
  </button>
);

export default Settings;