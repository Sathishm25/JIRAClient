import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

const Header = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Get user details from sessionStorage
    const userDetails = sessionStorage.getItem('userdetails');
    if (userDetails) {
      try {
        setUser(JSON.parse(userDetails));
      } catch (error) {
        console.error('Error parsing user details:', error);
      }
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSignOut = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('userdetails');
    navigate('/');
  };
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);
  };

  return (
    <header className="bg-[#0098EB] shadow-sm border-b border-blue-600 px-6 py-1">
      <div className="flex items-center justify-between">
        {/* Left side - Ramboll logo */}
        <div className="flex items-center">
          {/* <img
            src="/assets/logo 1.svg"
            alt="Ramboll"
            className="h-8 bg-[#fff] w-auto cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => navigate('/project')}
          /> */}
          <h1 className="text-white text-lg font-bold">R</h1>
        </div>{/* Right side - User info with dropdown */}
        <div className="flex items-center gap-3">
          {user && (
            <div className="relative" ref={dropdownRef}>
              {/* Clickable user area */}
              <div 
                className="flex items-center gap-3 cursor-pointer py-2 rounded-lg transition-colors"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                {/* User name */}
                <span className="text-white font-medium">Hi {user.name}!</span>
                {/* User avatar or initial circle */}
                {user?.avatar ? (
                  <img 
                    src={`http://localhost:4000${user.avatar}`} 
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover border-2 border-white"
                  />
                ) : (
                  <div className="w-8 h-8 bg-white text-[#0098EB] rounded-full flex items-center justify-center font-medium text-sm">
                    {getInitials(user.name)}
                  </div>
                )}
                {/* Dropdown arrow */}
                <svg 
                  className={`w-4 h-4 text-white transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {/* Dropdown menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <Link to={`/profile`} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                    View Profile
                  </Link>
                  <Link to={`/settings`} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                    Settings
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;