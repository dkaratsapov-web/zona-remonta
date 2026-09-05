import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Preloader } from "@/components/layout/Preloader";
import { StickyCta } from "@/components/layout/StickyCta";
import { ScrollProgress } from "@/components/layout/ScrollProgress";
import { CustomCursor } from "@/components/ui/CustomCursor";
import { Analytics } from "@/components/layout/Analytics";
import { UiProvider } from "@/components/ui/UiContext";
import { GlobalModals } from "@/components/ui/GlobalModals";

import { Hero } from "@/components/sections/Hero";
import { Manifest } from "@/components/sections/Manifest";
import { Services } from "@/components/sections/Services";
import { Projects } from "@/components/sections/Projects";
import { BeforeAfter } from "@/components/sections/BeforeAfter";
import { Calculator } from "@/components/sections/Calculator";
import { Process } from "@/components/sections/Process";
import { Materials } from "@/components/sections/Materials";
import { Advantages } from "@/components/sections/Advantages";
import { OtherWorks } from "@/components/sections/OtherWorks";
import { Faq } from "@/components/sections/Faq";
import { FinalCta } from "@/components/sections/FinalCta";

/**
 * Порядок сцен: доказательство идёт перед просьбой.
 * Проекты и «до/после» стоят до калькулятора, а не после него.
 */
export default function Home() {
  return (
    <UiProvider>
      <div id="page">
      <Preloader />
      <Analytics />
      <CustomCursor />
      <Header />
      <ScrollProgress total={11} />

      <main>
        <Hero />
        <Manifest />
        <Services />
        <Projects />
        <BeforeAfter />
        <Calculator />
        <Process />
        <Materials />
        <Advantages />
        <OtherWorks />
        <Faq />
        <FinalCta />
      </main>

      <Footer />
      <StickyCta />
      <GlobalModals />
      </div>
    </UiProvider>
  );
}
