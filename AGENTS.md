# AGENTS.md

> Instrucciones para agentes de IA que trabajen en este proyecto.
> Leé este archivo completo antes de escribir o modificar cualquier código.

---

## 🗂️ Stack & Entorno

- **Framework**: Next.js (App Router) con TypeScript estricto
- **Package manager**: `pnpm` — nunca uses `npm` ni `yarn`
- **OS del desarrollador**: Windows 11, terminal PowerShell
- **Rutas de proyecto**: bajo `D:\programacion\`

### Comandos esenciales

```bash
pnpm install          # instalar dependencias
pnpm dev              # servidor de desarrollo
pnpm build            # build de producción
pnpm lint             # ESLint
pnpm typecheck        # tsc --noEmit
pnpm test             # correr tests (Jest + React Testing Library)
pnpm test --watch     # modo watch
```

> Antes de dar una tarea por terminada, asegurate de que `pnpm lint` y `pnpm typecheck` pasen sin errores.

---

## 🧱 Principios SOLID — Aplicación Práctica

Estos principios son **obligatorios**. Aplicarlos no es opcional.

### S — Single Responsibility Principle
Cada módulo, componente, hook o función tiene **una sola razón para cambiar**.

```ts
// ❌ MAL: un componente que fetcha, valida y renderiza
export function UserCard() {
  const [user, setUser] = useState(null);
  useEffect(() => { fetch('/api/user').then(...) }, []);
  if (!user?.email.includes('@')) return <p>Email inválido</p>;
  return <div>{user.name}</div>;
}

// ✅ BIEN: responsabilidades separadas
// services/userService.ts  → fetching
// hooks/useUser.ts         → estado y efecto
// utils/validators.ts      → validación
// components/ui/UserCard.tsx → solo renderizado
```

### O — Open/Closed Principle
El código está **abierto para extensión, cerrado para modificación**.
Usá props, composición y variantes en lugar de `if/else` que crecen con el tiempo.

```ts
// ❌ MAL: agregar un tipo nuevo rompe la función
function getButtonStyle(type: string) {
  if (type === 'primary') return 'bg-blue-500';
  if (type === 'danger') return 'bg-red-500';
  // cada nuevo tipo requiere modificar esta función
}

// ✅ BIEN: mapa de variantes extensible sin tocar el componente
const buttonVariants: Record<ButtonVariant, string> = {
  primary: 'bg-blue-500 text-white',
  danger:  'bg-red-500 text-white',
  ghost:   'bg-transparent border border-current',
};
```

### L — Liskov Substitution Principle
Los componentes hijos y las implementaciones concretas deben poder usarse en lugar de su abstracción sin romper nada.
Cuando extendas un componente base, no elimines ni rompas el contrato de sus props.

```ts
// ✅ BIEN: IconButton extiende Button sin romper su contrato
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}
interface IconButtonProps extends ButtonProps {
  icon: React.ReactNode;
}
```

### I — Interface Segregation Principle
No obligues a un módulo a depender de lo que no usa. Preferí interfaces pequeñas y específicas.

```ts
// ❌ MAL: una interfaz gigante que no todos usan completo
interface UserRepository {
  getById(id: string): Promise<User>;
  getAll(): Promise<User[]>;
  create(data: CreateUserDto): Promise<User>;
  update(id: string, data: UpdateUserDto): Promise<User>;
  delete(id: string): Promise<void>;
  exportToCsv(): Promise<string>; // ← ¿por qué el repo sabe de CSV?
}

// ✅ BIEN: interfaces segregadas
interface UserReader { getById(id: string): Promise<User>; getAll(): Promise<User[]>; }
interface UserWriter { create(data: CreateUserDto): Promise<User>; update(...): Promise<User>; delete(...): Promise<void>; }
interface UserExporter { exportToCsv(): Promise<string>; }
```

### D — Dependency Inversion Principle
Los módulos de alto nivel no dependen de implementaciones concretas, dependen de abstracciones.
Inyectá dependencias por props o contexto.

```ts
// ❌ MAL: acoplado a una implementación concreta
import { MongoUserRepository } from '@/services/MongoUserRepository';
export function useUsers() {
  const repo = new MongoUserRepository(); // ← acoplamiento duro
}

// ✅ BIEN: el hook depende de la abstracción, no de Mongo
interface IUserRepository { getAll(): Promise<User[]>; }
export function useUsers(repo: IUserRepository) { ... }
```

---

## ♻️ Reutilización de Código

### Antes de escribir algo nuevo
1. Buscá en `src/components/ui/` si ya existe un componente similar.
2. Buscá en `src/hooks/` si ya hay un hook para ese patrón.
3. Buscá en `src/utils/` si la función pura ya existe.
4. Si no existe: **crealo genérico desde el principio**, no acoplado al caso de uso específico.

### Reglas de extracción
| Si repetís algo… | Extraelo a… |
|---|---|
| Lógica de estado + efectos | `src/hooks/use[Nombre].ts` |
| Llamadas a API | `src/services/[dominio]Service.ts` |
| Función pura sin side effects | `src/utils/[nombre].ts` |
| Bloque JSX reutilizable | `src/components/ui/[Nombre].tsx` |
| Tipos compartidos | `src/types/[dominio].ts` |

### Composición sobre herencia
Preferí composición de componentes en lugar de componentes monolíticos.

```tsx
// ✅ Composición
<Card>
  <Card.Header>Título</Card.Header>
  <Card.Body>Contenido</Card.Body>
  <Card.Footer>Acciones</Card.Footer>
</Card>
```

---

## 🔷 Convenciones TypeScript

- `strict: true` en `tsconfig.json` — no lo desactivés.
- **Prohibido** usar `any`. Si necesitás tipar algo desconocido, usá `unknown` y hacé narrowing.
- Preferí `interface` para objetos/componentes, `type` para uniones y utilidades.
- Todos los props de componentes tienen su propia interface con sufijo `Props`.
- Exportá los tipos que puedan ser reutilizados desde `src/types/`.

```ts
// ✅ Convención de naming para tipos
interface UserCardProps { ... }
type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
type ApiResponse<T> = { data: T; error: null } | { data: null; error: string };
```

---

## 🧩 Convenciones de Componentes

- Un componente por archivo. El archivo y el componente tienen el **mismo nombre** en PascalCase.
- Componentes de UI en `src/components/ui/` son **puros y sin lógica de negocio**.
- Los Server Components son el default en App Router — usá `'use client'` solo cuando sea estrictamente necesario (interactividad, hooks de estado).
- Custom hooks empiezan siempre con `use` y viven en `src/hooks/`.

```tsx
// Estructura estándar de un componente
import type { ButtonProps } from '@/types/ui';

export function Button({ variant = 'primary', children, ...props }: ButtonProps) {
  return (
    <button className={buttonVariants[variant]} {...props}>
      {children}
    </button>
  );
}
```

---

## 🧪 Testing

- Tests con **Jest** + **React Testing Library**.
- Los archivos de test van junto al módulo que testean: `Button.test.tsx` al lado de `Button.tsx`.
- Testeá **comportamiento**, no implementación interna.
- Nombrá los tests en español o inglés, pero de forma descriptiva.

```ts
// ✅ describe qué hace, no cómo está implementado
describe('Button', () => {
  it('llama a onClick cuando se hace clic', () => { ... });
  it('no llama a onClick cuando está disabled', () => { ... });
});
```

---

## 🚫 Prohibiciones Explícitas

- ❌ No uses `npm` ni `yarn`. Solo `pnpm`.
- ❌ No uses `any` en TypeScript.
- ❌ No pongas lógica de negocio en componentes de UI.
- ❌ No hagas fetch directamente en componentes de cliente — usá un service o un hook.
- ❌ No dupliques código que ya existe en `utils/`, `hooks/` o `components/ui/`.
- ❌ No desactivés reglas de ESLint con `// eslint-disable` sin dejar un comentario que justifique por qué.
- ❌ No uses `'use client'` innecesariamente — los Server Components son más eficientes.

---

## ✅ Checklist antes de cada commit

- [ ] `pnpm typecheck` pasa sin errores
- [ ] `pnpm lint` pasa sin errores ni warnings ignorados
- [ ] `pnpm test` pasa en verde
- [ ] El código nuevo reutiliza lo que ya existe
- [ ] No hay `any`, no hay lógica duplicada
- [ ] Los componentes nuevos son genéricos y reutilizables cuando aplica