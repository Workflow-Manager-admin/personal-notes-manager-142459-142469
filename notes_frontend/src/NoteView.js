import React, { useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { noteDetailApi } from "./api";

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
    noteDetailApi(noteId, token)
      .then(({ data }) => setNote(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [noteId, token]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{color:"red"}}>{error}</div>;
  if (!note) return <div>Note not found.</div>;

  return (
    <div
      style={{
        background: "var(--bg-secondary)",
        borderRadius: 16,
        padding: "30px 28px 25px 28px",
        boxShadow: "var(--shadow)",
        minWidth: 280,
        maxWidth: 560,
        marginTop: 14,
        marginBottom: 15,
        textAlign: "left"
      }}
    >
      <button
        onClick={onBack}
        className="secondary"
        style={{
          marginBottom: 13,
          background: "none",
          color: "var(--primary)",
          fontWeight: 600,
          borderColor: "var(--primary)",
          fontSize: "15.8px",
          padding: "6px 18px"
        }}
      >
        &larr; Back
      </button>
      <h2 style={{ wordBreak: "break-word", color: "var(--primary)", marginBottom: 0 }}>
        {note.title}
      </h2>
      <div
        style={{
          whiteSpace: "pre-wrap",
          margin: "16px 0 10px 0",
          textAlign: "left",
          lineHeight: "1.53",
          fontSize: "17.5px",
          color: "var(--text-primary)"
        }}
      >
        {note.content}
      </div>
      <div style={{ fontSize: "13.5px", color: "var(--hint)", margin: "8px 0 14px" }}>
        <span>
          Created: {note.created_at ? new Date(note.created_at).toLocaleString() : "?"}
        </span>
        <br />
        <span>
          Updated: {note.updated_at ? new Date(note.updated_at).toLocaleString() : "?"}
        </span>
      </div>
      <button
        className="accent"
        style={{
          background: "var(--accent)",
          color: "var(--secondary)",
          fontWeight: 700,
          padding: "9px 26px",
          fontSize: "16.5px",
        }}
        onClick={() => onEdit(note)}
      >
        Edit
      </button>
    </div>
  );
}
