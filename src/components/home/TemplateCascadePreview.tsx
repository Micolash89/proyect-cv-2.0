"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { templateOptions } from "@/lib/constants/templates";

// Seleccionar Harvard (0), Creativo (3) y Minimal (4)
const cascadeTemplates = [
  templateOptions[0], // Harvard
  templateOptions[3], // Creativo
  templateOptions[4], // Minimal
];

export function TemplateCascadePreview() {
  const itemVariants = {
    hidden: { opacity: 0, y: 20, rotate: -5 },
    visible: {
      opacity: 1,
      y: 0,
      rotate: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  return (
    <div className="relative w-full">
      {/* Desktop: Cascada diagonal */}
      <div className="hidden lg:block relative w-full" style={{ height: "500px" }}>
        {cascadeTemplates.map((template, index) => (
          <motion.div
            key={template.id}
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: index * 0.15 }}
            className="absolute"
            style={{
              left: `${index * 80}px`,
              top: `${index * 100}px`,
              width: "280px",
              height: "340px",
              zIndex: index,
              transform: `rotate(${index * -6}deg)`,
            }}
          >
            <div className="relative w-full h-full rounded-lg overflow-hidden shadow-xl border border-border/50 hover:shadow-2xl transition-shadow bg-white">
              <Image
                src={template.img}
                alt={template.name}
                fill
                className="object-cover"
                sizes="280px"
                priority={index === 0}
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/40 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <p className="text-sm font-semibold drop-shadow">{template.name}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Mobile: Stack vertical */}
      <div className="lg:hidden grid grid-cols-1 gap-6">
        {cascadeTemplates.map((template, index) => (
          <motion.div
            key={template.id}
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: index * 0.15 }}
            className="relative h-72 rounded-lg overflow-hidden shadow-lg border border-border/50"
          >
            <Image
              src={template.img}
              alt={template.name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 100vw, 50vw"
              priority={index === 0}
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/40 via-black/10 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
              <p className="text-sm font-semibold drop-shadow">{template.name}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
