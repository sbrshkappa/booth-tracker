# Booth Tracker

A full-stack application for tracking booths with a Supabase backend and modern frontend.

## Project Structure

```
booth-tracker/
├── api/                    # Supabase backend
│   ├── supabase/          # Supabase configuration and functions
│   │   ├── config.toml    # Supabase configuration
│   │   ├── functions/     # Edge functions
│   │   ├── migrations/    # Database migrations
│   │   └── seed.sql      # Seed data
│   └── package.json      # API dependencies
├── frontend/              # Frontend application
│   ├── package.json      # Frontend dependencies
│   └── README.md         # Frontend setup guide
├── package.json          # Root package.json (monorepo)
└── README.md            # This file
```

## Prerequisites

Before you begin, make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v18 or higher)
- [Supabase CLI](https://supabase.com/docs/guides/cli)

## Quick Start

1. **Install Supabase CLI** (if not already installed):
   ```bash
   brew install supabase/tap/supabase
   ```

2. **Install all dependencies**:
   ```bash
   npm run install:all
   ```

3. **Setup the project**:
   ```bash
   npm run setup
   ```

4. **Start development servers**:
   ```bash
   npm run dev
   ```

This will start:
- Supabase API at `http://localhost:54321`
- Supabase Studio at `http://localhost:54323`
- Database at `postgresql://postgres:postgres@localhost:54322/postgres`
- Frontend (after setup) at `http://localhost:3000` or `http://localhost:5173`

## Development

### API Development

Navigate to the API directory:
```bash
cd api
```

#### Edge Functions

- **Create a new function**:
  ```bash
  npm run new <function-name>
  ```

- **Build functions**:
  ```bash
  npm run build
  ```

- **Deploy functions**:
  ```bash
  npm run deploy
  ```

- **Test functions locally**:
  ```bash
  npm run serve
  ```

#### Database

- **Reset database**:
  ```bash
  npm run reset
  ```

- **Create migration**:
  ```bash
  npm run migration:new <migration-name>
  ```

- **Apply migrations**:
  ```bash
  npm run migration:up
  ```

### Frontend Development

Navigate to the frontend directory:
```bash
cd frontend
```

See `frontend/README.md` for setup instructions for your chosen framework.

## Available Scripts

### Root Level
- `npm run dev` - Start both API and frontend in development mode
- `npm run build` - Build both API and frontend
- `npm run deploy` - Deploy both API and frontend
- `npm run install:all` - Install dependencies for all workspaces
- `npm run setup` - Initial setup for the project

### API Only
- `npm run dev:api` - Start Supabase local development
- `npm run build:api` - Build edge functions
- `npm run deploy:api` - Deploy to Supabase

### Frontend Only
- `npm run dev:frontend` - Start frontend development server
- `npm run build:frontend` - Build frontend for production
- `npm run deploy:frontend` - Deploy frontend

## Environment Variables

### API Environment
The following environment variables are automatically set for local development:

- `SUPABASE_URL`: `http://localhost:54321`
- `SUPABASE_ANON_KEY`: Development anon key
- `SUPABASE_SERVICE_ROLE_KEY`: Development service role key

### Frontend Environment
Create a `.env.local` file in the frontend directory:

```env
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Example Edge Function

The API includes a sample `hello` function that demonstrates:

- CORS handling
- Supabase client initialization
- User authentication
- JSON response formatting

### Testing the Hello Function

1. Start the local environment:
   ```bash
   npm run dev:api
   ```

2. Test the function:
   ```bash
   curl http://localhost:54321/functions/v1/hello
   ```

## Deployment

### Linking to a Remote Project

1. Create a project on [Supabase Dashboard](https://supabase.com/dashboard)
2. Link your local project:
   ```bash
   cd api
   supabase link --project-ref <your-project-ref>
   ```

### Deploying to Production

```bash
npm run deploy:api
npm run deploy:frontend
```

## Useful Commands

### Supabase CLI
- `supabase status` - Check the status of local services
- `supabase logs` - View function logs
- `supabase functions list` - List all functions
- `supabase functions delete <function-name>` - Delete a function

## Troubleshooting

### Common Issues

1. **Port conflicts**: If ports are already in use, modify the ports in `api/supabase/config.toml`
2. **Function not found**: Make sure to build functions before testing
3. **Database connection issues**: Ensure Docker is running for local development
4. **Frontend not connecting to API**: Check environment variables and CORS settings

### Getting Help

- [Supabase Documentation](https://supabase.com/docs)
- [Edge Functions Guide](https://supabase.com/docs/guides/functions)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli) 