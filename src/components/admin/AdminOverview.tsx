import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { db } from '../../lib/firebase';
import { collection, getCountFromServer, getDocs, query, orderBy, limit, where } from 'firebase/firestore';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminOverview() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  const [stats, setStats] = useState({
    users: 0,
    orders: 0,
    newOrders: 0,
    revenue: 0,
    products: 0,
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch Counts
        const usersSnap = await getCountFromServer(collection(db, 'users'));
        const productsSnap = await getCountFromServer(collection(db, 'products'));
        
        // Fetch Orders for Revenue & Chart
        // We fetch the latest 100 orders to calculate recent revenue and build the chart
        const ordersRef = collection(db, 'orders');
        const q = query(ordersRef, orderBy('createdAt', 'desc'), limit(100));
        const ordersSnap = await getDocs(q);

        let totalRevenue = 0;
        let totalOrders = 0;
        let newOrders = 0;
        
        // Group by Date for Chart
        const revenueByDate: Record<string, number> = {};

        // To ensure the chart has data even on empty days, initialize the last 7 days
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          revenueByDate[dateStr] = 0;
        }

        ordersSnap.forEach((doc) => {
          const data = doc.data();
          if (data.status === 'pending' || data.status === 'processing') {
            newOrders++;
          }
          
          if (data.status !== 'pending' && data.paymentStatus !== 'failed') {
            totalOrders++;
            if (data.total) {
              totalRevenue += Number(data.total);
            }

            // Add to chart data if within the last 7 days
            if (data.createdAt) {
              const dateObj = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
              const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              if (revenueByDate[dateStr] !== undefined) {
                revenueByDate[dateStr] += Number(data.total || 0);
              }
            }
          }
        });

        // Format chart data for Recharts
        const formattedChartData = Object.keys(revenueByDate).map(date => ({
          name: date,
          revenue: revenueByDate[date]
        }));

        setStats({
          users: usersSnap.data().count,
          products: productsSnap.data().count,
          orders: totalOrders,
          newOrders: newOrders,
          revenue: totalRevenue
        });

        setChartData(formattedChartData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const kpis = [
    { label: t('admin.kpis.users'), value: stats.users },
    { label: isAr ? 'طلبات جديدة' : 'New Orders', value: stats.newOrders, isHighlight: true },
    { label: t('admin.kpis.orders'), value: stats.orders },
    { label: t('admin.kpis.revenue'), value: `${stats.revenue.toLocaleString()} SAR` }
  ];

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {kpis.map((kpi, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`p-6 rounded-2xl shadow-sm border transition-colors group ${
              kpi.isHighlight 
                ? 'bg-brand/10 border-brand/30 hover:bg-brand/20' 
                : 'bg-white border-border-light hover:border-brand/30'
            }`}
          >
            <h3 className={`text-sm font-bold uppercase tracking-widest mb-2 ${kpi.isHighlight ? 'text-brand' : 'text-coffee-muted'}`}>
              {kpi.label}
            </h3>
            <p className="text-3xl font-serif font-bold text-brand">
              {kpi.value}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-border-light">
        <h3 className="text-lg font-bold text-coffee-dark mb-6 font-serif">
          {isAr ? 'المبيعات لآخر 7 أيام' : 'Sales - Last 7 Days'}
        </h3>
        <div className="h-80 w-full" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#9A8467" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#9A8467" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EADDCD" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b8272', fontSize: 12}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b8272', fontSize: 12}} dx={-10} tickFormatter={(val) => `SAR ${val}`} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                labelStyle={{ fontWeight: 'bold', color: '#1a3826', marginBottom: '4px' }}
                itemStyle={{ color: '#9A8467', fontWeight: 'bold' }}
                formatter={(value: number) => [`${value} SAR`, isAr ? 'المبيعات' : 'Revenue']}
              />
              <Area type="monotone" dataKey="revenue" stroke="#9A8467" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
