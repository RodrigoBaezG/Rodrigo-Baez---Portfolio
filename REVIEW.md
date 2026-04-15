# REVIEW INTEGRAL — Rodrigo Baez Portfolio

> Fecha: Abril 2026  
> Stack actual: HTML/CSS/JavaScript vanilla + Webpack 5  
> Estado general: base sólida con organización modular, pero con áreas claras de mejora en responsividad, rendimiento, accesibilidad y modernización visual.

---

## ÍNDICE

1. [Problemas críticos](#1-problemas-críticos)
2. [Responsividad y layout](#2-responsividad-y-layout)
3. [Rendimiento y optimización](#3-rendimiento-y-optimización)
4. [Accesibilidad (a11y)](#4-accesibilidad-a11y)
5. [Mejoras de UI y estética moderna](#5-mejoras-de-ui-y-estética-moderna)
6. [Código y arquitectura](#6-código-y-arquitectura)
7. [Tests a implementar](#7-tests-a-implementar)
8. [SEO y metadatos](#8-seo-y-metadatos)
9. [Backlog / opcionales](#9-backlog--opcionales)

---

## 1. PROBLEMAS CRÍTICOS

### 1.1 Cards de portafolio con ancho fijo (rompe en mobile)

**Problema:** Las tarjetas del portafolio tienen `width: 400px` hardcoded, lo que genera scroll horizontal en pantallas pequeñas.

**Acción:**
```css
/* portfolio.css — reemplazar */
.portfolio-card {
  width: 100%;
  max-width: 400px;
}
```

---

### 1.2 Grid de Skillset sin media queries

**Problema:** El grid de habilidades está fijo en 4 columnas. En mobile (<480px) las columnas quedan demasiado pequeñas y los íconos se apilan de forma incorrecta.

**Acción:**
```css
/* skillset.css */
.skillset-grid {
  grid-template-columns: repeat(4, 1fr);
}

@media (max-width: 600px) {
  .skillset-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
```

---

### 1.3 Botón hamburger sin etiqueta de accesibilidad

**Problema:** El botón del menú móvil usa el carácter ASCII `≡` sin `aria-label`, lo que impide que lectores de pantalla lo describan correctamente.

**Acción:**
```html
<!-- index.html -->
<button class="burger" aria-label="Abrir menú de navegación" aria-expanded="false">
  <span class="burger-icon" aria-hidden="true">&#9776;</span>
</button>
```

También actualizar `main.js` para togglear `aria-expanded` al abrir/cerrar.

---

### 1.4 Formulario de contacto sin feedback al usuario

**Problema:** El formulario usa Netlify pero no muestra ningún mensaje de éxito ni error tras el envío.

**Acción:**
- Añadir atributo `action="/success.html"` a Netlify, o
- Interceptar el `submit` con JS y mostrar un mensaje inline ("¡Tu mensaje fue enviado!").

---

### 1.5 Onclick inline en tarjetas de portafolio

**Problema:** Las tarjetas usan `onclick="window.open(...)"` directamente en el HTML, lo que mezcla lógica con estructura y dificulta el mantenimiento y testing.

**Acción:** Mover los handlers a `main.js`, asignando data-attributes a los botones.

```html
<button data-url="https://rodrigogoals-app.netlify.app" class="portfolio-btn">
```

```js
// main.js
document.querySelectorAll('.portfolio-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    window.open(btn.dataset.url, '_blank', 'noopener noreferrer');
  });
});
```

---

## 2. RESPONSIVIDAD Y LAYOUT

### 2.1 Añadir media queries globales organizados

Crear un archivo `assets/css/responsive.css` e importarlo al final de `index.css`. Puntos de corte recomendados:

| Breakpoint | Ancho | Descripción |
|---|---|---|
| `sm` | `480px` | Móviles pequeños |
| `md` | `768px` | Tablets / móviles grandes |
| `lg` | `1024px` | Laptops |
| `xl` | `1280px` | Monitores grandes |

---

### 2.2 Portfolio: layout responsivo con CSS Grid

**Acción:** Reemplazar el layout actual de tarjetas por un CSS Grid fluido:

```css
.portfolio-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  padding: 2rem;
}
```

Esto hace que las tarjetas se adapten automáticamente a cualquier pantalla sin media queries adicionales.

---

### 2.3 Tipografía fluida

**Acción:** Usar `clamp()` en los tamaños de fuente para escalar suavemente entre dispositivos:

```css
h1 { font-size: clamp(1.8rem, 5vw, 3rem); }
h2 { font-size: clamp(1.4rem, 3.5vw, 2.2rem); }
p  { font-size: clamp(0.95rem, 2vw, 1.1rem); }
```

---

### 2.4 Vídeo hero: alternativa en mobile

**Problema:** El video de fondo se descarga en mobile aunque no sea necesario visualmente y consume datos del usuario.

**Acción:**
```html
<video ... class="hero-video">
  <source src="assets/video/hero.mp4" type="video/mp4" media="(min-width: 768px)">
</video>
```

En mobile, reemplazar el video por un gradiente CSS animado o una imagen estática de fallback.

---

### 2.5 Form de contacto: layout mobile

**Acción:** Los labels al 50% de ancho no escalan bien. Cambiar a `flex-direction: column` en pantallas pequeñas:

```css
@media (max-width: 600px) {
  .contact-form label {
    width: 100%;
  }
}
```

---

## 3. RENDIMIENTO Y OPTIMIZACIÓN

### 3.1 Convertir imágenes de portfolio a WebP

**Problema:** Las capturas de pantalla están en PNG. WebP ofrece hasta 30% menos de peso con igual calidad visual.

**Acción:**
1. Instalar `imagemin` + `imagemin-webp` como devDependency.
2. Añadir script de optimización en `package.json`:
   ```json
   "optimize:img": "imagemin assets/img/portfolio/*.png --out-dir=assets/img/portfolio/webp --plugin=webp"
   ```
3. Usar `<picture>` en HTML para servir WebP con fallback:
   ```html
   <picture>
     <source srcset="assets/img/portfolio/goals.webp" type="image/webp">
     <img src="assets/img/portfolio/goals.png" alt="Goals App screenshot" loading="lazy">
   </picture>
   ```

---

### 3.2 Lazy loading de imágenes

**Acción:** Añadir `loading="lazy"` a todas las imágenes fuera del fold (portfolio, skillset):

```html
<img src="..." alt="..." loading="lazy">
```

---

### 3.3 Preload del hero video

**Problema:** El video se carga sin prioridad. El hero se ve en blanco durante la carga inicial.

**Acción:**
```html
<link rel="preload" href="assets/video/hero.mp4" as="video" type="video/mp4">
```

---

### 3.4 Preload del logo y fuentes críticas

```html
<link rel="preload" href="assets/img/logos/large.png" as="image">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
```

---

### 3.5 Eliminar Bootstrap si no se usa

**Problema:** Bootstrap está listado en `package.json` como dependencia pero no se usa activamente. Añade peso innecesario al bundle.

**Acción:** Remover Bootstrap del `package.json` y verificar que nada dependa de él:
```bash
npm uninstall bootstrap
```

---

### 3.6 Eliminar eins-modal si no se usa

Similar al punto anterior: `eins-modal` parece no estar en uso activo (solo `micromodal`). Evaluar su remoción.

---

## 4. ACCESIBILIDAD (a11y)

### 4.1 Añadir "Skip to content" link

**Acción:** Primer elemento del `<body>` — oculto visualmente pero accesible vía teclado:

```html
<a href="#main-content" class="skip-link">Ir al contenido principal</a>
```

```css
.skip-link {
  position: absolute;
  top: -100%;
  left: 1rem;
  background: var(--primary);
  color: #000;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  z-index: 9999;
  transition: top 0.2s;
}
.skip-link:focus {
  top: 1rem;
}
```

---

### 4.2 Aria-labels en botones de portafolio

**Acción:** Cada botón de proyecto debe describir su destino:

```html
<button aria-label="Ver proyecto Goals App (abre en nueva pestaña)" ...>
```

---

### 4.3 Contraste de colores

Verificar que todos los textos cumplan WCAG AA (ratio mínimo 4.5:1 para texto normal). Herramienta recomendada: [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/).

Colores a revisar:
- Texto gris sobre fondo blanco en secciones
- Texto blanco sobre el degradado del header
- Texto del formulario sobre fondo oscuro

---

### 4.4 Focus visible en todos los elementos interactivos

**Acción:** Asegurarse de que `:focus-visible` sea claramente visible en todos los botones, inputs y links:

```css
:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 3px;
}
```

---

### 4.5 Alt text descriptivo en todas las imágenes

Revisar que todas las imágenes tengan alt text que describa el contenido, no solo el nombre del archivo.

---

## 5. MEJORAS DE UI Y ESTÉTICA MODERNA

> Objetivo: mantener el estilo actual (paleta cyan/naranja, fondos oscuros) pero refinarlo con tendencias modernas: glassmorphism sutil, microinteracciones, tipografía más pronunciada, espacios más generosos.

---

### 5.1 Hero section: modernizar tipografía y layout

**Problema actual:** El hero es funcional pero genérico. Le falta jerarquía visual y movimiento.

**Acción:**

1. **Nombre en grande con efecto gradiente:**
```css
.hero-name {
  font-size: clamp(2.5rem, 7vw, 5rem);
  font-weight: 800;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

2. **Subtítulo con efecto de escritura (typewriter):**
   Añadir un efecto CSS o JS simple de escritura animada para "Software developer".

3. **Añadir CTA (Call to Action) visible:**
```html
<a href="#portfolio" class="hero-cta">Ver mis proyectos</a>
```
```css
.hero-cta {
  display: inline-block;
  margin-top: 2rem;
  padding: 0.75rem 2rem;
  border: 2px solid var(--primary);
  color: var(--primary);
  border-radius: 50px;
  font-weight: 600;
  letter-spacing: 0.05em;
  transition: all 0.3s ease;
}
.hero-cta:hover {
  background: var(--primary);
  color: #000;
  transform: translateY(-2px);
}
```

4. **Flecha de scroll animada al fondo del hero:**
```html
<div class="scroll-indicator" aria-hidden="true">
  <span class="scroll-arrow">↓</span>
</div>
```

---

### 5.2 Navbar: glassmorphism al hacer scroll

**Problema actual:** La navbar al fijarse tiene un fondo sólido básico.

**Acción:** Cuando la navbar se vuelve sticky, aplicar efecto glass:

```css
.navbar.fixed {
  background: rgba(30, 30, 30, 0.8);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}
```

---

### 5.3 Cards de portafolio: rediseño con hover mejorado

**Problema actual:** El hover escala la imagen y muestra un overlay, pero la experiencia es algo brusca y el texto del overlay es difícil de leer.

**Acción:**

1. **Card con borde sutil y esquinas redondeadas:**
```css
.portfolio-card {
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.06);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.portfolio-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 20px 40px rgba(0, 195, 255, 0.15);
}
```

2. **Overlay más limpio con gradiente desde abajo:**
```css
.portfolio-overlay {
  background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 60%);
}
```

3. **Añadir tech stack en cada card (debajo del título):**
```html
<div class="card-meta">
  <span class="tech-tag">React</span>
  <span class="tech-tag">Vite</span>
</div>
```
```css
.tech-tag {
  font-size: 0.7rem;
  padding: 2px 8px;
  border-radius: 100px;
  background: rgba(0, 195, 255, 0.15);
  color: var(--primary);
  border: 1px solid rgba(0, 195, 255, 0.3);
}
```

---

### 5.4 Skillset: chips con descripción en hover

**Problema actual:** Los tooltips de habilidades son funcionales pero básicos.

**Acción:**

1. **Rediseñar como chips/pills más modernos:**
```css
.skill-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.2rem;
  border-radius: 50px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.25s ease;
}
.skill-item:hover {
  background: rgba(0, 195, 255, 0.1);
  border-color: var(--primary);
  transform: scale(1.05);
}
```

2. **Añadir nivel de competencia** (barras de progreso animadas o porcentaje).

---

### 5.5 Secciones: titles con línea decorativa

**Acción:** Añadir una línea de acento debajo de los títulos de sección:

```css
.section-title {
  position: relative;
  display: inline-block;
  margin-bottom: 2.5rem;
}
.section-title::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 0;
  width: 40px;
  height: 3px;
  background: var(--primary);
  border-radius: 2px;
}
```

---

### 5.6 Formulario de contacto: diseño flotante

**Acción:** Mejorar los inputs con efecto de label flotante:

```css
.form-group {
  position: relative;
  margin-bottom: 1.5rem;
}
.form-group input,
.form-group textarea {
  width: 100%;
  padding: 1rem 0.75rem 0.5rem;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  color: var(--white);
  transition: border-color 0.2s ease;
}
.form-group input:focus,
.form-group textarea:focus {
  border-color: var(--primary);
  outline: none;
  box-shadow: 0 0 0 3px rgba(0, 195, 255, 0.1);
}
```

---

### 5.7 Animaciones de entrada (scroll-triggered)

**Acción:** Añadir animaciones suaves al hacer scroll con `IntersectionObserver`:

```js
// main.js
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));
```

```css
.animate-on-scroll {
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 0.5s ease, transform 0.5s ease;
}
.animate-on-scroll.visible {
  opacity: 1;
  transform: translateY(0);
}
```

Añadir clase `.animate-on-scroll` a: cards de portafolio, skill items, y el formulario.

---

### 5.8 Footer: mejorar diseño

**Acción:** El footer es muy mínimo. Añadir los links de redes sociales también aquí, y un mensaje breve:

```html
<footer>
  <div class="footer-content">
    <p>Diseñado y desarrollado por <strong>Rodrigo Baez García</strong></p>
    <div class="footer-links">
      <a href="https://github.com/RodrigoBaezG" target="_blank" rel="noopener">GitHub</a>
      <a href="https://linkedin.com/in/rodrigo-báez-garcía-4bb55a271" target="_blank" rel="noopener">LinkedIn</a>
    </div>
    <p class="footer-copy">&copy; 2026 · Todos los derechos reservados</p>
  </div>
</footer>
```

---

### 5.9 Favicon y metadatos Open Graph

**Problema actual:** No se detecta favicon personalizado ni tags Open Graph.

**Acción:**
```html
<!-- index.html <head> -->
<link rel="icon" href="assets/img/logos/small.png" type="image/png">
<meta property="og:title" content="Rodrigo Baez — Software Developer">
<meta property="og:description" content="Portafolio de proyectos de desarrollo web con React, Node.js y más.">
<meta property="og:image" content="assets/img/logos/large.png">
<meta property="og:type" content="website">
<meta name="twitter:card" content="summary_large_image">
```

---

### 5.10 Modo oscuro explícito y variables bien definidas

El sitio ya es oscuro, pero no está vinculado a `prefers-color-scheme`. Si en el futuro se añade modo claro, tener las variables CSS bien organizadas facilita el switch:

```css
/* main.css */
:root {
  color-scheme: dark;
  /* Mantener variables actuales */
}
```

---

## 6. CÓDIGO Y ARQUITECTURA

### 6.1 Configurar ESLint + Prettier

**Acción:**
```bash
npm install --save-dev eslint prettier eslint-config-prettier
```

Crear `.eslintrc.json`:
```json
{
  "env": { "browser": true, "es2021": true },
  "extends": ["eslint:recommended", "prettier"],
  "parserOptions": { "ecmaVersion": "latest", "sourceType": "module" }
}
```

Crear `.prettierrc`:
```json
{
  "singleQuote": true,
  "semi": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

Añadir script en `package.json`:
```json
"lint": "eslint assets/js/**/*.js",
"format": "prettier --write assets/js/**/*.js assets/css/**/*.css"
```

---

### 6.2 Extraer datos de proyectos a un JSON

**Problema:** Los proyectos están hardcoded en el HTML. Si se añade/modifica uno, hay que editar el HTML manualmente.

**Acción:** Crear `assets/data/projects.json` y generar las cards dinámicamente desde JS:

```json
[
  {
    "name": "Goals App",
    "tech": ["React", "Vite", "Node.js", "JWT"],
    "url": "https://rodrigogoals-app.netlify.app",
    "image": "assets/img/portfolio/goals.png"
  }
]
```

---

### 6.3 Separar la lógica de main.js

**Acción:** `main.js` actualmente mezcla: menú hamburger, navbar sticky, y portfolio. Separar en módulos:

```
assets/js/
├── navbar.js       (hamburger + sticky)
├── portfolio.js    (click handlers)
├── animations.js   (IntersectionObserver)
└── main.js         (importa y ejecuta todos)
```

---

### 6.4 Añadir modo producción vs desarrollo en Webpack

**Acción:** En `webpack.config.js`, usar el parámetro `env.mode`:

```js
module.exports = (env, argv) => ({
  mode: argv.mode || 'development',
  // ...
});
```

Scripts en `package.json`:
```json
"start": "webpack serve --mode development",
"build": "webpack --mode production"
```

---

### 6.5 Revisar la sección Experience (comentada)

**Decisión pendiente:** La sección de Experience con logos de Nintendo, Google, Amazon y Fresh está comentada. Si son experiencias ficticias/de práctica, removerlas definitivamente del código o reemplazar por experiencias reales.

---

## 7. TESTS A IMPLEMENTAR

### 7.1 Instalar framework de testing

**Acción:**
```bash
npm install --save-dev jest @testing-library/dom @testing-library/jest-dom jest-environment-jsdom
```

Actualizar `package.json`:
```json
"test": "jest",
"test:watch": "jest --watch",
"test:coverage": "jest --coverage"
```

---

### 7.2 Tests unitarios de JavaScript

Crear `assets/js/__tests__/`:

**Test 1: navbar.test.js**
```js
// Verifica que la navbar añade clase 'fixed' al hacer scroll
test('navbar becomes fixed after scrolling past threshold', () => {
  // ...
});

// Verifica que el burger menu toggle funciona
test('burger menu toggles open class', () => {
  // ...
});
```

**Test 2: portfolio.test.js**
```js
// Verifica que los botones abren la URL correcta
test('portfolio button opens correct URL', () => {
  // ...
});
```

**Test 3: form.test.js**
```js
// Verifica validación de email
test('form requires valid email', () => {
  // ...
});

// Verifica que el mensaje vacío no puede enviarse
test('form requires non-empty message', () => {
  // ...
});
```

---

### 7.3 Tests de accesibilidad automatizados

**Acción:**
```bash
npm install --save-dev axe-core @axe-core/playwright playwright
```

Crear `tests/a11y.test.js`:
```js
// Verifica que no hay violaciones de accesibilidad en cada sección
test('hero section has no a11y violations', async () => { ... });
test('portfolio section has no a11y violations', async () => { ... });
test('contact form has no a11y violations', async () => { ... });
```

---

### 7.4 Tests de responsividad visual (Playwright)

Crear `tests/responsive.test.js`:
```js
const viewports = [
  { name: 'mobile', width: 375, height: 812 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 900 },
];

// Por cada viewport: tomar screenshot y verificar que no hay scroll horizontal
viewports.forEach(viewport => {
  test(`no horizontal scroll at ${viewport.name}`, async ({ page }) => { ... });
});
```

---

### 7.5 Tests de rendimiento (Lighthouse CI)

**Acción:**
```bash
npm install --save-dev @lhci/cli
```

Añadir `lighthouserc.json`:
```json
{
  "ci": {
    "collect": { "startServerCommand": "npm start", "url": ["http://localhost:8080"] },
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.85 }],
        "categories:accessibility": ["error", { "minScore": 0.90 }],
        "categories:seo": ["error", { "minScore": 0.90 }]
      }
    }
  }
}
```

---

## 8. SEO Y METADATOS

### 8.1 Metadatos básicos faltantes

**Acción:**
```html
<meta name="description" content="Portafolio de Rodrigo Baez García, desarrollador de software especializado en React, Node.js y JavaScript.">
<meta name="keywords" content="Rodrigo Baez, desarrollador, portfolio, React, Node.js, JavaScript">
<meta name="author" content="Rodrigo Baez García">
<meta name="robots" content="index, follow">
<link rel="canonical" href="https://tu-dominio.com/">
```

---

### 8.2 Añadir structured data (JSON-LD)

**Acción:**
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Rodrigo Baez García",
  "jobTitle": "Software Developer",
  "url": "https://tu-dominio.com",
  "sameAs": [
    "https://github.com/RodrigoBaezG",
    "https://linkedin.com/in/rodrigo-báez-garcía-4bb55a271"
  ]
}
</script>
```

---

### 8.3 Optimizar lang del HTML

**Verificar:** El atributo `lang` del `<html>` debe coincidir con el idioma del contenido:

```html
<html lang="es">
```

---

## 9. BACKLOG / OPCIONALES

> Items de menor prioridad o que requieren mayor esfuerzo de implementación.

| # | Mejora | Esfuerzo | Impacto |
|---|--------|----------|---------|
| B1 | Añadir sección "About Me" con texto corto y foto | Bajo | Alto |
| B2 | Migrar a Vite (más rápido que Webpack para dev) | Medio | Medio |
| B3 | Añadir modo claro/oscuro con toggle | Medio | Medio |
| B4 | Implementar cursor personalizado animado | Bajo | Medio |
| B5 | Añadir filtro por categoría en el portafolio | Medio | Alto |
| B6 | Internacionalización (ES/EN) | Alto | Medio |
| B7 | Añadir animación de partículas o gradiente en hero | Bajo | Alto |
| B8 | Sección "Experiencia" real con timeline vertical | Medio | Alto |
| B9 | Página 404 personalizada | Bajo | Bajo |
| B10 | Service Worker para modo offline básico | Alto | Bajo |

---

## PRIORIDAD DE EJECUCIÓN RECOMENDADA

```
SPRINT 1 — Crítico (bugs y UX bloqueantes)
  [1.1] Corregir ancho fijo de cards (mobile scroll)
  [1.2] Grid de skillset responsive
  [1.3] Aria-label en hamburger
  [1.4] Feedback de formulario enviado
  [1.5] Mover onclicks a JS
  [4.1] Skip-to-content link
  [8.3] Lang del HTML

SPRINT 2 — Rendimiento y SEO
  [3.1] Convertir imágenes a WebP
  [3.2] Lazy loading en imágenes
  [3.5] Eliminar Bootstrap si no se usa
  [3.3] Preload hero video
  [8.1] Metadatos SEO básicos
  [5.9] Favicon + Open Graph

SPRINT 3 — Estética moderna
  [5.1] Hero: tipografía gradiente + CTA
  [5.2] Navbar: glassmorphism al sticky
  [5.3] Cards: hover mejorado + tech tags
  [5.4] Skillset: chips modernos
  [5.5] Section titles con acento de línea
  [5.7] Animaciones scroll-triggered

SPRINT 4 — Calidad de código y tests
  [6.1] ESLint + Prettier
  [6.3] Separar JS en módulos
  [7.1] Instalar Jest
  [7.2] Tests unitarios JS
  [7.3] Tests de accesibilidad
  [7.4] Tests de responsividad

SPRINT 5 — Backlog
  [B1] Sección About Me
  [B5] Filtro de portafolio
  [B8] Timeline de experiencia
  [B7] Animación hero
```

---

*Generado con Claude Code — Abril 2026*
