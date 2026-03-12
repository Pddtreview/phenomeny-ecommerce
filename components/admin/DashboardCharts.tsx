'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
} from 'recharts';

const PRIMARY = '#1B3A6B';
const GOLD = '#C8860A';
const STATUS_COLORS: Record<string, string> = {
  confirmed: '#1B3A6B',
  shipped: '#b45309',
  delivered: '#15803d',
  cancelled: '#b91c1c',
  pending: '#6b7280',
};

type DailyRevenuePoint = { date: string; revenue: number };
type OrdersByStatusPoint = { name: string; value: number };
type OrdersByPaymentPoint = { method: string; count: number };
type TopProductRow = { rank: number; product_name: string; revenue: number; orders_count: number };

type DashboardChartsProps = {
  dailyRevenue: DailyRevenuePoint[];
  ordersByStatus: OrdersByStatusPoint[];
  ordersByPayment: OrdersByPaymentPoint[];
  topProducts: TopProductRow[];
};

function formatDate(str: string) {
  const d = new Date(str);
  const day = d.getUTCDate();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[d.getUTCMonth()];
  return `${day.toString().padStart(2, '0')} ${month}`;
}

export function DashboardCharts({
  dailyRevenue,
  ordersByStatus,
  ordersByPayment,
  topProducts,
}: DashboardChartsProps) {
  const pieData = ordersByStatus.map((s) => ({
    name: s.name.replace(/_/g, ' '),
    value: s.value,
    color: STATUS_COLORS[s.name] ?? '#6b7280',
  }));

  function renderPieLabel(props: { name: string; value: number }) {
    return props.name + ': ' + props.value;
  }

  function formatYAxisTick(v: number) {
    return '₹' + v;
  }

  function formatRevenueTooltip(value: number) {
    return ['₹' + Number(value).toLocaleString('en-IN'), 'Revenue'];
  }

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-zinc-900">Daily Revenue (Last 30 days)</h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dailyRevenue} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                stroke="#71717a"
                fontSize={12}
              />
              <YAxis stroke="#71717a" fontSize={12} tickFormatter={formatYAxisTick} />
              <Tooltip
                formatter={formatRevenueTooltip}
                labelFormatter={(label) => formatDate(label)}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke={PRIMARY}
                strokeWidth={2}
                dot={{ fill: PRIMARY }}
                name="Revenue"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-zinc-900">Orders by Status</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={renderPieLabel}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={'cell-' + index} fill={entry.color} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip formatter={(value: number) => [value, 'Orders']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-zinc-900">Orders by Payment Method</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={ordersByPayment}
                margin={{ top: 20, right: 20, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                <XAxis dataKey="method" stroke="#71717a" fontSize={12} />
                <YAxis stroke="#71717a" fontSize={12} />
                <Tooltip />
                <Bar dataKey="count" name="Orders" radius={[4, 4, 0, 0]} maxBarSize={80}>
                  {ordersByPayment.map((entry, index) => (
                    <Cell
                      key={'cell-' + index}
                      fill={entry.method === 'prepaid' ? GOLD : PRIMARY}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-zinc-900">Top Products by Revenue</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50">
                <th className="px-4 py-3 font-medium text-zinc-600">Rank</th>
                <th className="px-4 py-3 font-medium text-zinc-600">Product</th>
                <th className="px-4 py-3 font-medium text-zinc-600">Total Revenue (₹)</th>
                <th className="px-4 py-3 font-medium text-zinc-600">Orders</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((row) => (
                <tr key={row.rank} className="border-b border-zinc-100 last:border-0">
                  <td className="px-4 py-3 font-medium text-zinc-900">{row.rank}</td>
                  <td className="px-4 py-3 text-zinc-900">{row.product_name}</td>
                  <td className="px-4 py-3 font-medium text-zinc-900">
                    ₹{Number(row.revenue).toLocaleString('en-IN')}
                  </td>
                  <td className="px-4 py-3 text-zinc-600">{row.orders_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {topProducts.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-zinc-500">No data</p>
          )}
        </div>
      </div>
    </div>
  );
}
