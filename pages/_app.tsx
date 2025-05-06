import type { AppProps } from "next/app";
import Fonts from "@/styles/fonts";
import { useRouter } from "next/router";
import HeadMeta from "@/components/common/head-meta";

import type { ReactElement, ReactNode } from "react";
import type { NextPage } from "next";

import { Provider } from "@/components/ui/provider";
import { PageTransition } from "@/components/animations/page-transition";
import { DefaultLayout } from "@/components/layout";

export type NextPageWithLayout<P = object, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

export default function App({ Component, pageProps }: AppPropsWithLayout) {
  const router = useRouter();
  const defaultTitle = "Elijah's Digital Garden";
  const defaultDescription =
    "Digital garden of a full-stack deep learning engineer, trying to find his way in the startup world.";
  const defaultKeywords = [
    "digital garden",
    "deep learning",
    "full-stack engineer",
    "startup",
    "blog"
  ];
  // Merge page-specific SEO if provided
  const pageSeo = (pageProps as any).seo || {};
  const seo = {
    title: pageSeo.title ?? defaultTitle,
    description: pageSeo.description ?? defaultDescription,
    keywords: pageSeo.keywords ?? defaultKeywords,
    image: pageSeo.image,
    url: pageSeo.url
  };

  const getLayout =
    Component.getLayout ?? ((page) => <DefaultLayout>{page}</DefaultLayout>);

  return (
    <Provider>
      <Fonts />
      <HeadMeta {...seo} />
      <PageTransition key={router.asPath}>
        {getLayout(<Component {...pageProps} />)}
      </PageTransition>
    </Provider>
  );
}
