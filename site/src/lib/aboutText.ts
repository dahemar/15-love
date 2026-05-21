export function splitAboutParagraphs(text: string): string[] {
  const lines = text.split("\n");
  const paragraphs: string[] = [];
  let current: string[] = [];

  const flush = () => {
    const block = current.join("\n").trim();
    if (block) paragraphs.push(block);
    current = [];
  };

  for (const line of lines) {
    const trimmedEnd = line.trimEnd();
    if (trimmedEnd === "/" || trimmedEnd === "/ ") {
      flush();
      continue;
    }

    if (/\/\s*$/.test(trimmedEnd)) {
      const withoutSlash = trimmedEnd.replace(/\/\s*$/, "").trimEnd();
      if (withoutSlash) current.push(withoutSlash);
      flush();
      continue;
    }

    current.push(line);
  }

  flush();
  return paragraphs.length ? paragraphs : [text.trim()].filter(Boolean);
}
