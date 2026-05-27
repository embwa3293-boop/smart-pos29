export type PaymentMethod = 'cash' | 'visa' | 'instapay' | 'wallet';
export type ProductStatus = 'available' | 'low' | 'out';
export type NavPage = 'dashboard' | 'pos' | 'invoices' | 'inventory' | 'customers' | 'reports' | 'products' | 'settings';
export type ClientType = 'public' | 'doctor' | 'pharmacy' | 'hospital';
export type UserRole = 'superadmin' | 'admin' | 'staff' | 'client';
export type ProductUnit = 'piece' | 'box' | 'carton';

export interface ProductPrice {
  public:   number;
  doctor:   number;
  pharmacy: number;
  hospital: number;
}

export interface Product {
  id:           string;
  name:         string;
  aliases?:     string[];      // الأسماء البديلة (علمي / تجاري)
  barcode:      string;
  price:        number;        // سعر الجمهور الافتراضي
  prices?:      ProductPrice;  // الأسعار المتعددة
  buyPrice:     number;
  stock:        number;
  minStock:     number;
  category:     string;
  status:       ProductStatus;
  shelf?:       string;        // رقم الرف مثلاً "A3" أو "رف 5"
  unit?:        ProductUnit;   // وحدة البيع
  unitCount?:   number;        // عدد القطع في العلبة
  boxCount?:    number;        // عدد العلب في الكرتونة
  imageUrl?:    string;        // صورة المنتج
}

export interface CartItem {
  productId: string;
  name:      string;
  price:     number;
  qty:       number;
}

export interface SaleItem {
  productId: string;
  name:      string;
  price:     number;
  qty:       number;
  subtotal:  number;
}

export interface Sale {
  id:            string;
  invoiceNumber: string;
  items:         SaleItem[];
  subtotal:      number;
  discount:      number;
  total:         number;
  paymentMethod: PaymentMethod;
  date:          string;
  time:          string;
  timestamp:     number;
  cashierId?:    string;
  customerId?:   string;
  customerName?: string;
  clientType?:   ClientType;
  notes?:        string;
}

export interface Customer {
  id:             string;
  name:           string;
  phone:          string;
  totalPurchases: number;
  currentDebt:    number;
  category:       string;
  clientType?:    ClientType;
  accessCode?:    string;
}

export interface StoreSettings {
  id:          'storeInfo';
  name:        string;
  phone:       string;
  address:     string;
  taxNumber:   string;
  welcomeMsg:  string;   // رسالة الترحيب فوق الفاتورة
  footer:      string;   // رسالة الشكر تحت الفاتورة
  logo:        string;
  geminiKey?:  string;   // مفتاح Gemini API
}
