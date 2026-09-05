"use client";

import { SectionLabel } from "@/components/ui/SectionLabel";
import { LeadForm } from "@/components/ui/LeadForm";

/**
 * Самый важный блок по смыслу: у компании нет закрытого списка услуг.
 * Форма стоит прямо здесь — человека не нужно вести через полсайта.
 */
export function OtherWorks() {
  return (
    <section className="section other-works" id="other-works">
      <span className="other-works__glow" aria-hidden="true" />
      <div className="container other-works__grid">
        <div>
          <SectionLabel number="09" title="Нестандартные работы" />
          <h2 className="other-works__title">
            НЕТ НУЖНОЙ
            <br />
            РАБОТЫ
            <br />
            <span style={{ color: "var(--accent-text)" }}>В СПИСКЕ?</span>
          </h2>
          <p className="lead" style={{ marginTop: 36, maxWidth: 520 }}>
            Опишите задачу. Мы выполняем различные виды строительных и монтажных работ
            и скажем, чем можем помочь.
          </p>
        </div>

        <div className="other-works__form">
          <LeadForm
            formId="custom_work"
            sourceSection="other_works"
            submitLabel="Рассказать о задаче"
            withComment
            commentLabel="Коротко опишите задачу"
            commentPlaceholder="Например: нужно смонтировать перегородки и заменить окна на объекте 60 м²"
            compact
          />
        </div>
      </div>
    </section>
  );
}
