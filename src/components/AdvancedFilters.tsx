import React, { useState } from 'react';
import { useFilterStore } from '@/stores/filterStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';
import { ChevronDown, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AdvancedFiltersProps {
  onClose?: () => void;
}

export default function AdvancedFilters({ onClose }: AdvancedFiltersProps) {
  const {
    searchQuery,
    sortBy,
    statusFilter,
    minGoal,
    maxGoal,
    dateRange,
    setSearchQuery,
    setSortBy,
    setStatusFilter,
    setGoalRange,
    setDateRange,
    resetFilters,
  } = useFilterStore();

  const [expandedSections, setExpandedSections] = useState({
    search: true,
    sort: false,
    status: false,
    goal: false,
    date: false,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const statusOptions = ['Active', 'Upcoming', 'Completed', 'Paused'];
  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'mostFunded', label: 'Most Funded' },
    { value: 'leastFunded', label: 'Least Funded' },
    { value: 'endingSoon', label: 'Ending Soon' },
    { value: 'mostPopular', label: 'Most Popular' },
  ];
  const dateOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'thisWeek', label: 'This Week' },
    { value: 'thisMonth', label: 'This Month' },
    { value: 'thisQuarter', label: 'This Quarter' },
  ];

  const handleStatusToggle = (status: string) => {
    setStatusFilter(
      statusFilter.includes(status)
        ? statusFilter.filter((s) => s !== status)
        : [...statusFilter, status]
    );
  };

  const activeFiltersCount = [
    searchQuery ? 1 : 0,
    sortBy !== 'newest' ? 1 : 0,
    statusFilter.length,
    minGoal > 0 || maxGoal < 1000000 ? 1 : 0,
    dateRange !== 'all' ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  return (
    <div className="w-full bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-gray-900">Filters & Search</h3>
          {activeFiltersCount > 0 && (
            <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-blue-600 rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </div>
        <div className="flex gap-2">
          {activeFiltersCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={resetFilters}
              className="text-xs"
            >
              Clear All
            </Button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-md transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {/* Search Section */}
        <FilterSection
          title="Search"
          isExpanded={expandedSections.search}
          onToggle={() => toggleSection('search')}
        >
          <Input
            placeholder="Search campaigns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </FilterSection>

        {/* Sort Section */}
        <FilterSection
          title="Sort By"
          isExpanded={expandedSections.sort}
          onToggle={() => toggleSection('sort')}
        >
          <div className="space-y-2">
            {sortOptions.map((option) => (
              <label key={option.value} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="sort"
                  value={option.value}
                  checked={sortBy === option.value}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* Status Section */}
        <FilterSection
          title="Status"
          isExpanded={expandedSections.status}
          onToggle={() => toggleSection('status')}
        >
          <div className="space-y-2">
            {statusOptions.map((status) => (
              <label key={status} className="flex items-center gap-3 cursor-pointer">
                <Checkbox
                  checked={statusFilter.includes(status)}
                  onCheckedChange={() => handleStatusToggle(status)}
                />
                <span className="text-sm text-gray-700">{status}</span>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* Goal Range Section */}
        <FilterSection
          title="Fundraising Goal"
          isExpanded={expandedSections.goal}
          onToggle={() => toggleSection('goal')}
        >
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-xs text-gray-600 block mb-2">Min Goal</label>
                <Input
                  type="number"
                  value={minGoal}
                  onChange={(e) => setGoalRange(Number(e.target.value), maxGoal)}
                  placeholder="$0"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-gray-600 block mb-2">Max Goal</label>
                <Input
                  type="number"
                  value={maxGoal}
                  onChange={(e) => setGoalRange(minGoal, Number(e.target.value))}
                  placeholder="$1,000,000"
                />
              </div>
            </div>
            <Slider
              value={[minGoal, maxGoal]}
              onValueChange={(values) => setGoalRange(values[0], values[1])}
              min={0}
              max={1000000}
              step={10000}
              className="w-full"
            />
            <div className="text-xs text-gray-600">
              ${minGoal.toLocaleString()} - ${maxGoal.toLocaleString()}
            </div>
          </div>
        </FilterSection>

        {/* Date Range Section */}
        <FilterSection
          title="Date Range"
          isExpanded={expandedSections.date}
          onToggle={() => toggleSection('date')}
        >
          <div className="space-y-2">
            {dateOptions.map((option) => (
              <label key={option.value} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="dateRange"
                  value={option.value}
                  checked={dateRange === option.value}
                  onChange={(e) => setDateRange(e.target.value as any)}
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        </FilterSection>
      </div>
    </div>
  );
}

interface FilterSectionProps {
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function FilterSection({ title, isExpanded, onToggle, children }: FilterSectionProps) {
  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-3 hover:bg-gray-50 transition-colors"
      >
        <span className="font-medium text-gray-900">{title}</span>
        <ChevronDown
          className={`w-5 h-5 text-gray-500 transition-transform ${
            isExpanded ? 'rotate-180' : ''
          }`}
        />
      </button>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pb-4 pl-0">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
