# Putting Velastia online (test site)

Three services, all in **Singapore** so they sit next to each other:

| Service | Runs | Plan to start on |
| --- | --- | --- |
| **Supabase** | the database, and the photos uploaded in the admin | Free |
| **Render** | the API (`backend/`) | Free — sleeps after 15 minutes without visitors |
| **Vercel** | the store (repo root) and the admin (`admin/`), as two projects | Hobby (free) |

Sign in to all three with your GitHub account. Plan: about an hour.

**Secrets never go in chat, email or the code.** Each one is pasted only into the
settings screen of the service that needs it. Keep a copy in a password manager.

## 0. Make one shared secret

The store and the admin pass each visitor's real IP address on to the API, signed
with a secret all three know (`PROXY_SECRET`). Make one in PowerShell:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

Save it in your password manager as **PROXY_SECRET**. It goes into Render and
both Vercel projects: the same value in all three.

## 1. Supabase: database and photo storage

1. **New project.** Name `velastia`, region **Southeast Asia (Singapore)**.
   For the database password, use letters and digits only (other characters
   would need escaping in the address below). Save it in your password manager.
2. **Database address.** Click **Connect** at the top of the project. Choose
   **Session pooler**, not "Direct connection" (Render can't reach that) and not
   "Transaction pooler". Copy the URI, put your database password in place of
   `[YOUR-PASSWORD]`, and add `?sslmode=require` to the end. It looks like:
   `postgresql://postgres.abcdefgh:PASSWORD@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=require`.
   Save it as **DATABASE_URL**.
3. **Photo bucket.** Open **Storage**, click **New bucket**, name it `media` and
   turn **Public bucket** on. Optional: limit it to `image/webp` and 10 MB.
4. **Keys.** Open **Project Settings → API Keys** and copy the **secret key**
   (`sb_secret_…`). If the project only shows legacy keys, use `service_role`.
   Save it as **SUPABASE_SERVICE_ROLE_KEY**. Also note the **Project URL**
   (`https://abcdefgh.supabase.co`) as **SUPABASE_URL**. The URL is not a secret.
5. **Optional, recommended: the certificate.** Open **Database → Settings → SSL
   Configuration** and download the certificate. With it, the API checks it's
   really talking to Supabase; without it, the connection is still encrypted.

## 2. Render: the API

1. **New → Blueprint** and pick the `AD-ATLAS` repository. Render reads
   [`render.yaml`](render.yaml) and asks for four values: `DATABASE_URL`,
   `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` and `PROXY_SECRET`. `JWT_SECRET` is
   generated for you.
2. **Apply.** The first build takes a few minutes and creates all the tables.
3. Open `https://<your-service>.onrender.com/health` (Render shows the address at
   the top). It should say `{"status":"ok",…}`. Save that address, without a
   trailing slash, as **API_URL**.
4. In **Logs**, the startup line should read
   `images: Supabase Storage (bucket "media")`.
5. If you downloaded the certificate: **Environment → Add** `DATABASE_CA_CERT`,
   open the certificate file in Notepad and paste the whole contents. If the logs
   then show a certificate error, delete this variable; the connection stays
   encrypted without it.

## 3. Load the catalog and create your admin account (once, from your PC)

This fills the online database with the products, content and policies, and
creates your admin sign-in. Open a **new** PowerShell window:

```powershell
cd "C:\Users\thouf\Downloads\PIXIE\AD ATLAS\backend"
$env:DATABASE_URL = Read-Host "Supabase Session pooler address"
$env:SEED_ADMIN_EMAIL = Read-Host "Your email for the admin sign-in"
$env:SEED_ADMIN_PASSWORD = Read-Host "Temporary admin password (12+ characters)"
npm run db:seed
```

(`Read-Host` keeps these values out of PowerShell's saved command history.)

The first line printed must name the Supabase host (`…pooler.supabase.com`). The
admin panel makes you replace the temporary password the first time you sign in.

**Then close that PowerShell window.** Until you do, commands in it reach the
online database. Never run `npm run db:reset` or `npm run smoke` there.

## 4. Vercel: the store

1. **Add New → Project** and import `AD-ATLAS`. Leave **Root Directory** as `./`.
   The framework is detected as Next.js.
2. **Environment Variables:**
   - `API_URL` = the Render address
   - `PROXY_SECRET` = the shared secret
   - `SUPABASE_URL` = the Supabase Project URL
3. The free API sleeps, and the store reads the catalog while building. Open the
   API's `/health` page in a browser tab first and wait for the "ok".
4. **Deploy.** Save the site's address (e.g. `https://velastia-store.vercel.app`)
   as **STORE_URL**.

## 5. Vercel: the admin

1. **Add New → Project**, import `AD-ATLAS` again, and set **Root Directory** to
   `admin`.
2. **Environment Variables:**
   - `API_URL` = the Render address
   - `PROXY_SECRET` = the same shared secret
   - `NEXT_PUBLIC_STORE_URL` = STORE_URL
3. **Deploy.** Save the address as **ADMIN_URL**.

## 6. Tell each part where the others are

- **Vercel, store project:** Settings → Environment Variables → add `SITE_URL` =
  STORE_URL. Then Deployments → ⋯ → **Redeploy**.
- **Render:** Environment → add
  - `STORE_URL` = STORE_URL
  - `ADMIN_URL` = ADMIN_URL
  - `CORS_ORIGINS` = `STORE_URL,ADMIN_URL` (both, comma-separated)

  Save; Render redeploys by itself.

## 7. Check it works

- [ ] Admin: sign in with the email and temporary password from step 3, then
      choose your own password.
- [ ] Admin → Settings → Store Details: fill in your social links.
- [ ] Admin → Media Library: upload a photo. It appears, and its link starts with
      your Supabase Project URL.
- [ ] Store: browse, search, add to cart, place a cash-on-delivery order with
      your own email. It shows in Admin → Orders.
- [ ] Admin → Email Log shows the order confirmation.
- [ ] Store: Track Order finds the order, and creating a customer account works.

## What to expect on the free plans

- **The API sleeps** after 15 minutes without visitors, and the next visitor
  waits about a minute. Pages the store has already cached still open
  instantly; search, cart prices and checkout wait for the API. Render's paid
  plan (a few dollars a month) keeps it awake.
- **Supabase pauses** a free project after a week without activity. Restore it
  from the dashboard.
- **Emails aren't delivered** until a Resend key is added (`RESEND_API_KEY` and
  `EMAIL_FROM` on Render). Until then every email is kept in the admin's Email Log.
- **Search engines are kept out** (`robots.txt` disallows everything and pages
  say `noindex`) until the store has `ALLOW_INDEXING=true`.
- **Payments:** cash on delivery only; Razorpay isn't connected yet.
- Every push to `main` redeploys all three automatically.

## If something goes wrong

| Symptom | Likely cause |
| --- | --- |
| Render build fails at `prisma migrate deploy` | `DATABASE_URL` isn't the Session pooler address, the password wasn't filled in, or the Supabase project is paused |
| Render won't start: `PROXY_SECRET … required` | Add it on Render (step 2) |
| Store build fails fetching products | The API was asleep or not deployed yet. Open `/health`, then Redeploy |
| Upload says the image "couldn't be saved to storage" | The bucket isn't named `media` or isn't public, or the key is wrong. Render's logs show Supabase's reason |
| Product photos from the admin don't show on the store | `SUPABASE_URL` missing on the store project. Add it and redeploy |
| Everyone gets "Too many requests" | `PROXY_SECRET` differs between Render and the two Vercel projects |
| Admin sign-in loops back to the login page | `API_URL` on the admin project is wrong or has a trailing slash |

## At launch (later)

- Add your own domain in Vercel, then update `SITE_URL`, `STORE_URL`,
  `ADMIN_URL` and `CORS_ORIGINS`.
- Set `ALLOW_INDEXING=true` on the store project and redeploy.
- Connect Resend with a verified sender domain.
- Move to paid plans: Render stays awake, and Supabase Pro adds daily backups.
