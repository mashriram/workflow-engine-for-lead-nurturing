import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/index.css';
import { setupLeadNurturingApplication } from './app-specific/lead-nurturing/functions';
import { ThemeProvider } from './src/components/theme-provider';

// Set up the application-specific functions before the app starts.
// This injects the lead nurturing functions into the generic workflow engine UI hook.
setupLeadNurturingApplication();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
