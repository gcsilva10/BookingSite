import React, { useMemo } from 'react';
import './Home.css';

export default function Home() {
  const isStaff = useMemo(() => {
    return Boolean(localStorage.getItem('access_token'));
  }, []);

  return (
    <div className="page-home">
      <h1>{isStaff ? 'Couraça Booking - staff' : 'Couraça Booking'}</h1>
      <p>Bem-vindo. Escolhe uma ação no menu.</p>
    </div>
  );
}
