"use client";

import type { Service } from "@/data/services";
import { Modal } from "@/components/ui/Modal";
import { Photo } from "@/components/ui/Photo";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { track } from "@/lib/analytics";

type Props = { service: Service | null; onClose: () => void };

export function ServiceModal({ service, onClose }: Props) {
  if (!service) return null;

  const goTo = (hash: string, event: "calculator_start" | "final_cta_click") => {
    onClose();
    track(event, { from: `service_${service.id}` });
    // Закрытие возвращает фокус, поэтому прокрутку запускаем следующим кадром
    requestAnimationFrame(() => {
      document.querySelector(hash)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

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
            <MagneticButton onClick={() => goTo("#calculator", "calculator_start")}>
              Рассчитать стоимость <span aria-hidden="true">→</span>
            </MagneticButton>
            <button
              type="button"
              className="link-underline"
              onClick={() => goTo("#final-cta", "final_cta_click")}
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
