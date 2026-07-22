export interface ArxivPaper {
  title: string;
  authors: string[];
  year: number | null;
  abstract: string;
}

function decodeEntities(s: string): string {
  return s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");
}

function clean(s: string | undefined): string {
  return s ? decodeEntities(s.replace(/\s+/g, " ").trim()) : "";
}

/**
 * Parse the first <entry> of an arXiv export-API Atom feed
 * (https://export.arxiv.org/api/query?id_list=...).
 */
export function parseArxivAtom(xml: string): ArxivPaper | null {
  const entry = xml.match(/<entry>([\s\S]*?)<\/entry>/)?.[1];
  if (!entry) return null;

  const grab = (tag: string) =>
    entry.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`))?.[1];

  const title = clean(grab("title"));
  // Unknown IDs still yield an <entry> (titled "Error" / missing fields).
  if (!title || !grab("id")?.includes("arxiv.org/abs/")) return null;

  const authors = [...entry.matchAll(/<name>([\s\S]*?)<\/name>/g)].map((m) =>
    clean(m[1])
  );
  const published = grab("published");
  const year = published ? new Date(published).getFullYear() : null;

  return { title, authors, year, abstract: clean(grab("summary")) };
}
