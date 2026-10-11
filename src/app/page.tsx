import { Contact } from "@/components/Contact";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Process } from "@/components/Process";
import { Projects } from "@/components/Projects";
import { Services } from "@/components/Services";

export default function Home() {
  return (
    // La página va enmarcada con líneas laterales, como una ficha técnica
    <div className="mx-auto max-w-[1280px] md:border-x md:border-line">
      <Header />
      <main>
        <Hero />
        <Projects />
        <Services />
        <Process />
        <Contact />
      </main>
    </div>
  );
}
