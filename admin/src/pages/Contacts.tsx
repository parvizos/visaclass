import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, MessageCircle, Send, User, Clock, Check, CheckCheck, Mail } from 'lucide-react';
import { toast } from 'sonner';

interface Contact {
  id: string;
  contactId: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'pending' | 'in_progress' | 'resolved' | 'closed';
  submittedAt: string;
  lastReplyAt?: string;
  lastMessageAt?: string;
  unreadCount?: number;
}

interface Message {
  id: string;
  contactId: string;
  content: string;
  sender: string;
  senderType: 'student' | 'admin';
  senderName: string;
  createdAt: string;
  read: boolean;
}

const Contacts = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // Fetch contacts
  const fetchContacts = async () => {
    try {
      const response = await fetch(`${API_BASE}/admin/contacts`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        // Sort by last activity (newest first)
        const sorted = data.data.sort((a: Contact, b: Contact) => {
          const aDate = a.lastMessageAt || a.lastReplyAt || a.submittedAt;
          const bDate = b.lastMessageAt || b.lastReplyAt || b.submittedAt;
          return new Date(bDate).getTime() - new Date(aDate).getTime();
        });
        setContacts(sorted);
      }
    } catch (error) {
      console.error('Failed to fetch contacts:', error);
    }
  };

  // Fetch messages for selected contact
  const fetchMessages = async (contactId: string) => {
    try {
      const response = await fetch(`${API_BASE}/messages/${contactId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setMessages(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedContact) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/messages/${selectedContact.contactId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
        },
        body: JSON.stringify({
          content: newMessage,
          sender: 'admin',
          senderType: 'admin',
          senderName: 'Admin',
        }),
      });

      const data = await response.json();
      if (data.success) {
        setMessages([...messages, data.data]);
        setNewMessage('');
        fetchContacts(); // Refresh contacts list
        toast.success('Message sent');
      } else {
        toast.error(data.message || 'Failed to send message');
      }
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  // Update contact status
  const updateStatus = async (contactId: string, status: string) => {
    try {
      const response = await fetch(`${API_BASE}/contacts/${contactId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        toast.success('Status updated');
        fetchContacts();
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  // Select contact and load messages
  const handleSelectContact = (contact: Contact) => {
    setSelectedContact(contact);
    fetchMessages(contact.contactId);
  };

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initial load
  useEffect(() => {
    fetchContacts();
    const interval = setInterval(fetchContacts, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  // Filter contacts
  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = 
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || contact.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <MessageCircle className="h-6 w-6" />
          Contact Messages
        </h1>
        <div className="flex gap-4">
          <select
            value={statusFilter}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatusFilter(e.target.value)}
            className="border rounded-lg px-3 py-2"
            aria-label="Filter by status"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search contacts..."
              className="pl-10 w-64"
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="flex gap-4 flex-1 overflow-hidden">
        {/* Contacts List */}
        <Card className="w-1/3 flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Conversations ({filteredContacts.length})</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-0">
            <div className="divide-y">
              {filteredContacts.map((contact) => (
                <div
                  key={contact.id}
                  onClick={() => handleSelectContact(contact)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedContact?.id === contact.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="font-medium text-sm">{contact.name}</span>
                    </div>
                    <Badge className={getStatusColor(contact.status)}>
                      {contact.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-1 mb-1">
                    {contact.subject}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDate(contact.lastMessageAt || contact.lastReplyAt || contact.submittedAt)}
                    </span>
                    {contact.status === 'pending' && (
                      <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    )}
                  </div>
                </div>
              ))}
              {filteredContacts.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  No contacts found
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card className="flex-1 flex flex-col">
          {selectedContact ? (
            <>
              <CardHeader className="pb-3 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="h-5 w-5" />
                      {selectedContact.name}
                    </CardTitle>
                    <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                      <Mail className="h-4 w-4" />
                      {selectedContact.email}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={selectedContact.status}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateStatus(selectedContact.id, e.target.value)}
                      className="border rounded-lg px-3 py-1 text-sm"
                      aria-label="Update contact status"
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-700">Original Message:</p>
                  <p className="text-sm text-gray-600 mt-1">{selectedContact.message}</p>
                </div>
              </CardHeader>

              <CardContent className="flex-1 overflow-y-auto p-4">
                <div className="space-y-4">
                  {/* Original contact message */}
                  <div className="flex justify-start">
                    <div className="max-w-[70%] bg-gray-100 rounded-lg p-3">
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        {selectedContact.name}
                      </p>
                      <p className="text-sm text-gray-600">{selectedContact.message}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {formatDate(selectedContact.submittedAt)}
                      </p>
                    </div>
                  </div>

                  {/* Conversation messages */}
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.senderType === 'admin' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          message.senderType === 'admin'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        <p className="text-sm font-medium mb-1">
                          {message.senderName}
                          {message.senderType === 'admin' && (
                            <span className="ml-2">
                              {message.read ? (
                                <CheckCheck className="h-3 w-3 inline" />
                              ) : (
                                <Check className="h-3 w-3 inline" />
                              )}
                            </span>
                          )}
                        </p>
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-2 ${
                          message.senderType === 'admin' ? 'text-blue-100' : 'text-gray-400'
                        }`}>
                          {formatDate(message.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </CardContent>

              {/* Message Input */}
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewMessage(e.target.value)}
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                    placeholder="Type your message..."
                    className="flex-1"
                    disabled={loading}
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || loading}
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>Select a conversation to start chatting</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Contacts;
