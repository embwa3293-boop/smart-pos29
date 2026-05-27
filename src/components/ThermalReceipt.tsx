// ============================================================
//  ThermalReceipt.tsx — فاتورة حرارية احترافية
//  مع QR Code + Barcode + رسائل ترحيب/شكر
// ============================================================
import { useRef } from 'react';
import { Printer, X, Share2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import type { Sale, StoreSettings } from '@/types';

interface ThermalReceiptProps {
  sale:     Sale;
  settings: StoreSettings;
  onClose:  () => void;
}

const paymentLabels: Record<string, string> = {
  cash:     'كاش',
  visa:     'فيزا / بطاقة',
  instapay: 'إنستا باي',
  wallet:   'محفظة إلكترونية',
};

// ── Barcode SVG بسيط (Code 128 مبسط للعرض) ───────────────
function SimpleBarcode({ value }: { value: string }) {
  let seed = 0;
  for (let i = 0; i < value.length; i++) seed += value.charCodeAt(i);

  // توليد شرايط عشوائية ثابتة بناءً على القيمة
  const pattern = Array.from({ length: 60 }, (_, i) => {
    const v = (seed * (i + 1) * 13) % 100;
    return { width: v < 70 ? 1 : 2, isBlack: i % 3 !== 0 };
  });

  return (
    <svg width="160" height="40" viewBox="0 0 160 40" xmlns="http://www.w3.org/2000/svg">
      {pattern.reduce((acc, bar, i) => {
        const x = acc.x;
        if (bar.isBlack) {
          acc.elements.push(
            <rect key={i} x={x} y={0} width={bar.width} height={36} fill="#000" />
          );
        }
        acc.x += bar.width + 1;
        return acc;
      }, { x: 0, elements: [] as React.ReactElement[], }).elements}
    </svg>
  );
}

export default function ThermalReceipt({ sale, settings, onClose }: ThermalReceiptProps) {
  const receiptRef = useRef<HTMLDivElement>(null);

  // ── بيانات QR Code ────────────────────────────────────────
  const qrData = JSON.stringify({
    inv: sale.invoiceNumber,
    total: sale.total,
    date: sale.date,
    store: settings.name,
  });

  // ── طباعة ────────────────────────────────────────────────
  const handlePrint = () => {
    const content = receiptRef.current?.innerHTML;
    if (!content) return;
    const win = window.open('', '_blank', 'width=420,height=800');
    if (!win) return;
    win.document.write(`
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8"/>
        <title>فاتورة ${sale.invoiceNumber}</title>
        <style>
          *{margin:0;padding:0;box-sizing:border-box}
          body{font-family:'Courier New',monospace;font-size:12px;width:80mm;margin:0 auto;padding:4mm;color:#000;background:#fff;direction:rtl}
          .center{text-align:center}
          .bold{font-weight:bold}
          .large{font-size:16px}
          .small{font-size:10px}
          .divider{border-top:1px dashed #000;margin:5px 0}
          .double-divider{border-top:2px solid #000;margin:5px 0}
          .row{display:flex;justify-content:space-between;margin:2px 0}
          .total-row{font-size:15px;font-weight:bold}
          .welcome{font-size:11px;text-align:center;margin-bottom:4px;font-style:italic}
          .footer-msg{font-size:11px;text-align:center;margin-top:4px;font-style:italic}
          .qr-section{display:flex;align-items:center;justify-content:space-between;margin-top:6px}
          .barcode-section{text-align:center;margin-top:4px}
          @media print{body{width:80mm}@page{size:80mm auto;margin:0}}
        </style>
      </head>
      <body>
        ${content}
        <script>window.onload=()=>{window.print();window.close()}<\/script>
      </body>
      </html>
    `);
    win.document.close();
  };

  // ── مشاركة واتساب ────────────────────────────────────────
  const handleWhatsApp = () => {
    const lines = [
      `🏪 *${settings.name}*`,
      settings.phone    ? `📞 ${settings.phone}`   : '',
      settings.address  ? `📍 ${settings.address}`  : '',
      ``,
      settings.welcomeMsg ? `_${settings.welcomeMsg}_` : '',
      ``,
      `📋 *فاتورة رقم:* ${sale.invoiceNumber}`,
      `📅 ${sale.date} — ${sale.time}`,
      sale.customerName ? `👤 ${sale.customerName}` : '',
      `──────────────────`,
      ...sale.items.map(i =>
        `• ${i.name}\n  ${i.price.toLocaleString('ar-EG')} ج.م × ${i.qty} = *${i.subtotal.toLocaleString('ar-EG')} ج.م*`
      ),
      `──────────────────`,
      sale.discount > 0 ? `🏷️ خصم: ${sale.discount.toLocaleString('ar-EG')} ج.م` : '',
      `💰 *الإجمالي: ${sale.total.toLocaleString('ar-EG')} ج.م*`,
      `💳 ${paymentLabels[sale.paymentMethod]}`,
      ``,
      settings.taxNumber ? `الرقم الضريبي: ${settings.taxNumber}` : '',
      `──────────────────`,
      (settings as any).thankMsg || settings.footer || '🙏 شكراً لثقتكم',
    ].filter(Boolean).join('\n');

    window.open(`https://wa.me/?text=${encodeURIComponent(lines)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-void/90 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-sm bg-surface border border-[rgba(192,192,192,0.15)] rounded-2xl shadow-modal animate-slide-up overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[rgba(192,192,192,0.1)]">
          <h2 className="text-silver font-body font-semibold text-sm">
            فاتورة #{sale.invoiceNumber}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-[rgba(192,192,192,0.2)] flex items-center justify-center text-silver/50 hover:text-silver transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Receipt Preview */}
        <div className="overflow-y-auto max-h-[65vh] p-4">
          <div
            ref={receiptRef}
            className="bg-white text-black font-mono text-xs rounded-lg p-4 mx-auto"
            style={{ direction: 'rtl', fontFamily: "'Courier New', monospace", maxWidth: '300px' }}
          >
            {/* رسالة الترحيب */}
            {settings.welcomeMsg && (
              <div style={{ textAlign: 'center', fontSize: '11px', fontStyle: 'italic', marginBottom: '6px', borderBottom: '1px dashed #ccc', paddingBottom: '5px' }}>
                {settings.welcomeMsg}
              </div>
            )}

            {/* اسم المتجر */}
            <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '16px', marginBottom: '2px' }}>
              {settings.name || 'المتجر'}
            </div>
            {settings.phone && (
              <div style={{ textAlign: 'center', fontSize: '10px' }}>📞 {settings.phone}</div>
            )}
            {settings.address && (
              <div style={{ textAlign: 'center', fontSize: '10px' }}>📍 {settings.address}</div>
            )}

            <div style={{ borderTop: '2px solid #000', margin: '6px 0' }} />

            {/* بيانات الفاتورة */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', margin: '2px 0' }}>
              <span style={{ fontWeight: 'bold' }}>رقم الفاتورة:</span>
              <span>{sale.invoiceNumber}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', margin: '2px 0' }}>
              <span>التاريخ:</span>
              <span>{sale.date}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', margin: '2px 0' }}>
              <span>الوقت:</span>
              <span>{sale.time}</span>
            </div>
            {sale.customerName && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', margin: '2px 0' }}>
                <span>العميل:</span>
                <span style={{ fontWeight: 'bold' }}>{sale.customerName}</span>
              </div>
            )}

            <div style={{ borderTop: '1px dashed #000', margin: '6px 0' }} />

            {/* رأس الجدول */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '11px', marginBottom: '3px' }}>
              <span style={{ flex: 3 }}>الصنف</span>
              <span style={{ flex: 1, textAlign: 'center' }}>كمية</span>
              <span style={{ flex: 1.5, textAlign: 'left' }}>إجمالي</span>
            </div>
            <div style={{ borderTop: '1px dashed #000', marginBottom: '4px' }} />

            {/* بنود الفاتورة */}
            {sale.items.map((item, i) => (
              <div key={i} style={{ marginBottom: '5px' }}>
                <div style={{ fontSize: '11px', fontWeight: 'bold' }}>{item.name}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#444' }}>
                  <span style={{ flex: 3 }}>{item.price.toLocaleString('ar-EG')} ج.م × {item.qty}</span>
                  <span style={{ flex: 1.5, textAlign: 'left', fontWeight: 'bold' }}>
                    {item.subtotal.toLocaleString('ar-EG')} ج.م
                  </span>
                </div>
              </div>
            ))}

            <div style={{ borderTop: '1px dashed #000', margin: '6px 0' }} />

            {/* الإجماليات */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', margin: '2px 0' }}>
              <span>الإجمالي الفرعي:</span>
              <span>{sale.subtotal.toLocaleString('ar-EG')} ج.م</span>
            </div>
            {sale.discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', margin: '2px 0', color: '#c00' }}>
                <span>خصم:</span>
                <span>- {sale.discount.toLocaleString('ar-EG')} ج.م</span>
              </div>
            )}

            <div style={{ borderTop: '2px solid #000', margin: '6px 0' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '15px', margin: '4px 0' }}>
              <span>الإجمالي:</span>
              <span>{sale.total.toLocaleString('ar-EG')} ج.م</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', margin: '2px 0' }}>
              <span>طريقة الدفع:</span>
              <span style={{ fontWeight: 'bold' }}>{paymentLabels[sale.paymentMethod]}</span>
            </div>

            {settings.taxNumber && (
              <div style={{ fontSize: '10px', color: '#666', marginTop: '3px' }}>
                الرقم الضريبي: {settings.taxNumber}
              </div>
            )}

            <div style={{ borderTop: '1px dashed #000', margin: '8px 0 6px' }} />

            {/* QR Code + Barcode */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
              {/* QR Code */}
              <div style={{ textAlign: 'center' }}>
                <QRCodeSVG
                  value={qrData}
                  size={64}
                  bgColor="#ffffff"
                  fgColor="#000000"
                  level="M"
                />
                <div style={{ fontSize: '8px', color: '#888', marginTop: '2px' }}>امسح للتحقق</div>
              </div>

              {/* Barcode */}
              <div style={{ textAlign: 'center' }}>
                <SimpleBarcode value={sale.invoiceNumber} />
                <div style={{ fontSize: '9px', letterSpacing: '1px', marginTop: '2px', fontFamily: 'monospace' }}>
                  {sale.invoiceNumber}
                </div>
              </div>
            </div>

            <div style={{ borderTop: '1px dashed #000', margin: '8px 0 5px' }} />

            {/* رسالة الشكر */}
            <div style={{ textAlign: 'center', fontSize: '11px', fontStyle: 'italic' }}>
              {(settings as any).thankMsg || settings.footer || '🙏 شكراً لثقتكم — نتطلع لخدمتكم دائماً'}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="p-4 border-t border-[rgba(192,192,192,0.1)] flex gap-3">
          <button
            onClick={handleWhatsApp}
            className="flex-1 h-11 bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 rounded-xl font-body text-sm font-semibold flex items-center justify-center gap-2 hover:bg-emerald-600/30 transition-all"
          >
            <Share2 size={16} />
            واتساب
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 h-11 bg-silver text-void rounded-xl font-body text-sm font-semibold flex items-center justify-center gap-2 hover:bg-silver/90 transition-all"
          >
            <Printer size={16} />
            طباعة
          </button>
        </div>
      </div>
    </div>
  );
}
