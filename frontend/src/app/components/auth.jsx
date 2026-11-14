import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Logo } from "./ui";

// Rough outline of India as [longitude, latitude]; projected into the SVG below.
const OUTLINE = [
  [73.5, 35.5], [75, 36.8], [77.5, 35.6], [78.8, 34.3], [79, 32.5], [78.5, 31], [80.2, 30.3], [81.2, 30.1],
  [80.1, 28.8], [82, 27.8], [84, 27.3], [86, 26.6], [88.1, 26.4], [88.2, 27.9], [89, 27.4], [90, 28.2],
  [92, 27.8], [94, 28.6], [96, 29.4], [97.2, 28], [95.5, 26.5], [94.8, 25], [93.3, 24], [92.4, 22.8],
  [91.8, 24.2], [90.4, 25.2], [89.8, 26], [89, 25.3], [88.9, 23.5], [89, 22], [87, 21.5], [86.8, 20.5],
  [85.2, 19.5], [84, 18.2], [82.3, 16.8], [80.3, 15.5], [80.1, 13.4], [79.8, 11.5], [79.2, 10.3], [78.2, 8.9],
  [77.5, 8.1], [76.5, 9], [75.8, 11], [74.8, 13], [74, 15], [73.2, 17.5], [72.8, 19.5], [72.8, 21],
  [72.1, 21.2], [70.7, 20.8], [69.2, 22.2], [70.2, 23], [68.3, 23.7], [68.7, 24.3], [70.3, 25.3], [70.1, 27.2],
  [71.8, 27.9], [73.5, 29.8], [74.5, 31.3], [75.2, 32.5], [74, 34],
];
const project = ([lon, lat]) => [(lon - 68) * 10 + 8, (37 - lat) * 10 + 8];
const OUTLINE_PATH = "M" + OUTLINE.map((pt) => project(pt).join(",")).join("L") + "Z";

export const CITIES = [
  { name: "Noida", lonlat: [77.4, 28.5], side: "right" },
  { name: "Pune", lonlat: [73.9, 18.5], side: "left" },
  { name: "Chennai", lonlat: [80.3, 13.1], side: "right" },
];

function IndiaMap({ active }) {
  const pts = Object.fromEntries(CITIES.map((c) => [c.name, project(c.lonlat)]));
  const arc = (a, b, bend) => {
    const [x1, y1] = pts[a];
    const [x2, y2] = pts[b];
    return `M${x1},${y1} Q${(x1 + x2) / 2 + bend},${(y1 + y2) / 2} ${x2},${y2}`;
  };
  return (
    <svg viewBox="0 0 310 330" role="img" aria-label="Map of India showing the Noida, Pune and Chennai hospitals">
      <defs>
        <pattern id="dots" width="6" height="6" patternUnits="userSpaceOnUse">
          <circle cx="3" cy="3" r="1.05" fill="#fff" fillOpacity=".5" />
        </pattern>
        <clipPath id="india"><path d={OUTLINE_PATH} /></clipPath>
      </defs>
      <path d={OUTLINE_PATH} fill="rgba(255,255,255,.08)" />
      <rect width="310" height="330" fill="url(#dots)" clipPath="url(#india)" />
      <path d={arc("Noida", "Pune", -26)} fill="none" stroke="#fff" strokeOpacity=".75" strokeWidth="1" strokeDasharray="1.5 4" strokeLinecap="round" />
      <path d={arc("Noida", "Chennai", 34)} fill="none" stroke="#fff" strokeOpacity=".75" strokeWidth="1" strokeDasharray="1.5 4" strokeLinecap="round" />
      {CITIES.map((c) => {
        const [x, y] = pts[c.name];
        const on = active === c.name;
        const w = 14 + c.name.length * 5.2;
        const lx = c.side === "right" ? x + 12 : x - 12 - w;
        return (
          <g key={c.name}>
            {on && <circle cx={x} cy={y} r="11" fill="#fff" fillOpacity=".22" />}
            <circle className="city-pin" cx={x} cy={y} r={on ? 5 : 3.6} fill="#fff" />
            <rect x={lx} y={y - 8} width={w} height="16" rx="8" fill={on ? "#fff" : "#08506f"} fillOpacity={on ? 1 : 0.62} stroke="#fff" strokeOpacity=".3" />
            <text className="map-tag" x={lx + w / 2} y={y + 3} textAnchor="middle" style={{ fill: on ? "#0a6a9c" : "#fff" }}>{c.name}</text>
          </g>
        );
      })}
    </svg>
  );
}

/** Split-screen frame shared by the log in and sign up screens. */
export function AuthShell({ setPage, children }) {
  const [city, setCity] = useState(null);
  return (
    <div className="login-page">
      <aside className="login-poster">
        <Logo dark onHome={() => setPage("home")} />
        <h2>Your care, fitted around your workday.</h2>
        <div className="map-stage"><IndiaMap active={city} /></div>
        <div className="city-tabs" role="group" aria-label="Hospital cities" onMouseLeave={() => setCity(null)}>
          {CITIES.map((c) => (
            <button key={c.name} type="button" className={city === c.name ? "on" : ""} onMouseEnter={() => setCity(c.name)} onFocus={() => setCity(c.name)} onBlur={() => setCity(null)}>
              {c.name}
            </button>
          ))}
        </div>
        <p className="city-note">{city ? <b>Motherson Hospital · {city}</b> : "Hover a city to see its hospital"}</p>
        <div className="ecg" aria-hidden="true">
          <svg viewBox="0 0 600 54" preserveAspectRatio="none">
            <path d="M0 40H150l14-24 16 36 16-30 12 18H330l14-24 16 36 16-30 12 18H600" fill="none" stroke="#fff" strokeOpacity=".7" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
          </svg>
        </div>
      </aside>
      <section className="login-side">
        <button type="button" className="back-link" onClick={() => setPage("home")}>
          <ArrowLeft size={15} /> Back to home
        </button>
        {children}
      </section>
    </div>
  );
}
