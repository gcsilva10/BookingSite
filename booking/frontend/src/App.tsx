import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home/Home';
import Navbar from './components/Navbar/Navbar';
import StaffLogin from './pages/StaffLogin/StaffLogin';

export default function App(){
  return (
    <BrowserRouter>
      <Navbar />
      <div style={{ padding: 16, paddingTop: 64 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/staff" element={<StaffLogin />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
