import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html>
      <Head>
        <meta
          name="description"
          content="Pneumonia Detector using Tensorflow.js"
        />
        <link
          href="https://api.fontshare.com/css?f[]=satoshi@300,400,700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <body className="bg-slate-900 text-slate-50">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
