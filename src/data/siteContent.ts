export type NewsImage = { src: string; alt: string };

// ── Event post types ─────────────────────────────────────────────────────────

export type EventDetailsBlock = {
  __component: "events.details";
  id: number;
  headline: string;
  venue?: string;
  description?: string;
  dateLabel?: string;
};

export type EventRichTextBlock = {
  __component: "events.rich-text";
  id: number;
  title?: string;
  body?: string;
};

export type EventMediaBlock = {
  __component: "events.media";
  id: number;
  image: { url: string; alt: string; width?: number; height?: number } | null;
  caption?: string;
  imagePosition: "left" | "right" | "full";
};

export type EventBlock = EventDetailsBlock | EventRichTextBlock | EventMediaBlock;

export type EventPost = {
  id: string;
  title: string;
  body?: string;
  eventBlocks: EventBlock[];
};

export type NewsCard = {
  id: string;
  title?: string;
  images: NewsImage[];
  body?: string;
};

export type ReleaseCredit = { label: string; value: string };

export type ReleaseCard = {
  id: string;
  image: { src: string; alt: string };
  credits: ReleaseCredit[];
  body: string;
};

export type SiteContent = {
  newsList: string[];
  eventsList: string[];
  newsCards: NewsCard[];
  newsFlowText: string;
  releaseList: string[];
  releaseCards: ReleaseCard[];
  eventPosts: EventPost[];
};

const loremContinuous =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";

export const localSiteContent: SiteContent = {
  newsList: [
    `SLIM0 working on the dubplate\nof FORGIVENESS at KDS.`,
    `CTM & Skjold Rambow per-\nform “Bow” at Berlin Atonal ‘23.`,
    `ML Buch on US tour.`,
    `Music video for “Sedimentary”\nout today!`,
    `Making merch for Suntub.`,
    `Vind for Dior at PFW ‘24.`,
    `Jordan Playfair’s album release\nconcert!`,
    `Suntub vinyl press! Get yours\nfresh!`,
    `“Drama” from the forthcoming\nCTM album “Vind” is out today!`,
  ],
  eventsList: [
    `SLIM0 release party @Mayhem`,
    `Jordan Playfair - Spresso @ Loki Brixton`,
    `Astrid Sonne - Tara Clerkin Trio @ CPH Distillery`,
    `CTM x Frederik Worm - CTM @ Lille Vega`,
    `Mere lyd for Palæstina @ CPH Distillery`,
    `Vind & 15 love release party @ Mayhem`,
  ],
  newsCards: [
    {
      id: "n1-n2",
      images: [
        { src: "/assets/image-mockup1.png", alt: "Studio session" },
        { src: "/assets/FTL005_artwork_casette_export.jpg", alt: "Jordan Playfair release artwork" },
      ],
    },
    {
      id: "n3-n4",
      images: [
        { src: "/assets/IMG_0271.JPG", alt: "Suntub process" },
        { src: "/assets/FTL003 process 4.png", alt: "Process image 4" },
      ],
    },
    {
      id: "n5-n6",
      images: [
        { src: "/assets/FTL003 process 5.png", alt: "Process image 5" },
        { src: "/assets/FTL003 process 7.png", alt: "Process image 7" },
      ],
    },
  ],
  newsFlowText: `${loremContinuous} ${loremContinuous} ${loremContinuous}`,
  releaseList: [
    `The Shadow Channel -\nSpellcaster`,
    `Desire -\nTLF Trio`,
    `It’s Looking at You -\nJura`,
    `Affectionately -\nSuntub`,
    `Pink Must -\nML Buch`,
  ],
  releaseCards: [
    {
      id: "r1",
      image: { src: "/assets/FTL010_Album_DSP copy.jpg", alt: "The Shadow Channel cover" },
      credits: [
        { label: "Artist name:", value: "Spellcaster" },
        { label: "Album title:", value: "The Shadow Channel" },
        { label: "Catalogue number:", value: "FTL010" },
        { label: "Release date:", value: "31 October 2025" },
        { label: "Format:", value: "Digital/CD" },
      ],
      body:
        "Ellaborent prat. Parume sedipsus aut ullest, commolu pictem harisquatus delent, opta cum fuga. Sed quias dolorectatis magnis ma pernam ut quat dolestrum eictemporum everro cumquo quat velestessim aliquide cum faccatqui te voloreiur adi con providet incienimi, velia consed ma quo cor ant officium fuga. Em quate labores et et omnim evelene stibustio quodis re nonsed que ditiis aut faccuptate explia sapissimint et quas doluptia dolent la comni sam duciliam, cullaborpos minctur as adipiet et et que nimillit offictecti ut quam laboritatem vidunt voloribus quos eum cum ipsum perachillupta plaudici ania net ellam apic te volupta quiatqu aeperro tem as poratem ilisciquos cus ipsae nobitio.",
    },
    {
      id: "r2",
      image: { src: "/assets/new_crop.jpg", alt: "Desire cover" },
      credits: [
        { label: "Artist name:", value: "TLF Trio" },
        { label: "Album title:", value: "Desire" },
        { label: "Catalogue number:", value: "FTL009" },
        { label: "Release date:", value: "2025" },
        { label: "Format:", value: "Digital/CD" },
      ],
      body:
        "Ellaborent prat. Rehenis mi, od quatur repuda volore et voluptati untiorum quia volut autecea con nossi con pre voluptatur sit excerit io. Ut occullaut que doluptat repudae volorum voloreh entias mincipsunt voluptae consequi quatur, occum voluptat et et et quunt harchicipsa cullaut aut pedit, et landis ut reruptae dis et officae por aut ium, non cus ut faceat fugitat aspe eos moluptaquis.",
    },
    {
      id: "r3",
      image: { src: "/assets/FTL005_artwork_casette_export.jpg", alt: "Something Inside So Wrong cover" },
      credits: [
        { label: "Artist name:", value: "Jordan Playfair" },
        { label: "Album title:", value: "Something Inside So Wrong" },
        { label: "Catalogue number:", value: "FTL004" },
        { label: "Release date:", value: "26 March 2024" },
        { label: "Format:", value: "Digital/CD" },
      ],
      body:
        "Ellaborent prat. Upta aut assi doluptaquo et volorem dolorem et, velesed que vendae cusam, as et alia quid qui odipsam, que prehent volupta sit, temque vendus ilique net adis reic te ventur? Tur remporerum sit, omnimporro bea nobit lam que nusam, con rem voloreium intiunt etur siminciis el inis est alit rem fugit porunt eosam que omnimusam hit molor autatur aut ullaut ut exceate.",
    },
  ],
  eventPosts: [],
};
