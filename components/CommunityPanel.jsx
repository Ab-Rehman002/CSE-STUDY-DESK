import { useState, useEffect, useCallback } from "react";
import { IconPaperclip, IconRefresh, IconX } from "@tabler/icons-react";
import { getCommunityPosts, addCommunityPost, deleteCommunityPost } from "../lib/storage.js";
import { useAdmin } from "./AdminContext.jsx";
import { timeAgo } from "../lib/dateHelpers.js";
import "./CommunityPanel.css";

const MAX_TITLE = 120;
const MAX_URL = 500;
const MAX_AUTHOR = 60;

export default function CommunityPanel({ courseId }) {
  const { isAdmin } = useAdmin();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setResources(await getCommunityPosts(courseId));
    setLoading(false);
  }, [courseId]);

  useEffect(() => { load(); }, [load]);

  const handleAdd = async () => {
    const t = title.trim();
    const u = url.trim();
    if (!t || !u || !isSafeUrl(u)) return;
    setSaving(true);
    try {
      await addCommunityPost({ courseId, title: t, url: u, author: name.trim() });
      setTitle("");
      setUrl("");
      await load();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!isAdmin) return;
    await deleteCommunityPost(id);
    await load();
  };

  return (
    <div className="community-panel">
      <input
        className="community-input community-input-name"
        placeholder="Your name (shown on your posts)"
        value={name}
        maxLength={MAX_AUTHOR}
        onChange={(e) => setName(e.target.value)}
      />

      <div className="community-section-header">
        <span><IconPaperclip size={14} stroke={2} /> Shared Resources</span>
        <button className="community-refresh" onClick={load} title="Refresh"><IconRefresh size={15} stroke={1.75} /></button>
      </div>

      {loading ? (
        <div className="community-empty">Loading…</div>
      ) : resources.length === 0 ? (
        <div className="community-empty">No resources shared yet — be the first!</div>
      ) : (
        <div className="community-list">
          {resources.map((r) => (
            <div className="community-item" key={r.id}>
              <a href={r.url} target="_blank" rel="noopener noreferrer" className="community-item-link">{r.title}</a>
              <div className="community-item-meta">by {r.author} · {timeAgo(new Date(r.created_at).getTime())}</div>
              {isAdmin && (
                <button className="community-delete" onClick={() => handleDelete(r.id)} title="Delete"><IconX size={12} stroke={2.5} /></button>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="community-form">
        <input className="community-input" placeholder="Resource title" value={title} maxLength={MAX_TITLE} onChange={(e) => setTitle(e.target.value)} />
        <input className="community-input" placeholder="Link (Drive, YouTube, etc.)" value={url} maxLength={MAX_URL} onChange={(e) => setUrl(e.target.value)} />
        <button className="community-submit" onClick={handleAdd} disabled={saving}>
          {saving ? "Sharing…" : "+ Share"}
        </button>
      </div>
    </div>
  );
}

function isSafeUrl(value) {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}
