import type { AppProps } from "next/app";
import Head from "next/head";
import Fonts from "@/styles/fonts";
import { useRouter } from "next/router";
import { Provider } from "@/components/ui/provider";
import { PageTransition } from "@/components/PageTransition";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const metaDescription =
    "Digital garden of a full-stack deep learning engineer, trying to find his way in the startup world.";
  return (
    <Provider>
      <Fonts />
      <Head>
        <title>Elijah&apos;s Digital Garden</title>
        <meta name="description" key="description" content={metaDescription} />
        <meta
          property="og:title"
          key="og:title"
          content="Elijah's Digital Garden"
        />
        <meta
          property="og:description"
          key="og:description"
          content={metaDescription}
        />
        <meta
          name="twitter:title"
          key="twitter:title"
          content="Elijah's Digital Garden"
        />
        <meta
          name="twitter:description"
          key="twitter:description"
          content={metaDescription}
        />
      </Head>
      <PageTransition key={router.asPath}>
        <Component {...pageProps} />
      </PageTransition>
    </Provider>
  );
}
