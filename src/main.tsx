import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import './index.css'
import { TRPCProvider } from "@/providers/trpc"
import App from './App.tsx'

// Initialize theme from localStorage
const savedTheme = localStorage.getItem("theme-storage");
if (savedTheme) {
  try {
    const parsed = JSON.parse(savedTheme);
    if (parsed.state?.theme === "dark") {
      document.documentElement.classList.add("dark");
    }
  } catch {
    // ignore
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <TRPCProvider>
        <App />
      </TRPCProvider>
    </BrowserRouter>
  </StrictMode>,
)
