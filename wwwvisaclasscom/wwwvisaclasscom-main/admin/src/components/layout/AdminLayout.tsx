import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, Users, CreditCard, School, MessageCircle } from 'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const navigate = useNavigate();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: FileText, label: 'Applications', path: '/applications' },
    { icon: MessageCircle, label: 'Messages', path: '/contacts' },
    { icon: Users, label: 'Students', path: '/students' },
    { icon: CreditCard, label: 'Payments', path: '/payments' },
    { icon: School, label: 'Universities', path: '/universities' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md flex flex-col">
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold text-gray-800">VISACLASS Admin</h1>
        </div>
        
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.path}>
                <button
                  onClick={() => navigate(item.path)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-left"
                >
                  <item.icon className="h-5 w-5 text-gray-600" />
                  <span className="text-gray-700">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
