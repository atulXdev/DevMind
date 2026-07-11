import { useState } from 'react';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';

function App() {
  const [showConsole, setShowConsole] = useState(false);

  return showConsole ? (
    <Dashboard />
  ) : (
    <LandingPage onLaunch={() => setShowConsole(true)} />
  );
}

export default App;

