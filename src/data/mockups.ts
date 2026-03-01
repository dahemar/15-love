export type Hotspot = {
  href: string;
  label: string;
  bbox: [number, number, number, number]; // x0,y0,x1,y1 in PDF pixels (1920x1080)
  target?: "_blank";
};

export type Mockup = {
  title: string;
  image: string;
  size: { width: number; height: number };
  hotspots: Hotspot[];
};

const navHotspots: Hotspot[] = [
  { href: "/home", label: "Home", bbox: [690.5663, 135.8534, 762.2452, 170.1734] },
  { href: "/news", label: "News", bbox: [794.9366, 134.8638, 861.8277, 169.1838] },
  { href: "/releases", label: "Releases", bbox: [872.0967, 134.8638, 978.1736, 169.1838] },
  { href: "/events", label: "Events", bbox: [987.7467, 134.8638, 1070.0846, 169.1838] },
  { href: "/about", label: "About", bbox: [1079.6967, 134.8638, 1151.9186, 169.1838] },
  { href: "/archive", label: "Archive", bbox: [1161.9266, 134.8638, 1252.2207, 169.1838] },
];

const footerHotspots: Hotspot[] = [
  { href: "mailto:info@15love.dk", label: "Email", bbox: [36.0, 1051.6162, 151.3688, 1072.4072] },
  {
    href: "https://instagram.com/",
    label: "Instagram",
    bbox: [184.5937, 1051.6162, 261.6547, 1072.4072],
    target: "_blank",
  },
  { href: "#", label: "Newsletter", bbox: [294.8954, 1051.7268, 376.7129, 1072.5178] },
];

export const mockups: Record<string, Mockup> = {
  splash: {
    title: "15 love — Splash",
    image: "/mockups/page-03.png",
    size: { width: 1920, height: 1080 },
    hotspots: [
      {
        href: "/home",
        label: "Click to proceed",
        bbox: [861.4711, 798.245, 1058.4961, 832.565],
      },
    ],
  },
  home: {
    title: "15 love — Home",
    image: "/mockups/page-08.png",
    size: { width: 1920, height: 1080 },
    hotspots: [...navHotspots, ...footerHotspots],
  },
  news: {
    title: "15 love — News",
    image: "/mockups/page-17.png",
    size: { width: 1920, height: 1080 },
    hotspots: [...navHotspots, ...footerHotspots],
  },
  releases: {
    title: "15 love — Releases",
    image: "/mockups/page-21.png",
    size: { width: 1920, height: 1080 },
    hotspots: [...navHotspots, ...footerHotspots],
  },
  events: {
    title: "15 love — Events",
    image: "/mockups/page-24.png",
    size: { width: 1920, height: 1080 },
    hotspots: [...navHotspots, ...footerHotspots],
  },
  about: {
    title: "15 love — About",
    image: "/mockups/page-27.png",
    size: { width: 1920, height: 1080 },
    hotspots: [...navHotspots, ...footerHotspots],
  },
  archive: {
    title: "15 love — Archive",
    image: "/mockups/page-11.png",
    size: { width: 1920, height: 1080 },
    hotspots: [...navHotspots, ...footerHotspots],
  },
  "m-home": {
    title: "15 love — Home (mobile mockup)",
    image: "/mockups/page-30.png",
    size: { width: 1080, height: 1920 },
    hotspots: [],
  },
};
