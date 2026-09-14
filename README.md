# V_Eternals

Catálogo de arreglos florales con cotizaciones personalizadas, envío por WhatsApp y panel administrativo.

## Desarrollo

1. Copia `.env.example` como `.env` y completa las variables de Supabase.
2. Instala dependencias con `npm install`.
3. Ejecuta `npm run dev`.

## Supabase

Aplica `supabase/migrations/001_business_security.sql` desde el SQL Editor después de revisar los nombres y tipos de las tablas existentes. La migración agrega campos de seguimiento (`occasion`, `notes`, `delivery_date`, `admin_notes`, `status`), publicación de productos y políticas RLS.

El rol administrativo debe existir en `profiles.role` con el valor `admin`. Verifica también que el bucket `products-image` tenga las políticas de Storage adecuadas para administradores.

## Validación

- `npm run lint`
- `npm run build`

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is enabled on this template. See [this documentation](https://react.dev/learn/react-compiler) for more information.

Note: This will impact Vite dev & build performances.
You can also try [the experimental native React Compiler support in plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md#rust-react-compiler) by using `compiler: true` in the plugin options instead of using the Babel plugin.

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
