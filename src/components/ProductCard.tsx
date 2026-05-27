import { Plus, Barcode } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import type { Product } from '@/types';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();

  const handleAdd = () => {
    if (product.stock <= 0) return;
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
    });
  };

  const isOutOfStock = product.stock <= 0;

  return (
    <div
      className={`
        bg-void border border-[rgba(192,192,192,0.1)] rounded-xl p-4 
        hover:-translate-y-1 hover:border-[rgba(192,192,192,0.4)] 
        transition-all duration-300 shadow-elevated group
        ${isOutOfStock ? 'opacity-50' : ''}
      `}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-1.5 text-silver/30 text-xs">
          <Barcode size={12} />
          <span className="font-mono">{product.barcode.slice(-6)}</span>
        </div>
        <span
          className={`
            text-[10px] px-2 py-0.5 rounded-full
            ${product.status === 'available'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : product.status === 'low'
              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              : 'bg-red-500/10 text-red-400 border border-red-500/20'
            }
          `}
        >
          {product.status === 'available' ? 'متوفر' : product.status === 'low' ? 'منخفض' : 'نفذ'}
        </span>
      </div>

      <h3 className="text-silver font-body text-base font-medium mb-1 truncate">
        {product.name}
      </h3>

      <p className="text-silver/40 text-xs mb-3">{product.category}</p>

      <div className="flex items-center justify-between mt-auto">
        <div>
          <span className="text-xl font-semibold text-silver font-body">
            {product.price.toLocaleString('ar-EG')}
          </span>
          <span className="text-xs text-silver/50 mr-1">ج.م</span>
        </div>

        <button
          onClick={handleAdd}
          disabled={isOutOfStock}
          className={`
            w-9 h-9 rounded-full border flex items-center justify-center
            transition-all duration-300 active:scale-95
            ${isOutOfStock
              ? 'border-[rgba(192,192,192,0.1)] text-silver/20 cursor-not-allowed'
              : 'border-[rgba(192,192,192,0.3)] text-silver hover:bg-silver hover:text-void hover:border-silver'
            }
          `}
        >
          <Plus size={18} />
        </button>
      </div>

      <div className="mt-2 text-xs text-silver/30">
        المخزون: {product.stock}
      </div>
    </div>
  );
}
