import React, { useState } from 'react';
import NavBar from './components/navbar/navbar';
import Sidebar from './components/sidebar/sidebar';
import Dashboard from './pages/dashboard/dashboard';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div>
      <NavBar onHamburgerClick={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar open={sidebarOpen} />
      <Dashboard />
    </div>
  );
}

export default App;