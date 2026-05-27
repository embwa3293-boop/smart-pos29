// ============================================================
//  HeroInterlude.tsx — ملخص اليوم (بدل الفيديو الثقيل)
// ============================================================
import { useEffect, useState } from 'react';
import { TrendingUp, Clock, AlertTriangle, Package } from 'lucide-react';
import { getAll } from '@/lib/db';
import type { Sale, Product } from '@/types';

export default function HeroInterlude() {
  const [todaySales,    setTodaySales]    = useState(0);
  const [todayCount,    setTodayCount]    = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [time,          setTime]          = useState(new Date());

  useEffect(() => {
    // ── الوقت الحالي ─────────────────────────────────────
    const timer = setInterval(() => setTime(new Date()), 1000);

    // ── بيانات اليوم من IndexedDB ─────────────────────────
    const loadData = async () => {
      const today = new Date().toLocaleDateString('ar-EG');

      const [sales, products] = await Promise.all([
        getAll<Sale>('sales'),
        getAll<Product>('products'),
      ]);

      const todaySalesList = sales.filter(s => s.date === today);
      setTodaySales(todaySalesList.reduce((sum, s) => sum + s.total, 0));
      setTodayCount(todaySalesList.length);
      setLowStockCount(products.filter(p => p.status === 'low' || p.status === 'out').length);
    };

    loadData();
    return () => clearInterval(timer);
  }, []);

  const greeting = () => {
    const h = time.getHours();
    if (h < 12) return 'صباح الخير';
    if (h < 17) return 'مساء الخير';
    return 'مساء النور';
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-surface border border-[rgba(192,192,192,0.1)] shadow-elevated">
      {/* خلفية زخرفية خفيفة */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-teal/10 blur-[60px]" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-teal/5 blur-[50px]" />
      </div>

      <div className="relative p-5 md:p-7">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

          {/* التحية والوقت */}
          <div>
            <p className="text-silver/40 text-xs font-body mb-1 flex items-center gap-1.5">
              <Clock size={12} />
              {time.toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              {' — '}
              {time.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </p>
            <h2 className="text-xl md:text-2xl font-semibold text-silver font-body">{greeting()} 👋</h2>
            <p className="text-silver/40 text-sm font-body mt-0.5">إليك ملخص اليوم</p>
          </div>

          {/* أرقام سريعة */}
          <div className="flex items-center gap-3 sm:gap-6">
            <div className="text-center">
              <p className="text-2xl font-semibold text-silver font-body tabular-nums">
                {todaySales.toLocaleString('ar-EG')}
              </p>
              <p className="text-xs text-silver/40 font-body flex items-center gap-1 justify-center mt-0.5">
                <TrendingUp size={11} />
                مبيعات اليوم (ج.م)
              </p>
            </div>

            <div className="w-px h-10 bg-[rgba(192,192,192,0.15)]" />

            <div className="text-center">
              <p className="text-2xl font-semibold text-silver font-body tabular-nums">{todayCount}</p>
              <p className="text-xs text-silver/40 font-body mt-0.5">فاتورة اليوم</p>
            </div>

            {lowStockCount > 0 && (
              <>
                <div className="w-px h-10 bg-[rgba(192,192,192,0.15)]" />
                <div className="text-center">
                  <p className="text-2xl font-semibold text-amber-400 font-body tabular-nums">{lowStockCount}</p>
                  <p className="text-xs text-amber-400/70 font-body flex items-center gap-1 justify-center mt-0.5">
                    <AlertTriangle size={11} />
                    منتجات تحتاج تعبئة
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* شريط تنبيه نفاد المخزون */}
        {lowStockCount > 0 && (
          <div className="mt-4 pt-4 border-t border-[rgba(192,192,192,0.08)] flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
              <Package size={12} className="text-amber-400" />
            </div>
            <p className="text-xs text-amber-400/80 font-body">
              تنبيه: {lowStockCount} منتج وصل للحد الأدنى أو نفذ — يرجى مراجعة المخزون
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
