# PathLab Pro

A React-based Laboratory Management System with full CRUD for:

- **Pathologies** — test catalog (name, code, category, price, turnaround)
- **Collectors** — sample collection staff management
- **Test Orders** — patient test request tracking
- **Collection Orders** — home sample collection scheduling

## Project Structure

```
pathlab-pro/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Avatar.jsx
│   │   ├── CrudTable.jsx / CrudTable.css
│   │   ├── Layout.jsx   / Layout.css
│   │   ├── Modal.jsx    / Modal.css
│   │   └── StatusBadge.jsx
│   ├── data/
│   │   └── mockData.js
│   ├── pages/
│   │   ├── Dashboard.jsx / Dashboard.css
│   │   ├── Pathologies.jsx
│   │   ├── Collectors.jsx
│   │   ├── TestOrders.jsx
│   │   └── CollectionOrders.jsx
│   ├── App.jsx
│   ├── index.js
│   ├── index.css
│   └── utils.js
└── package.json
```

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

## Features

- Full CRUD (Create, Read, Update, Delete) on all four modules
- Live search/filter on every table
- Add/Edit modal forms with validation-ready inputs
- Status badges with semantic color coding
- Responsive sidebar navigation with React Router v6
- Avatar initials auto-generated from names
- Shared reusable components: CrudTable, Modal, StatusBadge, Avatar

## Next Steps

- Connect to a real REST API (replace `src/data/mockData.js` with API calls)
- Add `react-hook-form` + `zod` for form validation
- Integrate a state manager (Zustand / Redux Toolkit) for shared state
- Add authentication (JWT / session)
