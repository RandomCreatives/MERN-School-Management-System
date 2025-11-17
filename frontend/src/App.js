import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Homepage from './pages/Homepage';
import MainDashboard from './pages/MainDashboard';
import HomePage from './pages/dashboard/HomePage';
import AdminDashboardNew from './pages/dashboard/AdminDashboardNew';
import TeachersPortal from './pages/dashboard/TeachersPortal';
import StudentsPortal from './pages/dashboard/StudentsPortal';
import ClassView from './pages/dashboard/ClassView';
import Library from './pages/dashboard/Library';
import Clinic from './pages/dashboard/Clinic';

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<Homepage />} />
        
        {/* Main Dashboard with Sidebar */}
        <Route path="/dashboard/*" element={
          <MainDashboard>
            <Routes>
              <Route path="home" element={<HomePage />} />
              <Route path="admin" element={<AdminDashboardNew />} />
              <Route path="teachers" element={<TeachersPortal />} />
              <Route path="students" element={<StudentsPortal />} />
              <Route path="class/:className" element={<ClassView />} />
              <Route path="library" element={<Library />} />
              <Route path="clinic" element={<Clinic />} />
              <Route path="*" element={<Navigate to="/dashboard/home" />} />
            </Routes>
          </MainDashboard>
        } />

        {/* Fallback */}
        <Route path='*' element={<Navigate to="/" />} />
      </Routes>
    </Router>
  )
}

export default App