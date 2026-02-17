
import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Wallet, FilePlus, Save, Trash2, X, Printer, File,
  ArrowDownCircle, ArrowUpCircle, Clock, Hash, Calendar, Users,
  Check, Banknote, Edit, MessageSquare, Briefcase, ChevronsRight, Info
} from 'lucide-react';
import { Voucher, Shift, Customer, Supplier, AccountTransaction, Cheque, ChequeStatus, BankAccount } from '../types';

interface VouchersProps {
  vouchers: Voucher[];
  setVouchers: React.Dispatch<React.SetStateAction<Voucher[]>>;
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  suppliers: Supplier[];
  setSuppliers: React.Dispatch<React.SetStateAction<Supplier[]>>;
  cheques: Cheque[];
  setCheques: React.Dispatch<React.SetStateAction<Cheque[]>>;
  bankAccounts: BankAccount[];
  activeShift?: Shift;
}

// Tafqit (Amount to Words) Function
const numberToArabicWords = (num: number): string => {
  if (num === 0) return 'صفر';
  const units = ['', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة'];
  const teens = ['عشرة', 'أحد عشر', 'اثنا عشر', 'ثلاثة عشر', 'أربعة عشر', 'خمسة عشر', 'ستة عشر', 'سبعة عشر', 'ثمانية عشر', 'تسعة عشر'];
  const tens = ['', 'عشرة', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون'];
  const hundreds = ['', 'مئة', 'مئتان', 'ثلاثمئة', 'أربعمئة', 'خمسمئة', 'ستمئة', 'سبعمئة', 'ثمانمئة', 'تسعمئة'];
  
  const convertHundreds = (n: number) => {
    let result = '';
    if (n >= 100) { result += hundreds[Math.floor(n / 100)] + ' '; n %= 100; }
    if (n >= 10 && n < 20) { result += teens[n - 10] + ' '; n = 0; } 
    else if (n >= 20) { result += tens[Math.floor(n / 10)] + ' '; n %= 10; }
    if (n > 0) { result += units[n] + ' '; }
    return result.trim();
  };

  const integerPart = Math.floor(num);
  const fractionalPart = Math.round((num - integerPart) * 100);
  
  let result = convertHundreds(integerPart % 1000);
  if (integerPart >= 1000) result = convertHundreds(Math.floor(integerPart / 1000) % 1000) + ' ألفاً و ' + result;
  if (integerPart >= 1000000) result = convertHundreds(Math.floor(integerPart / 1000000) % 1000) + ' مليوناً و ' + result;

  result = result.replace(/\s+/g, ' ').trim();
  let final = `فقط ${result} جنيهاً مصرياً`;
  if (fractionalPart > 0) {
    final += ` و ${convertHundreds(fractionalPart)} قرشاً`;
  }
  return `${final} لا غير.`;
};


const Vouchers: React.FC<VouchersProps> = (props) => {
  const { vouchers, setVouchers, customers, setCustomers, suppliers, setSuppliers, cheques, setCheques, bankAccounts, activeShift } = props;
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type') === 'payment' ? 'صرف' : 'قبض';
  
  // Form State
  const [serial, setSerial] = useState((vouchers.length + 1).toString().padStart(5, '0'));
  const [docNum, setDocNum] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [partyType, setPartyType] = useState<'customer' | 'supplier' | 'general'>('customer');
  const [partyId, setPartyId] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [amountInWords, setAmountInWords] = useState('');
  const [repId, setRepId] = useState('');
  const [isCheck, setIsCheck] = useState(false);
  const [checkNum, setCheckNum] = useState('');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [bankName, setBankName] = useState('');
  const [checkStatus, setCheckStatus] = useState<ChequeStatus>('pending');

  const parties = useMemo(() => {
    if (partyType === 'customer') return customers;
    if (partyType === 'supplier') return suppliers;
    return [];
  }, [partyType, customers, suppliers]);

  useEffect(() => {
    const numAmount = Number(amount);
    if (!isNaN(numAmount) && numAmount > 0) {
      setAmountInWords(numberToArabicWords(numAmount));
    } else {
      setAmountInWords('');
    }
  }, [amount]);

  const handleSave = () => {
    // Validation
    if (!activeShift) { alert('يجب فتح وردية أولاً'); return; }
    if (!amount || Number(amount) <= 0) { alert('المبلغ يجب أن يكون أكبر من صفر'); return; }
    if (partyType !== 'general' && !partyId) { alert('يجب تحديد العميل أو المورد'); return; }

    const partyName = partyType === 'customer' ? customers.find(c=>c.id===partyId)?.name : suppliers.find(s=>s.id===partyId)?.name;
    const vNum = `VOU-${type === 'قبض' ? 'REC' : 'PAY'}-${serial}`;

    // Create Voucher
    const newVoucher: Voucher = {
      id: Date.now().toString(),
      voucherNumber: vNum,
      date,
      time: new Date().toLocaleTimeString('ar-EG'),
      type,
      amount: Number(amount),
      partyName: partyName || 'حساب عام',
      category: 'عام',
      note: description,
      shiftId: activeShift.id
    };
    setVouchers(prev => [newVoucher, ...prev]);

    // Create Cheque if applicable
    if (isCheck) {
      const newCheque: Cheque = {
        id: Date.now().toString(),
        chequeNumber: checkNum,
        bankName,
        amount: Number(amount),
        dueDate,
        issueDate: date,
        beneficiary: partyName || 'غير محدد',
        type: type === 'قبض' ? 'receivable' : 'payable',
        status: checkStatus,
        note: `مرتبط بسند ${type} رقم ${vNum}`
      };
      setCheques(prev => [newCheque, ...prev]);
    }
    
    // Update Party Balance
    if (partyType === 'customer' && partyId) {
      setCustomers(prev => prev.map(c => c.id === partyId ? { ...c, balance: c.balance - Number(amount) } : c));
    } else if (partyType === 'supplier' && partyId) {
      setSuppliers(prev => prev.map(s => s.id === partyId ? { ...s, balance: s.balance - Number(amount) } : s));
    }
    
    alert('تم الحفظ بنجاح!');
    handleNew();
  };
  
  const handleNew = () => {
    setSerial((vouchers.length + 2).toString().padStart(5, '0'));
    setDocNum(''); setDate(new Date().toISOString().split('T')[0]); setPartyId('');
    setDescription(''); setAmount(''); setAmountInWords(''); setRepId('');
    setIsCheck(false); setCheckNum(''); setDueDate(new Date().toISOString().split('T')[0]);
    setBankName(''); setCheckStatus('pending');
  };

  if (!activeShift) {
    // ... (unchanged)
  }

  return (
    <div className="bg-slate-100 p-8 rounded-[40px] shadow-inner border font-['Cairo'] text-right animate-in fade-in duration-500">
      {/* Toolbar */}
      <div className="bg-white rounded-3xl shadow-sm border p-4 flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <button onClick={handleNew} className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg font-bold text-xs flex items-center gap-1"><File size={14}/> F2 جديد</button>
          <button onClick={handleSave} className="px-4 py-2 bg-green-50 text-green-700 rounded-lg font-bold text-xs flex items-center gap-1"><Save size={14}/> F3 حفظ</button>
          <button className="px-4 py-2 bg-slate-50 text-slate-700 rounded-lg font-bold text-xs flex items-center gap-1"><X size={14}/> F4 إلغاء</button>
          <button className="px-4 py-2 bg-red-50 text-red-700 rounded-lg font-bold text-xs flex items-center gap-1"><Trash2 size={14}/> F5 حذف</button>
          <div className="w-px h-6 bg-slate-200 mx-2"></div>
          <button className="px-4 py-2 bg-slate-50 text-slate-700 rounded-lg font-bold text-xs flex items-center gap-1"><Printer size={14}/> F6 طباعة</button>
        </div>
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-black text-slate-800">إذن استلام {isCheck ? 'شيكات' : 'نقدية'}</h2>
          <div className={`p-3 rounded-2xl ${type === 'قبض' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
            {type === 'قبض' ? <ArrowDownCircle size={24}/> : <ArrowUpCircle size={24}/>}
          </div>
        </div>
      </div>
      
      {/* Main Form */}
      <div className="bg-white p-10 rounded-3xl shadow-sm border space-y-8">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end pb-6 border-b border-dashed">
            <Field label="مسلسل" value={serial} readOnly icon={<Hash size={14}/>}/>
            <Field label="الرقم الدفتري" value={docNum} onChange={setDocNum} icon={<Edit size={14}/>}/>
            <Field label="التاريخ" value={date} onChange={setDate} type="date" icon={<Calendar size={14}/>}/>
            <div className="text-left text-[10px] text-slate-400 font-bold space-y-1">
               <p>تاريخ التسجيل: {new Date().toLocaleDateString('ar-EG')}</p>
               <p>آخر تعديل: لم يحفظ بعد</p>
            </div>
        </div>
        
        {/* Transaction Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 items-start">
            <div className="space-y-4">
                <label className="text-xs font-bold text-slate-500">استلمنا من السيد/السادة:</label>
                <div className="grid grid-cols-3 gap-2 bg-slate-50 p-1 rounded-xl">
                    <button onClick={() => setPartyType('customer')} className={`py-2 rounded-lg text-xs font-bold ${partyType === 'customer' ? 'bg-white shadow-sm' : ''}`}>عميل</button>
                    <button onClick={() => setPartyType('supplier')} className={`py-2 rounded-lg text-xs font-bold ${partyType === 'supplier' ? 'bg-white shadow-sm' : ''}`}>مورد</button>
                    <button onClick={() => setPartyType('general')} className={`py-2 rounded-lg text-xs font-bold ${partyType === 'general' ? 'bg-white shadow-sm' : ''}`}>عام</button>
                </div>
                <select value={partyId} onChange={e => setPartyId(e.target.value)} className="w-full bg-slate-50 p-3 rounded-lg font-bold border-none outline-none">
                    <option value="">-- اختر الحساب --</option>
                    {parties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <Field label="وذلك عن" value={description} onChange={setDescription} icon={<MessageSquare size={14}/>}/>
            </div>
            
            <div className="space-y-4">
                <Field label="مبلغ وقدره" type="number" value={amount as string} onChange={v => setAmount(v as string)} icon={<Banknote size={14}/>}/>
                <Field label="فقط" value={amountInWords} readOnly icon={<ChevronsRight size={14}/>} />
                <Field label="المندوب" as="select" value={repId} onChange={setRepId} options={[{id:'', name: '--'}, ...customers]} icon={<Briefcase size={14}/>} />
            </div>
        </div>

        {/* Check Details */}
        <div className="pt-6 border-t border-dashed space-y-6">
            <div className="flex items-center gap-4">
                <input type="checkbox" id="isCheck" checked={isCheck} onChange={e => setIsCheck(e.target.checked)} className="w-5 h-5"/>
                <label htmlFor="isCheck" className="font-black text-slate-800 text-lg">استلام بشيك</label>
            </div>
            {isCheck && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-slate-50 rounded-2xl border animate-in fade-in">
                    <Field label="رقم الشيك" value={checkNum} onChange={setCheckNum} />
                    <Field label="تاريخ الاستحقاق" type="date" value={dueDate} onChange={setDueDate} />
                    <Field label="البنك المسحوب عليه" value={bankName} onChange={setBankName} />
                    <div className="md:col-span-3">
                        <label className="text-xs font-bold text-slate-500 mb-2 block">حالة الشيك</label>
                        <div className="flex gap-2">
                           <RadioBtn label="في الانتظار" name="status" value="pending" checked={checkStatus === 'pending'} onChange={v => setCheckStatus(v as ChequeStatus)}/>
                           <RadioBtn label="تم التسديد" name="status" value="cleared" checked={checkStatus === 'cleared'} onChange={v => setCheckStatus(v as ChequeStatus)}/>
                           <RadioBtn label="مردود" name="status" value="returned" checked={checkStatus === 'returned'} onChange={v => setCheckStatus(v as ChequeStatus)}/>
                        </div>
                    </div>
                </div>
            )}
        </div>
      </div>
      
      {/* Footer */}
      <div className="bg-white rounded-3xl shadow-sm border p-4 flex justify-between items-center mt-6">
         <p className="text-xs font-bold text-slate-400 flex items-center gap-2"><Info size={14}/> هذا السند يؤثر محاسبياً على الخزينة وحساب الطرف الآخر.</p>
         <button className="px-6 py-2 bg-slate-100 text-slate-500 rounded-lg font-bold text-xs flex items-center gap-1">F10 خروج</button>
      </div>
    </div>
  );
};

// Helper components
const Field = ({ label, value, onChange, type, readOnly, icon, as, options }: any) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-bold text-slate-500">{label}</label>
    <div className="relative">
       {icon && <div className="absolute top-3.5 right-3 text-slate-400">{icon}</div>}
       {as === 'select' ? (
         <select value={value} onChange={e => onChange(e.target.value)} className="w-full bg-slate-50 p-3 rounded-lg font-bold border-none outline-none pr-9">
            {options.map((o: any) => <option key={o.id} value={o.id}>{o.name}</option>)}
         </select>
       ) : (
         <input 
          type={type || 'text'} 
          value={value} 
          onChange={e => onChange && onChange(e.target.value)} 
          readOnly={readOnly}
          className={`w-full bg-slate-50 p-3 rounded-lg font-bold border-none outline-none ${readOnly ? 'text-slate-400' : 'text-slate-800'} ${icon ? 'pr-9' : 'pr-3'}`}
         />
       )}
    </div>
  </div>
);

const RadioBtn = ({ label, name, value, checked, onChange }: any) => (
  <label className={`px-4 py-2 rounded-lg font-bold text-xs cursor-pointer border-2 transition-all ${checked ? 'bg-blue-500 text-white border-blue-500' : 'bg-white border-slate-200'}`}>
    <input type="radio" name={name} value={value} checked={checked} onChange={e => onChange(e.target.value)} className="hidden"/>
    {label}
  </label>
);


export default Vouchers;
