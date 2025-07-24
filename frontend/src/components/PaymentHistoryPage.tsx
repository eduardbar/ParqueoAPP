import React, { useState, useEffect } from 'react';
import { CreditCard, Calendar, MapPin, Receipt, Download, Filter } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

interface PaymentHistoryItem {
  id: string;
  totalPrice: number;
  paymentCompletedAt: string;
  startTime: string;
  endTime: string;
  status: string;
  parkingLot: {
    name: string;
    address: string;
  };
}

const PaymentHistoryPage: React.FC = () => {
  const [payments, setPayments] = useState<PaymentHistoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [filter, setFilter] = useState<'all' | 'week' | 'month' | 'year'>('all');
  const { accessToken } = useAuthStore();

  const fetchPaymentHistory = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/payments/history', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setPayments(data);
      } else {
        throw new Error('Failed to fetch payment history');
      }
    } catch (error) {
      console.error('Error fetching payment history:', error);
      toast.error('Failed to load payment history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filterPayments = () => {
    if (filter === 'all') return payments;

    const now = new Date();
    const filterDate = new Date();

    switch (filter) {
      case 'week':
        filterDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        filterDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        filterDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    return payments.filter((payment) =>
      new Date(payment.paymentCompletedAt) >= filterDate
    );
  };

  const totalAmount = filterPayments().reduce((sum: number, payment: PaymentHistoryItem) => sum + payment.totalPrice, 0);

  const downloadReceipt = (payment: PaymentHistoryItem) => {
    // In a real app, this would generate a PDF receipt
    toast.success('Receipt download started');
  };

  const filteredPayments = filterPayments();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white p-6 rounded-lg">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Historial de Pagos</h1>
          <p className="text-gray-600">Consulta y administra tu historial de pagos de estacionamiento</p>
        </div>

        {/* Resumen */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <CreditCard className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Total Gastado</p>
                <p className="text-2xl font-bold text-gray-900">${totalAmount.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <Receipt className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Total Reservas</p>
                <p className="text-2xl font-bold text-gray-900">{filteredPayments.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-purple-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Promedio por Reserva</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${filteredPayments.length > 0 ? (totalAmount / filteredPayments.length).toFixed(2) : '0.00'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              <Filter className="h-5 w-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filtrar por:</span>
              <div className="flex space-x-2">
                {['all', 'week', 'month', 'year'].map((period) => (
                  <button
                    key={period}
                    onClick={() => setFilter(period as any)}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      filter === period
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {period === 'all' ? 'Todo el Tiempo' : `Último ${period.charAt(0).toUpperCase() + period.slice(1)}`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Pagos */}
        <div className="bg-white rounded-lg shadow-sm">
          {filteredPayments.length === 0 ? (
            <div className="p-8 text-center">
              <CreditCard className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron pagos</h3>
              <p className="text-gray-600">
                {filter === 'all' 
                  ? 'Aún no has realizado ningún pago.' 
                  : `No se encontraron pagos para el período seleccionado.`
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredPayments.map((payment) => (
                <div key={payment.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">
                          {payment.parkingLot.name}
                        </h3>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Pagado
                        </span>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600 space-x-4">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {payment.parkingLot.address}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(payment.startTime).toLocaleDateString()} - {new Date(payment.endTime).toLocaleDateString()}
                        </div>
                      </div>
                      
                      <div className="mt-2 text-sm text-gray-500">
                        Pagado el {new Date(payment.paymentCompletedAt).toLocaleString()}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">${payment.totalPrice.toFixed(2)}</p>
                      </div>
                      
                      <button
                        onClick={() => downloadReceipt(payment)}
                        className="flex items-center space-x-1 px-3 py-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                      >
                        <Download className="h-4 w-4" />
                        <span>Recibo</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentHistoryPage;
