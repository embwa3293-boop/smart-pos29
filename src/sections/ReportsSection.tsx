import { BarChart3, ShoppingCart, Users, Package } from 'lucide-react';
import { dashboardStats } from '@/data/mockData';

export default function ReportsSection() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-silver font-body">التقارير والإحصائيات</h1>
        <p className="text-sm text-silver/40 mt-1 font-body">تحليل المبيعات والأداء</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: 'إجمالي المبيعات', value: `${dashboardStats.todaySales.toLocaleString('ar-EG')} ج.م`, icon: ShoppingCart, trend: '+12%' },
          { label: 'عدد الفواتير', value: String(dashboardStats.invoiceCount), icon: BarChart3, trend: '+8%' },
          { label: 'العملاء النشطين', value: String(dashboardStats.activeCustomers), icon: Users, trend: '+5%' },
          { label: 'المنتجات المنخفضة', value: String(dashboardStats.lowStockItems), icon: Package, trend: '-2' },
        ].map((stat) => (
          <div key={stat.label} className="bg-surface rounded-xl p-5 shadow-elevated border border-[rgba(192,192,192,0.08)]">
            <div className="flex items-center justify-between mb-3">
              <stat.icon size={18} className="text-silver/50" />
              <span className="text-xs text-emerald-400">{stat.trend}</span>
            </div>
            <p className="text-2xl font-semibold text-silver font-body">{stat.value}</p>
            <p className="text-xs text-silver/40 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-surface rounded-xl p-6 shadow-elevated">
          <h3 className="text-lg font-semibold text-silver font-body mb-6">المبيعات اليومية</h3>
          <div className="h-48 flex items-end justify-around gap-2">
            {[65, 45, 80, 55, 90, 70, 85].map((height, i) => (
              <div key={i} className="flex flex-col items-center gap-2 flex-1">
                <div
                  className="w-full max-w-[40px] bg-silver/20 rounded-t-lg hover:bg-silver/40 transition-colors cursor-pointer"
                  style={{ height: `${height * 2}px` }}
                />
                <span className="text-xs text-silver/30">
                  ['سبت', 'حد', 'اثن', 'ثل', 'ارب', 'خم', 'جم'][i]
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-surface rounded-xl p-6 shadow-elevated">
          <h3 className="text-lg font-semibold text-silver font-body mb-6">توزيع طرق الدفع</h3>
          <div className="space-y-4">
            {[
              { method: 'كاش', count: 58, color: 'bg-emerald-400' },
              { method: 'فيزا', count: 32, color: 'bg-blue-400' },
              { method: 'إنستا باي', count: 35, color: 'bg-purple-400' },
              { method: 'محفظة', count: 17, color: 'bg-orange-400' },
            ].map((item) => (
              <div key={item.method}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-silver font-body">{item.method}</span>
                  <span className="text-silver/50 font-body">{item.count} فاتورة</span>
                </div>
                <div className="h-2 bg-void rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.color} rounded-full transition-all duration-1000`}
                    style={{ width: `${(item.count / 58) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
