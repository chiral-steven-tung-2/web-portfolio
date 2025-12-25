# Portfolio Website Template

A dynamic, customizable portfolio website built with React, TypeScript, and Tailwind CSS. Features dark mode, responsive design, and JSON-driven content for easy customization.


## Quick Start

### 1. Clone/Fork this repository

```bash
git clone https://github.com/yourusername/web-portfolio.git
cd web-portfolio
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run the development server

```bash
npm run dev
```

Visit `http://localhost:5173` to see your portfolio.

## Customization

### Update Your Information

All content is managed through a single JSON file: `src/data/portfolio.json`

Edit this file to update:
- **Personal Information**: Name, school, profile picture, social links, about me, interests
- **Education**: Degrees, schools, dates, awards
- **Experience**: Companies, roles, responsibilities, skills
- **Projects**: Titles, descriptions, technologies, highlights, repository links
- **Courses**: Department, course number, name, description, grade

### Add Your Images

Replace these files in the `public` folder:
- `profile.png` - Your profile picture
- `resume.pdf` - Your resume (for download button)
- `sbu-logo.png` - School/company logos (update paths in JSON)

### Customize Styling

- **Colors/Theme**: Edit `tailwind.config.js` and `src/index.css`
- **Components**: Modify files in `src/components/`
- **Pages**: Update files in `src/pages/`

## Deployment to GitHub Pages

### 1. Update configuration

In `package.json`, update the homepage:
```json
"homepage": "https://YOUR-USERNAME.github.io/YOUR-REPO-NAME"
```

In `vite.config.ts`, update the base path:
```typescript
base: '/YOUR-REPO-NAME/'
```

### 2. Deploy

```bash
npm run deploy
```

### 3. Enable GitHub Pages

1. Go to your repository on GitHub
2. Settings → Pages
3. Source: Deploy from a branch
4. Branch: `gh-pages` / `root`
5. Save

Your site will be live at `https://YOUR-USERNAME.github.io/YOUR-REPO-NAME`

## Project Structure

```
web-portfolio/
├── public/              # Static assets (images, resume)
├── src/
│   ├── components/      # Reusable components (Navbar, Sidebar, etc.)
│   ├── pages/          # Page components (MainPage, ResumePage, etc.)
│   ├── data/           # portfolio.json - all your content
│   ├── lib/            # Utility functions
│   └── App.tsx         # Main app component
├── package.json
├── vite.config.ts
└── tailwind.config.js
```

## Technologies Used

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **GitHub Pages** - Hosting

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run deploy` - Deploy to GitHub Pages

## License

MIT License - feel free to use this template for your own portfolio!

## Support

If you encounter issues or have questions, please open an issue on GitHub.

