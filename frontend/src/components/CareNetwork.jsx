import { useEffect, useId, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";

const MAP_BOX = {
  x: 30,
  y: 30,
  width: 300,
  height: 340,
  viewWidth: 360,
  viewHeight: 400,
};

const GEO_BOUNDS = {
  minLon: 68.176645,
  maxLon: 97.402561,
  minLat: 7.965535,
  maxLat: 35.49401,
};

const HOSPITALS = [
  {
    id: "pune",
    city: "Pune",
    state: "Maharashtra",
    name: "Motherson Health Center",
    lat: 18.5204,
    lon: 73.8567,
    labelSide: "left",
  },
  {
    id: "noida",
    city: "Noida",
    state: "Uttar Pradesh",
    name: "Motherson Care Hospital",
    lat: 28.5355,
    lon: 77.391,
    labelSide: "right",
  },
  {
    id: "chennai",
    city: "Chennai",
    state: "Tamil Nadu",
    name: "Motherson Medical Center",
    lat: 13.0827,
    lon: 80.2707,
    labelSide: "right",
  },
];

const NODE_ORDER = ["noida", "pune", "chennai"];

const project = (lon, lat) => ({
  x:
    MAP_BOX.x +
    ((lon - GEO_BOUNDS.minLon) / (GEO_BOUNDS.maxLon - GEO_BOUNDS.minLon)) *
      MAP_BOX.width,
  y:
    MAP_BOX.y +
    ((GEO_BOUNDS.maxLat - lat) / (GEO_BOUNDS.maxLat - GEO_BOUNDS.minLat)) *
      MAP_BOX.height,
});

const NODES = Object.fromEntries(
  HOSPITALS.map((hospital) => [
    hospital.id,
    { ...hospital, point: project(hospital.lon, hospital.lat) },
  ])
);

const buildCurve = (from, to, bend) => {
  const start = NODES[from].point;
  const end = NODES[to].point;
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.hypot(dx, dy) || 1;
  const controlX = (start.x + end.x) / 2 + (-dy / length) * bend;
  const controlY = (start.y + end.y) / 2 + (dx / length) * bend;
  const points = Array.from({ length: 11 }, (_, index) => {
    const t = index / 10;
    const inverse = 1 - t;
    return [
      inverse * inverse * start.x +
        2 * inverse * t * controlX +
        t * t * end.x,
      inverse * inverse * start.y +
        2 * inverse * t * controlY +
        t * t * end.y,
    ];
  });

  return {
    d: `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} Q ${controlX.toFixed(
      2
    )} ${controlY.toFixed(2)} ${end.x.toFixed(2)} ${end.y.toFixed(2)}`,
    points,
  };
};

const LINES = [
  { id: "noida-pune", ...buildCurve("noida", "pune", 16) },
  { id: "pune-chennai", ...buildCurve("pune", "chennai", 18) },
  { id: "noida-chennai", ...buildCurve("noida", "chennai", 22) },
];

const INDIA_PATH = `M 129.2 30.0
  C 132.7 30.7 138.5 40.4 140.2 44.5
  C 141.9 48.6 138.7 51.8 139.2 54.6
  C 139.7 57.3 142.6 58.8 143.2 60.9
  C 143.9 63.0 144.2 66.4 142.9 67.2
  C 141.6 68.0 136.3 63.5 135.5 65.5
  C 134.8 67.5 136.3 75.6 138.4 79.1
  C 140.6 82.7 144.4 84.2 148.5 87.0
  C 152.6 89.7 161.5 93.2 162.8 95.6
  C 164.1 98.0 158.0 98.3 156.3 101.2
  C 154.5 104.1 151.3 110.0 152.3 112.7
  C 153.3 115.4 158.9 115.6 162.2 117.4
  C 165.5 119.2 168.1 121.3 171.9 123.5
  C 175.7 125.6 180.7 129.0 185.3 130.4
  C 189.9 131.8 196.0 130.7 199.4 132.0
  C 202.7 133.3 203.0 137.0 205.3 138.3
  C 207.6 139.5 209.8 138.8 213.2 139.5
  C 216.6 140.1 222.1 141.9 225.6 142.3
  C 229.0 142.8 232.5 143.0 234.1 142.1
  C 235.7 141.3 235.3 139.4 235.3 137.2
  C 235.2 135.1 234.0 131.6 233.9 129.4
  C 233.8 127.2 233.5 125.4 234.7 124.1
  C 235.9 122.8 239.8 120.3 241.0 121.5
  C 242.2 122.7 241.7 129.2 241.8 131.2
  C 242.0 133.2 240.5 132.5 242.1 133.7
  C 243.7 134.9 248.8 137.9 251.4 138.4
  C 254.0 138.8 255.3 136.6 257.8 136.4
  C 260.4 136.3 263.7 137.2 266.5 137.3
  C 269.4 137.3 273.4 138.2 274.9 136.9
  C 276.4 135.6 276.2 131.2 275.6 129.3
  C 275.0 127.4 270.7 126.3 271.4 125.4
  C 272.1 124.5 276.8 125.6 279.7 123.8
  C 282.6 122.0 285.5 117.5 289.1 114.6
  C 292.6 111.8 297.5 107.6 300.9 106.8
  C 304.3 106.0 306.8 110.2 309.5 109.8
  C 312.1 109.5 314.8 104.2 316.8 104.6
  C 318.8 105.0 321.4 110.1 321.6 112.3
  C 321.8 114.4 316.9 116.3 318.2 117.5
  C 319.4 118.7 327.3 118.2 329.2 119.3
  C 331.2 120.4 330.5 122.9 330.0 124.0
  C 329.5 125.2 326.9 124.6 326.4 126.3
  C 325.9 127.9 328.3 133.0 327.2 133.9
  C 326.2 134.8 323.3 130.6 319.9 131.6
  C 316.5 132.7 308.8 137.6 306.6 140.2
  C 304.5 142.8 307.8 144.3 306.9 147.2
  C 306.0 150.1 302.3 154.9 301.3 157.6
  C 300.2 160.3 301.6 160.9 300.7 163.6
  C 299.9 166.3 298.3 172.6 296.2 173.8
  C 294.1 175.0 289.5 169.3 288.1 171.0
  C 286.7 172.7 288.2 180.9 287.7 183.8
  C 287.3 186.6 285.6 186.4 285.4 188.0
  C 285.2 189.6 287.2 191.9 286.5 193.2
  C 285.9 194.6 283.2 198.9 281.4 196.2
  C 279.7 193.4 277.4 179.8 276.0 176.6
  C 274.7 173.3 274.0 175.3 273.2 176.6
  C 272.5 177.9 272.7 184.2 271.5 184.5
  C 270.3 184.7 266.3 180.3 265.9 178.1
  C 265.5 175.9 267.8 172.4 269.1 171.1
  C 270.4 169.8 272.1 172.2 273.7 170.4
  C 275.2 168.5 278.6 162.0 278.4 159.9
  C 278.2 157.8 275.1 158.1 272.5 157.8
  C 269.9 157.5 266.2 158.2 263.0 158.0
  C 259.8 157.7 255.0 158.0 253.2 156.3
  C 251.4 154.6 253.3 149.2 252.3 147.7
  C 251.3 146.2 249.6 148.1 247.4 147.1
  C 245.2 146.1 241.2 141.2 239.3 141.7
  C 237.3 142.3 235.0 147.6 235.6 150.1
  C 236.3 152.6 242.9 154.8 243.0 156.7
  C 243.2 158.5 238.1 159.7 236.6 161.3
  C 235.2 162.8 233.7 164.5 234.4 165.8
  C 235.0 167.1 239.9 167.3 240.7 169.1
  C 241.4 170.9 238.6 173.7 238.9 176.5
  C 239.2 179.3 241.6 182.6 242.5 185.8
  C 243.3 189.0 244.1 193.5 244.1 196.0
  C 244.1 198.4 244.0 199.8 242.6 200.5
  C 241.2 201.2 238.9 199.9 235.6 200.3
  C 232.4 200.7 225.0 200.9 223.0 202.9
  C 221.0 204.9 224.4 209.4 223.6 212.2
  C 222.7 215.0 221.5 216.9 218.1 219.5
  C 214.7 222.1 207.7 224.0 203.3 227.8
  C 198.9 231.6 195.0 238.6 191.8 242.3
  C 188.6 246.1 187.1 247.5 184.1 250.1
  C 181.1 252.8 175.6 255.9 173.9 258.2
  C 172.2 260.5 174.7 262.4 173.9 263.9
  C 173.0 265.3 171.1 265.7 168.7 266.9
  C 166.3 268.2 161.8 270.5 159.5 271.4
  C 157.2 272.2 156.0 270.3 154.7 272.0
  C 153.4 273.7 151.8 277.2 151.6 281.4
  C 151.5 285.7 153.3 293.1 153.8 297.5
  C 154.2 301.9 154.9 304.1 154.3 307.7
  C 153.7 311.4 150.7 314.0 150.0 319.5
  C 149.2 324.9 150.8 336.9 149.9 340.5
  C 149.0 344.1 146.3 339.4 144.6 341.1
  C 142.9 342.7 140.2 348.2 139.9 350.5
  C 139.7 352.7 144.1 353.3 143.0 354.5
  C 142.0 355.8 135.8 356.1 133.7 358.1
  C 131.6 360.0 131.5 364.5 130.2 366.5
  C 129.0 368.4 128.4 371.3 126.1 370.0
  C 123.8 368.7 118.8 363.3 116.4 358.5
  C 114.0 353.7 113.1 346.1 111.6 341.2
  C 110.2 336.2 109.0 331.8 107.7 328.7
  C 106.4 325.7 105.6 325.8 104.1 322.9
  C 102.6 319.9 100.0 315.6 98.7 311.0
  C 97.3 306.5 96.8 299.4 96.1 295.6
  C 95.4 291.7 96.2 292.0 94.3 287.8
  C 92.5 283.7 87.3 277.7 85.0 270.9
  C 82.7 264.1 82.0 253.6 80.7 246.9
  C 79.5 240.3 78.2 236.3 77.7 231.1
  C 77.2 226.0 78.0 220.6 77.7 216.2
  C 77.4 211.8 78.5 205.3 75.7 204.6
  C 72.9 203.9 64.5 211.0 60.8 212.0
  C 57.1 213.0 57.0 213.3 53.5 210.5
  C 50.1 207.8 41.5 198.8 40.1 195.6
  C 38.7 192.3 44.8 192.6 45.1 191.1
  C 45.4 189.5 44.6 188.8 42.0 186.2
  C 39.5 183.7 30.9 178.9 30.0 175.8
  C 29.1 172.6 31.9 168.9 36.8 167.5
  C 41.7 166.2 56.0 169.3 59.4 167.6
  C 62.9 165.8 58.7 159.8 57.4 157.0
  C 56.1 154.1 52.8 153.3 51.6 150.7
  C 50.5 148.1 51.8 143.7 50.5 141.2
  C 49.1 138.7 43.0 138.7 43.7 135.6
  C 44.5 132.6 51.2 124.7 55.0 122.7
  C 58.9 120.7 63.2 125.6 67.0 123.6
  C 70.7 121.6 74.8 114.9 77.7 110.7
  C 80.6 106.4 81.4 102.3 84.1 98.1
  C 86.9 94.0 92.5 89.3 94.1 85.8
  C 95.7 82.2 92.5 79.6 93.9 77.0
  C 95.4 74.3 102.6 72.0 102.7 69.8
  C 102.8 67.6 96.4 66.1 94.4 63.7
  C 92.4 61.3 92.0 58.5 90.8 55.4
  C 89.6 52.2 87.0 47.2 87.2 44.5
  C 87.4 41.8 88.8 39.6 92.2 39.2
  C 95.7 38.8 103.3 42.0 107.8 42.2
  C 112.3 42.4 115.7 42.4 119.3 40.4
  C 122.8 38.3 125.7 29.3 129.2 30.0 Z`;

const LABEL_TRANSITION = { duration: 0.22, ease: "easeOut" };

export default function CareNetwork() {
  const reduceMotion = useReducedMotion();
  const [activeCity, setActiveCity] = useState(null);
  const hoverClearRef = useRef(null);
  const mapRef = useRef(null);
  const rawId = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const crossId = `care-cross-${rawId}`;
  const dotId = `care-dots-${rawId}`;
  const glowId = `care-glow-${rawId}`;
  const landGlowId = `care-land-glow-${rawId}`;
  const clipId = `care-clip-${rawId}`;
  const blurId = `care-blur-${rawId}`;

  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const smoothX = useSpring(pointerX, { stiffness: 110, damping: 20, mass: 0.4 });
  const smoothY = useSpring(pointerY, { stiffness: 110, damping: 20, mass: 0.4 });
  const parallaxX = useTransform(smoothX, [-0.5, 0.5], [-6, 6]);
  const parallaxY = useTransform(smoothY, [-0.5, 0.5], [-6, 6]);

  const handlePointerMove = (event) => {
    if (reduceMotion || !mapRef.current) return;
    const bounds = mapRef.current.getBoundingClientRect();
    pointerX.set((event.clientX - bounds.left) / bounds.width - 0.5);
    pointerY.set((event.clientY - bounds.top) / bounds.height - 0.5);
  };

  const resetParallax = () => {
    pointerX.set(0);
    pointerY.set(0);
  };

  const activeHospital = activeCity
    ? HOSPITALS.find((hospital) => hospital.id === activeCity)
    : null;

  const selectHospital = (city) => {
    window.clearTimeout(hoverClearRef.current);
    setActiveCity(city);
  };

  const scheduleClear = () => {
    window.clearTimeout(hoverClearRef.current);
    hoverClearRef.current = window.setTimeout(() => setActiveCity(null), 80);
  };

  useEffect(() => {
    const clearOnTouchOutside = (event) => {
      if (event.pointerType !== "touch") return;
      if (event.target.closest(".care-city-segment, .care-node")) return;
      setActiveCity(null);
    };

    document.addEventListener("pointerdown", clearOnTouchOutside);
    return () => {
      document.removeEventListener("pointerdown", clearOnTouchOutside);
      window.clearTimeout(hoverClearRef.current);
    };
  }, []);

  return (
    <div className="care-network">
      <motion.div
        className="care-map"
        ref={mapRef}
        aria-hidden="true"
        animate={reduceMotion ? undefined : { y: [0, -4, 0] }}
        transition={
          reduceMotion ? undefined : { duration: 7, repeat: Infinity, ease: "easeInOut" }
        }
        onMouseMove={handlePointerMove}
        onMouseLeave={resetParallax}
      >
        <motion.div
          className="care-map__canvas"
          style={reduceMotion ? undefined : { x: parallaxX, y: parallaxY }}
        >
          <svg
            className="care-map__svg"
            viewBox={`0 0 ${MAP_BOX.viewWidth} ${MAP_BOX.viewHeight}`}
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <radialGradient id={glowId} cx="50%" cy="48%" r="58%">
                <stop offset="0%" className="care-map__glow-stop" stopOpacity="0.22" />
                <stop offset="55%" className="care-map__glow-stop" stopOpacity="0.08" />
                <stop offset="100%" className="care-map__glow-stop" stopOpacity="0" />
              </radialGradient>
              <radialGradient id={landGlowId} cx="47%" cy="55%" r="62%">
                <stop offset="0%" className="care-map__land-glow-stop" stopOpacity="0.24" />
                <stop offset="58%" className="care-map__land-glow-stop" stopOpacity="0.1" />
                <stop offset="100%" className="care-map__land-glow-stop" stopOpacity="0" />
              </radialGradient>
              <pattern id={crossId} width="38" height="38" patternUnits="userSpaceOnUse">
                <path
                  className="care-map__cross"
                  d="M19 15v8M15 19h8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
              </pattern>
              <pattern id={dotId} width="7" height="7" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1" fill="#ffffff" fillOpacity="0.35" />
              </pattern>
              <clipPath id={clipId}>
                <path d={INDIA_PATH} />
              </clipPath>
              <filter id={blurId} x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4.5" />
              </filter>
            </defs>

            <ellipse
              cx="180"
              cy="202"
              rx="164"
              ry="184"
              fill={`url(#${glowId})`}
            />
            <rect
              width={MAP_BOX.viewWidth}
              height={MAP_BOX.viewHeight}
              fill={`url(#${crossId})`}
            />

            <motion.g
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: reduceMotion ? 0 : 0.8, delay: reduceMotion ? 0 : 0.3 }}
            >
              <path d={INDIA_PATH} fill={`url(#${landGlowId})`} clipPath={`url(#${clipId})`} />
              <path
                className="care-map__inner-glow"
                d={INDIA_PATH}
                fill="none"
                clipPath={`url(#${clipId})`}
                filter={`url(#${blurId})`}
              />
            </motion.g>

            <motion.rect
              width={MAP_BOX.viewWidth}
              height={MAP_BOX.viewHeight}
              fill={`url(#${dotId})`}
              clipPath={`url(#${clipId})`}
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: reduceMotion ? 0 : 0.9, delay: reduceMotion ? 0 : 0.45 }}
            />

            <motion.path
              className="care-map__outline"
              d={INDIA_PATH}
              pathLength={1}
              initial={reduceMotion ? false : { pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{
                pathLength: {
                  duration: reduceMotion ? 0 : 1.5,
                  delay: reduceMotion ? 0 : 0.15,
                  ease: [0.22, 1, 0.36, 1],
                },
                opacity: { duration: reduceMotion ? 0 : 0.3 },
              }}
            />

            {LINES.map((line, index) => {
              const isActiveLine = line.id.split("-").includes(activeCity);
              return (
                <motion.path
                  key={`${line.id}-base`}
                  className={`care-map__line-base${isActiveLine ? " is-active" : ""}`}
                  d={line.d}
                  pathLength={1}
                  initial={reduceMotion ? false : { pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{
                    duration: reduceMotion ? 0 : 0.75,
                    delay: reduceMotion ? 0 : 0.55 + index * 0.12,
                    ease: "easeInOut",
                  }}
                />
              );
            })}

            {LINES.map((line, index) => {
              const isActiveLine = line.id.split("-").includes(activeCity);
              return (
                <motion.path
                  key={`${line.id}-flow`}
                  className={`care-map__line-flow${isActiveLine ? " is-active" : ""}`}
                  d={line.d}
                  strokeDasharray="3 8"
                  initial={
                    reduceMotion ? false : { opacity: 0, strokeDashoffset: 0 }
                  }
                  animate={
                    reduceMotion
                      ? { opacity: 0.65, strokeDashoffset: 0 }
                      : { opacity: isActiveLine ? 1 : 0.9, strokeDashoffset: -88 }
                  }
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : {
                          opacity: { duration: 0.5, delay: 0.7 },
                          strokeDashoffset: {
                            duration: 4.8,
                            repeat: Infinity,
                            ease: "linear",
                            delay: 0.7 + index * 0.18,
                          },
                        }
                  }
                />
              );
            })}

            {LINES.map((line, index) => {
              const middle = line.points[Math.floor(line.points.length / 2)];
              return (
                <motion.g
                  key={`${line.id}-particle`}
                  className="care-particle"
                  initial={
                    reduceMotion
                      ? false
                      : { x: line.points[0][0], y: line.points[0][1], opacity: 0 }
                  }
                  animate={
                    reduceMotion
                      ? { x: middle[0], y: middle[1], opacity: 0.58 }
                      : {
                          x: line.points.map((point) => point[0]),
                          y: line.points.map((point) => point[1]),
                          opacity: 1,
                        }
                  }
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : {
                          opacity: { duration: 0.4, delay: 0.95 + index * 0.2 },
                          x: {
                            duration: 4.8,
                            repeat: Infinity,
                            ease: "linear",
                            delay: 0.95 + index * 0.55,
                          },
                          y: {
                            duration: 4.8,
                            repeat: Infinity,
                            ease: "linear",
                            delay: 0.95 + index * 0.55,
                          },
                        }
                  }
                >
                  <circle className="care-particle__halo" r="7" />
                  <circle className="care-particle__core" r="2.4" />
                </motion.g>
              );
            })}

            {NODE_ORDER.map((city, index) => {
              const node = NODES[city];
              const isActive = activeCity === city;
              return (
                <g
                  key={city}
                  className={`care-node care-node--${city}${
                    isActive ? " is-active" : activeCity ? " is-dimmed" : ""
                  }`}
                  transform={`translate(${node.point.x.toFixed(2)} ${node.point.y.toFixed(2)})`}
                  onMouseEnter={() => selectHospital(city)}
                  onMouseLeave={scheduleClear}
                  onPointerDown={(event) => {
                    if (event.pointerType === "touch") selectHospital(city);
                  }}
                >
                  <motion.g
                    initial={reduceMotion ? false : { opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      duration: reduceMotion ? 0 : 0.45,
                      delay: reduceMotion ? 0 : 0.62 + index * 0.2,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    style={{ transformBox: "fill-box", transformOrigin: "center" }}
                  >
                    <motion.g
                      animate={{ scale: isActive ? 1.12 : 1 }}
                      transition={LABEL_TRANSITION}
                      style={{ transformBox: "fill-box", transformOrigin: "center" }}
                    >
                      {reduceMotion ? (
                        <>
                          <circle
                            className="care-node__ring-static"
                            r="13"
                            stroke="currentColor"
                            fill="none"
                            strokeWidth="1"
                          />
                          <circle
                            className="care-node__ring-static"
                            r="9.5"
                            stroke="currentColor"
                            fill="none"
                            strokeWidth="1"
                          />
                        </>
                      ) : (
                        <>
                          {[0, 1].map((ring) => (
                            <motion.circle
                              key={ring}
                              r="7"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1"
                              initial={{ scale: 1, opacity: isActive ? 0.82 : 0.38 }}
                              animate={{
                                scale: [1, isActive ? 4.6 : 3.4],
                                opacity: [isActive ? 0.82 : 0.38, 0],
                              }}
                              transition={{
                                duration: isActive ? 2.1 : 2.6,
                                repeat: Infinity,
                                repeatType: "loop",
                                repeatDelay: 0.2,
                                delay: ring * 0.9,
                                ease: [0.16, 1, 0.3, 1],
                              }}
                              style={{
                                transformBox: "fill-box",
                                transformOrigin: "center",
                              }}
                            />
                          ))}
                        </>
                      )}
                      <motion.circle
                        className="care-node__halo"
                        r="9"
                        animate={{ opacity: isActive ? 0.9 : 0.32 }}
                        transition={LABEL_TRANSITION}
                      />
                      <circle className="care-node__core" r="4.2" />
                      <circle
                        r="7.2"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1"
                        opacity="0.7"
                      />
                      <circle className="care-node__hit" r="15" />
                    </motion.g>
                  </motion.g>
                </g>
              );
            })}
          </svg>

          <div className="care-map__labels">
            {HOSPITALS.map((hospital) => {
              const isActive = activeCity === hospital.id;
              const node = NODES[hospital.id];
              const nodeIndex = NODE_ORDER.indexOf(hospital.id);
              return (
                <span
                  key={hospital.id}
                  className={`care-map__label-anchor care-map__label-anchor--${hospital.labelSide}`}
                  style={{
                    left: `${(node.point.x / MAP_BOX.viewWidth) * 100}%`,
                    top: `${(node.point.y / MAP_BOX.viewHeight) * 100}%`,
                  }}
                >
                  <motion.span
                    className={`care-map__label${
                      isActive ? " is-active" : activeCity ? " is-dimmed" : ""
                    } care-map__label--${hospital.labelSide} care-map__label--${hospital.id}`}
                    initial={reduceMotion ? false : { opacity: 0 }}
                    animate={{
                      opacity: activeCity && !isActive ? 0.6 : 1,
                      scale: isActive ? 1.1 : 1,
                    }}
                    transition={
                      reduceMotion
                        ? { duration: 0 }
                        : {
                            opacity: {
                              duration: 0.36,
                              delay: 0.78 + nodeIndex * 0.2,
                            },
                            scale: LABEL_TRANSITION,
                          }
                    }
                    onMouseEnter={() => selectHospital(hospital.id)}
                    onMouseLeave={scheduleClear}
                  >
                    <span className="care-map__label-dot" />
                    <span>{hospital.city}</span>
                  </motion.span>
                </span>
              );
            })}
          </div>
        </motion.div>
      </motion.div>

      <div className="care-city-switcher" role="group" aria-label="Hospital cities">
        {HOSPITALS.map((hospital) => {
          const isActive = hospital.id === activeCity;
          return (
            <button
              key={hospital.id}
              type="button"
              className={`care-city-segment${isActive ? " is-active" : ""}`}
              aria-label={`${hospital.city}, ${hospital.name}`}
              onMouseEnter={() => selectHospital(hospital.id)}
              onMouseLeave={scheduleClear}
              onFocus={() => selectHospital(hospital.id)}
              onBlur={scheduleClear}
              onPointerDown={(event) => {
                if (event.pointerType === "touch") selectHospital(hospital.id);
              }}
            >
              {isActive && (
                <motion.span
                  layoutId="care-city-thumb"
                  className="care-city-thumb"
                  initial={false}
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : { duration: 0.3, ease: [0.16, 1, 0.3, 1] }
                  }
                />
              )}
              <span className="care-city-segment__label">{hospital.city}</span>
            </button>
          );
        })}
      </div>

      <div className="care-city-info">
        <AnimatePresence initial={false}>
          {activeHospital ? (
            <motion.div
              key={activeHospital.id}
              className="care-city-info__detail"
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: reduceMotion ? 0 : 0.18, ease: "easeOut" }}
            >
              <span className="care-city-info__name">{activeHospital.name}</span>
              <span className="care-city-info__meta">
                {activeHospital.city}, {activeHospital.state}
              </span>
            </motion.div>
          ) : (
            <motion.p
              key="care-city-info-hint"
              className="care-city-info__hint"
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: reduceMotion ? 0 : 0.18, ease: "easeOut" }}
            >
              Hover a city to see its hospital
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
