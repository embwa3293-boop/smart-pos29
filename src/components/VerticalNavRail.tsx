import { useState } from 'react';
import {
  LayoutDashboard,
  ShoppingCart,
  Receipt,
  BarChart3,
  Users,
  Package,
  Settings,
  Boxes,
} from 'lucide-react';
import type { NavPage } from '@/types';

const navItems: { icon: React.ElementType; label: string; page: NavPage }[] = [
  { icon: LayoutDashboard, label: 'الرئيسية', page: 'dashboard' },
  { icon: ShoppingCart, label: 'نقطة البيع', page: 'pos' },
  { icon: Receipt, label: 'الفواتير', page: 'invoices' },
  { icon: BarChart3, label: 'التقارير', page: 'reports' },
  { icon: Users, label: 'العملاء', page: 'customers' },
  { icon: Boxes, label: 'المخزون', page: 'inventory' },
  { icon: Package, label: 'المنتجات', page: 'products' },
  { icon: Settings, label: 'الإعدادات', page: 'settings' },
];

interface VerticalNavRailProps {
  activePage: NavPage;
  onNavigate: (page: NavPage) => void;
}

export default function VerticalNavRail({ activePage, onNavigate }: VerticalNavRailProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <aside className="fixed top-0 right-0 w-20 h-screen bg-surface border-l border-[rgba(192,192,192,0.1)] z-50 flex flex-col items-center py-6 gap-2">
      {/* Logo */}
      <div className="w-12 h-12 rounded-full border border-[rgba(192,192,192,0.3)] flex items-center justify-center mb-6">
        <img src="/logo.png" alt="حضّالي" className="w-8 h-8 object-contain" />
      </div>

      {/* Nav Items */}
      <nav className="flex-1 flex flex-col items-center gap-3 py-4">
        {navItems.map((item, index) => {
          const isActive = activePage === item.page;
          const isHovered = hoveredIndex === index;
          const Icon = item.icon;

          return (
            <div key={item.page} className="relative">
              {/* Floating Label */}
              {(isActive || isHovered) && (
                <span
                  className="absolute right-14 top-1/2 -translate-y-1/2 bg-void text-silver text-xs px-3 py-1.5 rounded-lg whitespace-nowrap border border-[rgba(192,192,192,0.2)] shadow-elevated z-50 animate-fade-in"
                  style={{ pointerEvents: 'none' }}
                >
                  {item.label}
                </span>
              )}

              <button
                onClick={() => onNavigate(item.page)}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={`
                  w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300
                  ${isActive
                    ? 'bg-silver text-void shadow-elevated'
                    : 'bg-transparent text-silver/70 border border-[rgba(192,192,192,0.15)] hover:scale-110 hover:text-silver hover:border-[rgba(192,192,192,0.4)]'
                  }
                `}
                title={item.label}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
              </button>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
