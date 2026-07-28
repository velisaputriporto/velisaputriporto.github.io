# Sveltia CMS — login with a GitHub access token (the reliable way)

The admin panel now uses **Sveltia CMS**, logging in with a **GitHub access token**.
This skips both Netlify Git Gateway and Netlify OAuth (both were failing). It's the
simplest, most dependable option — no OAuth app, no extra services.

Same panel as planned: add/remove photos, edit the bio. About 5 minutes to set up.

---

## STEP 1 — Create a GitHub access token

1. Go to https://github.com/settings/personal-access-tokens/new
   (this is **Fine-grained tokens** → **Generate new token**).
2. Fill in:
   - **Token name:** `Velisa CMS`
   - **Expiration:** pick **Custom** and set it about a year out (or "No expiration"
     if offered — note whichever date, you'll re-make it when it expires).
   - **Resource owner:** `satriozulkarnaen`
3. **Repository access:** choose **Only select repositories** → pick **Velisa**.
4. **Permissions:** expand **Repository permissions**, find **Contents**, and set it
   to **Read and write**. (Leave everything else as default — "Metadata: Read" turns
   on automatically, that's fine.)
5. Scroll down, click **Generate token**.
6. Copy the token it shows you (starts with `github_pat_...`). **Copy it now —
   GitHub only shows it once.**

---

## STEP 2 — Sign in

1. Go to **https://velisaputri.netlify.app/admin/**
2. Click **Sign In Using Access Token** (the second button).
3. Paste your token → confirm.

You're in. You'll see 📸 Portfolio Photos and ⚙️ Bio & Contact.

Sveltia remembers the token in your browser, so you won't paste it every time (just
when you use a new browser or clear your data).

---

## Giving Velisa her own access

1. Add her to the repo: https://github.com/satriozulkarnaen/Velisa → **Settings →
   Collaborators → Add people** → her GitHub username → she accepts the email invite.
2. She then creates **her own** token following Step 1 above (with **her** GitHub
   account), and signs in the same way.

Each person uses their own token — don't share yours.

---

## Using the panel

**📸 Portfolio Photos** → **Add** a photo (upload + short caption), remove with the
delete icon, drag to reorder → click **Save** (top right).

**⚙️ Bio & Contact** → edit name, tagline, bio, hero photo, and the Instagram /
TikTok / email handles → **Save**.

Every Save commits to your GitHub repo and the live site refreshes within a minute.

---

## Troubleshooting

- **"Failed to authenticate" / "Bad credentials":** the token was mistyped or
  expired. Make a fresh one (Step 1) and paste again.
- **"Not authorized" / can't see the repo:** the token's **Repository access** must
  include **Velisa**, and **Contents** must be **Read and write**.
- **Velisa can't get in:** she must be added as a collaborator AND use a token from
  her own account.
- **Token expired later:** just repeat Step 1 to generate a new one. Nothing else
  changes.

---

## A note on tokens vs. the fancy login

A personal access token is basically a long password scoped to just this one repo.
It's the standard, safe way to do this without running any login server. The only
upkeep is regenerating it if you set an expiry date — a 2-minute repeat of Step 1.
