// The same name always gets the same soft colour, so people are easy to spot
export function hueOf(name) {
  let hue = 0;
  for (const char of name) hue = (hue * 31 + char.charCodeAt(0)) % 360;
  return hue;
}

export function initialsOf(name) {
  return name
    .replace(/^Dr\.?\s*/i, '')
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

// A soft, image-like gradient used behind doctor cards
export function coverBackground(name) {
  const hue = hueOf(name);
  return `radial-gradient(circle at 18% 22%, hsl(${hue} 62% 88%) 0, transparent 58%), radial-gradient(circle at 86% 82%, hsl(${(hue + 45) % 360} 58% 84%) 0, transparent 55%), hsl(${hue} 30% 96%)`;
}

export default function Avatar({ name, size = 'sm' }) {
  const hue = hueOf(name);
  return (
    <span
      className={`avatar avatar-${size}`}
      aria-hidden="true"
      style={{
        background: `linear-gradient(135deg, hsl(${hue} 45% 92%), hsl(${(hue + 30) % 360} 50% 84%))`,
        color: `hsl(${hue} 45% 24%)`,
      }}
    >
      {initialsOf(name)}
    </span>
  );
}
