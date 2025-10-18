import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, LogOut, Settings, Shield } from 'lucide-react';
import useUserStore from '../../store/useUserStore';
import useAdminStore from '../../store/useAdminStore';
import useLanguage from '../../hooks/useLanguage';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { isAuthenticated, user, logout } = useUserStore();
  const { isAdminAuthenticated, admin, logoutAdmin } = useAdminStore();
  const { pathname } = useLocation();
  const { currentLanguage, changeLanguage, languages } = useLanguage();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);
  
  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
  };

  const handleAdminLogout = () => {
    logoutAdmin();
    setIsDropdownOpen(false);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <span className="text-primary text-2xl font-bold">GovSchemes</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link
            to="/"
            className={`text-gray-700 hover:text-primary transition-colors ${
              pathname === '/' ? 'font-medium text-primary' : ''
            }`}
          >
            Home
          </Link>
          <Link
            to="/schemes"
            className={`text-gray-700 hover:text-primary transition-colors ${
              pathname === '/schemes' ? 'font-medium text-primary' : ''
            }`}
          >
            Explore Schemes
          </Link>
          <Link
            to="/eligibility"
            className={`text-gray-700 hover:text-primary transition-colors ${
              pathname === '/eligibility' ? 'font-medium text-primary' : ''
            }`}
          >
            Check Eligibility
          </Link>
          <Link
            to="/admin"
            className={`text-gray-700 hover:text-primary transition-colors flex items-center ${
              pathname === '/admin' ? 'font-medium text-primary' : ''
            }`}
          >
            <Shield size={16} className="mr-1" />
            Admin
          </Link>
        </nav>

        {/* Right section: Language selector and auth */}
        <div className="hidden md:flex items-center space-x-4">
          {/* Language Selector */}
          <div className="relative">
            <select
              value={currentLanguage}
              onChange={(e) => changeLanguage(e.target.value as any)}
              className="appearance-none bg-gray-100 rounded-md py-1 px-3 pr-8 focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>

          {/* Auth buttons */}
          {isAdminAuthenticated ? (
            <div className="relative">
              <button
                onClick={toggleDropdown}
                className="flex items-center space-x-2 text-gray-700 hover:text-primary"
              >
                <span className="font-medium">{admin?.username}</span>
                <div className="h-8 w-8 bg-red-500 text-white rounded-full flex items-center justify-center">
                  <Shield size={18} />
                </div>
              </button>

              {/* Admin dropdown */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 py-2 bg-white rounded-md shadow-xl z-20">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <div className="text-sm font-medium text-gray-900">{admin?.username}</div>
                    <div className="text-xs text-gray-500 capitalize">{admin?.role?.replace('_', ' ')}</div>
                  </div>
                  <Link
                    to="/admin"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-primary"
                  >
                    <Settings size={16} className="mr-2" />
                    Admin Panel
                  </Link>
                  <button
                    onClick={handleAdminLogout}
                    className="flex w-full items-center px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-error"
                  >
                    <LogOut size={16} className="mr-2" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : isAuthenticated ? (
            <div className="relative">
              <button
                onClick={toggleDropdown}
                className="flex items-center space-x-2 text-gray-700 hover:text-primary"
              >
                <span className="font-medium">{user?.name.split(' ')[0]}</span>
                <div className="h-8 w-8 bg-primary text-white rounded-full flex items-center justify-center">
                  <User size={18} />
                </div>
              </button>

              {/* User dropdown */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 py-2 bg-white rounded-md shadow-xl z-20">
                  <Link
                    to="/dashboard"
                    onClick={() => setIsDropdownOpen(false)}
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-primary"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/admin"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-primary"
                  >
                    <Shield size={16} className="mr-2" />
                    Admin Login
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-error"
                  >
                    <LogOut size={16} className="mr-2" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Link to="/dashboard" className="text-gray-700 hover:text-primary">
                Login
              </Link>
              <Link to="/dashboard" className="btn btn-primary">
                Register
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <button className="md:hidden text-gray-500" onClick={toggleMenu}>
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 py-4 px-4 shadow-lg">
          <nav className="flex flex-col space-y-4">
            <Link to="/" onClick={closeMenu} className="text-gray-700 hover:text-primary py-2">
              Home
            </Link>
            <Link to="/schemes" onClick={closeMenu} className="text-gray-700 hover:text-primary py-2">
              Explore Schemes
            </Link>
            <Link to="/eligibility" onClick={closeMenu} className="text-gray-700 hover:text-primary py-2">
              Check Eligibility
            </Link>
            <Link to="/admin" onClick={closeMenu} className="text-gray-700 hover:text-primary py-2 flex items-center">
              <Shield size={16} className="mr-1" />
              Admin
            </Link>

            {/* Language selector mobile */}
            <div className="py-2">
              <label className="block text-sm text-gray-500 mb-1">Language</label>
              <select
                value={currentLanguage}
                onChange={(e) => changeLanguage(e.target.value as any)}
                className="w-full bg-gray-100 rounded-md py-2 px-3"
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Auth buttons mobile */}
            {isAdminAuthenticated ? (
              <>
                <div className="py-2 border-t border-gray-200">
                  <div className="text-sm font-medium text-gray-900">{admin?.username}</div>
                  <div className="text-xs text-gray-500 capitalize">{admin?.role?.replace('_', ' ')}</div>
                </div>
                <Link
                  to="/admin"
                  onClick={closeMenu}
                  className="text-gray-700 hover:text-primary py-2"
                >
                  Admin Panel
                </Link>
                <button
                  onClick={() => {
                    handleAdminLogout();
                    closeMenu();
                  }}
                  className="flex items-center text-gray-700 hover:text-error py-2"
                >
                  <LogOut size={16} className="mr-2" />
                  Logout
                </button>
              </>
            ) : isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={closeMenu}
                  className="text-gray-700 hover:text-primary py-2"
                >
                  Dashboard
                </Link>
                <Link
                  to="/admin"
                  onClick={closeMenu}
                  className="text-gray-700 hover:text-primary py-2"
                >
                  Admin Login
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    closeMenu();
                  }}
                  className="flex items-center text-gray-700 hover:text-error py-2"
                >
                  <LogOut size={16} className="mr-2" />
                  Logout
                </button>
              </>
            ) : (
              <div className="flex flex-col space-y-3 pt-2">
                <Link to="/dashboard" onClick={closeMenu} className="btn btn-outline w-full">
                  Login
                </Link>
                <Link to="/dashboard" onClick={closeMenu} className="btn btn-primary w-full">
                  Register
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;