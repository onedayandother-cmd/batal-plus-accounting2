
import React, { useState } from 'react';
import { Users, DollarSign, Plus, Minus, CreditCard, Calendar, UserPlus, Trash2, Edit3, Save } from 'lucide-react';
import { Employee, UserRole } from '../types';

interface EmployeeManagementProps {
  employees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
}

const EmployeeManagement: React.FC<EmployeeManagementProps> = ({ employees, setEmployees }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Partial<Employee>>({
    name: '', role: 'CASHIER' as UserRole, baseSalary: 0, commissions: 0, deductions: 0, advances: 0
  });

  const handleSave = () => {
    if (!formData.name) return;
    const newEmp: Employee = {
      ...(formData as Employee),
      id: Date.now().toString(),
      hireDate: new Date().toISOString().split('T')[0]
    };
    setEmployees([...employees, newEmp]);
    setIsAdding(false);
    setFormData({ name: '', role: 'CASHIER' as UserRole, baseSalary: 0, commissions: 0, deductions: 0, advances: 0 });
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 font-['Cairo'] text-right pb-20">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white p-10 rounded-[50px] shadow-sm border">
        <div>
          <h2 className="text-3xl font-black text-slate-800">إدارة الكوادر البشرية والرواتب</h2>
          <p className="text-slate-500 font-bold">تنظيم المستحقات المالية، السلف، وكفاءة فريق العمل</p>
        </div>
        <button onClick={() => setIsAdding(true)} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black shadow-xl hover:bg-black transition-all flex items-center gap-3">
          <UserPlus size={20} /> إضافة موظف جديد
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {employees.map(emp => (
          <div key={emp.id} className="bg-white p-8 rounded-[45px] border border-slate-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full"></div>
            <div className="flex justify-between items-start mb-8 relative z-10">
               <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-[25px] flex items-center justify-center font-black text-2xl group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                  {emp.name[0]}
               </div>
               <div className="text-left">
                  <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">{emp.role}</span>
                  <p className="text-[10px] text-slate-400 font-bold mt-1">تاريخ التعيين: {emp.hireDate}</p>
               </div>
            </div>
            
            <h3 className="text-xl font-black text-slate-800 mb-6">{emp.name}</h3>

            <div className="grid grid-cols-2 gap-3 mb-8">
               <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase mb-1">الراتب الأساسي</p>
                  <p className="font-black text-slate-800">{emp.baseSalary.toLocaleString()} ج.م</p>
               </div>
               <div className="bg-red-50 p-4 rounded-3xl border border-red-100">
                  <p className="text-[9px] font-black text-red-400 uppercase mb-1">إجمالي السلف</p>
                  <p className="font-black text-red-600">{emp.advances.toLocaleString()} ج.م</p>
               </div>
            </div>

            <div className="flex gap-2">
               <button className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-black text-[10px] hover:bg-black transition-all">صرف الراتب</button>
               <button className="flex-1 py-3 bg-blue-50 text-blue-600 rounded-xl font-black text-[10px] hover:bg-blue-100 transition-all">سجل السلف</button>
            </div>
          </div>
        ))}
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-[300] bg-slate-900/60 backdrop-blur-2xl flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-xl rounded-[50px] p-12 shadow-2xl animate-in zoom-in border-4 border-white my-10">
             <div className="flex justify-between items-center mb-10">
                <h2 className="text-3xl font-black">تسجيل موظف جديد</h2>
                <button onClick={() => setIsAdding(false)} className="p-3 bg-slate-50 rounded-full"><Plus className="rotate-45" /></button>
             </div>
             <div className="space-y-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase pr-4">الاسم الكامل</label>
                   <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 p-4 rounded-2xl font-black outline-none border-2 border-transparent focus:border-blue-500" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 pr-4">الراتب الأساسي</label>
                    <input type="number" value={formData.baseSalary} onChange={e => setFormData({...formData, baseSalary: parseFloat(e.target.value) || 0})} className="w-full bg-slate-50 p-4 rounded-2xl font-black" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 pr-4">الدور الوظيفي</label>
                    <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as any})} className="w-full bg-slate-50 p-4 rounded-2xl font-black">
                      <option value="CASHIER">كاشير</option>
                      <option value="DRIVER">مندوب توزيع</option>
                      <option value="STOREKEEPER">أمين مخزن</option>
                    </select>
                  </div>
                </div>
                <button onClick={handleSave} className="w-full py-6 bg-blue-600 text-white rounded-[30px] font-black text-xl shadow-xl">اعتماد الموظف في النظام</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeManagement;
