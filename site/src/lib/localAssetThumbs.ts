const localAssetThumbMap: Record<string, string> = {
  "/assets/image-mockup1.png": "/assets/archive-thumbs/image-mockup1.jpg",
  "/assets/FTL005_artwork_casette_export.jpg": "/assets/archive-thumbs/FTL005_artwork_casette_export.jpg",
  "/assets/FTL001 FALL 0 FOR WEB.png": "/assets/archive-thumbs/FTL001-FALL-0-FOR-WEB.jpg",
  "/assets/FTL003 process 4.png": "/assets/archive-thumbs/FTL003-process-4.jpg",
  "/assets/FTL003 process 5.png": "/assets/archive-thumbs/FTL003-process-5.jpg",
  "/assets/FTL003 process 7.png": "/assets/archive-thumbs/FTL003-process-7.jpg",
  "/assets/FTL010_Album_DSP copy.jpg": "/assets/archive-thumbs/FTL010_Album_DSP_copy.jpg",
  "/assets/new_crop.jpg": "/assets/archive-thumbs/new_crop.jpg",
  "/assets/FTL001 FALL 1 FOR WEB.png": "/assets/archive-thumbs/FTL001-FALL-1-FOR-WEB.jpg",
  "/assets/FTL001 FALL 2 FOR WEB.png": "/assets/archive-thumbs/FTL001-FALL-2-FOR-WEB.jpg",
  "/assets/FTL009_jacket_test_2.jpg": "/assets/archive-thumbs/FTL009_jacket_test_2.jpg",
  "/assets/FTL001 SUMMER 1 FOR WEB.png": "/assets/archive-thumbs/FTL001-SUMMER-1-FOR-WEB.jpg",
  "/assets/FTL001 SPRING 1 FOR WEB.png": "/assets/archive-thumbs/FTL001-SPRING-1-FOR-WEB.jpg",
  "/assets/FTL001 WINTER 1 FOR WEB.png": "/assets/archive-thumbs/FTL001-WINTER-1-FOR-WEB.jpg",
  "/assets/FTL001 FALL 3 FOR WEB.png": "/assets/archive-thumbs/FTL001-FALL-3-FOR-WEB.jpg",
  "/assets/FTL001 SUMMER 2 FOR WEB.png": "/assets/archive-thumbs/FTL001-SUMMER-2-FOR-WEB.jpg",
};

export function getLocalThumbSrc(src: string): string {
  return localAssetThumbMap[src] ?? src;
}
