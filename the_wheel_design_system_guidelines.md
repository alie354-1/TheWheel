# The Wheel: Design System & Architecture Guidelines

This document outlines the design system and architecture guidelines for The Wheel MVP implementation, focusing on modularity, reusability, and making it easy to update the look and feel.

## Design System Principles

### 1. Modularity & Reusability

- **Component-Based Design**: Build small, reusable components that can be combined to create complex interfaces.
- **Single Responsibility**: Each component should do one thing and do it well.
- **Composition Over Inheritance**: Prefer composing components together rather than creating complex inheritance hierarchies.
- **Consistent APIs**: Components should have consistent prop interfaces and behavior patterns.

### 2. Themability & Customization

- **Design Token System**: Use design tokens for colors, typography, spacing, etc. that can be easily updated.
- **Theme Provider**: Implement a theme provider that allows for runtime theme switching.
- **Separation of Concerns**: Keep styling separate from component logic.
- **Brand Adaptability**: Make it easy to update logos, colors, and other brand elements.

### 3. Accessibility & Inclusivity

- **WCAG 2.1 AA Compliance**: Ensure all components meet accessibility standards.
- **Keyboard Navigation**: All interactive elements must be keyboard accessible.
- **Screen Reader Support**: Provide appropriate ARIA attributes and semantic HTML.
- **Color Contrast**: Maintain sufficient contrast ratios for text and interactive elements.

### 4. Responsive Design

- **Mobile-First Approach**: Design for mobile first, then enhance for larger screens.
- **Fluid Typography**: Use responsive font sizes that scale with viewport width.
- **Flexible Layouts**: Create layouts that adapt to different screen sizes.
- **Touch-Friendly**: Ensure interactive elements are sized appropriately for touch.

## Design Token System

Design tokens are the visual design atoms of the design system. They're named entities that store visual design attributes.

### Color Tokens

```scss
// Primary colors
--color-primary: #3B82F6;
--color-primary-light: #DBEAFE;
--color-primary-dark: #2563EB;

// Secondary colors
--color-secondary: #10B981;
--color-secondary-light: #D1FAE5;
--color-secondary-dark: #059669;

// Neutral colors
--color-background: #FFFFFF;
--color-background-alt: #F9FAFB;
--color-text: #1F2937;
--color-text-light: #6B7280;
--color-border: #E5E7EB;

// Semantic colors
--color-success: #10B981;
--color-warning: #F59E0B;
--color-error: #EF4444;
--color-info: #3B82F6;
```

### Typography Tokens

```scss
// Font families
--font-family-body: 'Inter', system-ui, sans-serif;
--font-family-heading: 'Inter', system-ui, sans-serif;
--font-family-mono: 'Roboto Mono', monospace;

// Font sizes
--font-size-xs: 0.75rem;
--font-size-sm: 0.875rem;
--font-size-md: 1rem;
--font-size-lg: 1.125rem;
--font-size-xl: 1.25rem;
--font-size-2xl: 1.5rem;
--font-size-3xl: 1.875rem;
--font-size-4xl: 2.25rem;

// Font weights
--font-weight-normal: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;

// Line heights
--line-height-tight: 1.25;
--line-height-normal: 1.5;
--line-height-loose: 1.75;
```

### Spacing Tokens

```scss
--spacing-0: 0;
--spacing-1: 0.25rem;
--spacing-2: 0.5rem;
--spacing-3: 0.75rem;
--spacing-4: 1rem;
--spacing-5: 1.25rem;
--spacing-6: 1.5rem;
--spacing-8: 2rem;
--spacing-10: 2.5rem;
--spacing-12: 3rem;
--spacing-16: 4rem;
--spacing-20: 5rem;
--spacing-24: 6rem;
--spacing-32: 8rem;
```

### Border & Shadow Tokens

```scss
// Borders
--border-width-thin: 1px;
--border-width-medium: 2px;
--border-width-thick: 4px;
--border-radius-sm: 0.125rem;
--border-radius-md: 0.25rem;
--border-radius-lg: 0.5rem;
--border-radius-xl: 1rem;
--border-radius-full: 9999px;

// Shadows
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
```

## Component Library Structure

The component library should be structured in a way that promotes reusability and composition.

### 1. Atoms (Basic Building Blocks)

- Button
- Input
- Checkbox
- Radio
- Select
- Switch
- Icon
- Text
- Heading
- Link
- Badge
- Avatar
- Spinner

### 2. Molecules (Combinations of Atoms)

- Form Field (Label + Input + Error Message)
- Search Bar (Input + Button)
- Card (Container + Heading + Text + Actions)
- Alert (Icon + Text + Close Button)
- Tooltip (Trigger + Content)
- Modal (Overlay + Container + Header + Body + Footer)
- Dropdown (Trigger + Menu)
- Tabs (Tab List + Tab + Tab Panel)

### 3. Organisms (Complex UI Patterns)

- Navigation (Logo + Links + User Menu)
- Form (Multiple Form Fields + Submit Button)
- Table (Header + Rows + Pagination)
- List (Header + Items + Actions)
- Step Indicator (Multiple Steps + Progress)
- Journey Map (Phases + Steps + Indicators)
- Idea Canvas (Multiple Sections + Inputs)
- Task List (Header + Tasks + Filters)

### 4. Templates (Page Layouts)

- Dashboard Layout
- Authentication Layout
- Journey Step Layout
- Idea Hub Layout
- Settings Layout
- Admin Layout

## Implementation Guidelines

### 1. Component Structure

Each component should follow a consistent structure:

```tsx
// Button.tsx
import React from 'react';
import { cn } from '@/lib/utils';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'link' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    variant = 'primary', 
    size = 'md', 
    isLoading = false, 
    leftIcon, 
    rightIcon, 
    className, 
    children, 
    disabled, 
    ...props 
  }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-medium transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-offset-2',
          {
            'primary': 'bg-primary text-white hover:bg-primary-dark',
            'secondary': 'bg-secondary text-white hover:bg-secondary-dark',
            'outline': 'border border-gray-300 bg-transparent hover:bg-gray-50',
            'ghost': 'bg-transparent hover:bg-gray-50',
            'link': 'bg-transparent underline hover:no-underline',
            'danger': 'bg-error text-white hover:bg-error-dark',
          }[variant],
          {
            'sm': 'px-3 py-1.5 text-sm rounded',
            'md': 'px-4 py-2 text-base rounded-md',
            'lg': 'px-6 py-3 text-lg rounded-lg',
          }[size],
          isLoading && 'opacity-70 cursor-not-allowed',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
        disabled={isLoading || disabled}
        {...props}
      >
        {isLoading && <Spinner className="mr-2" size="sm" />}
        {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
        {children}
        {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
```

### 2. Theme Implementation

Create a theme provider that allows for easy theme switching:

```tsx
// ThemeProvider.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { lightTheme, darkTheme } from './themes';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: typeof lightTheme;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>('system');
  const [theme, setTheme] = useState(lightTheme);
  
  useEffect(() => {
    // Load saved preference
    const savedMode = localStorage.getItem('theme-mode') as ThemeMode | null;
    if (savedMode) {
      setMode(savedMode);
    }
  }, []);
  
  useEffect(() => {
    // Save preference
    localStorage.setItem('theme-mode', mode);
    
    // Determine theme
    if (mode === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(isDark ? darkTheme : lightTheme);
    } else {
      setTheme(mode === 'dark' ? darkTheme : lightTheme);
    }
  }, [mode]);
  
  return (
    <ThemeContext.Provider value={{ theme, mode, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
```

### 3. CSS Variables Integration

Apply theme tokens as CSS variables:

```tsx
// ThemeInjector.tsx
import { useTheme } from './ThemeProvider';
import { useEffect } from 'react';

export const ThemeInjector = () => {
  const { theme, mode } = useTheme();
  
  useEffect(() => {
    // Set data-theme attribute
    document.documentElement.setAttribute('data-theme', mode);
    
    // Set CSS variables
    Object.entries(theme.colors).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--color-${key}`, value);
    });
    
    Object.entries(theme.fonts).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--font-${key}`, value);
    });
    
    // ... set other token categories
  }, [theme, mode]);
  
  return null;
};
```

## Microservices Architecture

The application should be built using a microservices approach, with clear separation of concerns and modular components.

### 1. Service Layer

Each domain should have its own service module:

```tsx
// auth.service.ts
import { supabase } from '@/lib/supabase';
import { User, LoginCredentials, SignupCredentials } from '@/types';
import { logger } from '@/lib/logger';

export const authService = {
  async login({ email, password }: LoginCredentials): Promise<User> {
    try {
      logger.info('Attempting login', { email });
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        logger.error('Login failed', { error: error.message });
        throw new Error(error.message);
      }
      
      logger.info('Login successful', { userId: data.user.id });
      return data.user as User;
    } catch (error) {
      logger.error('Login exception', { error });
      throw error;
    }
  },
  
  async signup({ email, password, name }: SignupCredentials): Promise<User> {
    // Implementation
  },
  
  async resetPassword(email: string): Promise<void> {
    // Implementation
  },
  
  async logout(): Promise<void> {
    // Implementation
  },
  
  async getCurrentUser(): Promise<User | null> {
    // Implementation
  }
};
```

### 2. Custom Hooks

Create custom hooks for each service to provide a clean API for components:

```tsx
// useAuth.ts
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/auth.service';
import { useUserStore } from '@/stores/user.store';
import { LoginCredentials, SignupCredentials, User } from '@/types';

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { setUser, clearUser } = useUserStore();
  
  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);
    try {
      const user = await authService.login(credentials);
      setUser(user);
      navigate('/dashboard');
      return user;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [navigate, setUser]);
  
  // Other auth methods...
  
  return {
    isLoading,
    error,
    login,
    // Other methods...
  };
}
```

### 3. State Management

Use Zustand for global state management, with separate stores for different domains:

```tsx
// user.store.ts
import { create } from 'zustand';
import { User } from '@/types';

interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: true }),
  clearUser: () => set({ user: null, isAuthenticated: false }),
}));
```

## File Structure

Organize the codebase by feature/domain rather than by type:

```
src/
  features/
    auth/
      components/
        LoginForm.tsx
        SignupForm.tsx
        PasswordResetForm.tsx
      hooks/
        useAuth.ts
      services/
        auth.service.ts
      types/
        auth.types.ts
      utils/
        auth.utils.ts
      index.ts
    
    journey/
      components/
        JourneyMap.tsx
        StepDetails.tsx
        StepCompletion.tsx
      hooks/
        useJourney.ts
      services/
        journey.service.ts
      types/
        journey.types.ts
      utils/
        journey.utils.ts
      index.ts
    
    ideas/
      components/
        IdeaList.tsx
        IdeaCanvas.tsx
        IdeaStatus.tsx
      hooks/
        useIdeas.ts
      services/
        idea.service.ts
      types/
        idea.types.ts
      utils/
        idea.utils.ts
      index.ts
    
    // Other features...
  
  ui/
    atoms/
      Button.tsx
      Input.tsx
      Checkbox.tsx
      // Other atoms...
    
    molecules/
      FormField.tsx
      Card.tsx
      Modal.tsx
      // Other molecules...
    
    organisms/
      Navigation.tsx
      Table.tsx
      Form.tsx
      // Other organisms...
    
    templates/
      DashboardLayout.tsx
      AuthLayout.tsx
      // Other templates...
    
    theme/
      ThemeProvider.tsx
      ThemeInjector.tsx
      themes.ts
      tokens.ts
  
  lib/
    supabase.ts
    logger.ts
    utils.ts
    // Other utilities...
  
  App.tsx
  main.tsx
```

## Updating Look and Feel

With this architecture, updating the look and feel of the application is straightforward:

1. **Update Theme Tokens**: Modify the color, typography, and other tokens in the theme files.
2. **Replace Logo/Brand Assets**: Update the logo and other brand assets in a single location.
3. **Adjust Component Styles**: If needed, update the component styles to match the new design.

For example, to update the brand colors:

```tsx
// themes.ts
export const lightTheme = {
  colors: {
    // Update primary color from blue to purple
    primary: '#8B5CF6',
    'primary-light': '#EDE9FE',
    'primary-dark': '#6D28D9',
    
    // Update secondary color from green to orange
    secondary: '#F97316',
    'secondary-light': '#FFEDD5',
    'secondary-dark': '#EA580C',
    
    // Other colors...
  },
  // Other tokens...
};
```

## Conclusion

By following these design system and architecture guidelines, The Wheel will be built with modularity, reusability, and easy customization in mind. The component-based approach, combined with a robust theming system and microservices architecture, will make it straightforward to maintain and extend the application over time.

The clear separation of concerns and modular structure will also make it easier to update the look and feel of the application, whether it's changing colors, fonts, or logos, without having to modify multiple files or components.
