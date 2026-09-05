"use client";

import { useEffect, useState } from "react";
import { siteConfig, hasPhone, hasMessengers } from "@/data/siteConfig";
import { track } from "@/lib/analytics";
import { Logo } from "./Logo";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Меню на весь экран блокирует прокрутку страницы под собой
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <header className={`site-header ${scrolled ? "site-header--solid" : ""}`}>
        <div className="site-header__inner">
          <a href="#top" aria-label={`${siteConfig.name} — наверх`} style={{ textDecoration: "none", color: "inherit" }}>
            <Logo />
          </a>

          <nav className="site-nav" aria-label="Основная навигация">
            {siteConfig.nav.map((item) => (
              <a key={item.href} href={item.href} className="site-nav__link">
                {item.label}
              </a>
            ))}
            <a href="#final-cta" className="btn btn--ghost site-nav__cta">
              Обсудить проект
            </a>
          </nav>

          <button
            type="button"
            className="burger"
            aria-label={menuOpen ? "Закрыть меню" : "Открыть меню"}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span />
            <span />
          </button>
        </div>
      </header>

      <div id="mobile-menu" className={`mobile-menu ${menuOpen ? "mobile-menu--open" : ""}`} hidden={!menuOpen}>
        <div className="mobile-menu__head">
          <Logo size={15} />
          <button type="button" className="mobile-menu__close" aria-label="Закрыть меню" onClick={() => setMenuOpen(false)}>
            ✕
          </button>
        </div>

        <nav className="mobile-menu__nav" aria-label="Меню">
          {siteConfig.nav.map((item, index) => (
            <a
              key={item.href}
              href={item.href}
              className="mobile-menu__link"
              style={{ transitionDelay: `${0.06 * index + 0.05}s` }}
              onClick={() => setMenuOpen(false)}
            >
              <span className="mobile-menu__num">{String(index + 1).padStart(2, "0")}</span>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="mobile-menu__foot">
          {hasPhone ? (
            <a
              href={`tel:${siteConfig.contacts.phone}`}
              className="mobile-menu__phone"
              onClick={() => track("phone_click", { place: "mobile_menu" })}
            >
              {siteConfig.contacts.phoneDisplay}
            </a>
          ) : (
            <span className="mobile-menu__phone" style={{ color: "var(--dim)" }}>
              {siteConfig.contacts.phoneDisplay}
            </span>
          )}
          {hasMessengers ? (
            <div className="mobile-menu__messengers">
              {siteConfig.contacts.telegram ? (
                <a href={siteConfig.contacts.telegram} className="btn btn--ghost" onClick={() => track("messenger_click", { kind: "telegram" })}>
                  Telegram
                </a>
              ) : null}
              {siteConfig.contacts.whatsapp ? (
                <a href={siteConfig.contacts.whatsapp} className="btn btn--ghost" onClick={() => track("messenger_click", { kind: "whatsapp" })}>
                  WhatsApp
                </a>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}
