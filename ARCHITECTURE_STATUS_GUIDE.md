# 15 love — Arquitectura, estado actual y plan operativo

## 1) Arquitectura objetivo (multi-cliente, coste cero)

- Frontend JAMstack (Astro) en Vercel, deploy automático desde GitHub.
- CMS Strapi self-hosted por cliente (aislamiento total).
- Base de datos PostgreSQL en Supabase (una por cliente).
- Media en Cloudflare R2 (una por cliente, **pendiente para 15-love**).
- Rebuild automático del frontend vía webhook de Strapi hacia Vercel Deploy Hook.

## 2) Repositorios creados y para qué sirven

- Frontend: https://github.com/dahemar/15-love
- Plantilla CMS: https://github.com/dahemar/strapi-template
- Cliente CMS (15-love): https://github.com/dahemar/strapi-client-15-love

Motivo de 2 repos CMS:
- `strapi-template`: base reusable para nuevos clientes.
- `strapi-client-15-love`: instancia real del cliente 15-love (aislada).

Motivo de repos privados:
- Seguridad de credenciales/infraestructura.
- Evitar acceso del cliente a GitHub/Vercel/Render.
- Mantener control técnico centralizado (modelo agencia/operador).

## 3) Estado actual (hoy)

### Frontend
- Layout principal implementado.
- News y Releases conectados a capa de contenido local/Strapi con fallback.
- Logo superior actualizado para usar SVG (`/public/assets/15love_logo_1.svg`).

### CMS Strapi
- Template de Strapi listo.
- Content type `site-content` creado.
- CORS configurable por env.
- Hook de rebuild a Vercel en lifecycle.
- Scripts de seed y test webhook disponibles.
- **R2 marcado como opcional** (se puede operar sin R2 por ahora).

## 4) Punto exacto donde estamos

Estamos listos para desplegar `strapi-client-15-love` en Render con Supabase.
R2 se deja para la fase siguiente.

## 5) Plan inmediato (fase sin R2)

1. Crear/usar proyecto Supabase y obtener credenciales Postgres.
2. Crear servicio Render desde repo `strapi-client-15-love`.
3. Cargar variables de entorno mínimas (ver sección 6).
4. Deploy Strapi.
5. Crear API token en Strapi.
6. Ejecutar seed de `site-content`.
7. Configurar Deploy Hook de Vercel en Strapi.
8. Validar publicación -> rebuild automático en frontend.

## 6) Variables de entorno mínimas en Render (sin R2)

- `NODE_ENV=production`
- `HOST=0.0.0.0`
- `PORT=1337`
- `PUBLIC_URL=https://<tu-servicio>.onrender.com`
- `APP_KEYS=<generar>`
- `API_TOKEN_SALT=<generar>`
- `ADMIN_JWT_SECRET=<generar>`
- `TRANSFER_TOKEN_SALT=<generar>`
- `JWT_SECRET=<generar>`
- `ENCRYPTION_KEY=<generar>`
- `DATABASE_CLIENT=postgres`
- `DATABASE_HOST=<supabase-host>`
- `DATABASE_PORT=5432`
- `DATABASE_NAME=postgres`
- `DATABASE_USERNAME=<supabase-user>`
- `DATABASE_PASSWORD=<supabase-password>`
- `DATABASE_SSL=true`
- `DATABASE_SSL_REJECT_UNAUTHORIZED=false`
- `CORS_ORIGINS=https://<tu-frontend>.vercel.app`
- `VERCEL_DEPLOY_HOOK_URL=<deploy-hook-de-vercel>`
- `VERCEL_REBUILD_SECRET=<opcional>`
- `R2_ENABLED=false`

## 7) Cuando activemos R2 más adelante

1. Crear bucket + keys en Cloudflare.
2. En Render cambiar:
   - `R2_ENABLED=true`
   - `R2_ACCESS_KEY_ID`
   - `R2_SECRET_ACCESS_KEY`
   - `R2_ENDPOINT`
   - `R2_REGION=auto`
   - `R2_BUCKET`
   - `R2_PUBLIC_URL`
   - `R2_ROOT_PATH` (opcional)
3. Redeploy de Strapi.

## 8) Comandos útiles

### Seed de contenido
```bash
STRAPI_URL="https://<strapi-url>" STRAPI_TOKEN="<token>" node ./scripts/seed-site-content.mjs
```

### Probar hook de Vercel
```bash
VERCEL_DEPLOY_HOOK_URL="https://api.vercel.com/v1/integrations/deploy/..." node ./scripts/test-vercel-hook.mjs
```

### Clonar nuevo cliente desde template
```bash
GITHUB_OWNER=dahemar bash ./scripts/new-client-repo.sh <client-slug>
```

## 9) Checklist de control

- [ ] Strapi (cliente) online
- [ ] DB Supabase conectada
- [ ] Login admin Strapi correcto
- [ ] `site-content` seeded
- [ ] Frontend en Vercel lee contenido
- [ ] Publish en Strapi dispara rebuild en Vercel
- [ ] Cliente solo tiene acceso a Strapi Admin

---

Última actualización: 2026-03-01
