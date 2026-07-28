# Velisa's Portfolio — Go Live + Content Manager (Free, No Coding)

This site now has a **content manager**: a visual admin panel where you and Velisa
can log in and add or remove photos and edit the bio — no code, no re-uploading
files by hand. It's all free.

You'll host on **Netlify** (free) and it stays connected to your **GitHub** repo.

- Live site: **https://YOURSITE.netlify.app**
- Admin panel: **https://YOURSITE.netlify.app/admin/**

Total setup time: ~15 minutes, one time.

---

## The big picture (how it works)

```
You/Velisa open  /admin  →  log in  →  add/remove photos in a visual panel
        │
        ▼
Decap CMS saves the change into your GitHub repo automatically
        │
        ▼
Netlify sees the change and rebuilds the live site (about 1 minute)
```

No database, no server to maintain. The photos live in your GitHub repo; the admin
panel just edits them for you.

---

## What's in the `site` folder

```
index.html          the website
admin/              the content manager (login + upload panel)
data/               text + photo lists the site reads (the CMS edits these)
images/             the photos
```

Upload the **entire `site` folder contents**, keeping this structure intact.
(You don't need to upload this guide file.)

---

## STEP 1 — Put the files on GitHub

1. Go to https://github.com and log in.
2. Click **+** (top-right) → **New repository**.
3. Name it `velisa`, set **Public**, click **Create repository**.
4. On the empty repo page click **uploading an existing file**.
5. Open the `site` folder, select everything inside it (index.html, and the
   `admin`, `data`, `images` folders), and drag it all onto the page.
6. Scroll down, click **Commit changes**.

> Keep the folders exactly as named — `admin`, `data`, `images`. The site and the
> panel look for those exact names.

---

## STEP 2 — Connect the repo to Netlify

1. Go to https://www.netlify.com and click **Sign up** → **Sign up with GitHub**
   (free, no card).
2. Once in, click **Add new site** → **Import an existing project**.
3. Choose **GitHub**, authorize it, and pick your `velisa` repo.
4. Leave all build settings blank/default (this is a plain site, no build step) and
   click **Deploy**.
5. After a moment you'll get a live URL like `random-name-123.netlify.app`.
   You can rename it: **Site configuration → Change site name** → e.g. `velisaputri`
   → site becomes `velisaputri.netlify.app`.

Your site is now LIVE. Next we switch on the login for the admin panel.

---

## STEP 3 — Turn on the login (Netlify Identity + Git Gateway)

This is what lets you and Velisa log into `/admin`.

1. In your Netlify site, go to **Integrations** (or **Site configuration**) and find
   **Identity** → click **Enable Identity**.
   - *(If you don't see Identity in the menu, open this URL directly, replacing the
     name: `https://app.netlify.com/sites/YOURSITE/identity` and click Enable.)*
2. Under **Identity → Registration**, set it to **Invite only** (so only people you
   invite can log in — keep it private).
3. Scroll to **Identity → Services → Git Gateway** → click **Enable Git Gateway**.
   (This is what lets the panel save changes back to GitHub.)

---

## STEP 4 — Invite yourself and Velisa

1. Still under **Identity**, click **Invite users**.
2. Enter **your email** and **Velisa's email**, send invites.
3. Each of you gets an email — click the link, set a password. Done.

> The invite link brings you to the site; it then sends you to the login to set your
> password. After that, log in any time at **YOURSITE.netlify.app/admin/**.

---

## Using the Content Manager (the part you wanted)

Go to **YOURSITE.netlify.app/admin/** and log in. You'll see two sections:

**📸 Portfolio Photos**
- Click it, then **Gallery Photos**.
- To **add a photo**: click **Add Photo**, upload the image, add a short caption,
  then click **Publish** (top right).
- To **remove a photo**: click the trash/remove icon next to it → **Publish**.
- To **reorder**: drag the photos up or down → **Publish**.

**⚙️ Bio & Contact**
- Edit her name, tagline, bio, hero photo, and the email/Instagram/TikTok handles.
- Click **Publish** when done.

Every time you Publish, the live site updates within about a minute. Refresh the
public page to see it.

> This is where you add all her other photos too — including any you couldn't add
> at first. Just upload them here; no file juggling.

---

## Everyday tips

- **Both of you** can log in and manage content independently.
- Photos you upload through the panel are automatically stored in the repo under
  `images/uploads/` — you don't have to think about it.
- Big photos load slowly. If a photo is huge (>3-4 MB), resize it to ~1600px on the
  long edge before uploading (any free tool, or ask me).

---

## Optional: a custom domain (e.g. velisaputri.com)

Costs ~$10-15/year from a registrar (Namecheap, GoDaddy). Once bought:
Netlify → **Domain management → Add a domain** → follow the steps. Ask me and I'll
walk you through it.

---

## Troubleshooting

- **Can't log into /admin:** make sure Identity is **Enabled**, set to **Invite
  only**, and **Git Gateway** is enabled (Step 3). Then accept the email invite.
- **"Failed to load config.yml":** the `admin` folder didn't upload with both
  `index.html` and `config.yml` inside. Re-upload the `admin` folder.
- **Photos don't show on the site:** the `images` and `data` folders must be at the
  top level of the repo. Filenames are case-sensitive.
- **Changed something but site looks the same:** wait 1 minute, then hard-refresh
  (Ctrl+Shift+R). Check Netlify's **Deploys** tab shows a recent successful deploy.
- **Invite email didn't arrive:** check spam, or in Netlify Identity click the user
  and **Resend invite**.

---

## Note on the free tier

Everything here is free at your scale: Netlify's free plan covers the hosting and
Identity (up to 1,000 logins/month — you'll use a handful), and GitHub hosts the
files for free. No card required to start.
