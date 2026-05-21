const MOBILE_SECTIONS = ["news", "releases", "events"] as const;

/** Desktop post URL → mobile route (/news/x → /m/news/x). */
export function toMobileHref(href: string): string {
  for (const section of MOBILE_SECTIONS) {
    const prefix = `/${section}/`;
    if (href.startsWith(prefix)) {
      return `/m${href}`;
    }
  }
  if (href === "/home" || href === "/home/") return "/m/home/";
  if (href === "/about" || href === "/about/") return "/m/about/";
  if (href === "/archive" || href === "/archive/") return "/m/archive/";
  return href;
}

export function isMobilePath(pathname: string): boolean {
  return pathname === "/m" || pathname.startsWith("/m/");
}
