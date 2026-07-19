# PDFChatter setup — beginner steps

## 1. Rotate the leaked Groq key
The old key was exposed in chat. Revoke it in the Groq Console and create a replacement.

## 2. Add local environment values
Make a copy of `.env.example` named `.env.local` and fill in:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
GROQ_API_KEY=your_new_private_key
```

The Groq key must remain server-side.

## 3. Supabase settings
In Supabase, open Authentication → Sign In / Providers and make sure Email is enabled.
For local testing, configure the site URL as:

`http://localhost:3000`

## 4. Planned wiring
The UI is ready for the next code pass: Supabase auth, route protection, PDF extraction, and a server-only Groq endpoint. The browser must never call Groq directly.
