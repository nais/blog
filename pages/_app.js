import "../public/css/fonts.sass";
import React, { useEffect } from "react";
import Head from "next/head";
import Link from "next/link";

const URL_PREFIX = process.env.basePath;

const UserHeader = () => (
  <header>
    <div className="logo">
      <Link href={"/"} passHref>
        <a>
          <img src={`${URL_PREFIX}/logo.png`} alt="NAIS logo" />
        </a>
      </Link>
    </div>
    <Link href={"/"} passHref>
      <a>
        <h1 id={"index-heading"}>nais blog</h1>
      </a>
    </Link>
  </header>
);

const GlobalMetaTags = () => (
  <Head>
    <title>nais blog</title>
    <link
      rel="apple-touch-icon"
      sizes="180x180"
      href={URL_PREFIX + "/apple-touch-icon.png"}
    />
    <link
      rel="icon"
      type="image/png"
      sizes="32x32"
      href={URL_PREFIX + "/favicon-32x32.png"}
    />
    <link
      rel="icon"
      type="image/png"
      sizes="16x16"
      href={URL_PREFIX + "/favicon-16x16.png"}
    />
    <link rel="manifest" href={URL_PREFIX + "/sitemanifest.json"} />
    <link
      rel="mask-icon"
      href={URL_PREFIX + "/safari-pinned-tab.svg"}
      color="#66cbec"
    />
    <meta name="msapplication-TileColor" content="#66cbec" />
    <meta name="theme-color" content="#66cbec" />
    <meta property="og:image" content={URL_PREFIX + "/og-image.png"} />
    <meta property="og:type" content="website" />
    <link rel="alternate" hreflang="en" type="application/rss+xml" title="RSS" href="/blog/index.xml"></link>
  </Head>
);

const Footer = () => (
  <footer>
    © {new Date().getFullYear()} <a href={"https://nais.io"}>nais.io</a>
  </footer>
);

function MyApp({ Component, pageProps }) {
  return (
    <>
      <GlobalMetaTags />
      <UserHeader />
      <Component {...pageProps} />
      <Footer />
    </>
  );
}

export default MyApp;
