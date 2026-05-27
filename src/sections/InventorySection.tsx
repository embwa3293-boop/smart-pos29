import InventoryTable from '@/components/InventoryTable';

export default function InventorySection() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-silver font-body">المخزون والمنتجات</h1>
        <p className="text-sm text-silver/40 mt-1 font-body">إدارة المنتجات، المخزون، والتنبيهات</p>
      </div>
      <InventoryTable />
    </div>
  );
}
