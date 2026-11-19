import { useState } from "react";
import "./AccessibilitySettings.css";

const storageKey = "blockbot:accessibility";

export function readAccessibilitySettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    return {
      reduceMotion: saved?.reduceMotion === true,
      strongFocus: saved?.strongFocus === true,
    };
  } catch {
    return { reduceMotion: false, strongFocus: false };
  }
}

export function applyAccessibilitySettings(settings) {
  document.documentElement.classList.toggle("bb-reduce-motion", settings.reduceMotion);
  document.documentElement.classList.toggle("bb-strong-focus", settings.strongFocus);
}

export default function AccessibilitySettings() {
  const [settings, setSettings] = useState(readAccessibilitySettings);
  const [message, setMessage] = useState("");

  function changeSetting(event) {
    const { name, checked } = event.target;
    const next = { ...settings, [name]: checked };

    setSettings(next);
    applyAccessibilitySettings(next);

    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
      setMessage("Preferences saved on this browser.");
    } catch {
      setMessage("Preferences applied for this visit.");
    }
  }

  return (
    <section className="bb-settings" aria-labelledby="accessibility-title">
      <h1 id="accessibility-title">Accessibility settings</h1>

      <label>
        <input
          type="checkbox"
          name="reduceMotion"
          checked={settings.reduceMotion}
          onChange={changeSetting}
        />
        Reduce interface animations
      </label>

      <label>
        <input
          type="checkbox"
          name="strongFocus"
          checked={settings.strongFocus}
          onChange={changeSetting}
        />
        Highlight keyboard focus
      </label>

      <p role="status">{message}</p>
    </section>
  );
}