# Shuyu (Suri) Peng Portfolio

Static portfolio site built with HTML, CSS, and JavaScript.

## Files

- `index.html` - main site page
- `styles.css` - site styling and responsive layouts
- `script.js` - tab switching, project switching, image popup, email copy, and scroll memory
- `assets/` - resume PDF

Project images are hosted on Cloudinary, so the large local image folders are intentionally not included for GitHub upload.

## GitHub Pages

1. Upload the files in this folder to a GitHub repository.
2. In the repository, go to **Settings > Pages**.
3. Under **Build and deployment**, choose **GitHub Actions**.
4. Push to the `main` branch.
5. The included workflow in `.github/workflows/pages.yml` will publish the root folder directly.

This setup does not require a `docs` folder.

## Notes

- Keep `index.html`, `styles.css`, and `script.js` in the same folder.
- Keep `assets/Shuyu (Suri) Peng-Designer.pdf` if the resume link should work.
- Do not upload the local image folders unless you want to store backup copies in GitHub. The live site already loads those images from Cloudinary.
