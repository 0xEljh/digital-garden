import { ComponentType } from "react";

export type PortfolioCategory = 
  "Web Development" |
  "Deep Learning" |
  "Crypto" |
  "Data Science" |
  "Research" |
  "Open Source";

export type PortfolioEntry = {
  title: string;
  slug: string;
  size: 1 | 2; // 1 for small, 2 for large
  shortDescription: string;
  longDescription?: string;
  link: string;
  icon: string;
  categories: PortfolioCategory[];
  date: string;
  techStack?: string[];
  thumbnail?: string;
  github?: string;
};

export type PortfolioEntryMetadata = Omit<PortfolioEntry, 'icon'> & {
  icon: string;
};
