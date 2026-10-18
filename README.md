# React + Vite

## Adding portfolio projects

Edit `src/data/projects.js` and add objects to the exported `projects` array.
The file includes a commented example. Each project needs a `title` and
`description`; give each a unique `id` as well. Optional fields are `category`,
`tags`, `image`, `liveUrl`, `githubUrl`, and `details`.

Place screenshots in `public/projects/` and reference them with a path such as
`/projects/my-app.png`. Use full `https://` addresses for project links.
Category filters appear automatically when there are at least two categories.
The section displays a coming-soon state while the array is empty.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
