
import React, { useState } from 'react';
import { Trophy, ShieldCheck, ArrowRight, Fingerprint, AtSign, KeyRound } from 'lucide-react';
import { AppSettings, User } from '../types';

interface LoginProps {
  settings: AppSettings;
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ settings, onLogin }) => {
  const [mode, setMode] = useState<'pin' | 'cloud'>('pin');
  const [pin, setPin] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handlePinLogin = () => {
    const user = settings.users.find(u => u.pin === pin);
    if (user) {
      onLogin(user);
    } else {
      setError(true);
      setPin('');
      setTimeout(() => setError(false), 2000);
    }
  };

  const handleCloudLogin = () => {
    // Placeholder for future Firebase/Supabase integration
    alert('ميزة تسجيل الدخول السحابي قيد التطوير حالياً.');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 font-['Cairo'] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-600/10 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2"></div>

      <div className="bg-white/95 backdrop-blur-3xl p-12 rounded-[60px] w-full max-w-lg shadow-2xl text-center border-t-8 border-blue-500 relative z-10 animate-in zoom-in duration-500">
        <div className="w-24 h-24 bg-blue-600 rounded-[35px] flex items-center justify-center mx-auto mb-10 text-white shadow-2xl shadow-blue-500/30 transform -rotate-6 hover:rotate-0 transition-transform">
          <Trophy size={48} />
        </div>
        
        <div className="mb-10">
          <h2 className="text-3xl font-black text-slate-800">{settings.storeName}</h2>
          <p className="text-slate-400 font-bold mt-2 uppercase tracking-widest text-[10px]">نظام الإدارة المحاسبي المتكامل</p>
        </div>

        <div className="bg-slate-100 p-2 rounded-2xl flex gap-2 mb-8">
           <button onClick={() => setMode('pin')} className={`flex-1 py-3 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 ${mode === 'pin' ? 'bg-white shadow-md' : 'text-slate-400'}`}>
              <Fingerprint size={16}/> دخول محلي (PIN)
           </button>
           <button onClick={() => setMode('cloud')} className={`flex-1 py-3 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 ${mode === 'cloud' ? 'bg-white shadow-md' : 'text-slate-400'}`}>
              <AtSign size={16}/> حساب سحابي
           </button>
        </div>
        
        {mode === 'pin' && (
          <div className="space-y-6 animate-in fade-in">
            <input 
              type="password" 
              value={pin} 
              onChange={e => setPin(e.target.value)} 
              onKeyPress={e => e.key === 'Enter' && handlePinLogin()} 
              className={`w-full bg-slate-50 p-6 rounded-[30px] text-4xl text-center font-black tracking-[0.5em] outline-none border-4 transition-all ${error ? 'border-red-500 bg-red-50 animate-shake' : 'border-transparent focus:border-blue-500 focus:bg-white focus:shadow-inner'}`} 
              placeholder="••••"
              autoFocus
            />
            {error && <p className="text-red-500 text-xs font-bold mt-3">الرقم السري غير صحيح!</p>}
            <button onClick={handlePinLogin} className="w-full py-6 bg-slate-900 text-white rounded-[30px] font-black text-xl shadow-xl hover:bg-black transition-all flex items-center justify-center gap-3 active:scale-95 group">
              <span>دخول</span>
              <ArrowRight size={24} className="group-hover:translate-x-[-4px] transition-transform" />
            </button>
          </div>
        )}

        {mode === 'cloud' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="relative">
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-slate-50 p-4 rounded-2xl font-bold pr-12 outline-none border-2 border-transparent focus:border-blue-500" placeholder="البريد الإلكتروني"/>
              <AtSign className="absolute right-4 top-4 text-slate-300" />
            </div>
            <div className="relative">
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-slate-50 p-4 rounded-2xl font-bold pr-12 outline-none border-2 border-transparent focus:border-blue-500" placeholder="كلمة المرور"/>
              <KeyRound className="absolute right-4 top-4 text-slate-300" />
            </div>
            <button onClick={handleCloudLogin} className="w-full py-5 bg-blue-600 text-white rounded-[25px] font-black text-lg shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center gap-3">
              تسجيل الدخول
            </button>
            <p className="text-xs font-bold text-amber-600 bg-amber-50 p-2 rounded-lg">ميزة الحساب السحابي قيد التطوير وستتوفر قريباً.</p>
          </div>
        )}

        <div className="mt-12 flex items-center justify-center gap-2 text-slate-300">
          <ShieldCheck size={16} />
          <span className="text-[10px] font-bold uppercase tracking-widest">تشفير بيانات بمعايير عالمية</span>
        </div>
      </div>
    </div>
  );
};

export default Login;