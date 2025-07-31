import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "./AuthContext";

/**
 * NotesList: Lists all notes for the authenticated user.
 * Allows viewing, editing, deleting, and creating new notes.
 * Relies on /api/notes/ endpoints in backend, and passes token for auth.
 *
 * Props:
 *   onSelect(note): called when note "view" is chosen
 *   onEdit(note): called when note "edit" is chosen
 *   onCreate(): called when "new note" is chosen
 */
// PUBLIC_INTERFACE
export default function NotesList({ onSelect, onEdit, onCreate, selectedNoteId }) {
  const { token, isAuthenticated } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Make search text controlled (with debounce for better UX)
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const searchRef = useRef();

  // Debounce search input -- update `search` state only ~350ms after user pauses typing
  useEffect(() => {
    if (searchRef.current) clearTimeout(searchRef.current);
    searchRef.current = setTimeout(() => {
      setSearch(searchInput.trim());
    }, 350);
    return () => clearTimeout(searchRef.current);
  }, [searchInput]);

  // Fetch all notes on mount (and whenever search changes)
  useEffect(() => {
    if (!isAuthenticated) {
      setNotes([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    fetch(`/api/notes/?search=${encodeURIComponent(search)}`, {
      headers: { "Authorization": `Bearer ${token}` },
    })
      .then(async resp => {
        if (!resp.ok) {
          throw new Error("Failed to fetch notes");
        }
        return await resp.json();
      })
      .then(data => {
        setNotes(data);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [token, isAuthenticated, search]);

  // Handler for deleting a note
  const handleDelete = async (noteId) => {
    if (!window.confirm("Delete this note permanently?")) return;
    try {
      const resp = await fetch(`/api/notes/${noteId}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!resp.ok && resp.status !== 204) throw new Error("Failed to delete note");
      setNotes(notes => notes.filter(n => n.id !== noteId));
      if (onSelect && selectedNoteId === noteId) onSelect(null);
    } catch (err) {
      setError(err.message || "Delete failed");
    }
  };

  return (
    <div
      style={{
        background: "transparent",
        padding: "24px 10px 16px 18px",
        borderRadius: 0,
        minWidth: 0,
        width: "100%",
        maxWidth: 350,
        boxShadow: "none",
      }}
    >
      <h2 style={{ marginTop: 5, marginBottom: 10, color: "var(--accent)", letterSpacing:"0.03em" }}>My Notes</h2>
      <div>
        <input
          type="text"
          placeholder="Search notes by title/content..."
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          style={{
            width: "76%",
            padding: "8px 8px",
            borderRadius: 6,
            border: "1.1px solid var(--border-color)",
            background: "var(--input-bg)",
            marginBottom: 8,
            marginRight: 7,
            fontSize: 15
          }}
          aria-label="Search notes"
        />
        <button
          className="accent"
          onClick={onCreate}
          style={{
            backgroundColor: "var(--accent)",
            color: "var(--secondary)",
            fontWeight: 700,
            padding: "8px 16px",
            fontSize: "15px",
            borderRadius: "8px",
            border: "none",
            marginLeft: 3,
          }}
        >
          + New
        </button>
      </div>
      {loading
        ? <div style={{ margin: "19px 0" }}>Loading...</div>
        : error
          ? <div style={{ color: "#e53935", margin: "11px 0" }}>{error}</div>
          : notes.length === 0
            ? <div style={{ color: "var(--hint)", margin: "22px 0" }}>No notes found.</div>
            : (
              <ul style={{ listStyle: "none", padding: 0, margin: 0, marginTop: 13 }}>
                {notes.map(note => (
                  <li
                    key={note.id}
                    style={{
                      background: selectedNoteId === note.id ? "#e3f2fd" : "transparent",
                      borderRadius: 7,
                      marginBottom: 7,
                      boxShadow: selectedNoteId === note.id ? "0 0 0 2px var(--primary)" : "none",
                      padding: "7px 5px 7px 12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      cursor: "pointer"
                    }}
                  >
                    <span
                      style={{
                        flexGrow: 1,
                        fontWeight: selectedNoteId === note.id ? 700 : 500,
                        color: selectedNoteId === note.id ? "var(--primary)" : "#fffde7",
                        letterSpacing:"0.01em"
                      }}
                      title={note.title}
                      onClick={() => onSelect && onSelect(note)}
                    >
                      {note.title.length > 32 ? note.title.slice(0, 32) + '…' : note.title}
                    </span>
                    <span style={{ display: "inline-flex", gap: 2 }}>
                      <button
                        style={{
                          marginLeft: 8,
                          fontSize: "15px",
                          border: "none",
                          background: "transparent",
                          cursor: "pointer",
                          color: "var(--primary)"
                        }}
                        title="View"
                        onClick={() => onSelect && onSelect(note)}
                      >👁</button>
                      <button
                        style={{
                          marginLeft: 0,
                          fontSize: "15px",
                          border: "none",
                          background: "transparent",
                          cursor: "pointer",
                          color: "var(--accent)"
                        }}
                        title="Edit"
                        onClick={() => onEdit && onEdit(note)}
                      >✏️</button>
                      <button
                        style={{
                          marginLeft: 0,
                          fontSize: "15px",
                          border: "none",
                          background: "transparent",
                          cursor: "pointer",
                          color: "#e53935"
                        }}
                        title="Delete"
                        onClick={() => handleDelete(note.id)}
                      >🗑️</button>
                    </span>
                  </li>
                ))}
              </ul>
            )
      }
    </div>
  );
}
