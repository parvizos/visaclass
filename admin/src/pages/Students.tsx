import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Mail, FileText } from 'lucide-react';
import { useState } from 'react';

const Students = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const students = [
    { id: 1, name: 'John Doe', email: 'john@example.com', nationality: 'USA', applications: 2, status: 'active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', nationality: 'UK', applications: 1, status: 'active' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', nationality: 'Canada', applications: 3, status: 'inactive' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Students</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search students..."
            className="pl-10 pr-4 py-2 border rounded-lg"
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Students</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Name</th>
                  <th className="text-left py-3 px-4">Email</th>
                  <th className="text-left py-3 px-4">Nationality</th>
                  <th className="text-left py-3 px-4">Applications</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id} className="border-b">
                    <td className="py-3 px-4 font-medium">{student.name}</td>
                    <td className="py-3 px-4">{student.email}</td>
                    <td className="py-3 px-4">{student.nationality}</td>
                    <td className="py-3 px-4">{student.applications}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-sm ${student.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {student.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button className="p-2 hover:bg-gray-100 rounded" aria-label="Send email to student">
                          <Mail className="h-4 w-4" />
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded" aria-label="View student documents">
                          <FileText className="h-4 w-4" />
                        </button>
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

export default Students;
