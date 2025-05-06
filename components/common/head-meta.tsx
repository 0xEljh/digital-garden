import Head from "next/head";
import { useRouter } from "next/router";

const DEFAULT_TITLE = "Elijah's Digital Garden";
const DEFAULT_DESCRIPTION =
  "Digital garden of a full-stack deep learning engineer, trying to find his way in the startup world.";
const DEFAULT_KEYWORDS = [
  "digital garden",
  "deep learning",
  "full-stack engineer",
  "startup",
  "blog",
];

export interface HeadMetaProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
}

const HeadMeta= ({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  keywords = DEFAULT_KEYWORDS,
  image,
  url,
}: HeadMetaProps) => {
  const router = useRouter();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
  const canonicalUrl = url ?? `${siteUrl}${router.asPath}`;
  const ogImageUrl = image ? `${siteUrl}${image}` : undefined;

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords.join(", ")} />}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      {ogImageUrl && <meta property="og:image" content={ogImageUrl} />}
      <meta name="twitter:card" content={ogImageUrl ? "summary_large_image" : "summary"} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {ogImageUrl && <meta name="twitter:image" content={ogImageUrl} />}
      <link rel="canonical" href={canonicalUrl} />
    </Head>
  );
};

export default HeadMeta;
