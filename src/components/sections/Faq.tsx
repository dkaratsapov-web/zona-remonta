"use client";

import { useState } from "react";
import { faq } from "@/data/content";
import { siteConfig, hasPhone, hasMessengers } from "@/data/siteConfig";
import { track } from "@/lib/analytics";
import { SectionLabel } from "@/components/ui/SectionLabel";

export function Faq() {
  const [open, setOpen] = useState(0);

  return (
    <section className="section faq" id="faq">
      <div className="container faq__grid">
        <div>
          <SectionLabel number="10" title="Вопросы" />
          <ul className="faq__list">
            {faq.map((item, index) => {
              const expanded = open === index;
              return (
                <li key={item.q}>
                  <h3>
                    <button
                      type="button"
                      className="faq__q"
                      aria-expanded={expanded}
                      aria-controls={`faq-${index}`}
                      onClick={() => setOpen(expanded ? -1 : index)}
                    >
                      <span>{item.q}</span>
                      <span className="faq__sign" aria-hidden="true">
                        {expanded ? "−" : "+"}
                      </span>
                    </button>
                  </h3>
                  <div id={`faq-${index}`} className="faq__a" hidden={!expanded}>
                    <p>{item.a}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="faq__aside">
          <h3 className="faq__aside-title">Не нашли ответ?</h3>
          <p className="lead" style={{ marginTop: 18 }}>
            Позвоните или напишите — ответим на любой вопрос по объекту, срокам и составу работ.
          </p>
          {hasPhone ? (
            <a
              href={`tel:${siteConfig.contacts.phone}`}
              className="faq__phone"
              onClick={() => track("phone_click", { place: "faq" })}
            >
              {siteConfig.contacts.phoneDisplay}
            </a>
          ) : (
            <p className="faq__phone" style={{ color: "var(--dim)" }}>
              {siteConfig.contacts.phoneDisplay}
            </p>
          )}
          {hasMessengers ? (
            <div className="faq__messengers">
              {siteConfig.contacts.telegram ? (
                <a href={siteConfig.contacts.telegram} className="btn btn--ghost">
                  Telegram
                </a>
              ) : null}
              {siteConfig.contacts.whatsapp ? (
                <a href={siteConfig.contacts.whatsapp} className="btn btn--ghost">
                  WhatsApp
                </a>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
