import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Careers360Navbar from './careers360/Careers360Navbar';
import Careers360Footer from './careers360/Careers360Footer';
import {
  StudentWorkspaceSearchProvider,
  useStudentWorkspaceSearch,
} from './StudentWorkspaceSearchContext';

function StudentsWorkspaceLayoutInner() {
  const { searchTerm, setSearchTerm, showSuggestions, setShowSuggestions } = useStudentWorkspaceSearch();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSearchKeyDown = (e) => {
    if (e.key !== 'Enter' || location.pathname === '/students') return;
    const query = searchTerm.trim();
    if (!query) return;
    e.preventDefault();
    navigate('/students', { state: { searchTerm: query } });
  };

  return (
    <div className="flex min-h-screen flex-col bg-white font-sans text-[#333]">
      <Careers360Navbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onSearchFocus={() => setShowSuggestions(true)}
        onSearchBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        onSearchKeyDown={handleSearchKeyDown}
      />
      <Outlet />
      <Careers360Footer />
    </div>
  );
}

export default function StudentsWorkspaceLayout() {
  return (
    <StudentWorkspaceSearchProvider>
      <StudentsWorkspaceLayoutInner />
    </StudentWorkspaceSearchProvider>
  );
}
