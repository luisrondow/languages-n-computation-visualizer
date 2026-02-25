# Languages & Computation Visualizer

An interactive tool for visualizing and simulating formal language automata — built for students and educators in theoretical computer science.

## Supported Automata

- **DFA** — Deterministic Finite Automaton
- **NFA** — Nondeterministic Finite Automaton
- **ε-NFA** — Epsilon-NFA (with ε-transitions)
- **PDA** — Pushdown Automaton (with stack visualization)
- **TM** — Turing Machine (with tape visualization)

## Features

- Interactive graph editor with D3.js force-directed layout
- Zoom, pan, and drag nodes to arrange your automaton
- Resizable graph container
- Step-by-step simulation with playback controls
- Transition log and formal definition display
- Save/load automata to LocalStorage and JSON export
- Built-in examples for each automaton type
- Available in English and Portuguese

## Tech Stack

- [Vue 3](https://vuejs.org/) + TypeScript (Composition API, `<script setup>`)
- [Vite](https://vite.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [D3.js v7](https://d3js.org/)
- [Pinia](https://pinia.vuejs.org/)
- [vue-i18n](https://vue-i18n.intlify.dev/)

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Type-check and build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── components/      Vue components (layout, automata workspaces, shared editors)
├── composables/     Reusable logic (graph, simulation, persistence, validation)
├── engines/         Automaton execution engines (one per type + factory)
├── examples/        Built-in example automata
├── i18n/            Translations (EN, PT)
├── stores/          Pinia stores (app, automaton, simulation)
└── types/           TypeScript type definitions
```

## Author

[Luis von Rondow](https://rondow.dev)
