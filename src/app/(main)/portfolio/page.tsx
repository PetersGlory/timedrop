
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import type { Order } from '@/lib/definitions';
import { useBookmarks } from '@/hooks/use-bookmarks';
import { Bookmark } from 'lucide-react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { getOrders } from '../account/api';

export default function PortfolioPage() {
  const { bookmarks } = useBookmarks();
  const { token } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Split orders into open and filled
  const openOrders = orders.filter((order) =>
    order.status === 'Open' || order.status === 'pending'
  );
  const filledOrders = orders.filter((order) =>
    order.status === 'Filled' || order.status === 'Closed' || order.status === 'Cancelled'
  );

  useEffect(() => {
    async function fetchOrders() {
      if (!token) {
        setOrders([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const apiOrders = await getOrders(token);
        // If the API returns { orders: [...] }
        setOrders(apiOrders.orders || apiOrders);
      } catch (err: any) {
        setError(err.message || 'Failed to load orders');
        setOrders([]);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, [token]);

  return (
    <ProtectedRoute>
      <div className="container mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight">Portfolio</h1>
          <p className="text-muted-foreground mt-2">
            Track your open orders and view your trading history.
          </p>
        </header>

        <div className="space-y-8">
          <Card>
            <CardContent className="p-0">
              <Tabs defaultValue="open-orders">
                <div className="p-6 border-b">
                  <TabsList>
                    <TabsTrigger value="open-orders">Open Orders</TabsTrigger>
                    <TabsTrigger value="order-history">Order History</TabsTrigger>
                  </TabsList>
                </div>
                <TabsContent value="open-orders" className="p-6 pt-0">
                  <OrderTable
                    orders={openOrders}
                    loading={loading}
                    error={error}
                  />
                </TabsContent>
                <TabsContent value="order-history" className="p-6 pt-0">
                  <OrderTable
                    orders={filledOrders}
                    loading={loading}
                    error={error}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bookmark className="h-6 w-6" />
                <CardTitle>Bookmarked Markets</CardTitle>
              </div>
              <CardDescription>
                Your saved markets for quick access.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {bookmarks.length > 0 ? (
                <ul className="space-y-3">
                  {bookmarks.map((market) => (
                    <li key={market.id}>
                      <Link
                        href={`/markets/${market.id}`}
                        className="group block rounded-lg border p-3 hover:bg-secondary"
                      >
                        <p className="font-semibold group-hover:text-primary">
                          {market.question}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {market.category}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  You haven&apos;t bookmarked any markets yet.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}

function OrderTable({
  orders,
  loading,
  error,
}: {
  orders: Order[];
  loading?: boolean;
  error?: string | null;
}) {
  if (loading) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Loading orders...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-destructive">
        {error}
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No orders to display.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Market</TableHead>
          <TableHead>Type</TableHead>
          <TableHead className="text-right">Amount</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => (
          <TableRow key={order.id}>
            <TableCell className="font-medium">{order.marketName}</TableCell>
            <TableCell>
              <Badge
                variant={order.type === 'BUY' ? 'default' : 'destructive'}
                className={
                  order.type === 'BUY' ? 'bg-blue-500' : 'bg-pink-500'
                }
              >
                {order.type === 'BUY' ? 'Yes' : 'No'}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              {order.quantity.toLocaleString()}
            </TableCell>
            <TableCell>
              <Badge variant="secondary">{order.status}</Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
