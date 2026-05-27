import { useState } from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { CartProvider }          from '@/context/CartContext';
import { ConfirmProvider }       from '@/context/ConfirmContext';
import LoginPage                 from '@/pages/LoginPage';
import VerticalNavRail           from '@/components/VerticalNavRail';
import GlobalHeader              from '@/components/GlobalHeader';
import AutoAI                    from '@/components/AutoAI';
import DashboardSection          from '@/sections/DashboardSection';
import POSSection                from '@/sections/POSSection';
import InvoicesSection           from '@/sections/InvoicesSection';
import ReportsSection            from '@/sections/ReportsSection';
import CustomersSection          from '@/sections/CustomersSection';
import InventorySection          from '@/sections/InventorySection';
import ProductsSection           from '@/sections/ProductsSection';
import SettingsSection           from '@/sections/SettingsSection';
import { Loader2 }               from 'lucide-react';
import type { NavPage }          from '@/types';

function SplashScreen() {
  return (
    <div className="min-h-screen bg-void flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 rounded-full border border-[rgba(192,192,192,0.2)] flex items-center justify-center mx-auto mb-4">
          <Loader2 size={24} className="text-silver/50 animate-spin" />
        </div>
        <p className="text-silver/30 text-sm font-body">جاري التحميل...</p>
      </div>
    </div>
  );
}

function AppContent() {
  const { user, loading } = useAuth();
  const [activePage, setActivePage] = useState<NavPage>('dashboard');

  if (loading) return <SplashScreen />;
  if (!user)   return <LoginPage />;

  if (user.role === 'client') {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-silver font-body text-lg">مرحباً {user.displayName}</p>
          <p className="text-silver/40 text-sm mt-2 font-body">صفحة العميل قيد التطوير</p>
        </div>
      </div>
    );
  }

  const currentPage = user.role === 'staff' ? 'pos' : activePage;

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <DashboardSection onNavigate={(p) => setActivePage(p as NavPage)} />;
      case 'pos':       return <POSSection />;
      case 'invoices':  return <InvoicesSection />;
      case 'reports':   return <ReportsSection />;
      case 'customers': return <CustomersSection />;
      case 'inventory': return <InventorySection />;
      case 'products':  return <ProductsSection />;
      case 'settings':  return <SettingsSection />;
      default:          return <DashboardSection />;
    }
  };

  return (
    <div className="min-h-screen bg-void">
      {user.role !== 'staff' && (
        <VerticalNavRail activePage={currentPage as NavPage} onNavigate={(p) => setActivePage(p as NavPage)} />
      )}
      <main className={`${user.role !== 'staff' ? 'md:mr-20' : ''} min-h-screen pb-16 md:pb-0`}>
        <GlobalHeader />
        <div className="p-4 md:p-6 lg:p-8">
          {renderPage()}
        </div>
      </main>
      {/* أوتو AI متاح لكل الصفحات */}
      <AutoAI />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ConfirmProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </ConfirmProvider>
    </AuthProvider>
  );
}
