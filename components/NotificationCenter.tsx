
import React from 'react';
import { X, Bell, Package, Wallet, ShieldAlert, CheckCircle, ArrowRight } from 'lucide-react';
import { Notification } from '../types';
import { useNavigate } from 'react-router-dom';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose, notifications, setNotifications }) => {
  const navigate = useNavigate();

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
    onClose();
  };

  const handleNotifClick = (n: Notification) => {
    setNotifications(notifications.map(item => item.id === n.id ? { ...item, read: true } : item));
    if (n.link) {
      navigate(n.link);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[600] flex justify-end font-['Cairo'] text-right">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose}></div>
      
      <div className="bg-white w-full max-w-md h-full shadow-2xl relative z-10 animate-in slide-in-from-left duration-500 flex flex-col">
        <div className="p-10 bg-slate-900 text-white flex justify-between items-center shadow-lg">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg"><Bell size={24}/></div>
              <h2 className="text-xl font-black">التنبيهات الإدارية</h2>
           </div>
           <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full"><X/></button>
        </div>

        <div className="p-4 bg-slate-50 border-b flex justify-between items-center px-8">
           <button onClick={markAllAsRead} className="text-[10px] font-black text-blue-600 hover:underline">تم قراءة الكل</button>
           <button onClick={clearAll} className="text-[10px] font-black text-red-500 hover:underline">مسح الكل</button>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-4">
           {notifications.length === 0 ? (
             <div className="h-full flex flex-col items-center justify-center opacity-20 space-y-4">
                <Bell size={64} />
                <p className="text-xl font-black">لا توجد تنبيهات جديدة</p>
             </div>
           ) : (
             notifications.map(n => (
               <div 
                key={n.id} 
                onClick={() => handleNotifClick(n)}
                className={`p-6 rounded-[30px] border-2 transition-all cursor-pointer relative group ${n.read ? 'bg-white border-slate-50' : 'bg-blue-50 border-blue-100 shadow-sm'}`}
               >
                  {!n.read && <div className="absolute top-6 left-6 w-2 h-2 bg-blue-600 rounded-full animate-ping"></div>}
                  <div className="flex gap-5">
                     <div className={`w-12 h-12 rounded-2xl shrink-0 flex items-center justify-center ${
                       n.type === 'stock' ? 'bg-orange-100 text-orange-600' :
                       n.type === 'debt' ? 'bg-red-100 text-red-600' :
                       'bg-blue-100 text-blue-600'
                     }`}>
                        {n.type === 'stock' ? <Package size={20}/> : n.type === 'debt' ? <Wallet size={20}/> : <ShieldAlert size={20}/>}
                     </div>
                     <div className="space-y-1 flex-1">
                        <h4 className="font-black text-sm text-slate-800">{n.title}</h4>
                        <p className="text-xs font-bold text-slate-400 leading-relaxed">{n.message}</p>
                        <p className="text-[9px] font-black text-slate-300 uppercase pt-2">{n.date}</p>
                     </div>
                  </div>
                  {n.link && (
                    <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end">
                       <span className="text-[10px] font-black text-blue-600 flex items-center gap-2 group-hover:translate-x-[-5px] transition-transform">الانتقال للإجراء <ArrowRight size={12}/></span>
                    </div>
                  )}
               </div>
             ))
           )}
        </div>

        <div className="p-8 bg-slate-900 text-center">
           <p className="text-[10px] font-bold text-slate-500">نظام البطل بلاس للمحاسبة الذكية v2.5</p>
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;
