# Shuyu (Suri) Peng Portfolio

Static portfolio site built with HTML, CSS, and JavaScript.

## Files

- `index.html` - main site page
- `styles.css` - site styling and responsive layouts
- `script.js` - section and project links, tab switching, image popup, email copy, and scroll behavior
- `scroll-reveal.js` - page and media reveal behavior
- `stage-indicator.js` - UI/UX case study stage navigation
- `assets/` - resume PDF
- `vendor/` - local motion libraries used by the site

Project images are hosted on Cloudinary.

## GitHub Pages

1. Upload the files in this folder to a GitHub repository.
2. In the repository, go to **Settings > Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select the `main` branch and the `/ (root)` folder, then save.
5. GitHub Pages will publish the folder contents as the site root.

This setup does not require a `docs` folder.

## Notes

- Keep all HTML, CSS, JavaScript, `assets`, and `vendor` files in their current relative locations.
- Keep the complete `assets/` folder so the resume link works.
- Every section and project has a shareable hash link, such as `/#uiux` or `/#quesay`.
- Direct project links select the correct section and project automatically. Browser Back and Forward navigation are supported.
- Quesay uses 3x Cloudinary artwork and a narrower desktop reading layout.
- AnimalLove uses a responsive static stakeholder map with readable supporting text.
