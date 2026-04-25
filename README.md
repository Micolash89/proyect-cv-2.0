# CV Generator Pro

Crea currículums vitae profesionales en PDF con 8 plantillas diseñadas para destacar tu perfil laboral.

## Características

- Creación de CVs con 8 plantillas profesionales
- Formulario de registro público
- Panel de administración completo
- Integración con Google OAuth (autocompletar datos desde tu cuenta Google)
- Integración con APIs de IA (Gemini, Claude, Groq) para mejorar tu CV
- Generación de PDF descargable de alta calidad
- Integración con Georef API para ubicaciones de Argentina
- Subida de fotos a Cloudinary
- Personalización de colores, fuentes y diseño

## Tech Stack

- **Frontend**: Next.js 16, React 19, Tailwind CSS 4
- **Base de datos**: MongoDB
- **Auth**: JWT, Google OAuth
- **AI**: Google Gemini, Anthropic Claude, Groq
- **PDF**: @react-pdf/renderer
- **Imágenes**: Cloudinary

## Instalación

```bash
# 1. Clonar el proyecto
git clone <repo-url>
cd proyect-page

# 2. Instalar dependencias
pnpm install

# 3. Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales

# 4. Iniciar servidor de desarrollo
pnpm dev
```

## Variables de entorno requeridas

```env
# MongoDB
MONGODB_URI=mongodb+srv://...

# JWT
JWT_SECRET=tu_secreto

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret

# AI Providers
GEMINI_API_KEY=tu_gemini_key
GROQ_API_KEY=tu_groq_key
CLAUDE_API_KEY=tu_claude_key

# Email (SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu_email
EMAIL_PASSWORD=tu_app_password

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=tu_client_id
GOOGLE_CLIENT_SECRET=tu_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
```

## Comandos

```bash
pnpm dev        # Desarrollo
pnpm build      # Producción
pnpm start      # Iniciar producción
pnpm lint       # Linter
pnpm typecheck  # Verificar tipos
```

---

## Autor

<a href="https://www.linkedin.com/in/javier-espindola/" target="_blank">
  <img src="https://media.licdn.com/dms/image/v2/D4D35AQEbzgOBZNVnVw/profile-framedphoto-shrink_400_400/B4DZliqCu.H0Ag-/0/1758296812799?e=1777752000&v=beta&t=wNDzyuzfBIS7z8VBHRwF2T6VPyH3Lz72sr4pX0GNkb4" alt="Javier Espindola" width="150" style="border-radius: 50%;" />
</a>

**Javier Espindola**
<a href="https://www.linkedin.com/in/javier-espindola/" target="_blank">LinkedIn</a>
