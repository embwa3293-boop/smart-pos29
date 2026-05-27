// ============================================================
//  roles.ts — نظام الصلاحيات
// ============================================================

export type UserRole = 'superadmin' | 'admin' | 'staff' | 'client';

export type ClientType = 'public' | 'doctor' | 'pharmacy' | 'hospital';

// الإيميلات المسموح لها بدخول Super Admin
export const SUPER_ADMIN_EMAILS = [
  'abdulrahmanhasson43@gmail.com',
  'abdulrahmanhasson3@gmail.com',
];

// تحديد الدور حسب الإيميل
export function getSuperAdminRole(email: string): UserRole | null {
  if (SUPER_ADMIN_EMAILS.includes(email.toLowerCase())) return 'superadmin';
  return null;
}

// أسماء الأنواع بالعربي
export const CLIENT_TYPE_LABELS: Record<ClientType, string> = {
  public:   'جمهور',
  doctor:   'طبيب',
  pharmacy: 'صيدلية',
  hospital: 'مستشفى',
};

// أسماء الأدوار بالعربي
export const ROLE_LABELS: Record<UserRole, string> = {
  superadmin: 'سوبر أدمن',
  admin:      'أدمن',
  staff:      'موظف',
  client:     'عميل',
};

// الصلاحيات حسب الدور
export const PERMISSIONS = {
  superadmin: {
    canManageAdmins:    true,
    canManageStores:    true,
    canViewAllData:     true,
    canManagePackages:  true,
  },
  admin: {
    canManageProducts:  true,
    canManageCustomers: true,
    canManageStaff:     true,
    canViewReports:     true,
    canManageSettings:  true,
    canDeleteInvoices:  true,
    canManageDebts:     true,
  },
  staff: {
    canUsePOS:          true,
    canViewInventory:   true,
    canScanBarcode:     true,
  },
  client: {
    canViewOwnPrices:   true,
    canViewOwnOrders:   true,
    canViewOwnDebt:     true,
  },
};
