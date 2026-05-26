import { prisma } from '@/lib/prisma'
import ReserveButton from './components/ReserveButton';
export const dynamic = 'force-dynamic'

export default async function Home() {

  const products = await  prisma.product.findMany({
    include:{ stocks: { include: {warehouse: true}}}
  })
  return (
  <div className="min-h-screen bg-gray-50">
    <div className="bg-purple-800 text-white p-6 mb-8">
      <h1 className="text-2xl font-bold">Allo Inventory</h1>
      <p className="text-purple-200 text-sm">Manage your stock and reservations</p>
    </div>
    <div className="max-w-4xl mx-auto px-6">
      {products.map((p) => (
        <div key={p.id} className="bg-white rounded-xl shadow-sm p-6 mb-4 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">{p.name}</h2>
          <p className="text-gray-400 text-sm mb-4">SKU: {p.sku}</p>
          <ul className="space-y-2">
            {p.stocks.map((s) => (
              <li key={s.id} className="flex items-center justify-between bg-purple-50 p-3 rounded-lg">
                <span className="text-gray-700">{s.warehouse.name} — {s.totalUnits - s.reservedUnits} units available</span>
                <ReserveButton productId={p.id} warehouseId={s.warehouseId} />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  </div>
)

}
