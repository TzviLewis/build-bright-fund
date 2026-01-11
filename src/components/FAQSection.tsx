import { useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const defaultFAQs: FAQItem[] = [
  {
    id: '1',
    question: 'How do I make a donation?',
    answer: 'You can make a donation by clicking the "Donate Now" button on any campaign page. Select your donation amount, choose a payment method, and complete the checkout process. Your donation will be processed securely.',
    category: 'Donations'
  },
  {
    id: '2',
    question: 'Is my donation tax-deductible?',
    answer: 'Yes, all donations to Build Bright Fund are tax-deductible. We are a registered 501(c)(3) nonprofit organization. You will receive a tax receipt via email after your donation.',
    category: 'Donations'
  },
  {
    id: '3',
    question: 'Can I make a recurring donation?',
    answer: 'Yes, we offer monthly and yearly recurring donations. You can set up a recurring donation during checkout and manage it anytime from your donor profile.',
    category: 'Donations'
  },
  {
    id: '4',
    question: 'What payment methods do you accept?',
    answer: 'We accept credit cards (Visa, Mastercard, American Express), PayPal, Apple Pay, and Google Pay. All payments are processed securely through our payment partner.',
    category: 'Payments'
  },
  {
    id: '5',
    question: 'Can I donate anonymously?',
    answer: 'Yes, you can choose to make an anonymous donation during checkout. Your name will not be displayed on our leaderboard or public lists.',
    category: 'Donations'
  },
  {
    id: '6',
    question: 'How do I create a fundraiser page?',
    answer: 'Visit the "Create Fundraiser" section and fill out the form with your campaign details. You can customize your page, add photos and videos, and share it with your network.',
    category: 'Fundraising'
  },
  {
    id: '7',
    question: 'How are funds used?',
    answer: 'All donations go directly to the specified campaign. We maintain transparency about fund allocation and provide regular updates on how donations are being used.',
    category: 'General'
  },
  {
    id: '8',
    question: 'Can I edit my donation after it\'s made?',
    answer: 'You cannot edit a donation after it\'s processed, but you can contact our support team for assistance with refunds or adjustments.',
    category: 'Donations'
  },
  {
    id: '9',
    question: 'How do I reset my password?',
    answer: 'Click "Forgot Password" on the login page and enter your email address. You\'ll receive a password reset link via email.',
    category: 'Account'
  },
  {
    id: '10',
    question: 'Is my personal information secure?',
    answer: 'Yes, we use industry-standard encryption and security measures to protect your personal and financial information. We never share your data with third parties.',
    category: 'Security'
  },
];

interface FAQSectionProps {
  faqs?: FAQItem[];
}

export default function FAQSection({ faqs = defaultFAQs }: FAQSectionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Get unique categories
  const categories = ['All', ...new Set(faqs.map(faq => faq.category))];

  // Filter FAQs based on search and category
  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = 
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="text-center space-y-4">
          <h2 className="font-heading text-4xl lg:text-5xl font-bold text-primary">
            Frequently Asked Questions
          </h2>
          <p className="font-paragraph text-lg text-primary/70 max-w-2xl mx-auto">
            Find answers to common questions about donations, campaigns, and our platform.
          </p>
        </div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative"
        >
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary/40" />
          <Input
            type="text"
            placeholder="Search FAQs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 py-3 border-primary/20 focus:border-secondary focus:ring-secondary text-base"
          />
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="flex flex-wrap gap-2 justify-center"
        >
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full font-paragraph font-semibold text-sm transition-all duration-300 ${
                selectedCategory === category
                  ? 'bg-secondary text-secondary-foreground shadow-lg'
                  : 'bg-primary/5 text-primary hover:bg-primary/10 border border-primary/10'
              }`}
            >
              {category}
            </button>
          ))}
        </motion.div>

        {/* FAQ Items */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-3"
        >
          <AnimatePresence>
            {filteredFAQs.length > 0 ? (
              filteredFAQs.map((faq, index) => (
                <motion.div
                  key={faq.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="border border-primary/10 rounded-lg overflow-hidden hover:border-secondary/30 transition-all duration-300 bg-white shadow-sm hover:shadow-md"
                >
                  <button
                    onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-primary/2 transition-colors duration-300"
                  >
                    <div className="text-left flex-1">
                      <h3 className="font-heading font-bold text-primary text-lg">
                        {faq.question}
                      </h3>
                      <p className="font-paragraph text-xs text-secondary mt-1 font-semibold">
                        {faq.category}
                      </p>
                    </div>
                    <motion.div
                      animate={{ rotate: expandedId === faq.id ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex-shrink-0 ml-4"
                    >
                      <ChevronDown className="w-5 h-5 text-secondary" />
                    </motion.div>
                  </button>

                  <AnimatePresence>
                    {expandedId === faq.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border-t border-primary/10 bg-primary/2"
                      >
                        <p className="font-paragraph text-primary/80 px-6 py-4 leading-relaxed">
                          {faq.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-12"
              >
                <p className="font-paragraph text-lg text-primary/60">
                  No FAQs found matching your search. Try different keywords.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Contact Support */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-gradient-to-r from-secondary/10 to-secondary/5 rounded-lg p-8 border border-secondary/20 text-center"
        >
          <h3 className="font-heading text-2xl font-bold text-primary mb-3">
            Didn't find your answer?
          </h3>
          <p className="font-paragraph text-primary/70 mb-6">
            Our support team is here to help. Contact us anytime.
          </p>
          <button className="bg-secondary text-secondary-foreground hover:bg-secondary/90 px-8 py-3 rounded-lg font-semibold transition-colors duration-300">
            Contact Support
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
