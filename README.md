# MISSION 23 · A Universe Still Unwritten

An interactive, illustrated birthday universe built with React, TypeScript, Vite, Motion, SVG, Canvas and the Web Audio API. It is designed for an iPhone in portrait first and also works on desktop. A first visit takes about 5–8 minutes.

---

## 1. Run it on your computer

You need **Node.js 20 or newer**. Get the LTS installer from <https://nodejs.org>.

```bash
npm install
npm run dev
```

Then open the address it prints, usually **http://localhost:5173/mission-23/**.

To try it on your iPhone while developing, put both devices on the same Wi-Fi network and run:

```bash
npm run dev -- --host
```

Then open the "Network" address it prints on the phone.

**Developer shortcut:** while `npm run dev` is running, you can jump straight to any scene by adding `?scene=` to the URL, for example `…/mission-23/?scene=hoodie`. This only works in development and is never included in the published site.

Scene names: `opening, world1, jazz, library, flavor, victories, transition, world2, music, workshop, places, becoming, constellation, planet23, hoodie, finale`.

## 2. Add your music

1. Copy your file into **`public/music/`**, for example `public/music/background.mp3`.
2. If the file has a different name or format (`.m4a` and `.wav` also work), open **`src/config/music.ts`** and change `file:` to match it, e.g. `'music/our-song.m4a'`.
3. In the same file you can adjust `volume`, `duckLevel` (how much the music dips under interactive sounds), `fadeInSeconds` and `loop`.

How the music behaves:
- It starts when he touches the first star, which iPhone Safari requires before any audio can play, and fades in as the constellation forms.
- It plays continuously across every scene and never restarts between them.
- It dips under important sounds, and in World Two it subtly "opens up" in brightness.
- If no file is found, the site plays its own **original generated ambient soundtrack**, so nothing ever breaks.
- The speaker button in the top bar mutes or unmutes everything.

> GitHub Pages is public. Only use a track you have the right to publish. Keep the file small, ideally under 8 MB. A 128–192 kbps MP3 or AAC `.m4a` is plenty.

## 3. Edit messages and personal details

Every sentence in the universe is in **`src/config/content.ts`**: the letter, Mission Control jokes, book texts, the fruit ingredients, the small victories, map places, the hoodie message, and more. Change the words between the quotes and keep the quotes and commas.

Useful settings in `PERSONAL`:
- `signature`: how the birthday letter is signed. It defaults to "Your Mission Control".
- `hoodieColor`, `hoodieShade`, `hoodieLining`: match these to the real hoodie.
- `hoodieMessage`: the message stitched inside the hood.
- `recipientName`: optional. Leaving it empty keeps the public page anonymous.

## 4. Publish on GitHub Pages

The project already includes `.github/workflows/deploy.yml`. It builds and deploys automatically every time you push to `main`.

**One-time setup:**

1. Create a new repository on GitHub named **`mission-23`**. It can be public, or private if your plan supports Pages for private repositories.
2. In this folder, run:

   ```bash
   git init
   git add .
   git commit -m "Mission 23"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/mission-23.git
   git push -u origin main
   ```

3. On GitHub, open **Settings → Pages**. Under **Build and deployment → Source**, choose **GitHub Actions**.
4. Open the **Actions** tab and wait for "Deploy Mission 23 to GitHub Pages" to finish. If it ran before you switched the Pages source, choose **Re-run all jobs**.
5. Your site will be at **`https://YOUR-USERNAME.github.io/mission-23/`**.

**Base path:** the workflow detects the correct base path automatically:
- For a project repository such as `mission-23`, it uses `/mission-23/`.
- For a user site such as `YOUR-USERNAME.github.io`, or a custom domain, it uses `/`.

If you build manually for a different host, set `BASE_PATH=/ npm run build`.

**Updating later:** edit files, then run:

```bash
git add .
git commit -m "Update"
git push
```

The site redeploys within a minute or two.

## 5. Test before sending

```bash
npm run build
npm run preview
```

The production build is written to `dist/`. Things to check on the real iPhone:
- Turn the volume up. Sound works even with the silent switch on in iOS 17 and later; on older iOS versions, flip the silent switch off.
- Go through the whole story once.
- In the `•••` menu, choose **Restart the mission** to begin again from the first star. Progress is otherwise saved in the browser, so reopening the link offers "Resume mission".

## 6. What's inside

| Part | What happens |
|---|---|
| **Opening** | Darkness and one star. Hold it to awaken more stars, which connect into "23" and become the title. Mission Control identifies the pilot. Swipe the rocket up to launch. |
| **World One map** | Four destinations are laid out as a constellation route, and the rocket flies between them. *Secret:* tap the moon three times. |
| **Jazz Garden** | Seven flowers play original notes, bloom, and release golden notes. You can replay your melody. *Secret:* tap the saxophone. |
| **Library of Unfinished Ideas** | Floating books open in 3D to reveal messages. *Secret:* a folded note tucked into one book's margin. |
| **Planet of Unknown Flavors** | Drag to rotate three imaginary fruits and scan their ingredients. You choose to bite, admire, or ask questions, with no pressure. *Secret:* keep poking the fruit. |
| **Constellation of Small Victories** | Drag star to star to draw "Saxophonus Minor". Each connection reveals a small victory, and the constellation becomes a keepsake you can open from the menu. |
| **Transition** | The visited destinations rise, the camera pulls back, and they turn out to be stars in a larger arch that becomes a celestial doorway. Slide up through it; the light floods in and the music brightens. |
| **Observatory (World Two)** | Four doors, explored in any order. *Secret:* the telescope. |
| **Door I: Music** | A concert hall where touching the stage improvises a brand-new saxophone-style melody every time. *Secret:* listen three times. |
| **Door II: Ideas** | Drag pinned sketches onto a workbench, where they turn into a golden orrery, a lighthouse, and a bridge. |
| **Door III: Places** | A celestial map unfolds; drag it under a lens to discover places. *Secrets:* a space whale and some dragons. |
| **Door IV: Becoming** | Brush stardust off an observatory window to reveal a glowing galaxy and the most sincere message. |
| **Hidden Constellation** | The six golden fragments collected along the way (Curiosity, Creativity, Courage, Passion, Persistence, Possibility) gather into one constellation. Any he skipped appear as "still growing". |
| **Planet 23** | Trace a circle around the planet to light its 23 stars, and the birthday letter is revealed line by line. |
| **The Hoodie** | A gift box opens and the illustrated hoodie rises. Look inside the hood to see the stitched message. |
| **Finale** | Mission Control's final log, then options to revisit the universe, view the keepsake, or begin again. |

Every scene has a gentle "skip ahead" or "continue" that appears after a while, so he can never get stuck. The 6 golden fragments and 9 secret discoveries reward curiosity but are never required.

## 7. Project structure

```
src/
  config/content.ts   ← all words & personal details
  config/music.ts     ← music file & volume
  core/audio.ts       ← shared audio engine (music bus, ducking, synthesized instruments)
  core/story.tsx      ← story progression + saved progress (localStorage)
  core/sky.ts         ← starfield theme / warp control
  components/         ← starfield, finger-trail, HUD, Mission Control, shared UI
  scenes/             ← one file per scene
public/
  music/              ← put your audio here
  og-image.png        ← link-preview image
```

## 8. Notes and limitations

- **Audio on iPhone:** sound can only start after the first touch. This is a Safari rule, and the opening star covers it. On iOS 16 or older, the hardware silent switch can mute the interactive sounds.
- **Instrument sounds** are synthesized live: an original saxophone-like voice, bells, and chimes. They are evocative rather than recordings of a real saxophone.
- **Link preview image:** iMessage and WhatsApp previews use `og-image.png`. The workflow sets the absolute URL automatically on GitHub Pages.
- **Privacy:** there is no backend, analytics, cookies, or data collection. Progress is stored only in his own browser.
- **Reduced motion:** if the phone has Reduce Motion turned on, drifting, warps, and long transitions are toned down.
- The site sets `noindex`, so search engines are asked not to list it. However, anyone with the link can open it.
