
import React, { useState, useEffect, useMemo } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Sales from './components/Sales';
import Inventory from './components/Inventory';
import Commissions from './components/Commissions';
import Customers from './components/Customers';
import Suppliers from './components/Suppliers';
import Expenses from './components/Expenses';
import Purchases from './components/Purchases';
import PurchasesManagement from './components/PurchasesManagement';
import SalesManagement from './components/SalesManagement';
import Shifts from './components/Shifts';
import Vouchers from './components/Vouchers';
import Reports from './components/Reports';
import Warehouses from './components/Warehouses';
import AIAssistant from './components/AIAssistant';
import Login from './components/Login';
import AuditLogs from './components/AuditLogs';
import Quotations from './components/Quotations';
import Adjustments from './components/Adjustments';
import InventoryCheck from './components/InventoryCheck';
import Settings from './components/Settings';
import Permissions from './components/Permissions';
import LoyaltyManager from './components/LoyaltyManager';
import EmployeeManagement from './components/EmployeeManagement';
import Distribution from './components/Distribution';
import Returns from './components/Returns';
import PurchaseReturns from './components/PurchaseReturns';
import Installments from './components/Installments';
import BankManager from './components/BankManager';
import JournalEntries from './components/JournalEntries';
import TrialBalance from './components/TrialBalance';
import Assets from './components/Assets';
import BudgetManager from './components/BudgetManager';
import BalanceSheet from './components/BalanceSheet';
import Cheques from './components/Cheques';
import MonthlyReport from './components/MonthlyReport';
import { 
  Product, Sale, Customer, Supplier, Expense, 
  Purchase, Shift, Voucher, AuditLog, AppSettings, 
  User, CommissionPayment, PricingTier, Warehouse,
  Quotation, StockAdjustment, LoyaltyRank, Employee, PrintTemplate,
  Notification, BankAccount, JournalEntry, Asset, Budget, ReturnRecord, Cheque
} from './types';

const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(() => JSON.parse(localStorage.getItem('b_products') || '[]'));
  const [sales, setSales] = useState<Sale[]>(() => JSON.parse(localStorage.getItem('b_sales') || '[]'));
  const [customers, setCustomers] = useState<Customer[]>(() => JSON.parse(localStorage.getItem('b_customers') || '[]'));
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => JSON.parse(localStorage.getItem('b_suppliers') || '[]'));
  const [expenses, setExpenses] = useState<Expense[]>(() => JSON.parse(localStorage.getItem('b_expenses') || '[]'));
  const [purchases, setPurchases] = useState<Purchase[]>(() => JSON.parse(localStorage.getItem('b_purchases') || '[]'));
  const [shifts, setShifts] = useState<Shift[]>(() => JSON.parse(localStorage.getItem('b_shifts') || '[]'));
  const [vouchers, setVouchers] = useState<Voucher[]>(() => JSON.parse(localStorage.getItem('b_vouchers') || '[]'));
  const [employees, setEmployees] = useState<Employee[]>(() => JSON.parse(localStorage.getItem('b_employees') || '[]'));
  const [commissionPayments, setCommissionPayments] = useState<CommissionPayment[]>(() => JSON.parse(localStorage.getItem('b_commissions') || '[]'));
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => JSON.parse(localStorage.getItem('b_logs') || '[]'));
  const [warehouses, setWarehouses] = useState<Warehouse[]>(() => JSON.parse(localStorage.getItem('b_warehouses') || '[]'));
  const [quotations, setQuotations] = useState<Quotation[]>(() => JSON.parse(localStorage.getItem('b_quotes') || '[]'));
  const [adjustments, setAdjustments] = useState<StockAdjustment[]>(() => JSON.parse(localStorage.getItem('b_adjustments') || '[]'));
  const [notifications, setNotifications] = useState<Notification[]>(() => JSON.parse(localStorage.getItem('b_notifications') || '[]'));
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(() => JSON.parse(localStorage.getItem('b_banks') || '[]'));
  const [journals, setJournals] = useState<JournalEntry[]>(() => JSON.parse(localStorage.getItem('b_journals') || '[]'));
  const [assets, setAssets] = useState<Asset[]>(() => JSON.parse(localStorage.getItem('b_assets') || '[]'));
  const [budgets, setBudgets] = useState<Budget[]>(() => JSON.parse(localStorage.getItem('b_budgets') || '[]'));
  const [salesReturns, setSalesReturns] = useState<ReturnRecord[]>(() => JSON.parse(localStorage.getItem('b_sales_returns') || '[]'));
  const [purchaseReturns, setPurchaseReturns] = useState<ReturnRecord[]>(() => JSON.parse(localStorage.getItem('b_purchase_returns') || '[]'));
  const [cheques, setCheques] = useState<Cheque[]>(() => JSON.parse(localStorage.getItem('b_cheques') || '[]'));

  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('b_settings');
    
    const defaultColumnConfig = {
      product: true,
      quantity: true,
      unit: true,
      price: true,
      discount: true,
      total: true,
    };

    const defaults: AppSettings = {
      storeName: 'البطل بلس',
      ownerName: 'المدير العام',
      printFormat: 'A4',
      selectedTemplate: PrintTemplate.MODERN,
      thermalSize: '80mm',
      vatEnabled: true,
      vatRate: 14,
      branches: ['المركز الرئيسي'],
      autoInventorySync: true,
      nextSalesNum: 1001,
      nextPurchasesNum: 5001,
      darkMode: false,
      invoiceColumns: {
        [PrintTemplate.MODERN]: defaultColumnConfig,
        [PrintTemplate.CLASSIC]: defaultColumnConfig,
        [PrintTemplate.COMPACT]: defaultColumnConfig,
      },
      categoryMargins: {
        'عام': 25,
        'عناية': 30,
        'مكياج': 40,
        'شعر': 35,
      },
      cloudSync: {
        enabled: false,
      },
      users: [
        { id: '1', name: 'المدير العام', pin: '1234', loginType: 'local', email: 'manager@example.com', role: 'ADMIN', permissions: { canSeeCostPrice: true, canEditInvoices: true, canDeleteInvoices: true, canSeeReports: true, canManageUsers: true, canAdjustStock: true, canAccessAuditLogs: true } },
      ]
    };

    if (saved) {
      const parsed = JSON.parse(saved);
      // Ensure new properties exist if loaded from old state
      if (!parsed.invoiceColumns) parsed.invoiceColumns = defaults.invoiceColumns;
      if (!parsed.categoryMargins) parsed.categoryMargins = defaults.categoryMargins;
      if (!parsed.cloudSync) parsed.cloudSync = defaults.cloudSync;
      if (parsed.users && !parsed.users[0].loginType) {
        parsed.users = parsed.users.map((u: User) => ({...u, loginType: 'local'}));
      }
      return { ...defaults, ...parsed };
    }
    return defaults;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  const categories = useMemo(() => ['عام', ...Array.from(new Set(products.map(p => p.category).filter(c => c !== 'عام')))], [products]);


  useEffect(() => {
    localStorage.setItem('b_products', JSON.stringify(products));
    localStorage.setItem('b_sales', JSON.stringify(sales));
    localStorage.setItem('b_customers', JSON.stringify(customers));
    localStorage.setItem('b_suppliers', JSON.stringify(suppliers));
    localStorage.setItem('b_expenses', JSON.stringify(expenses));
    localStorage.setItem('b_purchases', JSON.stringify(purchases));
    localStorage.setItem('b_shifts', JSON.stringify(shifts));
    localStorage.setItem('b_vouchers', JSON.stringify(vouchers));
    localStorage.setItem('b_employees', JSON.stringify(employees));
    localStorage.setItem('b_commissions', JSON.stringify(commissionPayments));
    localStorage.setItem('b_settings', JSON.stringify(settings));
    localStorage.setItem('b_logs', JSON.stringify(auditLogs));
    localStorage.setItem('b_warehouses', JSON.stringify(warehouses));
    localStorage.setItem('b_quotes', JSON.stringify(quotations));
    localStorage.setItem('b_adjustments', JSON.stringify(adjustments));
    localStorage.setItem('b_notifications', JSON.stringify(notifications));
    localStorage.setItem('b_banks', JSON.stringify(bankAccounts));
    localStorage.setItem('b_journals', JSON.stringify(journals));
    localStorage.setItem('b_assets', JSON.stringify(assets));
    localStorage.setItem('b_budgets', JSON.stringify(budgets));
    localStorage.setItem('b_sales_returns', JSON.stringify(salesReturns));
    localStorage.setItem('b_purchase_returns', JSON.stringify(purchaseReturns));
    localStorage.setItem('b_cheques', JSON.stringify(cheques));
  }, [products, sales, customers, suppliers, expenses, purchases, shifts, vouchers, employees, commissionPayments, settings, auditLogs, warehouses, quotations, adjustments, notifications, bankAccounts, journals, assets, budgets, salesReturns, purchaseReturns, cheques]);

  const activeShift = shifts.find(s => s.status === 'open');

  // Logic to ensure unique sequential numbers for Sales and Purchases
  const handleSaleComplete = () => {
    setSettings(prev => ({
      ...prev,
      nextSalesNum: (prev.nextSalesNum || 1000) + 1
    }));
  };

  const handlePurchaseComplete = () => {
    setSettings(prev => ({
      ...prev,
      nextPurchasesNum: (prev.nextPurchasesNum || 5000) + 1
    }));
  };

  if (!currentUser) return <Login settings={settings} onLogin={(u) => setCurrentUser(u)} />;

  return (
    <HashRouter>
      <Layout 
        settings={settings} 
        currentUser={currentUser} 
        products={products}
        customers={customers}
        sales={sales}
        notifications={notifications}
        setNotifications={setNotifications}
        lowStockCount={products.filter(p => p.stock <= p.minStockLevel).length} 
        onLogout={() => setCurrentUser(null)}
        onToggleTheme={() => setSettings(s => ({...s, darkMode: !s.darkMode}))}
      >
        <Routes>
          <Route path="/" element={<Dashboard products={products} sales={sales} expenses={expenses} customers={customers} />} />
          <Route path="/sales" element={<Sales products={products} setProducts={setProducts} customers={customers} setCustomers={setCustomers} setGlobalSales={setSales} settings={settings} activeShift={activeShift} onComplete={handleSaleComplete} />} />
          <Route path="/inventory" element={<Inventory products={products} setProducts={setProducts} categories={categories} settings={settings} customers={customers} />} />
          <Route path="/banks" element={<BankManager accounts={bankAccounts} setAccounts={setBankAccounts} />} />
          <Route path="/cheques" element={<Cheques cheques={cheques} setCheques={setCheques} bankAccounts={bankAccounts} setBankAccounts={setBankAccounts} customers={customers} suppliers={suppliers} />} />
          <Route path="/customers" element={<Customers customers={customers} setCustomers={setCustomers} settings={settings} />} />
          <Route path="/suppliers" element={<Suppliers suppliers={suppliers} setSuppliers={setSuppliers} settings={settings} setVouchers={setVouchers} activeShift={activeShift} />} />
          <Route path="/reports" element={currentUser.permissions.canSeeReports ? <Reports sales={sales} products={products} expenses={expenses} customers={customers} suppliers={suppliers} vouchers={vouchers} /> : <Navigate to="/" />} />
          <Route path="/reports/monthly" element={currentUser.permissions.canSeeReports ? <MonthlyReport sales={sales} /> : <Navigate to="/" />} />
          <Route path="/vouchers" element={<Vouchers vouchers={vouchers} setVouchers={setVouchers} customers={customers} setCustomers={setCustomers} suppliers={suppliers} setSuppliers={setSuppliers} cheques={cheques} setCheques={setCheques} bankAccounts={bankAccounts} activeShift={activeShift} />} />
          <Route path="/journal" element={<JournalEntries entries={journals} setEntries={setJournals} customers={customers} suppliers={suppliers} bankAccounts={bankAccounts} />} />
          <Route path="/trial-balance" element={<TrialBalance products={products} sales={sales} expenses={expenses} customers={customers} suppliers={suppliers} bankAccounts={bankAccounts} vouchers={vouchers} journalEntries={journals} assets={assets} />} />
          <Route path="/balance-sheet" element={<BalanceSheet products={products} sales={sales} expenses={expenses} customers={customers} suppliers={suppliers} bankAccounts={bankAccounts} vouchers={vouchers} assets={assets} />} />
          <Route path="/budgets" element={<BudgetManager budgets={budgets} setBudgets={setBudgets} expenses={expenses} vouchers={vouchers} />} />
          <Route path="/assets" element={<Assets assets={assets} setAssets={setAssets} />} />
          <Route path="/distribution" element={<Distribution sales={sales} setSales={setSales} />} />
          <Route path="/returns" element={<Returns sales={sales} setSales={setSales} products={products} setProducts={setProducts} customers={customers} setCustomers={setCustomers} activeShift={activeShift} returnRecords={salesReturns} setReturnRecords={setSalesReturns} />} />
          <Route path="/purchase-returns" element={<PurchaseReturns purchases={purchases} setPurchases={setPurchases} products={products} setProducts={setProducts} suppliers={suppliers} setSuppliers={setSuppliers} returnRecords={purchaseReturns} setReturnRecords={setPurchaseReturns} />} />
          <Route path="/installments" element={<Installments sales={sales} customers={customers} setCustomers={setCustomers} />} />
          <Route path="/shifts" element={<Shifts shifts={shifts} setShifts={setShifts} sales={sales} expenses={expenses} />} />
          <Route path="/sales-management" element={<SalesManagement sales={sales} setSales={setSales} products={products} setProducts={setProducts} customers={customers} setCustomers={setCustomers} />} />
          <Route path="/settings" element={currentUser.role === 'ADMIN' ? <Settings settings={settings} setSettings={setSettings} categories={categories} currentUser={currentUser} /> : <Navigate to="/" />} />
          <Route path="/employees" element={currentUser.role === 'ADMIN' ? <EmployeeManagement employees={employees} setEmployees={setEmployees} /> : <Navigate to="/" />} />
          <Route path="/audit-logs" element={currentUser.permissions.canAccessAuditLogs ? <AuditLogs logs={auditLogs} /> : <Navigate to="/" />} />
          <Route path="/warehouses" element={<Warehouses products={products} setProducts={setProducts} warehouses={warehouses} setWarehouses={setWarehouses} settings={settings} />} />
          <Route path="/purchases" element={<Purchases products={products} setProducts={setProducts} suppliers={suppliers} setSuppliers={setSuppliers} purchases={purchases} setGlobalPurchases={setPurchases} settings={settings} activeShift={activeShift} onComplete={handlePurchaseComplete} />} />
          <Route path="/purchases-management" element={<PurchasesManagement purchases={purchases} setPurchases={setPurchases} />} />
          <Route path="/quotations" element={
            <Quotations 
              products={products} 
              customers={customers} 
              quotations={quotations} 
              setQuotations={setQuotations} 
              onConvertToSale={(quote) => {
                const draftData = {
                  activeCartItems: quote.items,
                  selectedCustomerId: quote.customerId,
                  paymentType: 'كاش',
                  paidAmount: 0,
                  invoiceNote: `تحويل من عرض سعر #${quote.id.slice(-4)}`
                };
                localStorage.setItem('draft_sale', JSON.stringify(draftData));
                window.location.hash = '#/sales';
              }} 
            />
          } />
          <Route path="/adjustments" element={<Adjustments products={products} setProducts={setProducts} adjustments={adjustments} setAdjustments={setAdjustments} />} />
          <Route path="/inventory-check" element={<InventoryCheck products={products} setProducts={setProducts} adjustments={adjustments} setAdjustments={setAdjustments} />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
      <AIAssistant products={products} sales={sales} customers={customers} settings={settings} />
    </HashRouter>
  );
};

export default App;