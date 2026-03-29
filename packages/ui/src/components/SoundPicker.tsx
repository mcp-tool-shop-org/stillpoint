import { useState, useEffect } from "react";
import type { SoundCatalog } from "../lib/api.js";

interface Props {
  catalog: SoundCatalog;
  activeSoundIds: Set<string>;
  onAdd: (soundId: string) => void;
}

export function SoundPicker({ catalog, activeSoundIds, onAdd }: Props) {
  const [selectedCategory, setSelectedCategory] = useState(
    catalog.categories[0] ?? "",
  );

  useEffect(() => {
    if (catalog.categories.length > 0 && !catalog.categories.includes(selectedCategory)) {
      setSelectedCategory(catalog.categories[0]);
    }
  }, [catalog.categories]);

  const sounds = catalog.grouped[selectedCategory] ?? [];

  return (
    <div className="sound-picker">
      <select
        className="category-select"
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
      >
        {catalog.categories.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>

      <select
        className="sound-select"
        value=""
        onChange={(e) => {
          if (e.target.value) {
            onAdd(e.target.value);
            e.target.value = "";
          }
        }}
      >
        <option value="">Add a sound...</option>
        {sounds.map((s) => (
          <option
            key={s.id}
            value={s.id}
            disabled={activeSoundIds.has(s.id)}
          >
            {s.name}
            {activeSoundIds.has(s.id) ? " (playing)" : ""}
          </option>
        ))}
      </select>
    </div>
  );
}
