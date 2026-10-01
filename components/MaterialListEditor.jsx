import { IconX, IconPlus } from "@tabler/icons-react";
import { FILE_META } from "../lib/fileTypes.js";
import "./MaterialListEditor.css";

const TYPE_OPTIONS = Object.keys(FILE_META);

export default function MaterialListEditor({ items, onChange, label }) {
  const list = items || [];

  const updateItem = (idx, field, value) => {
    onChange(list.map((it, i) => (i === idx ? { ...it, [field]: value } : it)));
  };
  const addItem = () => onChange([...list, { name: "", type: "pdf", id: "" }]);
  const removeItem = (idx) => onChange(list.filter((_, i) => i !== idx));

  return (
    <div className="mle">
      {label && <div className="mle-label">{label}</div>}
      {list.map((item, idx) => (
        <div className="mle-row" key={idx}>
          <input className="mle-input mle-input-name" placeholder="File name" value={item.name} onChange={(e) => updateItem(idx, "name", e.target.value)} />
          <select className="mle-select" value={item.type} onChange={(e) => updateItem(idx, "type", e.target.value)}>
            {TYPE_OPTIONS.map((t) => <option key={t} value={t}>{FILE_META[t].label}</option>)}
          </select>
          <input className="mle-input mle-input-id" placeholder="Paste a link (Drive, YouTube, artifact...) or a Drive file ID" value={item.id} onChange={(e) => updateItem(idx, "id", e.target.value)} />
          <button type="button" className="mle-remove" onClick={() => removeItem(idx)} title="Remove"><IconX size={14} stroke={2} /></button>
        </div>
      ))}
      <button type="button" className="mle-add" onClick={addItem}><IconPlus size={14} stroke={2} /> Add file</button>
    </div>
  );
}
