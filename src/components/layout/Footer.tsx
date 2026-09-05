"use client";

import Link from "next/link";
import { siteConfig, hasPhone } from "@/data/siteConfig";
import { track } from "@/lib/analytics";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="site-footer" id="contacts">
      <div className="container site-footer__grid">
        <div>
          <Logo />
          <p className="site-footer__tagline">{siteConfig.tagline}</p>
        </div>

        <div>
          <p className="label site-footer__head">Разделы</p>
          <ul className="site-footer__list">
            {siteConfig.nav.map((item) => (
              <li key={item.href}>
                <a href={item.href}>{item.label}</a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="label site-footer__head">Контакты</p>
          <ul className="site-footer__list">
            <li>
              {hasPhone ? (
                <a href={`tel:${siteConfig.contacts.phone}`} onClick={() => track("phone_click", { place: "footer" })}>
                  {siteConfig.contacts.phoneDisplay}
                </a>
              ) : (
                <span style={{ color: "var(--dim)" }}>{siteConfig.contacts.phoneDisplay}</span>
              )}
            </li>
            <li>
              {siteConfig.contacts.email ? (
                <a href={`mailto:${siteConfig.contacts.email}`}>{siteConfig.contacts.email}</a>
              ) : (
                <span style={{ color: "var(--dim)" }}>—@—.—</span>
              )}
            </li>
            <li>
              {siteConfig.contacts.telegram ? (
                <a href={siteConfig.contacts.telegram} onClick={() => track("messenger_click", { kind: "telegram" })}>
                  Telegram
                </a>
              ) : (
                <span style={{ color: "var(--dim)" }}>Telegram</span>
              )}
            </li>
            <li>
              {siteConfig.contacts.whatsapp ? (
                <a href={siteConfig.contacts.whatsapp} onClick={() => track("messenger_click", { kind: "whatsapp" })}>
                  WhatsApp
                </a>
              ) : (
                <span style={{ color: "var(--dim)" }}>WhatsApp</span>
              )}
            </li>
          </ul>
        </div>

        <div className="site-footer__docs">
          <p className="label site-footer__head">Документы</p>
          <ul className="site-footer__list">
            <li>
              <Link href="/privacy/">Политика конфиденциальности</Link>
            </li>
            <li>
              <Link href="/consent/">Согласие на обработку данных</Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="container">
        <hr className="hairline" style={{ marginTop: 56 }} />
        <p className="site-footer__legal">
          © {new Date().getFullYear()} {siteConfig.name}
          {siteConfig.legal.entity ? ` · ${siteConfig.legal.entity}` : ""}
        </p>
      </div>

      <div className="site-footer__bigword" aria-hidden="true">
        <span className="wordmark">{siteConfig.shortName}</span>
      </div>
    </footer>
  );
}
