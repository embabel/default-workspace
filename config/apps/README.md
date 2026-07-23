# apps/

World-level HTML apps that ship with the default world template. These
are read-only from the user's perspective — they get refreshed whenever the
default world template is updated and applied.

User-created apps (vibe-coded) live in `data/apps/` instead. The app server
checks `data/apps/{name}` first, falling back to this directory, so a user can
"shadow" any world app by creating one with the same name.
