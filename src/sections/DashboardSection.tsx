// ============================================================
//  DashboardSection.tsx — الصفحة الرئيسية
//  إجراءات سريعة شغالة + بيانات حقيقية من IndexedDB
// ============================================================
import { useEffect, useState } from 'react';
import { ShoppingCart, Receipt, Package, Users, ArrowUpRight, Clock, Calendar, Plus, BarChart3 } from 'lucide-react';
import HeroInterlude from '@/components/HeroInterlude';
import StatCard      from '@/components/StatCard';
import { getAll }    from '@/lib/db';
import type { Sale, Product, Customer } from '@/types';

interface DashboardProps {
  onNavigate?: (page: string) => void;
}

export default function DashboardSection({ onNavigate }: DashboardProps) {
  const [sales,     setSales]     = useState<Sale[]>([]);
  const [products,  setProducts]  = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    const load = async () => {
      const [s, p, c] = await Promise.all([
        getAll<Sale>('sales'),
        getAll<Product>('products'),
        getAll<Customer>('customers'),
      ]);
      setSales(s);
      setProducts(p);
      setCustomers(c);
      setLoading(false);
    };
    load();
  }, []);

  const today         = new Date().toLocaleDateString('ar-EG');
  const todaySales    = sales.filter(s => s.date === today);
  const todayTotal    = todaySales.reduce((sum, s) => sum + s.total, 0);
  const lowStock      = products.filter(p => p.status === 'low' || p.status === 'out');
  const recentSales   = [...sales].sort((a, b) => b.timestamp - a.timestamp).slice(0, 5);

  const paymentColors: Record<string, string> = {
    cash:     'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    visa:     'bg-blue-500/10 text-blue-400 border-blue-500/20',
    instapay: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    wallet:   'bg-orange-500/10 text-orange-400 border-orange-500/20',
  };
  const paymentLabels: Record<string, string> = {
    cash: 'كاش', visa: 'فيزا', instapay: 'إنستا باي', wallet: 'محفظة',
  };

  return (
    <div className="space-y-5 md:space-y-6">

      {/* Hero */}
      <HeroInterlude />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatCard title="مبيعات اليوم"       value={todayTotal}            trend={0} trendLabel={`${todaySales.length} فاتورة`} icon={ShoppingCart} suffix=" ج.م" />
        <StatCard title="إجمالي الفواتير"    value={sales.length}          trendLabel="كل الوقت"                                 icon={Receipt} />
        <StatCard title="منتجات تحتاج تعبئة" value={lowStock.length}       trendLabel="وصلت للحد الأدنى"                         icon={Package} />
        <StatCard title="العملاء"            value={customers.length}      trendLabel="مسجلين"                                   icon={Users} />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-5">

        {/* أحدث المبيعات */}
        <div className="lg:col-span-2 bg-surface rounded-xl p-4 md:p-6 shadow-elevated">
          <div className="flex items-center justify-between mb-4 md:mb-5">
            <h2 className="text-base font-semibold text-silver font-body">أحدث المبيعات</h2>
            <button
              onClick={() => onNavigate?.('invoices')}
              className="text-xs text-silver/40 hover:text-silver transition-colors font-body flex items-center gap-1"
            >
              عرض الكل <ArrowUpRight size={13} />
            </button>
          </div>

          {loading ? (
            <div className="py-8 text-center text-silver/30 text-sm font-body">جاري التحميل...</div>
          ) : recentSales.length === 0 ? (
            <div className="py-8 text-center text-silver/20">
              <Receipt size={36} strokeWidth={1} className="mx-auto mb-2" />
              <p className="text-sm font-body">لا توجد مبيعات بعد</p>
            </div>
          ) : (
            <div>
              {recentSales.map((sale, i) => (
                <div key={sale.id} className={`flex items-center justify-between py-3 ${i < recentSales.length - 1 ? 'border-b border-[rgba(192,192,192,0.07)]' : ''}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-void border border-[rgba(192,192,192,0.1)] flex items-center justify-center shrink-0">
                      <Receipt size={15} className="text-silver/40" />
                    </div>
                    <div>
                      <p className="text-sm text-silver font-body">{sale.invoiceNumber}</p>
                      <p className="text-xs text-silver/30 font-body">{sale.items.length} منتجات • {sale.time}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full border hidden sm:inline ${paymentColors[sale.paymentMethod]}`}>
                    {paymentLabels[sale.paymentMethod]}
                  </span>
                  <p className="text-sm font-semibold text-silver font-body tabular-nums">
                    {sale.total.toLocaleString('ar-EG')} ج.م
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* إجراءات سريعة */}
        <div className="bg-surface rounded-xl p-4 md:p-6 shadow-elevated">
          <h2 className="text-base font-semibold text-silver font-body mb-4">إجراءات سريعة</h2>

          <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
            {[
              {
                icon: ShoppingCart, title: 'بيع جديد',
                sub: 'إنشاء فاتورة بيع',
                onClick: () => onNavigate?.('pos'),
                color: 'hover:border-emerald-500/30 hover:bg-emerald-500/5',
              },
              {
                icon: Plus, title: 'إضافة منتج',
                sub: 'منتج أو تعبئة مخزون',
                onClick: () => onNavigate?.('products'),
                color: 'hover:border-blue-500/30 hover:bg-blue-500/5',
              },
              {
                icon: Users, title: 'عميل جديد',
                sub: 'تسجيل عميل',
                onClick: () => onNavigate?.('customers'),
                color: 'hover:border-purple-500/30 hover:bg-purple-500/5',
              },
              {
                icon: BarChart3, title: 'التقارير',
                sub: 'عرض ملخص المبيعات',
                onClick: () => onNavigate?.('reports'),
                color: 'hover:border-amber-500/30 hover:bg-amber-500/5',
              },
            ].map(({ icon: Icon, title, sub, onClick, color }) => (
              <button
                key={title}
                onClick={onClick}
                className={`flex items-center gap-3 p-3 bg-void rounded-xl border border-[rgba(192,192,192,0.1)] transition-all duration-200 group text-right ${color}`}
              >
                <div className="w-9 h-9 rounded-lg bg-surface flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Icon size={17} className="text-silver/70" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-silver font-body truncate">{title}</p>
                  <p className="text-xs text-silver/30 font-body hidden md:block truncate">{sub}</p>
                </div>
              </button>
            ))}
          </div>

          {/* التاريخ والوقت */}
          <div className="mt-4 pt-4 border-t border-[rgba(192,192,192,0.08)] space-y-1.5">
            <div className="flex items-center gap-2 text-silver/30">
              <Calendar size={12} />
              <span className="text-xs font-body">
                {new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
            <div className="flex items-center gap-2 text-silver/30">
              <Clock size={12} />
              <span className="text-xs font-body">
                {new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* تنبيهات نفاد المخزون */}
      {lowStock.length > 0 && (
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Package size={16} className="text-amber-400" />
            <h3 className="text-sm font-semibold text-amber-400 font-body">
              تنبيه — {lowStock.length} منتج يحتاج تعبئة
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {lowStock.slice(0, 6).map(p => (
              <div key={p.id} className="flex items-center justify-between bg-void/50 rounded-lg px-3 py-2">
                <span className="text-xs text-silver/70 font-body truncate">{p.name}</span>
                <span className={`text-xs font-body mr-2 shrink-0 ${p.status === 'out' ? 'text-red-400' : 'text-amber-400'}`}>
                  {p.status === 'out' ? 'نفذ' : `${p.stock} متبقي`}
                </span>
              </div>
            ))}
          </div>
          {lowStock.length > 6 && (
            <button
              onClick={() => onNavigate?.('inventory')}
              className="mt-2 text-xs text-amber-400/60 hover:text-amber-400 font-body transition-colors"
            >
              +{lowStock.length - 6} منتجات أخرى ← عرض الكل
            </button>
          )}
        </div>
      )}
    </div>
  );
}
