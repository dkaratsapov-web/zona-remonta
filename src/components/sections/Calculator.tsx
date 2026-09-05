"use client";

import { useEffect, useRef, useState } from "react";
import {
  calculateTotal,
  categories,
  DEFAULT_WINDOW_UNITS,
  formatMoney,
  objectTypes,
  pricingStatus,
  services,
  servicePrice,
  type CategoryId,
  type ObjectTypeId,
} from "@/data/calculatorConfig";
import { useSessionState, usePrefersReducedMotion } from "@/lib/hooks";
import { track } from "@/lib/analytics";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { LeadForm } from "@/components/ui/LeadForm";

type State = {
  objectType: ObjectTypeId | null;
  area: number;
  units: number;
  selected: string[];
};

const INITIAL: State = { objectType: "apartment", area: 82, units: DEFAULT_WINDOW_UNITS, selected: [] };

type Props = {
  embedded?: boolean;
  initialObjectType?: ObjectTypeId | null;
};

/**
 * Конфигуратор проекта.
 *
 * Не квиз: все параметры доступны сразу, стоимость пересчитывается
 * на каждом действии, кнопки «Далее» нет. Пользователь видит связь
 * «действие → изменение бюджета» без промежуточных экранов.
 *
 * Ни одной цены в компоненте: всё считает calculateTotal по конфигу.
 */
export function Calculator({ embedded = false, initialObjectType = null }: Props) {
  const [state, setState] = useSessionState<State>(
    "zr_configurator",
    initialObjectType ? { ...INITIAL, objectType: initialObjectType } : INITIAL,
  );
  const [openCategories, setOpenCategories] = useState<CategoryId[]>(["preparation"]);
  const [delta, setDelta] = useState<{ id: number; value: number } | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [leadOpen, setLeadOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingArea, setEditingArea] = useState(false);
  const deltaId = useRef(0);
  const opened = useRef(false);
  const reduced = usePrefersReducedMotion();

  const objectType = objectTypes.find((item) => item.id === state.objectType) ?? null;
  const area = objectType?.askArea ? state.area : 0;
  const units = state.units;

  const available = services.filter((service) =>
    state.objectType ? service.availableFor.includes(state.objectType) : false,
  );
  const availableIds = new Set(available.map((service) => service.id));
  const selected = state.selected.filter((id) => availableIds.has(id));

  const breakdown = calculateTotal({ objectType, area, units, selectedIds: selected });

  useEffect(() => {
    if (opened.current) return;
    opened.current = true;
    track("calculator_open" as never, { pricing_status: pricingStatus });
  }, []);

  const update = (patch: Partial<State>) => setState({ ...state, ...patch });

  const showDelta = (value: number) => {
    if (reduced || value === 0) return;
    deltaId.current += 1;
    const id = deltaId.current;
    setDelta({ id, value });
    window.setTimeout(() => {
      setDelta((current) => (current?.id === id ? null : current));
    }, 900);
  };

  const toggleService = (id: string) => {
    const isOn = selected.includes(id);
    const next = isOn ? selected.filter((item) => item !== id) : [...selected, id];
    const before = breakdown.total;
    const after = calculateTotal({ objectType, area, units, selectedIds: next }).total;

    update({ selected: next });
    showDelta(after - before);
    track((isOn ? "calculator_service_removed" : "calculator_service_added") as never, {
      service_id: id,
      object_type: state.objectType ?? "",
      area,
      total: after,
      pricing_status: pricingStatus,
    });
  };

  const toggleCategoryAll = (categoryId: CategoryId) => {
    const ids = available.filter((service) => service.category === categoryId).map((s) => s.id);
    const allOn = ids.every((id) => selected.includes(id));
    const next = allOn
      ? selected.filter((id) => !ids.includes(id))
      : Array.from(new Set([...selected, ...ids]));
    const before = breakdown.total;
    const after = calculateTotal({ objectType, area, units, selectedIds: next }).total;
    update({ selected: next });
    showDelta(after - before);
    track("calculator_category_select_all" as never, { category: categoryId, enabled: !allOn });
  };

  const selectObject = (id: ObjectTypeId) => {
    const type = objectTypes.find((item) => item.id === id);
    update({
      objectType: id,
      area: type?.askArea ? (type.area.default ?? 0) : 0,
      selected: [],
    });
    track("calculator_object_selected" as never, { object_type: id });
  };

  const reset = () => {
    setState({ ...INITIAL, objectType: state.objectType, area: objectType?.area.default ?? 0 });
    setConfirmReset(false);
    showDelta(-breakdown.total);
  };

  /** Заполненность проекта — высота красной линии между колонками. */
  const fill = Math.min(
    100,
    10 + (available.length ? (selected.length / available.length) * 90 : 0),
  );

  /** Рекомендации: что часто берут вместе с уже выбранным. */
  const suggestions = Array.from(
    new Set(
      available
        .filter((service) => selected.includes(service.id))
        .flatMap((service) => service.suggests ?? [])
        .filter((id) => !selected.includes(id) && availableIds.has(id)),
    ),
  )
    .map((id) => available.find((service) => service.id === id))
    .filter(Boolean)
    .slice(0, 3) as typeof available;

  const configLabel = [
    objectType?.label,
    objectType?.askArea ? `${area} м²` : null,
    `${breakdown.selectedCount} ${plural(breakdown.selectedCount)}`,
  ]
    .filter(Boolean)
    .join(" / ");

  /* ─────────────────────────  ЛЕВАЯ КОЛОНКА  ───────────────────────── */
  const configurator = (
    <div className="cfg__main">
      {!embedded ? (
        <>
          <SectionLabel number="06" title="Калькулятор" />
          <h2 className="cfg__title">
            СОБЕРИТЕ
            <br />
            СВОЙ ПРОЕКТ
          </h2>
        </>
      ) : (
        <h2 className="cfg__title cfg__title--embedded">Соберите свой проект</h2>
      )}
      <p className="cfg__subtitle">
        Выбирайте необходимые работы — стоимость меняется в реальном времени.
      </p>

      {/* Тип объекта */}
      <div className="cfg__group">
        <p className="label cfg__group-title">Объект</p>
        <div className="obj-selector" role="group" aria-label="Тип объекта">
          {objectTypes.map((type) => (
            <button
              key={type.id}
              type="button"
              className={`obj-selector__item ${state.objectType === type.id ? "is-active" : ""}`}
              aria-pressed={state.objectType === type.id}
              onClick={() => selectObject(type.id)}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Площадь или количество конструкций */}
      {objectType?.askArea ? (
        <div className="cfg__group">
          <p className="label cfg__group-title">Площадь объекта</p>
          <div className="area-control">
            {editingArea ? (
              <input
                className="area-control__input"
                type="number"
                autoFocus
                min={objectType.area.min}
                max={objectType.area.max}
                value={area}
                aria-label="Площадь объекта, м²"
                onBlur={() => setEditingArea(false)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") setEditingArea(false);
                }}
                onChange={(event) => {
                  const next = Number(event.target.value);
                  if (Number.isFinite(next)) {
                    update({
                      area: Math.min(objectType.area.max, Math.max(objectType.area.min, next)),
                    });
                  }
                }}
              />
            ) : (
              <button
                type="button"
                className="area-control__value"
                onClick={() => setEditingArea(true)}
                aria-label="Изменить площадь вручную"
              >
                {area}
              </button>
            )}
            <span className="area-control__unit">м²</span>
          </div>
          <input
            className="area-control__range"
            type="range"
            min={objectType.area.min}
            max={objectType.area.max}
            step={objectType.area.step}
            value={area}
            aria-label="Площадь объекта"
            onChange={(event) => update({ area: Number(event.target.value) })}
            onPointerUp={() => track("calculator_area_changed" as never, { area })}
          />
          <div className="area-control__scale">
            <span>{objectType.area.min} м²</span>
            <span>{objectType.area.max} м²</span>
          </div>
        </div>
      ) : null}

      {state.objectType === "windows" ? (
        <div className="cfg__group">
          <p className="label cfg__group-title">Количество конструкций</p>
          <div className="area-control">
            <span className="area-control__value">{units}</span>
            <span className="area-control__unit">шт.</span>
          </div>
          <input
            className="area-control__range"
            type="range"
            min={1}
            max={40}
            value={units}
            aria-label="Количество конструкций"
            onChange={(event) => update({ units: Number(event.target.value) })}
          />
        </div>
      ) : null}

      {/* Работы */}
      <div className="cfg__group">
        <p className="label cfg__group-title">Что нужно сделать?</p>

        {available.length === 0 ? (
          <p className="cfg__empty">
            Для такой задачи состав работ определяется индивидуально — расскажите про объект,
            и специалист подготовит расчёт.
          </p>
        ) : null}

        {categories.map((category) => {
          const items = available.filter((service) => service.category === category.id);
          if (items.length === 0) return null;
          const isOpen = openCategories.includes(category.id);
          const chosen = items.filter((service) => selected.includes(service.id)).length;
          const allOn = chosen === items.length;

          return (
            <section className="cat" key={category.id}>
              <div className="cat__head">
                <button
                  type="button"
                  className="cat__toggle"
                  aria-expanded={isOpen}
                  onClick={() =>
                    setOpenCategories((current) =>
                      current.includes(category.id)
                        ? current.filter((id) => id !== category.id)
                        : [...current, category.id],
                    )
                  }
                >
                  <span className="cat__num">{category.number}</span>
                  <span className="cat__title">{category.title}</span>
                  {chosen > 0 ? <span className="cat__count">{chosen}</span> : null}
                  <span className="cat__chevron" aria-hidden="true">
                    {isOpen ? "−" : "+"}
                  </span>
                </button>
                {isOpen ? (
                  <button type="button" className="cat__all" onClick={() => toggleCategoryAll(category.id)}>
                    {allOn ? "Снять всё" : "Выбрать всё"}
                  </button>
                ) : null}
              </div>

              {isOpen ? (
                <ul className="rows">
                  {items.map((service, index) => {
                    const isOn = selected.includes(service.id);
                    const price = servicePrice(service, objectType, area, units, breakdown.works);
                    return (
                      <li key={service.id}>
                        <label className={`row ${isOn ? "row--on" : ""}`}>
                          <input
                            type="checkbox"
                            className="row__input"
                            checked={isOn}
                            onChange={() => toggleService(service.id)}
                          />
                          <span className="row__num">{String(index + 1).padStart(2, "0")}</span>
                          <span className="row__body">
                            <span className="row__title">{service.title}</span>
                            {service.hint ? <span className="row__hint">{service.hint}</span> : null}
                          </span>
                          <span className="row__price">
                            {service.priceType === "percentage"
                              ? `${service.price}%`
                              : `+ ${formatMoney(price)}`}
                          </span>
                          <span className="row__control" aria-hidden="true">
                            <span className="row__control-mark">✓</span>
                          </span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              ) : null}
            </section>
          );
        })}

        {suggestions.length > 0 ? (
          <div className="suggest">
            <p className="label suggest__title">Часто добавляют</p>
            <div className="suggest__items">
              {suggestions.map((service) => (
                <button
                  key={service.id}
                  type="button"
                  className="suggest__chip"
                  onClick={() => toggleService(service.id)}
                >
                  {service.title}
                  <span aria-hidden="true">+</span>
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );

  /* ─────────────────────────  ПРАВАЯ КОЛОНКА  ───────────────────────── */
  const summary = (
    <div className="total">
      <span className="total__bg" aria-hidden="true">
        ₽
      </span>

      <p className="label">Ваш проект</p>

      <div className={`total__value ${delta ? "total__value--pulse" : ""}`}>
        <AnimatedNumber value={breakdown.total} />
        {delta ? (
          <span className={`total__delta ${delta.value < 0 ? "is-minus" : ""}`} key={delta.id}>
            {delta.value > 0 ? "+" : "−"} {formatMoney(Math.abs(delta.value))}
          </span>
        ) : null}
      </div>

      {breakdown.total === 0 ? (
        <p className="total__hint">
          <span className="total__hint-line" aria-hidden="true" />
          Выберите необходимые работы
        </p>
      ) : (
        <dl className="total__list">
          <div>
            <dt>Объект</dt>
            <dd>{objectType?.label ?? "—"}</dd>
          </div>
          {objectType?.askArea ? (
            <div>
              <dt>Площадь</dt>
              <dd>{area} м²</dd>
            </div>
          ) : null}
          <div>
            <dt>Выбрано работ</dt>
            <dd>{breakdown.selectedCount}</dd>
          </div>
          <div>
            <dt>Работы</dt>
            <dd>{formatMoney(breakdown.works)}</dd>
          </div>
          {breakdown.materials > 0 ? (
            <div>
              <dt>Материалы</dt>
              <dd>{formatMoney(breakdown.materials)}</dd>
            </div>
          ) : null}
          <div className="total__list-sum">
            <dt>Предварительно</dt>
            <dd>{formatMoney(breakdown.total)}</dd>
          </div>
        </dl>
      )}

      <button
        type="button"
        className="btn total__cta"
        disabled={breakdown.total === 0}
        onClick={() => {
          setLeadOpen(true);
          track("calculator_lead_opened" as never, {
            total: breakdown.total,
            object_type: state.objectType ?? "",
            services: selected.join(","),
          });
        }}
      >
        Получить точный расчёт <span aria-hidden="true">→</span>
      </button>

      <p className="total__note">
        Предварительная стоимость. Итог зависит от состояния объекта и выбранных материалов.
      </p>

      {pricingStatus === "demo" ? (
        <p className="total__demo" title="Ставки ориентировочные, прайс заказчика не получен">
          DEMO PRICING
        </p>
      ) : null}

      {selected.length > 0 ? (
        confirmReset ? (
          <div className="total__confirm">
            <span>Сбросить выбранные параметры?</span>
            <button type="button" onClick={reset}>
              Да
            </button>
            <button type="button" onClick={() => setConfirmReset(false)}>
              Отмена
            </button>
          </div>
        ) : (
          <button type="button" className="total__reset" onClick={() => setConfirmReset(true)}>
            Сбросить проект
          </button>
        )
      ) : null}
    </div>
  );

  const body = (
    <div className="cfg">
      {configurator}

      <div className="cfg__rail" aria-hidden="true">
        <span style={{ height: `${fill}%` }} />
      </div>

      <aside className="cfg__aside">{summary}</aside>

      {/* Мобильная панель итога */}
      <div className={`mtotal ${breakdown.total > 0 ? "mtotal--visible" : ""}`}>
        <button type="button" className="mtotal__bar" onClick={() => setSheetOpen(true)}>
          <span className="label">Итого</span>
          <strong>
            <AnimatedNumber value={breakdown.total} />
          </strong>
          <span aria-hidden="true">→</span>
        </button>
      </div>

      {sheetOpen ? (
        <div className="sheet" role="dialog" aria-modal="true" aria-label="Ваш проект">
          <div className="sheet__backdrop" onClick={() => setSheetOpen(false)} />
          <div className="sheet__panel">
            <button type="button" className="sheet__grip" aria-label="Закрыть" onClick={() => setSheetOpen(false)} />
            {summary}
          </div>
        </div>
      ) : null}

      {/* Заявка: справа на desktop, снизу на мобильных */}
      {leadOpen ? (
        <div className="drawer" role="dialog" aria-modal="true" aria-labelledby="cfg-lead-title">
          <div className="drawer__backdrop" onClick={() => setLeadOpen(false)} />
          <div className="drawer__panel">
            <button type="button" className="modal__close" aria-label="Закрыть" onClick={() => setLeadOpen(false)}>
              ✕
            </button>
            <h3 className="drawer__title" id="cfg-lead-title">
              УТОЧНИМ
              <br />
              СТОИМОСТЬ
            </h3>
            <p className="drawer__config">{configLabel}</p>
            <p className="drawer__price">≈ {formatMoney(breakdown.total)}</p>
            <LeadForm
              formId="calculator"
              sourceSection="configurator"
              submitLabel="Получить расчёт"
              compact
              calculator={{
                objectType: objectType?.label ?? "",
                area: objectType?.askArea ? `${area} м²` : "",
                units: state.objectType === "windows" ? `${units} шт.` : "",
                services: selected,
                works: formatMoney(breakdown.works),
                materials: formatMoney(breakdown.materials),
                total: formatMoney(breakdown.total),
                pricingStatus,
              }}
            />
          </div>
        </div>
      ) : null}
    </div>
  );

  if (embedded) return <div className="calculator--embedded">{body}</div>;

  return (
    <section className="section calculator" id="calculator">
      <div className="container">{body}</div>
    </section>
  );
}

function plural(count: number): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return "работа";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return "работы";
  return "работ";
}
