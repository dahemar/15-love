# 15 love — Contexto técnico completo para IA

**Última actualización:** 18 de mayo de 2026

---

## 1. Visión general del proyecto

**15 love** es un sitio web moderno para un proyecto de tenis. La arquitectura separa completamente:
- **Frontend**: Sitio Astro JAMstack (arquitectura estática generada en servidor)
- **CMS**: Strapi headless (contenido gestionado por admin panel)
- **Base de datos**: PostgreSQL en Supabase (remoto)

El modelo es escalable para múltiples clientes, con aislamiento total de credenciales e infraestructura.

---

## 2. Estructura de carpetas

```
/Users/david/Desktop/web/15 love/
├── site/                          # Frontend Astro (THE MAIN CODEBASE)
│   ├── src/
│   │   ├── components/            # Componentes Astro
│   │   │   ├── HomeColumns.astro
│   │   │   ├── MockupPage.astro   # Landing page con hotspot (optimizado)
│   │   │   ├── NewsColumns.astro
│   │   │   ├── PostFeed.astro
│   │   │   ├── SiteShell.astro
│   │   │   └── TennisButton.astro
│   │   ├── data/
│   │   │   ├── mockups.ts         # Array de imágenes mockup (rutas optimizadas)
│   │   │   └── siteContent.ts     # Fallback contenido local
│   │   ├── layouts/
│   │   │   └── BaseLayout.astro   # Layout master (preload WOFF2)
│   │   ├── lib/
│   │   │   ├── localAssetThumbs.ts
│   │   │   ├── postRoutes.ts
│   │   │   ├── postViews.ts
│   │   │   └── siteContent.ts     # **CRITICAL**: manejo de Strapi + cache + fallback
│   │   ├── pages/                 # Rutas Astro
│   │   │   ├── index.astro        # Landing
│   │   │   ├── home.astro         # Home estático
│   │   │   ├── about.astro
│   │   │   ├── news.astro
│   │   │   ├── releases.astro
│   │   │   ├── events.astro
│   │   │   ├── archive.astro
│   │   │   ├── m/                 # Rutas móviles (SPA-like)
│   │   │   └── [id].astro         # Rutas dinámicas (news/:id, releases/:id, events/:id)
│   │   └── styles/
│   │       ├── global.css         # Estilos globales + preload WOFF2
│   │       └── archive.css
│   ├── public/
│   │   ├── fonts/                 # WOFF2 + OTF fallback
│   │   │   ├── Inter Regular-5af3.woff2        (109 KB, optimizado)
│   │   │   └── TT2020 Style B Regular-4409.woff2 (1844 KB, optimizado)
│   │   ├── mockups/               # Imágenes mockup (PNG/JPG optimizados)
│   │   ├── assets/
│   │   │   ├── 15love_logo_1.svg  # Logo actualizado
│   │   │   └── archive-thumbs/
│   ├── .env                       # Variables de entorno
│   ├── astro.config.mjs
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
├── material/                      # Archivos de diseño (Adobe InDesign)
│   └── 15love_web_package/
├── tools/                         # Scripts utilitarios Python
│   ├── dump_pdf_page.py
│   └── extract_pdf.py
├── ARCHITECTURE_STATUS_GUIDE.md   # Plan de arquitectura multi-cliente
├── CURRENT_SITE_STATUS_HANDOFF.md # Estado actual y performance
└── AI_CONTEXT.md                  # ESTE ARCHIVO
```

---

## 3. Repositorios GitHub

| Repo | Propósito | Visibilidad | URL |
|------|-----------|------------|-----|
| `15-love` | Frontend Astro | Privado | https://github.com/dahemar/15-love |
| `strapi-template` | Plantilla CMS reutilizable | Privado | https://github.com/dahemar/strapi-template |
| `strapi-client-15-love` | Instancia CMS para 15-love | Privado | https://github.com/dahemar/strapi-client-15-love |

---

## 4. Estado actual (production)

### Frontend ✅
- **Build**: 28 páginas construidas exitosamente
- **Deploy**: En Vercel (automático desde GitHub)
- **Status**: ACTIVO

### CMS Strapi ✅
- **Deploy**: En Render en `https://strapi-client-15-love.onrender.com`
- **DB**: PostgreSQL en Supabase
- **Status**: ACTIVO con datos seeded

### Características implementadas
✅ Layout principal  
✅ Integración Strapi (rest)  
✅ Logo SVG  
✅ Caché en memoria (5min dev, 1min prod)  
✅ Fonts WOFF2 optimizados  
✅ Mockups en JPG comprimidos  
✅ Prefetch inteligente landing→home  
✅ Fallback contenido local si Strapi falla  

---

## 5. Cómo funciona localmente

### Iniciar el frontend

```bash
cd "/Users/david/Desktop/web/15 love/site"
npm install  # solo primera vez
npm run dev -- --host 127.0.0.1 --port 4321
```

**URL**: http://127.0.0.1:4321  
**Auto-reload**: ✅ Sí

### Conectividad Strapi

El `.env` apunta a Strapi remoto en Render:
```
CMS_MODE=strapi
STRAPI_URL=https://strapi-client-15-love.onrender.com
STRAPI_TOKEN=0f6e38b19260c27...  # Token read-only
```

Si la conexión falla, el frontend cae automáticamente al contenido local en `src/data/siteContent.ts`.

### Troubleshooting local

**Puerto 4321 ocupado:**
```bash
lsof -nP -iTCP:4321-4324 -sTCP:LISTEN
kill <pid>
```

**IPv6 issues (antiguo problema):**
```bash
# Ya solucionado, pero si vuelve a ocurrir:
npm run dev -- --host 127.0.0.1 --port 4321
```

---

## 6. Arquitectura de datos

### Flujo de contenido

```
Strapi Admin Panel
       ↓
   [POST API]
       ↓
   site/src/lib/siteContent.ts (fetch + caché)
       ↓
   Astro components (rendering)
       ↓
   HTML estático en build | SSR en dev
```

### Archivo clave: `site/src/lib/siteContent.ts`

Esta es la **interfaz crítica** entre Strapi y el frontend:

```typescript
// Responsabilidades:
1. Fetch de posts desde Strapi API
2. Caché en memoria (TTL configurable)
3. Fallback a contenido local si error
4. Mapeo de newsBlocks + fallback eventBlocks (compatibilidad Render)
5. Populate dinámico de relaciones
```

**TTL actual:**
- Desarrollo: 5 min (300000 ms)
- Producción: 1 min (60000 ms)

---

## 7. Conocidos problemas y workarounds

### 1. Schema mismatch en Render Strapi
**Problema:** Strapi rechaza `newsBlocks` con error de validación, solo acepta `eventBlocks` legacy.

**Workaround:** El frontend en `siteContent.ts` mapea automáticamente `eventBlocks` → `newsBlocks` cuando no existen.

**Fix pendiente:** Actualizar schema en Render (gestión en otra tarea).

### 2. Populate de nested media
**Problema:** Strapi v5 no retorna media nested en dynamic zones con `populate=*`.

**Workaround:** Query personalizado:
```
populate[newsBlocks][populate]=*&populate[eventBlocks][populate]=*
```

### 3. Performance perceived slowness
**Reporte:** Landing → Home se siente lenta.

**Análisis:** 
- Astro server timing: ✅ Rápido (caché activo)
- Browser asset loading: ⚠️ Lento (fonts + mockups son grandes)

**Ya optimizado:**
- Fonts WOFF2: 255KB → 109KB (Inter), 3528KB → 1844KB (TT2020)
- Mockups JPG: -80% tamaño vs PNG
- Prefetch inteligente en MockupPage.astro

**Próximos pasos:**
- Subset TT2020 a solo glyphs usados
- Profiling en Network tab del browser

---

## 8. Performance optimizations ya hechas

### Navegación
- ❌ Removido: Astro ClientRouter (rompía scale layout)
- ✅ Agregado: Caché de Strapi en memoria
- ✅ Agregado: Prefetch inteligente (idle + hover)

### Fonts
| Font | Antes | Después | Formato |
|------|-------|---------|---------|
| Inter Regular | 255 KB | 109 KB | WOFF2 |
| TT2020 Style B | 3528 KB | 1844 KB | WOFF2 |

### Imágenes mockup
| Mockup | Antes | Después | Formato |
|--------|-------|---------|---------|
| page-03 | 3695 KB PNG | 736 KB JPG | JPG |
| page-08 | 3101 KB PNG | 1324 KB JPG | JPG |
| page-11 | 2890 KB | 2890 KB PNG | PNG (JPG más grande) |

---

## 9. Variables de entorno

### `.env` del sitio (site/.env)

```env
CMS_MODE=strapi
STRAPI_URL=https://strapi-client-15-love.onrender.com
STRAPI_TOKEN=0f6e38b19260c27cb31fb204ff68c9b3b71e211651f9d3a19058e74223e398b55394143f2d26b47c54b68dd071ee79eba081db5b169dbfc3ef186a8b1b29bad7aa76159f3348231051de33478cf31e67dee129ad54996dd2de0457b6ff6fcfed46094dbdceae9ee1740eb55798ae9df7393191ecaa68927951b27bef82b1a39d
```

### Strapi en Render (configuración)

```
DATABASE_CLIENT=postgres
DATABASE_HOST=<supabase-host>
DATABASE_PORT=5432
DATABASE_NAME=strapi
DATABASE_USERNAME=<supabase-user>
DATABASE_PASSWORD=<supabase-password>
DATABASE_SSL=true

STRAPI_URL=https://strapi-client-15-love.onrender.com
CORS_ORIGINS=https://15-love.vercel.app
VERCEL_DEPLOY_HOOK_URL=<deploy-hook>
R2_ENABLED=false  # Se activa después
```

---

## 10. Comandos útiles

### Frontend

```bash
# Desarrollo
npm run dev -- --host 127.0.0.1 --port 4321

# Build para producción
npm run build

# Preview del build
npm run preview
```

### Strapi (en otro terminal, repo strapi-client-15-love)

```bash
# Desarrollo local (requiere PostgreSQL local)
npm run dev

# Seed de contenido
STRAPI_URL="https://strapi-client-15-love.onrender.com" \
STRAPI_TOKEN="<token>" \
npm run seed:site-content

# Test webhook de Vercel
npm run seed:posts  # También prueba el hook
```

---

## 11. Flujo de deployment

### Cambios en contenido (Strapi)

1. Editor publica post en Strapi Admin
2. Strapi lifecycle hook se dispara
3. Webhook POST a Vercel Deploy Hook
4. Frontend Astro rebuilds automáticamente
5. 30-60s: cambio vivo en producción

### Cambios en código (Frontend)

1. Push a rama en GitHub (15-love repo)
2. Vercel detecta push
3. Build automático
4. Deploy si build exitoso
5. ~2-5 min: cambio vivo en producción

---

## 11.a Actualizar Strapi y desplegar en Render

### Estado actual de la instancia Strapi
- Repo local: `/Users/david/Documents/GitHub/strapi-client-15-love`
- Branch principal: `main`
- Remoto GitHub: `origin https://github.com/dahemar/strapi-client-15-love.git`
- Build en Render definido por `render.yaml` con `autoDeploy: true`
- Current `package.json` usa `@strapi/strapi@5.37.1`

### Pasos para actualizar Strapi
1. Abrir `package.json` en `strapi-client-15-love`.
2. Actualizar las dependencias de Strapi a la versión deseada:
   - `@strapi/strapi`
   - `@strapi/plugin-cloud`
   - `@strapi/plugin-users-permissions`
   - `@strapi/provider-upload-aws-s3`
3. Ejecutar `npm install`.
4. Ejecutar `npm run build` para verificar que la aplicación compila.
5. Ejecutar `npm run dev` si necesitas comprobar la instancia local antes del deploy.
6. Commit y push al branch conectado de GitHub:
   - `git add package.json package-lock.json`
   - `git commit -m "Upgrade Strapi to X.Y.Z"`
   - `git push origin main`

### Cómo desplegar la versión actual en Render
- Render recibe el código desde el repo `strapi-client-15-love`.
- Con `autoDeploy: true`, un push a `origin/main` debe disparar el deploy automático.
- Si necesitas forzar un deploy, usa el dashboard de Render y lanza manualmente el servicio.
- `render.yaml` ya define:
  - `buildCommand: npm ci && npm run build`
  - `startCommand: npm run start`

### Nota importante sobre el deploy actual
- El despliegue actual en Render es la versión que existe en `origin/main`.
- En este entorno no se puede disparar directamente el deploy de Render sin credenciales de servicio.
- Si ya tienes el repo conectado y actualizas `main`, el deploy debería ocurrir automáticamente.

---

## 12. Estructura de rutas

| Ruta | Tipo | Contenido | Fuente |
|------|------|----------|--------|
| `/` | Estática | Landing con hotspot | Local |
| `/home` | Estática | Home principal | Local |
| `/about` | Estática | Información | Local |
| `/news` | Dinámica | Grid de posts | Strapi o fallback |
| `/news/:id` | Dinámica | Post individual | Strapi o fallback |
| `/releases` | Dinámica | Grid de releases | Strapi o fallback |
| `/releases/:id` | Dinámica | Release individual | Strapi o fallback |
| `/events` | Dinámica | Grid de eventos | Strapi o fallback |
| `/events/:id` | Dinámica | Evento individual | Strapi o fallback |
| `/archive` | Estática | Archivo completo | Local |
| `/m/*` | Móvil | Versiones móviles | Astro |

---

## 13. Cómo entiende otro IA esta base de código

### Puntos de entrada para modificaciones

1. **Contenido del sitio**
   - Ir a: `site/src/lib/siteContent.ts`
   - Entender: fetch y mapeo de datos
   - Cambiar: lógica de caché, populate de API

2. **Layout visual**
   - Ir a: `site/src/layouts/BaseLayout.astro`
   - Entender: estructura HTML master
   - Cambiar: header, footer, preloads

3. **Componentes reutilizables**
   - Ir a: `site/src/components/`
   - Cambiar: MockupPage (landing), NewsColumns, PostFeed, etc.

4. **Rutas dinámicas**
   - Ir a: `site/src/pages/news/[id].astro`
   - Entender: cómo Astro genera URL a partir de post.slug
   - Cambiar: layout de página individual

5. **Estilos globales**
   - Ir a: `site/src/styles/global.css`
   - Cambiar: fuentes, variables, reset

### Datos

- **Fuente principal**: Strapi en Render (API REST)
- **Fallback**: `site/src/data/siteContent.ts` (JSON local)
- **Imágenes mockup**: `site/public/mockups/*.jpg` (comprimidas)

### Build y deploy

- **Framework**: Astro 5.x (SSG + SSR en dev)
- **Hosting frontend**: Vercel (CI/CD automático)
- **Hosting CMS**: Render (auto-restart)
- **Hosting DB**: Supabase (PostgreSQL managed)

---

## 14. Próximos pasos recomendados

1. **Performance**
   - Profiling de Network en browser DevTools
   - Subset de fuentes TT2020 (solo glyphs usados)
   - Validar impacto de caché TTL

2. **CMS**
   - Actualizar schema Strapi en Render para aceptar `newsBlocks`
   - Remover fallback `eventBlocks` cuando sea seguro
   - Activar media S3 (R2) cuando se requiera

3. **Mantenibilidad**
   - Documentar pasos de onboarding para nuevo cliente
   - Automatizar creación de repo desde template
   - Crear dashboard de monitoreo para multiples clientes

---

## 15. Contactos y referencias

**Desarrollador principal**: David Herrera  
**Fecha actualización**: 18 de mayo de 2026

**Documentación relacionada:**
- `CURRENT_SITE_STATUS_HANDOFF.md` — Estado anterior (marzo 2026)
- `ARCHITECTURE_STATUS_GUIDE.md` — Plan multi-cliente

**Repositorios:**
- Frontend: https://github.com/dahemar/15-love
- Strapi template: https://github.com/dahemar/strapi-template
- Strapi client: https://github.com/dahemar/strapi-client-15-love

---

## 16. Resumen ejecutivo para IA

**Si solo tienes 30 segundos:**

15 love es un sitio Astro que consume contenido de un CMS Strapi en Render. El frontend está en `site/`, el CMS en `strapi-client-15-love` (otro repo). El archivo crítico es `site/src/lib/siteContent.ts` que maneja fetch, caché, fallback y mapeo de datos. Localmente: `npm run dev` en site/, se conecta a Strapi remoto. Hay un workaround para schema mismatch (eventBlocks → newsBlocks). Performance ya optimizada pero perceived slowness sigue siendo issue (asset loading, no Astro).

