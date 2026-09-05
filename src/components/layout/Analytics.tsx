"use client";

import { useEffect } from "react";
import Script from "next/script";
import { siteConfig } from "@/data/siteConfig";
import { initAttribution } from "@/lib/attribution";

/**
 * Счётчики подключаются только если ID заданы в env — пустой конфиг
 * не тянет лишние скрипты и не портит метрики производительности.
 */
export function Analytics() {
  useEffect(() => {
    initAttribution();
  }, []);

  const ym = siteConfig.analytics.yandexMetrikaId;
  const ga = siteConfig.analytics.googleAnalyticsId;

  return (
    <>
      {ym ? (
        <Script id="ym" strategy="afterInteractive">
          {`(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
            m[i].l=1*new Date();k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
            (window, document,'script','https://mc.yandex.ru/metrika/tag.js','ym');
            ym(${ym}, 'init', {clickmap:true, trackLinks:true, accurateTrackBounce:true});`}
        </Script>
      ) : null}

      {ga ? (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${ga}`} strategy="afterInteractive" />
          <Script id="ga" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}
              gtag('js', new Date());gtag('config','${ga}');`}
          </Script>
        </>
      ) : null}
    </>
  );
}
