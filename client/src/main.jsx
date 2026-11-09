/**
 * App bootstrap: SEO head manager, dark/light theme, toasts and the router.
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { router } from './router.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <ThemeProvider>
        <RouterProvider router={router} />
        {/* Toasts: bottom-center on phones (thumb reach), top-right feel on desktop via default offsets */}
        <Toaster
          position="bottom-center"
          toastOptions={{
            duration: 3500,
            className: '!rounded-xl !text-sm !shadow-lg dark:!bg-slate-800 dark:!text-slate-100',
          }}
        />
      </ThemeProvider>
    </HelmetProvider>
  </React.StrictMode>
);
