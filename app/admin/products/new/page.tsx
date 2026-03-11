import Link from "next/link";

export default function AdminNewProductPage() {
  return (
    <div className="space-y-6">
      <Link
        href="/admin/products"
        className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
      >
        ← Products
      </Link>
      <h1 className="text-2xl font-bold text-zinc-900">Add Product</h1>
      <p className="text-sm text-zinc-500">
        Product creation form coming soon.
      </p>
    </div>
  );
}
