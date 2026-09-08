# Jagjeevan Singh Soni — Portfolio

Personal portfolio published at https://jeevansingh0001.github.io/.

## Edit content

- `content/profile.json`: introduction, experience, education, skills, recognition, and community work.
- `content/projects.json`: project summaries and complete case studies.
- `public/styles.css`: visual styling and responsive layouts.
- `scripts/build.mjs`: page templates and static build.
- `public/assets/Jagjeevan_Singh_Soni_Resume.pdf`: public résumé download.

Requires Node.js 20 or newer. There are no npm package dependencies.

```sh
npm run build
npm run check
npm run dev
```

Open http://127.0.0.1:4173. Rebuild after editing content or styles, then refresh the preview.

## Publish updates

The repository's GitHub Pages source must be **GitHub Actions** under Settings → Pages. Pushing to `main` runs the Publish portfolio workflow, validates all pages, and deploys `dist/`. Check the Actions tab for completion before treating an update as live.

```sh
git add content public scripts
git commit -m "Update portfolio content"
git push origin main
```

To restore an earlier site, revert the relevant commit and push the revert. Do not force-push the shared history.

## Update the PDF résumé

The editable résumé content is shared with the website. Use Python 3 with `reportlab` and `pypdf` installed:

```sh
python scripts/resume.py
npm run build
npm run check
```

Inspect every page of the resulting PDF before committing it. The PDF is committed as a public asset so CI needs only Node.js.

## Content boundaries

Keep private source documents, employment letters, account credentials, and reference material outside this repository. `.local/` is ignored and must never be published. Only `dist/` is deployed. Case studies distinguish prototypes, simulations, and offline evaluations from production deployments.

No third-party analytics, contact backend, tracking scripts, remote fonts, or runtime JavaScript are required for the website.
