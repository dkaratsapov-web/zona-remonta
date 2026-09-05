"use client";

import { Photo } from "@/components/ui/Photo";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { LeadForm } from "@/components/ui/LeadForm";

export function FinalCta() {
  return (
    <section className="final-cta" id="final-cta">
      <div className="final-cta__media">
        <Photo variant="night" floor edges />
      </div>
      <span className="final-cta__scrim" aria-hidden="true" />

      <div className="container final-cta__grid">
        <div>
          <SectionLabel number="11" title="Обсудим объект" />
          <h2 className="final-cta__title">
            ЕСТЬ ОБЪЕКТ?
            <br />
            ДАВАЙТЕ
            <br />
            ОБСУДИМ.
          </h2>
          <p className="lead" style={{ marginTop: 32, maxWidth: 460 }}>
            Опишите задачу — подскажем возможный формат работ и подготовим предварительный расчёт.
          </p>
        </div>

        <div className="final-cta__form">
          <LeadForm
            formId="final_cta"
            sourceSection="final_cta"
            submitLabel="Обсудить проект"
            withComment
          />
        </div>
      </div>
    </section>
  );
}
