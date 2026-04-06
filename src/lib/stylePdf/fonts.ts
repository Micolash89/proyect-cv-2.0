import { Font } from "@react-pdf/renderer";
import path from "path";

let registered = false;

export function registerFonts() {
  if (registered) return;

  const fontsPath = path.join(process.cwd(), "public", "fonts");

  Font.register({
    family: "Times",
    fonts: [
      { src: path.join(fontsPath, "TimesNewRoman.ttf") },
      { src: path.join(fontsPath, "TimesNewRoman.ttf"), fontWeight: "normal" },
      { src: path.join(fontsPath, "TimesNewRomanBold.ttf"), fontWeight: "bold" },
      { src: path.join(fontsPath, "TimesNewRomanItalic.ttf"), fontStyle: "italic" },
    ],
  });

  Font.register({
    family: "Roboto",
    fonts: [
      { src: path.join(fontsPath, "Roboto-Regular.ttf") },
      { src: path.join(fontsPath, "Roboto-Regular.ttf"), fontWeight: "normal" },
      { src: path.join(fontsPath, "Roboto-Bold.ttf"), fontWeight: "bold" },
    ],
  });

  Font.register({
    family: "Montserrat",
    fonts: [
      { src: path.join(fontsPath, "Montserrat-Regular.ttf") },
      { src: path.join(fontsPath, "Montserrat-Regular.ttf"), fontWeight: "normal" },
      { src: path.join(fontsPath, "Montserrat-Bold.ttf"), fontWeight: "bold" },
    ],
  });

  Font.register({
    family: "Helvetica",
    fonts: [
      { src: path.join(fontsPath, "Helvetica-Regular.ttf") },
      { src: path.join(fontsPath, "Helvetica-Regular.ttf"), fontWeight: "normal" },
      { src: path.join(fontsPath, "Helvetica-Bold.ttf"), fontWeight: "bold" },
      { src: path.join(fontsPath, "Helvetica-Oblique.ttf"), fontStyle: "italic" },
      { src: path.join(fontsPath, "Helvetica-Light.ttf"), fontWeight: "light" },
      { src: path.join(fontsPath, "Helvetica-Medium.ttf"), fontWeight: "medium" },
    ],
  });

  Font.register({
    family: "Inter",
    fonts: [
      { src: path.join(fontsPath, "Inter-Regular.ttf") },
      { src: path.join(fontsPath, "Inter-Regular.ttf"), fontWeight: "normal" },
      { src: path.join(fontsPath, "Inter-Bold.ttf"), fontWeight: "bold" },
      { src: path.join(fontsPath, "Inter-Medium.ttf"), fontWeight: "medium" },
      { src: path.join(fontsPath, "Inter-Light.ttf"), fontWeight: "light" },
    ],
  });

  Font.register({
    family: "Poppins",
    fonts: [
      { src: path.join(fontsPath, "Poppins-Regular.ttf") },
      { src: path.join(fontsPath, "Poppins-Regular.ttf"), fontWeight: "normal" },
      { src: path.join(fontsPath, "Poppins-Bold.ttf"), fontWeight: "bold" },
      { src: path.join(fontsPath, "Poppins-Italic.ttf"), fontStyle: "italic" },
    ],
  });

  Font.register({
    family: "Quensialy",
    fonts: [{ src: path.join(fontsPath, "Quensialy-Signature.ttf") }],
  });

  registered = true;
}
