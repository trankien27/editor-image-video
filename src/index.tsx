import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import './App.css';
import ResizePage from './pages/ResizePage';
import ConvertPage from './pages/ConvertPage';
import ComingSoonPage from './pages/ComingSoonPage';

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <BrowserRouter>
    <App>
      <Routes>
        <Route path="/" element={<ResizePage />} />
        <Route path="/resize" element={<ResizePage />} />
        <Route path="/convert" element={<ConvertPage />} />
        <Route path="/compress" element={<ComingSoonPage title="Compress" />} />
        <Route path="/crop" element={<ComingSoonPage title="Crop" />} />
        <Route path="/more" element={<ComingSoonPage title="More Features" />} />
      </Routes>
    </App>
  </BrowserRouter>
);
