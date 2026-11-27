# Jagjeevan Singh Soni — Portfolio

Personal portfolio published at https://jeevansingh0001.github.io/.

## Edit content

- `content/profile.json`: introduction, experience, education, and individual skills.
- `content/credentials.json`: recognition, leadership, community work, and certificates with original files and previews.
- `content/projects.json`: project summaries and complete case studies.
- `public/styles.css` and `public/showcase.css`: profile layout, galleries, and responsive styling.
- `scripts/build.mjs`: page templates and static build.
- `public/assets/MS_Resume_Jagjeevan_FINAL.pdf`: résumé opened by the overview and gallery buttons.

Requires Node.js 20 or newer. There are no npm package dependencies.

```sh
npm run build
npm run check
npm run dev
```

Open http://127.0.0.1:4173. Rebuild after editing content or styles, then refresh the preview.

For local palette comparisons, open http://127.0.0.1:4173/theme-options/.
These review routes are served by `scripts/previews/themes.mjs` and are excluded from the static build. Each palette has separate light and dark previews; preview toggles do not change the saved theme for the main portfolio.

## Publish updates

The repository's GitHub Pages source must be **GitHub Actions** under Settings → Pages. Pushing to `main` runs the Publish portfolio workflow, validates all pages, and deploys `dist/`. Check the Actions tab for completion before treating an update as live.

```sh
git add content public scripts
git commit -m "Update portfolio content"
git push origin main
```

To restore an earlier site, revert the relevant commit and push the revert. Do not force-push the shared history.

## Update the PDF résumé

Copy the approved PDF into `public/assets/` and update `resumeUrl` in `scripts/build.mjs` if its filename changes. Run the build and link checks, then open the overview’s résumé button in the local preview.

## Content boundaries

Keep private source documents, employment letters, account credentials, and reference material outside this repository. `.local/` is ignored and must never be published. Only `dist/` is deployed. Case studies distinguish prototypes, simulations, and offline evaluations from production deployments.

No third-party analytics, contact backend, tracking scripts, or remote fonts are used. Small local scripts handle the theme preference, scroll header, and ribbon state.

## Profile photo

Add your portrait to `public/assets/` and set `"photo": "/assets/your-photo.jpg"` in `content/profile.json`. The homepage and compact phone header use the same image. A neutral silhouette appears when no photo is configured.

On desktop, the profile stays on the left as the seven portfolio tabs switch in the right panel. Phones open on the full profile. Scrolling into the overview brings the name, résumé, and theme control into a compact header. Swipe the bottom ribbon to reach all seven sections. The Theme button switches between dark and light appearances and saves the preference locally.

Logo sources and licenses are recorded in `public/assets/credits.txt`. The profile photo is `public/assets/jagjeevan-profile.jpeg`.
