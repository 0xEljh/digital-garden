import { describe, expect, it } from "bun:test";
import { parseArxivAtom } from "./arxiv";

const FEED = `<?xml version='1.0' encoding='UTF-8'?>
<feed xmlns:opensearch="http://a9.com/-/spec/opensearch/1.1/" xmlns:arxiv="http://arxiv.org/schemas/atom" xmlns="http://www.w3.org/2005/Atom">
  <title>arXiv Query: search_query=&amp;id_list=1911.02150&amp;start=0&amp;max_results=1</title>
  <entry>
    <id>http://arxiv.org/abs/1911.02150v1</id>
    <title>Fast Transformer Decoding:
  One Write-Head is All You Need</title>
    <updated>2019-11-06T00:19:05Z</updated>
    <summary>Multi-head attention layers &amp; the memory-bandwidth cost of
  repeatedly loading "keys" and "values".</summary>
    <author>
      <name>Noam Shazeer</name>
    </author>
    <published>2019-11-06T00:19:05Z</published>
  </entry>
</feed>`;

const MULTI_AUTHOR_ENTRY = FEED.replace(
  "<published>",
  `<author><name>A Two</name></author>
   <author><name>B Three</name></author>
   <author><name>C Four</name></author>
   <published>`
);

// An id_list hit for a nonexistent ID returns a feed with an <entry> whose
// title is "Error" and no published date — treat anything without a real
// title+id as a miss.
const EMPTY_FEED = `<?xml version='1.0' encoding='UTF-8'?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>arXiv Query</title>
  <opensearch:totalResults xmlns:opensearch="http://a9.com/-/spec/opensearch/1.1/">0</opensearch:totalResults>
</feed>`;

describe("parseArxivAtom", () => {
  it("extracts title, authors, year, abstract from a single-entry feed", () => {
    const paper = parseArxivAtom(FEED);
    expect(paper).not.toBeNull();
    expect(paper!.title).toBe(
      "Fast Transformer Decoding: One Write-Head is All You Need"
    );
    expect(paper!.authors).toEqual(["Noam Shazeer"]);
    expect(paper!.year).toBe(2019);
    expect(paper!.abstract).toBe(
      'Multi-head attention layers & the memory-bandwidth cost of repeatedly loading "keys" and "values".'
    );
  });

  it("does not confuse the feed-level <title> with the entry title", () => {
    expect(parseArxivAtom(FEED)!.title).not.toContain("arXiv Query");
  });

  it("collects all authors in order", () => {
    expect(parseArxivAtom(MULTI_AUTHOR_ENTRY)!.authors).toEqual([
      "Noam Shazeer",
      "A Two",
      "B Three",
      "C Four",
    ]);
  });

  it("returns null for a feed with no entry", () => {
    expect(parseArxivAtom(EMPTY_FEED)).toBeNull();
  });
});
