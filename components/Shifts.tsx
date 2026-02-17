
import React, { useState } from 'react';
import { Clock, Unlock, Lock, Calculator, AlertTriangle, CheckCircle } from 'lucide-react';
import { Shift, Sale, Expense } from '../types';

interface ShiftsProps {
  shifts: Shift[];
  setShifts: React.Dispatch<React.SetStateAction<Shift[]>>;
  sales: Sale[];
  expenses: Expense[];
}

const Shifts: React.FC<ShiftsProps> = ({ shifts, setShifts, sales, expenses }) => {
  const [isOpening, setIsOpening] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [cashAmount, setCashAmount] = useState<number>(0);
  
  const activeShift = shifts.find(s => s.status === 'open');

  const handleOpenShift = () => {
    const newShift: Shift = {
      id: Date.now().toString(),
      startTime: new Date().toISOString(),
      startCash: cashAmount,
      totalSales: 0,
      totalExpenses: 0,
      status: 'open',
      user: 'المدير'
    };
    setShifts([newShift, ...shifts]);
    setIsOpening(false);
    setCashAmount(0);
  };

  const handleCloseShift = () => {
    if (!activeShift) return;
    
    const shiftSales = sales.filter(s => s.shiftId === activeShift.id && !s.isReturned);
    const shiftExpenses = expenses.filter(e => e.shiftId === activeShift.id);
    
    const totalSales = shiftSales.reduce((sum, s) => sum + (s.paymentType === 'كاش' ? s.totalAmount : 0), 0);
    const totalExpenses = shiftExpenses.reduce((sum, e) => sum + e.amount, 0);
    const expectedCash = activeShift.startCash + totalSales - totalExpenses;

    const updatedShifts = shifts.map(s => 
      s.id === activeShift.id ? { 
        ...s, 
        endTime: new Date().toISOString(), 
        status: 'closed' as const,
        totalSales,
        totalExpenses,
        endCash: expectedCash,
        actualCash: cashAmount
      } : s
    );

    setShifts(updatedShifts);
    setIsClosing(false);
    setCashAmount(0);
  };

  return (
    <div className="space-y-10 text-right animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
        <div>
          <h2 className="text-3xl font-black text-slate-800">إدارة الورديات</h2>
          <p className="text-slate-500 font-bold">متابعة الخزينة وإقفال اليومية</p>
        </div>
        {!activeShift ? (
          <button onClick={() => setIsOpening(true)} className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black shadow-xl hover:bg-blue-700 flex items-center gap-3">
            <Unlock size={22} /> فتح وردية جديدة
          </button>
        ) : (
          <button onClick={() => setIsClosing(true)} className="bg-red-600 text-white px-10 py-4 rounded-2xl font-black shadow-xl hover:bg-red-700 flex items-center gap-3">
            <Lock size={22} /> إغلاق الوردية الحالية
          </button>
        )}
      </div>

      {activeShift && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ShiftStat label="رصيد البداية" value={activeShift.startCash} color="blue" />
          <ShiftStat label="مبيعات الكاش الحالية" value={sales.filter(s => s.shiftId === activeShift.id && s.paymentType === 'كاش' && !s.isReturned).reduce((sum, s) => sum + s.totalAmount, 0)} color="green" />
          <ShiftStat label="المصروفات الحالية" value={expenses.filter(e => e.shiftId === activeShift.id).reduce((sum, e) => sum + e.amount, 0)} color="red" />
        </div>
      )}

      <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-right">
          <thead className="bg-slate-900 text-white text-[11px] font-black uppercase">
            <tr>
              <th className="px-8 py-6">الوردية</th>
              <th className="px-8 py-6">البداية</th>
              <th className="px-8 py-6">النهاية</th>
              <th className="px-8 py-6 text-center">رصيد المتوقع</th>
              <th className="px-8 py-6 text-center">الرصيد الفعلي</th>
              <th className="px-8 py-6 text-center">العجز/الزيادة</th>
              <th className="px-8 py-6 text-center">الحالة</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {shifts.map(s => (
              <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-8 py-6 font-black text-slate-800">#{s.id.slice(-4)}</td>
                <td className="px-8 py-6 text-xs font-bold text-slate-500">{new Date(s.startTime).toLocaleString('ar-EG')}</td>
                <td className="px-8 py-6 text-xs font-bold text-slate-500">{s.endTime ? new Date(s.endTime).toLocaleString('ar-EG') : '-'}</td>
                <td className="px-8 py-6 text-center font-black">{s.endCash?.toLocaleString() || '-'}</td>
                <td className="px-8 py-6 text-center font-black">{s.actualCash?.toLocaleString() || '-'}</td>
                <td className={`px-8 py-6 text-center font-black ${(s.actualCash || 0) - (s.endCash || 0) < 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {s.status === 'closed' ? `${((s.actualCash || 0) - (s.endCash || 0)).toLocaleString()} ج.م` : '-'}
                </td>
                <td className="px-8 py-6 text-center">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black ${s.status === 'open' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-600'}`}>
                    {s.status === 'open' ? 'مفتوحة' : 'مغلقة'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      {(isOpening || isClosing) && (
        <div className="fixed inset-0 z-[150] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white p-10 rounded-[50px] shadow-2xl w-full max-w-md text-center">
             <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 ${isOpening ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'}`}>
                {isOpening ? <Unlock size={40}/> : <Lock size={40}/>}
             </div>
             <h3 className="text-2xl font-black mb-2">{isOpening ? 'فتح وردية جديدة' : 'إغلاق الوردية'}</h3>
             <p className="text-slate-500 font-bold mb-8">{isOpening ? 'أدخل رصيد الكاش المتوفر في الدرج الآن' : 'قم بجرد الكاش الفعلي في الدرج وأدخل القيمة'}</p>
             <input 
               type="number" 
               autoFocus
               value={cashAmount} 
               onChange={e => setCashAmount(parseFloat(e.target.value) || 0)} 
               className="w-full bg-slate-50 border-none rounded-2xl px-6 py-5 text-center text-3xl font-black mb-8 focus:ring-4 focus:ring-blue-500/10 outline-none" 
             />
             <div className="flex gap-4">
                <button onClick={() => {setIsOpening(false); setIsClosing(false);}} className="flex-1 py-4 text-slate-400 font-black">إلغاء</button>
                <button 
                  onClick={isOpening ? handleOpenShift : handleCloseShift} 
                  className={`flex-1 py-4 rounded-2xl font-black text-white shadow-xl ${isOpening ? 'bg-blue-600 shadow-blue-200' : 'bg-red-600 shadow-red-200'}`}
                >
                  {isOpening ? 'تأكيد الفتح' : 'إتمام الإغلاق'}
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ShiftStat = ({ label, value, color }: { label: string; value: number; color: string }) => {
  const colors: any = { blue: 'text-blue-600 bg-blue-50', green: 'text-green-600 bg-green-50', red: 'text-red-600 bg-red-50' };
  return (
    <div className="bg-white p-8 rounded-[35px] shadow-sm border border-slate-100 flex flex-col items-center">
      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{label}</span>
      <span className={`text-2xl font-black ${colors[color].split(' ')[0]}`}>{value.toLocaleString()} ج.م</span>
    </div>
  );
};

export default Shifts;
