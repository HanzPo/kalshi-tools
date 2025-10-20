import { Suspense, lazy } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { LandingPage } from './components/LandingPage';
import './App.css';

const ChartBuilder = lazy(() => import('./pages/ChartBuilder'));
const BetSlipBuilder = lazy(() => import('./pages/BetSlipBuilder'));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="app-loading">Loading...</div>}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/chart" element={<ChartBuilder />} />
          <Route path="/bet-slip" element={<BetSlipBuilder />} />
          <Route path="*" element={<LandingPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
