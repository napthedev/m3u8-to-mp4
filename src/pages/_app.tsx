import "../styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>M3U8 To Mp4 Downloader</title>
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
