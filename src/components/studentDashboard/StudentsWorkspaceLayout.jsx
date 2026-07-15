import { useMemo, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Careers360Navbar from './careers360/Careers360Navbar';
import Careers360Footer from './careers360/Careers360Footer';

export default function StudentsWorkspaceLayout() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleSearchKeyDown = (e) => {
    if (e.key !== 'Enter' || location.pathname === '/students') return;
    const query = searchTerm.trim();
    if (!query) return;
    e.preventDefault();
    navigate('/students', { state: { searchTerm: query } });
  };

  const outletContext = useMemo(
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
    <div className="flex min-h-screen flex-col bg-white font-sans text-[#333]">
      <Careers360Navbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onSearchFocus={() => setShowSuggestions(true)}
        onSearchBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        onSearchKeyDown={handleSearchKeyDown}
      />
      <Outlet context={outletContext} />
      <Careers360Footer />
    </div>
  );
}
