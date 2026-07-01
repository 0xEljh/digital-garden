import Head from "next/head";
import { useRouter } from "next/router";
import type { HeadMetaProps } from "@/types/head-meta";
import { SITE, SITE_URL } from "@/lib/site";

const DEFAULT_TITLE = "Elijah's Digital Garden";
const DEFAULT_DESCRIPTION = SITE.description;
const DEFAULT_KEYWORDS = [
  "digital garden",
  "deep learning",
  "full-stack engineer",
  "machine learning engineer",
  "startup",
  "blog",
];
const DEFAULT_IMAGE = "digital-garden.jpg";

const HeadMeta = ({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  keywords = DEFAULT_KEYWORDS,
  image = DEFAULT_IMAGE,
  url,
}: HeadMetaProps) => {
  const router = useRouter();
  const siteUrl = SITE_URL;
  const canonicalUrl = url ?? `${siteUrl}${router.asPath}`;
  const ogImageUrl = image ? `${siteUrl}/images/${image}` : undefined;

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords.join(", ")} />}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      {ogImageUrl && <meta property="og:image" content={ogImageUrl} />}
      <meta
        name="twitter:card"
        content={ogImageUrl ? "summary_large_image" : "summary"}
      />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {ogImageUrl && <meta name="twitter:image" content={ogImageUrl} />}
      <link rel="canonical" href={canonicalUrl} />
    </Head>
  );
};

export default HeadMeta;
