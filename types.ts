
export enum PricingTier {
  SUPER_WHOLESALE = 'جملة الجملة',
  WHOLESALE = 'جملة',
  SEMI_WHOLESALE = 'نصف جملة',
  PHARMACIST = 'صيدلي',
  RETAIL = 'قطاعي'
}

export enum UnitType {
  PIECE = 'قطعة',
  DOZEN = 'دستة',
  CARTON = 'كرتونة'
}

export enum OrderStatus {
  PENDING = 'قيد التجهيز',
  OUT_FOR_DELIVERY = 'مع المندوب',
  DELIVERED = 'تم التسليم',
  CANCELLED = 'ملغي',
  RETURNED = 'مرتجع'
}

export enum LoyaltyRank {
  BRONZE = 'برونزي',
  SILVER = 'فضي',
  GOLD = 'ذهبي',
  PLATINUM = 'بلاتيني'
}

export enum PrintTemplate {
  MODERN = 'عصري',
  CLASSIC = 'كلاسيكي',
  COMPACT = 'مختصر'
}

export interface InvoiceColumnConfig {
  product: boolean;
  quantity: boolean;
  unit: boolean;
  price: boolean;
  discount: boolean;
  total: boolean;
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  balance: number;
}

export interface Budget {
  id: string;
  category: string;
  amount: number;
  period: string; // e.g., "2023-10"
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'stock' | 'debt' | 'system' | 'edit_request';
  date: string;
  read: boolean;
  link?: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  description: string;
  reference?: string;
  lines: JournalLine[];
}

export interface JournalLine {
  accountId: string;
  accountName: string;
  debit: number;
  credit: number;
}

export interface Asset {
  id: string;
  name: string;
  category: 'vehicles' | 'furniture' | 'electronics' | 'buildings' | 'other';
  purchaseDate: string;
  purchaseValue: number;
  depreciationRate: number; 
  note?: string;
}

export interface Employee {
  id: string;
  name: string;
  role: UserRole;
  baseSalary: number;
  commissions: number;
  deductions: number;
  advances: number;
  hireDate: string;
}

export interface UserPermissions {
  canSeeCostPrice: boolean;
  canEditInvoices: boolean;
  canDeleteInvoices: boolean;
  canSeeReports: boolean;
  canManageUsers: boolean;
  canAdjustStock: boolean;
  canAccessAuditLogs: boolean;
}

export interface User {
  id: string;
  name: string;
  pin: string;
  email?: string;
  loginType: 'local' | 'cloud';
  role: UserRole;
  defaultCommissionRate?: number;
  permissions: UserPermissions;
}

export interface Warehouse {
  id: string;
  name: string;
  location: string;
  isVehicle: boolean;
  driverName?: string;
  stock: { [productId: string]: number };
}

export interface Sale {
  id: string;
  invoiceNumber: string;
  customerId?: string;
  customerName: string;
  date: string;
  time?: string;
  items: InvoiceItem[];
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  previousBalance: number;
  profit: number;
  paymentType: PaymentMethod;
  shiftId: string;
  warehouseId: string;
  status: OrderStatus;
  deliveryDriverId?: string;
  commissionAmount: number;
  isReturned?: boolean;
  branch?: string;
  modificationRequested?: boolean;
  qrCodeData?: string;
}

export interface AppSettings {
  storeName: string;
  ownerName: string;
  printFormat: PrintFormat;
  selectedTemplate: PrintTemplate;
  thermalSize: ThermalSize;
  vatEnabled: boolean;
  vatRate: number;
  taxNumber?: string;
  branches: string[];
  autoInventorySync: boolean;
  users: User[];
  currentBranch?: string;
  footerText?: string;
  address?: string;
  phone?: string;
  nextSalesNum: number;
  nextPurchasesNum: number;
  darkMode: boolean;
  invoiceColumns: {
    [key in PrintTemplate]: InvoiceColumnConfig;
  };
  categoryMargins: { [key: string]: number };
  cloudSync: {
    enabled: boolean;
    lastSync?: string;
  };
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  barcode: string;
  category: string;
  expiryDate?: string;
  costPrice: number;
  retailPrice: number;
  minStockLevel: number;
  conversion: {
    dozenToPiece: number;
    cartonToPiece: number;
  };
  prices: {
    [UnitType.PIECE]: { [key in PricingTier]: number };
    [UnitType.DOZEN]: { [key in PricingTier]: number };
    [UnitType.CARTON]: { [key in PricingTier]: number };
  };
  totalStock: number;
  stock: number;
}

export interface InvoiceItem {
  id: string;
  productId: string;
  productName: string;
  unit: UnitType;
  tier: PricingTier;
  quantity: number;
  pricePerUnit: number;
  total: number;
  costPriceAtSale: number;
  discount?: number;
}

export type PaymentMethod = 'كاش' | 'آجل' | 'تحويل بنكي';
export type UserRole = 'ADMIN' | 'CASHIER' | 'DRIVER' | 'STOREKEEPER';
export type PrintFormat = 'A4' | 'THERMAL';
export type ThermalSize = '80mm' | '58mm';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  region: string;
  balance: number;
  tier: PricingTier;
  creditLimit: number;
  loyaltyPoints: number;
  loyaltyRank: LoyaltyRank;
  totalSpent: number;
  transactions: any[];
}

export interface AuditLog {
  id: string;
  userName: string;
  action: string;
  details: string;
  date: string;
  time: string;
  severity: 'low' | 'medium' | 'high';
}

export interface StockAdjustment {
  id: string;
  date: string;
  productId: string;
  productName: string;
  oldStock: number;
  newStock: number;
  type: 'هالك' | 'عجز' | 'زيادة';
  reason: string;
  user: string;
}

export interface Quotation {
  id: string;
  customerId: string;
  customerName: string;
  date: string;
  items: InvoiceItem[];
  totalAmount: number;
  status: 'pending' | 'converted';
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
  shiftId?: string;
  branch: string;
}

export interface Supplier {
  id: string;
  name: string;
  company: string;
  phone: string;
  balance: number;
  transactions: any[];
}

export interface AccountTransaction {
  id: string;
  date: string;
  note: string;
  type: string;
  amount: number;
  balanceAfter: number;
}

export interface Shift {
  id: string;
  startTime: string;
  endTime?: string;
  startCash: number;
  endCash?: number;
  actualCash?: number;
  totalSales: number;
  totalExpenses: number;
  status: 'open' | 'closed';
  user: string;
}

export interface Voucher {
  id: string;
  voucherNumber: string;
  date: string;
  time: string;
  type: 'قبض' | 'صرف';
  amount: number;
  partyName: string;
  category: string;
  note: string;
  shiftId: string;
}

export interface CommissionPayment {
  id: string;
  driverId: string;
  amount: number;
  date: string;
  note: string;
}

export interface Purchase {
  id: string;
  invoiceNumber: string;
  supplierName: string;
  date: string;
  items: InvoiceItem[];
  totalAmount: number;
  paymentType: PaymentMethod;
  branch?: string;
  modificationRequested?: boolean;
  isReturned?: boolean;
}

export interface ReturnRecord {
  id: string;
  originalInvoiceNumber: string;
  date: string;
  partyName: string; // Customer or Supplier
  items: InvoiceItem[]; // Only the returned items with returned quantities
  totalRefund: number;
  reason: string;
  type: 'sales' | 'purchase';
}

// --- Cheques Types ---
export type ChequeType = 'receivable' | 'payable'; // أوراق قبض (وارد) | أوراق دفع (صادر)
export type ChequeStatus = 'pending' | 'cleared' | 'bounced' | 'returned'; 

export interface Cheque {
  id: string;
  chequeNumber: string;
  bankName: string;
  amount: number;
  dueDate: string; // تاريخ الاستحقاق
  issueDate: string; // تاريخ التحرير
  beneficiary: string; // المستفيد أو الساحب
  type: ChequeType;
  status: ChequeStatus;
  linkedBankAccountId?: string; // لربط التحصيل بحساب بنكي معين
  note?: string;
}