import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Download, Eye, CheckCircle, XCircle } from 'lucide-react';

const Applications = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const applications = [
    { id: 1, student: 'John Doe', university: 'Istanbul University', program: 'Medicine', status: 'pending', date: '2024-03-15' },
    { id: 2, student: 'Jane Smith', university: 'Ankara University', program: 'Engineering', status: 'approved', date: '2024-03-14' },
    { id: 3, student: 'Bob Johnson', university: 'METU', program: 'Computer Science', status: 'rejected', date: '2024-03-13' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Applications</h1>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search applications..."
              className="pl-10 pr-4 py-2 border rounded-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Student</th>
                  <th className="text-left py-3 px-4">University</th>
                  <th className="text-left py-3 px-4">Program</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Date</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app.id} className="border-b">
                    <td className="py-3 px-4">{app.student}</td>
                    <td className="py-3 px-4">{app.university}</td>
                    <td className="py-3 px-4">{app.program}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-sm capitalize ${getStatusColor(app.status)}`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">{app.date}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                        {app.status === 'pending' && (
                          <>
                            <Button variant="ghost" size="sm" className="text-green-600">
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-600">
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Applications;
