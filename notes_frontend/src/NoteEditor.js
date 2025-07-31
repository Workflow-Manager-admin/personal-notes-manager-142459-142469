import React, { useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

/**
 * NoteEditor
 * Handles creating and editing a note.
 *
 * Props:
 *   note: object (if editing), or null for creating new
 *   onSave: function(newOrUpdatedNote) called after save
 *   onCancel: function called to cancel editing/creating
 */
 // PUBLIC_INTERFACE
export default function NoteEditor({ note, onSave, onCancel }) {
  const { token } = useAuth();

  const [form, setForm] = useState({
    title: note?.title || "",
    content: note?.content || ""
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setForm({title: note?.title||"", content: note?.content||""});
    setError("");
  }, [note]);

  const handleChange = e => {
    setForm(f => ({...f, [e.target.name]: e.target.value}));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        title: form.title.trim(),
        content: form.content.trim()
      };
      let resp, data;
      if (note && note.id) {
        resp = await fetch(`/api/notes/${note.id}/`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      } else {
        resp = await fetch("/api/notes/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      }
      if (!resp.ok) {
        const errText = await resp.text();
        throw new Error("Failed to save note" + (errText ? ": "+errText : ""));
      }
      data = await resp.json();
      onSave && onSave(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        background: "var(--bg-secondary)",
        borderRadius: 16,
        padding: "30px 28px 25px 28px",
        boxShadow: "var(--shadow)",
        minWidth: 280,
        maxWidth: 560,
        marginTop: 12,
        marginBottom: 18,
      }}
    >
      <form onSubmit={handleSubmit}>
        <h2 style={{ marginTop: 0, color: "var(--primary)" }}>
          {note && note.id ? "Edit Note" : "New Note"}
        </h2>
        <label>
          Title:<br />
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            maxLength={200}
            required
            autoFocus
            style={{
              width: "100%",
              margin: "7px 0 14px 0",
            }}
          />
        </label>
        <label>
          Content:<br />
          <textarea
            name="content"
            value={form.content}
            onChange={handleChange}
            required
            minLength={1}
            rows={10}
            style={{
              width: "100%",
              margin: "8px 0 16px 0",
              resize: "vertical",
              minHeight: 120
            }}
          />
        </label>
        {error && (
          <div style={{ color: "#c62828", marginBottom: 8, fontWeight: 500 }}>
            {error}
          </div>
        )}
        <button
          type="submit"
          disabled={saving}
          className="accent"
          style={{
            background: "var(--accent)",
            color: "var(--secondary)",
            fontWeight: 700,
            padding: "9px 26px",
            fontSize: "16.5px",
            marginRight: 9,
          }}
        >
          {saving ? "Saving..." : note && note.id ? "Save Changes" : "Create Note"}
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={onCancel}
          className="secondary"
          style={{
            padding: "9px 24px",
            fontSize: "16.2px",
            borderColor: "var(--primary)",
            color: "var(--primary)",
            background: "none",
            fontWeight: 500,
          }}
        >
          Cancel
        </button>
      </form>
    </div>
  );
}
