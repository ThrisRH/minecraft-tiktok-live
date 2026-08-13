# donate_gifts.md

# TikTok Donate Gifts

This file contains the master list of supported TikTok gifts.

**Agent instruction:** Always read `donate_gifts.md` when generating or updating the Donate Event system. Do **not** hardcode gift names or IDs in source files. Use this file as the single source of truth for gift registration and mapping.

## Gift List

- Rose - 1 done
- TikTok - 1 done
- Rosa - 10 done (Rosa Gacha)
- Perfume - 20 u done (5 Pillager)
- Cap - 99 u done
- Doughnut - 30 u done (Black hole)
- Shamrock - Vòng quay Shamrock Gacha mới
- Overreact / Heart / Heart Me - gacha 10 done+
- Corgi - 299 done (Corgi Dragon 5 phút + Actionbar HUD)
- Confetti - 100 Grande_finale done
- Finger Heart - 5 done (Gacha)
- Journey Pass - 10 done (Full Leather Armor)
- GG - 1 done (Fireworks)
- Little Kisses - Summon mutantmonsters:mutant_snow_golem
- Lucky Pig - Summon 3 minecraft:wolf với tên username (Owner, giáp ngực Netherite wolf armor)
- Money Gun - 30 u done (Wither Storm 10 phút)
- Boxing Gloves - Sự kiện Đáy Biển Sâu 5 phút (Teleport đại dương sâu, gây mù, thở dưới nước, nhìn rõ dưới nước)
- compress tnt

## Agent Requirements

- Read this file before generating code.
- Register every gift through the existing Registry/Factory system.
- Each gift must have its own reusable handler/action.
- Do not use long `switch`/`if` statements.
- Do not hardcode gift logic inside the dispatcher.
- Adding a new gift should only require updating this file and creating a new handler if needed.
