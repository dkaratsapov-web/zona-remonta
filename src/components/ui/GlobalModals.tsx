"use client";

import { useUi } from "./UiContext";
import { Modal } from "./Modal";
import { LeadForm } from "./LeadForm";
import { Calculator } from "@/components/sections/Calculator";

/**
 * Окна, доступные с любой кнопки на странице.
 *
 * Формы не прячутся за якорями: кнопка открывает калькулятор или заявку
 * прямо поверх текущего экрана, и человек не теряет место, на котором был.
 */
export function GlobalModals() {
  const { calculator, lead, closeCalculator, closeLead } = useUi();

  return (
    <>
      {calculator.open ? (
        <Modal open onClose={closeCalculator} labelledBy="calculator-modal-title">
          <div className="calc-modal">
            <h2 className="calc-modal__title" id="calculator-modal-title">
              Рассчитайте ваш проект
            </h2>
            <Calculator embedded initialObjectType={calculator.objectType} />
          </div>
        </Modal>
      ) : null}

      {lead ? (
        <Modal open onClose={closeLead} labelledBy="lead-modal-title">
          <div className="lead-modal">
            <h2 className="lead-modal__title" id="lead-modal-title">
              {lead.title}
            </h2>
            <p className="lead-modal__text">{lead.text}</p>
            <LeadForm
              formId={lead.formId}
              sourceSection={lead.sourceSection}
              submitLabel="Отправить заявку"
              withComment
            />
          </div>
        </Modal>
      ) : null}
    </>
  );
}
