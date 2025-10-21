import { useState, useMemo } from 'react';
import Fuse from 'fuse.js';

interface SearchOptions {
  keys: string[];
  threshold?: number;
  includeScore?: boolean;
  includeMatches?: boolean;
}

export const useSearch = <T>(
  data: T[],
  options: SearchOptions
) => {
  const [searchTerm, setSearchTerm] = useState('');

  const fuse = useMemo(() => {
    return new Fuse(data, {
      keys: options.keys,
      threshold: options.threshold || 0.3,
      includeScore: options.includeScore || false,
      includeMatches: options.includeMatches || false,
    });
  }, [data, options]);

  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) {
      return data;
    }
    
    const results = fuse.search(searchTerm);
    return results.map(result => result.item);
  }, [fuse, searchTerm, data]);

  const clearSearch = () => {
    setSearchTerm('');
  };

  return {
    searchTerm,
    setSearchTerm,
    searchResults,
    clearSearch,
    isSearching: searchTerm.trim().length > 0,
  };
};

export default useSearch;
