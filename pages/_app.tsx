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

  // Merge page-specific SEO if provided
  const pageHeadMeta = (pageProps as any).headMeta || {};

  const getLayout =
    Component.getLayout ?? ((page) => <DefaultLayout>{page}</DefaultLayout>);

  return (
    <Provider>
      <Fonts />
      <HeadMeta {...pageHeadMeta} />
      <PageTransition key={router.asPath}>
        {getLayout(<Component {...pageProps} />)}
      </PageTransition>
    </Provider>
  );
}
