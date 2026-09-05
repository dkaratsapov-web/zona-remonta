import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/layout/Logo";

export const metadata: Metadata = {
  title: "Согласие на обработку персональных данных — Зона Ремонта",
  robots: { index: false, follow: true },
};

export default function ConsentPage() {
  return (
    <div className="legal">
      <div className="container">
        <Link href="/" className="legal__back">
          <Logo size={15} />
        </Link>

        <h1 className="legal__title">Согласие на обработку персональных данных</h1>

        <div className="legal__placeholder">
          <p className="label" style={{ color: "var(--accent-text)", marginBottom: 14 }}>
            Production blocker
          </p>
          <p>
            Текст согласия предоставляется заказчиком или его юристом. Ссылка на этот
            документ уже стоит рядом с чекбоксом во всех формах сайта.
          </p>
        </div>

        <div className="legal__body">
          <h2>Состав передаваемых данных</h2>
          <ul>
            <li>Имя и номер телефона.</li>
            <li>Комментарий к заявке, если он заполнен.</li>
            <li>Ответы калькулятора: тип объекта, площадь, состав работ.</li>
            <li>Источник перехода: UTM-метки, идентификаторы рекламных кликов, реферер.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
