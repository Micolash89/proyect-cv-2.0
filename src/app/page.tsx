"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { FileText, Download, Sparkles, Palette, Zap } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />
        
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              Crea tu CV{" "}
              <span className="text-primary">Profesional</span>{" "}
              en minutos
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              La forma más rápida y sencilla de generar currículums vitae 
              impactantes. Múltiples plantillas, diseño moderno y descarga 
              instantánea en PDF.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/registro">
                <Button size="lg" className="w-full sm:w-auto">
                  <FileText className="mr-2 h-5 w-5" />
                  Crear mi CV
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Panel Admin
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="grid md:grid-cols-3 gap-8"
          >
            <div className="text-center p-6">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">IA Integrada</h3>
              <p className="text-muted-foreground">
                Genera tu perfil profesional y mejora tus descripciones con inteligencia artificial
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Palette className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">6 Plantillas</h3>
              <p className="text-muted-foreground">
                Elige entre Harvard, Modern, Classic, Creative, Minimal o Professional
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">PDF Instantáneo</h3>
              <p className="text-muted-foreground">
                Descarga tu CV listo para enviar en formato PDF profesional
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-2xl mx-auto"
          >
            <h2 className="text-3xl font-bold mb-4">¿Cómo funciona?</h2>
            <p className="text-muted-foreground mb-8">
              En solo 3 pasos tendrás tu CV listo para descargar
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-4">
                <div className="text-4xl font-bold text-primary mb-2">1</div>
                <h4 className="font-semibold mb-1">Registra tus datos</h4>
                <p className="text-sm text-muted-foreground">
                  Completa el formulario con tu información personal y profesional
                </p>
              </div>
              <div className="p-4">
                <div className="text-4xl font-bold text-primary mb-2">2</div>
                <h4 className="font-semibold mb-1">Personaliza</h4>
                <p className="text-sm text-muted-foreground">
                  Elige la plantilla y los colores que más te gusten
                </p>
              </div>
              <div className="p-4">
                <div className="text-4xl font-bold text-primary mb-2">3</div>
                <h4 className="font-semibold mb-1">Descarga</h4>
                <p className="text-sm text-muted-foreground">
                  Obtén tu PDF profesional listo para enviar
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold mb-4">
              ¿Listo para crear tu CV?
            </h2>
            <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
              No esperes más. Crea tu currículum vitae profesional y destaca 
              entre los demás candidatos.
            </p>
            <Link href="/registro">
              <Button
                size="lg"
                variant="secondary"
                className="text-lg px-8"
              >
                <Download className="mr-2 h-5 w-5" />
                Comenzar ahora
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <footer className="py-8 border-t">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2026 CV Generator Pro. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
