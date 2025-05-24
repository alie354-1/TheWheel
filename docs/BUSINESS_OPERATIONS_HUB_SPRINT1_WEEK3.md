# Business Operations Hub: Sprint 1 - Week 3

## Week 3: UI Component Library & Admin Tools

### Day 1-2: UI Component Library Foundation

**Tasks:**

1. **Domain-specific UI constants**
   - Create theme constants for domain-specific styling:
   ```typescript
   // src/business-ops-hub/styles/theme.ts
   
   export const colors = {
     primary: '#2563eb',
     secondary: '#4b5563',
     success: '#10b981',
     warning: '#f59e0b',
     danger: '#ef4444',
     info: '#3b82f6',
     light: '#f9fafb',
     dark: '#111827',
     muted: '#6b7280',
     white: '#ffffff',
     black: '#000000',
     gray: {
       50: '#f9fafb',
       100: '#f3f4f6',
       200: '#e5e7eb',
       300: '#d1d5db',
       400: '#9ca3af',
       500: '#6b7280',
       600: '#4b5563',
       700: '#374151',
       800: '#1f2937',
       900: '#111827'
     }
   };
   
   export const spacing = {
     px: '1px',
     0: '0',
     0.5: '0.125rem',
     1: '0.25rem',
     1.5: '0.375rem',
     2: '0.5rem',
     2.5: '0.625rem',
     3: '0.75rem',
     3.5: '0.875rem',
     4: '1rem',
     5: '1.25rem',
     6: '1.5rem',
     8: '2rem',
     10: '2.5rem',
     12: '3rem',
     16: '4rem',
     20: '5rem',
     24: '6rem',
     32: '8rem',
     40: '10rem',
     48: '12rem',
     56: '14rem',
     64: '16rem'
   };
   
   export const typography = {
     fontFamily: {
       sans: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
       serif: 'Georgia, Cambria, "Times New Roman", Times, serif',
       mono: 'Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
     },
     fontSize: {
       xs: '0.75rem',
       sm: '0.875rem',
       base: '1rem',
       lg: '1.125rem',
       xl: '1.25rem',
       '2xl': '1.5rem',
       '3xl': '1.875rem',
       '4xl': '2.25rem',
       '5xl': '3rem',
       '6xl': '3.75rem'
     },
     fontWeight: {
       hairline: 100,
       thin: 200,
       light: 300,
       normal: 400,
       medium: 500,
       semibold: 600,
       bold: 700,
       extrabold: 800,
       black: 900
     },
     lineHeight: {
       none: 1,
       tight: 1.25,
       snug: 1.375,
       normal: 1.5,
       relaxed: 1.625,
       loose: 2
     }
   };
   
   export const shadows = {
     sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
     md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
     lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
     xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
     '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
     inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
     outline: '0 0 0 3px rgba(66, 153, 225, 0.5)',
     none: 'none'
   };
   
   export const borderRadius = {
     none: '0',
     sm: '0.125rem',
     md: '0.375rem',
     lg: '0.5rem',
     xl: '0.75rem',
     '2xl': '1rem',
     '3xl': '1.5rem',
     full: '9999px'
   };
   
   export const transitions = {
     fast: 'all 100ms ease-in-out',
     normal: 'all 150ms ease-in-out',
     slow: 'all 300ms ease-in-out'
   };
   ```

2. **Navigation and layout components**
   - Implement navigation sidebar component:
   ```typescript
   // src/business-ops-hub/components/layout/SideNav.tsx
   
   /**
    * Business Operations Hub
    * 
    * [COPIED FROM]: src/components/layout/Sidebar.tsx
    * [MODIFICATIONS]:
    * - Domain-centric navigation structure
    * - Updated styling to match BOH theming
    * - Added domain filtering capabilities
    */
   
   import React, { useEffect, useState } from 'react';
   import styled from 'styled-components';
   import { Link } from 'react-router-dom';
   import { useDomains } from '../../contexts/DomainContext';
   
   const Nav = styled.nav`
     width: 280px;
     background-color: #ffffff;
     border-right: 1px solid #e5e7eb;
     height: 100vh;
     position: fixed;
     top: 0;
     left: 0;
     display: flex;
     flex-direction: column;
     transition: all 150ms ease-in-out;
   `;
   
   const NavHeader = styled.div`
     padding: 1.5rem;
     border-bottom: 1px solid #e5e7eb;
   `;
   
   const NavTitle = styled.h1`
     font-size: 1.25rem;
     font-weight: 600;
     color: #111827;
     margin: 0;
   `;
   
   const NavSubtitle = styled.div`
     font-size: 0.875rem;
     color: #6b7280;
     margin-top: 0.25rem;
   `;
   
   const NavContent = styled.div`
     flex: 1;
     overflow-y: auto;
     padding: 1rem 0;
   `;
   
   const NavSection = styled.div`
     margin-bottom: 1.5rem;
   `;
   
   const NavSectionTitle = styled.h2`
     font-size: 0.75rem;
     font-weight: 600;
     color: #6b7280;
     text-transform: uppercase;
     letter-spacing: 0.05em;
     padding: 0 1.5rem;
     margin: 0 0 0.5rem 0;
   `;
   
   const NavList = styled.ul`
     list-style: none;
     padding: 0;
     margin: 0;
   `;
   
   const NavItem = styled.li`
     margin: 0;
   `;
   
   const NavLink = styled(Link)<{ active?: boolean; color?: string }>`
     display: flex;
     align-items: center;
     padding: 0.75rem 1.5rem;
     color: ${props => props.active ? '#111827' : '#6b7280'};
     font-weight: ${props => props.active ? '500' : '400'};
     text-decoration: none;
     transition: all 150ms ease-in-out;
     border-left: 3px solid ${props => props.active ? (props.color || '#2563eb') : 'transparent'};
     background-color: ${props => props.active ? '#f9fafb' : 'transparent'};
     
     &:hover {
       background-color: #f9fafb;
       color: #111827;
     }
   `;
   
   const IconWrapper = styled.div`
     display: flex;
     align-items: center;
     justify-content: center;
     width: 1.5rem;
     height: 1.5rem;
     margin-right: 0.75rem;
   `;
   
   const Badge = styled.span<{ color?: string }>`
     display: inline-block;
     font-size: 0.75rem;
     font-weight: 500;
     color: #ffffff;
     background-color: ${props => props.color || '#2563eb'};
     border-radius: 9999px;
     padding: 0.125rem 0.5rem;
     margin-left: auto;
   `;
   
   const NavFooter = styled.div`
     padding: 1rem 1.5rem;
     border-top: 1px solid #e5e7eb;
   `;
   
   const SearchBox = styled.div`
     padding: 0.5rem 1.5rem 1rem;
     position: relative;
   `;
   
   const SearchInput = styled.input`
     width: 100%;
     padding: 0.5rem 0.75rem 0.5rem 2rem;
     font-size: 0.875rem;
     border: 1px solid #e5e7eb;
     border-radius: 0.375rem;
     background-color: #f9fafb;
     
     &:focus {
       outline: none;
       border-color: #2563eb;
       box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
     }
   `;
   
   const SearchIcon = styled.div`
     position: absolute;
     left: 2rem;
     top: 50%;
     transform: translateY(-50%);
     color: #9ca3af;
   `;
   
   interface SideNavProps {
     currentPath: string;
     onNavigate?: () => void;
   }
   
   export const SideNav: React.FC<SideNavProps> = ({ currentPath, onNavigate }) => {
     const { domains, loading } = useDomains();
     const [searchQuery, setSearchQuery] = useState('');
     
     const filteredDomains = domains.filter(domain => 
       domain.name.toLowerCase().includes(searchQuery.toLowerCase()));
     
     return (
       <Nav>
         <NavHeader>
           <NavTitle>Business Operations Hub</NavTitle>
           <NavSubtitle>Organize your business by domain</NavSubtitle>
         </NavHeader>
         
         <SearchBox>
           <SearchIcon>🔍</SearchIcon>
           <SearchInput 
             type="text" 
             placeholder="Search domains..." 
             value={searchQuery}
             onChange={e => setSearchQuery(e.target.value)}
           />
         </SearchBox>
         
         <NavContent>
           <NavSection>
             <NavSectionTitle>Overview</NavSectionTitle>
             <NavList>
               <NavItem>
                 <NavLink to="/business-ops-hub/dashboard" active={currentPath === '/business-ops-hub/dashboard'}>
                   <IconWrapper>📊</IconWrapper>
                   Dashboard
                 </NavLink>
               </NavItem>
               <NavItem>
                 <NavLink to="/business-ops-hub/admin" active={currentPath === '/business-ops-hub/admin'}>
                   <IconWrapper>⚙️</IconWrapper>
                   Admin
                 </NavLink>
               </NavItem>
             </NavList>
           </NavSection>
           
           <NavSection>
             <NavSectionTitle>Domains</NavSectionTitle>
             <NavList>
               {loading ? (
                 <NavItem>Loading domains...</NavItem>
               ) : filteredDomains.length === 0 ? (
                 <NavItem>No domains found</NavItem>
               ) : (
                 filteredDomains.map(domain => (
                   <NavItem key={domain.id}>
                     <NavLink 
                       to={`/business-ops-hub/domains/${domain.id}`} 
                       active={currentPath === `/business-ops-hub/domains/${domain.id}`}
                       color={domain.color}
                     >
                       <IconWrapper>{domain.icon || '📁'}</IconWrapper>
                       {domain.name}
                     </NavLink>
                   </NavItem>
                 ))
               )}
             </NavList>
           </NavSection>
         </NavContent>
         
         <NavFooter>
           <NavLink to="/business-ops-hub/domains/new" active={currentPath === '/business-ops-hub/domains/new'}>
             <IconWrapper>➕</IconWrapper>
             Create New Domain
           </NavLink>
         </NavFooter>
       </Nav>
     );
   };
   ```

   - Create domain dashboard layout component:
   ```typescript
   // src/business-ops-hub/components/layout/DashboardLayout.tsx
   
   import React from 'react';
   import styled from 'styled-components';
   import { SideNav } from './SideNav';
   
   const LayoutContainer = styled.div`
     display: flex;
     min-height: 100vh;
   `;
   
   const MainContent = styled.main`
     flex: 1;
     margin-left: 280px;
     background-color: #f9fafb;
     min-height: 100vh;
   `;
   
   const TopBar = styled.div`
     height: 64px;
     background-color: white;
     border-bottom: 1px solid #e5e7eb;
     padding: 0 1.5rem;
     display: flex;
     align-items: center;
     justify-content: space-between;
   `;
   
   const TopBarTitle = styled.h1`
     font-size: 1.25rem;
     font-weight: 600;
     color: #111827;
     margin: 0;
   `;
   
   const TopBarActions = styled.div`
     display: flex;
     gap: 1rem;
   `;
   
   const ContentArea = styled.div`
     padding: 1.5rem;
   `;
   
   interface DashboardLayoutProps {
     children: React.ReactNode;
     title?: string;
     actions?: React.ReactNode;
     currentPath: string;
   }
   
   export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
     children, 
     title = 'Dashboard', 
     actions,
     currentPath
   }) => {
     return (
       <LayoutContainer>
         <SideNav currentPath={currentPath} />
         <MainContent>
           <TopBar>
             <TopBarTitle>{title}</TopBarTitle>
             {actions && <TopBarActions>{actions}</TopBarActions>}
           </TopBar>
           <ContentArea>
             {children}
           </ContentArea>
         </MainContent>
       </LayoutContainer>
     );
   };
   ```

3. **Domain-specific form components**
   - Create domain form components:
   ```typescript
   // src/business-ops-hub/components/forms/DomainForm.tsx
   
   import React, { useState } from 'react';
   import styled from 'styled-components';
   import { Button } from '../common/Button';
   import { BusinessDomain } from '../../types/domain.types';
   import { validateDomainName, getDomainIcon } from '../../utils/domain-utils';
   
   const FormContainer = styled.div`
     background-color: white;
     border-radius: 0.5rem;
     padding: 1.5rem;
     box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
   `;
   
   const FormTitle = styled.h2`
     font-size: 1.25rem;
     font-weight: 600;
     color: #111827;
     margin: 0 0 1.5rem 0;
   `;
   
   const FormGroup = styled.div`
     margin-bottom: 1.5rem;
   `;
   
   const Label = styled.label`
     display: block;
     font-size: 0.875rem;
     font-weight: 500;
     color: #374151;
     margin-bottom: 0.5rem;
   `;
   
   const Input = styled.input<{ hasError?: boolean }>`
     width: 100%;
     padding: 0.5rem 0.75rem;
     font-size: 0.875rem;
     border: 1px solid ${props => props.hasError ? '#ef4444' : '#d1d5db'};
     border-radius: 0.375rem;
     
     &:focus {
       outline: none;
       border-color: #2563eb;
       box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
     }
   `;
   
   const TextArea = styled.textarea<{ hasError?: boolean }>`
     width: 100%;
     padding: 0.5rem 0.75rem;
     font-size: 0.875rem;
     border: 1px solid ${props => props.hasError ? '#ef4444' : '#d1d5db'};
     border-radius: 0.375rem;
     min-height: 100px;
     resize: vertical;
     
     &:focus {
       outline: none;
       border-color: #2563eb;
       box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
     }
   `;
   
   const ErrorMessage = styled.div`
     color: #ef4444;
     font-size: 0.75rem;
     margin-top: 0.25rem;
   `;
   
   const HelpText = styled.div`
     color: #6b7280;
     font-size: 0.75rem;
     margin-top: 0.25rem;
   `;
   
   const ColorGrid = styled.div`
     display: grid;
     grid-template-columns: repeat(6, 1fr);
     gap: 0.5rem;
     margin-top: 0.5rem;
   `;
   
   const ColorOption = styled.button<{ color: string; selected: boolean }>`
     width: 2rem;
     height: 2rem;
     border-radius: 9999px;
     background-color: ${props => props.color};
     border: 2px solid ${props => props.selected ? 'white' : 'transparent'};
     box-shadow: ${props => props.selected ? `0 0 0 2px #111827` : 'none'};
     cursor: pointer;
     
     &:hover {
       transform: scale(1.05);
     }
     
     &:focus {
       outline: none;
     }
   `;
   
   const IconGrid = styled.div`
     display: grid;
     grid-template-columns: repeat(8, 1fr);
     gap: 0.5rem;
     margin-top: 0.5rem;
   `;
   
   const IconOption = styled.button<{ selected: boolean }>`
     width: 2.5rem;
     height: 2.5rem;
     border-radius: 0.375rem;
     background-color: ${props => props.selected ? '#f3f4f6' : 'white'};
     border: 1px solid ${props => props.selected ? '#2563eb' : '#d1d5db'};
     display: flex;
     align-items: center;
     justify-content: center;
     font-size: 1.25rem;
     cursor: pointer;
     
     &:hover {
       background-color: #f9fafb;
     }
     
     &:focus {
       outline: none;
       border-color: #2563eb;
     }
   `;
   
   const FormActions = styled.div`
     display: flex;
     justify-content: flex-end;
     gap: 1rem;
     margin-top: 2rem;
   `;
   
   const predefinedColors = [
     '#2563eb', // blue
     '#10b981', // green
     '#ef4444', // red
     '#f59e0b', // amber
     '#8b5cf6', // purple
     '#ec4899', // pink
     '#06b6d4', // cyan
     '#6366f1', // indigo
     '#f97316', // orange
     '#14b8a6', // teal
     '#d946ef', // fuchsia
     '#0891b2', // cyan-600
   ];
   
   const predefinedIcons = [
     '📊', '📈', '📉', '📝', '📌', '🔍', 
     '💼', '🛠️', '⚙️', '💰', '📱', '💻', 
     '📧', '🔔', '📄', '📁', '🔒', '🔑'
   ];
   
   interface DomainFormProps {
     initialData?: Partial<BusinessDomain>;
     onSubmit: (domain: Omit<BusinessDomain, 'id' | 'createdAt' | 'updatedAt'>) => void;
     onCancel?: () => void;
     isSubmitting?: boolean;
   }
   
   export const DomainForm: React.FC<DomainFormProps> = ({
     initialData = {},
     onSubmit,
     onCancel,
     isSubmitting = false
   }) => {
     const [name, setName] = useState(initialData.name || '');
     const [description, setDescription] = useState(initialData.description || '');
     const [selectedColor, setSelectedColor] = useState(initialData.color || predefinedColors[0]);
     const [selectedIcon, setSelectedIcon] = useState(
