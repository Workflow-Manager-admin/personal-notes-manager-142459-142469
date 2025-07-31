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
    <div style={{background:"var(--bg-secondary)",borderRadius:10,padding:20,boxShadow:"0 2px 8px rgba(0,0,0,0.03)",minWidth:320, maxWidth:600}}>
      <form onSubmit={handleSubmit}>
        <h2 style={{marginTop:0}}>{note && note.id ? "Edit Note" : "New Note"}</h2>
        <label>
          Title:<br/>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            maxLength={200}
            required
            style={{width:"100%",padding:8,margin:"6px 0 16px 0",fontSize:17,borderRadius:6,border:"1px solid var(--border-color)"}}
            autoFocus
          />
        </label>
        <label>
          Content:<br/>
          <textarea
            name="content"
            value={form.content}
            onChange={handleChange}
            required
            minLength={1}
            rows={8}
            style={{width:"100%",padding:8,margin:"8px 0 18px 0",fontSize:16,borderRadius:6,border:"1px solid var(--border-color)"}}
          />
        </label>
        {error && <div style={{color:"red",marginBottom:6}}>{error}</div>}
        <button type="submit"
                disabled={saving}
                style={{
                  background:"var(--button-bg)",color:"var(--button-text)",
                  border:"none",borderRadius:7,padding:"8px 22px",fontWeight:500,cursor:"pointer",marginRight:10
                }}>
          {saving ? "Saving..." : (note && note.id ? "Save Changes" : "Create Note")}
        </button>
        <button type="button"
                disabled={saving}
                onClick={onCancel}
                style={{
                  background:"none", color:"#424242", border:"1.2px solid #bbb", borderRadius:7, padding:"7.5px 18px",fontWeight:400, cursor:"pointer"
                }}>
          Cancel
        </button>
      </form>
    </div>
  );
}
