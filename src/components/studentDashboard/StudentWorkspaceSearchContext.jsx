import { createContext, useContext, useMemo, useState } from 'react';

const StudentWorkspaceSearchContext = createContext(null);

export function StudentWorkspaceSearchProvider({ children }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const value = useMemo(
    () => ({
      searchTerm,
      setSearchTerm,
      showSuggestions,
      setShowSuggestions,
      onClearSearch: () => setSearchTerm(''),
    }),
    [searchTerm, showSuggestions]
  );

  return (
    <StudentWorkspaceSearchContext.Provider value={value}>{children}</StudentWorkspaceSearchContext.Provider>
  );
}

export function useStudentWorkspaceSearch() {
  const ctx = useContext(StudentWorkspaceSearchContext);
  if (!ctx) {
    throw new Error('useStudentWorkspaceSearch must be used within StudentWorkspaceSearchProvider');
  }
  return ctx;
}
