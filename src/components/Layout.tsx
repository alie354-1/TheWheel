import React, { useState, useEffect, useRef, ReactNode } from 'react'; // Import ReactNode and useRef
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuthStore } from '../lib/store.ts';
import { useFeatureFlags } from '../lib/hooks/useFeatureFlags.ts';
import { useAuth } from '../lib/hooks/useAuth.ts';
import { trackEvent } from '../lib/services/analytics.service.ts'; // Import trackEvent
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
  Map, // Import Map icon
  BarChart3, // Import Analytics icon
  Presentation // Import Presentation icon for deck builder
} from 'lucide-react';

import { companyService } from '../lib/services/company.service.ts';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  isEnabled?: boolean;
  children?: NavItem[];
}

import BusinessOpsSidebar from '../business-ops-hub/components/BusinessOpsSidebar.tsx';

// Container Component
interface ContainerProps {
  children: ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

export const Container: React.FC<ContainerProps> = ({ children, className = '', maxWidth = 'xl' }) => {
  const getMaxWidthClass = () => {
    switch (maxWidth) {
      case 'sm': return 'max-w-screen-sm';
      case 'md': return 'max-w-screen-md';
      case 'lg': return 'max-w-screen-lg';
      case 'xl': return 'max-w-screen-xl';
      case '2xl': return 'max-w-screen-2xl';
      case 'full': return 'max-w-full';
      default: return 'max-w-screen-xl';
    }
  };
  return (
    <div className={`mx-auto px-4 sm:px-6 lg:px-8 ${getMaxWidthClass()} ${className}`}>
      {children}
    </div>
  );
};

// Stack Component
interface StackProps {
  children: ReactNode;
  className?: string;
  direction?: 'row' | 'col';
  spacing?: number; // theme spacing unit
  alignItems?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  justifyContent?: 'start' | 'center' | 'end' | 'between' | 'around';
  wrap?: boolean;
}

export const Stack: React.FC<StackProps> = ({
  children,
  className = '',
  direction = 'col',
  spacing = 2,
  alignItems = 'stretch',
  justifyContent = 'start',
  wrap = false,
}) => {
  const directionClass = direction === 'row' ? 'flex-row' : 'flex-col';
  const spacingClass = direction === 'row' ? `space-x-${spacing}` : `space-y-${spacing}`;
  const alignItemsClass = `items-${alignItems}`;
  const justifyContentClass = `justify-${justifyContent}`;
  const wrapClass = wrap ? 'flex-wrap' : '';

  return (
    <div className={`flex ${directionClass} ${spacingClass} ${alignItemsClass} ${justifyContentClass} ${wrapClass} ${className}`}>
      {children}
    </div>
  );
};


export default function Layout() { // Remove children prop
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, signOut } = useAuth();
  const { flags: featureFlags } = useFeatureFlags();
  // Check for 'Platform Admin' role (case-sensitive)
  const isAdmin = profile?.role === 'Platform Admin'; 
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [hasCompany, setHasCompany] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const previousPathnameRef = useRef<string | null>(null); // Ref to track previous path

  useEffect(() => {
    async function fetchCompany() {
      if (user?.id) {
        const companies = await companyService.getUserCompanies(user.id);
        if (companies && companies.length > 0) {
          setHasCompany(true);
          setCompanyId(companies[0].id);
        } else {
          setHasCompany(false);
          setCompanyId(null);
        }
      }
      setIsLoading(false);
    }
    fetchCompany();
    // eslint-disable-next-line
  }, [user?.id]);

  // Track page views
  useEffect(() => {
    // Only track if the pathname has actually changed
    if (location.pathname !== previousPathnameRef.current) {
      trackEvent('page_view', null, null, { path: location.pathname });
      previousPathnameRef.current = location.pathname; // Update the ref
    }
  }, [location.pathname]); // Depend on pathname

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  // Use feature flags to control nav visibility
  // (Remove duplicate declaration)

  // Helper to determine nav item state
  const navState = (flag: { enabled?: boolean; visible?: boolean }) => {
    if (!flag?.enabled) return 'hidden';
    if (flag.enabled && !flag.visible) return 'comingSoon';
    return 'normal';
  };

  const navigation: NavItem[] = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, isEnabled: navState(featureFlags?.dashboard) !== 'hidden', badge: navState(featureFlags?.dashboard) === 'comingSoon' ? 'Coming Soon' : undefined },
    {
      name: 'My Company',
      href: hasCompany ? '/company/dashboard' : '/company/setup',
      icon: Building2,
      badge: !hasCompany && !isLoading ? 'Setup' : undefined,
      isEnabled: navState(featureFlags?.company) !== 'hidden',
      children: [
        { name: 'Dashboard', href: '/company/dashboard', icon: LayoutDashboard, isEnabled: navState(featureFlags?.companyDashboard) !== 'hidden', badge: navState(featureFlags?.companyDashboard) === 'comingSoon' ? 'Coming Soon' : undefined },
        { name: 'Profile', href: companyId ? `/company/profile/${companyId}` : '/company/profile', icon: UserCircle, isEnabled: navState(featureFlags?.companyProfile) !== 'hidden' && !!companyId, badge: navState(featureFlags?.companyProfile) === 'comingSoon' ? 'Coming Soon' : undefined },
        { name: 'Members', href: '/company/members', icon: Users, isEnabled: navState(featureFlags?.companyMembers) !== 'hidden', badge: navState(featureFlags?.companyMembers) === 'comingSoon' ? 'Coming Soon' : undefined },
        { name: 'Journey', href: '/company/journey', icon: Map, isEnabled: navState(featureFlags?.companyJourney) !== 'hidden', badge: navState(featureFlags?.companyJourney) === 'comingSoon' ? 'Coming Soon' : undefined }
      ]
    },
    { name: 'Messages', href: '/messages', icon: MessageSquare, isEnabled: navState(featureFlags?.messages) !== 'hidden', badge: navState(featureFlags?.messages) === 'comingSoon' ? 'Coming Soon' : undefined },
    { name: 'Community', href: '/community', icon: Users, isEnabled: navState(featureFlags?.community) !== 'hidden', badge: navState(featureFlags?.community) === 'comingSoon' ? 'Coming Soon' : undefined },
    { name: 'Directory', href: '/directory', icon: BookOpen, isEnabled: navState(featureFlags?.directory) !== 'hidden', badge: navState(featureFlags?.directory) === 'comingSoon' ? 'Coming Soon' : undefined },
    { name: 'Library', href: '#', icon: FileText, isEnabled: navState(featureFlags?.library) !== 'hidden', badge: navState(featureFlags?.library) === 'comingSoon' ? 'Coming Soon' : undefined },
    { name: 'Marketplace', href: '/tools-marketplace', icon: Wallet, isEnabled: navState(featureFlags?.marketplace) !== 'hidden', badge: navState(featureFlags?.marketplace) === 'comingSoon' ? 'Coming Soon' : undefined },
    { name: 'Legal Hub', href: '#', icon: Scale, isEnabled: navState(featureFlags?.legalHub) !== 'hidden', badge: navState(featureFlags?.legalHub) === 'comingSoon' ? 'Coming Soon' : undefined },
    { name: 'Dev Hub', href: '#', icon: Code2, isEnabled: navState(featureFlags?.devHub) !== 'hidden', badge: navState(featureFlags?.devHub) === 'comingSoon' ? 'Coming Soon' : undefined },
    { name: 'Utilities', href: '#', icon: Wrench, isEnabled: navState(featureFlags?.utilities) !== 'hidden', badge: navState(featureFlags?.utilities) === 'comingSoon' ? 'Coming Soon' : undefined },
    { name: 'Idea Hub', href: '/idea-hub', icon: Lightbulb, isEnabled: navState(featureFlags?.ideaHub) !== 'hidden', badge: navState(featureFlags?.ideaHub) === 'comingSoon' ? 'Coming Soon' : undefined },
    { name: 'Deck Builder', href: '/deck-builder', icon: Presentation, isEnabled: navState(featureFlags?.deckBuilder) !== 'hidden', badge: navState(featureFlags?.deckBuilder) === 'comingSoon' ? 'Coming Soon' : undefined },
    { name: 'Finance Hub', href: '/financial-hub', icon: PiggyBank, isEnabled: navState(featureFlags?.financeHub) !== 'hidden', badge: navState(featureFlags?.financeHub) === 'comingSoon' ? 'Coming Soon' : undefined },
    { name: 'Business Operations Hub', href: '/business-ops-hub', icon: Construction, isEnabled: navState(featureFlags?.businessOpsHub) !== 'hidden', badge: navState(featureFlags?.businessOpsHub) === 'comingSoon' ? 'Coming Soon' : undefined },
    { name: 'Analytics', href: '/analytics', icon: BarChart3, isEnabled: navState(featureFlags?.analytics) !== 'hidden', badge: navState(featureFlags?.analytics) === 'comingSoon' ? 'Coming Soon' : undefined },
    { name: 'Settings', href: '/profile', icon: Settings, isEnabled: navState(featureFlags?.settings) !== 'hidden', badge: navState(featureFlags?.settings) === 'comingSoon' ? 'Coming Soon' : undefined, children: [
      ...(isAdmin ? [
        { name: 'Admin Panel', href: '/admin', icon: Shield, isEnabled: navState(featureFlags?.adminPanel) !== 'hidden', badge: navState(featureFlags?.adminPanel) === 'comingSoon' ? 'Coming Soon' : undefined },
        { name: 'Journey Admin', href: '/admin-journey-content', icon: Map, isEnabled: navState(featureFlags?.journeyAdmin) !== 'hidden', badge: navState(featureFlags?.journeyAdmin) === 'comingSoon' ? 'Coming Soon' : undefined }
      ] : [])
    ]},
  ];

  const renderNavItem = (item: NavItem) => {
    if (!item.isEnabled) {
      // Do not render at all if not enabled
      return null;
    }

    // Coming soon: enabled but not visible
    if (item.badge === 'Coming Soon') {
      return (
        <Tooltip.Provider>
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <div
                className="flex items-center px-2 py-2 text-sm font-medium rounded-md group opacity-50 cursor-not-allowed"
                tabIndex={0}
                aria-disabled="true"
                style={{ pointerEvents: 'auto' }}
              >
                <item.icon className="h-4 w-4 mr-3" />
                {item.name}
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

    // Normal nav item
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
      </Link>
    );
  };

  const isBusinessOpsHub = location.pathname.startsWith("/business-ops-hub");
  // const isVisualDeckBuilderPage = location.pathname.startsWith("/visual-deck-builder"); // Removed

  // if (isVisualDeckBuilderPage) { // Removed block
  //   // For VisualDeckBuilderPage, render Outlet directly.
  //   // UnifiedDeckBuilder is expected to handle its own full-screen fixed positioning.
  //   return <Outlet />;
  // }
  
  if (isBusinessOpsHub) {
    // Business Ops Hub has a specific layout with its own sidebar
    return (
      <div className="flex min-h-screen bg-base-200">
        <BusinessOpsSidebar />
        <div className="flex-1 flex flex-col">
          {/* Business Ops Hub specific header might go here if needed, or within its pages */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8"> {/* Specific padding for BizOps */}
            <Outlet />
          </main>
        </div>
      </div>
    );
  }
  
  // Default layout for all other routes
  const isDeckBuilderPage = location.pathname.startsWith("/deck-builder");
  const isJourneyPage = location.pathname.startsWith("/company/journey");
  const mainContentClasses = isDeckBuilderPage || isJourneyPage
    ? "flex-1 w-full h-full p-0 m-0"
    : "flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto";
  const mainWrapperClasses = "flex-1 flex flex-col";
  const rootLayoutClasses = "flex min-h-screen bg-base-200";

  return (
    <div className={rootLayoutClasses}>
      {/* Sidebar */}
      <aside className="w-64 bg-base-100 border-r border-base-300 flex-col p-4 space-y-2 hidden md:flex"> {/* Hide on small screens */}
        <div className="flex items-center mb-6">
          <Shield className="h-8 w-8 text-primary mr-2" />
          <span className="text-xl font-bold text-primary">Wheel99</span>
        </div>
        <nav className="flex-1 space-y-1">
          {navigation.map((item) => (
            <React.Fragment key={item.name}>
              {renderNavItem(item)}
              {item.children?.map((child) => {
                if (!child.isEnabled) return null;
                if (child.badge === 'Coming Soon') {
                  return (
                    <Tooltip.Provider key={child.name}>
                      <Tooltip.Root>
                        <Tooltip.Trigger asChild>
                          <div
                            className="flex items-center px-8 py-2 text-sm font-medium rounded-md group opacity-50 cursor-not-allowed"
                            tabIndex={0}
                            aria-disabled="true"
                            style={{ pointerEvents: 'auto' }}
                          >
                            <child.icon className="h-4 w-4 mr-3" />
                            {child.name}
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
                    key={child.name}
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
                );
              })}
            </React.Fragment>
          ))}
        </nav>
      </aside>
      {/* Main Content Area */}
      <div className={mainWrapperClasses}>
        {/* Top Header */}
        <header className="bg-base-100 shadow-sm border-b border-base-300 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left side - Mobile Menu Toggle & Search */}
            <div className="flex items-center">
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden p-2 rounded-md text-base-content/70 hover:bg-base-200">
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
              <div className="relative ml-2 md:ml-0">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-base-content/50" />
                <input 
                  type="text" 
                  placeholder="Search..." 
                  className="pl-10 pr-4 py-2 bg-base-200 border-none rounded-md focus:ring-1 focus:ring-primary text-sm w-48 sm:w-64"
                />
              </div>
            </div>

            {/* Right side - Icons & Profile */}
            <div className="flex items-center space-x-2 sm:space-x-4">
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
                    className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-md py-1 bg-base-100 border border-base-300 focus:outline-none z-20" // Increased z-index
                    role="menu" 
                    aria-orientation="vertical" 
                    aria-labelledby="user-menu-button" 
                  >
                    <Link 
                      to="/profile" 
                      className="flex items-center px-4 py-2 text-sm text-base-content hover:bg-base-200 hover:text-primary transition-colors" 
                      role="menuitem"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <User className="h-4 w-4 mr-2" />
                      Your Profile
                    </Link>
                    <Link 
                      to="/account-settings" 
                      className="flex items-center px-4 py-2 text-sm text-base-content hover:bg-base-200 hover:text-primary transition-colors" 
                      role="menuitem"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Account Settings
                    </Link>
                    <button 
                      onClick={() => {
                        setIsProfileMenuOpen(false);
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
        
        {/* Mobile Sidebar */}
        {isMobileMenuOpen && (
          <aside className="md:hidden bg-base-100 border-r border-base-300 p-4 space-y-2 fixed inset-y-0 left-0 z-10 w-64 transform transition-transform ease-in-out duration-300">
             <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <Shield className="h-8 w-8 text-primary mr-2" />
                <span className="text-xl font-bold text-primary">Wheel99</span>
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 rounded-md text-base-content/70 hover:bg-base-200">
                <X className="h-6 w-6" />
              </button>
            </div>
            <nav className="flex-1 space-y-1">
              {navigation.map((item) => (
                // Simplified rendering for mobile, assuming no nested children shown directly in mobile flyout
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`${
                    location.pathname === item.href
                      ? 'bg-base-200 text-primary'
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
                </Link>
              ))}
            </nav>
          </aside>
        )}

        {/* Page Content */}
        <main className={mainContentClasses}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
