import { useMemo } from "react";
import {
  BarChart3,
  TrendingUp,
  Package,
  DollarSign,
  Users,
  Star,
  ShoppingCart,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/providers/trpc";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";

const STATUS_COLORS: Record<string, string> = {
  pending: "#eab308",
  processing: "#3b82f6",
  shipped: "#a855f7",
  delivered: "#22c55e",
  cancelled: "#ef4444",
};

export default function Analytics() {
  const { data: dashboard, isLoading } = trpc.admin.dashboard.useQuery();
  const { data: analytics } = trpc.admin.analytics.useQuery();
  const { data: orderStats } = trpc.order.stats.useQuery();

  const stats = useMemo(() => {
    if (!dashboard) return null;
    return {
      totalRevenue: dashboard.stats.revenue,
      totalOrders: dashboard.stats.orders,
      totalProducts: dashboard.stats.products,
      totalUsers: dashboard.stats.users,
      totalReviews: dashboard.stats.reviews,
      avgOrderValue:
        dashboard.stats.orders > 0
          ? dashboard.stats.revenue / dashboard.stats.orders
          : 0,
    };
  }, [dashboard]);

  if (isLoading) {
    return (
      <div className="p-8 space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-xl bg-muted"
            />
          ))}
        </div>
        <div className="h-80 animate-pulse rounded-xl bg-muted" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground text-sm">
          Performance overview and insights
        </p>
      </div>

      {/* ═══ KEY METRICS ═══ */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Total Revenue",
            value: `$${stats?.totalRevenue.toFixed(2)}`,
            sub: "Lifetime delivered revenue",
            icon: DollarSign,
            color: "text-emerald-500",
          },
          {
            label: "Total Orders",
            value: stats?.totalOrders,
            sub: `${orderStats?.pendingOrders || 0} pending`,
            icon: ShoppingCart,
            color: "text-blue-500",
          },
          {
            label: "Avg Order Value",
            value: `$${stats?.avgOrderValue.toFixed(2)}`,
            sub: "Per order average",
            icon: TrendingUp,
            color: "text-purple-500",
          },
          {
            label: "Customers",
            value: stats?.totalUsers,
            sub: `${stats?.totalReviews || 0} reviews`,
            icon: Users,
            color: "text-gold-500",
          },
        ].map(({ label, value, sub, icon: Icon, color }) => (
          <Card key={label} className="shadow-sm hover:shadow-luxury transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {label}
              </CardTitle>
              <Icon className={`h-4 w-4 ${color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{value}</div>
              <p className="text-xs text-muted-foreground mt-1">{sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ═══ REVENUE CHART ═══ */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-gold-500" />
            Revenue (Last 30 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {analytics?.dailyRevenue && analytics.dailyRevenue.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={analytics.dailyRevenue}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(38 46% 52%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(38 46% 52%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) => {
                    const d = new Date(v);
                    return `${d.getMonth() + 1}/${d.getDate()}`;
                  }}
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) => `$${v}`}
                  stroke="hsl(var(--muted-foreground))"
                />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.75rem",
                    fontSize: 12,
                  }}
                  formatter={(value: number) => [`$${value.toFixed(2)}`, "Revenue"]}
                  labelFormatter={(label) => {
                    const d = new Date(label);
                    return d.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(38 46% 52%)"
                  strokeWidth={2}
                  fill="url(#revenueGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-64 items-center justify-center text-muted-foreground">
              No revenue data for the last 30 days
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* ═══ TOP PRODUCTS ═══ */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-gold-500" />
              Top Selling Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics?.topProducts && analytics.topProducts.length > 0 ? (
              <div className="space-y-4">
                {analytics.topProducts.map((product, i) => (
                  <div key={product.name} className="flex items-center gap-4">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-bold">
                      {i + 1}
                    </span>
                    {product.image ? (
                      <img
                        src={product.image}
                        alt=""
                        className="h-10 w-10 rounded-lg object-cover border"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-lg bg-muted" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {product.sold} sold
                      </p>
                    </div>
                    <span className="text-sm font-bold">
                      ${product.revenue.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-48 items-center justify-center text-muted-foreground text-sm">
                No sales data yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* ═══ ORDER STATUS CHART ═══ */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-gold-500" />
              Order Status Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics?.statusBreakdown && analytics.statusBreakdown.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={analytics.statusBreakdown} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis
                      dataKey="status"
                      type="category"
                      tick={{ fontSize: 11 }}
                      tickFormatter={(v) => v.charAt(0).toUpperCase() + v.slice(1)}
                      stroke="hsl(var(--muted-foreground))"
                      width={80}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "0.75rem",
                        fontSize: 12,
                      }}
                    />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                      {analytics.statusBreakdown.map((entry) => (
                        <Cell
                          key={entry.status}
                          fill={STATUS_COLORS[entry.status] || "#888"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>

                {/* Legend */}
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {analytics.statusBreakdown.map(({ status, count }) => (
                    <div
                      key={status}
                      className="flex items-center gap-2 text-sm"
                    >
                      <div
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ background: STATUS_COLORS[status] }}
                      />
                      <span className="capitalize text-muted-foreground">
                        {status}
                      </span>
                      <span className="font-bold ml-auto">{count}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex h-48 items-center justify-center text-muted-foreground text-sm">
                No order data yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
