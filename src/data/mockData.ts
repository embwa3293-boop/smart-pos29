import type { Product, Customer, Sale } from '@/types';

export const products: Product[] = [
  { id: 'P001', name: 'قفازات جراحية (L)', barcode: '6281234567890', price: 150, buyPrice: 90, stock: 500, minStock: 50, category: 'مستلزمات طبية', status: 'available' },
  { id: 'P002', name: 'قفازات جراحية (M)', barcode: '6281234567891', price: 150, buyPrice: 90, stock: 350, minStock: 50, category: 'مستلزمات طبية', status: 'available' },
  { id: 'P003', name: 'كمامة N95', barcode: '6281234567892', price: 75, buyPrice: 45, stock: 200, minStock: 30, category: 'مستلزمات طبية', status: 'available' },
  { id: 'P004', name: 'معقم يدين 500مل', barcode: '6281234567893', price: 85, buyPrice: 50, stock: 120, minStock: 20, category: 'مستلزمات طبية', status: 'available' },
  { id: 'P005', name: 'شاش طبي 10سم', barcode: '6281234567894', price: 45, buyPrice: 25, stock: 8, minStock: 15, category: 'مستلزمات طبية', status: 'low' },
  { id: 'P006', name: 'حقن محلول ملحي', barcode: '6281234567895', price: 12, buyPrice: 6, stock: 0, minStock: 20, category: 'مستلزمات طبية', status: 'out' },
  { id: 'P007', name: 'فيتامين D3 1000IU', barcode: '6281234567896', price: 180, buyPrice: 110, stock: 80, minStock: 10, category: 'مكملات غذائية', status: 'available' },
  { id: 'P008', name: 'أوميغا 3 (60 كبسولة)', barcode: '6281234567897', price: 250, buyPrice: 160, stock: 60, minStock: 10, category: 'مكملات غذائية', status: 'available' },
  { id: 'P009', name: 'مكمل زنك 50mg', barcode: '6281234567898', price: 95, buyPrice: 55, stock: 45, minStock: 10, category: 'مكملات غذائية', status: 'available' },
  { id: 'P010', name: 'فيتامين C 1000mg', barcode: '6281234567899', price: 120, buyPrice: 70, stock: 15, minStock: 12, category: 'مكملات غذائية', status: 'low' },
  { id: 'P011', name: 'جهاز قياس ضغط رقمي', barcode: '6281234567900', price: 850, buyPrice: 550, stock: 25, minStock: 5, category: 'أجهزة طبية', status: 'available' },
  { id: 'P012', name: 'جهاز قياس سكر دم', barcode: '6281234567901', price: 450, buyPrice: 300, stock: 18, minStock: 5, category: 'أجهزة طبية', status: 'available' },
  { id: 'P013', name: 'ميزان حرارة رقمي', barcode: '6281234567902', price: 195, buyPrice: 120, stock: 30, minStock: 8, category: 'أجهزة طبية', status: 'available' },
  { id: 'P014', name: 'شرائط اختبار سكر', barcode: '6281234567903', price: 220, buyPrice: 140, stock: 5, minStock: 10, category: 'مستلزمات طبية', status: 'low' },
  { id: 'P015', name: 'ضمادات لاصقة متنوعة', barcode: '6281234567904', price: 35, buyPrice: 18, stock: 200, minStock: 30, category: 'مستلزمات طبية', status: 'available' },
];

export const categories: string[] = ['الكل', 'مستلزمات طبية', 'مكملات غذائية', 'أجهزة طبية'];

export const customers: Customer[] = [
  { id: 'C001', name: 'د. أحمد محمود', phone: '01001234567', totalPurchases: 45000, currentDebt: 2500, category: 'طبيب' },
  { id: 'C002', name: 'صيدلية النور', phone: '01002345678', totalPurchases: 82000, currentDebt: 0, category: 'صيدلية' },
  { id: 'C003', name: 'د. سارة علي', phone: '01003456789', totalPurchases: 28000, currentDebt: 4200, category: 'طبيب' },
  { id: 'C004', name: 'صيدلية الشفاء', phone: '01004567890', totalPurchases: 65000, currentDebt: 1200, category: 'صيدلية' },
  { id: 'C005', name: 'شركة الأمل الطبية', phone: '01005678901', totalPurchases: 120000, currentDebt: 8500, category: 'شركة' },
];

export const recentSales: Sale[] = [
  { id: 'INV-001', invoiceNumber: 'INV-001', items: [{ productId: 'P001', name: 'قفازات جراحية (L)', price: 150, qty: 10, subtotal: 1500 }], subtotal: 1500, total: 1500, discount: 0, paymentMethod: 'cash', date: '2026-05-22', time: '09:30', timestamp: 1716370200000 },
  { id: 'INV-002', invoiceNumber: 'INV-002', items: [{ productId: 'P003', name: 'كمامة N95', price: 75, qty: 20, subtotal: 1500 }, { productId: 'P007', name: 'فيتامين D3 1000IU', price: 180, qty: 5, subtotal: 900 }], subtotal: 2500, total: 2400, discount: 100, paymentMethod: 'instapay', date: '2026-05-22', time: '10:15', timestamp: 1716373800000 },
  { id: 'INV-003', invoiceNumber: 'INV-003', items: [{ productId: 'P011', name: 'جهاز قياس ضغط رقمي', price: 850, qty: 2, subtotal: 1700 }], subtotal: 1700, total: 1700, discount: 0, paymentMethod: 'visa', date: '2026-05-22', time: '11:00', timestamp: 1716375600000 },
  { id: 'INV-004', invoiceNumber: 'INV-004', items: [{ productId: 'P004', name: 'معقم يدين 500مل', price: 85, qty: 12, subtotal: 1020 }, { productId: 'P015', name: 'ضمادات لاصقة متنوعة', price: 35, qty: 30, subtotal: 1050 }], subtotal: 2070, total: 2000, discount: 70, paymentMethod: 'cash', date: '2026-05-22', time: '11:45', timestamp: 1716378300000 },
  { id: 'INV-005', invoiceNumber: 'INV-005', items: [{ productId: 'P008', name: 'أوميغا 3 (60 كبسولة)', price: 250, qty: 8, subtotal: 2000 }], subtotal: 2000, total: 2000, discount: 0, paymentMethod: 'wallet', date: '2026-05-22', time: '12:20', timestamp: 1716380400000 },
];

export const dashboardStats = {
  todaySales: 24500,
  salesTrend: 8,
  invoiceCount: 142,
  newInvoices: 12,
  lowStockItems: 8,
  activeCustomers: 38,
  newCustomers: 5,
};
