import { useState } from 'react';
import { Receipt, Search, Filter, Download, Eye } from 'lucide-react';
import { recentSales } from '@/data/mockData';

const methodLabels: Record<string, string> = {
  cash: 'كاش',
  visa: 'فيزا',
  instapay: 'إنستا باي',
  wallet: 'محفظة',
};

const methodColors: Record<string, string> = {
  cash: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  visa: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  instapay: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  wallet: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
};

export default function InvoicesSection() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMethod, setFilterMethod] = useState<string>('all');

  const filtered = recentSales.filter((sale) => {
    const matchesSearch = sale.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMethod = filterMethod === 'all' || sale.paymentMethod === filterMethod;
    return matchesSearch && matchesMethod;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-silver font-body">الفواتير</h1>
          <p className="text-sm text-silver/40 mt-1 font-body">إدارة الفواتير والمبيعات</p>
        </div>
        <button className="h-10 px-4 bg-silver text-void rounded-lg text-sm font-body font-medium hover:bg-silver/90 transition-colors flex items-center gap-2">
          <Download size={16} />
          تصدير
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-silver/30" />
          <input
            type="text"
            placeholder="بحث برقم الفاتورة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 w-full bg-void border border-[rgba(192,192,192,0.2)] rounded-lg pr-9 pl-3 text-sm text-silver placeholder:text-silver/30 focus:outline-none focus:border-[rgba(192,192,192,0.4)]"
          />
        </div>
        <div className="flex items-center gap-1">
          <Filter size={14} className="text-silver/40" />
          {['all', 'cash', 'visa', 'instapay', 'wallet'].map((method) => (
            <button
              key={method}
              onClick={() => setFilterMethod(method)}
              className={`
                px-3 py-1.5 rounded-full text-xs font-body border transition-all duration-200
                ${filterMethod === method
                  ? 'bg-silver text-void border-silver'
                  : 'bg-transparent text-silver/50 border-[rgba(192,192,192,0.15)] hover:border-[rgba(192,192,192,0.3)]'
                }
              `}
            >
              {method === 'all' ? 'الكل' : methodLabels[method]}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-surface rounded-xl shadow-elevated overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-[rgba(192,192,192,0.15)]">
              <th className="text-right py-4 px-6 text-sm text-silver/60 font-body font-medium">رقم الفاتورة</th>
              <th className="text-right py-4 px-6 text-sm text-silver/60 font-body font-medium">المنتجات</th>
              <th className="text-right py-4 px-6 text-sm text-silver/60 font-body font-medium">طريقة الدفع</th>
              <th className="text-right py-4 px-6 text-sm text-silver/60 font-body font-medium">التاريخ</th>
              <th className="text-left py-4 px-6 text-sm text-silver/60 font-body font-medium">الإجمالي</th>
              <th className="text-center py-4 px-6 text-sm text-silver/60 font-body font-medium">إجراء</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((sale) => (
              <tr key={sale.id} className="border-b border-[rgba(192,192,192,0.06)] hover:bg-[rgba(32,90,104,0.15)] transition-colors">
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-void border border-[rgba(192,192,192,0.1)] flex items-center justify-center">
                      <Receipt size={14} className="text-silver/50" />
                    </div>
                    <span className="text-sm text-silver font-body">{sale.id}</span>
                  </div>
                </td>
                <td className="py-4 px-6 text-sm text-silver/70 font-body">
                  {sale.items.length} منتجات
                </td>
                <td className="py-4 px-6">
                  <span className={`text-xs px-2.5 py-1 rounded-full border ${methodColors[sale.paymentMethod]}`}>
                    {methodLabels[sale.paymentMethod]}
                  </span>
                </td>
                <td className="py-4 px-6 text-sm text-silver/50 font-body">
                  {sale.date} - {sale.time}
                </td>
                <td className="py-4 px-6 text-left">
                  <span className="text-sm font-semibold text-silver font-body tabular-nums">
                    {sale.total.toLocaleString('ar-EG')} ج.م
                  </span>
                </td>
                <td className="py-4 px-6 text-center">
                  <button className="w-8 h-8 rounded-lg border border-[rgba(192,192,192,0.15)] flex items-center justify-center text-silver/40 hover:text-silver hover:border-[rgba(192,192,192,0.3)] transition-all mx-auto">
                    <Eye size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="py-12 text-center text-silver/30 text-sm font-body">
            لا توجد فواتير مطابقة
          </div>
        )}
      </div>
    </div>
  );
}
