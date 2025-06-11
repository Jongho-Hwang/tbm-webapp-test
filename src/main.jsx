import React from 'react';
import ReactDOM from 'react-dom/client';

/* index.css를 맨 위에서 import 해야 Tailwind/PostCSS가 동작합니다 */
import './index.css';

import App from './App.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode><App /></React.StrictMode>
);
