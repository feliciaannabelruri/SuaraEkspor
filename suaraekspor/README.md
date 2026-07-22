# SuaraEkspor API

Backend Express untuk SuaraEkspor — platform AI yang membantu UMKM Indonesia ekspor
tanpa perlu bisa bahasa asing (STT, vision, listing multibahasa, pricing, dan
AI penerjemah percakapan buyer/seller termasuk lewat WhatsApp).

Repo ini adalah monorepo npm workspaces (`apps/*`, `packages/*`). File `Dockerfile`
di root ini membangun & menjalankan `apps/api`. Frontend (Next.js, `apps/web`)
di-deploy terpisah (mis. Vercel) dan mengarah ke URL backend ini lewat
`NEXT_PUBLIC_API_URL`.

## Deploy (Render, Docker environment)

1. New Web Service → connect ke repo GitHub ini
2. **Root Directory**: `suaraekspor`
3. **Environment**: Docker (pakai `Dockerfile` di root directory tsb)
4. Isi environment variables di bawah ini di dashboard Render
5. Setelah deploy, salin URL Render-nya (`https://<nama-service>.onrender.com`) ke
   env var `API_PUBLIC_URL` di service ini sendiri, dan ke `NEXT_PUBLIC_API_URL`
   di deployment frontend (`<url>/api/v1`)

## Environment variables

- `DATABASE_URL`, `DIRECT_URL` — koneksi Supabase Postgres
- `JWT_SECRET`
- `GROQ_API_KEY`
- `IMAGEKIT_PUBLIC_KEY`, `IMAGEKIT_PRIVATE_KEY`, `IMAGEKIT_URL_ENDPOINT`
- `FONNTE_API_KEY`
- `API_PUBLIC_URL` — URL publik service ini sendiri setelah deploy
- `WHATSAPP_PLATFORM_NUMBER`
- `WHATSAPP_WEBHOOK_SECRET`
- `NODE_ENV=production`
