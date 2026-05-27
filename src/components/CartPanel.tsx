// ============================================================
//  CartPanel.tsx — سلة المشتريات مع حفظ IndexedDB + فاتورة
// ============================================================
import { Minus, Plus, Trash2, Receipt, Printer } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useConfirm } from '@/context/ConfirmContext';
import { useState } from 'react';
import PaymentMethodButton from './PaymentMethodButton';
import ThermalReceipt from './ThermalReceipt';
import { putItem, getById } from '@/lib/db';
import type { PaymentMethod, Sale, StoreSettings } from '@/types';

const paymentMethods: { method: PaymentMethod; label: string }[] = [
  { method: 'cash',     label: 'كاش'       },
  { method: 'visa',     label: 'فيزا'       },
  { method: 'instapay', label: 'إنستا باي'  },
  { method: 'wallet',   label: 'محفظة'      },
];

// ── توليد رقم فاتورة ──────────────────────────────────────
function generateInvoiceNumber(): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.floor(Math.random() * 9000) + 1000;
  return `INV-${date}-${rand}`;
}

export default function CartPanel() {
  const {
    items, discount, paymentMethod,
    updateQty, removeItem, clearCart,
    setDiscount, setPaymentMethod,
    subtotal, total, itemCount,
  } = useCart();

  const { showConfirm, showToast } = useConfirm();

  const [showDiscountInput, setShowDiscountInput] = useState(false);
  const [discountValue,     setDiscountValue]     = useState('');
  const [lastSale,          setLastSale]          = useState<Sale | null>(null);
  const [storeSettings,     setStoreSettings]     = useState<StoreSettings | null>(null);
  const [showReceipt,       setShowReceipt]       = useState(false);
  const [loading,           setLoading]           = useState(false);

  // ── تطبيق الخصم ──────────────────────────────────────────
  const handleApplyDiscount = () => {
    const val = parseFloat(discountValue);
    if (!isNaN(val) && val >= 0) setDiscount(val);
    setShowDiscountInput(false);
    setDiscountValue('');
  };

  // ── حذف كل السلة مع تأكيد ────────────────────────────────
  const handleClearCart = async () => {
    if (items.length === 0) return;
    const ok = await showConfirm({
      title:        'حذف السلة',
      message:      'هل أنت متأكد من حذف جميع المنتجات من السلة؟',
      confirmLabel: 'نعم، احذف',
      cancelLabel:  'إلغاء',
      danger:       true,
    });
    if (ok) clearCart();
  };

  // ── إتمام البيع ───────────────────────────────────────────
  const handleCompleteSale = async () => {
    if (items.length === 0) return;

    setLoading(true);
    try {
      // بيانات الفاتورة
      const now = new Date();
      const sale: Sale = {
        id:            generateInvoiceNumber(),
        invoiceNumber: generateInvoiceNumber(),
        items:         items.map(i => ({
          productId: i.productId,
          name:      i.name,
          price:     i.price,
          qty:       i.qty,
          subtotal:  i.price * i.qty,
        })),
        subtotal,
        discount,
        total,
        paymentMethod,
        date:      now.toLocaleDateString('ar-EG'),
        time:      now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        timestamp: now.getTime(),
      };

      // حفظ في IndexedDB
      await putItem('sales', sale);

      // إعدادات المتجر للفاتورة
      const settings = await getById<StoreSettings>('settings', 'storeInfo');
      setStoreSettings(settings ?? {
        id:         'storeInfo',
        name:       'المتجر',
        phone:      '',
        address:    '',
        taxNumber:  '',
        welcomeMsg: '',
        footer:     'شكراً لزيارتكم',
        logo:       '',
      });

      setLastSale(sale);
      setShowReceipt(true);
      clearCart();
      showToast('تم حفظ الفاتورة بنجاح', 'success');
    } catch (err) {
      console.error(err);
      showToast('حدث خطأ أثناء الحفظ', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="bg-surface rounded-xl p-6 shadow-elevated flex flex-col h-[calc(100vh-140px)] sticky top-[88px] relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-[rgba(192,192,192,0.1)]">
          <div className="flex items-center gap-2">
            <Receipt size={18} className="text-silver" />
            <h2 className="text-lg font-semibold text-silver font-body">فاتورة البيع الحالية</h2>
          </div>
          {items.length > 0 && (
            <button
              onClick={handleClearCart}
              className="text-xs text-silver/40 hover:text-red-400 transition-colors duration-300 flex items-center gap-1"
            >
              <Trash2 size={12} />
              حذف الكل
            </button>
          )}
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto scrollbar-thin mb-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-silver/30">
              <Receipt size={48} strokeWidth={1} />
              <p className="mt-3 text-sm font-body">السلة فارغة</p>
              <p className="text-xs mt-1">أضف منتجات من القائمة</p>
            </div>
          ) : (
            <div className="space-y-0">
              {items.map((item) => (
                <div key={item.productId} className="flex items-center justify-between py-3 border-b border-[rgba(192,192,192,0.08)] last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-silver font-body truncate">{item.name}</p>
                    <p className="text-xs text-silver/40">{item.price.toLocaleString('ar-EG')} ج.م</p>
                  </div>

                  <div className="flex items-center gap-2 mr-3">
                    <button
                      onClick={() => updateQty(item.productId, item.qty - 1)}
                      className="w-6 h-6 rounded-full border border-[rgba(192,192,192,0.2)] flex items-center justify-center text-silver/60 hover:bg-silver/10 hover:text-silver transition-all duration-200"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="text-sm text-silver font-body w-6 text-center tabular-nums">{item.qty}</span>
                    <button
                      onClick={() => updateQty(item.productId, item.qty + 1)}
                      className="w-6 h-6 rounded-full border border-[rgba(192,192,192,0.2)] flex items-center justify-center text-silver/60 hover:bg-silver/10 hover:text-silver transition-all duration-200"
                    >
                      <Plus size={12} />
                    </button>
                  </div>

                  <div className="mr-3 text-left min-w-[60px]">
                    <p className="text-sm text-silver font-body tabular-nums text-left">
                      {(item.price * item.qty).toLocaleString('ar-EG')}
                    </p>
                  </div>

                  <button
                    onClick={() => removeItem(item.productId)}
                    className="mr-2 text-silver/20 hover:text-red-400 transition-colors duration-200"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Totals & Payment */}
        {items.length > 0 && (
          <div className="border-t border-[rgba(192,192,192,0.1)] pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-silver/50 font-body">الإجمالي الفرعي</span>
              <span className="text-silver font-body tabular-nums">{subtotal.toLocaleString('ar-EG')} ج.م</span>
            </div>

            <div className="flex justify-between text-sm items-center">
              <button
                onClick={() => setShowDiscountInput(!showDiscountInput)}
                className="text-silver/50 hover:text-silver transition-colors font-body text-xs underline underline-offset-2"
              >
                {discount > 0 ? `الخصم: ${discount.toLocaleString('ar-EG')} ج.م` : 'إضافة خصم'}
              </button>
              {discount > 0 && (
                <button onClick={() => setDiscount(0)} className="text-red-400/60 hover:text-red-400 text-xs transition-colors">
                  إلغاء
                </button>
              )}
            </div>

            {showDiscountInput && (
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="قيمة الخصم"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleApplyDiscount()}
                  className="flex-1 h-9 bg-void border border-[rgba(192,192,192,0.2)] rounded-lg px-3 text-sm text-silver placeholder:text-silver/30 focus:outline-none focus:border-[rgba(192,192,192,0.4)]"
                  autoFocus
                />
                <button
                  onClick={handleApplyDiscount}
                  className="h-9 px-4 bg-silver text-void rounded-lg text-sm font-body hover:bg-silver/90 transition-colors"
                >
                  تطبيق
                </button>
              </div>
            )}

            <div className="flex justify-between text-lg font-semibold pt-2 border-t border-[rgba(192,192,192,0.1)]">
              <span className="text-silver font-body">الإجمالي</span>
              <span className="text-silver font-body tabular-nums">{total.toLocaleString('ar-EG')} ج.م</span>
            </div>

            {/* طرق الدفع */}
            <div className="pt-2">
              <p className="text-xs text-silver/40 mb-2 font-body">طريقة الدفع</p>
              <div className="flex gap-2">
                {paymentMethods.map(({ method, label }) => (
                  <PaymentMethodButton
                    key={method}
                    method={method}
                    label={label}
                    isActive={paymentMethod === method}
                    onClick={() => setPaymentMethod(method)}
                  />
                ))}
              </div>
            </div>

            {/* زر الإتمام */}
            <button
              onClick={handleCompleteSale}
              disabled={loading}
              className="w-full h-14 mt-4 bg-silver text-void rounded-lg font-body font-semibold text-base hover:bg-teal hover:text-silver transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-2 shadow-elevated disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Printer size={18} />
              {loading ? 'جاري الحفظ...' : 'إتمام البيع والطباعة'}
            </button>
          </div>
        )}

        {/* Badge عدد العناصر */}
        {itemCount > 0 && (
          <div className="absolute -top-2 -left-2 w-6 h-6 bg-silver text-void rounded-full flex items-center justify-center text-xs font-semibold shadow-elevated">
            {itemCount}
          </div>
        )}
      </div>

      {/* الفاتورة الحرارية */}
      {showReceipt && lastSale && storeSettings && (
        <ThermalReceipt
          sale={lastSale}
          settings={storeSettings}
          onClose={() => setShowReceipt(false)}
        />
      )}
    </>
  );
}
