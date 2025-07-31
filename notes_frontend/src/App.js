import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import { AuthProvider, useAuth } from "./AuthContext";
import Auth from "./Auth";

/**
 * HomeContent: Example app content visible only when authenticated.
 */
function HomeContent({ theme, toggleTheme }) {
  return (
    <div>
      <button
        className="theme-toggle"
        onClick={toggleTheme}
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
      </button>
      <img src={logo} className="App-logo" alt="logo" />
      <p>
        Edit <code>src/App.js</code> and save to reload.
      </p>
      <p>
        Current theme: <strong>{theme}</strong>
      </p>
      <a
        className="App-link"
        href="https://reactjs.org"
        target="_blank"
        rel="noopener noreferrer"
      >
        Learn React
      </a>
      <div style={{marginTop:32,fontWeight:500}}>
        <span role="img" aria-label="lock">🔐</span> Welcome! Only visible when logged in.
      </div>
    </div>
  );
}

// PUBLIC_INTERFACE
function App() {
  const [theme, setTheme] = useState('light');

  // Effect to apply theme to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  // Auth route guard with context:
  function MainApp() {
    const { isAuthenticated } = useAuth();
    return (
      <div className="App">
        <header className="App-header">
          <Auth />
          {isAuthenticated ?
            <HomeContent theme={theme} toggleTheme={toggleTheme} />
            :
            <div style={{marginTop:36, fontWeight:400}}>
              Please log in or register to access your notes.
            </div>
          }
        </header>
      </div>
    );
  }

  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

export default App;
