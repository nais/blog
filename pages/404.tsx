import Head from "next/head";
import React from "react";

export const Custom404 = () => (
   <>
      <Head>
         <title>nais blog - 404</title>
      </Head>
      <main>
         <article>
            <header>
               <h1>404</h1>
               <h2>We're sorry,</h2>
               <p>
                  the URL you have reached has been disconnected or it is no
                  longer in service.
               </p>
               <p>
                  If you feel you have reached this page in error, please check
                  the URL and try your GET again.
               </p>
            </header>
         </article>
      </main>
   </>
);

export default Custom404;
