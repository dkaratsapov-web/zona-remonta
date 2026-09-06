"use client";

import { useEffect, useState } from "react";
import { Phone, Send, MessageCircle } from "lucide-react";
import { siteConfig, hasPhone } from "@/data/siteConfig";
import { track } from "@/lib/analytics";
import { useUi, LEAD_TOPICS } from "@/components/ui/UiContext";
import { Logo } from "./Logo";

/**
 * Кнопка мессенджера. Есть ссылка — обычный переход; ссылки нет —
 * открывается заявка. Мёртвых кнопок в шапке быть не должно.
 */
function MessengerButton({
  label,
  href,
  onFallback,
  icon,
}: {
  label: string;
  href: string;
  onFallback: () => void;
  icon: React.ReactNode;
}) {
  if (href) {
    return (
      <a href={href} className="header-contacts__im" aria-label={label} title={label}>
        {icon}
      </a>
    );
  }
  return (
    <button
      type="button"
      className="header-contacts__im"
      aria-label={label}
      title={label}
      aria-haspopup="dialog"
      onClick={onFallback}
    >
      {icon}
    </button>
  );
}

/** Кнопка мессенджера в мобильном меню: ссылка, если аккаунт задан, иначе заявка. */
function MobileMenuMessenger({
  label,
  href,
  onFallback,
  icon,
}: {
  label: string;
  href: string;
  onFallback: () => void;
  icon: React.ReactNode;
}) {
  if (href) {
    return (
      <a href={href} className="btn btn--ghost mobile-menu__im" onClick={() => track("messenger_click", { kind: label.toLowerCase() })}>
        {icon}
        {label}
      </a>
    );
  }
  return (
    <button type="button" className="btn btn--ghost mobile-menu__im" aria-haspopup="dialog" onClick={onFallback}>
      {icon}
      {label}
    </button>
  );
}

export function Header() {
  const { openLead } = useUi();
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

            <span className="header-contacts">
              <a
                href={`tel:${siteConfig.contacts.phone}`}
                className="header-contacts__phone"
                onClick={() => track("phone_click", { place: "header" })}
              >
                <Phone size={15} aria-hidden="true" />
                <span>{siteConfig.contacts.phoneDisplay}</span>
              </a>

              {/*
                Мессенджеры: пока аккаунтов компании нет, кнопка не ведёт
                в никуда и не притворяется рабочей ссылкой — она открывает
                заявку, чтобы обращение всё равно дошло.
              */}
              <MessengerButton
                label="Написать в Telegram"
                href={siteConfig.contacts.telegram}
                onFallback={() => openLead(LEAD_TOPICS.messenger("Telegram"))}
                icon={<Send size={16} aria-hidden="true" />}
              />
              <MessengerButton
                label="Написать в MAX"
                href={siteConfig.contacts.max}
                onFallback={() => openLead(LEAD_TOPICS.messenger("MAX"))}
                icon={<MessageCircle size={16} aria-hidden="true" />}
              />
            </span>
            <button
              type="button"
              className="btn btn--ghost site-nav__cta"
              aria-haspopup="dialog"
              onClick={() => {
                track("final_cta_click", { place: "header" });
                openLead(LEAD_TOPICS.discuss);
              }}
            >
              Обсудить проект
            </button>
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
          <Logo />
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
          {/*
            Мессенджеры дублируют десктопную шапку: пока аккаунтов нет,
            кнопка открывает заявку, а не ведёт в никуда. Раньше блок
            был завязан на заполненные ссылки и на телефоне пропадал
            целиком — связаться из меню было нечем, кроме звонка.
          */}
          <div className="mobile-menu__messengers">
            <MobileMenuMessenger
              label="Telegram"
              href={siteConfig.contacts.telegram}
              onFallback={() => {
                setMenuOpen(false);
                openLead(LEAD_TOPICS.messenger("Telegram"));
              }}
              icon={<Send size={16} aria-hidden="true" />}
            />
            <MobileMenuMessenger
              label="MAX"
              href={siteConfig.contacts.max}
              onFallback={() => {
                setMenuOpen(false);
                openLead(LEAD_TOPICS.messenger("MAX"));
              }}
              icon={<MessageCircle size={16} aria-hidden="true" />}
            />
          </div>

          <button
            type="button"
            className="btn btn--primary mobile-menu__cta"
            aria-haspopup="dialog"
            onClick={() => {
              setMenuOpen(false);
              track("final_cta_click", { place: "mobile_menu" });
              openLead(LEAD_TOPICS.discuss);
            }}
          >
            Обсудить проект
          </button>
        </div>
      </div>
    </>
  );
}
