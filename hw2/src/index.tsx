import React from 'react';
import ReactDOM from 'react-dom/client';
import GameBoard from './components/GameBoard';
import './index.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <GameBoard />
  </React.StrictMode>
);

