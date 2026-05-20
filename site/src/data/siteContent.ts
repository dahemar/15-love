export type NewsImage = { src: string; alt: string };

export type NewsRichTextBlock = {
  __component: "news.rich-text";
  id: number;
  body?: string;
};

export type NewsMediaBlock = {
  __component: "news.media";
  id: number;
  image: { url: string; alt: string; width?: number; height?: number } | null;
  caption?: string;
  imagePosition: "left" | "right" | "center" | "full";
  imageWidth: "narrow" | "medium" | "wide";
  imageParagraph?: number;
};

export type NewsBlock = NewsRichTextBlock | NewsMediaBlock;

export type NewsPost = {
  id: string;
  legacyId?: string;
  title: string;
  summary?: string;
  publishedAt?: string;
  newsBlocks: NewsBlock[];
};

export type EventDetailsBlock = {
  __component: "events.details";
  id: number;
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
  imageWidth: "narrow" | "medium" | "wide";
  imageParagraph?: number;
};

export type EventBlock = EventDetailsBlock | EventRichTextBlock | EventMediaBlock;

export type EventPost = {
  id: string;
  legacyId?: string;
  title: string;
  summary?: string;
  publishedAt?: string;
  body?: string;
  eventBlocks: EventBlock[];
};

export type HomeFeedPost = {
  id: string;
  category: "news" | "events" | "releases";
  title: string;
  excerpt: string;
  image: NewsImage | null;
  publishedAt: string;
  dateLabel: string;
  href: string;
};

export type AboutContent = {
  text: string;
  backgroundImage: { src: string; alt: string } | null;
};

export type NewsCard = {
  id: string;
  images: NewsImage[];
};

export type ReleaseCredit = { label: string; value: string };

export type ReleaseCard = {
  id: string;
  legacyId?: string;
  title?: string;
  summary?: string;
  publishedAt?: string;
  image: { src: string; alt: string };
  credits: ReleaseCredit[];
  body: string;
};

export type ArchiveEntry = {
  id: string;
  legacyId?: string;
  title: string;
  category: "news" | "events" | "releases";
  publishedAt: string;
  dateLabel: string;
  tags: string[];
  thumbnail: { src: string; alt: string } | null;
  href: string;
};

export type SiteContent = {
  newsList: string[];
  newsPosts: NewsPost[];
  eventsList: string[];
  newsCards: NewsCard[];
  newsFlowText: string;
  releaseList: string[];
  releaseCards: ReleaseCard[];
  eventPosts: EventPost[];
  homeFeedPosts: HomeFeedPost[];
  about: AboutContent;
  archiveEntries: ArchiveEntry[];
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
  newsPosts: [
    {
      id: "local-news-1",
      title: "SLIM0 dubplate FORGIVENESS at KDS",
      summary: "Studio notes, edits, and process fragments from the latest session.",
      publishedAt: "2025-10-31T00:00:00.000Z",
      newsBlocks: [
        {
          __component: "news.media",
          id: 1,
          image: { url: "/assets/image-mockup1.png", alt: "Studio session" },
          imagePosition: "left",
          imageWidth: "medium",
          caption: "KDS session",
        },
        {
          __component: "news.media",
          id: 2,
          image: { url: "/assets/FTL003 process 4.png", alt: "Process still" },
          imagePosition: "right",
          imageWidth: "medium",
        },
        {
          __component: "news.rich-text",
          id: 3,
          body:
            "Qui blander ferunt venducius simulptate solo veritio sumusa dolor alibus suntem Optae. Doluptatur ent earitate eos ipis re sint laut que laborem et re voluptate. Nem duci ad et quias eatur, ipsa dolupta tiossequi conseque dero te re cescil esse omniment doluptas quidi test, cust odi doluptatet eum quis quas iust.",
        },
      ],
    },
    {
      id: "local-news-4",
      title: "CTM & Skjold Rambow at Berlin Atonal",
      summary: "Performance notes and images from the live set.",
      publishedAt: "2025-07-14T00:00:00.000Z",
      newsBlocks: [
        {
          __component: "news.rich-text",
          id: 4,
          body:
            "Ad molore etur repe dolupta temquam et omnis vent que porepta turepti officita volestem sam ra aut litatio dent quatem rerepro vidipsunt dolo cum qui conesen imusament harcium atia voluptis de de nos doluptas doluptas aut magnis ex et voluptas ni omnimodit."
        },
        {
          __component: "news.media",
          id: 5,
          image: { url: "/assets/FTL001 FALL 1 FOR WEB.png", alt: "CTM performance visual" },
          imagePosition: "full",
          imageWidth: "wide",
        },
      ],
    },
    {
      id: "local-news-9",
      title: "ML Buch on US tour",
      summary: "A rolling dispatch from the road.",
      publishedAt: "2023-11-01T00:00:00.000Z",
      newsBlocks: [
        {
          __component: "news.media",
          id: 6,
          image: { url: "/assets/FTL001 SPRING 1 FOR WEB.png", alt: "ML Buch tour visual" },
          imagePosition: "left",
          imageWidth: "narrow",
        },
        {
          __component: "news.rich-text",
          id: 7,
          body:
            "Non remolor re porum seniae sim quam expe eiur aute optatur aut quia sim, ullabo. Tem fugiat nusamust quatm natqui sum con nonet ratias autest, et exeruptatur. Equatioriorere loreiuntis molum earchillat offici et eosapiet que niendi deriorrovit, que molupta comnim faccum." 
        },
      ],
    },
    {
      id: "local-news-6",
      title: "Sedimentary music video out today",
      summary: "Stills and release notes from the new video.",
      publishedAt: "2025-01-20T00:00:00.000Z",
      newsBlocks: [
        {
          __component: "news.media",
          id: 8,
          image: { url: "/assets/FTL003 process 5.png", alt: "Sedimentary still" },
          imagePosition: "right",
          imageWidth: "wide",
        },
        {
          __component: "news.rich-text",
          id: 9,
          body:
            "Te autestibus eossum, optas aut volupitium sum fugitatem alic testi delestisque nobita is sit, sit et omnimos, aut et voluptatem nos a dolupta alitem id qui nus eum conet autem. Nam eum quis velit dem."
        },
      ],
    },
    {
      id: "local-news-7",
      title: "Making merch for Suntub",
      summary: "New materials, fittings, and print tests.",
      publishedAt: "2024-09-15T00:00:00.000Z",
      newsBlocks: [
        {
          __component: "news.rich-text",
          id: 10,
          body:
            "Bea seque eume suntur aut volorem porenis rem velibus esernat quo dolori omnis plit quame eum denitaepuda nimo maio int. To illitat iorit, unt, volles rerchil ipiciis mod qui nonsequiatem re consequam, que omnis quiam fugiam quid quunt faccusam volore nestium explis autemporum aut voluptatat."
        },
        {
          __component: "news.media",
          id: 11,
          image: { url: "/assets/FTL001 FALL 0 FOR WEB.png", alt: "Merch visual" },
          imagePosition: "full",
          imageWidth: "medium",
        },
      ],
    },
    {
      id: "local-news-3",
      title: "Vind for Dior at PFW",
      summary: "Campaign fragments and visual documentation.",
      publishedAt: "2025-08-01T00:00:00.000Z",
      newsBlocks: [
        {
          __component: "news.media",
          id: 12,
          image: { url: "/assets/FTL001 SUMMER 2 FOR WEB.png", alt: "Vind campaign still" },
          imagePosition: "left",
          imageWidth: "wide",
        },
        {
          __component: "news.rich-text",
          id: 13,
          body:
            "Necuas sus et est eos et eos dolupta non corit qui aut esequidit ab iduntem volup tatem volupta et vit voluptae qui bla dolorem omnitatem rerum quAqui ute sit aut int quatiis volupicilis illo doluptaero consequodit, totam, ut lab il inus." 
        },
      ],
    },
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
        { src: "/assets/FTL001 FALL 0 FOR WEB.png", alt: "Suntub process" },
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
  homeFeedPosts: [],
  about: {
    text: `15 love is a record label
based in copenhagen, denmark
to get in touch, send an e-mail to
info@15love.dk
looking forward to hearing from you`,
    backgroundImage: null,
  },
  archiveEntries: [
    { id: "local-news-1", title: "SLIM0 dubplate FORGIVENESS at KDS", category: "news", publishedAt: "2025-10-31T00:00:00.000Z", dateLabel: "Oct 2025", tags: ["news"], thumbnail: { src: "/assets/image-mockup1.png", alt: "Studio session" }, href: "/news/#local-news-1" },
    { id: "local-rel-1", title: "The Shadow Channel - Spellcaster", category: "releases", publishedAt: "2025-09-10T00:00:00.000Z", dateLabel: "Sep 2025", tags: ["releases"], thumbnail: { src: "/assets/FTL010_Album_DSP copy.jpg", alt: "The Shadow Channel" }, href: "/releases/#local-rel-1" },
    { id: "local-news-3", title: "Vind for Dior at PFW", category: "news", publishedAt: "2025-08-01T00:00:00.000Z", dateLabel: "Aug 2025", tags: ["news"], thumbnail: { src: "/assets/FTL001 FALL 0 FOR WEB.png", alt: "Vind Dior" }, href: "/news/#local-news-3" },
    { id: "local-news-4", title: "CTM Skjold Rambow at Berlin Atonal", category: "news", publishedAt: "2025-07-14T00:00:00.000Z", dateLabel: "Jul 2025", tags: ["news"], thumbnail: { src: "/assets/FTL001 FALL 1 FOR WEB.png", alt: "CTM Berlin" }, href: "/news/#local-news-4" },
    { id: "local-evt-1", title: "SLIM0 release party at Mayhem", category: "events", publishedAt: "2025-06-20T00:00:00.000Z", dateLabel: "Jun 2025", tags: ["events"], thumbnail: { src: "/assets/FTL001 FALL 2 FOR WEB.png", alt: "SLIM0 Mayhem" }, href: "/events/#local-evt-1" },
    { id: "local-rel-2", title: "Desire - TLF Trio", category: "releases", publishedAt: "2025-03-05T00:00:00.000Z", dateLabel: "Mar 2025", tags: ["releases"], thumbnail: { src: "/assets/new_crop.jpg", alt: "Desire" }, href: "/releases/#local-rel-2" },
    { id: "local-news-5", title: "Suntub vinyl press", category: "news", publishedAt: "2025-02-10T00:00:00.000Z", dateLabel: "Feb 2025", tags: ["news"], thumbnail: { src: "/assets/FTL003 process 5.png", alt: "Suntub vinyl" }, href: "/news/#local-news-5" },
    { id: "local-news-6", title: "Sedimentary music video out today", category: "news", publishedAt: "2025-01-20T00:00:00.000Z", dateLabel: "Jan 2025", tags: ["news"], thumbnail: { src: "/assets/FTL003 process 4.png", alt: "Sedimentary" }, href: "/news/#local-news-6" },
    { id: "local-evt-2", title: "Jordan Playfair - Spresso at Loki Brixton", category: "events", publishedAt: "2024-11-05T00:00:00.000Z", dateLabel: "Nov 2024", tags: ["events"], thumbnail: { src: "/assets/FTL005_artwork_casette_export.jpg", alt: "Jordan Brixton" }, href: "/events/#local-evt-2" },
    { id: "local-news-7", title: "Making merch for Suntub", category: "news", publishedAt: "2024-09-15T00:00:00.000Z", dateLabel: "Sep 2024", tags: ["news"], thumbnail: { src: "/assets/FTL003 process 5.png", alt: "Merch" }, href: "/news/#local-news-7" },
    { id: "local-rel-3", title: "Looking at You - Jura", category: "releases", publishedAt: "2024-07-22T00:00:00.000Z", dateLabel: "Jul 2024", tags: ["releases"], thumbnail: { src: "/assets/FTL009_jacket_test_2.jpg", alt: "Jura" }, href: "/releases/#local-rel-3" },
    { id: "local-news-8", title: "Jordan Playfair album release concert", category: "news", publishedAt: "2024-03-26T00:00:00.000Z", dateLabel: "Mar 2024", tags: ["news"], thumbnail: { src: "/assets/FTL005_artwork_casette_export.jpg", alt: "Jordan Playfair" }, href: "/news/#local-news-8" },
    { id: "local-evt-3", title: "Astrid Sonne - Tara Clerkin Trio at CPH Distillery", category: "events", publishedAt: "2024-02-10T00:00:00.000Z", dateLabel: "Feb 2024", tags: ["events"], thumbnail: { src: "/assets/FTL001 SUMMER 1 FOR WEB.png", alt: "CPH Distillery" }, href: "/events/#local-evt-3" },
    { id: "local-news-9", title: "ML Buch on US tour", category: "news", publishedAt: "2023-11-01T00:00:00.000Z", dateLabel: "Nov 2023", tags: ["news"], thumbnail: { src: "/assets/FTL001 SPRING 1 FOR WEB.png", alt: "ML Buch" }, href: "/news/#local-news-9" },
    { id: "local-rel-4", title: "Affectionately - Suntub", category: "releases", publishedAt: "2023-08-12T00:00:00.000Z", dateLabel: "Aug 2023", tags: ["releases"], thumbnail: { src: "/assets/FTL003 process 7.png", alt: "Affectionately" }, href: "/releases/#local-rel-4" },
    { id: "local-evt-4", title: "CTM x Frederik Worm at Lille Vega", category: "events", publishedAt: "2023-06-01T00:00:00.000Z", dateLabel: "Jun 2023", tags: ["events"], thumbnail: { src: "/assets/FTL001 WINTER 1 FOR WEB.png", alt: "CTM Vega" }, href: "/events/#local-evt-4" },
    { id: "local-rel-5", title: "Pink Must - ML Buch", category: "releases", publishedAt: "2023-03-18T00:00:00.000Z", dateLabel: "Mar 2023", tags: ["releases"], thumbnail: { src: "/assets/FTL001 FALL 3 FOR WEB.png", alt: "Pink Must" }, href: "/releases/#local-rel-5" },
    { id: "local-news-10", title: "Drama from CTM album Vind out today", category: "news", publishedAt: "2023-01-09T00:00:00.000Z", dateLabel: "Jan 2023", tags: ["news"], thumbnail: { src: "/assets/FTL001 SUMMER 2 FOR WEB.png", alt: "CTM Vind" }, href: "/news/#local-news-10" },
  ],
};
