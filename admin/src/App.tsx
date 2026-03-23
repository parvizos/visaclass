import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import AdminLayout from './components/layout/AdminLayout';
import Dashboard from './pages/Dashboard';
import Applications from './pages/Applications';
import Contacts from './pages/Contacts';
import Students from './pages/Students';
import Payments from './pages/Payments';
import Universities from './pages/Universities';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AdminLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/applications" element={<Applications />} />
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/students" element={<Students />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/universities" element={<Universities />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </AdminLayout>
      </BrowserRouter>
      <Toaster position="top-right" />
    </QueryClientProvider>
  );
}

export default App;
