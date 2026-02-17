
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Box, ShoppingCart, Truck, RotateCcw, 
  Warehouse as WarehouseIcon, ClipboardCheck, Users, 
  History, Settings as SettingsIcon, FileText, LogOut,
  Bell, Menu, ChevronDown, Trophy, Wallet, Receipt, HelpCircle,
  ShieldAlert, FileSpreadsheet, Fingerprint, Search, Sparkles, X,
  CheckCircle2, AlertCircle, Moon, Sun, Mic, UserCog, Calculator as CalcIcon,
  SearchCode, Lock, Zap, Undo2, ClipboardList, CalendarClock, Clock, Landmark,
  BookText, Scale, Building2, Target, FileStack, ScrollText, PieChart, BarChart4, CalendarRange
} from 'lucide-react';
import { AppSettings, User, Notification, Product, Customer, Sale } from '../types';
import Calculator from './Calculator';
import CommandPalette from './CommandPalette';
import NotificationCenter from './NotificationCenter';

interface LayoutProps {
  children: React.ReactNode;
  settings: AppSettings;
  currentUser: User;
  products: Product[];
  customers: Customer[];
  sales: Sale[];
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  lowStockCount: number;
  onLogout: () => void;
  onToggleTheme: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, settings, currentUser, products, customers, sales, notifications, setNotifications, lowStockCount, onLogout, onToggleTheme }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeGroup, setActiveGroup] = useState<string | null>('sales_dept');
  const [showCalculator, setShowCalculator] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // اختصارات لوحة المفاتيح الاحترافية
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'k') { e.preventDefault(); setIsCommandOpen(prev => !prev); }
      if (e.key === 'F1') { e.preventDefault(); navigate('/sales'); }
      if (e.key === 'F2') { e.preventDefault(); setShowCalculator(prev => !prev); }
      if (e.key === 'F3') { e.preventDefault(); navigate('/inventory'); }
      if (e.key === 'F4') { e.preventDefault(); navigate('/customers'); }
      if (e.ctrlKey && e.key === 'l') { e.preventDefault(); setIsLocked(true); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  const unreadNotifs = notifications.filter(n => !n.read).length;

  // هيكلة القوائم بنظام الوحدات الإدارية (Modules)
  const navGroups = [
    {
      id: 'executive',
      label: 'الرئيسية والتقارير',
      icon: <PieChart size={18} />,
      items: [
        { to: '/', label: 'لوحة القيادة', icon: <LayoutDashboard size={16} />, show: true },
        { to: '/reports', label: 'مركز التقارير', icon: <BarChart4 size={16} />, show: currentUser.permissions.canSeeReports },
        { to: '/reports/monthly', label: 'التقرير الشهري', icon: <CalendarRange size={16} />, show: currentUser.permissions.canSeeReports },
        { to: '/audit-logs', label: 'سجل الرقابة', icon: <ShieldAlert size={16} />, show: currentUser.permissions.canAccessAuditLogs },
      ]
    },
    {
      id: 'sales_dept',
      label: 'المبيعات والعملاء',
      icon: <ShoppingCart size={18} />,
      items: [
        { to: '/sales', label: 'نقطة البيع (POS)', icon: <ShoppingCart size={16} />, show: true },
        { to: '/sales-management', label: 'سجل الفواتير', icon: <History size={16} />, show: true },
        { to: '/quotations', label: 'عروض الأسعار', icon: <FileSpreadsheet size={16} />, show: true },
        { to: '/customers', label: 'العملاء والولاء', icon: <Users size={16} />, show: true },
        { to: '/installments', label: 'التحصيل والآجل', icon: <CalendarClock size={16} />, show: true },
        { to: '/distribution', label: 'التوزيع والمناديب', icon: <Truck size={16} />, show: true },
        { to: '/returns', label: 'مرتجع المبيعات', icon: <RotateCcw size={16} />, show: true },
      ]
    },
    {
      id: 'supply_chain',
      label: 'المخزون والمشتريات',
      icon: <Box size={18} />,
      items: [
        { to: '/inventory', label: 'دليل الأصناف', icon: <Box size={16} />, show: true },
        { to: '/purchases', label: 'فاتورة توريد', icon: <Truck size={16} />, show: true },
        { to: '/purchases-management', label: 'أرشيف المشتريات', icon: <ClipboardList size={16} />, show: true },
        { to: '/suppliers', label: 'قاعدة الموردين', icon: <Users size={16} />, show: true },
        { to: '/warehouses', label: 'المواقع والتحويلات', icon: <WarehouseIcon size={16} />, show: true },
        { to: '/adjustments', label: 'التسويات الجردية', icon: <ClipboardCheck size={16} />, show: currentUser.permissions.canAdjustStock },
        { to: '/inventory-check', label: 'الجرد الفعلي', icon: <SearchCode size={16} />, show: currentUser.permissions.canAdjustStock },
        { to: '/purchase-returns', label: 'مردودات المشتريات', icon: <Undo2 size={16} />, show: true },
      ]
    },
    {
      id: 'financial',
      label: 'الإدارة المالية',
      icon: <Landmark size={18} />,
      items: [
        { to: '/journal', label: 'القيود اليومية', icon: <BookText size={16} />, show: true },
        { to: '/vouchers?type=receipt', label: 'سندات القبض', icon: <Wallet size={16} />, show: true },
        { to: '/vouchers?type=payment', label: 'سندات الصرف', icon: <Receipt size={16} />, show: true },
        { to: '/cheques', label: 'إدارة الشيكات', icon: <ScrollText size={16} />, show: true },
        { to: '/expenses', label: 'المصروفات', icon: <Zap size={16} />, show: true },
        { to: '/banks', label: 'البنوك والخزائن', icon: <Landmark size={16} />, show: true },
        { to: '/assets', label: 'الأصول الثابتة', icon: <Building2 size={16} />, show: true },
        { to: '/budgets', label: 'الموازنات التقديرية', icon: <Target size={16} />, show: true },
        { to: '/trial-balance', label: 'ميزان المراجعة', icon: <Scale size={16} />, show: currentUser.permissions.canSeeReports },
        { to: '/balance-sheet', label: 'الميزانية العمومية', icon: <FileStack size={16} />, show: currentUser.permissions.canSeeReports },
      ]
    },
    {
      id: 'hr',
      label: 'الموارد البشرية',
      icon: <Users size={18} />,
      items: [
        { to: '/shifts', label: 'الورديات (Shift)', icon: <Clock size={16} />, show: true },
        { to: '/employees', label: 'شؤون الموظفين', icon: <UserCog size={16} />, show: currentUser.role === 'ADMIN' },
        { to: '/commissions', label: 'الحوافز والعمولات', icon: <Trophy size={16} />, show: true },
      ]
    },
    {
      id: 'admin',
      label: 'إعدادات النظام',
      icon: <SettingsIcon size={18} />,
      items: [
        { to: '/settings', label: 'الإعدادات العامة', icon: <SettingsIcon size={16} />, show: currentUser.role === 'ADMIN' },
        { to: '/permissions', label: 'الصلاحيات', icon: <Fingerprint size={16} />, show: currentUser.permissions.canManageUsers },
      ]
    }
  ];

  if (isLocked) {
    return (
      <div className="fixed inset-0 z-[1000] bg-slate-950 flex items-center justify-center font-['Cairo']">
        <div className="text-center space-y-8 animate-in zoom-in duration-500">
           <div className="w-24 h-24 bg-blue-600 rounded-[35px] flex items-center justify-center mx-auto shadow-2xl shadow-blue-500/20">
              <Lock size={48} className="text-white" />
           </div>
           <div className="space-y-2">
             <h2 className="text-3xl font-black text-white">النظام مغلق مؤقتاً</h2>
             <p className="text-slate-400 font-bold">بانتظار المصادقة للعودة...</p>
           </div>
           <button onClick={() => setIsLocked(false)} className="px-12 py-4 bg-white text-slate-900 rounded-2xl font-black shadow-xl hover:scale-105 transition-all">العودة للعمل</button>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex h-screen font-['Cairo'] text-right ${settings.darkMode ? 'bg-slate-950 text-slate-200' : 'bg-slate-50 text-slate-900'}`} dir="rtl">
      {/* Sidebar - Enterprise Style */}
      <aside className={`${isSidebarOpen ? 'w-72' : 'w-24'} bg-slate-900 text-white transition-all duration-500 flex flex-col z-50 shrink-0 shadow-2xl relative overflow-hidden`}>
        {/* Logo Section */}
        <div className="h-20 flex items-center gap-4 px-6 border-b border-white/10 bg-slate-800/50 backdrop-blur-md">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/30">
            <Trophy size={20} className="text-white" />
          </div>
          {isSidebarOpen && (
            <div>
              <h1 className="font-black text-lg leading-tight">البطل <span className="text-blue-400">بلس</span></h1>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Enterprise ERP</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto no-scrollbar py-6 px-4 space-y-6">
          {navGroups.map(group => {
            const visibleItems = group.items.filter(i => i.show);
            if (visibleItems.length === 0) return null;
            
            const isActiveGroup = activeGroup === group.id;

            return (
              <div key={group.id} className="space-y-2">
                {isSidebarOpen ? (
                  <div className="space-y-1">
                    <p className="px-2 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                      {group.icon} {group.label}
                    </p>
                    <div className="space-y-1 relative border-r-2 border-slate-800 pr-2 mr-1">
                      {visibleItems.map(item => (
                        <Link
                          key={item.to}
                          to={item.to}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group relative overflow-hidden ${
                            location.pathname === item.to || location.pathname.startsWith(item.to + '?')
                              ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50 font-bold' 
                              : 'text-slate-400 hover:text-white hover:bg-white/5 font-medium'
                          }`}
                        >
                          <span className="shrink-0 relative z-10">{item.icon}</span>
                          <span className="text-xs relative z-10">{item.label}</span>
                          {location.pathname === item.to && <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-100 z-0"></div>}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  // Collapsed View
                  <div className="flex flex-col items-center gap-2 pb-4 border-b border-white/5 last:border-0">
                    <div className="text-slate-500 mb-1" title={group.label}>{group.icon}</div>
                    {visibleItems.map(item => (
                      <Link
                        key={item.to}
                        to={item.to}
                        className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${
                          location.pathname === item.to 
                            ? 'bg-blue-600 text-white shadow-lg' 
                            : 'text-slate-400 hover:bg-white/10 hover:text-white'
                        }`}
                        title={item.label}
                      >
                        {item.icon}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* User Footer */}
        <div className="p-4 border-t border-white/5 bg-slate-800/30">
           <button onClick={onLogout} className={`w-full flex items-center gap-3 p-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all font-bold text-xs ${!isSidebarOpen && 'justify-center'}`}>
              <LogOut size={18} /> {isSidebarOpen && <span>تسجيل الخروج</span>}
           </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative bg-slate-50/50">
        
        {/* Top Header - Glassmorphism */}
        <header className={`h-20 px-8 flex items-center justify-between shrink-0 z-40 transition-colors ${settings.darkMode ? 'bg-slate-900 border-b border-white/5' : 'bg-white/80 backdrop-blur-md border-b border-slate-200/50'}`}>
           
           {/* Left: Search & Toggle */}
           <div className="flex items-center gap-6">
              <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2.5 hover:bg-slate-100 rounded-xl text-slate-500 transition-all">
                <Menu size={22} />
              </button>
              
              <div 
                onClick={() => setIsCommandOpen(true)} 
                className="hidden lg:flex items-center gap-3 bg-slate-100/50 hover:bg-white border border-slate-200/50 hover:border-blue-200 hover:shadow-md transition-all rounded-2xl px-4 py-2.5 w-80 cursor-pointer group"
              >
                 <Search size={18} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
                 <span className="text-xs font-bold text-slate-400 group-hover:text-slate-600">بحث عالمي (أوامر، عملاء، أصناف)...</span>
                 <div className="mr-auto flex gap-1">
                    <span className="bg-slate-200 text-slate-500 text-[9px] px-1.5 py-0.5 rounded font-bold">Ctrl</span>
                    <span className="bg-slate-200 text-slate-500 text-[9px] px-1.5 py-0.5 rounded font-bold">K</span>
                 </div>
              </div>
           </div>

           {/* Right: Actions & Profile */}
           <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-slate-100/50 p-1.5 rounded-2xl border border-slate-200/50">
                <button onClick={() => setIsNotifOpen(true)} className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-500 hover:bg-white hover:text-blue-600 hover:shadow-sm transition-all relative">
                   <Bell size={20} />
                   {unreadNotifs > 0 && <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>}
                </button>
                <button onClick={() => setShowCalculator(!showCalculator)} className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-500 hover:bg-white hover:text-indigo-600 hover:shadow-sm transition-all" title="آلة حاسبة">
                   <CalcIcon size={20} />
                </button>
                <button onClick={onToggleTheme} className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-500 hover:bg-white hover:text-amber-500 hover:shadow-sm transition-all">
                   {settings.darkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>
              </div>

              <div className="h-8 w-px bg-slate-200 mx-2"></div>

              <div className="flex items-center gap-3 pl-2">
                <div className="text-left hidden lg:block">
                  <p className="text-sm font-black text-slate-800 leading-none mb-1">{currentUser.name}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{currentUser.role}</p>
                </div>
                <div className="w-11 h-11 bg-gradient-to-br from-slate-800 to-black text-white rounded-2xl flex items-center justify-center font-black text-lg shadow-lg ring-4 ring-slate-100 cursor-pointer hover:scale-105 transition-transform">
                  {currentUser.name[0]}
                </div>
              </div>
           </div>
        </header>

        {/* Content Wrapper */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-8 relative z-10 scroll-smooth">
          <div className="max-w-[1920px] mx-auto min-h-full flex flex-col">
            {children}
          </div>
        </div>

        {/* Overlays */}
        {showCalculator && <Calculator onClose={() => setShowCalculator(false)} />}
        <CommandPalette isOpen={isCommandOpen} onClose={() => setIsCommandOpen(false)} products={products} customers={customers} />
        <NotificationCenter isOpen={isNotifOpen} notifications={notifications} setNotifications={setNotifications} onClose={() => setIsNotifOpen(false)} />
      </main>
    </div>
  );
};

export default Layout;
