'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DatePicker } from '@/components/ui/date-picker';
import { Button } from '@/components/ui/button';
import { useInsights } from '@/hooks/use-insights';
import { fadeInUp } from '@/constants/animations';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/utils/format';

export default function InsightsContainer() {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const { data: insights, isLoading } = useInsights(startDate, endDate);

  if (isLoading) {
    return <InsightsSkeleton />;
  }

  return (
    <motion.div {...fadeInUp} className="space-y-6">
      {/* Date Range Filters */}
      <Card className="p-4 shadow-sm">
        <div className="flex items-center gap-4">
          <DatePicker
            name="start-date"
            initialValue={startDate?.toISOString()}
            placeholder="Start date"
          />
          <span className="text-muted-foreground">to</span>
          <DatePicker
            name="end-date"
            initialValue={endDate?.toISOString()}
            placeholder="End date"
          />
          <Button variant="outline" onClick={() => {
            setStartDate(undefined);
            setEndDate(undefined);
          }}>
            Reset
          </Button>
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <SummaryCard
          title="Total Sales"
          value={formatCurrency(insights?.totalSales ?? 0)}
          icon="💰"
        />
        <SummaryCard
          title="Total Orders"
          value={insights?.totalOrders.toString() ?? "0"}
          icon="📦"
        />
        <SummaryCard
          title="Average Order Value"
          value={formatCurrency(insights?.averageOrderValue ?? 0)}
          icon="📈"
        />
        <SummaryCard
          title="Collection Rate"
          value={`${Math.round(insights?.collectionRate ?? 0)}%`}
          icon="💱"
        />
        <SummaryCard
          title="Total Customers"
          value={insights?.totalCustomers.toString() ?? "0"}
          icon="👥"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className='shadow-sm'>
          <CardHeader>
            <CardTitle>Sales Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={insights?.recentSales || []}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2C59DB" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#2C59DB" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="createdAt"
                  tickFormatter={(date) => format(new Date(date), 'MMM dd')}
                />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip
                  formatter={(value) => formatCurrency(Number(value))}
                  labelFormatter={(date) => format(new Date(date), 'MMM dd, yyyy')}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#2C59DB"
                  fillOpacity={1}
                  fill="url(#colorAmount)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className='shadow-sm'>
          <CardHeader>
            <CardTitle>Orders by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={insights?.salesByStatus || []}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#2C59DB"
                  label={(entry) => entry.status}
                >
                  {insights?.salesByStatus.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className='shadow-sm'>
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={insights?.topSellingProducts || []}>
                <XAxis dataKey="title" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="totalSold" fill="#2C59DB" name="Units Sold" />
                <Bar dataKey="revenue" fill="#4CAF50" name="Revenue" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className='shadow-sm'>
          <CardHeader>
            <CardTitle>Top Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] overflow-auto">
              <table className="w-full">
                <thead className="sticky top-0 bg-white">
                  <tr className="border-b">
                    <th className="p-2 text-left">Customer</th>
                    <th className="p-2 text-right">Orders</th>
                    <th className="p-2 text-right">Total Spent</th>
                  </tr>
                </thead>
                <tbody>
                  {insights?.topCustomers.map((customer) => (
                    <tr key={customer.id} className="border-b">
                      <td className="p-2">{customer.name}</td>
                      <td className="p-2 text-right">{customer.ordersCount}</td>
                      <td className="p-2 text-right">
                        {formatCurrency(customer.totalSpent)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 3 */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className='shadow-sm'>
          <CardHeader>
            <CardTitle>Collection Rate Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={insights?.collectionTrends ?? []}>
                <defs>
                  <linearGradient id="colorCollection" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) => format(new Date(date), 'MMM dd')}
                />
                <YAxis
                  tickFormatter={(value) => `${Math.round(value)}%`}
                  domain={[0, 100]}
                />
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip
                  formatter={(value) => `${Math.round(Number(value))}%`}
                  labelFormatter={(date) => format(new Date(date), 'MMM dd, yyyy')}
                />
                <Area
                  type="monotone"
                  dataKey="collectionRate"
                  stroke="#10B981"
                  fillOpacity={1}
                  fill="url(#colorCollection)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className='shadow-sm'>
          <CardHeader>
            <CardTitle>Survey Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] overflow-auto">
              <table className="w-full">
                <thead className="sticky top-0 bg-white">
                  <tr className="border-b">
                    <th className="p-2 text-left">Category</th>
                    <th className="p-2 text-right">Avg. Score</th>
                    <th className="p-2 text-right">Responses</th>
                  </tr>
                </thead>
                <tbody>
                  {insights?.surveyMetrics.map((metric) => (
                    <tr key={metric.categoryName} className="border-b">
                      <td className="p-2">{metric.categoryName}</td>
                      <td className="p-2 text-right">
                        {metric.avgScore.toFixed(1)} / 5
                      </td>
                      <td className="p-2 text-right">{metric.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Status Chart */}
      <Card className='shadow-sm'>
        <CardHeader>
          <CardTitle>Payments by Status</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={insights?.paymentsByStatus || []}>
              <XAxis dataKey="status" />
              <YAxis yAxisId="count" orientation="left" />
              <YAxis
                yAxisId="total"
                orientation="right"
                tickFormatter={(value) => formatCurrency(value)}
              />
              <Tooltip
                formatter={(value, name) =>
                  name === 'Total Amount' ? formatCurrency(Number(value)) : value
                }
              />
              <Legend />
              <Bar
                yAxisId="count"
                dataKey="count"
                fill="#2C59DB"
                name="Number of Payments"
              />
              <Bar
                yAxisId="total"
                dataKey="total"
                fill="#4CAF50"
                name="Total Amount"
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function SummaryCard({ title, value, icon }: Readonly<{ title: string; value: string; icon: string }>) {
  return (
    <Card className='shadow-sm'>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <span className="text-2xl">{icon}</span>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

function InsightsSkeleton() {
  return (
    <div className="space-y-6">
      <Card className="p-4">
        <Skeleton className="h-10 w-[300px]" />
      </Card>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array(4).fill(null).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="size-6" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-[120px]" />
            </CardContent>
          </Card>
        ))}
      </div>
      {Array(3).fill(null).map((_, i) => (
        <div key={i} className="grid gap-4 md:grid-cols-2">
          {Array(2).fill(null).map((_, j) => (
            <Card key={j}>
              <CardHeader>
                <Skeleton className="h-6 w-[200px]" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[300px] w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ))}
    </div>
  );
}