"use client";

import type { Service } from "@/data/services";
import { Modal } from "@/components/ui/Modal";
import { Photo } from "@/components/ui/Photo";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { track } from "@/lib/analytics";
import { useUi, LEAD_TOPICS } from "@/components/ui/UiContext";
import type { ObjectTypeId } from "@/data/calculatorConfig";

type Props = { service: Service | null; onClose: () => void };

/** Направление услуги → предвыбранный тип объекта в калькуляторе. */
const OBJECT_BY_SERVICE: Record<string, ObjectTypeId> = {
  apartments: "apartment",
  houses: "house",
  construction: "works",
  windows: "windows",
  other: "other",
  materials: "other",
};

export function ServiceModal({ service, onClose }: Props) {
  const { openCalculator, openLead } = useUi();
  if (!service) return null;

  return (
    <Modal open onClose={onClose} labelledBy={`service-modal-${service.id}`}>
      <div className="service-modal">
        <div className="service-modal__media">
          <Photo
            variant={service.photo}
            src={service.image}
            alt={service.imageAlt}
            edges
          />
          <span className="service-modal__num">{service.number}</span>
        </div>

        <div className="service-modal__body">
          <h2 className="service-modal__title" id={`service-modal-${service.id}`}>
            {service.title}
          </h2>
          <p className="service-modal__intro">{service.modal.intro}</p>

          <p className="label service-modal__label">Что входит</p>
          <ul className="service-modal__works">
            {service.modal.works.map((work) => (
              <li key={work}>
                <span aria-hidden="true" />
                {work}
              </li>
            ))}
          </ul>

          {service.modal.notes?.length ? (
            <ul className="service-modal__notes">
              {service.modal.notes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          ) : null}

          <div className="service-modal__actions">
            <MagneticButton
              onClick={() => {
                track("calculator_start", { from: `service_${service.id}` });
                onClose();
                openCalculator(OBJECT_BY_SERVICE[service.id] ?? null);
              }}
            >
              Рассчитать стоимость <span aria-hidden="true">→</span>
            </MagneticButton>
            <button
              type="button"
              className="link-underline"
              aria-haspopup="dialog"
              onClick={() => {
                track("final_cta_click", { from: `service_${service.id}` });
                onClose();
                openLead(LEAD_TOPICS.service(service.title, service.id));
              }}
              style={{ background: "none", border: 0, cursor: "pointer" }}
            >
              Обсудить задачу
            </button>
          </div>

          <p className="service-modal__foot">
            Точный объём и стоимость определяются после обсуждения объекта.
          </p>
        </div>
      </div>
    </Modal>
  );
}
