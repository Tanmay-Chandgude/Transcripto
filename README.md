# Transcripto

A modern web application for transcribing and translating audio/video content using AI.

## Features

- **Transcription**
  - Support for audio and video files (mp3, wav, m4a, ogg, mp4, webm, mov, avi)
  - File size limits: 10MB (free) / 25MB (pro)
  - Real-time transcription using OpenAI Whisper

- **Translation**
  - Support for 22 Indian languages
  - Major global languages included
  - Powered by Google's Gemini AI
  - Document translation (.txt, .doc, .docx, .pdf)
  - Direct text input support

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- OpenAI Whisper API
- Google Gemini AI
- Supabase
- Kinde Auth

## Getting Started

1. Clone the repository
2. Install dependencies:
```

3. Set up environment variables in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
KINDE_CLIENT_ID=your_kinde_client_id
KINDE_CLIENT_SECRET=your_kinde_secret
KINDE_ISSUER_URL=your_kinde_issuer
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_key
OPENAI_API_KEY=your_openai_key
```

4. Run the development server:
```bash
npm run dev
```

## License

MIT