import type { AppProps } from "next/app";
import Fonts from "@/styles/fonts";
import { useRouter } from "next/router";
import HeadMeta from "@/components/common/head-meta";
import { LazyMotion, domAnimation } from "motion/react";

import type { ReactElement, ReactNode } from "react";
import type { NextPage } from "next";

import { Provider } from "@/components/ui/provider";
import { PageTransition } from "@/components/animations/page-transition";
import { DefaultLayout } from "@/components/layout";
import type { HeadMetaProps } from "@/types/head-meta";

export type NextPageWithLayout<P = object, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps<{ headMeta?: HeadMetaProps }> & {
  Component: NextPageWithLayout;
};

export default function App({ Component, pageProps }: AppPropsWithLayout) {
  const router = useRouter();

  // Merge page-specific SEO if provided
  const pageHeadMeta = pageProps.headMeta || {};

  const getLayout =
    Component.getLayout ?? ((page) => <DefaultLayout>{page}</DefaultLayout>);

  return (
    <Provider>
      <LazyMotion features={domAnimation}>
        <Fonts />
        <HeadMeta {...pageHeadMeta} />
        <PageTransition key={router.asPath}>
          {getLayout(<Component {...pageProps} />)}
        </PageTransition>
      </LazyMotion>
    </Provider>
  );
}
