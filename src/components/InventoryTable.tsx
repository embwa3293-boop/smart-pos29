// ============================================================
//  InventoryTable.tsx — إدارة المنتجات الكاملة
//  أسعار متعددة + وحدات + رف + أسماء بديلة + IndexedDB
// ============================================================
import { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, Search, ArrowUpDown, ChevronDown, ChevronUp, Package } from 'lucide-react';
import { getAll, putItem, deleteItem, seedIfEmpty } from '@/lib/db';
import { useConfirm } from '@/context/ConfirmContext';
import type { Product, ProductStatus, ClientType } from '@/types';

const CATEGORIES = ['الكل', 'مستلزمات طبية', 'مكملات غذائية', 'أجهزة طبية', 'أدوية', 'تجميل وعناية'];

const PRICE_TYPES: { key: ClientType; label: string; color: string }[] = [
  { key: 'public',   label: 'جمهور',    color: 'text-silver'        },
  { key: 'doctor',   label: 'طبيب',     color: 'text-blue-400'      },
  { key: 'pharmacy', label: 'صيدلية',   color: 'text-purple-400'    },
  { key: 'hospital', label: 'مستشفى',   color: 'text-emerald-400'   },
];

const emptyForm = (): Partial<Product> => ({
  name:      '',
  aliases:   [],
  barcode:   '',
  price:     0,
  prices:    { public: 0, doctor: 0, pharmacy: 0, hospital: 0 },
  buyPrice:  0,
  stock:     0,
  minStock:  10,
  category:  'مستلزمات طبية',
  status:    'available',
  shelf:     '',
  unit:      'piece',
  unitCount: 1,
  boxCount:  1,
});

function StatusBadge({ status }: { status: ProductStatus }) {
  const map = {
    available: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    low:       'bg-amber-500/10 text-amber-400 border-amber-500/20',
    out:       'bg-red-500/10 text-red-400 border-red-500/20',
  };
  const labels = { available: 'متوفر', low: 'منخفض', out: 'نفذ' };
  return (
    <span className={`inline-flex items-center text-xs px-2.5 py-1 rounded-full border ${map[status]}`}>
      {labels[status]}
    </span>
  );
}

export default function InventoryTable() {
  const { showConfirm, showToast } = useConfirm();

  const [products,      setProducts]      = useState<Product[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [searchQuery,   setSearchQuery]   = useState('');
  const [activeCategory,setActiveCategory]= useState('الكل');
  const [sortField,     setSortField]     = useState<keyof Product>('name');
  const [sortDir,       setSortDir]       = useState<'asc'|'desc'>('asc');
  const [showForm,      setShowForm]      = useState(false);
  const [editing,       setEditing]       = useState<Product | null>(null);
  const [form,          setForm]          = useState<Partial<Product>>(emptyForm());
  const [aliasInput,    setAliasInput]    = useState('');
  const [expandedId,    setExpandedId]    = useState<string | null>(null);

  // ── تحميل البيانات من IndexedDB ───────────────────────────
  useEffect(() => {
    const load = async () => {
      await seedIfEmpty();
      const data = await getAll<Product>('products');
      setProducts(data);
      setLoading(false);
    };
    load();
  }, []);

  // ── الفلترة والترتيب ──────────────────────────────────────
  const filtered = products
    .filter(p => {
      const matchCat = activeCategory === 'الكل' || p.category === activeCategory;
      const q = searchQuery.toLowerCase();
      const matchSearch = !q
        || p.name.toLowerCase().includes(q)
        || p.barcode.includes(q)
        || (p.aliases || []).some(a => a.toLowerCase().includes(q))
        || (p.shelf || '').toLowerCase().includes(q);
      return matchCat && matchSearch;
    })
    .sort((a, b) => {
      const av = a[sortField] ?? '';
      const bv = b[sortField] ?? '';
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortDir === 'asc' ? cmp : -cmp;
    });

  const handleSort = (field: keyof Product) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  // ── حفظ المنتج ────────────────────────────────────────────
  const handleSave = async () => {
    if (!form.name || !form.barcode) {
      showToast('أدخل اسم المنتج والباركود', 'warning');
      return;
    }

    // تحديث الـ status تلقائياً
    const stock = form.stock ?? 0;
    const min   = form.minStock ?? 10;
    const status: ProductStatus = stock === 0 ? 'out' : stock <= min ? 'low' : 'available';

    const product: Product = {
      id:        editing?.id ?? `P${Date.now()}`,
      name:      form.name!,
      aliases:   form.aliases ?? [],
      barcode:   form.barcode!,
      price:     form.prices?.public ?? form.price ?? 0,
      prices:    form.prices ?? { public: 0, doctor: 0, pharmacy: 0, hospital: 0 },
      buyPrice:  form.buyPrice ?? 0,
      stock,
      minStock:  min,
      category:  form.category ?? 'مستلزمات طبية',
      status,
      shelf:     form.shelf ?? '',
      unit:      form.unit ?? 'piece',
      unitCount: form.unitCount ?? 1,
      boxCount:  form.boxCount ?? 1,
    };

    await putItem('products', product);

    setProducts(prev =>
      editing
        ? prev.map(p => p.id === editing.id ? product : p)
        : [...prev, product]
    );

    showToast(editing ? 'تم تعديل المنتج' : 'تم إضافة المنتج', 'success');
    setShowForm(false);
    setEditing(null);
    setForm(emptyForm());
    setAliasInput('');
  };

  // ── حذف المنتج ────────────────────────────────────────────
  const handleDelete = async (p: Product) => {
    const ok = await showConfirm({
      title:        'حذف المنتج',
      message:      `هل أنت متأكد من حذف "${p.name}"؟ لن يمكن التراجع.`,
      confirmLabel: 'نعم، احذف',
      danger:       true,
    });
    if (!ok) return;
    await deleteItem('products', p.id);
    setProducts(prev => prev.filter(x => x.id !== p.id));
    showToast('تم حذف المنتج', 'warning');
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({ ...p, prices: p.prices ?? { public: p.price, doctor: 0, pharmacy: 0, hospital: 0 } });
    setShowForm(true);
    setAliasInput('');
  };

  const addAlias = () => {
    if (!aliasInput.trim()) return;
    setForm(f => ({ ...f, aliases: [...(f.aliases ?? []), aliasInput.trim()] }));
    setAliasInput('');
  };

  if (loading) {
    return (
      <div className="bg-surface rounded-xl p-12 text-center text-silver/30">
        <Package size={40} strokeWidth={1} className="mx-auto mb-3" />
        <p className="font-body text-sm">جاري تحميل المنتجات...</p>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-xl shadow-elevated overflow-hidden">

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="p-4 md:p-6 border-b border-[rgba(192,192,192,0.1)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h2 className="text-lg font-semibold text-silver font-body">
            المنتجات ({products.length})
          </h2>
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:flex-none">
              <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-silver/30" />
              <input
                type="text"
                placeholder="بحث بالاسم أو الباركود أو الرف..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="h-9 w-full sm:w-64 bg-void border border-[rgba(192,192,192,0.2)] rounded-lg pr-9 pl-3 text-sm text-silver placeholder:text-silver/30 focus:outline-none focus:border-[rgba(192,192,192,0.4)]"
              />
            </div>
            <button
              onClick={() => { setEditing(null); setForm(emptyForm()); setShowForm(true); }}
              className="h-9 px-4 bg-silver text-void rounded-lg text-sm font-body font-medium hover:bg-silver/90 transition-colors flex items-center gap-1.5 shrink-0"
            >
              <Plus size={14} />
              <span className="hidden sm:inline">إضافة منتج</span>
              <span className="sm:hidden">+</span>
            </button>
          </div>
        </div>

        {/* فلاتر الفئات */}
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-body transition-all border
                ${activeCategory === cat
                  ? 'bg-silver text-void border-silver'
                  : 'text-silver/50 border-[rgba(192,192,192,0.15)] hover:text-silver hover:border-[rgba(192,192,192,0.3)]'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── نموذج الإضافة/التعديل ──────────────────────────── */}
      {showForm && (
        <div className="p-4 md:p-6 bg-void/50 border-b border-[rgba(192,192,192,0.1)]">
          <h3 className="text-sm font-semibold text-silver font-body mb-4">
            {editing ? 'تعديل المنتج' : 'منتج جديد'}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
            {/* الاسم */}
            <div>
              <label className="text-xs text-silver/50 font-body mb-1 block">اسم المنتج *</label>
              <input
                placeholder="اسم المنتج"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full h-9 bg-surface border border-[rgba(192,192,192,0.2)] rounded-lg px-3 text-sm text-silver placeholder:text-silver/30 focus:outline-none focus:border-[rgba(192,192,192,0.4)]"
              />
            </div>

            {/* الباركود */}
            <div>
              <label className="text-xs text-silver/50 font-body mb-1 block">الباركود *</label>
              <input
                placeholder="6xxxxxxxxx"
                value={form.barcode}
                onChange={e => setForm(f => ({ ...f, barcode: e.target.value }))}
                className="w-full h-9 bg-surface border border-[rgba(192,192,192,0.2)] rounded-lg px-3 text-sm text-silver font-mono placeholder:text-silver/30 focus:outline-none focus:border-[rgba(192,192,192,0.4)]"
              />
            </div>

            {/* رقم الرف */}
            <div>
              <label className="text-xs text-silver/50 font-body mb-1 block">رقم الرف</label>
              <input
                placeholder="مثال: A3 أو رف 5"
                value={form.shelf}
                onChange={e => setForm(f => ({ ...f, shelf: e.target.value }))}
                className="w-full h-9 bg-surface border border-[rgba(192,192,192,0.2)] rounded-lg px-3 text-sm text-silver placeholder:text-silver/30 focus:outline-none focus:border-[rgba(192,192,192,0.4)]"
              />
            </div>

            {/* الفئة */}
            <div>
              <label className="text-xs text-silver/50 font-body mb-1 block">الفئة</label>
              <select
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="w-full h-9 bg-surface border border-[rgba(192,192,192,0.2)] rounded-lg px-3 text-sm text-silver focus:outline-none focus:border-[rgba(192,192,192,0.4)]"
              >
                {CATEGORIES.slice(1).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* الكمية */}
            <div>
              <label className="text-xs text-silver/50 font-body mb-1 block">الكمية الحالية</label>
              <input
                type="number" min={0}
                value={form.stock || ''}
                onChange={e => setForm(f => ({ ...f, stock: Number(e.target.value) }))}
                className="w-full h-9 bg-surface border border-[rgba(192,192,192,0.2)] rounded-lg px-3 text-sm text-silver placeholder:text-silver/30 focus:outline-none focus:border-[rgba(192,192,192,0.4)]"
              />
            </div>

            {/* الحد الأدنى */}
            <div>
              <label className="text-xs text-silver/50 font-body mb-1 block">الحد الأدنى للتنبيه</label>
              <input
                type="number" min={0}
                value={form.minStock || ''}
                onChange={e => setForm(f => ({ ...f, minStock: Number(e.target.value) }))}
                className="w-full h-9 bg-surface border border-[rgba(192,192,192,0.2)] rounded-lg px-3 text-sm text-silver placeholder:text-silver/30 focus:outline-none focus:border-[rgba(192,192,192,0.4)]"
              />
            </div>

            {/* سعر الشراء */}
            <div>
              <label className="text-xs text-silver/50 font-body mb-1 block">سعر الشراء (ج.م)</label>
              <input
                type="number" min={0}
                value={form.buyPrice || ''}
                onChange={e => setForm(f => ({ ...f, buyPrice: Number(e.target.value) }))}
                className="w-full h-9 bg-surface border border-[rgba(192,192,192,0.2)] rounded-lg px-3 text-sm text-silver placeholder:text-silver/30 focus:outline-none focus:border-[rgba(192,192,192,0.4)]"
              />
            </div>
          </div>

          {/* ── الأسعار المتعددة ─────────────────────────────── */}
          <div className="mb-4">
            <label className="text-xs text-silver/50 font-body mb-2 block">
              الأسعار حسب النوع (ج.م) — لا تظهر في الفاتورة
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PRICE_TYPES.map(({ key, label, color }) => (
                <div key={key}>
                  <label className={`text-xs font-body mb-1 block ${color}`}>{label}</label>
                  <input
                    type="number" min={0}
                    value={form.prices?.[key] || ''}
                    onChange={e => setForm(f => ({
                      ...f,
                      prices: { ...f.prices!, [key]: Number(e.target.value) },
                      ...(key === 'public' ? { price: Number(e.target.value) } : {}),
                    }))}
                    className="w-full h-9 bg-surface border border-[rgba(192,192,192,0.2)] rounded-lg px-3 text-sm text-silver placeholder:text-silver/30 focus:outline-none focus:border-[rgba(192,192,192,0.4)]"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* ── الأسماء البديلة ───────────────────────────────── */}
          <div className="mb-4">
            <label className="text-xs text-silver/50 font-body mb-2 block">
              الأسماء البديلة (علمية / تجارية)
            </label>
            <div className="flex gap-2 mb-2">
              <input
                placeholder="اسم بديل للمنتج..."
                value={aliasInput}
                onChange={e => setAliasInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addAlias()}
                className="flex-1 h-9 bg-surface border border-[rgba(192,192,192,0.2)] rounded-lg px-3 text-sm text-silver placeholder:text-silver/30 focus:outline-none focus:border-[rgba(192,192,192,0.4)]"
              />
              <button
                onClick={addAlias}
                className="h-9 px-3 bg-surface border border-[rgba(192,192,192,0.2)] rounded-lg text-silver/60 hover:text-silver text-sm hover:border-[rgba(192,192,192,0.4)] transition-all"
              >
                <Plus size={14} />
              </button>
            </div>
            {(form.aliases ?? []).length > 0 && (
              <div className="flex flex-wrap gap-2">
                {(form.aliases ?? []).map((a, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 bg-void border border-[rgba(192,192,192,0.15)] text-silver/60 text-xs px-2 py-1 rounded-full"
                  >
                    {a}
                    <button
                      onClick={() => setForm(f => ({ ...f, aliases: f.aliases?.filter((_, j) => j !== i) }))}
                      className="hover:text-red-400 transition-colors"
                    >×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="h-9 px-6 bg-silver text-void rounded-lg text-sm font-body font-medium hover:bg-silver/90 transition-colors"
            >
              حفظ
            </button>
            <button
              onClick={() => { setShowForm(false); setEditing(null); setForm(emptyForm()); }}
              className="h-9 px-6 border border-[rgba(192,192,192,0.2)] text-silver/60 rounded-lg text-sm font-body hover:text-silver hover:border-[rgba(192,192,192,0.4)] transition-colors"
            >
              إلغاء
            </button>
          </div>
        </div>
      )}

      {/* ── الجدول ─────────────────────────────────────────── */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[rgba(192,192,192,0.1)]">
              {[
                { key: 'name',     label: 'المنتج'    },
                { key: 'shelf',    label: 'الرف'      },
                { key: 'stock',    label: 'الكمية'    },
                { key: 'price',    label: 'سعر الجمهور' },
                { key: 'buyPrice', label: 'سعر الشراء' },
                { key: 'status',   label: 'الحالة'    },
              ].map(col => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key as keyof Product)}
                  className="text-right py-3 px-4 text-xs text-silver/50 font-body font-medium cursor-pointer hover:text-silver transition-colors whitespace-nowrap"
                >
                  <span className="flex items-center gap-1">
                    {col.label}
                    <ArrowUpDown size={11} className={sortField === col.key ? 'text-silver' : 'text-silver/20'} />
                  </span>
                </th>
              ))}
              <th className="py-3 px-4" />
            </tr>
          </thead>
          <tbody>
            {filtered.map(product => (
              <>
                <tr
                  key={product.id}
                  className="border-b border-[rgba(192,192,192,0.05)] hover:bg-[rgba(32,90,104,0.15)] transition-colors cursor-pointer"
                  onClick={() => setExpandedId(expandedId === product.id ? null : product.id)}
                >
                  <td className="py-3 px-4">
                    <div>
                      <p className="text-sm text-silver font-body">{product.name}</p>
                      <p className="text-xs text-silver/30 font-mono">{product.barcode}</p>
                      {(product.aliases ?? []).length > 0 && (
                        <p className="text-xs text-silver/40 font-body mt-0.5">
                          {product.aliases!.join(' • ')}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-silver/70 font-body bg-void px-2 py-0.5 rounded-md border border-[rgba(192,192,192,0.1)]">
                      {product.shelf || '—'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-silver font-body tabular-nums">
                    {product.stock}
                  </td>
                  <td className="py-3 px-4 text-sm text-silver font-body tabular-nums">
                    {(product.prices?.public ?? product.price).toLocaleString('ar-EG')} ج.م
                  </td>
                  <td className="py-3 px-4 text-sm text-silver/50 font-body tabular-nums">
                    {product.buyPrice.toLocaleString('ar-EG')} ج.م
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={product.status} />
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => openEdit(product)}
                        className="w-7 h-7 rounded-lg border border-[rgba(192,192,192,0.15)] flex items-center justify-center text-silver/40 hover:text-silver hover:border-[rgba(192,192,192,0.4)] transition-all"
                      >
                        <Edit3 size={12} />
                      </button>
                      <button
                        onClick={() => handleDelete(product)}
                        className="w-7 h-7 rounded-lg border border-[rgba(192,192,192,0.15)] flex items-center justify-center text-silver/40 hover:text-red-400 hover:border-red-400/30 transition-all"
                      >
                        <Trash2 size={12} />
                      </button>
                      {expandedId === product.id
                        ? <ChevronUp size={14} className="text-silver/30 mr-1" />
                        : <ChevronDown size={14} className="text-silver/30 mr-1" />
                      }
                    </div>
                  </td>
                </tr>

                {/* ── تفاصيل الأسعار المتعددة (عند الضغط) ── */}
                {expandedId === product.id && (
                  <tr key={`${product.id}-expanded`} className="bg-void/40">
                    <td colSpan={7} className="px-4 py-3">
                      <div className="flex flex-wrap gap-4">
                        {PRICE_TYPES.map(({ key, label, color }) => (
                          <div key={key} className="flex items-center gap-2">
                            <span className={`text-xs font-body ${color}`}>{label}:</span>
                            <span className="text-sm font-body text-silver tabular-nums">
                              {(product.prices?.[key] ?? 0).toLocaleString('ar-EG')} ج.م
                            </span>
                          </div>
                        ))}
                        {product.shelf && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-body text-silver/40">الرف:</span>
                            <span className="text-sm font-body text-silver">{product.shelf}</span>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="py-12 text-center text-silver/30">
            <Package size={36} strokeWidth={1} className="mx-auto mb-3" />
            <p className="text-sm font-body">لا توجد منتجات مطابقة</p>
          </div>
        )}
      </div>
    </div>
  );
}
