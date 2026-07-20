import type { AppProps } from "next/app";
import Fonts from "@/styles/fonts";
import HeadMeta from "@/components/common/head-meta";
import { LazyMotion, MotionConfig, domAnimation } from "motion/react";

import type { ReactElement, ReactNode } from "react";
import type { NextPage } from "next";

import { Provider } from "@/components/ui/provider";
import { CommandPaletteProvider } from "@/components/common/command-palette";
import { DefaultLayout } from "@/components/layout";
import type { HeadMetaProps } from "@/types/head-meta";

export type NextPageWithLayout<P = object, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps<{ headMeta?: HeadMetaProps }> & {
  Component: NextPageWithLayout;
};

export default function App({ Component, pageProps }: AppPropsWithLayout) {
  // Merge page-specific SEO if provided
  const pageHeadMeta = pageProps.headMeta || {};

  const getLayout =
    Component.getLayout ?? ((page) => <DefaultLayout>{page}</DefaultLayout>);

  return (
    <Provider>
      <CommandPaletteProvider>
        <LazyMotion features={domAnimation}>
          <MotionConfig reducedMotion="user">
            <Fonts />
            <HeadMeta {...pageHeadMeta} />
            {getLayout(<Component {...pageProps} />)}
          </MotionConfig>
        </LazyMotion>
      </CommandPaletteProvider>
    </Provider>
  );
}
