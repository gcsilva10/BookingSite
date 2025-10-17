import React from 'react';
import './Button.css';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'cancel';

type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: ButtonVariant;
  disabled?: boolean;
  className?: string;
};

/**
 * Reusable button component with different variants
 * - primary: Yellow background (default style)
 * - secondary: Gray background
 * - danger: Red background (for delete actions)
 * - success: Green background (for confirm actions)
 * - cancel: Light gray background
 */
export default function Button({ 
  children, 
  onClick, 
  type = 'button', 
  variant = 'primary',
  disabled = false,
  className = ''
}: ButtonProps) {
  return (
    <button 
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-${variant} ${className}`}
    >
      {children}
    </button>
  );
}
