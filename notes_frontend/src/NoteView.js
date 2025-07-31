import React, { useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

/**
 * NoteView
 * Shows the note's details.
 *
 * Props:
 *   noteId: number (required)
 *   onBack: function to go back to the list
 *   onEdit: function to go to editor
 */
 // PUBLIC_INTERFACE
export default function NoteView({ noteId, onBack, onEdit }) {
  const { token } = useAuth();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!noteId || !token) return;
    setLoading(true);
    setError("");
    fetch(`/api/notes/${noteId}/`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(async resp => {
      if (!resp.ok) throw new Error("Failed to fetch note");
      return await resp.json();
    })
    .then(setNote)
    .catch(err => setError(err.message))
    .finally(() => setLoading(false));
  }, [noteId, token]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{color:"red"}}>{error}</div>;
  if (!note) return <div>Note not found.</div>;

  return (
    <div style={{background:"var(--bg-secondary)",borderRadius:10,padding:20,boxShadow:"0 2px 8px rgba(0,0,0,0.03)",minWidth:320, maxWidth:600}}>
      <button onClick={onBack} style={{marginBottom:12,background:"none",border:"none",color:"#1976d2",cursor:"pointer",fontWeight:500}}>&larr; Back</button>
      <h2 style={{wordBreak:"break-word"}}>{note.title}</h2>
      <div style={{whiteSpace:"pre-wrap",margin:"14px 0",textAlign:"left",lineHeight:"1.45",fontSize:"17px"}}>{note.content}</div>
      <div style={{fontSize:"13px", color:"#888", margin:"16px 0 8px"}}>
        <span>Created: {note.created_at ? new Date(note.created_at).toLocaleString() : "?"}</span>
        <br/>
        <span>Updated: {note.updated_at ? new Date(note.updated_at).toLocaleString() : "?"}</span>
      </div>
      <button
        style={{
          background:"var(--button-bg)",
          color:"var(--button-text)",border:"none",padding:"8px 18px",borderRadius:7,marginTop:8,fontWeight:600,cursor:"pointer"
        }}
        onClick={() => onEdit(note)}
      >Edit</button>
    </div>
  );
}
