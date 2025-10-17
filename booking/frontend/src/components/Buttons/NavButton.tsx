import React from 'react';
import { Link } from 'react-router-dom';

type NavButtonProps = {
  text: string;
  width?: number | string;
  to?: string;
  onClick?: () => void;
};

/**
 * Navigation button component - used in the Navbar
 * Can be a link (if 'to' prop is provided) or a button (if 'onClick' is provided)
 */
export default function NavButton({ text, width, to, onClick }: NavButtonProps) {
  const style: React.CSSProperties = width 
    ? { width: typeof width === 'number' ? `${width}px` : width, textAlign: 'center' } 
    : { textAlign: 'center' };
  
  if (to) {
    return (
      <Link className="nav-btn" to={to} style={style}>
        {text}
      </Link>
    );
  }
  
  return (
    <button className="nav-btn" onClick={onClick} style={style}>
      {text}
    </button>
  );
}
