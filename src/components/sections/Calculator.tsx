"use client";

import { useEffect, useRef, useState } from "react";
import {
  areaRange,
  extraOptions,
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
  area: number;
  extras: string[];
  step: number;
};

const INITIAL: State = { objectType: null, scope: null, area: areaRange.default, extras: [], step: 0 };
const TOTAL_STEPS = 3;

/**
 * Три коротких шага — и человек получает полезный результат: состав работ
 * по своему объекту. Телефон спрашиваем ПОСЛЕ этого, а не вместо ответа.
 *
 * Стоимость не выдумывается: пока pricingEnabled=false, показывается честная
 * формулировка. Появится прайс — включится диапазон, вёрстка не изменится.
 *
 * Прогресс живёт в sessionStorage: случайное обновление страницы
 * не обнуляет уже данные ответы.
 */
export function Calculator() {
  const [state, setState] = useSessionState<State>("zr_calculator", INITIAL);
  const [showResult, setShowResult] = useState(false);
  const started = useRef(false);
  const lastStep = useRef(0);

  const objectType = objectTypes.find((item) => item.id === state.objectType) ?? null;
  const scope = objectType?.scopes.find((item) => item.id === state.scope) ?? null;

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

  // Бросил калькулятор на середине — фиксируем шаг, но БЕЗ персональных данных
  useEffect(() => {
    const onLeave = () => {
      if (started.current && !showResult) {
        track("calculator_abandon_step", { step: state.step + 1 });
      }
    };
    window.addEventListener("pagehide", onLeave);
    return () => window.removeEventListener("pagehide", onLeave);
  }, [state.step, showResult]);

  const works = Array.from(
    new Set([
      ...(scope?.works ?? []),
      ...extraOptions.filter((item) => state.extras.includes(item.id)).map((item) => item.work),
    ]),
  );

  const canGoNext =
    (state.step === 0 && state.objectType !== null) ||
    (state.step === 1 && state.scope !== null) ||
    state.step === 2;

  const goNext = () => {
    if (state.step < TOTAL_STEPS - 1) {
      setState({ ...state, step: state.step + 1 });
      return;
    }
    setShowResult(true);
    track("calculator_complete", { object_type: state.objectType ?? "", scope: state.scope ?? "" });
  };

  const goBack = () => {
    if (showResult) {
      setShowResult(false);
      return;
    }
    if (state.step > 0) setState({ ...state, step: state.step - 1 });
  };

  const reset = () => {
    setState(INITIAL);
    setShowResult(false);
    started.current = false;
  };

  return (
    <section className="section calculator" id="calculator">
      <div className="container calculator__grid">
        <div className="calculator__aside">
          <SectionLabel number="06" title="Калькулятор" />
          <h2 className="calculator__title">
            РАССЧИТАЙТЕ
            <br />
            ВАШ ПРОЕКТ
          </h2>
          <p className="lead" style={{ marginTop: 24, maxWidth: 380 }}>
            Три коротких вопроса — и вы увидите состав работ по вашему объекту.
          </p>

          {!showResult ? (
            <div className="calculator__progress">
              <p className="label">
                Шаг <span style={{ color: "var(--text)" }}>{String(state.step + 1).padStart(2, "0")}</span> /{" "}
                {String(TOTAL_STEPS).padStart(2, "0")}
              </p>
              <span className="calculator__bar">
                <span
                  className="calculator__bar-fill"
                  style={{ width: `${((state.step + 1) / TOTAL_STEPS) * 100}%` }}
                />
              </span>
            </div>
          ) : (
            <button type="button" className="link-underline calculator__restart" onClick={reset}>
              Начать заново
            </button>
          )}
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
                  {objectType?.askArea ? (
                    <div>
                      <dt>Площадь</dt>
                      <dd>{state.area} м²</dd>
                    </div>
                  ) : null}
                  <div>
                    <dt>Тип работ</dt>
                    <dd>{scope?.label ?? "—"}</dd>
                  </div>
                  {state.extras.length > 0 ? (
                    <div>
                      <dt>Дополнительно</dt>
                      <dd>
                        {extraOptions
                          .filter((item) => state.extras.includes(item.id))
                          .map((item) => item.label)
                          .join(", ")}
                      </dd>
                    </div>
                  ) : null}
                </dl>

                <p className="label" style={{ margin: "30px 0 14px" }}>
                  Предварительный состав работ
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
                  <p className="estimate__text">
                    {pricingEnabled
                      ? "Диапазон рассчитан по вашим ответам и уточняется после осмотра объекта."
                      : "Точную вилку рассчитаем после уточнения состояния объекта и выбранных материалов."}
                  </p>
                </div>
              </div>

              <div className="calculator__form">
                <h3 className="calculator__form-title">Получить предварительную стоимость</h3>
                <p className="calculator__form-text">
                  Специалист уточнит детали объекта и подготовит расчёт.
                </p>
                <LeadForm
                  formId="calculator"
                  sourceSection="calculator"
                  submitLabel="Получить расчёт"
                  calculator={{
                    objectType: objectType?.label ?? "",
                    scope: scope?.label ?? "",
                    area: objectType?.askArea ? state.area : "",
                    extras: state.extras,
                    works,
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
                          onClick={() => setState({ ...state, objectType: type.id, scope: null })}
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
                          onClick={() => setState({ ...state, scope: item.id })}
                        >
                          <span className="option__title">{item.label}</span>
                          <span className="option__dot" aria-hidden="true" />
                        </button>
                      </li>
                    ))}
                  </ul>

                  {objectType.askArea ? (
                    <div className="area">
                      <label className="label" htmlFor="calc-area">
                        Площадь
                      </label>
                      <div className="area__value">
                        <input
                          id="calc-area"
                          type="number"
                          min={areaRange.min}
                          max={areaRange.max}
                          value={state.area}
                          onChange={(event) => {
                            const next = Number(event.target.value);
                            if (Number.isFinite(next)) {
                              setState({ ...state, area: Math.min(areaRange.max, Math.max(areaRange.min, next)) });
                            }
                          }}
                        />
                        <span>м²</span>
                      </div>
                      <input
                        className="area__range"
                        type="range"
                        min={areaRange.min}
                        max={areaRange.max}
                        step={areaRange.step}
                        value={state.area}
                        aria-label="Площадь объекта, квадратные метры"
                        onChange={(event) => setState({ ...state, area: Number(event.target.value) })}
                      />
                    </div>
                  ) : null}
                </>
              ) : null}

              {state.step === 2 ? (
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
                              setState({
                                ...state,
                                extras: checked
                                  ? state.extras.filter((id) => id !== extra.id)
                                  : [...state.extras, extra.id],
                              })
                            }
                          >
                            <span className="option__title">{extra.label}</span>
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
                  {state.step === TOTAL_STEPS - 1 ? "Показать результат" : "Далее"}{" "}
                  <span aria-hidden="true">→</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
