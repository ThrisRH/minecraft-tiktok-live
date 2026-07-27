# donate_gifts.md

# TikTok Donate Gifts

This file contains the master list of supported TikTok gifts.

**Agent instruction:** Always read `donate_gifts.md` when generating or updating the Donate Event system. Do **not** hardcode gift names or IDs in source files. Use this file as the single source of truth for gift registration and mapping.

## Gift List

- Heart - 1
- Rose - 1 done
- TikTok - 1 done
- Rosa - 10 done
- Perfume - 20 u done
- Cap - 99 u done
- Doughnut - 30 u done
- Shamrock - gacha 10
- Glow Stick - 1
- Corgi - 299 done
- Confetti - Grande_finale

## Agent Requirements

- Read this file before generating code.
- Register every gift through the existing Registry/Factory system.
- Each gift must have its own reusable handler/action.
- Do not use long `switch`/`if` statements.
- Do not hardcode gift logic inside the dispatcher.
- Adding a new gift should only require updating this file and creating a new handler if needed.
