# shyamvasansathiskumar-ux.github.io

Portfolio of Shyam Kumar: AI red-teaming, agent safety and AI governance. Live at [shyamvasansathiskumar-ux.github.io](https://shyamvasansathiskumar-ux.github.io/).

Projects: [Kaaval](https://shyamvasansathiskumar-ux.github.io/kaaval/) · [Pathivu](https://shyamvasansathiskumar-ux.github.io/pathivu/) · [Kanakku](https://shyamvasansathiskumar-ux.github.io/kanakku/) · [Mugam](https://shyamvasansathiskumar-ux.github.io/mugam/) · [Thavanai](https://shyamvasansathiskumar-ux.github.io/thavanai/) · [Kaappu](https://shyamvasansathiskumar-ux.github.io/kaappu/) · [Stewards' Room](https://shyamvasansathiskumar-ux.github.io/stewards-room/) · [FairDoor](https://shyamvasansathiskumar-ux.github.io/fairdoor/) · [AquaNXT](https://shyamvasansathiskumar-ux.github.io/aquanxt/) · [UpAid](https://upaid-site.vercel.app) · [Virasat](https://virasatweb-seven.vercel.app)

Every project explained without jargon: [guide.html](https://shyamvasansathiskumar-ux.github.io/guide.html).

## How it is built

A static site with no server, no forms, no cookies and no trackers.

- `index.html`, `assets/css/site.css`, `assets/js/` (page behaviour, the pointer, the 3D scene).
- The 3D scene is written in `src/world.js` and bundled with three.js into `assets/js/world.js` by `tools/build.sh`.
- Every script and stylesheet carries an integrity hash and a version; `tools/sri.py` writes them. Run it after any change.
- A strict Content-Security-Policy allows the site's own files and one outside request: the Chennai temperature from Open-Meteo.
- Two themes: night (A) and paper (B). Press `A` to switch, `/` for sound.
- Fonts and libraries are self-hosted; their licences are in `licenses/`.
