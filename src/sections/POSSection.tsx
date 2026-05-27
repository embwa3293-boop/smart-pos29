import { useState } from 'react';
import { Search, Barcode } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import CartPanel from '@/components/CartPanel';
import { products, categories } from '@/data/mockData';

export default function POSSection() {
  const [activeCategory, setActiveCategory] = useState('الكل');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = products.filter((product) => {
    const matchesCategory = activeCategory === 'الكل' || product.category === activeCategory;
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.barcode.includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex gap-6 h-[calc(100vh-80px)]">
      {/* Product Browser */}
      <div className="flex-1 overflow-y-auto scrollbar-thin pr-2">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-silver font-body mb-4">إدارة المبيعات</h1>

          {/* Category Filters */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`
                  px-4 py-2 rounded-full text-sm font-body transition-all duration-300 border
                  ${activeCategory === cat
                    ? 'bg-silver text-void border-silver shadow-elevated'
                    : 'bg-transparent text-silver/60 border-[rgba(192,192,192,0.2)] hover:border-[rgba(192,192,192,0.4)] hover:text-silver'
                  }
                `}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <Search size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-silver/30" />
            <input
              type="text"
              placeholder="بحث باسم المنتج أو الباركود..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 bg-void border border-[rgba(192,192,192,0.15)] rounded-xl pr-12 pl-4 text-sm text-silver placeholder:text-silver/25 focus:outline-none focus:border-[rgba(192,192,192,0.4)] transition-all duration-300"
            />
            <button className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-surface border border-[rgba(192,192,192,0.15)] flex items-center justify-center text-silver/40 hover:text-silver hover:border-[rgba(192,192,192,0.3)] transition-all">
              <Barcode size={16} />
            </button>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-3 gap-4 pb-8">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-silver/30">
            <Search size={48} strokeWidth={1} />
            <p className="mt-4 text-sm font-body">لا توجد منتجات مطابقة</p>
          </div>
        )}
      </div>

      {/* Cart Panel */}
      <div className="w-[380px] flex-shrink-0">
        <CartPanel />
      </div>
    </div>
  );
}
