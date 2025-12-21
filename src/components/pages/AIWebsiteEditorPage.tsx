import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { 
  ArrowLeft, Send, Loader2, AlertCircle, CheckCircle, X, Sparkles, 
  Copy, RefreshCw, Eye, Code, Lightbulb, Zap
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
  category: 'content' | 'design' | 'functionality' | 'performance';
  complexity: 'simple' | 'medium' | 'complex';
  estimatedTime: string;
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load suggestions on mount
  useEffect(() => {
    loadSuggestions();
  }, []);

  const loadSuggestions = () => {
    const defaultSuggestions: EditSuggestion[] = [
      {
        id: '1',
        title: 'Update Campaign Title',
        description: 'Change the main campaign title and description',
        category: 'content',
        complexity: 'simple',
        estimatedTime: '2 minutes',
      },
      {
        id: '2',
        title: 'Modify Fundraising Goal',
        description: 'Update the fundraising goal amount',
        category: 'content',
        complexity: 'simple',
        estimatedTime: '1 minute',
      },
      {
        id: '3',
        title: 'Change Color Scheme',
        description: 'Update the website\'s primary colors',
        category: 'design',
        complexity: 'medium',
        estimatedTime: '5 minutes',
      },
      {
        id: '4',
        title: 'Add New Section',
        description: 'Create a new content section on the homepage',
        category: 'functionality',
        complexity: 'medium',
        estimatedTime: '10 minutes',
      },
      {
        id: '5',
        title: 'Optimize Performance',
        description: 'Improve website loading speed and performance',
        category: 'performance',
        complexity: 'complex',
        estimatedTime: '15 minutes',
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white border-b border-blue-800 shadow-lg sticky top-0 z-50">
        <div className="max-w-[120rem] mx-auto px-8 py-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="font-heading text-4xl font-bold flex items-center gap-3">
                <Sparkles className="w-8 h-8" />
                AI Website Editor
              </h1>
              <p className="font-paragraph text-base text-blue-100 mt-2">
                Describe changes and let AI implement them instantly
              </p>
            </div>
            <Link to="/admin">
              <Button 
                className="bg-white text-blue-600 hover:bg-blue-50 rounded-full px-6 py-2 font-semibold shadow-lg"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Admin
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-[120rem] mx-auto px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Chat Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Messages Container */}
            <Card className="border-0 bg-white shadow-lg h-[600px] flex flex-col">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 pb-3 border-b border-blue-200">
                <CardTitle className="font-heading text-xl font-bold text-blue-900">
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
                            ? 'bg-blue-600 text-white rounded-br-none'
                            : message.type === 'system'
                            ? 'bg-gray-100 text-gray-800 rounded-bl-none'
                            : 'bg-green-50 text-gray-800 border border-green-200 rounded-bl-none'
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
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          )}
                          {message.status === 'error' && (
                            <AlertCircle className="w-4 h-4 text-red-600" />
                          )}
                          {message.status === 'pending' && (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          )}
                        </div>
                      </div>
                      {message.type !== 'user' && (
                        <button
                          onClick={() => handleCopyMessage(message.content)}
                          className="ml-2 p-2 hover:bg-gray-200 rounded-lg transition-colors"
                          title="Copy message"
                        >
                          <Copy className="w-4 h-4 text-gray-600" />
                        </button>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </CardContent>

              {/* Input Area */}
              <div className="border-t border-blue-200 p-6 space-y-4">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3"
                  >
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="font-paragraph text-sm text-red-700">{error}</p>
                  </motion.div>
                )}

                {successMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3"
                  >
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <p className="font-paragraph text-sm text-green-700">{successMessage}</p>
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
                    className="border-blue-200 focus:border-blue-600 resize-none"
                    rows={3}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={loading || !input.trim()}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 rounded-lg shadow-lg h-full"
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
                className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg"
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
                className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Clear Chat
              </Button>
            </div>
          </div>

          {/* Sidebar - Suggestions & Info */}
          <div className="space-y-6">
            {/* Quick Suggestions */}
            <Card className="border-0 bg-white shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 pb-3 border-b border-blue-200">
                <CardTitle className="font-heading text-lg font-bold text-blue-900 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-500" />
                  Quick Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-3">
                {suggestions.map((suggestion) => (
                  <motion.button
                    key={suggestion.id}
                    onClick={() => handleSuggestionClick(suggestion)}
                    whileHover={{ scale: 1.02 }}
                    className="w-full text-left p-3 rounded-lg border border-blue-200 hover:border-blue-400 hover:bg-blue-50 transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="font-paragraph font-semibold text-blue-900 text-sm">
                          {suggestion.title}
                        </p>
                        <p className="font-paragraph text-xs text-blue-600 mt-1">
                          {suggestion.description}
                        </p>
                      </div>
                      <Zap className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-xs px-2 py-1 rounded ${getCategoryColor(suggestion.category)}`}>
                        {suggestion.category}
                      </span>
                      <span className={`text-xs font-semibold ${getComplexityColor(suggestion.complexity)}`}>
                        {suggestion.complexity}
                      </span>
                      <span className="text-xs text-gray-500 ml-auto">
                        {suggestion.estimatedTime}
                      </span>
                    </div>
                  </motion.button>
                ))}
              </CardContent>
            </Card>

            {/* Tips & Guidelines */}
            <Card className="border-0 bg-white shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 pb-3 border-b border-blue-200">
                <CardTitle className="font-heading text-lg font-bold text-blue-900">
                  💡 Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-3">
                <div className="space-y-2">
                  <p className="font-paragraph text-sm font-semibold text-blue-900">
                    Be Specific
                  </p>
                  <p className="font-paragraph text-xs text-blue-700">
                    Describe exactly what you want changed. Include details like colors, text, or layout preferences.
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="font-paragraph text-sm font-semibold text-blue-900">
                    One Change at a Time
                  </p>
                  <p className="font-paragraph text-xs text-blue-700">
                    Request one major change per message for better results.
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="font-paragraph text-sm font-semibold text-blue-900">
                    Review Changes
                  </p>
                  <p className="font-paragraph text-xs text-blue-700">
                    Always preview changes before they go live to ensure they meet your expectations.
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="font-paragraph text-sm font-semibold text-blue-900">
                    Keyboard Shortcut
                  </p>
                  <p className="font-paragraph text-xs text-blue-700">
                    Press <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">Ctrl+Enter</kbd> to send messages quickly.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* AI Capabilities */}
            <Card className="border-0 bg-white shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 pb-3 border-b border-blue-200">
                <CardTitle className="font-heading text-lg font-bold text-blue-900">
                  🤖 AI Capabilities
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-2">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="font-paragraph text-xs text-blue-700">Content updates</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="font-paragraph text-xs text-blue-700">Design modifications</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="font-paragraph text-xs text-blue-700">Layout changes</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="font-paragraph text-xs text-blue-700">Feature additions</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="font-paragraph text-xs text-blue-700">Performance optimization</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
