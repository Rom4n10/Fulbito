# Reglas de Orquestación y Prompting: Matchmaking Deportivo App

Este documento establece las directrices maestras (System Prompt & Patterns) que el Agente Orquestador y todos los sub-agentes deben seguir invariablemente al trabajar en el proyecto **Matchmaking Deportivo App**. 

Estas reglas son una fusión de las restricciones técnicas de `Contexto.txt` y los mejores patrones de la carpeta `.agent/Skills` (especialmente `prompt-engineering-patterns` y `prompt-engineer`).

---

## 1. Jerarquía de Instrucciones (Instruction Hierarchy)

Cualquier prompt delegado a un sub-agente o procesado por el Orquestador debe seguir estrictamente esta estructura (Progressive Disclosure):

1. **System Context (Contexto Base):** Las reglas inmutables del proyecto.
2. **Task Instruction (Instrucción de la Tarea):** Qué se debe hacer, utilizando el framework adecuado (RODES, RTF, etc.).
3. **Examples (Few-Shot):** Ejemplos de código o formato esperado.
4. **Output Format (Formato de Salida):** Exigir JSON, XML o Markdown puro para evitar "chatter" innecesario.

### 🔒 System Context Obligatorio (Debe inyectarse en tareas relevantes)

- **Frontend:** Next.js (App Router), React, TypeScript estricto. Server Components por defecto, Client Components solo con interactividad (`"use client"`). Mutaciones siempre con Server Actions.
- **UI/UX:** Tailwind CSS, mobile-first. Aspecto premium mediante *Glassmorphism* (`backdrop-blur-md bg-white/30`). Uso de Atomic Design.
- **Backend/Base de Datos:** Supabase (PostgreSQL). Toda la seguridad se maneja por Row Level Security (RLS). Cero operaciones pesadas en frontend, delegar a Triggers y Cron Jobs.
- **Identidad:** Autenticación estricta con Supabase Auth (OAuth Google).

---

## 2. Plantillas de Delegación a Sub-Agentes (Template Systems)

Al delegar tareas a otras skills en `.agent/Skills`, el Orquestador debe usar los siguientes frameworks según la complejidad de la tarea:

### A. Tareas UI/Frontend Rápidas -> Framework RTF (Role, Task, Format)
*Usar con skills como: `antigravity-design-expert` o `ui-component`.*

> **Role:** Eres un experto en UI/UX y Tailwind CSS.
> **Task:** Crea la tarjeta de "Partido Abierto" (Match Card) aplicando Glassmorphism (backdrop-blur-md) y diseño mobile-first, leyendo datos de la tabla `matches`.
> **Format:** Devuelve ÚNICAMENTE el código del componente React en TypeScript. Sin explicaciones adicionales.

### B. Tareas Arquitectónicas o de Base de Datos -> Framework RODES (Role, Objective, Details, Examples, Sense check)
*Usar con skills como: `database-architect` o `supabase-automation`.*

> **Role:** Eres un Database Architect especializado en Supabase y PostgreSQL.
> **Objective:** Crear una nueva tabla para notificaciones de usuarios cumpliendo con las políticas de `Contexto.txt`.
> **Details:** Debe relacionarse con `public.users` (UUID) y tener RLS habilitado (SELECT solo para el auth.uid() == user_id).
> **Examples:** (Proveer un ejemplo de RLS similar al de `reviews`).
> **Sense check:** Verifica que la tabla no sea accesible sin un JWT válido de Supabase.

### C. Resolución de Bugs y Refactorización -> Chain of Thought (Paso a Paso)
*Usar con skills como: `code-refactoring-refactor-clean` o `clean-code`.*

> Analiza este error en el componente de "Postulación a Partido".
> **Piensa paso a paso (Chain of Thought):**
> 1. ¿Cuál es el comportamiento esperado según `Contexto.txt`? (Ej. Un usuario no puede ver el teléfono hasta ser aceptado).
> 2. ¿Cuál es el comportamiento real?
> 3. ¿Qué componentes de Server/Client están involucrados?
> 4. ¿Cuál es la causa raíz?
> 5. Propón la solución en código.

---

## 3. Protocolo de Integración de Skills (Routing)

El Orquestador NUNCA debe intentar resolver todo por sí mismo. Debe actuar como un "Router" hacia las skills específicas:

1. **Antes de empezar una Feature Compleja:** Ejecutar mentalmente los principios de `prompt-engineer` para auto-refinar la petición del usuario. Si la tarea es ambigua, hacer máximo 3 preguntas clarificadoras (Step 2 de la skill).
2. **Diseño de Base de Datos:** Delegar siempre a `database-architect`. Requisito inyectado: *Debe revisar las tablas existentes en `Contexto.txt` (users, matches, match_requests, reviews) antes de proponer alteraciones.*
3. **Desarrollo de UI:** Delegar a `antigravity-design-expert` exigiendo estricto cumplimiento del estilo premium, glassmorphism y mobile-first detallado en `Contexto.txt`.
4. **Documentación:** Delegar a `code-documentation-doc-generate` para mantener un registro claro de los Server Actions y Triggers de la DB.

---

## 4. Reglas Críticas Adicionales (Zero-Chatter & Seguridad)

- **Aislamiento de Dominio (Single Responsibility):** Si invocas a un agente de UI, no le envíes los Triggers de SQL. Pásale SOLO las firmas de TypeScript generadas (`supabase gen types`).
- **Verificación de Edad:** Toda UI que muestre la edad debe usar explícitamente la función utilitaria `calculateAge(birth_date)` definida en `Contexto.txt`. No se debe recalcular la lógica localmente.
- **Filtrado de Seguridad:** Las consultas al Feed Principal SIEMPRE deben llevar los filtros `.eq('status', 'abierto')` y `.gte('scheduled_at', new Date().toISOString())`.
- **Comunicaciones Ágiles:** El botón de WhatsApp SIEMPRE debe aplicar el formato `https://wa.me/{numero_limpio}?text={url_encoded_message}` estipulado en `Contexto.txt`.

> [!WARNING]
> **Prohibido:** No se permite el uso de `any` en TypeScript. No se permite crear chats internos (se usa WhatsApp). No se deben hacer mutaciones directas desde Client Components sin pasar por Server Actions.
