# PDF AI - Intelligent Document Analysis

A modern Next.js application that uses AI to analyze PDF documents, extract insights, and provide chat-based interactions with your documents.

## Features

- **AI-Powered Document Analysis**: Uses NVIDIA NIM models to parse and understand PDF content
- **Smart Deadline Extraction**: Automatically identifies and extracts important dates and deadlines
- **Interactive Chat**: Ask questions about your documents and get instant AI-powered answers
- **Beautiful UI**: Glass morphism design with grid backgrounds and smooth animations
- **Response Caching**: 1-hour cache to avoid repeated API calls on the same document
- **Tiered Pricing**: Free, Pro, and Team plans with different feature sets

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js Server Actions
- **Database**: Supabase (PostgreSQL)
- **AI/ML**: NVIDIA NIM (Nemotron-3-Super-120B, Nemotron-Parse)
- **Icons**: Lucide React
- **Styling**: Tailwind CSS with custom glass morphism effects

## Prerequisites

- Node.js 18+ installed
- A Supabase project (create one at [supabase.com](https://supabase.com))
- NVIDIA API key (get one at [NVIDIA NGC](https://ngc.nvidia.com))

## Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   Copy `.env.example` to `.env.local` and fill in your credentials:
   ```bash
   cp .env.example .env.local
   ```
   
   Then edit `.env.local` with your actual values:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   NVIDIA_API_KEY=your_nvidia_api_key_here
   NVIDIA_NIM_PARSE_ENDPOINT=https://integrate.api.nvidia.com/v1/metrics/nemotron-parse
   NVIDIA_NIM_LLM_ENDPOINT=https://integrate.api.nvidia.com/v1/chat/completions
   NVIDIA_NIM_EMBED_ENDPOINT=https://integrate.api.nvidia.com/v1/embeddings
   ```

3. **Set up Supabase database**:
   - Run the migration file in your Supabase SQL editor:
     ```sql
     -- Copy contents from supabase/migrations/001_initial_schema.sql
     ```
   - Create a storage bucket named `documents` in Supabase

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)

### Quick Deploy to Vercel

1. Push your code to GitHub
2. Import your repository in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy

The application is production-ready and includes:
- ✅ Error handling and loading states
- ✅ Responsive design for all devices
- ✅ Server Actions for secure API calls
- ✅ Response caching (1-hour TTL)
- ✅ Glass morphism UI with dark theme
- ✅ Complete database schema with migrations

## Project Structure

```
pdf-ai/
├── app/
│   ├── actions/           # Server Actions for database operations
│   │   ├── documents.ts   # Document CRUD operations
│   │   ├── messages.ts    # Message/chat operations
│   │   ├── processing.ts  # AI processing actions
│   │   └── users.ts       # User operations
│   ├── dashboard/         # Dashboard page with document upload
│   ├── document/[id]/      # Individual document chat page
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page with pricing
├── lib/
│   ├── nvidia/            # NVIDIA NIM API integration
│   │   └── nim.ts         # AI model calls with caching
│   ├── pricing.ts         # Pricing tier configuration
│   ├── supabase/          # Supabase client setup
│   │   ├── client.ts      # Browser client
│   │   └── server.ts      # Server client
│   └── types.ts           # TypeScript type definitions
├── public/
│   └── grid.svg           # Grid pattern background
├── supabase/
│   └── migrations/        # Database migrations
└── package.json
```

## Pricing Tiers

### Free (€0/month)
- 1 active project
- Up to 10 total pages
- No historical chat
- Standard processing

### Pro (€19/month)
- Unlimited projects
- Up to 500 total pages
- Unlimited historical chat
- Calendar export (ICS)
- Priority processing

### Team (€39/month)
- Everything in Pro
- Share projects with 3 users
- Email support
- Advanced document analysis

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous key |
| `NVIDIA_API_KEY` | Your NVIDIA NGC API key |
| `NVIDIA_NIM_PARSE_ENDPOINT` | NVIDIA NIM parse endpoint |
| `NVIDIA_NIM_LLM_ENDPOINT` | NVIDIA NIM LLM endpoint |
| `NVIDIA_NIM_EMBED_ENDPOINT` | NVIDIA NIM embedding endpoint (optional) |

## Database Schema

### Users
- `id`: UUID (primary key)
- `email`: VARCHAR(255)
- `created_at`: TIMESTAMP
- `tier`: VARCHAR(50) - 'free', 'pro', or 'team'
- `total_pages_used`: INTEGER
- `active_projects`: INTEGER

### Documents
- `id`: UUID (primary key)
- `user_id`: UUID (foreign key)
- `name`: VARCHAR(255)
- `file_url`: TEXT
- `summary`: TEXT
- `deadlines_json`: JSONB
- `total_pages`: INTEGER
- `parsed_text`: TEXT
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

### Messages
- `id`: UUID (primary key)
- `document_id`: UUID (foreign key)
- `role`: VARCHAR(50) - 'user' or 'assistant'
- `content`: TEXT
- `created_at`: TIMESTAMP

## API Integration

The application uses NVIDIA NIM for AI processing:

1. **Document Parsing**: Uses Nemotron-Parse to extract text from PDFs
2. **Chat Completions**: Uses Nemotron-3-Super-120B for intelligent responses
3. **Embeddings**: Uses NeMo Retriever for semantic search (optional)

All AI responses are cached for 1 hour to avoid repeated API calls on the same document.

## Development

### Build for production
```bash
npm run build
```

### Start production server
```bash
npm start
```

### Lint code
```bash
npm run lint
```

## License

MIT

## Support

For support, please email support@pdf-ai.com or open an issue on GitHub.
