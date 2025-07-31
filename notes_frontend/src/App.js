import React, { useState, useEffect } from 'react';
import './App.css';
import { AuthProvider, useAuth } from "./AuthContext";
import Auth from "./Auth";
import NotesList from "./NotesList";
import NoteView from "./NoteView";
import NoteEditor from "./NoteEditor";

// React Router v6 imports
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
  useLocation,
  useNavigate,
  useParams
} from 'react-router-dom';

/**
 * RequireAuth - Protects nested routes; redirects unauthenticated users to /login.
 */
function RequireAuth({ children }) {
  const { isAuthenticated } = useAuth();
  let location = useLocation();
  if (!isAuthenticated) {
    // Redirect them to the login page, but save the current location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

/**
 * Main layout for note list (sidebar) and main content, 
 * active for all /notes* routes when logged in.
 * Routes nested inside this layout route.
 */
function NotesMainLayout({ theme, toggleTheme }) {
  return (
    <div className="main-layout">
      <aside className="sidebar">
        <NotesList
          onSelect={note => (window.location = `/notes/${note.id}`)}
          onEdit={note => (window.location = `/notes/${note.id}/edit`)}
          onCreate={() => (window.location = "/notes/new")}
          // Note: actual navigation is now route-based, not state-based!
        />
      </aside>
      <main className="main-content">
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          style={{ position: 'absolute', top: 20, right: 22, zIndex: 2 }}
        >
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>
        <Outlet />
      </main>
    </div>
  );
}

// Auth pages wrapper for login/register
function AuthPageWrapper({ mode }) {
  return (
    <div style={{ display: "flex", justifyContent: "center", minHeight: "80vh", alignItems: "flex-start" }}>
      <Auth mode={mode} />
    </div>
  );
}

function NoteEditorPage() {
  // For /notes/:id/edit, /notes/new
  const { id } = useParams();
  const isNew = id === undefined;
  const navigate = useNavigate();

  // We don't have the full note. For editing, fetch; for new, empty.
  const [note, setNote] = useState(null);

  useEffect(() => {
    if (!isNew && id) {
      // Fetch note for editing
      fetch(`/api/notes/${id}/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`
        }
      })
        .then(async resp => {
          if (!resp.ok) throw new Error();
          return await resp.json();
        })
        .then(setNote)
        .catch(() => setNote(null));
    } else {
      setNote(null);
    }
    // eslint-disable-next-line
  }, [id, isNew]);

  const handleSave = (savedNote) => {
    // After saving, go to the note view page
    navigate(`/notes/${savedNote.id}`);
  };

  return (
    <NoteEditor
      note={note}
      onSave={handleSave}
      onCancel={() => (id ? navigate(`/notes/${id}`) : navigate("/notes"))}
    />
  );
}

function NoteViewPage() {
  // For /notes/:id
  const { id } = useParams();
  const navigate = useNavigate();

  // If id is not numeric, show not found
  if (isNaN(Number(id))) return <div>Note not found.</div>;
  return (
    <NoteView
      noteId={id}
      onBack={() => navigate("/notes")}
      onEdit={note => navigate(`/notes/${note.id}/edit`)}
    />
  );
}

function NotesListPage() {
  // "Empty" main content (when no note selected)
  return (
    <div className="empty-note-hint" style={{marginTop:32}}>
      <span>Select a note to view or edit, or create a new one.</span>
    </div>
  );
}

/**
 * App: Main entry point
 */
// PUBLIC_INTERFACE
function App() {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="App">
          <header className="App-header">
            {/* Auth navigation is always available in header */}
            <Auth />
          </header>
          <Routes>
            {/* Auth routes */}
            <Route path="/login" element={<AuthPageWrapper mode="login" />} />
            <Route path="/register" element={<AuthPageWrapper mode="register" />} />

            {/* Notes routes (protected) */}
            <Route
              path="/notes"
              element={
                <RequireAuth>
                  <NotesMainLayout theme={theme} toggleTheme={toggleTheme} />
                </RequireAuth>
              }
            >
              <Route index element={<NotesListPage />} />
              <Route path="new" element={<NoteEditorPage />} />
              <Route path=":id/edit" element={<NoteEditorPage />} />
              <Route path=":id" element={<NoteViewPage />} />
            </Route>

            {/* Redirect everything else:
                /            => /notes  (main entry)
                all others   => /notes  */}
            <Route path="/" element={<Navigate to="/notes" />} />
            <Route path="*" element={<Navigate to="/notes" />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
