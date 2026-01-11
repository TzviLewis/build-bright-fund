import { useState, useEffect } from 'react';
import { Search, X, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { BaseCrudService } from '@/integrations';
import { CampaignDetails } from '@/entities';
import { useNavigate } from 'react-router-dom';

interface SearchFilters {
  status?: string;
  minGoal?: number;
  maxGoal?: number;
  sortBy?: 'relevance' | 'newest' | 'goal' | 'progress';
}

interface SearchResult {
  id: string;
  title: string;
  description: string;
  goal: number;
  type: 'campaign' | 'team' | 'faq';
}

export default function AdvancedSearchBar() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    sortBy: 'relevance',
  });
  const [campaigns, setCampaigns] = useState<CampaignDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Load campaigns on mount
  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      const { items } = await BaseCrudService.getAll<CampaignDetails>('campaigndetails');
      setCampaigns(items || []);
    } catch (error) {
      console.error('Error loading campaigns:', error);
    }
  };

  // Perform search
  useEffect(() => {
    if (searchTerm.trim().length === 0) {
      setResults([]);
      return;
    }

    setLoading(true);
    const searchResults: SearchResult[] = [];
    const lowerSearchTerm = searchTerm.toLowerCase();

    // Search campaigns
    campaigns.forEach(campaign => {
      if (
        campaign.campaignTitle?.toLowerCase().includes(lowerSearchTerm) ||
        campaign.projectDescription?.toLowerCase().includes(lowerSearchTerm) ||
        campaign.promotionalText?.toLowerCase().includes(lowerSearchTerm)
      ) {
        searchResults.push({
          id: campaign._id,
          title: campaign.campaignTitle || 'Untitled Campaign',
          description: campaign.projectDescription || '',
          goal: campaign.fundraisingGoal || 0,
          type: 'campaign',
        });
      }
    });

    // Apply filters
    let filtered = searchResults;
    if (filters.status) {
      filtered = filtered.filter(r => r.type === filters.status);
    }
    if (filters.minGoal) {
      filtered = filtered.filter(r => r.goal >= filters.minGoal!);
    }
    if (filters.maxGoal) {
      filtered = filtered.filter(r => r.goal <= filters.maxGoal!);
    }

    // Sort results
    if (filters.sortBy === 'goal') {
      filtered.sort((a, b) => b.goal - a.goal);
    } else if (filters.sortBy === 'newest') {
      // Sort by newest (would need date field)
      filtered.reverse();
    }

    setResults(filtered.slice(0, 10)); // Limit to 10 results
    setLoading(false);
  }, [searchTerm, filters, campaigns]);

  const handleResultClick = (result: SearchResult) => {
    if (result.type === 'campaign') {
      navigate(`/campaign/${result.id}`);
    }
    setIsOpen(false);
    setSearchTerm('');
  };

  const clearSearch = () => {
    setSearchTerm('');
    setResults([]);
    setIsOpen(false);
  };

  return (
    <div className="w-full max-w-2xl mx-auto relative">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative"
      >
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary/40" />
          <Input
            type="text"
            placeholder="Search campaigns, teams, and more..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            className="pl-12 pr-12 py-3 border-primary/20 focus:border-secondary focus:ring-secondary text-base rounded-lg"
          />
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 hover:bg-primary/10 rounded transition-colors"
              aria-label="Clear search"
            >
              <X className="w-5 h-5 text-primary/60" />
            </button>
          )}
        </div>

        {/* Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="absolute right-14 top-1/2 transform -translate-y-1/2 p-2 hover:bg-primary/10 rounded transition-colors"
          aria-label="Toggle filters"
        >
          <Filter className="w-5 h-5 text-primary/60" />
        </button>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 right-0 mt-2 bg-white border border-primary/10 rounded-lg shadow-lg p-4 z-50"
            >
              <div className="space-y-4">
                {/* Sort By */}
                <div>
                  <label className="font-paragraph text-sm font-semibold text-primary block mb-2">
                    Sort By
                  </label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as any })}
                    className="w-full px-3 py-2 border border-primary/20 rounded-lg font-paragraph text-sm focus:border-secondary focus:outline-none"
                  >
                    <option value="relevance">Relevance</option>
                    <option value="newest">Newest</option>
                    <option value="goal">Highest Goal</option>
                  </select>
                </div>

                {/* Goal Range */}
                <div>
                  <label className="font-paragraph text-sm font-semibold text-primary block mb-2">
                    Goal Range
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={filters.minGoal || ''}
                      onChange={(e) => setFilters({ ...filters, minGoal: e.target.value ? parseInt(e.target.value) : undefined })}
                      className="flex-1 border-primary/20 focus:border-secondary text-sm"
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={filters.maxGoal || ''}
                      onChange={(e) => setFilters({ ...filters, maxGoal: e.target.value ? parseInt(e.target.value) : undefined })}
                      className="flex-1 border-primary/20 focus:border-secondary text-sm"
                    />
                  </div>
                </div>

                {/* Reset Filters */}
                <button
                  onClick={() => setFilters({ sortBy: 'relevance' })}
                  className="w-full px-3 py-2 bg-primary/5 hover:bg-primary/10 text-primary rounded-lg font-paragraph text-sm font-semibold transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search Results Dropdown */}
        <AnimatePresence>
          {isOpen && (searchTerm || results.length > 0) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 right-0 mt-2 bg-white border border-primary/10 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto"
            >
              {loading ? (
                <div className="p-4 text-center">
                  <p className="font-paragraph text-sm text-primary/60">Searching...</p>
                </div>
              ) : results.length > 0 ? (
                <div className="divide-y divide-primary/10">
                  {results.map((result, index) => (
                    <motion.button
                      key={result.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      onClick={() => handleResultClick(result)}
                      className="w-full px-4 py-3 hover:bg-primary/5 transition-colors text-left"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-heading font-semibold text-primary">
                            {result.title}
                          </p>
                          {result.description && (
                            <p className="font-paragraph text-xs text-primary/60 mt-1 line-clamp-2">
                              {result.description}
                            </p>
                          )}
                        </div>
                        <span className="font-paragraph text-xs text-secondary font-semibold ml-2 flex-shrink-0">
                          {result.type}
                        </span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              ) : searchTerm ? (
                <div className="p-4 text-center">
                  <p className="font-paragraph text-sm text-primary/60">
                    No results found for "{searchTerm}"
                  </p>
                </div>
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
