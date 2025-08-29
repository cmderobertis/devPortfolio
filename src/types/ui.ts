// UI and component type definitions

import { ReactNode, CSSProperties } from 'react';

// Theme system types
export interface ThemeConfig {
  name: string;
  colors: ColorScheme;
  typography: TypographyConfig;
  spacing: SpacingConfig;
  breakpoints: BreakpointConfig;
  animations: AnimationConfig;
  shadows: ShadowConfig;
}

export interface ColorScheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  error: string;
  warning: string;
  success: string;
  info: string;
  text: {
    primary: string;
    secondary: string;
    disabled: string;
    inverse: string;
  };
  border: string;
  divider: string;
}

export interface TypographyConfig {
  fontFamily: {
    primary: string;
    monospace: string;
    display: string;
  };
  fontSize: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
  };
  fontWeight: {
    light: number;
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
  };
  lineHeight: {
    tight: number;
    normal: number;
    relaxed: number;
  };
}

export interface SpacingConfig {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  '4xl': string;
}

export interface BreakpointConfig {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
}

export interface AnimationConfig {
  duration: {
    fast: string;
    normal: string;
    slow: string;
  };
  easing: {
    linear: string;
    ease: string;
    easeIn: string;
    easeOut: string;
    easeInOut: string;
  };
}

export interface ShadowConfig {
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

// Component prop types
export interface ComponentProps {
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  id?: string;
  'data-testid'?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
  role?: string;
}

export interface ButtonProps extends ComponentProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  onClick?: (event: React.MouseEvent) => void;
  type?: 'button' | 'submit' | 'reset';
  fullWidth?: boolean;
}

export interface CardProps extends ComponentProps {
  variant?: 'default' | 'outlined' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
  clickable?: boolean;
  onClick?: () => void;
}

export interface ContainerProps extends ComponentProps {
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: boolean;
  center?: boolean;
}

export interface LayoutProps extends ComponentProps {
  direction?: 'row' | 'column';
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  wrap?: boolean;
}

// Navigation types
export interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon?: ReactNode;
  badge?: string | number;
  disabled?: boolean;
  children?: NavigationItem[];
}

export interface NavigationProps extends ComponentProps {
  items: NavigationItem[];
  currentPath: string;
  orientation?: 'horizontal' | 'vertical';
  variant?: 'default' | 'pills' | 'underline';
  onNavigate?: (item: NavigationItem) => void;
}

// Form component types
export interface InputProps extends ComponentProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  error?: string;
  label?: string;
  helperText?: string;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
}

export interface CheckboxProps extends ComponentProps {
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  label?: string;
  error?: string;
  size?: 'sm' | 'md' | 'lg';
  onChange?: (checked: boolean) => void;
}

export interface SelectProps extends ComponentProps {
  value?: string | number;
  defaultValue?: string | number;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  label?: string;
  helperText?: string;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  options: SelectOption[];
  onChange?: (value: string | number) => void;
}

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  group?: string;
}

// Modal and overlay types
export interface ModalProps extends ComponentProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closable?: boolean;
  footer?: ReactNode;
  centered?: boolean;
}

export interface TooltipProps extends ComponentProps {
  content: ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  trigger?: 'hover' | 'click' | 'focus';
  disabled?: boolean;
  delay?: number;
}

// Interactive component types
export interface SliderProps extends ComponentProps {
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  label?: string;
  showValue?: boolean;
  marks?: SliderMark[];
  onChange?: (value: number) => void;
}

export interface SliderMark {
  value: number;
  label?: string;
}

export interface TabsProps extends ComponentProps {
  activeTab: string;
  tabs: Tab[];
  variant?: 'default' | 'pills' | 'underline';
  orientation?: 'horizontal' | 'vertical';
  onChange?: (tabId: string) => void;
}

export interface Tab {
  id: string;
  label: string;
  content: ReactNode;
  disabled?: boolean;
  badge?: string | number;
}

// Data display types
export interface TableProps extends ComponentProps {
  columns: TableColumn[];
  data: any[];
  loading?: boolean;
  empty?: ReactNode;
  pagination?: boolean;
  sortable?: boolean;
  selectable?: boolean;
  onRowClick?: (row: any, index: number) => void;
  onSelectionChange?: (selectedRows: any[]) => void;
}

export interface TableColumn {
  id: string;
  header: string;
  accessor: string | ((row: any) => any);
  sortable?: boolean;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, row: any) => ReactNode;
}

// Responsive and accessibility types
export interface ResponsiveValue<T> {
  xs?: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
  '2xl'?: T;
}

export interface AccessibilityProps {
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-expanded'?: boolean;
  'aria-controls'?: string;
  'aria-selected'?: boolean;
  'aria-checked'?: boolean;
  'aria-disabled'?: boolean;
  'aria-hidden'?: boolean;
  'aria-live'?: 'polite' | 'assertive' | 'off';
  'aria-atomic'?: boolean;
  'aria-relevant'?: string;
  role?: string;
  tabIndex?: number;
}

// Animation and transition types
export interface TransitionProps {
  in?: boolean;
  duration?: number;
  delay?: number;
  easing?: string;
  onEnter?: () => void;
  onExit?: () => void;
  onEntered?: () => void;
  onExited?: () => void;
}

export interface AnimationProps {
  animate?: boolean;
  initial?: Record<string, any>;
  animate?: Record<string, any>;
  exit?: Record<string, any>;
  transition?: Record<string, any>;
}

// Event handler types
export type ClickHandler = (event: React.MouseEvent) => void;
export type ChangeHandler<T = string> = (value: T) => void;
export type FocusHandler = (event: React.FocusEvent) => void;
export type KeyboardHandler = (event: React.KeyboardEvent) => void;