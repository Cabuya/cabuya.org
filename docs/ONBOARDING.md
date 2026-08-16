# Onboarding — your first run (cabuya.org)

This is the click-by-click version, written for someone who has **not** set up a
project like this before. If you already work with Docker and dev containers,
[Contributing](../CONTRIBUTING.md) is faster.

You do not need to understand the stack to get it running. That comes later.

---

## Stage 0 — Before you begin

You need three things installed. Nothing else.

### 1. Docker Desktop

A **container** is a small, disposable computer that runs inside yours. This
project ships one, already configured with the right Node version, package
manager and tools — so you never install those yourself, and your machine stays
clean.

Download it: **https://www.docker.com/products/docker-desktop/**

Install it, open it, and wait.

> **How you know it worked:** the whale icon in your menu bar (macOS) or system
> tray (Windows) stops animating, and Docker Desktop says *"Engine running"*.

### 2. An editor

Either works:

- **VS Code** — https://code.visualstudio.com/
- **Cursor** — https://cursor.com/

> **How you know it worked:** the application opens.

### 3. The "Dev Containers" extension

In your editor, click the **Extensions** icon in the left sidebar (it looks like
four squares). Search for **"Dev Containers"** — the one published by
**Microsoft**. Click **Install**.

> **How you know it worked:** the Install button changes to a gear icon or reads
> *"Installed"*.

---

## Stage 1 — Open the project

1. **Get the code.** In a terminal — the text panel where you type commands; in
   your editor it is `Terminal` menu → `New Terminal`:

   ```bash
   git clone https://github.com/pereira-tech-talks/CoragWeb.git
   cd CoragWeb
   ```

2. **Open the folder** in your editor: `File` → `Open Folder…` → select the
   `CoragWeb` folder.

   > **How you know it worked:** the file tree on the left shows folders like
   > `src`, `docs`, `public`.

---

## Stage 2 — Let the setup command check everything

Before doing anything by hand, ask the AI assistant in your editor:

```
/setup
```

(In Cursor or Codex, type `#setup` instead — those tools use `/` for their own
commands.)

This is a **doctor**. It:

- creates the local configuration files the project needs, without overwriting
  anything you already have,
- checks whether Docker, your editor and the extension are ready,
- tells you the single next thing to do, and
- is **safe to run as many times as you want** — finished items show ✅.

Work through whatever it asks, then run it again to watch the list turn green.
If you get stuck, type your question right there — *"I don't see the popup"*,
*"what is a container?"* — and it will walk you through it.

---

## Stage 3 — Reopen inside the container

When the folder opens, a notification usually appears in the bottom-right:

> *Folder contains a Dev Container configuration file…*

Click **Reopen in Container**.

Don't see it? Press `F1` (macOS `Cmd+Shift+P`, Windows/Linux `Ctrl+Shift+P`),
type **"Dev Containers: Reopen in Container"**, and pick it.

The first build takes a few minutes and prints a lot of logs. That is normal and
happens only once.

> **How you know it worked:** a green badge appears in the bottom-left corner of
> the editor reading **"Dev Container"**.

---

## Stage 4 — Run the site

Open a terminal inside the container (`Terminal` → `New Terminal`) and run:

```bash
install        # installs dependencies (first time only)
pnpm run dev   # starts the site
```

> **How you know it worked:** the terminal prints a URL. Open
> **http://localhost:7777** and you will see the site.

Leave that terminal running while you work. Changes you save appear in the
browser automatically.

---

## Stage 5 — What to run before you commit

Type `help` any time to see every command available inside the container.

The one that matters most:

```bash
codecheck
```

It auto-fixes formatting, regenerates images, runs the tests and audits
performance — stopping at the first problem. If `codecheck` passes, your change
is in good shape.

Before opening a pull request, also run the **content gates**, which catch
things unique to this project — a page whose Spanish and English versions
drifted apart, a missing Markdown twin, a redirect that swallows a live page:

```bash
pnpm run md:check:strict && pnpm run lang:check:strict && pnpm run seo:check:strict
pnpm run parity:check:strict && pnpm run redirects:check:strict
```

[Contributing](../CONTRIBUTING.md) explains what each one protects and why it
exists.

---

## Stage 6 — Your first change

1. **Never work on `main`.** Create a branch:
   ```bash
   gcob feat/my-first-change
   ```
   (`gcob` is a shortcut for `git checkout -b`.)
2. Make your change, then run `codecheck`.
3. Commit: `gc "feat(pages): describe your change"` — or ask the assistant for
   `/commit` and it writes the message for you.
4. Push: `gp`
5. Open a pull request against `main`. `/pr` drafts the description.

**Every change reaches `main` through a pull request.** No direct pushes.

---

## If something goes wrong

| What you see | What to do |
|---|---|
| The "Reopen in Container" popup never appears | Use `F1` → "Dev Containers: Reopen in Container" |
| The container build fails | Check Docker Desktop is running, then try again — the first build is the fragile one |
| `localhost:7777` shows nothing | Make sure `pnpm run dev` is still running in a terminal **inside** the container |
| A command is "not found" | You are probably in a terminal on your machine, not inside the container. Look for the green badge bottom-left |
| Anything else | Run `/setup` again — it re-checks everything and points at the first problem |

Still stuck? Open an issue. A question that took you an hour is a documentation
bug, and we would rather fix it than have the next person lose the same hour.
