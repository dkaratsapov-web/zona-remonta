"use client";

import { useEffect, useRef, useState } from "react";
import {
  estimate,
  extraOptions,
  formatMoney,
  levels,
  objectTypes,
  pricingEnabled,
  type ObjectTypeId,
} from "@/data/calculatorConfig";
import { useSessionState } from "@/lib/hooks";
import { track } from "@/lib/analytics";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { LeadForm } from "@/components/ui/LeadForm";

type State = {
  objectType: ObjectTypeId | null;
  scope: string | null;
  amount: number;
  level: string | null;
  extras: string[];
  step: number;
};

const INITIAL: State = {
  objectType: null,
  scope: null,
  amount: 0,
  level: "standard",
  extras: [],
  step: 0,
};

type Props = {
  /** Внутри модального окна секция-обёртка и фон не нужны. */
  embedded?: boolean;
  /** Предвыбранный тип объекта — когда калькулятор открыт из карточки услуги. */
  initialObjectType?: ObjectTypeId | null;
};

/**
 * Калькулятор считает вживую: сумма пересчитывается на каждом изменении,
 * а не появляется только в конце. Человек видит, как выбор влияет на цену.
 *
 * Стоимость показывается диапазоном и сопровождается оговоркой: ставки
 * ориентировочные, точная цена — после осмотра объекта. Ни одна цифра
 * не зашита в компонент, всё берётся из calculatorConfig.
 */
export function Calculator({ embedded = false, initialObjectType = null }: Props) {
  const [state, setState] = useSessionState<State>(
    "zr_calculator_v2",
    initialObjectType ? { ...INITIAL, objectType: initialObjectType, step: 1 } : INITIAL,
  );
  const [showResult, setShowResult] = useState(false);
  const started = useRef(false);
  const lastStep = useRef(0);

  const objectType = objectTypes.find((item) => item.id === state.objectType) ?? null;
  const scope = objectType?.scopes.find((item) => item.id === state.scope) ?? null;
  const amount = state.amount || objectType?.range.default || 0;

  const result = estimate({
    objectType,
    scope,
    amount,
    levelId: state.level,
    extraIds: state.extras,
  });

  const steps = ["Объект", "Работы и объём", objectType?.askLevel ? "Уровень" : null, "Дополнительно"]
    .filter(Boolean) as string[];
  const totalSteps = steps.length;

  useEffect(() => {
    if (state.step > 0 && !started.current) {
      started.current = true;
      track("calculator_start");
    }
    if (state.step !== lastStep.current) {
      lastStep.current = state.step;
      track("calculator_step", { step: state.step + 1 });
    }
  }, [state.step]);

  useEffect(() => {
    const onLeave = () => {
      if (started.current && !showResult) track("calculator_abandon_step", { step: state.step + 1 });
    };
    window.addEventListener("pagehide", onLeave);
    return () => window.removeEventListener("pagehide", onLeave);
  }, [state.step, showResult]);

  const update = (patch: Partial<State>) => setState({ ...state, ...patch });

  const canGoNext =
    (state.step === 0 && state.objectType !== null) ||
    (state.step === 1 && state.scope !== null) ||
    state.step >= 2;

  const goNext = () => {
    if (state.step < totalSteps - 1) {
      update({ step: state.step + 1 });
      return;
    }
    setShowResult(true);
    track("calculator_complete", {
      object_type: state.objectType ?? "",
      scope: state.scope ?? "",
      total: result.calculable ? result.total : 0,
    });
  };

  const goBack = () => {
    if (showResult) {
      setShowResult(false);
      return;
    }
    if (state.step > 0) update({ step: state.step - 1 });
  };

  const reset = () => {
    setState(INITIAL);
    setShowResult(false);
    started.current = false;
  };

  const works = Array.from(
    new Set([
      ...(scope?.works ?? []),
      ...extraOptions.filter((item) => state.extras.includes(item.id)).map((item) => item.work),
    ]),
  );

  /* ── Живая сумма: видна на каждом шаге, а не только в финале ── */
  const liveTotal =
    pricingEnabled && result.calculable ? (
      <div className="calc-live">
        <span className="label">Предварительно</span>
        <strong className="calc-live__value">
          {formatMoney(result.min)} — {formatMoney(result.max)}
        </strong>
        <span className="calc-live__note">Пересчитывается при каждом изменении</span>
      </div>
    ) : null;

  const content = (
    <div className={`calculator__grid ${embedded ? "" : "container"}`}>
      <div className="calculator__aside">
        {!embedded ? (
          <>
            <SectionLabel number="06" title="Калькулятор" />
            <h2 className="calculator__title">
              РАССЧИТАЙТЕ
              <br />
              ВАШ ПРОЕКТ
            </h2>
          </>
        ) : null}
        <p className="lead" style={{ marginTop: embedded ? 0 : 24, maxWidth: 380 }}>
          Несколько вопросов — и вы увидите состав работ и предварительную стоимость.
        </p>

        {!showResult ? (
          <div className="calculator__progress">
            <p className="label">
              Шаг <span style={{ color: "var(--text)" }}>{String(state.step + 1).padStart(2, "0")}</span>{" "}
              / {String(totalSteps).padStart(2, "0")} — {steps[state.step]}
            </p>
            <span className="calculator__bar">
              <span
                className="calculator__bar-fill"
                style={{ width: `${((state.step + 1) / totalSteps) * 100}%` }}
              />
            </span>
          </div>
        ) : (
          <button type="button" className="link-underline calculator__restart" onClick={reset}>
            Начать заново
          </button>
        )}

        {!showResult ? liveTotal : null}
      </div>

      <div className="calculator__panel">
        {showResult ? (
          <div className="calculator__result">
            <div>
              <p className="label" style={{ marginBottom: 16 }}>
                Ваш проект
              </p>
              <dl className="summary">
                <div>
                  <dt>Объект</dt>
                  <dd>{objectType?.label ?? "—"}</dd>
                </div>
                {objectType && objectType.unit !== "none" ? (
                  <div>
                    <dt>Объём</dt>
                    <dd>
                      {amount} {objectType.unitLabel}
                    </dd>
                  </div>
                ) : null}
                <div>
                  <dt>Работы</dt>
                  <dd>{scope?.label ?? "—"}</dd>
                </div>
                {objectType?.askLevel ? (
                  <div>
                    <dt>Уровень</dt>
                    <dd>{levels.find((l) => l.id === state.level)?.label ?? "—"}</dd>
                  </div>
                ) : null}
              </dl>

              {pricingEnabled && result.calculable ? (
                <>
                  <p className="label" style={{ margin: "30px 0 14px" }}>
                    Расчёт
                  </p>
                  <ul className="calc-lines">
                    {result.lines.map((line) => (
                      <li key={line.label}>
                        <span className="calc-lines__name">
                          {line.label}
                          {line.note ? <em>{line.note}</em> : null}
                        </span>
                        <span className="calc-lines__sum">{formatMoney(line.amount)}</span>
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}

              <p className="label" style={{ margin: "30px 0 14px" }}>
                Состав работ
              </p>
              <ul className="works">
                {works.map((work) => (
                  <li key={work}>
                    <span aria-hidden="true" />
                    {work}
                  </li>
                ))}
              </ul>

              <div className="estimate">
                <p className="label" style={{ color: "var(--accent-text)", marginBottom: 12 }}>
                  Предварительная оценка
                </p>
                {pricingEnabled && result.calculable ? (
                  <>
                    <p className="estimate__value">
                      {formatMoney(result.min)} — {formatMoney(result.max)}
                    </p>
                    <p className="estimate__text">
                      Расчёт по ориентировочным ставкам и не является коммерческим
                      предложением. Точная стоимость определяется после осмотра объекта
                      и выбора материалов.
                    </p>
                  </>
                ) : (
                  <p className="estimate__text">
                    Стоимость такой задачи считается индивидуально — расскажите про объект,
                    и специалист подготовит расчёт.
                  </p>
                )}
              </div>
            </div>

            <div className="calculator__form">
              <h3 className="calculator__form-title">Получить точный расчёт</h3>
              <p className="calculator__form-text">
                Специалист уточнит детали объекта и подготовит смету.
              </p>
              <LeadForm
                formId="calculator"
                sourceSection="calculator"
                submitLabel="Получить расчёт"
                calculator={{
                  objectType: objectType?.label ?? "",
                  scope: scope?.label ?? "",
                  amount: objectType?.unit === "none" ? "" : `${amount} ${objectType?.unitLabel ?? ""}`,
                  level: levels.find((l) => l.id === state.level)?.label ?? "",
                  extras: state.extras,
                  works,
                  estimate: result.calculable ? `${result.min}–${result.max}` : "индивидуально",
                }}
              />
            </div>
          </div>
        ) : (
          <div className="calculator__step">
            {state.step === 0 ? (
              <>
                <h3 className="calculator__question">Какой у вас объект?</h3>
                <ul className="option-grid">
                  {objectTypes.map((type) => (
                    <li key={type.id}>
                      <button
                        type="button"
                        className={`option ${state.objectType === type.id ? "option--active" : ""}`}
                        aria-pressed={state.objectType === type.id}
                        onClick={() =>
                          update({
                            objectType: type.id,
                            scope: null,
                            amount: type.range.default,
                            extras: [],
                          })
                        }
                      >
                        <span className="option__title">{type.label}</span>
                        {type.hint ? <span className="option__hint">{type.hint}</span> : null}
                        <span className="option__dot" aria-hidden="true" />
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}

            {state.step === 1 && objectType ? (
              <>
                <h3 className="calculator__question">Что требуется?</h3>
                <ul className="option-list">
                  {objectType.scopes.map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        className={`option option--row ${state.scope === item.id ? "option--active" : ""}`}
                        aria-pressed={state.scope === item.id}
                        onClick={() => update({ scope: item.id })}
                      >
                        <span className="option__title">
                          {item.label}
                          {item.hint ? <em className="option__inline-hint">{item.hint}</em> : null}
                        </span>
                        {pricingEnabled && item.rate ? (
                          <span className="option__price">
                            от {item.rate.toLocaleString("ru-RU")} ₽/{objectType.unitLabel}
                          </span>
                        ) : null}
                        <span className="option__dot" aria-hidden="true" />
                      </button>
                    </li>
                  ))}
                </ul>

                {objectType.unit !== "none" ? (
                  <div className="area">
                    <label className="label" htmlFor="calc-amount">
                      {objectType.unit === "piece" ? "Количество конструкций" : "Площадь"}
                    </label>
                    <div className="area__value">
                      <input
                        id="calc-amount"
                        type="number"
                        min={objectType.range.min}
                        max={objectType.range.max}
                        value={amount}
                        onChange={(event) => {
                          const next = Number(event.target.value);
                          if (Number.isFinite(next)) {
                            update({
                              amount: Math.min(
                                objectType.range.max,
                                Math.max(objectType.range.min, next),
                              ),
                            });
                          }
                        }}
                      />
                      <span>{objectType.unitLabel}</span>
                    </div>
                    <input
                      className="area__range"
                      type="range"
                      min={objectType.range.min}
                      max={objectType.range.max}
                      step={objectType.range.step}
                      value={amount}
                      aria-label={objectType.unit === "piece" ? "Количество конструкций" : "Площадь объекта"}
                      onChange={(event) => update({ amount: Number(event.target.value) })}
                    />
                  </div>
                ) : null}
              </>
            ) : null}

            {steps[state.step] === "Уровень" ? (
              <>
                <h3 className="calculator__question">Уровень отделки</h3>
                <ul className="option-grid option-grid--levels">
                  {levels.map((level) => (
                    <li key={level.id}>
                      <button
                        type="button"
                        className={`option ${state.level === level.id ? "option--active" : ""}`}
                        aria-pressed={state.level === level.id}
                        onClick={() => update({ level: level.id })}
                      >
                        <span className="option__title">{level.label}</span>
                        <span className="option__hint">{level.hint}</span>
                        <span className="option__dot" aria-hidden="true" />
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}

            {steps[state.step] === "Дополнительно" ? (
              <>
                <h3 className="calculator__question">Что ещё нужно?</h3>
                <p className="calculator__optional">Необязательный шаг — можно пропустить.</p>
                <ul className="option-grid option-grid--extras">
                  {extraOptions.map((extra) => {
                    const checked = state.extras.includes(extra.id);
                    return (
                      <li key={extra.id}>
                        <button
                          type="button"
                          className={`option option--check ${checked ? "option--active" : ""}`}
                          aria-pressed={checked}
                          onClick={() =>
                            update({
                              extras: checked
                                ? state.extras.filter((id) => id !== extra.id)
                                : [...state.extras, extra.id],
                            })
                          }
                        >
                          <span className="option__title">
                            {extra.label}
                            <em className="option__inline-hint">{extra.hint}</em>
                          </span>
                          <span className="option__dot" aria-hidden="true" />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </>
            ) : null}

            <div className="calculator__nav">
              <button
                type="button"
                className="calculator__back"
                onClick={goBack}
                disabled={state.step === 0}
              >
                ← Назад
              </button>
              <button type="button" className="btn" onClick={goNext} disabled={!canGoNext}>
                {state.step === totalSteps - 1 ? "Показать расчёт" : "Далее"}{" "}
                <span aria-hidden="true">→</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (embedded) return <div className="calculator calculator--embedded">{content}</div>;

  return (
    <section className="section calculator" id="calculator">
      {content}
    </section>
  );
}
