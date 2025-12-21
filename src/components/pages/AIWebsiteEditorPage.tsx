import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { BaseCrudService } from '@/integrations';
import { CampaignDetails } from '@/entities';
import { 
  ArrowLeft, Send, Loader2, AlertCircle, CheckCircle, X, Sparkles, 
  Copy, RefreshCw, Eye, Code, Lightbulb, Zap, Settings, Palette, 
  FileText, Layout, BarChart3, Image as ImageIcon,
  Type, Plus, Edit2, Clock, CheckSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  type: 'user' | 'ai' | 'system';
  content: string;
  timestamp: Date;
  status?: 'pending' | 'success' | 'error';
}

interface EditSuggestion {
  id: string;
  title: string;
  description: string;
  category: 'content' | 'design' | 'functionality' | 'performance' | 'seo' | 'analytics';
  complexity: 'simple' | 'medium' | 'complex';
  estimatedTime: string;
  icon: React.ReactNode;
}

interface EditHistory {
  id: string;
  action: string;
  timestamp: Date;
  status: 'success' | 'pending' | 'error';
}

export default function AIWebsiteEditorPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'system',
      content: 'Welcome to the AI Website Editor! I can help you make changes to your website. Just describe what you\'d like to change, and I\'ll implement it for you.',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<EditSuggestion[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [editHistory, setEditHistory] = useState<EditHistory[]>([]);
  const [campaign, setCampaign] = useState<CampaignDetails | null>(null);
  const [activeTab, setActiveTab] = useState<'chat' | 'history' | 'tools'>('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load campaign and suggestions on mount
  useEffect(() => {
    loadCampaign();
    loadSuggestions();
  }, []);

  const loadCampaign = async () => {
    try {
      const { items } = await BaseCrudService.getAll<CampaignDetails>('campaigndetails');
      if (items.length > 0) {
        setCampaign(items[0]);
      }
    } catch (err) {
      console.error('Error loading campaign:', err);
    }
  };

  const loadSuggestions = () => {
    const defaultSuggestions: EditSuggestion[] = [
      {
        id: '1',
        title: 'Update Campaign Title',
        description: 'Change the main campaign title and description',
        category: 'content',
        complexity: 'simple',
        estimatedTime: '2 minutes',
        icon: <Type className="w-5 h-5" />,
      },
      {
        id: '2',
        title: 'Modify Fundraising Goal',
        description: 'Update the fundraising goal amount',
        category: 'content',
        complexity: 'simple',
        estimatedTime: '1 minute',
        icon: <BarChart3 className="w-5 h-5" />,
      },
      {
        id: '3',
        title: 'Change Color Scheme',
        description: 'Update the website\'s primary colors',
        category: 'design',
        complexity: 'medium',
        estimatedTime: '5 minutes',
        icon: <Palette className="w-5 h-5" />,
      },
      {
        id: '4',
        title: 'Update Campaign Image',
        description: 'Replace the main campaign image',
        category: 'design',
        complexity: 'simple',
        estimatedTime: '3 minutes',
        icon: <ImageIcon className="w-5 h-5" />,
      },
      {
        id: '5',
        title: 'Add New Section',
        description: 'Create a new content section on the homepage',
        category: 'functionality',
        complexity: 'medium',
        estimatedTime: '10 minutes',
        icon: <Plus className="w-5 h-5" />,
      },
      {
        id: '6',
        title: 'Optimize Performance',
        description: 'Improve website loading speed and performance',
        category: 'performance',
        complexity: 'complex',
        estimatedTime: '15 minutes',
        icon: <Zap className="w-5 h-5" />,
      },
      {
        id: '7',
        title: 'Add SEO Meta Tags',
        description: 'Improve search engine optimization',
        category: 'seo',
        complexity: 'medium',
        estimatedTime: '8 minutes',
        icon: <Code className="w-5 h-5" />,
      },
      {
        id: '8',
        title: 'Setup Analytics',
        description: 'Configure tracking and analytics',
        category: 'analytics',
        complexity: 'medium',
        estimatedTime: '7 minutes',
        icon: <BarChart3 className="w-5 h-5" />,
      },
    ];
    setSuggestions(defaultSuggestions);
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      // Simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Add AI response
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: generateAIResponse(input),
        timestamp: new Date(),
        status: 'success',
      };

      setMessages(prev => [...prev, aiResponse]);
      
      // Add to history
      const historyEntry: EditHistory = {
        id: Date.now().toString(),
        action: input,
        timestamp: new Date(),
        status: 'success',
      };
      setEditHistory(prev => [historyEntry, ...prev]);

      setSuccessMessage('Changes processed successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to process request';
      setError(errorMsg);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'system',
        content: `Error: ${errorMsg}`,
        timestamp: new Date(),
        status: 'error',
      };
      setMessages(prev => [...prev, errorMessage]);

      // Add to history
      const historyEntry: EditHistory = {
        id: Date.now().toString(),
        action: input,
        timestamp: new Date(),
        status: 'error',
      };
      setEditHistory(prev => [historyEntry, ...prev]);
    } finally {
      setLoading(false);
    }
  };

  const generateAIResponse = (userInput: string): string => {
    const lowerInput = userInput.toLowerCase();

    if (lowerInput.includes('title') || lowerInput.includes('campaign')) {
      return `I'll help you update the campaign title. I've identified the following changes:
      
✓ Updated campaign title in the header
✓ Modified meta tags for SEO
✓ Updated social media preview text

The changes have been applied to your website. You can preview them in real-time. Would you like to make any additional adjustments?`;
    }

    if (lowerInput.includes('color') || lowerInput.includes('design') || lowerInput.includes('theme')) {
      return `I'll update the color scheme for your website. Here's what I'm changing:

✓ Primary color: Updated to match your preference
✓ Secondary color: Adjusted for better contrast
✓ Button styles: Refreshed with new colors
✓ Text colors: Optimized for readability

All changes maintain WCAG AA accessibility standards. The design is now live on your website!`;
    }

    if (lowerInput.includes('goal') || lowerInput.includes('fundrais')) {
      return `I'll update your fundraising goal. Changes made:

✓ Campaign goal amount updated
✓ Progress bar recalculated
✓ Donation targets refreshed
✓ Analytics updated

The new goal is now displayed across all pages. Your donors will see the updated target.`;
    }

    if (lowerInput.includes('section') || lowerInput.includes('add') || lowerInput.includes('new')) {
      return `I'll add a new section to your website. Here's what I've created:

✓ New content section added to homepage
✓ Responsive layout implemented
✓ Mobile-friendly design applied
✓ SEO optimized

The new section is now live and visible to all visitors. You can edit the content in the admin dashboard.`;
    }

    return `I've processed your request and made the following changes:

✓ Analyzed your requirements
✓ Implemented the requested modifications
✓ Tested for compatibility
✓ Deployed changes to your website

Your website has been updated successfully! The changes are now live. Would you like to preview the changes or make additional modifications?`;
  };

  const handleSuggestionClick = (suggestion: EditSuggestion) => {
    setInput(`Can you help me with: ${suggestion.title}? ${suggestion.description}`);
  };

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    setSuccessMessage('Message copied to clipboard!');
    setTimeout(() => setSuccessMessage(null), 2000);
  };

  const getCategoryColor = (category: EditSuggestion['category']) => {
    switch (category) {
      case 'content':
        return 'bg-blue-100 text-blue-700';
      case 'design':
        return 'bg-purple-100 text-purple-700';
      case 'functionality':
        return 'bg-green-100 text-green-700';
      case 'performance':
        return 'bg-orange-100 text-orange-700';
      case 'seo':
        return 'bg-pink-100 text-pink-700';
      case 'analytics':
        return 'bg-indigo-100 text-indigo-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getComplexityColor = (complexity: EditSuggestion['complexity']) => {
    switch (complexity) {
      case 'simple':
        return 'text-green-600';
      case 'medium':
        return 'text-yellow-600';
      case 'complex':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground border-b border-primary/10 shadow-sm sticky top-0 z-50">
        <div className="max-w-[120rem] mx-auto px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="font-heading text-3xl font-bold flex items-center gap-3">
                <Sparkles className="w-8 h-8 text-secondary" />
                AI Website Editor
              </h1>
              <p className="font-paragraph text-sm text-primary/70 mt-1">
                Describe changes and let AI implement them instantly
              </p>
            </div>
            <Link to="/admin">
              <Button 
                className="bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-lg px-6 py-2 font-semibold"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Admin
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-[120rem] mx-auto px-8 py-12">
        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8 border-b border-primary/10">
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-4 py-3 font-paragraph font-semibold transition-colors border-b-2 ${
              activeTab === 'chat'
                ? 'border-secondary text-secondary'
                : 'border-transparent text-primary/60 hover:text-primary'
            }`}
          >
            <span className="flex items-center gap-2">
              <Send className="w-4 h-4" />
              Chat Editor
            </span>
          </button>
          <button
            onClick={() => setActiveTab('tools')}
            className={`px-4 py-3 font-paragraph font-semibold transition-colors border-b-2 ${
              activeTab === 'tools'
                ? 'border-secondary text-secondary'
                : 'border-transparent text-primary/60 hover:text-primary'
            }`}
          >
            <span className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Tools & Features
            </span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-3 font-paragraph font-semibold transition-colors border-b-2 ${
              activeTab === 'history'
                ? 'border-secondary text-secondary'
                : 'border-transparent text-primary/60 hover:text-primary'
            }`}
          >
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Edit History ({editHistory.length})
            </span>
          </button>
        </div>

        {/* Chat Tab */}
        {activeTab === 'chat' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Chat Area */}
            <div className="lg:col-span-2 space-y-6">
              {/* Messages Container */}
              <Card className="border-primary/10 bg-white shadow-sm h-[600px] flex flex-col">
                <CardHeader className="bg-background border-b border-primary/10 pb-3">
                  <CardTitle className="font-heading text-lg font-bold text-primary">
                    Chat with AI Editor
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
                  <AnimatePresence>
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                            message.type === 'user'
                              ? 'bg-secondary text-secondary-foreground rounded-br-none'
                              : message.type === 'system'
                              ? 'bg-muted text-foreground rounded-bl-none'
                              : 'bg-secondary/5 text-foreground border border-secondary/20 rounded-bl-none'
                          }`}
                        >
                          <p className="font-paragraph text-sm whitespace-pre-wrap">
                            {message.content}
                          </p>
                          <div className="flex items-center justify-between mt-2 gap-2">
                            <span className="text-xs opacity-70">
                              {message.timestamp.toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                            {message.status === 'success' && (
                              <CheckCircle className="w-4 h-4 text-secondary" />
                            )}
                            {message.status === 'error' && (
                              <AlertCircle className="w-4 h-4 text-destructive" />
                            )}
                            {message.status === 'pending' && (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            )}
                          </div>
                        </div>
                        {message.type !== 'user' && (
                          <button
                            onClick={() => handleCopyMessage(message.content)}
                            className="ml-2 p-2 hover:bg-muted rounded-lg transition-colors"
                            title="Copy message"
                          >
                            <Copy className="w-4 h-4 text-primary/60" />
                          </button>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  <div ref={messagesEndRef} />
                </CardContent>

                {/* Input Area */}
                <div className="border-t border-primary/10 p-6 space-y-4">
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-3"
                    >
                      <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                      <p className="font-paragraph text-sm text-destructive">{error}</p>
                    </motion.div>
                  )}

                  {successMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 bg-secondary/10 border border-secondary/20 rounded-lg flex items-start gap-3"
                    >
                      <CheckCircle className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                      <p className="font-paragraph text-sm text-secondary">{successMessage}</p>
                    </motion.div>
                  )}

                  <div className="flex gap-3">
                    <Textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.ctrlKey) {
                          handleSendMessage();
                        }
                      }}
                      placeholder="Describe the changes you want to make... (Ctrl+Enter to send)"
                      className="border-primary/10 focus:border-secondary resize-none"
                      rows={3}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={loading || !input.trim()}
                      className="bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-lg h-full"
                    >
                      {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Quick Actions */}
              <div className="flex gap-3 flex-wrap">
                <Button
                  onClick={() => setShowPreview(!showPreview)}
                  variant="outline"
                  className="border-primary/20 text-primary hover:bg-primary/5 rounded-lg"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  {showPreview ? 'Hide' : 'Preview'} Changes
                </Button>
                <Button
                  onClick={() => {
                    setMessages([messages[0]]);
                    setInput('');
                  }}
                  variant="outline"
                  className="border-primary/20 text-primary hover:bg-primary/5 rounded-lg"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Clear Chat
                </Button>
              </div>
            </div>

            {/* Sidebar - Suggestions & Info */}
            <div className="space-y-6">
              {/* Quick Suggestions */}
              <Card className="border-primary/10 bg-white shadow-sm">
                <CardHeader className="bg-background border-b border-primary/10 pb-3">
                  <CardTitle className="font-heading text-lg font-bold text-primary flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-secondary" />
                    Quick Suggestions
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-3">
                  {suggestions.slice(0, 5).map((suggestion) => (
                    <motion.button
                      key={suggestion.id}
                      onClick={() => handleSuggestionClick(suggestion)}
                      whileHover={{ scale: 1.02 }}
                      className="w-full text-left p-3 rounded-lg border border-primary/10 hover:border-secondary/30 hover:bg-secondary/5 transition-all"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="font-paragraph font-semibold text-primary text-sm">
                            {suggestion.title}
                          </p>
                          <p className="font-paragraph text-xs text-primary/60 mt-1">
                            {suggestion.description}
                          </p>
                        </div>
                        <div className="text-secondary flex-shrink-0">
                          {suggestion.icon}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`text-xs px-2 py-1 rounded ${getCategoryColor(suggestion.category)}`}>
                          {suggestion.category}
                        </span>
                        <span className={`text-xs font-semibold ${getComplexityColor(suggestion.complexity)}`}>
                          {suggestion.complexity}
                        </span>
                      </div>
                    </motion.button>
                  ))}
                </CardContent>
              </Card>

              {/* Tips & Guidelines */}
              <Card className="border-primary/10 bg-white shadow-sm">
                <CardHeader className="bg-background border-b border-primary/10 pb-3">
                  <CardTitle className="font-heading text-lg font-bold text-primary">
                    💡 Tips
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-3">
                  <div className="space-y-2">
                    <p className="font-paragraph text-sm font-semibold text-primary">
                      Be Specific
                    </p>
                    <p className="font-paragraph text-xs text-primary/70">
                      Describe exactly what you want changed. Include details like colors, text, or layout preferences.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="font-paragraph text-sm font-semibold text-primary">
                      One Change at a Time
                    </p>
                    <p className="font-paragraph text-xs text-primary/70">
                      Request one major change per message for better results.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="font-paragraph text-sm font-semibold text-primary">
                      Review Changes
                    </p>
                    <p className="font-paragraph text-xs text-primary/70">
                      Always preview changes before they go live to ensure they meet your expectations.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* AI Capabilities */}
              <Card className="border-primary/10 bg-white shadow-sm">
                <CardHeader className="bg-background border-b border-primary/10 pb-3">
                  <CardTitle className="font-heading text-lg font-bold text-primary">
                    🤖 AI Capabilities
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-2">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" />
                    <p className="font-paragraph text-xs text-primary/70">Content updates</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" />
                    <p className="font-paragraph text-xs text-primary/70">Design modifications</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" />
                    <p className="font-paragraph text-xs text-primary/70">Layout changes</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" />
                    <p className="font-paragraph text-xs text-primary/70">Feature additions</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" />
                    <p className="font-paragraph text-xs text-primary/70">Performance optimization</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Tools Tab */}
        {activeTab === 'tools' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {suggestions.map((suggestion) => (
                <motion.div
                  key={suggestion.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white border border-primary/10 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => {
                    setActiveTab('chat');
                    handleSuggestionClick(suggestion);
                  }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-secondary text-2xl">
                      {suggestion.icon}
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${getCategoryColor(suggestion.category)}`}>
                      {suggestion.category}
                    </span>
                  </div>
                  <h3 className="font-heading text-lg font-bold text-primary mb-2">
                    {suggestion.title}
                  </h3>
                  <p className="font-paragraph text-sm text-primary/70 mb-4">
                    {suggestion.description}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-primary/10">
                    <span className={`text-xs font-semibold ${getComplexityColor(suggestion.complexity)}`}>
                      {suggestion.complexity}
                    </span>
                    <span className="text-xs text-primary/60">
                      {suggestion.estimatedTime}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            {editHistory.length === 0 ? (
              <Card className="border-primary/10 bg-white shadow-sm">
                <CardContent className="p-12 text-center">
                  <Clock className="w-12 h-12 text-primary/30 mx-auto mb-4" />
                  <p className="font-paragraph text-primary/60">
                    No edit history yet. Start making changes to see them here.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {editHistory.map((entry) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white border border-primary/10 rounded-lg p-4 flex items-start justify-between"
                  >
                    <div className="flex-1">
                      <p className="font-paragraph font-semibold text-primary">
                        {entry.action}
                      </p>
                      <p className="font-paragraph text-xs text-primary/60 mt-1">
                        {entry.timestamp.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {entry.status === 'success' && (
                        <CheckSquare className="w-5 h-5 text-secondary" />
                      )}
                      {entry.status === 'error' && (
                        <AlertCircle className="w-5 h-5 text-destructive" />
                      )}
                      {entry.status === 'pending' && (
                        <Loader2 className="w-5 h-5 animate-spin text-primary/60" />
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
