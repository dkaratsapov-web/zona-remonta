import { advantages } from "@/data/content";
import { Reveal } from "@/components/ui/Reveal";

/**
 * Ни одной цифры: «лет опыта», «объектов» и «сотрудников» заказчик
 * не подтверждал, а выдумывать их запрещено. Структура готова —
 * значения добавляются в src/data/content.ts, когда появятся.
 */
export function Advantages() {
  return (
    <section className="section advantages">
      <div className="container">
        <ul className="advantages__grid">
          {advantages.map((item, index) => (
            <Reveal as="li" key={item.title} delay={index * 0.06}>
              <span className="advantages__dash" aria-hidden="true" />
              <h3 className="advantages__title">{item.title}</h3>
              <p className="advantages__text">{item.text}</p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
