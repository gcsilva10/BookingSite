import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home/Home';
import Navbar from './components/Navbar/Navbar';
import StaffLogin from './pages/StaffLogin/StaffLogin';
import StaffUsers from './pages/StaffUsers/StaffUsers';
import StaffTables from './pages/StaffTables/StaffTables';
import StaffReservations from './pages/StaffReservations/StaffReservations';

export default function App(){
  return (
    <BrowserRouter>
      <Navbar />
      <div style={{ padding: 16, paddingTop: 64 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/staff" element={<StaffLogin />} />
          <Route path="/staff/users" element={<StaffUsers />} />
          <Route path="/staff/tables" element={<StaffTables />} />
          <Route path="/staff/reservations" element={<StaffReservations />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
