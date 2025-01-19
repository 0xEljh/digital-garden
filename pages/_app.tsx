import type { AppProps } from "next/app";
import Head from "next/head";
import { ChakraProvider } from "@chakra-ui/react";
import Fonts from "@/styles/fonts";
import {theme} from "@/styles/theme";
import {useDarkMode} from "@/lib/hooks/useDarkMode";
import { useEffect } from "react";

export default function App({ Component, pageProps }: AppProps) {
  const { setDarkMode } = useDarkMode();
  useEffect(() => {
    setDarkMode();
  }, []);
  const metaDescription =
    "Digital garden of a full-stack deep learning engineer, trying to find his way in the startup world.";
  return (
    <ChakraProvider theme={theme}>
      <Fonts />
      <Head>
        <title>Elijah&apos;s Digital Garden</title>
        <meta
          name="description"
          key="description"
          content={metaDescription}
        />
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
      <Component {...pageProps} />
    </ChakraProvider>
  );
}
