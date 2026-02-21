"use client";

import { useState, useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  User, Mail, Phone, MapPin, Briefcase, GraduationCap,
  Upload, ChevronRight, ChevronLeft,
  Check, Plus, X, FileText, Image, Link2, ExternalLink,
  CheckCircle, AlertCircle
} from "lucide-react";
import { cn, generateId } from "@/lib/utils/cn";
import { createCV } from "@/actions/cv";
import type { TemplateType, FontSize, LayoutOrder, Experience, Education, Language } from "@/types";

const steps = [
  { id: 1, title: "Datos Personales", icon: User },
  { id: 2, title: "Foto", icon: Image },
  { id: 3, title: "Experiencia", icon: Briefcase },
  { id: 4, title: "Educación", icon: GraduationCap },
  { id: 5, title: "Habilidades", icon: FileText },
  { id: 6, title: "Confirmar", icon: CheckCircle },
];

const colorPalette = [
  { name: "Gris Oscuro", value: "#374151" },
  { name: "Gris", value: "#6b7280" },
  { name: "Azul Noche", value: "#1e3a5f" },
  { name: "Bordó", value: "#7f1d1d" },
  { name: "Verde Oliva", value: "#3f6212" },
  { name: "Marrón", value: "#78350f" },
  { name: "Negro", value: "#111827" },
  { name: "Gris Claro", value: "#9ca3af" },
];

const languageOptions = [
  { value: "Español", label: "Español" },
  { value: "Inglés", label: "Inglés" },
  { value: "Portugués", label: "Portugués" },
  { value: "Francés", label: "Francés" },
  { value: "Alemán", label: "Alemán" },
  { value: "Italiano", label: "Italiano" },
  { value: "Otro", label: "Otro" },
];

const levelOptions = [
  { value: "Básico", label: "Básico" },
  { value: "Intermedio", label: "Intermedio" },
  { value: "Avanzado", label: "Avanzado" },
  { value: "Nativo", label: "Nativo" },
];

const basicInfoSchema = z.object({
  fullName: z.string().min(2, "Nombre muy corto"),
  phone: z.string().min(10, "Teléfono muy corto"),
});

type FormData = z.infer<typeof basicInfoSchema> & {
  dni?: string;
  email?: string;
  location?: string;
  links?: string;
  photo?: string;
  summary?: string;
  experience: Experience[];
  education: Education[];
  skills: string[];
  languages: Language[];
  selectedTemplate: TemplateType;
  templateSettings: {
    primaryColor: string;
    fontSize: FontSize;
    fontFamily: string;
    layout: LayoutOrder;
    padding: number;
    margin: number;
  };
};

const defaultFormData: FormData = {
  fullName: "",
  phone: "",
  dni: "",
  email: "",
  location: "",
  links: "",
  photo: "",
  summary: "",
  experience: [],
  education: [],
  skills: [],
  languages: [],
  selectedTemplate: "harvard",
  templateSettings: {
    primaryColor: "#111827",
    fontSize: "medium",
    fontFamily: "Inter",
    layout: "descending",
    padding: 20,
    margin: 15,
  },
};

const CABA_DISTRICTS = [
  "Agronomía", "Almagro", "Balvaneda", "Barracas", "Belgrano", "Boedo", 
  "Caballito", "Chacarita", "Coghlan", "Colegiales", "Constitución", 
  "Flores", "Floresta", "La Boca", "La Paternal", 
  "Liniers", "Mataderos", "Monte Castro", "Nueva Pompeya", "Nuñez", 
  "Palermo", "Parque Avellaneda", "Parque Chacabuco", "Parque Patricios", 
  "Paternal", "Pompeya", "Puerto Madero", "Recoleta", "Retiro", 
  "Saavedra", "San Cristóbal", "San Nicolás", "San Telmo", 
  "Vélez Sarsfield", "Versalles", "Villa Crespo", "Villa del Parque", 
  "Villa General Mitre", "Villa Lugano", "Villa Urquiza", "Villa Real",
  "Villa Santa Rita", "Villa Soldati", "Villa Sarmieno"
];

const AMBA_LOCATIONS = [
  { name: "Almirante Brown", districts: ["Adrogue", "Burzaco", "Cañuelas", "Claypole", "Don Bosco", "Glew", "José Marmol", "Longchamps", "Ministro Rivadavia", "Rafael Calzada", "San Francisco Solano", "Villanueva"] },
  { name: "Avellaneda", districts: ["Avellaneda", "Dock Sud", "Gerli", "Piñeiro", "Sarandí", "Villa Domínico", "Wilde"] },
  { name: "Berazategui", districts: ["Berazategui", "El Pato", "Florencio Varela", "Guatelú", "Hudson", "Juan María Gutiérrez", "Los Sauces", "Plátanos", "Pereyra", "Ranelagh", "Sourigues", "Villa San Carlos"] },
  { name: "Brandsen", districts: ["Brandsen", "Cañuelas", "Chascomús", "Domselaar", "Etchegoyen", "Gómez", "Jagüel", "Lobos", "Monte", "Navarro", "Ponte", "San Vicente", "Veinticinco de Mayo"] },
  { name: "Carlos Spegazzini", districts: ["Carlos Spegazzini", "Platanal"] },
  { name: "Escobar", districts: ["Belén de Escobar", "Garín", "Ingeniero Maschwitz", "José León Suárez", "Laubat", "Loma Verde", "Los Cardales", "Matheu", "Pilar", "San Miguel", "Tortugas", "Villa Ballester"] },
  { name: "Esteban Echeverría", districts: ["Canning", "Carlos María Naón", "El Jagüel", "Esteban Echeverría", "Grand Bourg", "La Reja", "Los Polvorines", "Manuel B. Gonnet", "María Elena", "Mendoza", "Ministro Rivadavia", "Monte Grande", "Padre Varela", "Sáenz Peña"] },
  { name: "Ezeiza", districts: ["Canning", "Ezeiza", "La Unión", "Los Pozos", "Santa Rosa"] },
  { name: "Florencio Varela", districts: ["Alto de La Gloria", "Bosque", "Don Orione", "El Trocadero", "Florencio Varela", "Gobernador Julio Costa", "Ingeniero Juan Allan", "La Capilla", "La Perla", "Liniers", "Macasins", "Montecarlo", "Presidente Perón", "San Cleto", "San Francisco", "Santa Ines", "Villa Brown", "Villa Natalia", "Zeballos"] },
  { name: "General Las Heras", districts: ["Aristóbulo del Valle", "Chascomús", "General Las Heras", "Korn", "Villars"] },
  { name: "General Rodríguez", districts: ["General Rodríguez", "Los Aromos", "Parque Leloir"] },
  { name: "General San Martín", districts: ["Bartolomé Mitre", "Chilavert", "Ciudad General Martín", "Cohab", "El Libertador", "General San Martín", "Laferrer", "Lomas del Mirador", "Martín Coronado", "Mtro. J. M. Torcuato", "Obras Sanitarias", "San Andrés", "San Lorenzo", "Villa Ballester", "Villa Maipú"] },
  { name: "Hurlingham", districts: ["Hurlingham", "Itatí", "Pablo Podestá", "Remedios de Escalada", "San Miguel", "Villa Sarmiento", "William Morris"] },
  { name: "Ituzaingó", districts: ["Barrio Parque Leloir", "Ituzaingó", "Liniers", "San Antonio de Padua", "Villa Adelina", "Villa Esteban Echeverría"] },
  { name: "José C. Paz", districts: ["José C. Paz", "Los Polvorines", "Pilar", "Tortugas"] },
  { name: "La Matanza", districts: ["20 de Junio", "Aldo Bonzi", "Ciudad Evita", "Gregorio de Laferrere", "González Catán", "Isidro Casanova", "José Ingenieros", "Juan José Castelli", "La Tablada", "Lomas del Mirador", "Machado", "Mariano Acosta", "Mataderos", "Nicanor Otamendi", "Padre Hurtado", "Parque La Matanza", "Rafael Castillo", "Ramón J. Cárcano", "San Justo", "Tapiales", "Villa Angela", "Villa Ins super", "Virrey del Pino"] },
  { name: "La Plata", districts: ["Abasto", "Altos de San Lorenzo", "Angosta", "Arana", "Arturo Seguí", "Atlantis", "Bañado de Los Italianos", "Barrio Arana", "Barrio Casablanca", "Barrio El Carmen", "Barrio Jose M. Moreno", "Barrio Las Lilas", "Barrio Lisandro", "Barrio Lote", "Barrio Nuevo", "Barrio Olimpo", "Barrio Parque", "Barrio Politecnico", "Barrio Puerto", "Barrio S旗", "Barrio Universidad", "Barrios del sur", "Bello", "Berisso", "Boca de Tauro", "Cañada de Arreci", "City Bell", "Cochrane", "Colombo", "Cruz del Eje", "El Dique", "El Hormiguero", "El Peligro", "El Plata", "Ensenada", "Escobar", "Essen", "Estación Provincial", "Etchart", "Eva Perón", "Fortunato", "Gambier", "Gonnet", "Gorriti", "Hernandarias", "Hudson", "Joaquín Gorriti", "José Hernández", "Juan B. Justo", "Juan Manuel Rosas", "La PLata", "Lagos", "Las Bretañas", "Las Flores", "Las Quintas", "Lisandro del Valle", "Los Angeles", "Los Carpinchos", "Los Hornos", "Los Tallares", "Luzuriaga", "Manuel B. Gonnet", "Melchor Romero", "Mendoza", "Misol", "Montecarlo", "Olmos", "Orden", "Orense", "Parque Siccardi", "Pereira", "Pilar", "Pirane", "Pirovano", "Platanos", "Pozo de La Rivera", "Pozo del Molle", "Punta Lara", "Quilmes", "Ramel", "Ranelagh", "Río Santiago", "Ringuelet", "Roberto J. Payró", "Rodríguez", "Roma", "Rosario", "Ruiz", "Sabana Grande", "Sagrada Familia", "Saladillo", "Salliqueló", "San Alberto", "San Antonio", "San贝尔", "San Carlos", "San Cayetano", "San Clemente", "San Emilio", "San Esteban", "San Felipe", "San Fernando", "San Francisco", "San Huberto", "San Ignacio", "San Isidoro", "San Jacinto", "San Javier", "San José", "San Juan", "San Lorenzo", "San Luis", "San Manuel", "San Marcos", "San Martín", "San Miguel", "San Narciso", "San Pablo", "San Patricio", "San Pedro", "San Rafael", "San Ramón", "San Ricardo", "San Roberto", "San Salvador", "San Sebastián", "San Silverio", "San Simón", "San Telmo", "San Vicente", "Santa Clara", "Santa Cruz", "Santa Elena", "Santa Lucia", "Santa Magdalena", "Santa María", "Santa Monica", "Santa Rita", "Santa Rosa", "Santiago", "Santo Domingo", "Santo Tomas", "Sarandí", "Sarmiento", "Sauce Corto", "Sauce de Luna", "Sauze", "Serrano", "Silvina", "Sinsacate", "Soitué", "Solder", "Soledad", "Suite", "Sunchales", "Superí", "Tabossi", "Tacuarendí", "Tacv", "Tanti", "Tartagal", "Teodelina", "Teuco", "Ticino", "Tio Pujol", "Tolosa", "Tornillo", "Tostado", "Trenque Lauquen", "Tressens", "Trevelin", "Trinidad", "Troncos del Talar", "Tunuyán", "Tupungato", "Turdera", "Tío", "Uribelarrea", "Urling", "Uspallata", "Valcheta", "Viale", "Victoria", "Vieytes", "Villa Aldo", "Villa Alsina", "Villa Anita", "Villa Argentina", "Villa Bab", "Villa Ballester", "Villa Bernardino", "Villa Bosch", "Villa Bresci", "Villa Buenos Aires", "Villa Caleufu", "Villa Carlos", "Villa del Parque", "Villa Diego", "Villa Dolores", "Villa Domín", "Villa El Cacique", "Villa Elisa", "Villa Elvira", "Villa Euzkadi", "Villa Gagliano", "Villa General", "Villa Giardino", "Villa Guillermo", "Villa Herminia", "Villa Hipodromo", "Villa Huinid", "Villa Juan", "Villa La Bolsa", "Villa Laca", "Villa Lihuel", "Villa Los Andes", "Villa Lugano", "Villa Luzuriaga", "Villa M", "Villa Mach", "Villa Mario", "Villa Mercedes", "Villa N \nTraigo Mucha", "Villa Nueva", "Villa Ocampo", "Villa Outes", "Villa Parque", "Villa Paso", "Villa Paunero", "Villa Pucú", "Villa Raffo", "Villa Ramón", "Villa Rialto", "Villa Rivera", "Villa Rosa", "Villa Saralegui", "Villa Sarmiento", "Villa Siede", "Villa Tulumaya", "Villa Unión", "Villa Valeros", "Villa Vicente", "Villa Zorraquin", "Villanueva", "Yata", "Yerba Buena", "Zaballa", "Zapata", "Zona Rural"] },
  { name: "Lomas de Zamora", districts: ["Banfield", "Barrio Lomas", "Barrio Temperley", "Cañada de Marques", "Cuartel V", "Esperanza", "Esteban Echeverría", "Ingeniero Budge", "Isidro Casanova", "Juan José Castelli", "Laingle", "Llavallol", "Lomas de Zamora", "Luis Guillon", "Olivera", "Pereira", "Ponte", "Rafael Calzada", "San José", "Santa Maria", "Tapiales", "Temperley", "Turdera", "Villa Albertina", "Villa Catalina", "Villa de los Remedios", "VillaEsperanza", "Villa Fiorito", "Villa Guillermina", "Villa Hidalgo", "Villa Inmaculada", "Villa Juan", "Villa Lemme", "Villa Luzuriaga", "Villa Ramón", "Villa Remedios", "Villa Ross", "Villa Sarmiento", "Villa Siede", "Villa Unión", "Villa Zelmira"] },
  { name: "Malvinas Argentinas", districts: ["Alberto L. M. S", "Grand Bourg", "Ing. Pablo Nogués", "Los Polvorines", "Malvinas Argentinas", "Martín Coronado", "Mendoza", "Pablo Nogués", "Tierras de Malvinas", "Tortugas", "Villa de Mayo", "Villa Guillermina", "Villa Los Andes", "Villa Sarmiento"] },
  { name: "Marcos Paz", districts: ["Barrio Las Latas", "Marcos Paz", "Santa Rosa"] },
  { name: "Merlo", districts: ["Libertad", "Merlo", "Padre Varela", "Ponte", "San Antonio de Padua", "Santa Rosa"] },
  { name: "Moreno", districts: ["Cuartel V", "Francisco Álvarez", "La Reja", "Lomas del Mirador", "Mariano Acosta", "Merlo", "Moreno", "Pascual", "Pte. Ibañez", "San Miguel", "Trueno"] },
  { name: "Morón", districts: ["Castelar", "Haedo", "Hurlingham", "Isidro Casanova", "Libertad", "Merlo", "Morón", "Rafael Castillo", "Ramón J. Cárcano", "San Antonio de Padua", "San Miguel", "Villa Sarmiento"] },
  { name: "Pilar", districts: ["Alberto L. M. S", "Belén de Escobar", "Carlos M. Naón", "Del Viso", "Duncan", "ElEO", "ElTerror", "F.Álvarez", "Garín", "General Rodríguez", "Ingeniero Maschwitz", "José C. Paz", "La Lonja", "Lagomarsino", "Las Paletas", "Lima", "Los Cardales", "Los Hornos", "Manuel Alberti", "Mariano Acosta", "Matheu", "Mayo", "Mendoza", "M. Rivadavia", "Pilar", "Pinazo", "President", "Pte. Derqui", "Pte. Sán", "San Fernando", "San Miguel", "Santa María", "Sauce de Luna", "Tigre", "Tortugas", "Troncos del Talar", "Varela", "Victoria", "Villa B", "Villa Ballester", "Villa de Mayo", "Villa Ermenegildo", "Villa Rosa", "Zelaya"] },
  { name: "Quilmes", districts: ["Bernal", "Ezpeleta", "La Paz", "Quilmes", "Quilmes Oeste", "San Francisco Solano", "Villa Azul", "Villa Carmen", "Villa Crámer", "Villa Evita", "Villa Francisco", "Villa La Juanita", "Villa Luján", "Villa Norma", "Villa San Alejandro", "Villa San José", "Villa Santa Lucia", "Villa Sarmiento", "Zabaleta"] },
  { name: "San Fernando", districts: ["Carupá", "San Fernando", "Tigre", "Victoria", "Virreyes"] },
  { name: "San Isidro", districts: ["Acassuso", "Beccar", "Boulogne", "Cármen de Areco", "Martínez", "San Isidro", "Villa Adelina"] },
  { name: "San Miguel", districts: ["Barrio Lomas", "Bella Vista", "Don Mario", "General Paz", "Lomas del Mirador", "Manuel B. Gonnet", "Mariano Acosta", "Muñiz", "Pablo Podestá", "San Miguel", "Santa María", "Sgto. Cabral", "Villa Adelina", "Villa Amespil", "Villa Argentina", "Villa Ascasubi", "Villa Baril", "Villa Berna", "Villa Carlos", "Villa del Parque", "Villa Diego", "Villa Dolores", "Villa Duss", "Villa El Dique", "Villa Eloisa", "Villa Esquiú", "Villa Faustino", "Villa Fernández", "Villa Gamba", "Villa General", "Villa Guillermina", "Villa Hernán", "Villa Huidobro", "Villa La Cal", "Villa La Celeste", "Villa La Granada", "Villa Las Lajas", "Villa Leandrauján", "", "Villa LVilla M", "Villa María Elena", "Villa Mascardi", "Villa Matienzo", "VillaMercedes", "Villa Monte", "Villa Natalia", "Villa N \nTraigo Mucha", "Villa O'Donnell", "Villa Ortiz", "Villa P", "Villa Paunero", "Villa Porvenir", "Villa Quidora", "Villa Ramón", "Villa Remedios", "Villa Rey", "Villa Rivera", "VillaRomero", "Villa Rosa", "Villa Rucci", "Villa S", "Villa Sabelli", "Villa Saj", "Villa San", "VillaSanJuan", "Villa Santa", "Villa Santa Cruz", "Villa Sofía", "Villa Soldati", "Villa Son", "Villa Te", "Villa U", "Villa V", "Villa Valentina", "Villa Zabaleta", "Virrey del Pino"] },
  { name: "San Vicente", districts: ["Alejandro Korn", "Barrio Olimpo", "Barrio San Vicente", "Camino Real", "Cañete", "Domselaar", "San Vicente", "Suipacha"] },
  { name: "Tigre", districts: ["Benavídez", "Dique Luján", "El Talar", "General Pacheco", "Golf", "Islas del Delta", "La Plata", "Lima", "Maquinista F. Savio", "Nordelta", "Río Capitán", "San Fernando", "San Lorenzo", "San Martín", "Talar", "Tigre", "Troncos del Talar", "Victoria", "Virreyes"] },
  { name: "Tres de Febrero", districts: ["Caseros", "Ciudadela", "Haedo", "J. M. E. Pdte", "José Ingenieros", "Libertad", "Lomas del Mirador", "Longchamps", "Lougher", "Manuel B. Gonnet", "Mariano Acosta", "Martín Coronado", "Merlo", "Mitrid", "Montegrande", "Moreno", "Nicanor Otamendi", "Pablo Podestá", "Paso del Rey", "Peh", "Ponte", "Rafael Castillo", "Remedios de Escalada", "S生了", "San Andrés", "San Ferry", "SanJusto", "Santos", "Tigre", "Trueno", "Veinticinco", "Villa Ballester", "Villa Sarmiento"] },
  { name: "Vicente López", districts: ["Acassuso", "Av.ellaneda", "Barrio Saavedra", "Bellas Virgenes", "Boulogne", "Carapachay", "Florida", "La Lucila", "Las Latas", "Los Troncos", "Martínez", "Olivos", "Padilla", "Paternal", "Pte. Derqui", "Recoleta", "Saavedra", "San Fernando", "San Isidro", "San Martín", "Santa Rita", "SFlores", "Tablada", "Valencia", "Vicente López", "Villa Adelina", "Villa Ballester", "Villa María", "Villa Martelli", "Villa Real", "Virasoro"] },
];

export default function RegistroPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(defaultFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [showLinks, setShowLinks] = useState(false);
  const [showLocation, setShowLocation] = useState(false);
  const [locationType, setLocationType] = useState<"caba" | "amba">("caba");
  const [ambaZone, setAmbaZone] = useState("");
  const [newLanguage, setNewLanguage] = useState({ language: "Español", level: "Intermedio", custom: "" });
  const [showSummaryModal, setShowSummaryModal] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: formData,
  });

  const updateFormData = useCallback((data: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  }, []);

  const addExperience = () => {
    setFormData((prev) => ({
      ...prev,
      experience: [
        ...prev.experience,
        { id: generateId(), company: "", position: "", startDate: "", endDate: "", current: false, description: "" },
      ],
    }));
  };

  const removeExperience = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      experience: prev.experience.filter((exp) => exp.id !== id),
    }));
  };

  const updateExperience = (id: string, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      experience: prev.experience.map((exp) =>
        exp.id === id ? { ...exp, [field]: value } : exp
      ),
    }));
  };

  const addEducation = () => {
    setFormData((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        { id: generateId(), institution: "", degree: "", field: "", startDate: "", endDate: "", current: false },
      ],
    }));
  };

  const removeEducation = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      education: prev.education.filter((edu) => edu.id !== id),
    }));
  };

  const updateEducation = (id: string, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      education: prev.education.map((edu) =>
        edu.id === id ? { ...edu, [field]: value } : edu
      ),
    }));
  };

  const addSkill = (skill: string) => {
    if (skill.trim() && !formData.skills.includes(skill.trim())) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, skill.trim()],
      }));
    }
  };

  const removeSkill = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skill),
    }));
  };

  const addLanguage = () => {
    const lang = newLanguage.custom || newLanguage.language;
    if (lang.trim()) {
      setFormData((prev) => ({
        ...prev,
        languages: [
          ...prev.languages,
          { id: generateId(), language: lang, level: newLanguage.level },
        ],
      }));
      setNewLanguage({ language: "Español", level: "Intermedio", custom: "" });
    }
  };

  const removeLanguage = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      languages: prev.languages.filter((lang) => lang.id !== id),
    }));
  };

  const handlePhotoUpload = (file: File) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("La imagen debe ser menor a 5MB");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPhotoPreview(objectUrl);
    setPhotoFile(file);
    toast.success("Foto seleccionada");
  };

  const handleDrop = (e: React.DragEvent, type: "photo") => {
    e.preventDefault();
    const file = type === "photo" ? e.dataTransfer.files[0] : null;
    if (file && file.type.startsWith("image/")) {
      handlePhotoUpload(file);
    }
  };

  const uploadPhotoToCloudinary = async (file: File): Promise<string> => {
    const formDataUpload = new FormData();
    formDataUpload.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formDataUpload,
    });
    const data = await res.json();
    
    if (data.url) {
      return data.url;
    }
    throw new Error("Error al subir la foto");
  };

  const onSubmit = async () => {
    setIsSubmitting(true);
    try {
      let photoUrl = "";
      
      if (photoFile) {
        photoUrl = await uploadPhotoToCloudinary(photoFile);
      }

      await createCV({ ...formData, photo: photoUrl });
      window.location.href = `/success?phone=${encodeURIComponent(formData.phone)}&name=${encodeURIComponent(formData.fullName)}`;
    } catch (error: any) {
      toast.error(error.message || "Error al enviar el formulario");
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.fullName && formData.phone;
      default:
        return true;
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <h1 className="text-3xl font-bold mb-2">Crea tu CV</h1>
          <p className="text-muted-foreground">
            Completa los siguientes pasos
          </p>
        </motion.div>

        <div className="hidden md:flex justify-center mb-8 overflow-x-auto pb-2">
          <div className="flex items-center gap-2">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <button
                  onClick={() => step.id < currentStep && setCurrentStep(step.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm font-medium",
                    currentStep === step.id
                      ? "bg-foreground text-background"
                      : step.id < currentStep
                      ? "bg-muted text-foreground cursor-pointer hover:bg-muted/80"
                      : "bg-muted/50 text-muted-foreground cursor-not-allowed"
                  )}
                  disabled={step.id > currentStep}
                >
                  {step.id < currentStep ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <step.icon className="h-4 w-4" />
                  )}
                  <span>{step.title}</span>
                </button>
                {index < steps.length - 1 && (
                  <div className="w-8 h-0.5 bg-border mx-2" />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex md:hidden justify-center mb-6 overflow-x-auto pb-2">
          <div className="flex items-center gap-1">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <button
                  onClick={() => step.id < currentStep && setCurrentStep(step.id)}
                  className={cn(
                    "flex items-center gap-1 px-2 py-2 rounded-lg transition-all",
                    currentStep === step.id
                      ? "bg-foreground text-background"
                      : step.id < currentStep
                      ? "bg-muted cursor-pointer"
                      : "bg-muted/50"
                  )}
                  disabled={step.id > currentStep}
                >
                  {step.id < currentStep ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <step.icon className="h-3 w-3" />
                  )}
                </button>
                {index < steps.length - 1 && (
                  <div className="w-3 h-0.5 bg-border mx-0.5" />
                )}
              </div>
            ))}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {currentStep === 1 && <User className="h-5 w-5" />}
              {currentStep === 2 && <Image className="h-5 w-5" />}
              {currentStep === 3 && <Briefcase className="h-5 w-5" />}
              {currentStep === 4 && <GraduationCap className="h-5 w-5" />}
              {currentStep === 5 && <FileText className="h-5 w-5" />}
              {currentStep === 6 && <CheckCircle className="h-5 w-5" />}
              {steps[currentStep - 1].title}
            </CardTitle>
            <CardDescription>
              Paso {currentStep} de {steps.length}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AnimatePresence mode="wait">
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fullName">Nombre completo *</Label>
                      <Input
                        id="fullName"
                        value={formData.fullName}
                        onChange={(e) => updateFormData({ fullName: e.target.value })}
                        placeholder="Juan Pérez"
                        icon={<User className="h-4 w-4" />}
                      />
                      {errors.fullName && (
                        <p className="text-sm text-destructive mt-1">{errors.fullName.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="phone">Teléfono *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => updateFormData({ phone: e.target.value })}
                        placeholder="5491112345678"
                        icon={<Phone className="h-4 w-4" />}
                      />
                      {errors.phone && (
                        <p className="text-sm text-destructive mt-1">{errors.phone.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="dni">DNI (opcional)</Label>
                      <Input
                        id="dni"
                        value={formData.dni}
                        onChange={(e) => updateFormData({ dni: e.target.value })}
                        placeholder="12.345.678"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email (opcional)</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => updateFormData({ email: e.target.value })}
                        placeholder="juan@email.com"
                        icon={<Mail className="h-4 w-4" />}
                      />
                    </div>
                  </div>

                  {!showLocation ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowLocation(true)}
                      className="w-full"
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      Agregar ubicación
                    </Button>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant={locationType === "caba" ? "default" : "outline"}
                          size="sm"
                          onClick={() => { setLocationType("caba"); setAmbaZone(""); }}
                          className="flex-1"
                        >
                          CABA
                        </Button>
                        <Button
                          type="button"
                          variant={locationType === "amba" ? "default" : "outline"}
                          size="sm"
                          onClick={() => { setLocationType("amba"); setAmbaZone(""); }}
                          className="flex-1"
                        >
                          AMBA
                        </Button>
                      </div>
                      
                      {locationType === "caba" ? (
                        <Select
                          value={formData.location}
                          onChange={(e) => updateFormData({ location: `CABA, ${e.target.value}` })}
                          options={CABA_DISTRICTS.map(d => ({ value: d, label: d }))}
                          placeholder="Selecciona tu barrio"
                        />
                      ) : (
                        <div className="space-y-2">
                          <Select
                            value={ambaZone}
                            onChange={(e) => { setAmbaZone(e.target.value); updateFormData({ location: e.target.value }); }}
                            options={AMBA_LOCATIONS.map(z => ({ value: z.name, label: z.name }))}
                            placeholder="Selecciona el partido"
                          />
                          {ambaZone && (
                            <Select
                              value={formData.location}
                              onChange={(e) => updateFormData({ location: e.target.value })}
                              options={AMBA_LOCATIONS.find(z => z.name === ambaZone)?.districts.map(d => ({ value: d, label: d })) || []}
                              placeholder="Selecciona el barrio"
                            />
                          )}
                        </div>
                      )}
                      
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowLocation(false)}
                        className="mt-2 text-xs"
                      >
                        Cancelar
                      </Button>
                    </div>
                  )}

                  {!showLinks ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowLinks(true)}
                      className="w-full"
                    >
                      <Link2 className="h-4 w-4 mr-2" />
                      Agregar links relevantes
                    </Button>
                  ) : (
                    <div className="space-y-3">
                      <Label>Links relevantes</Label>
                      <Input
                        value={formData.links}
                        onChange={(e) => updateFormData({ links: e.target.value })}
                        placeholder="linkedin.com/in/tu-perfil, instagram.com/tu-negocio, etc."
                      />
                      <p className="text-xs text-muted-foreground">
                        Separa varios links con comas
                      </p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowLinks(false)}
                        className="text-xs"
                      >
                        Cancelar
                      </Button>
                    </div>
                  )}
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div 
                    className="flex flex-col items-center justify-center py-8 border-2 border-dashed rounded-lg"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleDrop(e, "photo")}
                  >
                    {photoPreview ? (
                      <div className="relative">
                        <img
                          src={photoPreview}
                          alt="Foto de perfil"
                          className="w-32 h-32 rounded-full object-cover border-4 border-foreground"
                        />
                        <button
                          type="button"
                          onClick={() => { setPhotoPreview(null); setPhotoFile(null); }}
                          className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center border-4 border-dashed border-muted-foreground">
                        <Image className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                    <Label htmlFor="photo" className="mt-4 cursor-pointer">
                      <div className="flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg hover:opacity-90 transition-opacity">
                        <Upload className="h-4 w-4" />
                        {uploadingPhoto ? "Subiendo..." : "Seleccionar foto"}
                      </div>
                      <input
                        id="photo"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handlePhotoUpload(e.target.files?.[0]!)}
                        disabled={uploadingPhoto}
                      />
                    </Label>
                    <p className="text-sm text-muted-foreground mt-2">
                      Arrastra una imagen o haz clic para seleccionar
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG hasta 5MB
                    </p>
                  </div>
                </motion.div>
              )}

              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  {formData.experience.map((exp, index) => (
                    <div key={exp.id} className="p-4 border rounded-lg space-y-3">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">Experiencia {index + 1}</h4>
                        <button
                          type="button"
                          onClick={() => removeExperience(exp.id)}
                          className="text-destructive hover:text-destructive/80"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="grid md:grid-cols-2 gap-3">
                        <Input
                          placeholder="Empresa"
                          value={exp.company}
                          onChange={(e) => updateExperience(exp.id, "company", e.target.value)}
                        />
                        <Input
                          placeholder="Puesto"
                          value={exp.position}
                          onChange={(e) => updateExperience(exp.id, "position", e.target.value)}
                        />
                      </div>
                      <div className="grid md:grid-cols-2 gap-3">
                        <Input
                          type="date"
                          value={exp.startDate}
                          onChange={(e) => updateExperience(exp.id, "startDate", e.target.value)}
                        />
                        <Input
                          type="date"
                          value={exp.endDate}
                          onChange={(e) => updateExperience(exp.id, "endDate", e.target.value)}
                          disabled={exp.current}
                        />
                      </div>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={exp.current}
                          onChange={(e) => updateExperience(exp.id, "current", e.target.checked)}
                          className="rounded"
                        />
                        <span className="text-sm">Trabajo actual</span>
                      </label>
                      <Textarea
                        placeholder="¿Qué funciones realizabas? ¿Qué logros obtuviste?"
                        value={exp.description}
                        onChange={(e) => updateExperience(exp.id, "description", e.target.value)}
                      />
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addExperience}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar experiencia
                  </Button>
                </motion.div>
              )}

              {currentStep === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  {formData.education.map((edu, index) => (
                    <div key={edu.id} className="p-4 border rounded-lg space-y-3">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">Educación {index + 1}</h4>
                        <button
                          type="button"
                          onClick={() => removeEducation(edu.id)}
                          className="text-destructive hover:text-destructive/80"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="grid md:grid-cols-2 gap-3">
                        <Input
                          placeholder="Institución"
                          value={edu.institution}
                          onChange={(e) => updateEducation(edu.id, "institution", e.target.value)}
                        />
                        <Input
                          placeholder="Título"
                          value={edu.degree}
                          onChange={(e) => updateEducation(edu.id, "degree", e.target.value)}
                        />
                      </div>
                      <Input
                        placeholder="Campo de estudio (opcional)"
                        value={edu.field}
                        onChange={(e) => updateEducation(edu.id, "field", e.target.value)}
                      />
                      <div className="grid md:grid-cols-2 gap-3">
                        <Input
                          type="date"
                          value={edu.startDate}
                          onChange={(e) => updateEducation(edu.id, "startDate", e.target.value)}
                        />
                        <Input
                          type="date"
                          value={edu.endDate}
                          onChange={(e) => updateEducation(edu.id, "endDate", e.target.value)}
                          disabled={edu.current}
                        />
                      </div>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={edu.current}
                          onChange={(e) => updateEducation(edu.id, "current", e.target.checked)}
                          className="rounded"
                        />
                        <span className="text-sm">Estudio actual</span>
                      </label>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addEducation}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar educación
                  </Button>
                </motion.div>
              )}

              {currentStep === 5 && (
                <motion.div
                  key="step5"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <Label>Habilidades</Label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {formData.skills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="cursor-pointer" onClick={() => removeSkill(skill)}>
                          {skill} <X className="h-3 w-3 ml-1" />
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Escribe una habilidad"
                        id="newSkill"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            const input = document.getElementById("newSkill") as HTMLInputElement;
                            addSkill(input.value);
                            input.value = "";
                          }
                        }}
                      />
                      <Button
                        type="button"
                        onClick={() => {
                          const input = document.getElementById("newSkill") as HTMLInputElement;
                          addSkill(input.value);
                          input.value = "";
                        }}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Ej: Atención al cliente, Ventas, Manipulación de alimentos
                    </p>
                  </div>

                  <div>
                    <Label>Idiomas</Label>
                    <div className="flex flex-col sm:flex-row gap-2 mt-2">
                      <Select
                        value={newLanguage.language}
                        onChange={(e) => setNewLanguage({ ...newLanguage, language: e.target.value })}
                        options={languageOptions}
                        className="flex-1"
                      />
                      {newLanguage.language === "Otro" && (
                        <Input
                          placeholder="Especifica el idioma"
                          value={newLanguage.custom}
                          onChange={(e) => setNewLanguage({ ...newLanguage, custom: e.target.value })}
                          className="flex-1"
                        />
                      )}
                      <Select
                        value={newLanguage.level}
                        onChange={(e) => setNewLanguage({ ...newLanguage, level: e.target.value })}
                        options={levelOptions}
                        className="sm:w-32"
                      />
                      <Button type="button" onClick={addLanguage}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {formData.languages.map((lang) => (
                        <Badge key={lang.id} variant="outline" className="cursor-pointer" onClick={() => removeLanguage(lang.id)}>
                          {lang.language} ({lang.level}) <X className="h-3 w-3 ml-1" />
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Resumen breve</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowSummaryModal(true)}
                      >
                        <AlertCircle className="h-4 w-4 mr-1" />
                        ¿Qué escribir?
                      </Button>
                    </div>
                    <Textarea
                      placeholder="Breve descripción de tu perfil profesional..."
                      value={formData.summary}
                      onChange={(e) => updateFormData({ summary: e.target.value })}
                      className="h-20"
                    />
                  </div>
                </motion.div>
              )}

              {currentStep === 6 && (
                <motion.div
                  key="step6"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <Label>Elige el diseño de tu CV</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                      {[
                        { id: "harvard", name: "Clásico", desc: "Diseño tradicional", color: "#111827" },
                        { id: "modern", name: "Moderno", desc: "Actual y dinámico", color: "#374151" },
                        { id: "minimal", name: "Minimalista", desc: "Limpio y moderno", color: "#6b7280" },
                      ].map((template) => (
                        <button
                          key={template.id}
                          type="button"
                          onClick={() => updateFormData({ 
                            selectedTemplate: template.id as TemplateType,
                            templateSettings: { ...formData.templateSettings, primaryColor: template.color }
                          })}
                          className={cn(
                            "p-4 border-2 rounded-lg text-left transition-all",
                            formData.selectedTemplate === template.id
                              ? "border-foreground bg-muted"
                              : "border-border hover:border-muted-foreground"
                          )}
                        >
                          <div className="aspect-[3/4] bg-muted rounded mb-2 flex items-center justify-center overflow-hidden">
                            <div className="w-full h-full flex">
                              <div className="w-1/3 bg-white"></div>
                              <div className="w-2/3 p-2">
                                <div className="h-2 bg-gray-300 rounded mb-1"></div>
                                <div className="h-1 bg-gray-200 rounded mb-1"></div>
                                <div className="h-1 bg-gray-200 rounded"></div>
                              </div>
                            </div>
                          </div>
                          <p className="font-medium text-sm">{template.name}</p>
                          <p className="text-xs text-muted-foreground">{template.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Color del diseño</Label>
                    <div className="grid grid-cols-4 gap-2 mt-2">
                      {colorPalette.map((color) => (
                        <button
                          key={color.value}
                          type="button"
                          onClick={() => updateFormData({
                            templateSettings: { ...formData.templateSettings, primaryColor: color.value }
                          })}
                          className={cn(
                            "h-12 rounded-lg border-2 transition-all",
                            formData.templateSettings.primaryColor === color.value
                              ? "border-foreground scale-105"
                              : "border-transparent hover:scale-105"
                          )}
                          style={{ backgroundColor: color.value }}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="font-medium mb-4">Resumen de tus datos</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Nombre:</span>
                        <span>{formData.fullName || "No especificado"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Teléfono:</span>
                        <span>{formData.phone}</span>
                      </div>
                      {formData.email && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Email:</span>
                          <span>{formData.email}</span>
                        </div>
                      )}
                      {formData.location && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Ubicación:</span>
                          <span>{formData.location}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Experiencias:</span>
                        <span>{formData.experience.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Educación:</span>
                        <span>{formData.education.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Habilidades:</span>
                        <span>{formData.skills.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Idiomas:</span>
                        <span>{formData.languages.length}</span>
                      </div>
                      {(photoPreview || formData.photo) && (
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-muted-foreground">Foto:</span>
                          <img src={photoPreview || formData.photo} alt="Foto" className="w-10 h-10 rounded-full object-cover" />
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex flex-col sm:flex-row justify-between gap-4 mt-8">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
                disabled={currentStep === 1}
                className="w-full sm:w-auto"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Anterior
              </Button>

              {currentStep < steps.length ? (
                <Button
                  onClick={() => setCurrentStep((prev) => Math.min(steps.length, prev + 1))}
                  disabled={!canProceed()}
                  className="w-full sm:w-auto"
                >
                  Siguiente
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={onSubmit} loading={isSubmitting} className="w-full sm:w-auto">
                  <Check className="h-4 w-4 mr-2" />
                  Enviar
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {showSummaryModal && (
        <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50 p-4">
          <div className="bg-card p-6 rounded-lg max-w-md">
            <h3 className="font-bold mb-2">¿Qué escribir en el resumen?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              El resumen es una descripción breve (2-3 oraciones) de quién eres y qué aportas.
              Ejemplo: "Profesional con experiencia en atención al cliente, orientado a la 
              satisfacción del usuario y resolución de problemas. Busco desarrollarme en el 
              sector de ventas y servicio al cliente."
            </p>
            <Button onClick={() => setShowSummaryModal(false)} className="w-full">
              Entendido
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
