# donate_gifts.md

# TikTok Donate Gifts

This file contains the master list of supported TikTok gifts.

**Agent instruction:** Always read `donate_gifts.md` when generating or updating the Donate Event system. Do **not** hardcode gift names or IDs in source files. Use this file as the single source of truth for gift registration and mapping.

## Gift List

- Heart
- Rose
- TikTok
- Perfume

## Agent Requirements

- Read this file before generating code.
- Register every gift through the existing Registry/Factory system.
- Each gift must have its own reusable handler/action.
- Do not use long `switch`/`if` statements.
- Do not hardcode gift logic inside the dispatcher.
- Adding a new gift should only require updating this file and creating a new handler if needed.
