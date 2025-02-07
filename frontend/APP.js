import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import TradePage from './pages/TradePage';

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/trade" element={<TradePage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
