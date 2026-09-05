"use client";

import { useEffect, useRef } from "react";
import { initGsap } from "@/lib/animations";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { track } from "@/lib/analytics";
import { projects } from "@/data/projects";
import { Photo } from "@/components/ui/Photo";
import { SectionLabel } from "@/components/ui/SectionLabel";

/**
 * Кадр раскрывается clip-path'ом, изображение внутри одновременно идёт
 * из 1.08 в 1 — вместо одинакового fade-up на каждом блоке.
 */
export function Projects() {
  const root = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const node = root.current;
    if (!node) return;

    if (reduced) {
      node.querySelectorAll<HTMLElement>("[data-project-frame]").forEach((frame) => {
        frame.style.clipPath = "inset(0% 0 0 0)";
      });
      return;
    }

    const gsap = initGsap();
    const ctx = gsap.context(() => {
      node.querySelectorAll<HTMLElement>("[data-project]").forEach((item) => {
        const frame = item.querySelector("[data-project-frame]");
        const media = item.querySelector("[data-project-media]");

        gsap
          .timeline({ scrollTrigger: { trigger: item, start: "top 82%", once: true } })
          .fromTo(frame, { clipPath: "inset(100% 0 0 0)" }, { clipPath: "inset(0% 0 0 0)", duration: 1.1, ease: "power3.inOut" })
          .fromTo(media, { scale: 1.08 }, { scale: 1, duration: 1.4, ease: "power2.out" }, 0);

        gsap.to(media, {
          yPercent: -6,
          ease: "none",
          scrollTrigger: { trigger: item, start: "top bottom", end: "bottom top", scrub: true },
        });
      });
    }, node);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <section className="section projects" id="projects" ref={root}>
      <div className="container">
        <SectionLabel number="04" title="Проекты" />
        <h2 className="h2" style={{ marginTop: 18 }}>
          Работы
        </h2>

        <ul className="projects__list">
          {projects.map((project, index) => (
            <li
              className={`project ${index % 2 === 1 ? "project--flip" : ""}`}
              key={project.id}
              data-project=""
              onMouseEnter={() => track("project_view", { project_id: project.id })}
            >
              <div className="project__frame" data-project-frame data-cursor="project">
                <div className="project__media" data-project-media>
                  <Photo
                    variant={project.photo}
                    src={project.image}
                    alt={project.imageAlt}
                    floor
                    edges
                    /* Метка нужна только на градиентной заглушке: как только
                       появляется настоящий кадр, она превращается в шум.
                       Пометка о демо-проекте остаётся в src/data/projects.ts. */
                    demoLabel={project.isDemo && !project.image ? "DEMO PROJECT — replace with real project" : undefined}
                  />
                </div>
                <span className="project__corner project__corner--tl" aria-hidden="true" />
                <span className="project__corner project__corner--br" aria-hidden="true" />
              </div>

              <div className="project__info">
                <p className="label" style={{ color: "var(--accent-text)" }}>
                  PROJECT {project.number}
                </p>
                <h3 className="project__title">
                  {project.titleLines.map((line) => (
                    <span key={line}>{line}</span>
                  ))}
                </h3>
                <hr className="hairline" style={{ marginTop: 26 }} />
                <dl className="project__meta">
                  <div>
                    <dt className="label">Тип</dt>
                    <dd>{project.type}</dd>
                  </div>
                  <div>
                    <dt className="label">Площадь</dt>
                    <dd className={project.area ? "" : "project__empty"}>{project.area ?? "— м²"}</dd>
                  </div>
                  <div>
                    <dt className="label">Работы</dt>
                    <dd className={project.works ? "" : "project__empty"}>{project.works ?? "—"}</dd>
                  </div>
                  <div>
                    <dt className="label">Срок</dt>
                    <dd className={project.duration ? "" : "project__empty"}>{project.duration ?? "—"}</dd>
                  </div>
                </dl>

                {project.highlights?.length ? (
                  <ul className="project__highlights">
                    {project.highlights.map((item) => (
                      <li key={item}>
                        <span aria-hidden="true" />
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
