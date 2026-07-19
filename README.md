# PDFChatter

A polished frontend prototype for a PDF question-answering workspace.

## Included now
- Responsive landing page
- Editorial SaaS visual language
- Dark/light mode with persistence
- Animated auth modal for sign-in/sign-up flow
- PDF workspace shell
- Reduced-motion accessibility support

## Research decisions
The visual direction uses a restrained dark-first product feel, progressive disclosure, one lime accent, high-contrast surfaces, calm typography, and subtle motion rather than decorative animation. It follows current dashboard guidance emphasizing time-to-insight, readable contrast, semantic reading order, and `prefers-reduced-motion` support. Supabase password auth uses the documented `signUp()` and `signInWithPassword()` flows. Groq calls should remain server-side using `GROQ_API_KEY` and the official chat completions API.

## Next implementation step
This is the visual foundation. To make authentication and PDF chat live, run it inside a Next.js app and add:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
GROQ_API_KEY=
```

Never commit `.env.local` or expose `GROQ_API_KEY` in browser code.
