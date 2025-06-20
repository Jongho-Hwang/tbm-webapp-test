// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';

import './index.css';      // 전역 스타일
import App from './App.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
