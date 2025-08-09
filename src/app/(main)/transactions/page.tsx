'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
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
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import {
  ArrowUpCircle,
  ArrowDownCircle,
  Search,
  Filter,
  Calendar,
  RefreshCw,
  Eye,
  Download,
} from 'lucide-react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { getTransactions } from '../account/api';

interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  description: string;
  reference?: string;
  created_at: string;
  updated_at: string;
  metadata?: {
    bank_name?: string;
    account_number?: string;
    payment_method?: string;
    tx_ref?: string;
  };
}

export default function TransactionsPage() {
  const { token } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'deposit' | 'withdrawal'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed' | 'failed' | 'cancelled'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTransactions, setTotalTransactions] = useState(0);

  // Fetch transactions
  const fetchTransactions = async (page: number = 1) => {
    if (!token) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await getTransactions(token, page, 20, filterType);
      
      // Handle different response formats
      const transactionsData = response?.transactions || response?.data?.transactions || response?.data || [];
      const pagination = response?.pagination || response?.meta || {};
      
      setTransactions(transactionsData);
      setTotalPages(pagination?.totalPages || pagination?.last_page || 1);
      setTotalTransactions(pagination?.total || pagination?.total_count || transactionsData.length);
      setCurrentPage(page);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch transactions',
        variant: 'destructive',
      });
      // Set mock data for development/testing
      setTransactions(getMockTransactions());
      setTotalPages(1);
      setTotalTransactions(5);
    } finally {
      setLoading(false);
    }
  };

  // Mock data for development
  const getMockTransactions = (): Transaction[] => [
    {
      id: '1',
      type: 'deposit',
      amount: 50000,
      status: 'completed',
      description: 'Wallet deposit via Flutterwave',
      reference: 'FLW_TXN_12345',
      created_at: '2024-01-15T10:30:00Z',
      updated_at: '2024-01-15T10:35:00Z',
      metadata: {
        payment_method: 'Card',
        tx_ref: 'Timedrop-1705316200000',
      },
    },
    {
      id: '2',
      type: 'withdrawal',
      amount: 25000,
      status: 'completed',
      description: 'Wallet withdrawal',
      reference: 'WTH_12345',
      created_at: '2024-01-14T14:20:00Z',
      updated_at: '2024-01-14T14:25:00Z',
      metadata: {
        bank_name: 'First Bank',
        account_number: '1234567890',
      },
    },
    {
      id: '3',
      type: 'deposit',
      amount: 100000,
      status: 'pending',
      description: 'Wallet deposit via Flutterwave',
      reference: 'FLW_TXN_67890',
      created_at: '2024-01-13T09:15:00Z',
      updated_at: '2024-01-13T09:15:00Z',
      metadata: {
        payment_method: 'Bank Transfer',
        tx_ref: 'Timedrop-1705143300000',
      },
    },
    {
      id: '4',
      type: 'withdrawal',
      amount: 15000,
      status: 'failed',
      description: 'Wallet withdrawal',
      reference: 'WTH_67890',
      created_at: '2024-01-12T16:45:00Z',
      updated_at: '2024-01-12T16:50:00Z',
      metadata: {
        bank_name: 'GTBank',
        account_number: '0987654321',
      },
    },
    {
      id: '5',
      type: 'deposit',
      amount: 75000,
      status: 'completed',
      description: 'Wallet deposit via Flutterwave',
      reference: 'FLW_TXN_11111',
      created_at: '2024-01-11T11:30:00Z',
      updated_at: '2024-01-11T11:35:00Z',
      metadata: {
        payment_method: 'USSD',
        tx_ref: 'Timedrop-1705052200000',
      },
    },
  ];

  useEffect(() => {
    fetchTransactions(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, filterType]);

  // Filter transactions based on search and status
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || transaction.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Get status badge variant
  const getStatusBadge = (status: string) => {
    const variants = {
      completed: 'default',
      pending: 'secondary',
      failed: 'destructive',
      cancelled: 'outline',
    };
    return variants[status as keyof typeof variants] || 'outline';
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get transaction icon
  const getTransactionIcon = (type: string, status: string) => {
    if (type === 'deposit') {
      return <ArrowDownCircle className={`h-4 w-4 ${status === 'completed' ? 'text-green-600' : 'text-muted-foreground'}`} />;
    }
    return <ArrowUpCircle className={`h-4 w-4 ${status === 'completed' ? 'text-red-600' : 'text-muted-foreground'}`} />;
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto space-y-6">
        <header className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground">
            View your deposit and withdrawal history
          </p>
        </header>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTransactions}</div>
              <p className="text-xs text-muted-foreground">All time transactions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Deposits</CardTitle>
              <ArrowDownCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {filteredTransactions.filter(t => t.type === 'deposit' && t.status === 'completed').length}
              </div>
              <p className="text-xs text-muted-foreground">Completed deposits</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Withdrawals</CardTitle>
              <ArrowUpCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {filteredTransactions.filter(t => t.type === 'withdrawal' && t.status === 'completed').length}
              </div>
              <p className="text-xs text-muted-foreground">Completed withdrawals</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>
              Search and filter your transaction history
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 w-full md:w-[250px]"
                  />
                </div>

                {/* Type Filter */}
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as any)}
                  className="flex h-10 w-full md:w-[150px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="all">All Types</option>
                  <option value="deposit">Deposits</option>
                  <option value="withdrawal">Withdrawals</option>
                </select>

                {/* Status Filter */}
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="flex h-10 w-full md:w-[150px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchTransactions(currentPage)}
                  disabled={loading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transactions Table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Loading transactions...</span>
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No transactions found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || filterType !== 'all' || filterStatus !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Your transactions will appear here once you make a deposit or withdrawal'}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTransactionIcon(transaction.type, transaction.status)}
                          <span className="capitalize font-medium">
                            {transaction.type}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{transaction.description}</div>
                          {transaction.metadata?.bank_name && (
                            <div className="text-sm text-muted-foreground">
                              {transaction.metadata.bank_name} • {transaction.metadata.account_number}
                            </div>
                          )}
                          {transaction.metadata?.payment_method && (
                            <div className="text-sm text-muted-foreground">
                              via {transaction.metadata.payment_method}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`font-medium ${
                          transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'deposit' ? '+' : '-'}₦{transaction.amount.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadge(transaction.status) as any}>
                          {transaction.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <code className="text-sm bg-muted px-2 py-1 rounded">
                          {transaction.reference || 'N/A'}
                        </code>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {formatDate(transaction.created_at)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <Card>
            <CardContent className="flex items-center justify-between p-4">
              <div className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * 20) + 1} to {Math.min(currentPage * 20, totalTransactions)} of {totalTransactions} transactions
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1 || loading}
                  onClick={() => fetchTransactions(currentPage - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages || loading}
                  onClick={() => fetchTransactions(currentPage + 1)}
                >
                  Next
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ProtectedRoute>
  );
}
