import React from 'react';
import { Link } from 'react-router-dom';

type NavButtonProps = {
  text: string;
  width?: number | string;
  to?: string;
  onClick?: () => void;
};

export default function NavButton({ text, width, to, onClick }: NavButtonProps) {
  const style: React.CSSProperties = width ? { width: typeof width === 'number' ? `${width}px` : width, textAlign: 'center' } : { textAlign: 'center' };
  if (to) {
    return (
      <Link className="nav-btn" to={to} style={style}>{text}</Link>
    );
  }
  return (
    <button className="nav-btn" onClick={onClick} style={style}>{text}</button>
  );
}


