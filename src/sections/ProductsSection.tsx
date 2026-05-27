import InventoryTable from '@/components/InventoryTable';

export default function ProductsSection() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-silver font-body">المنتجات</h1>
        <p className="text-sm text-silver/40 mt-1 font-body">إدارة المنتجات والتسعير</p>
      </div>
      <InventoryTable />
    </div>
  );
}
