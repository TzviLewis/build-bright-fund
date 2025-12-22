import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BaseCrudService } from '@/integrations';
import { LiveChatMessages } from '@/entities';
import { Send, MessageCircle, X, Minimize2, Maximize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LiveChatProps {
  campaignId?: string;
  sessionId?: string;
}

export default function LiveChat({ campaignId, sessionId = 'general' }: LiveChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<LiveChatMessages[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [senderName, setSenderName] = useState('');
  const [showNameInput, setShowNameInput] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chatSessionId = campaignId ? `campaign-${campaignId}` : sessionId;

  useEffect(() => {
    if (isOpen) {
      loadMessages();
      // Poll for new messages every 2 seconds
      const interval = setInterval(loadMessages, 2000);
      return () => clearInterval(interval);
    }
  }, [isOpen, chatSessionId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async () => {
    try {
      const { items } = await BaseCrudService.getAll<LiveChatMessages>('livechatmessages');
      const sessionMessages = items?.filter(m => m.chatSessionId === chatSessionId) || [];
      setMessages(sessionMessages.sort((a, b) => 
        new Date(a.timestamp || 0).getTime() - new Date(b.timestamp || 0).getTime()
      ));
    } catch (err) {
      console.error('Error loading messages:', err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageInput.trim() || !senderName.trim()) {
      return;
    }

    try {
      setLoading(true);
      const newMessage: LiveChatMessages = {
        _id: crypto.randomUUID(),
        chatSessionId,
        senderId: senderName,
        messageContent: messageInput,
        timestamp: new Date(),
        isRead: false,
      };

      await BaseCrudService.create('livechatmessages', newMessage);
      setMessageInput('');
      await loadMessages();
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-40 bg-secondary text-secondary-foreground rounded-full p-4 shadow-lg hover:shadow-xl transition-all hover:scale-110"
          >
            <MessageCircle className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-6 right-6 z-50 w-96 bg-white rounded-lg shadow-2xl border border-primary/10 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-secondary text-secondary-foreground p-4 flex items-center justify-between">
              <div>
                <h3 className="font-heading font-bold text-lg">Live Chat</h3>
                <p className="font-paragraph text-sm opacity-90">
                  {campaignId ? 'Campaign Support' : 'General Chat'}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1 hover:bg-secondary/80 rounded transition-colors"
                >
                  {isMinimized ? (
                    <Maximize2 className="w-5 h-5" />
                  ) : (
                    <Minimize2 className="w-5 h-5" />
                  )}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-secondary/80 rounded transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Chat Content */}
            {!isMinimized && (
              <>
                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 h-96 bg-background">
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-center">
                      <div>
                        <MessageCircle className="w-12 h-12 text-primary/20 mx-auto mb-2" />
                        <p className="font-paragraph text-sm text-primary/60">
                          No messages yet. Start the conversation!
                        </p>
                      </div>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <motion.div
                        key={message._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col"
                      >
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className="font-heading font-semibold text-sm text-primary">
                            {message.senderId}
                          </span>
                          <span className="font-paragraph text-xs text-primary/50">
                            {message.timestamp
                              ? new Date(message.timestamp).toLocaleTimeString('en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : ''}
                          </span>
                        </div>
                        <div className="bg-primary/5 rounded-lg p-3 border border-primary/10">
                          <p className="font-paragraph text-sm text-primary">
                            {message.messageContent}
                          </p>
                        </div>
                      </motion.div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="border-t border-primary/10 p-4 space-y-3 bg-white">
                  {showNameInput && !senderName && (
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        placeholder="Your name..."
                        value={senderName}
                        onChange={(e) => setSenderName(e.target.value)}
                        className="flex-1 border-primary/20 focus:border-secondary"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && senderName.trim()) {
                            setShowNameInput(false);
                          }
                        }}
                      />
                      <Button
                        onClick={() => {
                          if (senderName.trim()) {
                            setShowNameInput(false);
                          }
                        }}
                        className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
                      >
                        OK
                      </Button>
                    </div>
                  )}

                  {senderName && (
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                      <Input
                        type="text"
                        placeholder="Type a message..."
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        disabled={loading}
                        className="flex-1 border-primary/20 focus:border-secondary"
                      />
                      <Button
                        type="submit"
                        disabled={loading || !messageInput.trim()}
                        className="bg-secondary text-secondary-foreground hover:bg-secondary/90 disabled:opacity-50"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </form>
                  )}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
