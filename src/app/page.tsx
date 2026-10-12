import { Asistente } from "@/components/Asistente";
import { Contact } from "@/components/Contact";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Process } from "@/components/Process";
import { Projects } from "@/components/Projects";
import { Section } from "@/components/Section";
import { Services } from "@/components/Services";
import { contact } from "@/content/site";
import { formularioActivo, iaActiva } from "@/lib/funciones";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Projects />
        <Services />
        <Process />
        <Section id="asistente" label="Asistente" title="¿No sabes qué necesita tu proyecto? Cuéntanos tu idea y te orientamos.">
          <Asistente ia={iaActiva} formEnabled={formularioActivo} email={contact.email} />
        </Section>
        <Contact />
      </main>
    </>
  );
}
