
import React from 'react';
import { ShieldCheck, User as UserIcon, Lock, Eye, EyeOff, Trash2, Edit } from 'lucide-react';
import { User, AppSettings, UserPermissions } from '../types';

interface PermissionsProps {
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
}

const Permissions: React.FC<PermissionsProps> = ({ settings, setSettings }) => {
  const togglePermission = (userId: string, permission: keyof UserPermissions) => {
    const updatedUsers = settings.users.map(u => {
      if (u.id === userId) {
        return {
          ...u,
          permissions: {
            ...u.permissions,
            [permission]: !u.permissions[permission]
          }
        };
      }
      return u;
    });
    setSettings({ ...settings, users: updatedUsers });
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 font-['Cairo'] text-right pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-800">إدارة صلاحيات النظام</h2>
          <p className="text-slate-500 font-bold">التحكم في وصول الموظفين للبيانات الحساسة والوظائف الإدارية</p>
        </div>
        <div className="w-16 h-16 bg-blue-600 text-white rounded-3xl flex items-center justify-center shadow-xl">
           <ShieldCheck size={32} />
        </div>
      </div>

      <div className="bg-white rounded-[45px] shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-right">
          <thead className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest">
            <tr>
              <th className="px-8 py-6">الموظف</th>
              <th className="px-4 py-6 text-center">التكلفة</th>
              <th className="px-4 py-6 text-center">التقارير</th>
              <th className="px-4 py-6 text-center">التعديل</th>
              <th className="px-4 py-6 text-center">الحذف</th>
              <th className="px-4 py-6 text-center">المخزن</th>
              <th className="px-4 py-6 text-center">المستخدمين</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {settings.users.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${user.role === 'ADMIN' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                      {user.name[0]}
                    </div>
                    <div>
                      <p className="font-black text-slate-800 text-sm">{user.name}</p>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{user.role}</span>
                    </div>
                  </div>
                </td>
                <PermissionToggle active={user.permissions.canSeeCostPrice} onToggle={() => togglePermission(user.id, 'canSeeCostPrice')} />
                <PermissionToggle active={user.permissions.canSeeReports} onToggle={() => togglePermission(user.id, 'canSeeReports')} />
                <PermissionToggle active={user.permissions.canEditInvoices} onToggle={() => togglePermission(user.id, 'canEditInvoices')} />
                <PermissionToggle active={user.permissions.canDeleteInvoices} onToggle={() => togglePermission(user.id, 'canDeleteInvoices')} />
                <PermissionToggle active={user.permissions.canAdjustStock} onToggle={() => togglePermission(user.id, 'canAdjustStock')} />
                <PermissionToggle active={user.permissions.canManageUsers} onToggle={() => togglePermission(user.id, 'canManageUsers')} />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="bg-amber-50 p-8 rounded-[40px] border border-amber-100 flex gap-6 items-center">
         <div className="w-14 h-14 bg-amber-200 rounded-2xl flex items-center justify-center text-amber-600 shrink-0">
            <Lock size={28} />
         </div>
         <p className="text-xs font-bold text-amber-800 leading-relaxed">
            ملاحظة أمنية: يرجى الحذر عند منح صلاحية "حذف الفواتير" أو "تعديلها"، حيث تؤثر هذه العمليات مباشرة على الرصيد المخزني والمالي. يفضل دائماً استخدام نظام "المرتجع" بدلاً من الحذف لضمان دقة الرقابة المالية (Audit Trail).
         </p>
      </div>
    </div>
  );
};

const PermissionToggle = ({ active, onToggle }: { active: boolean; onToggle: () => void }) => (
  <td className="px-4 py-6 text-center">
    <button 
      onClick={onToggle}
      className={`w-12 h-6 rounded-full transition-all relative ${active ? 'bg-green-500' : 'bg-slate-200'}`}
    >
      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${active ? 'left-7' : 'left-1'}`}></div>
    </button>
  </td>
);

export default Permissions;
