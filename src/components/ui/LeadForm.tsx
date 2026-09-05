"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { leadSchema, submitLead, type LeadInput, type LeadPayload } from "@/lib/leadService";
import { grantPersistence } from "@/lib/attribution";
import { track } from "@/lib/analytics";
import { siteConfig, hasPhone } from "@/data/siteConfig";
import { TextField, TextArea, Honeypot } from "./Field";
import { formatPhone } from "@/lib/phone";
import { MagneticButton } from "./MagneticButton";

type Props = {
  formId: string;
  sourceSection: string;
  submitLabel: string;
  withComment?: boolean;
  commentLabel?: string;
  commentPlaceholder?: string;
  calculator?: LeadPayload["calculator"];
  compact?: boolean;
};

/**
 * Одна форма на весь сайт. Отличаются только formId и sourceSection —
 * по ним в аналитике видно, какой блок приносит заявки.
 *
 * Данные уходят ТОЛЬКО по нажатию кнопки: никаких частичных отправок
 * введённого телефона, пока человек не подтвердил согласие.
 */
export function LeadForm({
  formId,
  sourceSection,
  submitLabel,
  withComment = false,
  commentLabel = "Комментарий",
  commentPlaceholder = "Коротко об объекте",
  calculator,
  compact = false,
}: Props) {
  const [honeypot, setHoneypot] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  // Время открытия формы фиксируем в эффекте: Date.now() во время рендера
  // непредсказуем и запрещён правилами React Compiler.
  const startedAt = useRef(0);

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LeadInput>({ resolver: zodResolver(leadSchema), mode: "onBlur" });

  const phoneField = register("phone");

  const processLead = async (values: LeadInput) => {
    setStatus("sending");
    grantPersistence();

    const result = await submitLead(
      values,
      { formId, sourceSection, calculator },
      { honeypot, startedAt: startedAt.current },
    );

    if (result.ok) {
      setStatus("done");
      track("form_submit", { form_id: formId, section: sourceSection });
      return;
    }

    if (result.reason === "spam") {
      // Боту показываем успех, чтобы он не подбирал обход.
      setStatus("done");
      return;
    }

    setStatus("error");
    track("form_error", { form_id: formId, reason: result.reason });
  };

  // handleSubmit вызывается в обработчике события, а не во время рендера:
  // иначе ref со временем открытия формы читался бы на этапе отрисовки.
  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    void handleSubmit(processLead)(event);
  };

  if (status === "done") {
    return (
      <div className="form-status" role="status">
        <div
          aria-hidden="true"
          style={{
            width: 34,
            height: 34,
            border: "2px solid var(--accent)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--accent-text)",
            marginBottom: 16,
          }}
        >
          ✓
        </div>
        <p className="form-status__title">Заявка отправлена</p>
        <p className="form-status__text">Свяжемся с вами, чтобы обсудить объект.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <Honeypot value={honeypot} onChange={setHoneypot} />

      <TextField
        id={`${formId}-name`}
        label="Имя"
        placeholder="Как к вам обращаться"
        autoComplete="name"
        error={errors.name?.message}
        {...register("name")}
      />
      <TextField
        id={`${formId}-phone`}
        label="Телефон"
        type="tel"
        inputMode="tel"
        placeholder="+7 (___) ___-__-__"
        autoComplete="tel"
        maxLength={18}
        error={errors.phone?.message}
        {...phoneField}
        onChange={(event) => {
          // Приводим ввод к маске до того, как значение попадёт в форму:
          // иначе в состоянии копились бы буквы и лишние цифры.
          event.target.value = formatPhone(event.target.value);
          void phoneField.onChange(event);
        }}
        onFocus={(event) => {
          if (!event.target.value) event.target.value = "+7 ";
        }}
      />
      {withComment ? (
        <TextArea
          id={`${formId}-comment`}
          label={commentLabel}
          placeholder={commentPlaceholder}
          error={errors.comment?.message}
          {...register("comment")}
        />
      ) : null}

      <div className="consent">
        <input id={`${formId}-consent`} type="checkbox" {...register("consent")} />
        <span>
          <label htmlFor={`${formId}-consent`}>
            Согласен на обработку персональных данных и принимаю{" "}
            <Link href="/privacy/">политику конфиденциальности</Link>
          </label>
          {errors.consent ? (
            <span className="field__error" role="alert">
              {errors.consent.message}
            </span>
          ) : null}
        </span>
      </div>

      <div style={{ marginTop: 26 }}>
        <MagneticButton type="submit" disabled={status === "sending"}>
          {status === "sending" ? "Отправляем…" : submitLabel}
          <span aria-hidden="true">→</span>
        </MagneticButton>
      </div>

      {status === "error" ? (
        <p className="field__error" role="alert" style={{ marginTop: 16 }}>
          Не удалось отправить заявку. Проверьте соединение и попробуйте снова
          {hasPhone ? (
            <>
              {" "}
              или позвоните:{" "}
              <a href={`tel:${siteConfig.contacts.phone}`} style={{ color: "var(--text)" }}>
                {siteConfig.contacts.phoneDisplay}
              </a>
            </>
          ) : null}
          . Введённые данные сохранены.
        </p>
      ) : null}

      {!compact ? (
        <p className="form-note">
          Данные уходят только после нажатия кнопки. Форма защищена скрытым полем
          и проверкой времени заполнения.
        </p>
      ) : null}
    </form>
  );
}
