import React from 'react';
import { useTranslation } from 'react-i18next';

export default function PrintableInvoice({ order }: { order: any }) {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  if (!order) return null;

  return (
    <>
      <style type="text/css" media="print">
        {`
          @page { size: A4; margin: 10mm; }
          body * { visibility: hidden; }
          .printable-invoice, .printable-invoice * { visibility: visible; }
          .printable-invoice { position: absolute; left: 0; top: 0; width: 100%; }
        `}
      </style>
      <div className="printable-invoice hidden print:block w-full bg-white text-black p-8 font-sans" dir={isAr ? 'rtl' : 'ltr'}>
        {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-gray-800 pb-6 mb-8">
        <div>
          <h1 className="text-4xl font-serif font-bold text-black mb-2">ZHI Coffee</h1>
          <p className="text-gray-600 text-sm">123 Coffee Street, Riyadh, KSA</p>
          <p className="text-gray-600 text-sm">VAT: 310000000000003</p>
        </div>
        <div className="text-end">
          <h2 className="text-3xl font-bold text-gray-800 mb-2 uppercase">{isAr ? 'فاتورة' : 'INVOICE'}</h2>
          <p className="font-bold text-sm">#{order.id.substring(0, 8).toUpperCase()}</p>
          <p className="text-sm text-gray-600 mt-1">
            {order.createdAt?.toDate().toLocaleDateString(isAr ? 'ar-SA' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Customer Info */}
      <div className="flex justify-between mb-10">
        <div className="w-1/2 pe-4">
          <h3 className="font-bold text-gray-800 border-b border-gray-300 pb-2 mb-3">{isAr ? 'فاتورة إلى:' : 'Billed To:'}</h3>
          <p className="font-bold capitalize">{order.address?.name || 'Customer'}</p>
          <p className="text-gray-600 text-sm mt-1">{order.address?.street}</p>
          <p className="text-gray-600 text-sm">{order.address?.city}</p>
          <p className="text-gray-600 text-sm mt-1">{order.address?.phone}</p>
        </div>
        <div className="w-1/2 ps-4">
          <h3 className="font-bold text-gray-800 border-b border-gray-300 pb-2 mb-3">{isAr ? 'معلومات التوصيل:' : 'Delivery Info:'}</h3>
          <p className="text-gray-600 text-sm"><span className="font-bold text-gray-800">{isAr ? 'طريقة الدفع:' : 'Payment:'}</span> {order.paymentMethod === 'card' ? (isAr ? 'بطاقة ائتمان' : 'Credit Card') : (isAr ? 'الدفع عند الاستلام' : 'Cash on Delivery')}</p>
          <p className="text-gray-600 text-sm mt-1"><span className="font-bold text-gray-800">{isAr ? 'طريقة الشحن:' : 'Courier:'}</span> {order.courier?.name || '-'}</p>
          <p className="text-gray-600 text-sm mt-1"><span className="font-bold text-gray-800">{isAr ? 'حالة الطلب:' : 'Status:'}</span> {order.status}</p>
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full text-start mb-8">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-3 text-start border-b border-gray-300 font-bold">{isAr ? 'المنتج' : 'Item'}</th>
            <th className="p-3 text-center border-b border-gray-300 font-bold">{isAr ? 'الكمية' : 'Qty'}</th>
            <th className="p-3 text-end border-b border-gray-300 font-bold">{isAr ? 'السعر' : 'Price'}</th>
            <th className="p-3 text-end border-b border-gray-300 font-bold">{isAr ? 'المجموع' : 'Total'}</th>
          </tr>
        </thead>
        <tbody>
          {order.items?.map((item: any, idx: number) => (
            <tr key={idx} className="border-b border-gray-200">
              <td className="p-3 font-medium">{item.name}</td>
              <td className="p-3 text-center">{item.quantity}</td>
              <td className="p-3 text-end">{item.price} {isAr ? 'رس' : 'SAR'}</td>
              <td className="p-3 text-end font-bold">{(item.price * item.quantity).toFixed(2)} {isAr ? 'رس' : 'SAR'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end">
        <div className="w-1/2 md:w-1/3">
          <div className="flex justify-between py-2 border-b border-gray-200">
            <span className="text-gray-600">{isAr ? 'المجموع الفرعي:' : 'Subtotal:'}</span>
            <span>{order.total} {isAr ? 'رس' : 'SAR'}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-200">
            <span className="text-gray-600">{isAr ? 'الضريبة (15%):' : 'VAT (15%):'}</span>
            <span>{isAr ? 'مشمول' : 'Included'}</span>
          </div>
          <div className="flex justify-between py-3 border-b-2 border-gray-800 font-bold text-lg">
            <span>{isAr ? 'الإجمالي:' : 'Total:'}</span>
            <span>{order.total} {isAr ? 'رس' : 'SAR'}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-16 text-center text-sm text-gray-500 border-t border-gray-300 pt-8">
        <p>{isAr ? 'شكراً لتسوقكم معنا!' : 'Thank you for your business!'}</p>
        <p className="mt-1">zhi-coffee.com | support@zhi-coffee.com | +966 50 000 0000</p>
      </div>
    </div>
    </>
  );
}
