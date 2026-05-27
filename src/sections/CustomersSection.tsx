import { Users, Phone, ShoppingBag, AlertCircle } from 'lucide-react';
import { customers } from '@/data/mockData';

export default function CustomersSection() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-silver font-body">العملاء</h1>
        <p className="text-sm text-silver/40 mt-1 font-body">إدارة العملاء والحسابات</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {customers.map((customer) => (
          <div
            key={customer.id}
            className="bg-surface rounded-xl p-5 shadow-elevated border border-[rgba(192,192,192,0.08)] hover:border-[rgba(192,192,192,0.2)] transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-full bg-void border border-[rgba(192,192,192,0.15)] flex items-center justify-center">
                <Users size={20} className="text-silver/50" />
              </div>
              <span className="text-xs px-2 py-1 rounded-full bg-silver/5 text-silver/50 border border-[rgba(192,192,192,0.1)]">
                {customer.category}
              </span>
            </div>

            <h3 className="text-base font-semibold text-silver font-body mb-1">{customer.name}</h3>

            <div className="flex items-center gap-1.5 text-silver/40 text-xs mb-4">
              <Phone size={12} />
              <span className="font-mono">{customer.phone}</span>
            </div>

            <div className="border-t border-[rgba(192,192,192,0.08)] pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-silver/40 font-body flex items-center gap-1">
                  <ShoppingBag size={12} />
                  المشتريات
                </span>
                <span className="text-silver font-body tabular-nums">
                  {customer.totalPurchases.toLocaleString('ar-EG')} ج.م
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-silver/40 font-body flex items-center gap-1">
                  <AlertCircle size={12} />
                  الرصيد
                </span>
                <span className={`font-body tabular-nums ${customer.currentDebt > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {customer.currentDebt.toLocaleString('ar-EG')} ج.م
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
