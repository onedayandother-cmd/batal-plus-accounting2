
import React, { useState } from 'react';
import { User, Phone, MapPin, Plus, Search, X, Trophy, Edit2, Trash2, Tag, ShieldAlert, TrendingUp, FileText, Crown, Star, Zap, MinusCircle, PlusCircle } from 'lucide-react';
import { Customer, PricingTier, LoyaltyRank, AppSettings } from '../types';
import StatementPreview from './StatementPreview';

interface CustomersProps {
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  settings: AppSettings;
}

const Customers: React.FC<CustomersProps> = ({ customers, setCustomers, settings }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [statementCustomer, setStatementCustomer] = useState<Customer | null>(null);
  const [managingPoints, setManagingPoints] = useState<Customer | null>(null);
  const [pointsAction, setPointsAction] = useState<'add' | 'redeem'>('add');
  const [pointsValue, setPointsValue] = useState<number>(0);
  const [pointsNote, setPointsNote] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({ 
    name: '', 
    phone: '', 
    address: '',
    region: '', 
    creditLimit: 5000, 
    initialDebit: 0, 
    initialCredit: 0,
    tier: PricingTier.RETAIL,
    loyaltyPoints: 0 // Added for editing existing points if needed
  });

  const handleSave = () => {
    if (!formData.name) return;
    
    if (editingCustomer) {
      setCustomers(customers.map(c => c.id === editingCustomer.id ? { ...c, ...formData } : c));
      setEditingCustomer(null);
    } else {
      const balance = formData.initialDebit - formData.initialCredit;
      const newC: Customer = {
        id: Date.now().toString(),
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        region: formData.region,
        balance: balance,
        creditLimit: formData.creditLimit,
        loyaltyPoints: formData.loyaltyPoints || 0,
        loyaltyRank: LoyaltyRank.BRONZE,
        totalSpent: 0,
        tier: formData.tier,
        transactions: balance !== 0 ? [{
          id: 'init',
          date: new Date().toISOString().split('T')[0],
          note: 'رصيد افتتاح سابق',
          type: balance > 0 ? 'سحب' : 'إيداع',
          amount: Math.abs(balance),
          balanceAfter: balance
        }] : []
      };
      setCustomers([...customers, newC]);
    }
    setFormData({ name: '', phone: '', address: '', region: '', creditLimit: 5000, initialDebit: 0, initialCredit: 0, tier: PricingTier.RETAIL, loyaltyPoints: 0 });
    setIsAdding(false);
  };

  const handlePointsSubmit = () => {
    if (!managingPoints || pointsValue <= 0) return;

    setCustomers(customers.map(c => {
        if (c.id === managingPoints.id) {
            const newPoints = pointsAction === 'add' 
                ? c.loyaltyPoints + pointsValue 
                : Math.max(0, c.loyaltyPoints - pointsValue);
            
            return { ...c, loyaltyPoints: newPoints };
        }
        return c;
    }));

    setManagingPoints(null);
    setPointsValue(0);
    setPointsNote('');
    alert(`تم ${pointsAction === 'add' ? 'إضافة' : 'خصم'} النقاط بنجاح`);
  };

  const filtered = customers.filter(c => 
    c.name.includes(searchTerm) || 
    c.phone.includes(searchTerm)
  );

  const getRankConfig = (rank: LoyaltyRank) => {
    switch(rank) {
      case LoyaltyRank.PLATINUM: return { icon: <Crown size={14} />, color: 'bg-slate-900 text-white', label: 'بلاتيني' };
      case LoyaltyRank.GOLD: return { icon: <Star size={14} />, color: 'bg-yellow-100 text-yellow-700', label: 'ذهبي' };
      case LoyaltyRank.SILVER: return { icon: <Trophy size={14} />, color: 'bg-slate-100 text-slate-600', label: 'فضي' };
      default: return { icon: <Zap size={14} />, color: 'bg-orange-100 text-orange-700', label: 'برونزي' };
    }
  };

  const getNextRankProgress = (spent: number) => {
    if (spent >= 100000) return { percent: 100, next: 'MAX' };
    if (spent >= 50000) return { percent: ((spent - 50000) / 50000) * 100, next: '100k' };
    if (spent >= 10000) return { percent: ((spent - 10000) / 40000) * 100, next: '50k' };
    return { percent: (spent / 10000) * 100, next: '10k' };
  };

  return (
    <div className="space-y-10 text-right font-['Cairo'] pb-20 animate-in fade-in duration-500">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8 bg-white p-10 rounded-[50px] shadow-sm border border-slate-100">
        <div>
          <h2 className="text-3xl font-black text-slate-800">قاعدة بيانات العملاء والائتمان</h2>
          <p className="text-slate-500 font-bold">الرقابة المالية على المديونيات ونظام نقاط الولاء للعملاء المميزين</p>
        </div>
        <div className="flex bg-slate-100 p-2 rounded-[25px] shadow-inner w-full xl:w-auto gap-2">
           <div className="relative flex-1 xl:w-80">
              <input type="text" placeholder="بحث بالاسم أو الهاتف..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-white border-none rounded-2xl px-12 py-3 pr-12 outline-none font-bold text-sm shadow-sm" />
              <Search size={18} className="absolute right-4 top-3 text-slate-400" />
           </div>
           <button onClick={() => { setEditingCustomer(null); setFormData({name:'', phone:'', address:'', region: '', creditLimit: 5000, initialDebit:0, initialCredit:0, tier: PricingTier.RETAIL, loyaltyPoints: 0}); setIsAdding(true); }} className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black text-xs shadow-xl hover:bg-blue-700 transition-all flex items-center gap-2">
            <Plus size={18} /> إضافة عميل
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map((c) => {
          const rankConfig = getRankConfig(c.loyaltyRank || LoyaltyRank.BRONZE);
          const progress = getNextRankProgress(c.totalSpent);
          
          return (
          <div 
            key={c.id} 
            onClick={() => setStatementCustomer(c)}
            className="bg-white p-8 rounded-[45px] border border-slate-100 shadow-sm hover:shadow-xl transition-all relative group overflow-hidden cursor-pointer"
          >
            {c.balance > c.creditLimit && (
              <div className="absolute top-0 inset-x-0 bg-red-600 text-white py-1 text-[9px] font-black text-center uppercase tracking-widest">متجاوز لحد الائتمان</div>
            )}
            <div className="flex items-start justify-between mb-6">
              <div className="w-16 h-16 rounded-[25px] bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                <User size={30} />
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                 <button onClick={(e) => { e.stopPropagation(); setEditingCustomer(c); setFormData({name: c.name, phone: c.phone, address: c.address, region: c.region, creditLimit: c.creditLimit, tier: c.tier, initialDebit: 0, initialCredit: 0, loyaltyPoints: c.loyaltyPoints}); setIsAdding(true); }} className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all"><Edit2 size={16}/></button>
                 <button onClick={(e) => { e.stopPropagation(); setCustomers(customers.filter(x => x.id !== c.id))}} className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all"><Trash2 size={16}/></button>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-xl font-black text-slate-800 mb-1 flex items-center gap-2">
                  {c.name}
                  <span className={`px-2 py-0.5 rounded-full text-[8px] font-black flex items-center gap-1 ${rankConfig.color}`}>
                      {rankConfig.icon} {rankConfig.label}
                  </span>
              </h3>
              <div className="flex gap-2">
                <span className={`px-3 py-1 rounded-full text-[9px] font-black border flex items-center gap-1 ${
                    c.tier === PricingTier.SUPER_WHOLESALE ? 'bg-purple-50 text-purple-600 border-purple-100' : 
                    c.tier === PricingTier.WHOLESALE ? 'bg-blue-50 text-blue-600 border-blue-100' :
                    'bg-slate-50 text-slate-500 border-slate-100'
                }`}>
                    <Tag size={10} /> {c.tier}
                </span>
                <span className="px-3 py-1 rounded-full text-[9px] font-black bg-slate-100 text-slate-500">حد: {c.creditLimit.toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-3 text-slate-500 text-xs font-bold">
                 <Phone size={14} className="text-blue-500" /> {c.phone || '---'}
              </div>
              <div className="flex items-center gap-3 text-slate-500 text-xs font-bold">
                 <MapPin size={14} className="text-red-500" /> {c.address || '---'}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
               <div className={`p-4 rounded-3xl text-center border-2 ${c.balance > c.creditLimit ? 'bg-red-50 border-red-100' : 'bg-slate-50 border-slate-50'}`}>
                  <p className="text-[9px] font-black text-slate-400 uppercase mb-1">المديونية</p>
                  <p className={`font-black text-sm ${c.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>{c.balance.toLocaleString()} ج.م</p>
               </div>
               <div className="bg-indigo-50 p-4 rounded-3xl text-center border-2 border-indigo-50 relative group/points cursor-pointer" onClick={(e) => { e.stopPropagation(); setManagingPoints(c); setPointsAction('add');}}>
                  <p className="text-[9px] font-black text-indigo-600 uppercase mb-1 flex items-center justify-center gap-1"><Trophy size={10}/> نقاط الولاء</p>
                  <p className="font-black text-sm text-indigo-700">{c.loyaltyPoints.toLocaleString()}</p>
                  <div className="absolute inset-0 bg-indigo-600/10 opacity-0 group-hover/points:opacity-100 transition-opacity rounded-3xl flex items-center justify-center">
                      <Edit2 size={16} className="text-indigo-600"/>
                  </div>
               </div>
            </div>

            {/* Rank Progress Bar */}
            <div className="mb-4">
                <div className="flex justify-between text-[8px] font-black text-slate-400 mb-1 uppercase">
                    <span>التقدم للترقية</span>
                    <span>{progress.next !== 'MAX' ? `${Math.round(progress.percent)}%` : 'MAX'}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 transition-all duration-1000" style={{width: `${progress.percent}%`}}></div>
                </div>
            </div>
          </div>
        )})}
      </div>

      {/* Add/Edit Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-[250] bg-slate-900/60 backdrop-blur-2xl flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-[50px] p-12 shadow-2xl animate-in zoom-in duration-300 my-10 border-4 border-white">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-3xl font-black text-slate-800">{editingCustomer ? 'تحديث الائتمان' : 'إضافة حساب عميل'}</h2>
              <button onClick={() => setIsAdding(false)} className="p-3 bg-slate-50 text-slate-400 rounded-full hover:bg-red-50 hover:text-red-500 transition-all"><X /></button>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase pr-4 tracking-widest">اسم العميل (الشركة)</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 border-2 border-transparent rounded-[25px] px-8 py-5 focus:border-blue-500 outline-none font-black text-sm transition-all shadow-inner" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">رقم الهاتف</label>
                   <input type="text" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full bg-slate-50 border-2 border-transparent rounded-[25px] px-8 py-4 font-black text-sm outline-none focus:border-blue-500 shadow-inner" />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-blue-600">فئة السعر المطبقة</label>
                   <div className="relative">
                       <select 
                        value={formData.tier} 
                        onChange={(e) => setFormData({...formData, tier: e.target.value as PricingTier})} 
                        className="w-full bg-blue-50 border-2 border-blue-100 text-blue-800 rounded-[25px] px-8 py-4 font-black text-sm outline-none focus:border-blue-500 shadow-inner cursor-pointer"
                       >
                          {Object.values(PricingTier).map(t => <option key={t} value={t}>{t}</option>)}
                       </select>
                       <Tag size={16} className="absolute left-4 top-4 text-blue-400 pointer-events-none" />
                   </div>
                </div>
              </div>

              <div className="bg-orange-50 p-6 rounded-[35px] border-2 border-orange-100 space-y-4">
                 <div className="flex items-center gap-3 text-orange-600 font-black text-xs">
                    <ShieldAlert size={18} /> السياسة الائتمانية
                 </div>
                 <div className="space-y-2">
                    <label className="text-[9px] font-black text-orange-400 uppercase pr-4 tracking-widest">أقصى حد مديونية مسموح به (ج.م)</label>
                    <input 
                      type="number" 
                      value={formData.creditLimit} 
                      onChange={(e) => setFormData({...formData, creditLimit: parseFloat(e.target.value) || 0})} 
                      className="w-full bg-white border-2 border-transparent rounded-[20px] px-6 py-4 font-black text-xl text-center text-orange-700 outline-none focus:border-orange-500 shadow-sm" 
                    />
                 </div>
              </div>

              {editingCustomer && (
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase pr-4">نقاط الولاء الحالية (تعديل يدوي)</label>
                    <input 
                        type="number" 
                        value={formData.loyaltyPoints} 
                        onChange={(e) => setFormData({...formData, loyaltyPoints: parseInt(e.target.value) || 0})} 
                        className="w-full bg-slate-50 border-none rounded-[20px] px-6 py-4 font-black text-center text-slate-700" 
                    />
                  </div>
              )}

              {!editingCustomer && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-[9px] font-black text-red-500 uppercase pr-4">مدين افتتاحاً</label>
                    <input type="number" value={formData.initialDebit} onChange={(e) => setFormData({...formData, initialDebit: parseFloat(e.target.value) || 0})} className="w-full bg-red-50 border-none rounded-[20px] px-6 py-4 font-black text-center text-red-600" />
                </div>
                <div className="space-y-2">
                    <label className="text-[9px] font-black text-green-500 uppercase pr-4">دائن افتتاحاً</label>
                    <input type="number" value={formData.initialCredit} onChange={(e) => setFormData({...formData, initialCredit: parseFloat(e.target.value) || 0})} className="w-full bg-green-50 border-none rounded-[20px] px-6 py-4 font-black text-center text-green-600" />
                </div>
              </div>
              )}

              <button onClick={handleSave} className="w-full py-6 bg-slate-900 text-white font-black rounded-[30px] shadow-2xl hover:bg-black transition-all flex items-center justify-center gap-3">
                <TrendingUp size={20} /> حفظ واعتماد الحساب
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Points Management Modal */}
      {managingPoints && (
        <div className="fixed inset-0 z-[300] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in border-4 border-white">
                <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Trophy size={20} className="text-yellow-400"/>
                        <h3 className="font-black">إدارة نقاط الولاء</h3>
                    </div>
                    <button onClick={() => setManagingPoints(null)} className="hover:text-red-400"><X size={20}/></button>
                </div>
                <div className="p-8 text-center space-y-6">
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase">العميل</p>
                        <h2 className="text-xl font-black text-slate-800">{managingPoints.name}</h2>
                        <div className="mt-2 inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-1 rounded-full text-sm font-black">
                            {managingPoints.loyaltyPoints} نقطة حالية
                        </div>
                    </div>

                    <div className="flex bg-slate-100 p-1.5 rounded-xl">
                        <button onClick={() => setPointsAction('add')} className={`flex-1 py-2 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-2 ${pointsAction === 'add' ? 'bg-white text-green-600 shadow-sm' : 'text-slate-400'}`}>
                            <PlusCircle size={14}/> إضافة
                        </button>
                        <button onClick={() => setPointsAction('redeem')} className={`flex-1 py-2 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-2 ${pointsAction === 'redeem' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-400'}`}>
                            <MinusCircle size={14}/> خصم / استبدال
                        </button>
                    </div>

                    <div className="space-y-3">
                        <input 
                            type="number" 
                            value={pointsValue || ''}
                            onChange={(e) => setPointsValue(parseInt(e.target.value) || 0)}
                            placeholder="عدد النقاط"
                            className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 text-center font-black text-2xl outline-none focus:border-indigo-500"
                        />
                        <input 
                            type="text" 
                            value={pointsNote}
                            onChange={(e) => setPointsNote(e.target.value)}
                            placeholder="ملاحظات (سبب الإضافة/الخصم)"
                            className="w-full bg-slate-50 border-none rounded-xl p-3 text-xs font-bold outline-none"
                        />
                    </div>

                    <button 
                        onClick={handlePointsSubmit}
                        disabled={pointsValue <= 0 || (pointsAction === 'redeem' && pointsValue > managingPoints.loyaltyPoints)}
                        className={`w-full py-4 rounded-2xl font-black text-white shadow-xl transition-all ${pointsAction === 'add' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700 disabled:bg-slate-300'}`}
                    >
                        تأكيد العملية
                    </button>
                </div>
            </div>
        </div>
      )}

      {statementCustomer && (
        <StatementPreview 
          partyName={statementCustomer.name}
          partyType="customer"
          balance={statementCustomer.balance}
          transactions={statementCustomer.transactions}
          settings={settings}
          onClose={() => setStatementCustomer(null)}
        />
      )}
    </div>
  );
};

export default Customers;
