import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuthStore } from '../lib/store';
import { useAuth } from '../lib/hooks/useAuth';
import * as Tooltip from '@radix-ui/react-tooltip';
import {
  LayoutDashboard,
  Building2,
  MessageSquare,
  Users,
  BookOpen,
  FileText,
  Wallet,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  Shield,
  Scale,
  Code2,
  Wrench,
  Lightbulb,
  PiggyBank,
  ChevronDown,
  User,
  UserCircle,
  Construction,
  Map // Import Map icon
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  isEnabled?: boolean;
  children?: NavItem[];
}

export default function Layout() { // Remove children prop
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, signOut } = useAuth();
  const { featureFlags } = useAuthStore();
  // Check for 'Platform Admin' role (case-sensitive)
  const isAdmin = profile?.role === 'Platform Admin'; 
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [hasCompany, setHasCompany] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate company check for demo purposes
    setHasCompany(true);
    setIsLoading(false);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const navigation: NavItem[] = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, isEnabled: true },
    {
      name: 'My Company',
      href: hasCompany ? '/company/dashboard' : '/company/setup',
      icon: Building2,
      badge: !hasCompany && !isLoading ? 'Setup' : undefined,
      isEnabled: true,
      children: [
        { name: 'Journey', href: '/company/journey/challenges', icon: Map, isEnabled: true }
      ]
    },
    { name: 'Messages', href: '/messages', icon: MessageSquare, isEnabled: true },
    { name: 'Community', href: '/community', icon: Users, isEnabled: true },
    { name: 'Directory', href: '/directory', icon: BookOpen, isEnabled: true },
    { name: 'Library', href: '#', icon: FileText, isEnabled: false },
    { name: 'Marketplace', href: '/tools-marketplace', icon: Wallet, isEnabled: true },
    { name: 'Legal Hub', href: '#', icon: Scale, isEnabled: false },
    { name: 'Dev Hub', href: '#', icon: Code2, isEnabled: false },
    { name: 'Utilities', href: '#', icon: Wrench, isEnabled: false },
    { name: 'Idea Hub', href: '/idea-hub', icon: Lightbulb, isEnabled: true },
    { name: 'Finance Hub', href: '/financial-hub', icon: PiggyBank, isEnabled: true },
    { name: 'Settings', href: '/profile', icon: Settings, isEnabled: true, children: [
      ...(isAdmin ? [
        { name: 'Admin Panel', href: '/admin', icon: Shield, isEnabled: true },
        { name: 'Journey Admin', href: '/admin-journey-content', icon: Map, isEnabled: true } // Add Journey Admin link
      ] : [])
    ]},
  ];

  const renderNavItem = (item: NavItem) => {
    if (!item.isEnabled) {
      return (
        <Tooltip.Provider>
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <div className="flex items-center px-2 py-2 text-sm font-medium text-base-content/40 cursor-not-allowed rounded-md group">
                <item.icon className="h-4 w-4 mr-3" />
                {item.name}
                <Construction className="h-4 w-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content
                className="bg-base-300 text-base-content px-3 py-1.5 rounded text-sm shadow-md"
                sideOffset={5}
              >
                Coming Soon
                <Tooltip.Arrow className="fill-base-300" />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        </Tooltip.Provider>
      );
    }

    return (
      <Link
        to={item.href}
        className={`${
          location.pathname === item.href
            ? 'bg-base-200 text-primary border-l-4 border-primary'
            : 'text-base-content hover:bg-base-200 hover:text-primary'
        } group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-all duration-200`}
      >
        <item.icon
          className={`${
            location.pathname === item.href
              ? 'text-primary'
              : 'text-base-content/70 group-hover:text-primary'
          } mr-3 h-4 w-4`}
        />
        {item.name}
        {item.badge && (
          <span className="ml-auto inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
            {item.badge}
          </span>
        )}
      </Link>
    );
  };

  return (
    <div className="flex min-h-screen bg-base-200">
      {/* Sidebar */}
      <aside className="w-64 bg-base-100 border-r border-base-300 flex flex-col p-4 space-y-2">
        <div className="flex items-center mb-6">
          <Shield className="h-8 w-8 text-primary mr-2" />
          <span className="text-xl font-bold text-primary">Wheel99</span>
        </div>
        <nav className="flex-1 space-y-1">
          {navigation.map((item) => (
            <React.Fragment key={item.name}>
              {renderNavItem(item)}
              {item.children?.map((child) => (
                <React.Fragment key={child.name}>
                  {child.isEnabled ? (
                    <Link
                      to={child.href}
                      className={`${
                        location.pathname === child.href
                          ? 'bg-base-200 text-primary border-l-4 border-primary'
                          : 'text-base-content hover:bg-base-200 hover:text-primary'
                      } group flex items-center px-8 py-2 text-sm font-medium rounded-md transition-all duration-200`}
                    >
                      <child.icon
                        className={`${
                          location.pathname === child.href
                            ? 'text-primary'
                            : 'text-base-content/70 group-hover:text-primary'
                        } mr-3 h-4 w-4`}
                      />
                      {child.name}
                    </Link>
                  ) : (
                    <Tooltip.Provider>
                      <Tooltip.Root>
                        <Tooltip.Trigger asChild>
                          <div className="flex items-center px-8 py-2 text-sm font-medium text-base-content/40 cursor-not-allowed rounded-md group">
                            <child.icon className="h-4 w-4 mr-3" />
                            {child.name}
                            <Construction className="h-4 w-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </Tooltip.Trigger>
                        <Tooltip.Portal>
                          <Tooltip.Content
                            className="bg-base-300 text-base-content px-3 py-1.5 rounded text-sm shadow-md"
                            sideOffset={5}
                          >
                            Coming Soon
                            <Tooltip.Arrow className="fill-base-300" />
                          </Tooltip.Content>
                        </Tooltip.Portal>
                      </Tooltip.Root>
                    </Tooltip.Provider>
                  )}
                </React.Fragment>
              ))}
            </React.Fragment>
          ))}
        </nav>
      </aside>
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="bg-base-100 shadow-sm border-b border-base-300 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left side - Search (Placeholder) */}
            <div className="flex items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-base-content/50" />
                <input 
                  type="text" 
                  placeholder="Search..." 
                  className="pl-10 pr-4 py-2 bg-base-200 border-none rounded-md focus:ring-1 focus:ring-primary text-sm w-64"
                />
              </div>
            </div>

            {/* Right side - Icons & Profile */}
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-md text-base-content/70 hover:bg-base-200 hover:text-primary transition-colors">
                <Bell className="h-5 w-5" />
              </button>

              {/* Profile dropdown */}
              <div className="relative">
                <button 
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  <UserCircle className="h-8 w-8 text-base-content/70 hover:text-primary transition-colors" />
                </button>
                {isProfileMenuOpen && (
                  <div 
                    className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-md py-1 bg-base-100 border border-base-300 focus:outline-none z-10"
                    role="menu" 
                    aria-orientation="vertical" 
                    aria-labelledby="user-menu-button" 
                  >
                    <Link 
                      to="/profile" 
                      className="flex items-center px-4 py-2 text-sm text-base-content hover:bg-base-200 hover:text-primary transition-colors" 
                      role="menuitem"
                      onClick={() => setIsProfileMenuOpen(false)} // Close menu on click
                    >
                      <User className="h-4 w-4 mr-2" />
                      Your Profile
                    </Link>
                    <button 
                      onClick={() => {
                        setIsProfileMenuOpen(false); // Close menu
                        handleSignOut(); 
                      }}
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-base-content hover:bg-base-200 hover:text-primary transition-colors" 
                      role="menuitem"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          <Outlet /> {/* Use Outlet here */}
        </main>
      </div>
    </div>
  );
}
