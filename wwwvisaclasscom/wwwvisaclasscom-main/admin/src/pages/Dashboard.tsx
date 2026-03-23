import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Users, CreditCard, School } from 'lucide-react';
import { dashboardAPI, adminApplicationAPI, adminPaymentAPI } from '@/services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalApplications: 0,
    pendingApplications: 0,
    totalStudents: 0,
    totalPayments: 0,
    totalUniversities: 0,
    totalPrograms: 0,
  });
  const [recentApplications, setRecentApplications] = useState([]);
  const [recentPayments, setRecentPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Load stats
        const statsResponse = await dashboardAPI.getStats();
        if (statsResponse.success) {
          setStats(statsResponse.data);
        }

        // Load recent applications
        const appsResponse = await adminApplicationAPI.getAll({ limit: 5 });
        if (appsResponse.success) {
          setRecentApplications(appsResponse.data || []);
        }

        // Load recent payments
        const paymentsResponse = await adminPaymentAPI.getAll({ limit: 5 });
        if (paymentsResponse.success) {
          setRecentPayments(paymentsResponse.data || []);
        }
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const statCards = [
    { title: 'Total Applications', value: stats.totalApplications, icon: FileText, change: 'All time' },
    { title: 'Pending Review', value: stats.pendingApplications, icon: FileText, change: 'Needs attention' },
    { title: 'Total Students', value: stats.totalStudents, icon: Users, change: 'Registered' },
    { title: 'Total Revenue', value: `$${stats.totalPayments?.toLocaleString() || 0}`, icon: CreditCard, change: 'All time' },
    { title: 'Universities', value: stats.totalUniversities, icon: School, change: 'Active' },
    { title: 'Programs', value: stats.totalPrograms, icon: School, change: 'Available' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'under_review': return 'bg-blue-100 text-blue-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentApplications.length === 0 ? (
                <p className="text-muted-foreground">No applications yet</p>
              ) : (
                recentApplications.map((app: any) => (
                  <div key={app.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{app.student_name || 'Student'}</p>
                      <p className="text-sm text-muted-foreground">
                        {app.program_name || 'Program'} - {app.university_name || 'University'}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded text-sm ${getStatusColor(app.status)}`}>
                      {app.status || 'Pending'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPayments.length === 0 ? (
                <p className="text-muted-foreground">No payments yet</p>
              ) : (
                recentPayments.map((payment: any) => (
                  <div key={payment.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{payment.student_name || 'Student'}</p>
                      <p className="text-sm text-muted-foreground">Application Fee</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-sm ${
                      payment.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {payment.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
