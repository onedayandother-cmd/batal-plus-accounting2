
import React from 'react';
import { Activity, ShieldAlert, User, Clock, Calendar, AlertCircle } from 'lucide-react';
import { AuditLog } from '../types';

interface AuditLogsProps {
  logs: AuditLog[];
}

const AuditLogs: React.FC<AuditLogsProps> = ({ logs }) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500 font-['Cairo'] text-right pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">سجل النشاط والرقابة</h2>
          <p className="text-slate-500 font-bold">متابعة كافة العمليات التي تمت على النظام لضمان الأمان</p>
        </div>
        <div className="w-16 h-16 bg-slate-900 text-white rounded-3xl flex items-center justify-center shadow-xl">
           <ShieldAlert size={32} />
        </div>
      </div>

      <div className="bg-white rounded-[45px] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-50 bg-slate-50/50 flex items-center gap-3">
           <Activity className="text-blue-600" size={20} />
           <h3 className="text-xl font-black text-slate-800">الحركات الأخيرة</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-slate-50/30 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b">
              <tr>
                <th className="px-8 py-5">المستخدم</th>
                <th className="px-8 py-5">الإجراء</th>
                <th className="px-8 py-5">التفاصيل</th>
                <th className="px-8 py-5 text-center">التوقيت</th>
                <th className="px-8 py-5 text-center">المستوى</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-32 text-center">
                     <div className="flex flex-col items-center opacity-20">
                        <Activity size={60} className="mb-4" />
                        <p className="font-black text-xl italic">لا يوجد سجلات نشاط حالية</p>
                     </div>
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-8 py-6">
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                             <User size={18} />
                          </div>
                          <span className="font-black text-slate-800">{log.userName}</span>
                       </div>
                    </td>
                    <td className="px-8 py-6">
                       <span className="font-black text-blue-600">{log.action}</span>
                    </td>
                    <td className="px-8 py-6">
                       <p className="text-xs font-bold text-slate-500 max-w-xs truncate">{log.details}</p>
                    </td>
                    <td className="px-8 py-6 text-center">
                       <div className="flex flex-col items-center">
                          <span className="text-xs font-black text-slate-700">{log.date}</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{log.time}</span>
                       </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                       <span className={`px-4 py-1.5 rounded-full text-[10px] font-black ${
                         log.severity === 'high' ? 'bg-red-50 text-red-600' :
                         log.severity === 'medium' ? 'bg-orange-50 text-orange-600' :
                         'bg-green-50 text-green-600'
                       }`}>
                         {log.severity === 'high' ? 'حرج' : log.severity === 'medium' ? 'متوسط' : 'عادي'}
                       </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;
