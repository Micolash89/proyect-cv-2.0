"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, MessageCircle, Copy, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { getWhatsAppLink } from "@/lib/utils/cn";
import axios from "axios";

function SuccessContent() {
  const searchParams = useSearchParams();
  const phone = searchParams.get("phone") || "";
  const name = searchParams.get("name") || "";
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    axios.get("/api/settings/whatsapp").then((res) => {
      setWhatsappNumber(res.data.number || "5491112345678");
    }).catch(() => {
      setWhatsappNumber("5491112345678");
    });
  }, []);

  const message = `Hola, me llamo ${name} y me acabo de registrar para crear mi CV. Me gustaría confirmar los detalles.`;
  const whatsappUrl = getWhatsAppLink(whatsappNumber, message);

  const copyMessage = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md"
    >
      <Card>
        <CardContent className="pt-6 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
          </motion.div>

          <h1 className="text-2xl font-bold mb-2">¡Registro exitoso!</h1>
          <p className="text-muted-foreground mb-6">
            Gracias {name}, tu información ha sido recibida. 
            Nos pondremos en contacto contigo pronto.
          </p>

          <div className="bg-muted rounded-lg p-4 mb-6">
            <p className="text-sm text-muted-foreground mb-2">
              Mensaje para confirmar:
            </p>
            <p className="text-sm font-medium mb-2">{message}</p>
            <button
              onClick={copyMessage}
              className="text-xs text-primary hover:underline flex items-center gap-1 mx-auto"
            >
              <Copy className="h-3 w-3" />
              {copied ? "Copiado!" : "Copiar mensaje"}
            </button>
          </div>

          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
            <Button size="lg" className="w-full bg-green-500 hover:bg-green-600">
              <MessageCircle className="mr-2 h-5 w-5" />
              Confirmar por WhatsApp
            </Button>
          </a>

          <p className="text-xs text-muted-foreground mt-4">
            Serás redirigido a WhatsApp para confirmar tu registro
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4">
      <Suspense fallback={
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }>
        <SuccessContent />
      </Suspense>
    </div>
  );
}
