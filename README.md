# dJai - AI-Powered Playlist Generator

dJai is a modern web application that generates personalized Spotify playlists using AI. Give it a few songs you like, and it'll create a curated playlist of similar tracks. You can even add a custom prompt to guide the vibe of your playlist.

## Features

- 🎵 Generate playlists based on your favorite songs
- 🤖 AI-powered song recommendations
- 💭 Custom prompts to guide playlist generation
- 🔍 Smart song search with Spotify integration
- 💾 Direct save to your Spotify account

## Prerequisites

- Node.js 18+ installed
- Spotify Developer account and API credentials
- OpenAI API key

## Environment Setup

Create a `.env.local` file in the root directory with the following variables:

```bash
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SPOTIFY_REDIRECT_URI=http://localhost:3000/api/auth/callback
OPENAI_API_KEY=your_openai_api_key
```

## Getting Started

1. Install dependencies:
```bash
npm install
# or
yarn install
```

2. Run the development server:
```bash
npm run dev
# or
yarn dev
```

3. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## How It Works

1. Select a few songs you'd like to base your playlist on
2. Optionally add a prompt to guide the playlist's vibe
3. Click generate and let AI create your perfect playlist
4. Save directly to your Spotify account

## Tech Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- OpenAI API
- Spotify Web API

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project however you'd like.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Deployment Guide

### 1. Spotify Developer Setup

1. Go to the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Click "Create App"
3. Fill in the application details:
   - App name: `dJai` (or your preferred name)
   - App description: "AI-powered playlist generator"
   - Website: Your Vercel deployment URL (can be updated later)
   - Redirect URI: Add two URIs:
     - `https://your-vercel-domain.vercel.app/api/auth/callback`
     - `http://localhost:3000/api/auth/callback` (for local development)
4. Save your Client ID and Client Secret

### 2. Vercel Deployment

1. Install Vercel CLI (optional):
```bash
npm install -g vercel
```

2. Push your code to GitHub

3. Connect to Vercel:
   - Go to [Vercel Dashboard](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Select the framework preset as "Next.js"

4. Configure Environment Variables:
   Add the following environment variables in your Vercel project settings:
   ```
   SPOTIFY_CLIENT_ID=your_spotify_client_id
   SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
   SPOTIFY_REDIRECT_URI=https://your-vercel-domain.vercel.app/api/auth/callback
   OPENAI_API_KEY=your_openai_api_key
   ```

5. Deploy:
   - Click "Deploy"
   - Wait for the build to complete
   - Your app will be live at `https://your-project.vercel.app`

6. Update Spotify Redirect URI:
   - Go back to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
   - Select your app
   - Click "Edit Settings"
   - Add your Vercel deployment URL + `/api/auth/callback` as a redirect URI
   - Save changes

### Important Notes

- Ensure all environment variables are properly set in Vercel
- The Spotify redirect URI must exactly match your Vercel deployment URL
- For custom domains, update the redirect URI in both Vercel and Spotify Developer Dashboard
- The first deployment might fail if environment variables aren't set

### Troubleshooting

1. **Authentication Issues:**
   - Verify redirect URIs match exactly in Spotify Dashboard and Vercel
   - Check environment variables in Vercel
   - Clear browser cookies and try again

2. **Build Failures:**
   - Check Vercel build logs
   - Ensure all dependencies are properly listed in package.json
   - Verify environment variables are set correctly

3. **API Errors:**
   - Confirm Spotify API credentials are correct
   - Verify OpenAI API key is valid
   - Check API rate limits
