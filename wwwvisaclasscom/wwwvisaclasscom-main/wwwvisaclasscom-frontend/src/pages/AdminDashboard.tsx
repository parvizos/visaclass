import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import { 
  Users, 
  Mail, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Search,
  Filter,
  Download,
  Eye,
  Reply,
  Calendar,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

interface Application {
  id: string;
  applicationId: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    nationality: string;
  };
  programSelection: {
    universityName: string;
    program: string;
    degreeType: string;
    intake: string;
  };
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'waitlisted';
  submittedAt: string;
  statusUpdatedAt?: string;
  adminNotes?: string;
  rejectionReason?: string;
}

interface Contact {
  id: string;
  contactId: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  phone?: string;
  country?: string;
  status: 'pending' | 'in_progress' | 'resolved' | 'closed';
  submittedAt: string;
  statusUpdatedAt?: string;
  adminNotes?: string;
}

const AdminDashboard: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [stats, setStats] = useState({
    totalApplications: 0,
    pendingApplications: 0,
    approvedApplications: 0,
    rejectedApplications: 0,
    totalContacts: 0,
    pendingContacts: 0,
    resolvedContacts: 0,
  });

  // Fetch data from backend
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch applications
      const appsResponse = await fetch('http://localhost:5001/api/applications');
      const appsData = await appsResponse.json();
      
      // Fetch contacts
      const contactsResponse = await fetch('http://localhost:5001/api/contacts');
      const contactsData = await contactsResponse.json();
      
      // Fetch dashboard stats
      const statsResponse = await fetch('http://localhost:5001/api/admin/dashboard');
      const statsData = await statsResponse.json();
      
      if (appsData.success) {
        setApplications(appsData.data);
      }
      
      if (contactsData.success) {
        setContacts(contactsData.data);
      }
      
      if (statsData.success) {
        setStats({
          totalApplications: statsData.data.applicationStats.total,
          pendingApplications: statsData.data.applicationStats.pending,
          approvedApplications: statsData.data.applicationStats.approved,
          rejectedApplications: statsData.data.applicationStats.rejected,
          totalContacts: statsData.data.contactStats.total,
          pendingContacts: statsData.data.contactStats.pending,
          resolvedContacts: statsData.data.contactStats.resolved,
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch data from server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Update application status
  const updateApplicationStatus = async (applicationId: string, status: string, adminNotes?: string, rejectionReason?: string) => {
    try {
      const response = await fetch(`http://localhost:5001/api/applications/${applicationId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, adminNotes, rejectionReason }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success('Application status updated successfully');
        fetchData();
        setSelectedApplication(null);
      } else {
        toast.error(result.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating application status:', error);
      toast.error('Failed to update application status');
    }
  };

  // Update contact status
  const updateContactStatus = async (contactId: string, status: string, adminNotes?: string) => {
    try {
      const response = await fetch(`http://localhost:5001/api/contacts/${contactId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, adminNotes }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success('Contact status updated successfully');
        fetchData();
        setSelectedContact(null);
      } else {
        toast.error(result.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating contact status:', error);
      toast.error('Failed to update contact status');
    }
  };

  // Reply to contact
  const replyToContact = async (contactId: string, subject: string, message: string) => {
    try {
      const response = await fetch(`http://localhost:5001/api/contacts/${contactId}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subject, message }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success('Reply sent successfully');
        fetchData();
        setSelectedContact(null);
      } else {
        toast.error(result.message || 'Failed to send reply');
      }
    } catch (error) {
      console.error('Error sending reply:', error);
      toast.error('Failed to send reply');
    }
  };

  // Filter applications
  const filteredApplications = applications.filter(app => {
    const matchesSearch = `${app.personalInfo.firstName} ${app.personalInfo.lastName} ${app.personalInfo.email} ${app.applicationId}`
      .toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filter contacts
  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = `${contact.name} ${contact.email} ${contact.subject} ${contact.contactId}`
      .toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || contact.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'under_review': return <Badge variant="default"><Eye className="w-3 h-3 mr-1" />Under Review</Badge>;
      case 'approved': return <Badge variant="default" className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected': return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      case 'waitlisted': return <Badge variant="outline"><AlertCircle className="w-3 h-3 mr-1" />Waitlisted</Badge>;
      case 'in_progress': return <Badge variant="default"><Clock className="w-3 h-3 mr-1" />In Progress</Badge>;
      case 'resolved': return <Badge variant="default" className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Resolved</Badge>;
      case 'closed': return <Badge variant="secondary"><XCircle className="w-3 h-3 mr-1" />Closed</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-600">Manage applications and contacts</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button onClick={fetchData} variant="outline" size="sm">
                Refresh Data
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Applications</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalApplications}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Applications</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pendingApplications}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Approved Applications</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.approvedApplications}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Mail className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Contacts</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalContacts}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="applications" className="space-y-6">
          <TabsList>
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="contacts">Contacts</TabsTrigger>
          </TabsList>

          {/* Applications Tab */}
          <TabsContent value="applications">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>University Applications</CardTitle>
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search applications..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="under_review">Under Review</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                        <SelectItem value="waitlisted">Waitlisted</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Application ID</th>
                        <th className="text-left py-3 px-4">Name</th>
                        <th className="text-left py-3 px-4">Email</th>
                        <th className="text-left py-3 px-4">University</th>
                        <th className="text-left py-3 px-4">Program</th>
                        <th className="text-left py-3 px-4">Status</th>
                        <th className="text-left py-3 px-4">Submitted</th>
                        <th className="text-left py-3 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredApplications.map((application) => (
                        <tr key={application.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 font-mono text-sm">{application.applicationId}</td>
                          <td className="py-3 px-4">
                            {application.personalInfo.firstName} {application.personalInfo.lastName}
                          </td>
                          <td className="py-3 px-4 text-sm">{application.personalInfo.email}</td>
                          <td className="py-3 px-4">{application.programSelection.universityName}</td>
                          <td className="py-3 px-4">{application.programSelection.program}</td>
                          <td className="py-3 px-4">{getStatusBadge(application.status)}</td>
                          <td className="py-3 px-4 text-sm">
                            {new Date(application.submittedAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedApplication(application)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredApplications.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No applications found
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contacts Tab */}
          <TabsContent value="contacts">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Contact Submissions</CardTitle>
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search contacts..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Contact ID</th>
                        <th className="text-left py-3 px-4">Name</th>
                        <th className="text-left py-3 px-4">Email</th>
                        <th className="text-left py-3 px-4">Subject</th>
                        <th className="text-left py-3 px-4">Status</th>
                        <th className="text-left py-3 px-4">Submitted</th>
                        <th className="text-left py-3 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredContacts.map((contact) => (
                        <tr key={contact.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 font-mono text-sm">{contact.contactId}</td>
                          <td className="py-3 px-4">{contact.name}</td>
                          <td className="py-3 px-4 text-sm">{contact.email}</td>
                          <td className="py-3 px-4 max-w-xs truncate">{contact.subject}</td>
                          <td className="py-3 px-4">{getStatusBadge(contact.status)}</td>
                          <td className="py-3 px-4 text-sm">
                            {new Date(contact.submittedAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedContact(contact)}
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                View
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const subject = `Re: ${contact.subject}`;
                                  const message = `Dear ${contact.name},\n\nThank you for contacting us. We have received your message and will get back to you soon.\n\nBest regards,\nVISACLASS Team`;
                                  replyToContact(contact.id, subject, message);
                                }}
                              >
                                <Reply className="w-4 h-4 mr-1" />
                                Reply
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredContacts.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No contacts found
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Application Detail Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Application Details</h2>
                <Button
                  variant="outline"
                  onClick={() => setSelectedApplication(null)}
                >
                  Close
                </Button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Application Info */}
              <div>
                <h3 className="font-semibold mb-2">Application Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><strong>Application ID:</strong> {selectedApplication.applicationId}</div>
                  <div><strong>Status:</strong> {getStatusBadge(selectedApplication.status)}</div>
                  <div><strong>Submitted:</strong> {new Date(selectedApplication.submittedAt).toLocaleString()}</div>
                  {selectedApplication.statusUpdatedAt && (
                    <div><strong>Last Updated:</strong> {new Date(selectedApplication.statusUpdatedAt).toLocaleString()}</div>
                  )}
                </div>
              </div>

              {/* Personal Info */}
              <div>
                <h3 className="font-semibold mb-2">Personal Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><strong>Name:</strong> {selectedApplication.personalInfo.firstName} {selectedApplication.personalInfo.lastName}</div>
                  <div><strong>Email:</strong> {selectedApplication.personalInfo.email}</div>
                  <div><strong>Phone:</strong> {selectedApplication.personalInfo.phone}</div>
                  <div><strong>Nationality:</strong> {selectedApplication.personalInfo.nationality}</div>
                </div>
              </div>

              {/* Program Selection */}
              <div>
                <h3 className="font-semibold mb-2">Program Selection</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><strong>University:</strong> {selectedApplication.programSelection.universityName}</div>
                  <div><strong>Program:</strong> {selectedApplication.programSelection.program}</div>
                  <div><strong>Degree Type:</strong> {selectedApplication.programSelection.degreeType}</div>
                  <div><strong>Intake:</strong> {selectedApplication.programSelection.intake}</div>
                </div>
              </div>

              {/* Status Update */}
              <div>
                <h3 className="font-semibold mb-2">Update Status</h3>
                <div className="space-y-4">
                  <Select 
                    value={selectedApplication.status} 
                    onValueChange={(value) => {
                      const updatedApp = { ...selectedApplication, status: value as any };
                      setSelectedApplication(updatedApp);
                    }}
                  >
                    <SelectTrigger className="w-64">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="under_review">Under Review</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="waitlisted">Waitlisted</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {selectedApplication.status === 'rejected' && (
                    <Input
                      placeholder="Rejection reason (optional)"
                      value={selectedApplication.rejectionReason || ''}
                      onChange={(e) => setSelectedApplication({
                        ...selectedApplication,
                        rejectionReason: e.target.value
                      })}
                    />
                  )}
                  
                  <Input
                    placeholder="Admin notes (optional)"
                    value={selectedApplication.adminNotes || ''}
                    onChange={(e) => setSelectedApplication({
                      ...selectedApplication,
                      adminNotes: e.target.value
                    })}
                  />
                  
                  <Button
                    onClick={() => updateApplicationStatus(
                      selectedApplication.id,
                      selectedApplication.status,
                      selectedApplication.adminNotes,
                      selectedApplication.rejectionReason
                    )}
                  >
                    Update Status
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contact Detail Modal */}
      {selectedContact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Contact Details</h2>
                <Button
                  variant="outline"
                  onClick={() => setSelectedContact(null)}
                >
                  Close
                </Button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Contact Info */}
              <div>
                <h3 className="font-semibold mb-2">Contact Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><strong>Contact ID:</strong> {selectedContact.contactId}</div>
                  <div><strong>Status:</strong> {getStatusBadge(selectedContact.status)}</div>
                  <div><strong>Name:</strong> {selectedContact.name}</div>
                  <div><strong>Email:</strong> {selectedContact.email}</div>
                  {selectedContact.phone && <div><strong>Phone:</strong> {selectedContact.phone}</div>}
                  {selectedContact.country && <div><strong>Country:</strong> {selectedContact.country}</div>}
                  <div><strong>Submitted:</strong> {new Date(selectedContact.submittedAt).toLocaleString()}</div>
                </div>
              </div>

              {/* Message */}
              <div>
                <h3 className="font-semibold mb-2">Message</h3>
                <div className="space-y-2">
                  <div><strong>Subject:</strong> {selectedContact.subject}</div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="whitespace-pre-wrap">{selectedContact.message}</p>
                  </div>
                </div>
              </div>

              {/* Status Update */}
              <div>
                <h3 className="font-semibold mb-2">Update Status</h3>
                <div className="space-y-4">
                  <Select 
                    value={selectedContact.status} 
                    onValueChange={(value) => {
                      const updatedContact = { ...selectedContact, status: value as any };
                      setSelectedContact(updatedContact);
                    }}
                  >
                    <SelectTrigger className="w-64">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Input
                    placeholder="Admin notes (optional)"
                    value={selectedContact.adminNotes || ''}
                    onChange={(e) => setSelectedContact({
                      ...selectedContact,
                      adminNotes: e.target.value
                    })}
                  />
                  
                  <Button
                    onClick={() => updateContactStatus(
                      selectedContact.id,
                      selectedContact.status,
                      selectedContact.adminNotes
                    )}
                  >
                    Update Status
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
