import { useState } from 'react';
import { ChevronDown, X, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';

export interface FilterOption {
  id: string;
  label: string;
  value: string;
}

export interface FilterConfig {
  id: string;
  label: string;
  type: 'checkbox' | 'radio' | 'range' | 'select';
  options?: FilterOption[];
  min?: number;
  max?: number;
  step?: number;
}

export interface AppliedFilters {
  [key: string]: string | string[] | number | number[];
}

interface AdvancedFiltersProps {
  filters: FilterConfig[];
  onFiltersChange: (filters: AppliedFilters) => void;
  onReset?: () => void;
}

export default function AdvancedFilters({
  filters,
  onFiltersChange,
  onReset,
}: AdvancedFiltersProps) {
  const [appliedFilters, setAppliedFilters] = useState<AppliedFilters>({});
  const [isOpen, setIsOpen] = useState(false);
  const [expandedFilters, setExpandedFilters] = useState<Set<string>>(new Set());

  const toggleFilter = (filterId: string) => {
    const newExpanded = new Set(expandedFilters);
    if (newExpanded.has(filterId)) {
      newExpanded.delete(filterId);
    } else {
      newExpanded.add(filterId);
    }
    setExpandedFilters(newExpanded);
  };

  const handleFilterChange = (filterId: string, value: string | number | string[] | number[]) => {
    const newFilters = { ...appliedFilters, [filterId]: value };
    setAppliedFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleRemoveFilter = (filterId: string) => {
    const newFilters = { ...appliedFilters };
    delete newFilters[filterId];
    setAppliedFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleReset = () => {
    setAppliedFilters({});
    setExpandedFilters(new Set());
    onFiltersChange({});
    onReset?.();
  };

  const activeFilterCount = Object.keys(appliedFilters).length;

  return (
    <div className="space-y-4">
      {/* Filter Toggle Button */}
      <div className="flex items-center justify-between">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          variant="outline"
          className="border-primary/20 text-primary hover:bg-primary/5 rounded-lg flex items-center gap-2"
        >
          <Filter className="w-4 h-4" />
          Filters
          {activeFilterCount > 0 && (
            <span className="ml-2 px-2 py-1 bg-secondary text-secondary-foreground rounded-full text-xs font-bold">
              {activeFilterCount}
            </span>
          )}
          <ChevronDown
            className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </Button>

        {activeFilterCount > 0 && (
          <Button
            onClick={handleReset}
            variant="ghost"
            className="text-primary/60 hover:text-primary text-sm"
          >
            Clear All
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      <AnimatePresence>
        {activeFilterCount > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap gap-2"
          >
            {Object.entries(appliedFilters).map(([filterId, value]) => {
              const filter = filters.find(f => f.id === filterId);
              if (!filter) return null;

              const displayValue = Array.isArray(value)
                ? value.join(', ')
                : value;

              return (
                <motion.div
                  key={filterId}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex items-center gap-2 px-3 py-1 bg-secondary/10 border border-secondary/30 rounded-full"
                >
                  <span className="font-paragraph text-sm text-primary">
                    {filter.label}: <span className="font-semibold">{displayValue}</span>
                  </span>
                  <button
                    onClick={() => handleRemoveFilter(filterId)}
                    className="text-secondary hover:text-secondary/70 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border border-primary/10 rounded-lg overflow-hidden bg-white"
          >
            <div className="space-y-1 p-4">
              {filters.map(filter => (
                <div key={filter.id} className="border-b border-primary/10 last:border-b-0">
                  {/* Filter Header */}
                  <button
                    onClick={() => toggleFilter(filter.id)}
                    className="w-full flex items-center justify-between py-3 px-2 hover:bg-primary/5 rounded transition-colors"
                  >
                    <span className="font-paragraph font-semibold text-primary">
                      {filter.label}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-primary/60 transition-transform ${
                        expandedFilters.has(filter.id) ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {/* Filter Content */}
                  <AnimatePresence>
                    {expandedFilters.has(filter.id) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="px-2 pb-3 space-y-2"
                      >
                        {filter.type === 'checkbox' && filter.options && (
                          <div className="space-y-2">
                            {filter.options.map(option => (
                              <label
                                key={option.id}
                                className="flex items-center gap-2 cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  value={option.value}
                                  checked={
                                    Array.isArray(appliedFilters[filter.id])
                                      ? (appliedFilters[filter.id] as string[]).includes(
                                          option.value
                                        )
                                      : false
                                  }
                                  onChange={e => {
                                    const current = Array.isArray(appliedFilters[filter.id])
                                      ? (appliedFilters[filter.id] as string[])
                                      : [];
                                    const updated = e.target.checked
                                      ? [...current, option.value]
                                      : current.filter(v => v !== option.value);
                                    handleFilterChange(filter.id, updated);
                                  }}
                                  className="rounded border-primary/20"
                                />
                                <span className="font-paragraph text-sm text-primary">
                                  {option.label}
                                </span>
                              </label>
                            ))}
                          </div>
                        )}

                        {filter.type === 'radio' && filter.options && (
                          <div className="space-y-2">
                            {filter.options.map(option => (
                              <label
                                key={option.id}
                                className="flex items-center gap-2 cursor-pointer"
                              >
                                <input
                                  type="radio"
                                  name={filter.id}
                                  value={option.value}
                                  checked={appliedFilters[filter.id] === option.value}
                                  onChange={e =>
                                    handleFilterChange(filter.id, e.target.value)
                                  }
                                  className="rounded-full border-primary/20"
                                />
                                <span className="font-paragraph text-sm text-primary">
                                  {option.label}
                                </span>
                              </label>
                            ))}
                          </div>
                        )}

                        {filter.type === 'range' && (
                          <div className="space-y-3">
                            <div className="flex gap-2">
                              <Input
                                type="number"
                                min={filter.min}
                                max={filter.max}
                                step={filter.step}
                                placeholder="Min"
                                value={
                                  Array.isArray(appliedFilters[filter.id])
                                    ? (appliedFilters[filter.id] as number[])[0] || ''
                                    : ''
                                }
                                onChange={e => {
                                  const current = Array.isArray(appliedFilters[filter.id])
                                    ? (appliedFilters[filter.id] as number[])
                                    : [filter.min || 0, filter.max || 100];
                                  handleFilterChange(filter.id, [
                                    parseInt(e.target.value) || current[0],
                                    current[1],
                                  ] as number[]);
                                }}
                                className="border-primary/20 text-sm"
                              />
                              <Input
                                type="number"
                                min={filter.min}
                                max={filter.max}
                                step={filter.step}
                                placeholder="Max"
                                value={
                                  Array.isArray(appliedFilters[filter.id])
                                    ? (appliedFilters[filter.id] as number[])[1] || ''
                                    : ''
                                }
                                onChange={e => {
                                  const current = Array.isArray(appliedFilters[filter.id])
                                    ? (appliedFilters[filter.id] as number[])
                                    : [filter.min || 0, filter.max || 100];
                                  handleFilterChange(filter.id, [
                                    current[0],
                                    parseInt(e.target.value) || current[1],
                                  ] as number[]);
                                }}
                                className="border-primary/20 text-sm"
                              />
                            </div>
                          </div>
                        )}

                        {filter.type === 'select' && filter.options && (
                          <select
                            value={Array.isArray(appliedFilters[filter.id]) ? '' : (appliedFilters[filter.id] as string || '')}
                            onChange={e => handleFilterChange(filter.id, e.target.value)}
                            className="w-full px-3 py-2 border border-primary/20 rounded-lg font-paragraph text-sm focus:border-secondary focus:outline-none"
                          >
                            <option value="">Select...</option>
                            {filter.options.map(option => (
                              <option key={option.id} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
