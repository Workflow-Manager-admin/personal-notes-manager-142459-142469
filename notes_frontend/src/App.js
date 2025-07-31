import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import { AuthProvider, useAuth } from "./AuthContext";
import Auth from "./Auth";

import NotesList from "./NotesList";
import NoteView from "./NoteView";
import NoteEditor from "./NoteEditor";

/**
 * HomeContent: Main notes UI visible only when authenticated.
 */
function HomeContent({ theme, toggleTheme }) {
  // UI state: "list", "view", "edit", "create"
  const [mode, setMode] = useState("list");
  const [selectedNote, setSelectedNote] = useState(null);

  // When a user clicks on a note to view
  function handleSelectNote(note) {
    setSelectedNote(note);
    setMode("view");
  }
  // When user clicks edit
  function handleEditNote(note) {
    setSelectedNote(note);
    setMode("edit");
  }
  // When user clicks create new
  function handleCreateNote() {
    setSelectedNote(null);
    setMode("create");
  }
  // When save/create is finished
  function handleSaveNote(note) {
    setSelectedNote(note);
    setMode("view");
  }

  // UI Layout: responsive, sidebar for NotesList, right-pane for note view/edit
  return (
    <div className="main-layout">
      <aside className="sidebar">
        <NotesList
          onSelect={handleSelectNote}
          onEdit={handleEditNote}
          onCreate={handleCreateNote}
          selectedNoteId={selectedNote?.id}
        />
      </aside>
      <main className="main-content">
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          style={{position:'absolute',top:20,right:22,zIndex:2}}
        >
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>
        {mode === "view" && selectedNote &&
          <NoteView
            noteId={selectedNote.id}
            onBack={() => setMode("list")}
            onEdit={handleEditNote}
          />
        }
        {mode === "edit" &&
          <NoteEditor
            note={selectedNote}
            onSave={handleSaveNote}
            onCancel={() => setMode(selectedNote?.id ? "view" : "list")}
          />
        }
        {mode === "create" &&
          <NoteEditor
            note={null}
            onSave={handleSaveNote}
            onCancel={() => setMode("list")}
          />
        }
        {mode === "list" && !selectedNote &&
          <div className="empty-note-hint">
            <span>Select a note to view or edit, or create a new one.</span>
          </div>
        }
      </main>
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
