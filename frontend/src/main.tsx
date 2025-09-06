import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { AppContextProvider } from './Context/AppContext.tsx'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 0, // Disable automatic retries on failure
    },
  },
});
createRoot(document.getElementById('root')!).render(
   <React.StrictMode>
   <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <AppContextProvider>
      <App />
    </AppContextProvider>
    </QueryClientProvider>
  </BrowserRouter>
  </React.StrictMode>
)
