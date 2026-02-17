
import React from 'react';
import { Trophy, Star, Crown, Gift, TrendingUp, Users, ArrowUpRight, Zap } from 'lucide-react';
import { Customer, LoyaltyRank } from '../types';

interface LoyaltyManagerProps {
  customers: Customer[];
}

const LoyaltyManager: React.FC<LoyaltyManagerProps> = ({ customers }) => {
  const getRankStyle = (rank: LoyaltyRank) => {
    switch(rank) {
      case LoyaltyRank.PLATINUM: return 'from-slate-800 to-slate-900 text-white border-slate-700 shadow-slate-900/20';
      case LoyaltyRank.GOLD: return 'from-yellow-400 to-amber-600 text-white border-amber-300 shadow-amber-500/20';
      case LoyaltyRank.SILVER: return 'from-slate-200 to-slate-400 text-slate-800 border-slate-100 shadow-slate-300/20';
      default: return 'from-orange-400 to-orange-700 text-white border-orange-300 shadow-orange-500/20';
    }
  };

  const getRankIcon = (rank: LoyaltyRank) => {
    switch(rank) {
      case LoyaltyRank.PLATINUM: return <Crown size={32} className="text-blue-400" />;
      case LoyaltyRank.GOLD: return <Star size={32} className="text-yellow-200" />;
      case LoyaltyRank.SILVER: return <Trophy size={32} className="text-slate-100" />;
      default: return <Zap size={32} className="text-orange-200" />;
    }
  };

  const sortedCustomers = [...customers].sort((a, b) => b.loyaltyPoints - a.loyaltyPoints).slice(0, 10);

  return (
    <div className="space-y-10 animate-in fade-in duration-700 font-['Cairo'] text-right pb-20">
      <div className="flex flex-col lg:flex-row justify-between items-center gap-10 bg-slate-900 p-12 rounded-[60px] text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 blur-[150px] rounded-full"></div>
        <div className="relative z-10 max-w-2xl">
           <h2 className="text-4xl font-black mb-4 flex items-center gap-4"><Crown className="text-yellow-500" /> مركز مكافآت العملاء</h2>
           <p className="text-slate-400 font-bold leading-relaxed">
              قمنا بتطوير هذا النظام لتقدير عملائك الأكثر ولاءً. يتم احتساب النقاط آلياً بناءً على إجمالي المبيعات المحققة، مما يمنحهم مزايا حصرية وخصومات تلقائية.
           </p>
        </div>
        <div className="bg-white/5 border border-white/10 p-8 rounded-[40px] text-center shrink-0">
           <Gift size={48} className="text-pink-500 mx-auto mb-4 animate-bounce" />
           <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">إجمالي النقاط الموزعة</p>
           <h4 className="text-4xl font-black">{customers.reduce((a,b)=>a+b.loyaltyPoints, 0).toLocaleString()}</h4>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
         {/* القائمة الشرفية */}
         <div className="xl:col-span-2 bg-white rounded-[55px] shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-10 border-b bg-slate-50/50 flex justify-between items-center">
               <h3 className="text-2xl font-black text-slate-800">أعلى العملاء ولاءً (TOP 10)</h3>
               <Users className="text-blue-600" />
            </div>
            <div className="overflow-x-auto">
               <table className="w-full text-right">
                  <thead>
                     <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b">
                        <th className="px-10 py-6">العميل</th>
                        <th className="px-10 py-6 text-center">الرتبة الحالية</th>
                        <th className="px-10 py-6 text-center">إجمالي المسحوبات</th>
                        <th className="px-10 py-6 text-left">النقاط</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                     {sortedCustomers.map((c, i) => (
                       <tr key={c.id} className="hover:bg-blue-50/30 transition-all group">
                          <td className="px-10 py-8">
                             <div className="flex items-center gap-5">
                                <span className="text-xs font-black text-slate-300">#{i+1}</span>
                                <div>
                                   <p className="font-black text-slate-800">{c.name}</p>
                                   <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase">{c.phone}</p>
                                </div>
                             </div>
                          </td>
                          <td className="px-10 py-8 text-center">
                             <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                c.loyaltyRank === LoyaltyRank.PLATINUM ? 'bg-slate-900 text-white' :
                                c.loyaltyRank === LoyaltyRank.GOLD ? 'bg-amber-100 text-amber-600' :
                                c.loyaltyRank === LoyaltyRank.SILVER ? 'bg-slate-100 text-slate-600' :
                                'bg-orange-50 text-orange-600'
                             }`}>
                                {c.loyaltyRank}
                             </span>
                          </td>
                          <td className="px-10 py-8 text-center font-black text-slate-600">{c.totalSpent.toLocaleString()} ج.م</td>
                          <td className="px-10 py-8 text-left font-black text-blue-600 text-xl">{c.loyaltyPoints.toLocaleString()}</td>
                       </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>

         {/* كروت الرتب */}
         <div className="space-y-6">
            <h3 className="text-xl font-black text-slate-800 px-4">دليل الرتب والمزايا</h3>
            {[LoyaltyRank.PLATINUM, LoyaltyRank.GOLD, LoyaltyRank.SILVER, LoyaltyRank.BRONZE].map(rank => (
               <div key={rank} className={`p-8 rounded-[45px] bg-gradient-to-br border-4 shadow-2xl relative overflow-hidden transition-all hover:scale-[1.03] ${getRankStyle(rank)}`}>
                  <div className="absolute top-0 left-0 w-24 h-24 bg-white/10 blur-2xl rounded-full -translate-x-10 -translate-y-10"></div>
                  <div className="flex justify-between items-start mb-6">
                     <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-md">{getRankIcon(rank)}</div>
                     <div className="text-left">
                        <p className="text-[10px] font-black uppercase opacity-60">درجة الحساب</p>
                        <h4 className="text-2xl font-black tracking-tight">{rank}</h4>
                     </div>
                  </div>
                  <div className="space-y-2">
                     <div className="flex justify-between text-xs font-bold opacity-80">
                        <span>قيمة الخصم التلقائي</span>
                        <span className="font-black">{rank === LoyaltyRank.PLATINUM ? '5%' : rank === LoyaltyRank.GOLD ? '3%' : rank === LoyaltyRank.SILVER ? '1.5%' : '0%'}</span>
                     </div>
                     <div className="h-1.5 bg-black/10 rounded-full overflow-hidden">
                        <div className={`h-full bg-white transition-all duration-1000`} style={{width: rank === LoyaltyRank.PLATINUM ? '100%' : rank === LoyaltyRank.GOLD ? '75%' : rank === LoyaltyRank.SILVER ? '50%' : '25%'}}></div>
                     </div>
                  </div>
               </div>
            ))}
         </div>
      </div>
    </div>
  );
};

export default LoyaltyManager;
