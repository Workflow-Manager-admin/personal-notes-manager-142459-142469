import React, { useEffect, useState } from "react";
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
  const [search, setSearch] = useState("");

  // Fetch all notes on mount (and refresh)
  useEffect(() => {
    if (!isAuthenticated) return;
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
    <div style={{
      background: "var(--bg-secondary)",
      padding: "20px",
      borderRadius: 12,
      boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
      minWidth: 290,
      maxWidth: 380
    }}>
      <h2 style={{marginTop:0}}>My Notes</h2>
      <div>
        <input
          type="text"
          placeholder="Search notes..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: "88%",
            padding: 8, borderRadius: 5, border: "1px solid var(--border-color)", marginBottom: 10, marginRight: 6,
            fontSize:15
          }}
        />
        <button
          className="btn"
          onClick={onCreate}
          style={{
            backgroundColor: "var(--button-bg)",
            color: "var(--button-text)",
            border: "none",
            borderRadius: 6,
            padding: "7px 14px",
            marginLeft: 4,
            fontWeight: 500
          }}
        >+ New</button>
      </div>
      {loading
        ? <div>Loading...</div>
        : error
        ? <div style={{color:"red"}}>{error}</div>
        : notes.length === 0
        ? <div style={{color:"#888",margin:"18px 0"}}>No notes found.</div>
        : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0, marginTop: 10}}>
            {notes.map(note => (
              <li key={note.id}
                  style={{
                    background: selectedNoteId === note.id ? "var(--bg-primary)" : "transparent",
                    borderRadius: 6,
                    marginBottom: 8,
                    boxShadow: selectedNoteId === note.id ? "0 0 0 1.5px var(--button-bg)" : "none",
                    padding: "7px 4px 7px 10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent:"space-between"
                  }}>
                <span
                  style={{flexGrow:1, cursor:"pointer", fontWeight:500}}
                  title={note.title}
                  onClick={() => onSelect && onSelect(note)}
                >{note.title.length > 32 ? note.title.slice(0,32)+'…' : note.title}</span>
                <span style={{display:"inline-flex", gap:2}}>
                  <button
                    style={{marginLeft:8, fontSize:14, border:"none", background:"transparent", cursor:"pointer", color:"#2196F3"}}
                    title="View"
                    onClick={() => onSelect && onSelect(note)}
                  >👁</button>
                  <button
                    style={{marginLeft:0, fontSize:14, border:"none", background:"transparent", cursor:"pointer", color:"#FF9800"}}
                    title="Edit"
                    onClick={() => onEdit && onEdit(note)}
                  >✏️</button>
                  <button
                    style={{marginLeft:0, fontSize:14, border:"none", background:"transparent", cursor:"pointer", color:"#f44336"}}
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
