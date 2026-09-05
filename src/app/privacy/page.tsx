import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/data/siteConfig";
import { Logo } from "@/components/layout/Logo";

export const metadata: Metadata = {
  title: "Политика конфиденциальности — Зона Ремонта",
  robots: { index: false, follow: true },
};

/**
 * Технический каркас страницы. Юридический текст предоставляет заказчик
 * или его юрист — разработчик обеспечивает публикацию и получение согласия,
 * но не пишет юридические формулировки за клиента.
 */
export default function PrivacyPage() {
  return (
    <div className="legal">
      <div className="container">
        <Link href="/" className="legal__back">
          <Logo size={15} />
        </Link>

        <h1 className="legal__title">Политика конфиденциальности</h1>

        <div className="legal__placeholder">
          <p className="label" style={{ color: "var(--accent-text)", marginBottom: 14 }}>
            Production blocker
          </p>
          <p>
            Текст политики обработки персональных данных предоставляется заказчиком
            или его юристом. Публиковать сайт с формами до размещения этого документа нельзя.
          </p>
        </div>

        <div className="legal__body">
          <h2>Что уже реализовано технически</h2>
          <ul>
            <li>Отправка формы невозможна без явной отметки о согласии.</li>
            <li>Данные уходят только по нажатию кнопки — частичных отправок нет.</li>
            <li>До получения согласия в браузере не создаётся стойкий идентификатор посетителя.</li>
            <li>Собираются: имя, телефон, комментарий, ответы калькулятора и источник перехода.</li>
          </ul>

          <h2>Что должен указать заказчик</h2>
          <ul>
            <li>Наименование оператора персональных данных и реквизиты.</li>
            <li>Цели и сроки обработки, порядок отзыва согласия.</li>
            <li>Куда фактически передаются заявки (CRM, мессенджер, почта).</li>
            <li>Контакт для обращений субъектов персональных данных.</li>
          </ul>

          <p className="legal__note">
            Реквизиты подставляются из <code>src/data/siteConfig.ts</code> и здесь пока пусты:{" "}
            {siteConfig.legal.entity || "—"}
          </p>
        </div>
      </div>
    </div>
  );
}
