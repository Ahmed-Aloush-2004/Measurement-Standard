
import { useEffect, useState } from 'react';
import { axiosClient } from '../api/axiosClient';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Loader } from '../components/layout/Loader';

export function DashboardHomePage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosClient.get('/analytics/dashboard')
      .then((res) => setStats(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6" dir="rtl">لوحة التحليلات والإحصائيات</h1>
        <Loader />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <h1 className="text-2xl font-bold">لوحة التحليلات والإحصائيات</h1>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <p className="text-gray-500 text-sm">إجمالي المستخدمين</p>
          <div className="flex justify-between items-center mt-2">
            <span className="text-3xl font-bold">{stats?.summary?.totalUsers || 0}</span>
            <span className="text-green-600 font-medium text-sm">{stats?.summary?.userGrowthPercentage} ↑</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <p className="text-gray-500 text-sm">أنواع الاختبارات</p>
          <div className="flex justify-between items-center mt-2">
            <span className="text-3xl font-bold">{stats?.summary?.totalExamTypes || 0}</span>
            <span className="text-blue-600 font-medium text-sm">نشط</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <p className="text-gray-500 text-sm">إجمالي الأسئلة في البنك</p>
          <div className="flex justify-between items-center mt-2">
            <span className="text-3xl font-bold">{stats?.summary?.totalQuestions || 0}</span>
            <span className="text-green-600 font-medium text-sm">{stats?.summary?.questionGrowthPercentage} ↑</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <h2 className="font-semibold text-lg mb-4">نمو المستخدمين (آخر 6 أشهر)</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.userGrowth || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="users" stroke="#2563eb" fill="#3b82f6" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Questions per Exam Type Chart */}
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <h2 className="font-semibold text-lg mb-4">توزيع الأسئلة حسب نوع الاختبار</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.questionsPerExamType || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="questionsCount" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}