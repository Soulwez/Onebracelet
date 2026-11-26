# AURÈLE — Spectrum Bracelet (single-product COD store, Canada)

## Deploy on Vercel
1. Unzip, push the folder to a GitHub repo (or run `npx vercel` inside it).
2. In Vercel: Add New Project → import the repo. Framework preset: "Other". No build command, no output directory.
3. Project Settings → Environment Variables (then redeploy):
   - RESEND_API_KEY   (from resend.com; verify your sending domain)
   - ORDER_TO_EMAIL   (where orders arrive)
   - ORDER_FROM_EMAIL (e.g. "AURÈLE <orders@your-domain.ca>")
4. Edit CONFIG at the top of the <script> in index.html: price, email, phone.
5. Fill every [bracketed placeholder] (delivery time, returns policy, verified materials) in the T dictionary, EN and FR.
6. Place a test order. Until step 3 is done the form shows an error and NO order is received.

Orders are emailed, not stored in a database. For a database, extend api/order.js (e.g. Supabase).
Spam protection: honeypot + minimum fill time + server-side validation. Add Cloudflare Turnstile if spam appears.
