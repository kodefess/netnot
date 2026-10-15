setup:
    pnpm install
    cp .env.example .env.local
    vercel pull
    echo 'SITE_PASSWORD=your-password' >> .env.local