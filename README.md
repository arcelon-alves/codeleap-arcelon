# CodeLeap Engineering Test

Frontend implementation for the CodeLeap engineering challenge.

## Deployment URL
- https://codeleap-arcelon.vercel.app
- Status on February 6, 2026: not deployed yet (`DEPLOYMENT_NOT_FOUND`), so run a Vercel production deploy for this repo.

## Run
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
```

## Test
```bash
npm test
```

## Deploy (Vercel)
```bash
npx vercel --prod
```

## Notes
- Uses React + TypeScript + Vite.
- Uses React Query for remote data management.
- Integrates with `https://dev.codeleap.co.uk/careers/`.
- Includes signup flow, create/list posts, edit modal, and delete confirmation modal.
- Includes bonus features:
  - persistent login/logout
  - sorting and filtering controls
  - paginated feed with "Load more"
  - mention highlighting, local likes, and local comments interaction
  - polished hover/transition effects
