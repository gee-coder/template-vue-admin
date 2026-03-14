# template-vue-admin

Vue 3 + Vite + TypeScript management console template with JWT auth, RBAC menu rendering, dashboard, user management, role management, and menu management.

## Stack

- Vue 3.4.38
- Vite 5.4.21
- TypeScript 5.9.3
- Element Plus 2.4.4
- Pinia 2.1.7
- Vue Router 4.2.5
- Axios 1.6.8
- UnoCSS 66.6.6

## Start

```powershell
npm install
npm run dev
```

## Scripts

```powershell
npm run dev
npm run build
npm run preview
npm run type-check
```

## Default flow

1. Login with the backend seed account: `admin / Admin123!`
2. The app loads profile and menu data
3. Dynamic routes are registered from backend menus
4. Permission codes control page access and button visibility

## Structure

- `src/api`: all API calls
- `src/layouts`: application shell
- `src/views`: route views
- `src/components`: shared and module components
- `src/store`: Pinia stores
- `src/router`: static routing and guards
- `src/types`: shared types
- `src/utils`: route mapping, storage, permission helpers
- `src/plugins`: app plugin registration

