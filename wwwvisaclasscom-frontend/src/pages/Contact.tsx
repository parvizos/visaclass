import { useState, useEffect, useRef } from 'react';
import { Mail, Phone, MapPin, MessageCircle, Send, Search, Check, CheckCheck } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { Badge } from '@/components/ui/badge';
import { z } from 'zod';

const contactSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name is too long'),
  email: z.string().trim().email('Invalid email address').max(255, 'Email is too long'),
  subject: z.string().trim().min(1, 'Subject is required').max(200, 'Subject is too long'),
  message: z.string().trim().min(10, 'Message must be at least 10 characters').max(1000, 'Message is too long'),
});

const Contact = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Conversation tracking states
  const [savedContactId, setSavedContactId] = useState<string | null>(localStorage.getItem('contactId'));
  const [searchContactId, setSearchContactId] = useState('');
  const [activeContact, setActiveContact] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newReply, setNewReply] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load saved contact on mount
  useEffect(() => {
    if (savedContactId) {
      loadConversation(savedContactId);
    }
  }, []);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load conversation by contact ID
  const loadConversation = async (contactId: string) => {
    setIsSearching(true);
    try {
      // Get contact details
      const contactResponse = await fetch(`/api/contacts/${contactId}`);
      const contactData = await contactResponse.json();
      
      if (contactData.success) {
        setActiveContact(contactData.data);
        
        // Get messages
        const messagesResponse = await fetch(`/api/messages/${contactId}`);
        const messagesData = await messagesResponse.json();
        
        if (messagesData.success) {
          setMessages(messagesData.data);
        }
        
        setShowChat(true);
        localStorage.setItem('contactId', contactId);
        setSavedContactId(contactId);
      } else {
        toast({
          title: language === 'en' ? 'Not Found' : 'Не найдено',
          description: language === 'en' ? 'No message found with this ID' : 'Сообщение с таким ID не найдено',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: language === 'en' ? 'Error' : 'Ошибка',
        description: language === 'en' ? 'Failed to load conversation' : 'Не удалось загрузить переписку',
        variant: 'destructive',
      });
    } finally {
      setIsSearching(false);
    }
  };

  // Send reply to conversation
  const sendReply = async () => {
    if (!newReply.trim() || !activeContact) return;

    setIsSendingReply(true);
    try {
      const response = await fetch(`/api/messages/${activeContact.contactId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newReply,
          sender: activeContact.email,
          senderType: 'student',
          senderName: activeContact.name,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setMessages([...messages, data.data]);
        setNewReply('');
        toast({
          title: language === 'en' ? 'Reply Sent' : 'Ответ отправлен',
          description: language === 'en' ? 'Your message has been sent' : 'Ваше сообщение отправлено',
        });
      }
    } catch (error) {
      toast({
        title: language === 'en' ? 'Error' : 'Ошибка',
        description: language === 'en' ? 'Failed to send reply' : 'Не удалось отправить ответ',
        variant: 'destructive',
      });
    } finally {
      setIsSendingReply(false);
    }
  };

  // Handle search by contact ID
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchContactId.trim()) {
      loadConversation(searchContactId.trim());
    }
  };

  // Clear saved conversation
  const clearConversation = () => {
    localStorage.removeItem('contactId');
    setSavedContactId(null);
    setActiveContact(null);
    setMessages([]);
    setShowChat(false);
    setSearchContactId('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    const result = contactSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const apiResult = await response.json();

      if (apiResult.success) {
        // Save contact ID for tracking
        const contactId = apiResult.data.contactId;
        localStorage.setItem('contactId', contactId);
        setSavedContactId(contactId);
        
        toast({
          title: language === 'en' ? 'Message Sent!' : 'Сообщение отправлено!',
          description: language === 'en'
            ? `We will get back to you within 24 hours. Reference ID: ${contactId}`
            : `Мы ответим вам в течение 24 часов. ID: ${contactId}`,
        });
        
        setFormData({ name: '', email: '', subject: '', message: '' });
        
        // Auto-load the conversation
        setTimeout(() => loadConversation(contactId), 500);
      } else {
        toast({
          title: language === 'en' ? 'Error' : 'Ошибка',
          description: apiResult.message || (language === 'en' ? 'Failed to send message' : 'Не удалось отправить сообщение'),
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Contact form error:', error);
      toast({
        title: language === 'en' ? 'Error' : 'Ошибка',
        description: language === 'en' ? 'Failed to send message. Please try again.' : 'Не удалось отправить сообщение. Попробуйте еще раз.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      language === 'en'
        ? 'Hello! I would like to learn more about studying in Turkey.'
        : 'Здравствуйте! Я хотел бы узнать больше об обучении в Турции.'
    );
    window.open(`https://wa.me/+905527019898?text=${message}`, '_blank');
  };

  return (
    <Layout>
      {/* Page Header */}
      <section className="bg-primary py-12">
        <div className="container">
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-primary-foreground">
            {language === 'en' ? 'Contact Us' : 'Связаться с нами'}
          </h1>
          <p className="mt-2 text-primary-foreground/80">
            {language === 'en'
              ? 'Get in touch with our team for personalized assistance'
              : 'Свяжитесь с нашей командой для персональной помощи'}
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="container">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Contact Info */}
            <div className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <Mail className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-primary">Email</h3>
                      <p className="text-sm text-muted-foreground">info@visaclass.org</p>
                      <p className="text-sm text-muted-foreground">hasanmusaev344@gmail.com</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <Phone className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-primary">{language === 'en' ? 'Phone' : 'Телефон'}</h3>
                      <p className="text-sm text-muted-foreground">+90 552 701 98 98</p>
                      <p className="text-sm text-muted-foreground">+992 008 82 4646</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-primary">{language === 'en' ? 'Office' : 'Офис'}</h3>
                      <p className="text-sm text-muted-foreground">
                        Konak, Cumhuriyet Blv 36 A<br />
                        35250 Konak/İzmir, Turkey
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button
                onClick={handleWhatsApp}
                className="w-full bg-green-500 hover:bg-green-600 text-white"
              >
                <MessageCircle className="mr-2 h-5 w-5" />
                {language === 'en' ? 'Chat on WhatsApp' : 'Написать в WhatsApp'}
              </Button>
            </div>

            {/* Contact Form / Chat Area */}
            <div className="lg:col-span-2 space-y-6">
              {/* Track Message Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif text-lg">
                    {language === 'en' ? 'Track Your Message' : 'Отследить сообщение'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSearch} className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="text"
                        placeholder={language === 'en' ? 'Enter your message ID (e.g., CON-123456...)' : 'Введите ID сообщения'}
                        value={searchContactId}
                        onChange={(e) => setSearchContactId(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Button type="submit" disabled={isSearching}>
                      {isSearching ? (
                        language === 'en' ? 'Loading...' : 'Загрузка...'
                      ) : (
                        language === 'en' ? 'Track' : 'Найти'
                      )}
                    </Button>
                  </form>
                  {savedContactId && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg flex items-center justify-between">
                      <span className="text-sm text-blue-700">
                        {language === 'en' ? 'Active conversation:' : 'Активный диалог:'} {savedContactId}
                      </span>
                      <Button variant="ghost" size="sm" onClick={clearConversation}>
                        {language === 'en' ? 'Close' : 'Закрыть'}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Chat Interface */}
              {showChat && activeContact ? (
                <Card className="flex flex-col h-[500px]">
                  <CardHeader className="border-b pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="font-serif text-lg">{activeContact.subject}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          ID: {activeContact.contactId}
                        </p>
                      </div>
                      <Badge variant={activeContact.status === 'pending' ? 'destructive' : activeContact.status === 'resolved' ? 'default' : 'secondary'}>
                        {activeContact.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 overflow-y-auto p-4">
                    <div className="space-y-4">
                      {/* Original message */}
                      <div className="flex justify-start">
                        <div className="max-w-[80%] bg-gray-100 rounded-lg p-3">
                          <p className="text-sm font-medium text-gray-700 mb-1">{activeContact.name}</p>
                          <p className="text-sm text-gray-600">{activeContact.message}</p>
                          <p className="text-xs text-gray-400 mt-2">
                            {new Date(activeContact.submittedAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      
                      {/* Conversation messages */}
                      {messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.senderType === 'student' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[80%] rounded-lg p-3 ${
                            msg.senderType === 'student' 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-accent text-accent-foreground'
                          }`}>
                            <p className="text-sm font-medium mb-1 flex items-center gap-1">
                              {msg.senderName}
                              {msg.senderType === 'student' && (
                                msg.read ? <CheckCheck className="h-3 w-3" /> : <Check className="h-3 w-3" />
                              )}
                            </p>
                            <p className="text-sm">{msg.content}</p>
                            <p className={`text-xs mt-1 ${
                              msg.senderType === 'student' ? 'text-primary-foreground/70' : 'text-accent-foreground/70'
                            }`}>
                              {new Date(msg.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  </CardContent>
                  
                  {/* Reply Input */}
                  <div className="p-4 border-t">
                    <div className="flex gap-2">
                      <Textarea
                        value={newReply}
                        onChange={(e) => setNewReply(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            sendReply();
                          }
                        }}
                        placeholder={language === 'en' ? 'Type your reply...' : 'Введите ваш ответ...'}
                        className="flex-1 min-h-[60px]"
                        disabled={isSendingReply || activeContact.status === 'closed'}
                      />
                      <Button 
                        onClick={sendReply} 
                        disabled={!newReply.trim() || isSendingReply || activeContact.status === 'closed'}
                        className="self-end"
                      >
                        {isSendingReply ? (
                          '...'
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {activeContact.status === 'closed' && (
                      <p className="text-sm text-destructive mt-2">
                        {language === 'en' ? 'This conversation is closed. Start a new message.' : 'Этот диалог закрыт. Начните новое сообщение.'}
                      </p>
                    )}
                  </div>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="font-serif">
                      {language === 'en' ? 'Send us a Message' : 'Отправить сообщение'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Input
                            placeholder={language === 'en' ? 'Your Name' : 'Ваше имя'}
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className={errors.name ? 'border-destructive' : ''}
                          />
                          {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
                        </div>
                        <div>
                          <Input
                            type="email"
                            placeholder={language === 'en' ? 'Email Address' : 'Email адрес'}
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className={errors.email ? 'border-destructive' : ''}
                          />
                          {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
                        </div>
                      </div>
                      <div>
                        <Input
                          placeholder={language === 'en' ? 'Subject' : 'Тема'}
                          value={formData.subject}
                          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                          className={errors.subject ? 'border-destructive' : ''}
                        />
                        {errors.subject && <p className="text-sm text-destructive mt-1">{errors.subject}</p>}
                      </div>
                      <div>
                        <Textarea
                          placeholder={language === 'en' ? 'Your Message' : 'Ваше сообщение'}
                          rows={6}
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          className={errors.message ? 'border-destructive' : ''}
                        />
                        {errors.message && <p className="text-sm text-destructive mt-1">{errors.message}</p>}
                      </div>
                      <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90" disabled={isSubmitting}>
                        {isSubmitting ? (
                          language === 'en' ? 'Sending...' : 'Отправка...'
                        ) : (
                          <>
                            <Send className="mr-2 h-4 w-4" />
                            {language === 'en' ? 'Send Message' : 'Отправить'}
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Map */}
      <section className="h-[400px] bg-secondary">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3125.1234567890123!2d27.110123456789!3d38.420123456789!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14bbd5e123456789%3A0xabcdef1234567890!2sKonak%2C%20Cumhuriyet%20Blv%2036%20A%2C%2035250%20Konak%2F%C4%B0zmir!5e0!3m2!1sen!2str!4v1234567890"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Office Location"
        />
      </section>
    </Layout>
  );
};

export default Contact;


