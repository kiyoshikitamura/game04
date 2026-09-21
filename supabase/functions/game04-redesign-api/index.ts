// src/domain/redesign/growthMaster.ts
var GROWTH_VERSION = "APPROVED_GROWTH_V1_20260921";
var EXP_SIZES = ["small", "medium", "large", "xlarge"];
var EXP_VALUES = { small: 100, medium: 1e3, large: 5e3, xlarge: 2e4 };
var SOUL_UNLOCK = { N: 20, R: 40, SR: 60, SSR: 80 };
var AWAKENING_SOULS = { N: [4, 6, 8, 10, 12], R: [8, 12, 16, 20, 24], SR: [12, 18, 24, 30, 36], SSR: [20, 30, 40, 50, 60] };
var LB_STEPS = [1, 2, 3, 4, 5, 6, 8, 10, 12, 15];
var SKILL_LB_FACTORS = { N: 1, R: 2, SR: 4, SSR: 8 };
var EQUIPMENT_LB_FACTORS = { N: 1, R: 2, SR: 3, SSR: 6 };
var DUPLICATE_SKILL_MATERIALS = { N: 1, R: 2, SR: 5, SSR: 20 };
var DISMANTLE_MATERIALS = DUPLICATE_SKILL_MATERIALS;
var EXP_TOTALS = { character: { N: 3e5, R: 45e4, SR: 75e4, SSR: 12e5 }, equipment: { N: 18e4, R: 27e4, SR: 45e4, SSR: 72e4 } };
function cumulativeExp(kind, rarity, level) {
  if (!Number.isInteger(level) || level < 1 || level > 100) throw new Error("Lv\u304C\u4E0D\u6B63\u3067\u3059\u3002");
  return level === 100 ? EXP_TOTALS[kind][rarity] : 10 * Math.floor(EXP_TOTALS[kind][rarity] * Math.pow((level - 1) / 99, 2.2) / 10 + 0.5);
}
function cumulativeCash(kind, rarity, level) {
  const exp = cumulativeExp(kind, rarity, level);
  return kind === "character" ? exp : Math.floor(exp / 2);
}
function playerCumulativeExp(level) {
  let exp = 0;
  for (let l = 1; l < Math.min(100, level); l++) exp += (l + 9) ** 2;
  return exp;
}
function applyPlayerExperience(level, exp, gain, energy, energyMax) {
  if (!Number.isSafeInteger(gain) || gain < 0) throw new Error("\u30D7\u30EC\u30A4\u30E4\u30FCEXP\u304C\u4E0D\u6B63\u3067\u3059\u3002");
  const nextExp = level >= 100 ? exp : Math.min(playerCumulativeExp(100), exp + gain);
  let nextLevel = level;
  while (nextLevel < 100 && nextExp >= playerCumulativeExp(nextLevel + 1)) nextLevel++;
  return { level: nextLevel, exp: nextExp, energy: nextLevel > level ? Math.max(energy, energyMax) : energy };
}
function emptyGrowthInventory() {
  return { expItems: { character: { small: 0, medium: 0, large: 0, xlarge: 0 }, equipment: { small: 0, medium: 0, large: 0, xlarge: 0 } }, carryExp: { character: 0, equipment: 0 }, genericSouls: { N: 0, R: 0, SR: 0, SSR: 0 }, soulSelectors: { N: 0, R: 0, SR: 0, SSR: 0 } };
}

// src/domain/redesign/growthReward.ts
var RARITIES = ["N", "R", "SR", "SSR"];
function isGrowthRewardKind(kind) {
  return ["character_exp_item", "equipment_exp_item", "generic_soul", "soul_selector"].includes(kind);
}
function grantGrowthReward(original, reward) {
  if (!Number.isSafeInteger(reward.amount) || reward.amount < 0) throw new Error("\u5831\u916C\u6570\u91CF\u304C\u4E0D\u6B63\u3067\u3059");
  const state = structuredClone(original);
  state.growthInventory ??= emptyGrowthInventory();
  const inventory = state.growthInventory;
  const add = (old) => {
    const total = old + reward.amount;
    if (!Number.isSafeInteger(old) || old < 0 || !Number.isSafeInteger(total)) throw new Error("\u80B2\u6210\u30A2\u30A4\u30C6\u30E0\u6B8B\u9AD8\u304C\u4E0D\u6B63\u3067\u3059");
    return total;
  };
  if (reward.kind === "character_exp_item" || reward.kind === "equipment_exp_item") {
    if (!EXP_SIZES.includes(reward.id)) throw new Error("EXP\u30A2\u30A4\u30C6\u30E0\u306E\u7A2E\u985E\u304C\u4E0D\u6B63\u3067\u3059");
    const target = reward.kind === "character_exp_item" ? "character" : "equipment";
    const size = reward.id;
    inventory.expItems[target][size] = add(inventory.expItems[target][size]);
  } else if (reward.kind === "generic_soul" || reward.kind === "soul_selector") {
    if (!RARITIES.includes(reward.id)) throw new Error("\u9B42\u30A2\u30A4\u30C6\u30E0\u306E\u30EC\u30A2\u30EA\u30C6\u30A3\u304C\u4E0D\u6B63\u3067\u3059");
    const target = reward.kind === "generic_soul" ? "genericSouls" : "soulSelectors";
    const rarity = reward.id;
    inventory[target][rarity] = add(inventory[target][rarity]);
  } else throw new Error("\u80B2\u6210\u5831\u916C\u306E\u7A2E\u985E\u304C\u4E0D\u6B63\u3067\u3059");
  return state;
}

// src/domain/redesign/data/balance-v2.json
var balance_v2_default = {
  version: "PREVIEW_PROVISIONAL_BALANCE_V2_20260920",
  status: "PREVIEW_PROVISIONAL",
  sourceSha256: "f2a900b2a62bd25c23de0667c7c5c62fb45edb08467f58fe6aed74dfa4302a7e",
  assignments: [
    {
      id: "char_ageha_01",
      name: "\u8C4A\u81E3\u79C0\u5409",
      rarity: "SSR",
      element: "light",
      role: "\u56DE\u5FA9",
      passiveType: "P10"
    },
    {
      id: "char_go_01",
      name: "\u6B66\u7530\u4FE1\u7384",
      rarity: "SSR",
      element: "fire",
      role: "\u653B\u5B88\u517C\u4EFB",
      passiveType: "P16"
    },
    {
      id: "char_kaede_01",
      name: "\u771F\u7530\u5E78\u6751",
      rarity: "SSR",
      element: "fire",
      role: "\u80CC\u6C34\u653B\u6483",
      passiveType: "P14"
    },
    {
      id: "char_karen_01",
      name: "\u5FB3\u5DDD\u5BB6\u5EB7",
      rarity: "SSR",
      element: "earth",
      role: "\u9632\u5FA1\u652F\u63F4",
      passiveType: "P02"
    },
    {
      id: "char_kengo_01",
      name: "\u672C\u591A\u5FE0\u52DD",
      rarity: "SSR",
      element: "earth",
      role: "\u53CD\u6483\u5B88\u5099",
      passiveType: "P13"
    },
    {
      id: "char_koharu_01",
      name: "\u4E0A\u6749\u8B19\u4FE1",
      rarity: "SSR",
      element: "water",
      role: "\u5358\u4F53\u653B\u6483",
      passiveType: "P06"
    },
    {
      id: "char_leo_01",
      name: "\u4F0A\u9054\u653F\u5B97",
      rarity: "SSR",
      element: "wind",
      role: "\u5168\u4F53\u653B\u6483",
      passiveType: "P07"
    },
    {
      id: "char_mio_01",
      name: "\u524D\u7530\u6176\u6B21",
      rarity: "SSR",
      element: "wind",
      role: "\u901A\u5E38\u653B\u6483",
      passiveType: "P05"
    },
    {
      id: "char_miyabi_01",
      name: "\u660E\u667A\u5149\u79C0",
      rarity: "SSR",
      element: "dark",
      role: "\u5F31\u4F53\u5229\u7528\u653B\u6483",
      passiveType: "P08"
    },
    {
      id: "char_reiji_01",
      name: "\u7E54\u7530\u4FE1\u9577",
      rarity: "SSR",
      element: "fire",
      role: "\u653B\u6483\u652F\u63F4",
      passiveType: "P01"
    },
    {
      id: "char_cecile_01",
      name: "\u4E95\u4F0A\u76F4\u864E",
      rarity: "SR",
      element: "water",
      role: "\u7D99\u6226\u5B88\u5099",
      passiveType: "P11"
    },
    {
      id: "char_genji_01",
      name: "\u4ECA\u5DDD\u7FA9\u5143",
      rarity: "SR",
      element: "wind",
      role: "\u9632\u5FA1\u652F\u63F4",
      passiveType: "P02"
    },
    {
      id: "char_leon_01",
      name: "\u52A0\u85E4\u6E05\u6B63",
      rarity: "SR",
      element: "earth",
      role: "\u5B88\u5099",
      passiveType: "P15"
    },
    {
      id: "char_lucas_01",
      name: "\u5CF6\u6D25\u7FA9\u5F18",
      rarity: "SR",
      element: "fire",
      role: "\u80CC\u6C34\u653B\u6483",
      passiveType: "P14"
    },
    {
      id: "char_maya_01",
      name: "\u670D\u90E8\u534A\u8535",
      rarity: "SR",
      element: "dark",
      role: "\u72B6\u614B\u5229\u7528\u653B\u6483",
      passiveType: "P09"
    },
    {
      id: "char_noa_01",
      name: "\u67F4\u7530\u52DD\u5BB6",
      rarity: "SR",
      element: "earth",
      role: "\u901A\u5E38\u653B\u6483",
      passiveType: "P05"
    },
    {
      id: "char_reina_01",
      name: "\u6BDB\u5229\u5143\u5C31",
      rarity: "SR",
      element: "wind",
      role: "\u6DF7\u6210\u653B\u6483",
      passiveType: "P03"
    },
    {
      id: "char_riki_01",
      name: "\u6FC3\u59EB",
      rarity: "SR",
      element: "dark",
      role: "\u4FDD\u8B77\u652F\u63F4",
      passiveType: "P12"
    },
    {
      id: "char_rui_01",
      name: "\u76F4\u6C5F\u517C\u7D9A",
      rarity: "SR",
      element: "water",
      role: "\u653B\u6483\u652F\u63F4",
      passiveType: "P01"
    },
    {
      id: "char_sakura_01",
      name: "\u771F\u7530\u660C\u5E78",
      rarity: "SR",
      element: "fire",
      role: "\u4FDD\u8B77\u652F\u63F4",
      passiveType: "P12"
    },
    {
      id: "char_seiya_01",
      name: "\u77F3\u7530\u4E09\u6210",
      rarity: "SR",
      element: "light",
      role: "\u6DF7\u6210\u5B88\u5099",
      passiveType: "P04"
    },
    {
      id: "char_sora_01",
      name: "\u7ACB\u82B1\u8ABE\u5343\u4EE3",
      rarity: "SR",
      element: "light",
      role: "\u5168\u4F53\u653B\u6483",
      passiveType: "P07"
    },
    {
      id: "char_taiga_01",
      name: "\u9577\u5B97\u6211\u90E8\u5143\u89AA",
      rarity: "SR",
      element: "water",
      role: "\u653B\u5B88\u517C\u4EFB",
      passiveType: "P16"
    },
    {
      id: "char_takuro_01",
      name: "\u96D1\u8CC0\u5B6B\u5E02",
      rarity: "SR",
      element: "wind",
      role: "\u5358\u4F53\u653B\u6483",
      passiveType: "P06"
    },
    {
      id: "char_tetsu_01",
      name: "\u9ED2\u7530\u5B98\u5175\u885B",
      rarity: "SR",
      element: "dark",
      role: "\u5F31\u4F53\u5229\u7528\u653B\u6483",
      passiveType: "P08"
    },
    {
      id: "char_aoi_01",
      name: "\u304A\u5E02\u306E\u65B9",
      rarity: "R",
      element: "fire",
      role: "\u56DE\u5FA9",
      passiveType: "P10"
    },
    {
      id: "char_chang_01",
      name: "\u4E0A\u6749\u666F\u52DD",
      rarity: "R",
      element: "water",
      role: "\u9632\u5FA1\u652F\u63F4",
      passiveType: "P02"
    },
    {
      id: "char_daimon_01",
      name: "\u4E95\u4F0A\u76F4\u653F",
      rarity: "R",
      element: "fire",
      role: "\u5358\u4F53\u653B\u6483",
      passiveType: "P06"
    },
    {
      id: "char_jihoon_01",
      name: "\u524D\u7530\u5229\u5BB6",
      rarity: "R",
      element: "earth",
      role: "\u901A\u5E38\u653B\u6483",
      passiveType: "P05"
    },
    {
      id: "char_joe_01",
      name: "\u5317\u6761\u6C0F\u5EB7",
      rarity: "R",
      element: "earth",
      role: "\u5B88\u5099",
      passiveType: "P15"
    },
    {
      id: "char_kaito_01",
      name: "\u5927\u53CB\u5B97\u9E9F",
      rarity: "R",
      element: "light",
      role: "\u653B\u6483\u652F\u63F4",
      passiveType: "P01"
    },
    {
      id: "char_makoto_01",
      name: "\u5C0F\u65E9\u5DDD\u9686\u666F",
      rarity: "R",
      element: "water",
      role: "\u6DF7\u6210\u653B\u6483",
      passiveType: "P03"
    },
    {
      id: "char_mark_01",
      name: "\u5C0F\u677E\u59EB",
      rarity: "R",
      element: "fire",
      role: "\u53CD\u6483\u5B88\u5099",
      passiveType: "P13"
    },
    {
      id: "char_mei_01",
      name: "\u5C71\u672C\u52D8\u52A9",
      rarity: "R",
      element: "fire",
      role: "\u5F31\u4F53\u5229\u7528\u653B\u6483",
      passiveType: "P08"
    },
    {
      id: "char_minami_01",
      name: "\u5CF6\u5DE6\u8FD1",
      rarity: "R",
      element: "earth",
      role: "\u653B\u5B88\u517C\u4EFB",
      passiveType: "P16"
    },
    {
      id: "char_momoko_01",
      name: "\u5CF6\u6D25\u7FA9\u4E45",
      rarity: "R",
      element: "fire",
      role: "\u9632\u5FA1\u652F\u63F4",
      passiveType: "P02"
    },
    {
      id: "char_ren_01",
      name: "\u658E\u85E4\u9053\u4E09",
      rarity: "R",
      element: "dark",
      role: "\u72B6\u614B\u5229\u7528\u653B\u6483",
      passiveType: "P09"
    },
    {
      id: "char_ren_male_01",
      name: "\u672C\u9858\u5BFA\u9855\u5982",
      rarity: "R",
      element: "earth",
      role: "\u56DE\u5FA9",
      passiveType: "P10"
    },
    {
      id: "char_rin_01",
      name: "\u6B66\u7530\u52DD\u983C",
      rarity: "R",
      element: "fire",
      role: "\u80CC\u6C34\u653B\u6483",
      passiveType: "P14"
    },
    {
      id: "char_serika_01",
      name: "\u6D45\u4E95\u9577\u653F",
      rarity: "R",
      element: "wind",
      role: "\u7D99\u6226\u5B88\u5099",
      passiveType: "P11"
    },
    {
      id: "char_shin_01",
      name: "\u7247\u5009\u666F\u7DB1",
      rarity: "R",
      element: "wind",
      role: "\u4FDD\u8B77\u652F\u63F4",
      passiveType: "P12"
    },
    {
      id: "char_shion_01",
      name: "\u7532\u6590\u59EB",
      rarity: "R",
      element: "water",
      role: "\u53CD\u6483\u5B88\u5099",
      passiveType: "P13"
    },
    {
      id: "char_yuji_01",
      name: "\u7ACB\u82B1\u5B97\u8302",
      rarity: "R",
      element: "light",
      role: "\u5358\u4F53\u653B\u6483",
      passiveType: "P06"
    },
    {
      id: "char_yuki_01",
      name: "\u7AF9\u4E2D\u534A\u5175\u885B",
      rarity: "R",
      element: "light",
      role: "\u6DF7\u6210\u5B88\u5099",
      passiveType: "P04"
    },
    {
      id: "char_yukina_01",
      name: "\u7D30\u5DDD\u30AC\u30E9\u30B7\u30E3",
      rarity: "R",
      element: "light",
      role: "\u56DE\u5FA9",
      passiveType: "P10"
    }
  ],
  skills: [
    {
      designId: "SKD001",
      id: "qa_balance_v2_skd001",
      name: "\u4F4E\u6D88\u8CBB\u5358\u4F53\u653B\u6483\u30FB\u706B",
      rarity: "N",
      element: "fire",
      sp0: 25,
      sp10: 25,
      effects0: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 105,
          unit: "%"
        }
      ],
      effects10: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 150,
          unit: "%"
        }
      ],
      duration: null,
      targetDescription: "\u5148\u982D\u6575",
      legacyId: null,
      imageStatus: "UNMAPPED_PLACEHOLDER"
    },
    {
      designId: "SKD002",
      id: "qa_balance_v2_skd002",
      name: "\u4F4E\u6D88\u8CBB\u5358\u4F53\u653B\u6483\u30FB\u6C34",
      rarity: "N",
      element: "water",
      sp0: 25,
      sp10: 25,
      effects0: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 105,
          unit: "%"
        }
      ],
      effects10: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 150,
          unit: "%"
        }
      ],
      duration: null,
      targetDescription: "\u5148\u982D\u6575",
      legacyId: null,
      imageStatus: "UNMAPPED_PLACEHOLDER"
    },
    {
      designId: "SKD003",
      id: "qa_balance_v2_skd003",
      name: "\u4F4E\u6D88\u8CBB\u5358\u4F53\u653B\u6483\u30FB\u571F",
      rarity: "N",
      element: "earth",
      sp0: 25,
      sp10: 25,
      effects0: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 105,
          unit: "%"
        }
      ],
      effects10: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 150,
          unit: "%"
        }
      ],
      duration: null,
      targetDescription: "\u5148\u982D\u6575",
      legacyId: null,
      imageStatus: "UNMAPPED_PLACEHOLDER"
    },
    {
      designId: "SKD004",
      id: "qa_balance_v2_skd004",
      name: "\u4F4E\u6D88\u8CBB\u5358\u4F53\u653B\u6483\u30FB\u98A8",
      rarity: "N",
      element: "wind",
      sp0: 25,
      sp10: 25,
      effects0: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 105,
          unit: "%"
        }
      ],
      effects10: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 150,
          unit: "%"
        }
      ],
      duration: null,
      targetDescription: "\u5148\u982D\u6575",
      legacyId: null,
      imageStatus: "UNMAPPED_PLACEHOLDER"
    },
    {
      designId: "SKD005",
      id: "qa_balance_v2_skd005",
      name: "\u4F4E\u6D88\u8CBB\u5358\u4F53\u653B\u6483\u30FB\u5149",
      rarity: "N",
      element: "light",
      sp0: 25,
      sp10: 25,
      effects0: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 105,
          unit: "%"
        }
      ],
      effects10: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 150,
          unit: "%"
        }
      ],
      duration: null,
      targetDescription: "\u5148\u982D\u6575",
      legacyId: null,
      imageStatus: "UNMAPPED_PLACEHOLDER"
    },
    {
      designId: "SKD006",
      id: "qa_balance_v2_skd006",
      name: "\u4F4E\u6D88\u8CBB\u5358\u4F53\u653B\u6483\u30FB\u95C7",
      rarity: "N",
      element: "dark",
      sp0: 25,
      sp10: 25,
      effects0: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 105,
          unit: "%"
        }
      ],
      effects10: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 150,
          unit: "%"
        }
      ],
      duration: null,
      targetDescription: "\u5148\u982D\u6575",
      legacyId: null,
      imageStatus: "UNMAPPED_PLACEHOLDER"
    },
    {
      designId: "SKD007",
      id: "qa_balance_v2_skd007",
      name: "\u6A19\u6E96\u5358\u4F53\u653B\u6483\u30FB\u706B",
      rarity: "R",
      element: "fire",
      sp0: 50,
      sp10: 50,
      effects0: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 120,
          unit: "%"
        }
      ],
      effects10: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 200,
          unit: "%"
        }
      ],
      duration: null,
      targetDescription: "\u5148\u982D\u6575",
      legacyId: null,
      imageStatus: "UNMAPPED_PLACEHOLDER"
    },
    {
      designId: "SKD008",
      id: "qa_balance_v2_skd008",
      name: "\u6A19\u6E96\u5358\u4F53\u653B\u6483\u30FB\u6C34",
      rarity: "R",
      element: "water",
      sp0: 50,
      sp10: 50,
      effects0: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 120,
          unit: "%"
        }
      ],
      effects10: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 200,
          unit: "%"
        }
      ],
      duration: null,
      targetDescription: "\u5148\u982D\u6575",
      legacyId: null,
      imageStatus: "UNMAPPED_PLACEHOLDER"
    },
    {
      designId: "SKD009",
      id: "qa_balance_v2_skd009",
      name: "\u6A19\u6E96\u5358\u4F53\u653B\u6483\u30FB\u571F",
      rarity: "R",
      element: "earth",
      sp0: 50,
      sp10: 50,
      effects0: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 120,
          unit: "%"
        }
      ],
      effects10: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 200,
          unit: "%"
        }
      ],
      duration: null,
      targetDescription: "\u5148\u982D\u6575",
      legacyId: null,
      imageStatus: "UNMAPPED_PLACEHOLDER"
    },
    {
      designId: "SKD010",
      id: "qa_balance_v2_skd010",
      name: "\u6A19\u6E96\u5358\u4F53\u653B\u6483\u30FB\u98A8",
      rarity: "R",
      element: "wind",
      sp0: 50,
      sp10: 50,
      effects0: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 120,
          unit: "%"
        }
      ],
      effects10: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 200,
          unit: "%"
        }
      ],
      duration: null,
      targetDescription: "\u5148\u982D\u6575",
      legacyId: null,
      imageStatus: "UNMAPPED_PLACEHOLDER"
    },
    {
      designId: "SKD011",
      id: "qa_balance_v2_skd011",
      name: "\u6A19\u6E96\u5358\u4F53\u653B\u6483\u30FB\u5149",
      rarity: "R",
      element: "light",
      sp0: 50,
      sp10: 50,
      effects0: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 120,
          unit: "%"
        }
      ],
      effects10: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 200,
          unit: "%"
        }
      ],
      duration: null,
      targetDescription: "\u5148\u982D\u6575",
      legacyId: null,
      imageStatus: "UNMAPPED_PLACEHOLDER"
    },
    {
      designId: "SKD012",
      id: "qa_balance_v2_skd012",
      name: "\u6A19\u6E96\u5358\u4F53\u653B\u6483\u30FB\u95C7",
      rarity: "R",
      element: "dark",
      sp0: 50,
      sp10: 50,
      effects0: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 120,
          unit: "%"
        }
      ],
      effects10: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 200,
          unit: "%"
        }
      ],
      duration: null,
      targetDescription: "\u5148\u982D\u6575",
      legacyId: null,
      imageStatus: "UNMAPPED_PLACEHOLDER"
    },
    {
      designId: "SKD013",
      id: "qa_balance_v2_skd013",
      name: "\u9AD8\u5A01\u529B\u5358\u4F53\u653B\u6483\u30FB\u706B",
      rarity: "SSR",
      element: "fire",
      sp0: 150,
      sp10: 150,
      effects0: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 150,
          unit: "%"
        }
      ],
      effects10: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 300,
          unit: "%"
        }
      ],
      duration: null,
      targetDescription: "\u5148\u982D\u6575",
      legacyId: null,
      imageStatus: "UNMAPPED_PLACEHOLDER"
    },
    {
      designId: "SKD014",
      id: "qa_balance_v2_skd014",
      name: "\u9AD8\u5A01\u529B\u5358\u4F53\u653B\u6483\u30FB\u6C34",
      rarity: "SSR",
      element: "water",
      sp0: 150,
      sp10: 150,
      effects0: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 150,
          unit: "%"
        }
      ],
      effects10: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 300,
          unit: "%"
        }
      ],
      duration: null,
      targetDescription: "\u5148\u982D\u6575",
      legacyId: null,
      imageStatus: "UNMAPPED_PLACEHOLDER"
    },
    {
      designId: "SKD015",
      id: "qa_balance_v2_skd015",
      name: "\u9AD8\u5A01\u529B\u5358\u4F53\u653B\u6483\u30FB\u571F",
      rarity: "SSR",
      element: "earth",
      sp0: 150,
      sp10: 150,
      effects0: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 150,
          unit: "%"
        }
      ],
      effects10: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 300,
          unit: "%"
        }
      ],
      duration: null,
      targetDescription: "\u5148\u982D\u6575",
      legacyId: null,
      imageStatus: "UNMAPPED_PLACEHOLDER"
    },
    {
      designId: "SKD016",
      id: "qa_balance_v2_skd016",
      name: "\u9AD8\u5A01\u529B\u5358\u4F53\u653B\u6483\u30FB\u98A8",
      rarity: "SSR",
      element: "wind",
      sp0: 150,
      sp10: 150,
      effects0: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 150,
          unit: "%"
        }
      ],
      effects10: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 300,
          unit: "%"
        }
      ],
      duration: null,
      targetDescription: "\u5148\u982D\u6575",
      legacyId: null,
      imageStatus: "UNMAPPED_PLACEHOLDER"
    },
    {
      designId: "SKD017",
      id: "qa_balance_v2_skd017",
      name: "\u9AD8\u5A01\u529B\u5358\u4F53\u653B\u6483\u30FB\u5149",
      rarity: "SSR",
      element: "light",
      sp0: 150,
      sp10: 150,
      effects0: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 150,
          unit: "%"
        }
      ],
      effects10: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 300,
          unit: "%"
        }
      ],
      duration: null,
      targetDescription: "\u5148\u982D\u6575",
      legacyId: null,
      imageStatus: "UNMAPPED_PLACEHOLDER"
    },
    {
      designId: "SKD018",
      id: "qa_balance_v2_skd018",
      name: "\u9AD8\u5A01\u529B\u5358\u4F53\u653B\u6483\u30FB\u95C7",
      rarity: "SSR",
      element: "dark",
      sp0: 150,
      sp10: 150,
      effects0: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 150,
          unit: "%"
        }
      ],
      effects10: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 300,
          unit: "%"
        }
      ],
      duration: null,
      targetDescription: "\u5148\u982D\u6575",
      legacyId: null,
      imageStatus: "UNMAPPED_PLACEHOLDER"
    },
    {
      designId: "SKD019",
      id: "qa_balance_v2_skd019",
      name: "\u5168\u4F53\u653B\u6483\u30FB\u706B",
      rarity: "R",
      element: "fire",
      sp0: 75,
      sp10: 75,
      effects0: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 60,
          unit: "%"
        }
      ],
      effects10: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 100,
          unit: "%"
        }
      ],
      duration: null,
      targetDescription: "\u6575\u5168\u4F53",
      legacyId: null,
      imageStatus: "UNMAPPED_PLACEHOLDER"
    },
    {
      designId: "SKD020",
      id: "qa_balance_v2_skd020",
      name: "\u5168\u4F53\u653B\u6483\u30FB\u6C34",
      rarity: "R",
      element: "water",
      sp0: 75,
      sp10: 75,
      effects0: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 60,
          unit: "%"
        }
      ],
      effects10: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 100,
          unit: "%"
        }
      ],
      duration: null,
      targetDescription: "\u6575\u5168\u4F53",
      legacyId: null,
      imageStatus: "UNMAPPED_PLACEHOLDER"
    },
    {
      designId: "SKD021",
      id: "qa_balance_v2_skd021",
      name: "\u5168\u4F53\u653B\u6483\u30FB\u571F",
      rarity: "R",
      element: "earth",
      sp0: 75,
      sp10: 75,
      effects0: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 60,
          unit: "%"
        }
      ],
      effects10: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 100,
          unit: "%"
        }
      ],
      duration: null,
      targetDescription: "\u6575\u5168\u4F53",
      legacyId: null,
      imageStatus: "UNMAPPED_PLACEHOLDER"
    },
    {
      designId: "SKD022",
      id: "qa_balance_v2_skd022",
      name: "\u5168\u4F53\u653B\u6483\u30FB\u98A8",
      rarity: "R",
      element: "wind",
      sp0: 75,
      sp10: 75,
      effects0: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 60,
          unit: "%"
        }
      ],
      effects10: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 100,
          unit: "%"
        }
      ],
      duration: null,
      targetDescription: "\u6575\u5168\u4F53",
      legacyId: null,
      imageStatus: "UNMAPPED_PLACEHOLDER"
    },
    {
      designId: "SKD023",
      id: "qa_balance_v2_skd023",
      name: "\u5168\u4F53\u653B\u6483\u30FB\u5149",
      rarity: "R",
      element: "light",
      sp0: 75,
      sp10: 75,
      effects0: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 60,
          unit: "%"
        }
      ],
      effects10: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 100,
          unit: "%"
        }
      ],
      duration: null,
      targetDescription: "\u6575\u5168\u4F53",
      legacyId: null,
      imageStatus: "UNMAPPED_PLACEHOLDER"
    },
    {
      designId: "SKD024",
      id: "qa_balance_v2_skd024",
      name: "\u5168\u4F53\u653B\u6483\u30FB\u95C7",
      rarity: "R",
      element: "dark",
      sp0: 75,
      sp10: 75,
      effects0: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 60,
          unit: "%"
        }
      ],
      effects10: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 100,
          unit: "%"
        }
      ],
      duration: null,
      targetDescription: "\u6575\u5168\u4F53",
      legacyId: null,
      imageStatus: "UNMAPPED_PLACEHOLDER"
    },
    {
      designId: "SKD025",
      id: "qa_balance_v2_skd025",
      name: "\u7D05\u84EE\u306E\u5927\u8A08",
      rarity: "SSR",
      element: "fire",
      sp0: 170,
      sp10: 170,
      effects0: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 90,
          unit: "%"
        }
      ],
      effects10: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 150,
          unit: "%"
        }
      ],
      duration: null,
      targetDescription: "\u6575\u5168\u4F53",
      legacyId: null,
      imageStatus: "UNMAPPED_PLACEHOLDER"
    },
    {
      designId: "SKD026",
      id: "qa_balance_v2_skd026",
      name: "\u5F8C\u9663\u5C04\u3061",
      rarity: "R",
      element: "wind",
      sp0: 55,
      sp10: 55,
      effects0: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 105,
          unit: "%"
        }
      ],
      effects10: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 180,
          unit: "%"
        }
      ],
      duration: null,
      targetDescription: "\u6700\u5F8C\u5C3E\u306E\u751F\u5B58\u6575",
      legacyId: null,
      imageStatus: "UNMAPPED_PLACEHOLDER"
    },
    {
      designId: "SKD027",
      id: "qa_balance_v2_skd027",
      name: "\u8FFD\u3044\u8A0E\u3061",
      rarity: "R",
      element: "dark",
      sp0: 50,
      sp10: 50,
      effects0: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 110,
          unit: "%"
        }
      ],
      effects10: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 190,
          unit: "%"
        }
      ],
      duration: null,
      targetDescription: "\u6B8BHP\u5B9F\u6570\u6700\u5C0F\u306E\u6575",
      legacyId: null,
      imageStatus: "UNMAPPED_PLACEHOLDER"
    },
    {
      designId: "SKD028",
      id: "qa_balance_v2_skd028",
      name: "\u5D29\u3057\u8A0E\u3061",
      rarity: "SR",
      element: "earth",
      sp0: 100,
      sp10: 100,
      effects0: [
        {
          label: "\u901A\u5E38\u500D\u7387",
          value: 110,
          unit: "%"
        },
        {
          label: "\u6761\u4EF6\u500D\u7387",
          value: 140,
          unit: "%"
        }
      ],
      effects10: [
        {
          label: "\u901A\u5E38\u500D\u7387",
          value: 180,
          unit: "%"
        },
        {
          label: "\u6761\u4EF6\u500D\u7387",
          value: 250,
          unit: "%"
        }
      ],
      duration: null,
      targetDescription: "\u5148\u982D\u6575",
      legacyId: null,
      imageStatus: "UNMAPPED_PLACEHOLDER"
    },
    {
      designId: "SKD029",
      id: "qa_balance_v2_skd029",
      name: "\u6BD2\u5203",
      rarity: "R",
      element: "dark",
      sp0: 65,
      sp10: 65,
      effects0: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 80,
          unit: "%"
        },
        {
          label: "\u7D99\u7D9A\u30C0\u30E1\u30FC\u30B8\u500D\u7387",
          value: 10,
          unit: "%"
        }
      ],
      effects10: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 130,
          unit: "%"
        },
        {
          label: "\u7D99\u7D9A\u30C0\u30E1\u30FC\u30B8\u500D\u7387",
          value: 20,
          unit: "%"
        }
      ],
      duration: 3,
      targetDescription: "\u5148\u982D\u6575",
      legacyId: null,
      imageStatus: "UNMAPPED_PLACEHOLDER"
    },
    {
      designId: "SKD030",
      id: "qa_balance_v2_skd030",
      name: "\u8755\u307F\u8A0E\u3061",
      rarity: "SR",
      element: "dark",
      sp0: 100,
      sp10: 100,
      effects0: [
        {
          label: "\u901A\u5E38\u500D\u7387",
          value: 110,
          unit: "%"
        },
        {
          label: "\u6761\u4EF6\u500D\u7387",
          value: 145,
          unit: "%"
        }
      ],
      effects10: [
        {
          label: "\u901A\u5E38\u500D\u7387",
          value: 180,
          unit: "%"
        },
        {
          label: "\u6761\u4EF6\u500D\u7387",
          value: 260,
          unit: "%"
        }
      ],
      duration: null,
      targetDescription: "\u5148\u982D\u6575",
      legacyId: null,
      imageStatus: "UNMAPPED_PLACEHOLDER"
    },
    {
      designId: "SKD031",
      id: "qa_balance_v2_skd031",
      name: "\u80CC\u6C34\u65AC\u308A",
      rarity: "SR",
      element: "fire",
      sp0: 100,
      sp10: 100,
      effects0: [
        {
          label: "\u901A\u5E38\u500D\u7387",
          value: 110,
          unit: "%"
        },
        {
          label: "\u6761\u4EF6\u500D\u7387",
          value: 150,
          unit: "%"
        }
      ],
      effects10: [
        {
          label: "\u901A\u5E38\u500D\u7387",
          value: 180,
          unit: "%"
        },
        {
          label: "\u6761\u4EF6\u500D\u7387",
          value: 270,
          unit: "%"
        }
      ],
      duration: null,
      targetDescription: "\u5148\u982D\u6575",
      legacyId: null,
      imageStatus: "UNMAPPED_PLACEHOLDER"
    },
    {
      designId: "SKD032",
      id: "qa_balance_v2_skd032",
      name: "\u5F71\u7E2B\u3044",
      rarity: "R",
      element: "water",
      sp0: 65,
      sp10: 65,
      effects0: [
        {
          label: "\u4ED8\u4E0E\u7387",
          value: 35,
          unit: "%"
        }
      ],
      effects10: [
        {
          label: "\u4ED8\u4E0E\u7387",
          value: 55,
          unit: "%"
        }
      ],
      duration: 1,
      targetDescription: "\u914D\u7F6E\u9806\u6700\u521D\u306E\u4ED8\u4E0E\u53EF\u80FD\u6575",
      legacyId: null,
      imageStatus: "UNMAPPED_PLACEHOLDER"
    },
    {
      designId: "SKD033",
      id: "qa_balance_v2_skd033",
      name: "\u6C17\u5408",
      rarity: "N",
      element: "fire",
      sp0: 30,
      sp10: 30,
      effects0: [
        {
          label: "ATK\u5F37\u5316",
          value: 8,
          unit: "%"
        }
      ],
      effects10: [
        {
          label: "ATK\u5F37\u5316",
          value: 15,
          unit: "%"
        }
      ],
      duration: 3,
      targetDescription: "\u81EA\u8EAB",
      legacyId: null,
      imageStatus: "UNMAPPED_PLACEHOLDER"
    },
    {
      designId: "SKD034",
      id: "qa_balance_v2_skd034",
      name: "\u8EAB\u69CB\u3048",
      rarity: "N",
      element: "earth",
      sp0: 30,
      sp10: 30,
      effects0: [
        {
          label: "DEF\u5F37\u5316",
          value: 15,
          unit: "%"
        }
      ],
      effects10: [
        {
          label: "DEF\u5F37\u5316",
          value: 30,
          unit: "%"
        }
      ],
      duration: 3,
      targetDescription: "\u81EA\u8EAB",
      legacyId: null,
      imageStatus: "UNMAPPED_PLACEHOLDER"
    },
    {
      designId: "SKD035",
      id: "qa_balance_v2_skd035",
      name: "\u9B28\u306E\u58F0",
      rarity: "R",
      element: "fire",
      sp0: 75,
      sp10: 75,
      effects0: [
        {
          label: "ATK\u5F37\u5316",
          value: 8,
          unit: "%"
        }
      ],
      effects10: [
        {
          label: "ATK\u5F37\u5316",
          value: 15,
          unit: "%"
        }
      ],
      duration: 3,
      targetDescription: "\u5473\u65B9\u5168\u4F53\u306E\u4ED8\u4E0E\u53EF\u80FD\u8005",
      legacyId: null,
      imageStatus: "UNMAPPED_PLACEHOLDER"
    },
    {
      designId: "SKD036",
      id: "qa_balance_v2_skd036",
      name: "\u5B88\u308A\u306E\u9663",
      rarity: "R",
      element: "light",
      sp0: 75,
      sp10: 75,
      effects0: [
        {
          label: "DEF\u5F37\u5316",
          value: 15,
          unit: "%"
        }
      ],
      effects10: [
        {
          label: "DEF\u5F37\u5316",
          value: 30,
          unit: "%"
        }
      ],
      duration: 3,
      targetDescription: "\u5473\u65B9\u5168\u4F53\u306E\u4ED8\u4E0E\u53EF\u80FD\u8005",
      legacyId: null,
      imageStatus: "UNMAPPED_PLACEHOLDER"
    },
    {
      designId: "SKD037",
      id: "qa_balance_v2_skd037",
      name: "\u5A01\u5727",
      rarity: "R",
      element: "dark",
      sp0: 50,
      sp10: 50,
      effects0: [
        {
          label: "ATK\u4F4E\u4E0B",
          value: 10,
          unit: "%"
        }
      ],
      effects10: [
        {
          label: "ATK\u4F4E\u4E0B",
          value: 20,
          unit: "%"
        }
      ],
      duration: 3,
      targetDescription: "\u6226\u95D8\u4E2DATK\u6700\u5927\u306E\u4ED8\u4E0E\u53EF\u80FD\u6575",
      legacyId: null,
      imageStatus: "UNMAPPED_PLACEHOLDER"
    },
    {
      designId: "SKD038",
      id: "qa_balance_v2_skd038",
      name: "\u93A7\u7815\u304D",
      rarity: "R",
      element: "earth",
      sp0: 50,
      sp10: 50,
      effects0: [
        {
          label: "DEF\u4F4E\u4E0B",
          value: 12,
          unit: "%"
        }
      ],
      effects10: [
        {
          label: "DEF\u4F4E\u4E0B",
          value: 25,
          unit: "%"
        }
      ],
      duration: 3,
      targetDescription: "\u914D\u7F6E\u9806\u6700\u521D\u306E\u4ED8\u4E0E\u53EF\u80FD\u6575",
      legacyId: null,
      imageStatus: "UNMAPPED_PLACEHOLDER"
    },
    {
      designId: "SKD039",
      id: "qa_balance_v2_skd039",
      name: "\u5FDC\u6025\u624B\u5F53",
      rarity: "N",
      element: "water",
      sp0: 35,
      sp10: 35,
      effects0: [
        {
          label: "\u56DE\u5FA9\u500D\u7387",
          value: 35,
          unit: "%"
        }
      ],
      effects10: [
        {
          label: "\u56DE\u5FA9\u500D\u7387",
          value: 65,
          unit: "%"
        }
      ],
      duration: null,
      targetDescription: "\u5171\u901A\u5358\u4F53\u56DE\u5FA9\u6761\u4EF6",
      legacyId: null,
      imageStatus: "UNMAPPED_PLACEHOLDER"
    },
    {
      designId: "SKD040",
      id: "qa_balance_v2_skd040",
      name: "\u6CBB\u7652\u306E\u7948\u308A",
      rarity: "SR",
      element: "water",
      sp0: 90,
      sp10: 90,
      effects0: [
        {
          label: "\u56DE\u5FA9\u500D\u7387",
          value: 75,
          unit: "%"
        }
      ],
      effects10: [
        {
          label: "\u56DE\u5FA9\u500D\u7387",
          value: 150,
          unit: "%"
        }
      ],
      duration: null,
      targetDescription: "\u5171\u901A\u5358\u4F53\u56DE\u5FA9\u6761\u4EF6",
      legacyId: null,
      imageStatus: "UNMAPPED_PLACEHOLDER"
    },
    {
      designId: "SKD041",
      id: "qa_balance_v2_skd041",
      name: "\u5C0F\u4F11\u6B62",
      rarity: "R",
      element: "light",
      sp0: 90,
      sp10: 90,
      effects0: [
        {
          label: "\u56DE\u5FA9\u500D\u7387",
          value: 20,
          unit: "%"
        }
      ],
      effects10: [
        {
          label: "\u56DE\u5FA9\u500D\u7387",
          value: 40,
          unit: "%"
        }
      ],
      duration: null,
      targetDescription: "\u5171\u901A\u5168\u4F53\u56DE\u5FA9\u6761\u4EF6",
      legacyId: null,
      imageStatus: "UNMAPPED_PLACEHOLDER"
    },
    {
      designId: "SKD042",
      id: "qa_balance_v2_skd042",
      name: "\u6148\u611B\u306E\u5927\u7948\u7977",
      rarity: "SSR",
      element: "light",
      sp0: 190,
      sp10: 190,
      effects0: [
        {
          label: "\u56DE\u5FA9\u500D\u7387",
          value: 45,
          unit: "%"
        }
      ],
      effects10: [
        {
          label: "\u56DE\u5FA9\u500D\u7387",
          value: 90,
          unit: "%"
        }
      ],
      duration: null,
      targetDescription: "\u5171\u901A\u5168\u4F53\u56DE\u5FA9\u6761\u4EF6",
      legacyId: null,
      imageStatus: "UNMAPPED_PLACEHOLDER"
    },
    {
      designId: "SKD043",
      id: "qa_balance_v2_skd043",
      name: "\u518D\u751F\u306E\u7948\u308A",
      rarity: "R",
      element: "water",
      sp0: 65,
      sp10: 65,
      effects0: [
        {
          label: "\u7D99\u7D9A\u56DE\u5FA9\u500D\u7387",
          value: 15,
          unit: "%"
        }
      ],
      effects10: [
        {
          label: "\u7D99\u7D9A\u56DE\u5FA9\u500D\u7387",
          value: 30,
          unit: "%"
        }
      ],
      duration: 3,
      targetDescription: "HP\u304C\u6E1B\u3063\u305F\u4ED8\u4E0E\u53EF\u80FD\u5473\u65B9\u306E\u6B8BHP\u5272\u5408\u6700\u4F4E",
      legacyId: null,
      imageStatus: "UNMAPPED_PLACEHOLDER"
    },
    {
      designId: "SKD044",
      id: "qa_balance_v2_skd044",
      name: "\u8607\u751F\u306E\u7948\u308A",
      rarity: "SR",
      element: "light",
      sp0: 180,
      sp10: 180,
      effects0: [
        {
          label: "\u8607\u751FHP\u5272\u5408",
          value: 20,
          unit: "%"
        }
      ],
      effects10: [
        {
          label: "\u8607\u751FHP\u5272\u5408",
          value: 35,
          unit: "%"
        }
      ],
      duration: null,
      targetDescription: "\u914D\u7F6E\u9806\u6700\u521D\u306E\u6226\u95D8\u4E0D\u80FD\u5473\u65B9",
      legacyId: null,
      imageStatus: "UNMAPPED_PLACEHOLDER"
    },
    {
      designId: "SKD045",
      id: "qa_balance_v2_skd045",
      name: "\u8B77\u8EAB\u969C\u58C1",
      rarity: "R",
      element: "earth",
      sp0: 55,
      sp10: 55,
      effects0: [
        {
          label: "\u30B7\u30FC\u30EB\u30C9\u500D\u7387",
          value: 50,
          unit: "%"
        }
      ],
      effects10: [
        {
          label: "\u30B7\u30FC\u30EB\u30C9\u500D\u7387",
          value: 100,
          unit: "%"
        }
      ],
      duration: 3,
      targetDescription: "\u81EA\u8EAB",
      legacyId: null,
      imageStatus: "UNMAPPED_PLACEHOLDER"
    },
    {
      designId: "SKD046",
      id: "qa_balance_v2_skd046",
      name: "\u5B88\u8B77\u306E\u672D",
      rarity: "SR",
      element: "light",
      sp0: 75,
      sp10: 75,
      effects0: [
        {
          label: "\u30B7\u30FC\u30EB\u30C9\u500D\u7387",
          value: 65,
          unit: "%"
        }
      ],
      effects10: [
        {
          label: "\u30B7\u30FC\u30EB\u30C9\u500D\u7387",
          value: 130,
          unit: "%"
        }
      ],
      duration: 3,
      targetDescription: "\u4ED8\u4E0E\u53EF\u80FD\u5473\u65B9\u306E\u6B8BHP\u5272\u5408\u6700\u4F4E",
      legacyId: null,
      imageStatus: "UNMAPPED_PLACEHOLDER"
    },
    {
      designId: "SKD047",
      id: "qa_balance_v2_skd047",
      name: "\u7D50\u754C\u306E\u9663",
      rarity: "SSR",
      element: "light",
      sp0: 180,
      sp10: 180,
      effects0: [
        {
          label: "\u30B7\u30FC\u30EB\u30C9\u500D\u7387",
          value: 35,
          unit: "%"
        }
      ],
      effects10: [
        {
          label: "\u30B7\u30FC\u30EB\u30C9\u500D\u7387",
          value: 70,
          unit: "%"
        }
      ],
      duration: 3,
      targetDescription: "\u5473\u65B9\u5168\u4F53\u306E\u4ED8\u4E0E\u53EF\u80FD\u8005",
      legacyId: null,
      imageStatus: "UNMAPPED_PLACEHOLDER"
    },
    {
      designId: "SKD048",
      id: "qa_balance_v2_skd048",
      name: "\u6311\u767A",
      rarity: "R",
      element: "fire",
      sp0: 40,
      sp10: 32,
      effects0: [
        {
          label: "\u4ED8\u4E0E\u7387",
          value: 100,
          unit: "%"
        }
      ],
      effects10: [
        {
          label: "\u4ED8\u4E0E\u7387",
          value: 100,
          unit: "%"
        }
      ],
      duration: 3,
      targetDescription: "\u81EA\u8EAB",
      legacyId: null,
      imageStatus: "UNMAPPED_PLACEHOLDER"
    },
    {
      designId: "SKD049",
      id: "qa_balance_v2_skd049",
      name: "\u8FD4\u3057\u5203",
      rarity: "R",
      element: "wind",
      sp0: 65,
      sp10: 65,
      effects0: [
        {
          label: "\u53CD\u6483\u500D\u7387",
          value: 45,
          unit: "%"
        }
      ],
      effects10: [
        {
          label: "\u53CD\u6483\u500D\u7387",
          value: 80,
          unit: "%"
        }
      ],
      duration: 3,
      targetDescription: "\u81EA\u8EAB",
      legacyId: null,
      imageStatus: "UNMAPPED_PLACEHOLDER"
    },
    {
      designId: "SKD050",
      id: "qa_balance_v2_skd050",
      name: "\u8FCE\u6483\u306E\u69CB\u3048",
      rarity: "SSR",
      element: "earth",
      sp0: 110,
      sp10: 110,
      effects0: [
        {
          label: "\u4ED8\u4E0E\u7387",
          value: 100,
          unit: "%"
        },
        {
          label: "\u53CD\u6483\u500D\u7387",
          value: 55,
          unit: "%"
        }
      ],
      effects10: [
        {
          label: "\u4ED8\u4E0E\u7387",
          value: 100,
          unit: "%"
        },
        {
          label: "\u53CD\u6483\u500D\u7387",
          value: 100,
          unit: "%"
        }
      ],
      duration: 3,
      targetDescription: "\u81EA\u8EAB",
      legacyId: null,
      imageStatus: "UNMAPPED_PLACEHOLDER"
    },
    {
      designId: "SKD051",
      id: "qa_balance_v2_skd051",
      name: "\u7834\u52E2",
      rarity: "R",
      element: "wind",
      sp0: 45,
      sp10: 36,
      effects0: [
        {
          label: "\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        }
      ],
      effects10: [
        {
          label: "\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        }
      ],
      duration: null,
      targetDescription: "\u80FD\u529B\u5F37\u5316\u304C\u3042\u308B\u914D\u7F6E\u9806\u6700\u521D\u306E\u6575",
      legacyId: null,
      imageStatus: "UNMAPPED_PLACEHOLDER"
    },
    {
      designId: "SKD052",
      id: "qa_balance_v2_skd052",
      name: "\u7834\u8B77",
      rarity: "R",
      element: "dark",
      sp0: 45,
      sp10: 36,
      effects0: [
        {
          label: "\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        }
      ],
      effects10: [
        {
          label: "\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        }
      ],
      duration: null,
      targetDescription: "\u4FDD\u8B77\u72B6\u614B\u304C\u3042\u308B\u914D\u7F6E\u9806\u6700\u521D\u306E\u6575",
      legacyId: null,
      imageStatus: "UNMAPPED_PLACEHOLDER"
    },
    {
      designId: "SKD053",
      id: "qa_balance_v2_skd053",
      name: "\u596E\u8D77",
      rarity: "R",
      element: "fire",
      sp0: 40,
      sp10: 32,
      effects0: [
        {
          label: "\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        }
      ],
      effects10: [
        {
          label: "\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        }
      ],
      duration: null,
      targetDescription: "\u80FD\u529B\u4F4E\u4E0B\u304C\u3042\u308B\u914D\u7F6E\u9806\u6700\u521D\u306E\u5473\u65B9",
      legacyId: null,
      imageStatus: "UNMAPPED_PLACEHOLDER"
    },
    {
      designId: "SKD054",
      id: "qa_balance_v2_skd054",
      name: "\u6D44\u6BD2",
      rarity: "R",
      element: "water",
      sp0: 40,
      sp10: 32,
      effects0: [
        {
          label: "\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        }
      ],
      effects10: [
        {
          label: "\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        }
      ],
      duration: null,
      targetDescription: "\u7D99\u7D9A\u30C0\u30E1\u30FC\u30B8\u304C\u3042\u308B\u914D\u7F6E\u9806\u6700\u521D\u306E\u5473\u65B9",
      legacyId: null,
      imageStatus: "UNMAPPED_PLACEHOLDER"
    },
    {
      designId: "SKD055",
      id: "qa_balance_v2_skd055",
      name: "\u89E3\u7E1B",
      rarity: "R",
      element: "light",
      sp0: 55,
      sp10: 44,
      effects0: [
        {
          label: "\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        }
      ],
      effects10: [
        {
          label: "\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        }
      ],
      duration: null,
      targetDescription: "\u884C\u52D5\u4E0D\u80FD\u306E\u914D\u7F6E\u9806\u6700\u521D\u306E\u5473\u65B9",
      legacyId: null,
      imageStatus: "UNMAPPED_PLACEHOLDER"
    },
    {
      designId: "SKD056",
      id: "qa_balance_v2_skd056",
      name: "\u7834\u9663\u6483",
      rarity: "SSR",
      element: "wind",
      sp0: 135,
      sp10: 135,
      effects0: [
        {
          label: "\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        },
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 120,
          unit: "%"
        }
      ],
      effects10: [
        {
          label: "\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        },
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 220,
          unit: "%"
        }
      ],
      duration: null,
      targetDescription: "\u5148\u982D\u6575",
      legacyId: null,
      imageStatus: "UNMAPPED_PLACEHOLDER"
    },
    {
      designId: "SKD057",
      id: "qa_balance_v2_skd057",
      name: "\u5F8C\u9663\u5D29\u3057",
      rarity: "SR",
      element: "wind",
      sp0: 115,
      sp10: 115,
      effects0: [
        {
          label: "DEF\u4F4E\u4E0B",
          value: 10,
          unit: "%"
        },
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 110,
          unit: "%"
        }
      ],
      effects10: [
        {
          label: "DEF\u4F4E\u4E0B",
          value: 20,
          unit: "%"
        },
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 200,
          unit: "%"
        }
      ],
      duration: 3,
      targetDescription: "\u6700\u5F8C\u5C3E\u306E\u751F\u5B58\u6575",
      legacyId: null,
      imageStatus: "UNMAPPED_PLACEHOLDER"
    },
    {
      designId: "SKD058",
      id: "qa_balance_v2_skd058",
      name: "\u8755\u307F\u306E\u9663",
      rarity: "SR",
      element: "dark",
      sp0: 110,
      sp10: 110,
      effects0: [
        {
          label: "\u7D99\u7D9A\u30C0\u30E1\u30FC\u30B8\u500D\u7387",
          value: 12,
          unit: "%"
        }
      ],
      effects10: [
        {
          label: "\u7D99\u7D9A\u30C0\u30E1\u30FC\u30B8\u500D\u7387",
          value: 25,
          unit: "%"
        }
      ],
      duration: 3,
      targetDescription: "\u6575\u5168\u4F53\u306E\u4ED8\u4E0E\u53EF\u80FD\u8005",
      legacyId: null,
      imageStatus: "UNMAPPED_PLACEHOLDER"
    },
    {
      designId: "SKD059",
      id: "qa_balance_v2_skd059",
      name: "\u5D29\u9663\u306E\u6CE2",
      rarity: "SR",
      element: "water",
      sp0: 130,
      sp10: 130,
      effects0: [
        {
          label: "\u901A\u5E38\u500D\u7387",
          value: 65,
          unit: "%"
        },
        {
          label: "\u6761\u4EF6\u500D\u7387",
          value: 85,
          unit: "%"
        }
      ],
      effects10: [
        {
          label: "\u901A\u5E38\u500D\u7387",
          value: 100,
          unit: "%"
        },
        {
          label: "\u6761\u4EF6\u500D\u7387",
          value: 145,
          unit: "%"
        }
      ],
      duration: null,
      targetDescription: "\u6575\u5168\u4F53",
      legacyId: null,
      imageStatus: "UNMAPPED_PLACEHOLDER"
    },
    {
      designId: "SKD060",
      id: "qa_balance_v2_skd060",
      name: "\u80CC\u6C34\u306E\u8599\u304E",
      rarity: "SR",
      element: "earth",
      sp0: 130,
      sp10: 130,
      effects0: [
        {
          label: "\u901A\u5E38\u500D\u7387",
          value: 65,
          unit: "%"
        },
        {
          label: "\u6761\u4EF6\u500D\u7387",
          value: 90,
          unit: "%"
        }
      ],
      effects10: [
        {
          label: "\u901A\u5E38\u500D\u7387",
          value: 100,
          unit: "%"
        },
        {
          label: "\u6761\u4EF6\u500D\u7387",
          value: 155,
          unit: "%"
        }
      ],
      duration: null,
      targetDescription: "\u6575\u5168\u4F53",
      legacyId: null,
      imageStatus: "UNMAPPED_PLACEHOLDER"
    },
    {
      designId: "SKD061",
      id: "qa_balance_v2_skd061",
      name: "\u596E\u6226\u306E\u6A84",
      rarity: "R",
      element: "fire",
      sp0: 45,
      sp10: 45,
      effects0: [
        {
          label: "ATK\u5F37\u5316",
          value: 10,
          unit: "%"
        }
      ],
      effects10: [
        {
          label: "ATK\u5F37\u5316",
          value: 20,
          unit: "%"
        }
      ],
      duration: 3,
      targetDescription: "\u4ED8\u4E0E\u53EF\u80FD\u5473\u65B9\u306E\u30AD\u30E3\u30E9\uFF0B\u88C5\u5099ATK\u6700\u5927",
      legacyId: null,
      imageStatus: "UNMAPPED_PLACEHOLDER"
    },
    {
      designId: "SKD062",
      id: "qa_balance_v2_skd062",
      name: "\u5805\u5B88\u306E\u672D",
      rarity: "R",
      element: "earth",
      sp0: 45,
      sp10: 45,
      effects0: [
        {
          label: "DEF\u5F37\u5316",
          value: 20,
          unit: "%"
        }
      ],
      effects10: [
        {
          label: "DEF\u5F37\u5316",
          value: 40,
          unit: "%"
        }
      ],
      duration: 3,
      targetDescription: "\u914D\u7F6E\u9806\u6700\u521D\u306E\u4ED8\u4E0E\u53EF\u80FD\u5473\u65B9",
      legacyId: null,
      imageStatus: "UNMAPPED_PLACEHOLDER"
    },
    {
      designId: "SKD063",
      id: "qa_balance_v2_skd063",
      name: "\u7834\u7532\u306E\u9663",
      rarity: "SR",
      element: "dark",
      sp0: 100,
      sp10: 100,
      effects0: [
        {
          label: "DEF\u4F4E\u4E0B",
          value: 15,
          unit: "%"
        }
      ],
      effects10: [
        {
          label: "DEF\u4F4E\u4E0B",
          value: 30,
          unit: "%"
        }
      ],
      duration: 3,
      targetDescription: "\u6575\u5168\u4F53\u306E\u4ED8\u4E0E\u53EF\u80FD\u8005",
      legacyId: null,
      imageStatus: "UNMAPPED_PLACEHOLDER"
    },
    {
      designId: "SKD064",
      id: "qa_balance_v2_skd064",
      name: "\u5A01\u5727\u306E\u9663",
      rarity: "SR",
      element: "water",
      sp0: 100,
      sp10: 100,
      effects0: [
        {
          label: "ATK\u4F4E\u4E0B",
          value: 10,
          unit: "%"
        }
      ],
      effects10: [
        {
          label: "ATK\u4F4E\u4E0B",
          value: 20,
          unit: "%"
        }
      ],
      duration: 3,
      targetDescription: "\u6575\u5168\u4F53\u306E\u4ED8\u4E0E\u53EF\u80FD\u8005",
      legacyId: null,
      imageStatus: "UNMAPPED_PLACEHOLDER"
    },
    {
      designId: "SKD065",
      id: "qa_balance_v2_skd065",
      name: "\u5C01\u9663",
      rarity: "SR",
      element: "water",
      sp0: 135,
      sp10: 135,
      effects0: [
        {
          label: "\u4ED8\u4E0E\u7387",
          value: 30,
          unit: "%"
        }
      ],
      effects10: [
        {
          label: "\u4ED8\u4E0E\u7387",
          value: 50,
          unit: "%"
        }
      ],
      duration: 1,
      targetDescription: "\u6575\u5168\u4F53\u306E\u4ED8\u4E0E\u53EF\u80FD\u8005",
      legacyId: null,
      imageStatus: "UNMAPPED_PLACEHOLDER"
    },
    {
      designId: "SKD066",
      id: "qa_balance_v2_skd066",
      name: "\u8ECD\u795E\u306E\u53F7\u4EE4",
      rarity: "SSR",
      element: "fire",
      sp0: 150,
      sp10: 150,
      effects0: [
        {
          label: "ATK\u5F37\u5316",
          value: 15,
          unit: "%"
        },
        {
          label: "DEF\u5F37\u5316",
          value: 15,
          unit: "%"
        }
      ],
      effects10: [
        {
          label: "ATK\u5F37\u5316",
          value: 30,
          unit: "%"
        },
        {
          label: "DEF\u5F37\u5316",
          value: 30,
          unit: "%"
        }
      ],
      duration: 3,
      targetDescription: "\u5473\u65B9\u5168\u4F53\u306E\u4ED8\u4E0E\u53EF\u80FD\u8005",
      legacyId: null,
      imageStatus: "UNMAPPED_PLACEHOLDER"
    },
    {
      designId: "SKD067",
      id: "qa_balance_v2_skd067",
      name: "\u518D\u751F\u306E\u9663",
      rarity: "SR",
      element: "water",
      sp0: 135,
      sp10: 135,
      effects0: [
        {
          label: "\u7D99\u7D9A\u56DE\u5FA9\u500D\u7387",
          value: 10,
          unit: "%"
        }
      ],
      effects10: [
        {
          label: "\u7D99\u7D9A\u56DE\u5FA9\u500D\u7387",
          value: 20,
          unit: "%"
        }
      ],
      duration: 3,
      targetDescription: "HP\u304C\u6E1B\u3063\u305F\u5473\u65B9\u306B\u4ED8\u4E0E\u53EF\u80FD\u8005\u304C\u3044\u308C\u3070\u751F\u5B58\u5473\u65B9\u5168\u4F53",
      legacyId: null,
      imageStatus: "UNMAPPED_PLACEHOLDER"
    },
    {
      designId: "SKD068",
      id: "qa_balance_v2_skd068",
      name: "\u6551\u8B77\u306E\u672D",
      rarity: "SR",
      element: "light",
      sp0: 120,
      sp10: 120,
      effects0: [
        {
          label: "\u56DE\u5FA9\u500D\u7387",
          value: 55,
          unit: "%"
        },
        {
          label: "\u30B7\u30FC\u30EB\u30C9\u500D\u7387",
          value: 35,
          unit: "%"
        }
      ],
      effects10: [
        {
          label: "\u56DE\u5FA9\u500D\u7387",
          value: 100,
          unit: "%"
        },
        {
          label: "\u30B7\u30FC\u30EB\u30C9\u500D\u7387",
          value: 70,
          unit: "%"
        }
      ],
      duration: 3,
      targetDescription: "\u5171\u901A\u5358\u4F53\u56DE\u5FA9\u6761\u4EF6\u3067\u9078\u3093\u3060\u540C\u3058\u5473\u65B9",
      legacyId: null,
      imageStatus: "UNMAPPED_PLACEHOLDER"
    },
    {
      designId: "SKD069",
      id: "qa_balance_v2_skd069",
      name: "\u8FD4\u3057\u306E\u53F7\u4EE4",
      rarity: "SR",
      element: "wind",
      sp0: 80,
      sp10: 80,
      effects0: [
        {
          label: "\u53CD\u6483\u500D\u7387",
          value: 45,
          unit: "%"
        }
      ],
      effects10: [
        {
          label: "\u53CD\u6483\u500D\u7387",
          value: 85,
          unit: "%"
        }
      ],
      duration: 3,
      targetDescription: "\u4ED8\u4E0E\u53EF\u80FD\u306A\u88AB\u5F3E\u8A98\u5C0E\u8005\u512A\u5148\u3001\u306A\u3051\u308C\u3070\u914D\u7F6E\u9806",
      legacyId: null,
      imageStatus: "UNMAPPED_PLACEHOLDER"
    },
    {
      designId: "SKD070",
      id: "qa_balance_v2_skd070",
      name: "\u6E05\u3081\u306E\u624B\u5F53",
      rarity: "R",
      element: "water",
      sp0: 65,
      sp10: 65,
      effects0: [
        {
          label: "\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        },
        {
          label: "\u56DE\u5FA9\u500D\u7387",
          value: 30,
          unit: "%"
        }
      ],
      effects10: [
        {
          label: "\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        },
        {
          label: "\u56DE\u5FA9\u500D\u7387",
          value: 60,
          unit: "%"
        }
      ],
      duration: null,
      targetDescription: "\u7D99\u7D9A\u30C0\u30E1\u30FC\u30B8\u5BFE\u8C61\u512A\u5148\u3001\u306A\u3051\u308C\u3070\u5171\u901A\u5358\u4F53\u56DE\u5FA9\u6761\u4EF6",
      legacyId: null,
      imageStatus: "UNMAPPED_PLACEHOLDER"
    },
    {
      designId: "SKD071",
      id: "qa_balance_v2_skd071",
      name: "\u5927\u7953\u3044",
      rarity: "SSR",
      element: "light",
      sp0: 140,
      sp10: 112,
      effects0: [
        {
          label: "\u80FD\u529B\u4F4E\u4E0B\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        },
        {
          label: "\u7D99\u7D9A\u30C0\u30E1\u30FC\u30B8\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        }
      ],
      effects10: [
        {
          label: "\u80FD\u529B\u4F4E\u4E0B\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        },
        {
          label: "\u7D99\u7D9A\u30C0\u30E1\u30FC\u30B8\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        }
      ],
      duration: null,
      targetDescription: "\u5473\u65B9\u5168\u4F53\u30FB1\u4EBA\u3067\u3082\u8A72\u5F53\u72B6\u614B\u3042\u308A",
      legacyId: null,
      imageStatus: "UNMAPPED_PLACEHOLDER"
    },
    {
      designId: "SKD072",
      id: "qa_balance_v2_skd072",
      name: "\u7834\u52E2\u306E\u4E00\u9583",
      rarity: "SSR",
      element: "wind",
      sp0: 135,
      sp10: 135,
      effects0: [
        {
          label: "\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        },
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 120,
          unit: "%"
        }
      ],
      effects10: [
        {
          label: "\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        },
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 220,
          unit: "%"
        }
      ],
      duration: null,
      targetDescription: "\u5148\u982D\u6575",
      legacyId: null,
      imageStatus: "UNMAPPED_PLACEHOLDER"
    }
  ],
  lbDisplayRows: [
    {
      designId: "SKD001",
      lb: 0,
      sp: 25,
      burstSp: 13,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 105,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD001",
      lb: 1,
      sp: 25,
      burstSp: 13,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 107.53,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD001",
      lb: 2,
      sp: 25,
      burstSp: 13,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 111.02,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD001",
      lb: 3,
      sp: 25,
      burstSp: 13,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 114.99,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD001",
      lb: 4,
      sp: 25,
      burstSp: 13,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 119.31,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD001",
      lb: 5,
      sp: 25,
      burstSp: 13,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 123.92,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD001",
      lb: 6,
      sp: 25,
      burstSp: 13,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 128.76,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD001",
      lb: 7,
      sp: 25,
      burstSp: 13,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 133.81,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD001",
      lb: 8,
      sp: 25,
      burstSp: 13,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 139.05,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD001",
      lb: 9,
      sp: 25,
      burstSp: 13,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 144.45,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD001",
      lb: 10,
      sp: 25,
      burstSp: 13,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 150,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD002",
      lb: 0,
      sp: 25,
      burstSp: 13,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 105,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD002",
      lb: 1,
      sp: 25,
      burstSp: 13,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 107.53,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD002",
      lb: 2,
      sp: 25,
      burstSp: 13,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 111.02,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD002",
      lb: 3,
      sp: 25,
      burstSp: 13,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 114.99,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD002",
      lb: 4,
      sp: 25,
      burstSp: 13,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 119.31,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD002",
      lb: 5,
      sp: 25,
      burstSp: 13,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 123.92,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD002",
      lb: 6,
      sp: 25,
      burstSp: 13,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 128.76,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD002",
      lb: 7,
      sp: 25,
      burstSp: 13,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 133.81,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD002",
      lb: 8,
      sp: 25,
      burstSp: 13,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 139.05,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD002",
      lb: 9,
      sp: 25,
      burstSp: 13,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 144.45,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD002",
      lb: 10,
      sp: 25,
      burstSp: 13,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 150,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD003",
      lb: 0,
      sp: 25,
      burstSp: 13,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 105,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD003",
      lb: 1,
      sp: 25,
      burstSp: 13,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 107.53,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD003",
      lb: 2,
      sp: 25,
      burstSp: 13,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 111.02,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD003",
      lb: 3,
      sp: 25,
      burstSp: 13,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 114.99,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD003",
      lb: 4,
      sp: 25,
      burstSp: 13,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 119.31,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD003",
      lb: 5,
      sp: 25,
      burstSp: 13,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 123.92,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD003",
      lb: 6,
      sp: 25,
      burstSp: 13,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 128.76,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD003",
      lb: 7,
      sp: 25,
      burstSp: 13,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 133.81,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD003",
      lb: 8,
      sp: 25,
      burstSp: 13,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 139.05,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD003",
      lb: 9,
      sp: 25,
      burstSp: 13,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 144.45,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD003",
      lb: 10,
      sp: 25,
      burstSp: 13,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 150,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD004",
      lb: 0,
      sp: 25,
      burstSp: 13,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 105,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD004",
      lb: 1,
      sp: 25,
      burstSp: 13,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 107.53,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD004",
      lb: 2,
      sp: 25,
      burstSp: 13,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 111.02,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD004",
      lb: 3,
      sp: 25,
      burstSp: 13,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 114.99,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD004",
      lb: 4,
      sp: 25,
      burstSp: 13,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 119.31,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD004",
      lb: 5,
      sp: 25,
      burstSp: 13,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 123.92,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD004",
      lb: 6,
      sp: 25,
      burstSp: 13,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 128.76,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD004",
      lb: 7,
      sp: 25,
      burstSp: 13,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 133.81,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD004",
      lb: 8,
      sp: 25,
      burstSp: 13,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 139.05,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD004",
      lb: 9,
      sp: 25,
      burstSp: 13,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 144.45,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD004",
      lb: 10,
      sp: 25,
      burstSp: 13,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 150,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD005",
      lb: 0,
      sp: 25,
      burstSp: 13,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 105,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD005",
      lb: 1,
      sp: 25,
      burstSp: 13,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 107.53,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD005",
      lb: 2,
      sp: 25,
      burstSp: 13,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 111.02,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD005",
      lb: 3,
      sp: 25,
      burstSp: 13,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 114.99,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD005",
      lb: 4,
      sp: 25,
      burstSp: 13,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 119.31,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD005",
      lb: 5,
      sp: 25,
      burstSp: 13,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 123.92,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD005",
      lb: 6,
      sp: 25,
      burstSp: 13,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 128.76,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD005",
      lb: 7,
      sp: 25,
      burstSp: 13,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 133.81,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD005",
      lb: 8,
      sp: 25,
      burstSp: 13,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 139.05,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD005",
      lb: 9,
      sp: 25,
      burstSp: 13,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 144.45,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD005",
      lb: 10,
      sp: 25,
      burstSp: 13,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 150,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD006",
      lb: 0,
      sp: 25,
      burstSp: 13,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 105,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD006",
      lb: 1,
      sp: 25,
      burstSp: 13,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 107.53,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD006",
      lb: 2,
      sp: 25,
      burstSp: 13,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 111.02,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD006",
      lb: 3,
      sp: 25,
      burstSp: 13,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 114.99,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD006",
      lb: 4,
      sp: 25,
      burstSp: 13,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 119.31,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD006",
      lb: 5,
      sp: 25,
      burstSp: 13,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 123.92,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD006",
      lb: 6,
      sp: 25,
      burstSp: 13,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 128.76,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD006",
      lb: 7,
      sp: 25,
      burstSp: 13,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 133.81,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD006",
      lb: 8,
      sp: 25,
      burstSp: 13,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 139.05,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD006",
      lb: 9,
      sp: 25,
      burstSp: 13,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 144.45,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD006",
      lb: 10,
      sp: 25,
      burstSp: 13,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 150,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD007",
      lb: 0,
      sp: 50,
      burstSp: 25,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 120,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD007",
      lb: 1,
      sp: 50,
      burstSp: 25,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 124.5,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD007",
      lb: 2,
      sp: 50,
      burstSp: 25,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 130.7,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD007",
      lb: 3,
      sp: 50,
      burstSp: 25,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 137.76,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD007",
      lb: 4,
      sp: 50,
      burstSp: 25,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 145.45,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD007",
      lb: 5,
      sp: 50,
      burstSp: 25,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 153.64,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD007",
      lb: 6,
      sp: 50,
      burstSp: 25,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 162.25,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD007",
      lb: 7,
      sp: 50,
      burstSp: 25,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 171.22,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD007",
      lb: 8,
      sp: 50,
      burstSp: 25,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 180.53,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD007",
      lb: 9,
      sp: 50,
      burstSp: 25,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 190.13,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD007",
      lb: 10,
      sp: 50,
      burstSp: 25,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 200,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD008",
      lb: 0,
      sp: 50,
      burstSp: 25,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 120,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD008",
      lb: 1,
      sp: 50,
      burstSp: 25,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 124.5,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD008",
      lb: 2,
      sp: 50,
      burstSp: 25,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 130.7,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD008",
      lb: 3,
      sp: 50,
      burstSp: 25,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 137.76,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD008",
      lb: 4,
      sp: 50,
      burstSp: 25,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 145.45,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD008",
      lb: 5,
      sp: 50,
      burstSp: 25,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 153.64,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD008",
      lb: 6,
      sp: 50,
      burstSp: 25,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 162.25,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD008",
      lb: 7,
      sp: 50,
      burstSp: 25,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 171.22,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD008",
      lb: 8,
      sp: 50,
      burstSp: 25,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 180.53,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD008",
      lb: 9,
      sp: 50,
      burstSp: 25,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 190.13,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD008",
      lb: 10,
      sp: 50,
      burstSp: 25,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 200,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD009",
      lb: 0,
      sp: 50,
      burstSp: 25,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 120,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD009",
      lb: 1,
      sp: 50,
      burstSp: 25,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 124.5,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD009",
      lb: 2,
      sp: 50,
      burstSp: 25,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 130.7,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD009",
      lb: 3,
      sp: 50,
      burstSp: 25,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 137.76,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD009",
      lb: 4,
      sp: 50,
      burstSp: 25,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 145.45,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD009",
      lb: 5,
      sp: 50,
      burstSp: 25,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 153.64,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD009",
      lb: 6,
      sp: 50,
      burstSp: 25,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 162.25,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD009",
      lb: 7,
      sp: 50,
      burstSp: 25,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 171.22,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD009",
      lb: 8,
      sp: 50,
      burstSp: 25,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 180.53,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD009",
      lb: 9,
      sp: 50,
      burstSp: 25,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 190.13,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD009",
      lb: 10,
      sp: 50,
      burstSp: 25,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 200,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD010",
      lb: 0,
      sp: 50,
      burstSp: 25,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 120,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD010",
      lb: 1,
      sp: 50,
      burstSp: 25,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 124.5,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD010",
      lb: 2,
      sp: 50,
      burstSp: 25,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 130.7,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD010",
      lb: 3,
      sp: 50,
      burstSp: 25,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 137.76,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD010",
      lb: 4,
      sp: 50,
      burstSp: 25,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 145.45,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD010",
      lb: 5,
      sp: 50,
      burstSp: 25,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 153.64,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD010",
      lb: 6,
      sp: 50,
      burstSp: 25,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 162.25,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD010",
      lb: 7,
      sp: 50,
      burstSp: 25,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 171.22,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD010",
      lb: 8,
      sp: 50,
      burstSp: 25,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 180.53,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD010",
      lb: 9,
      sp: 50,
      burstSp: 25,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 190.13,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD010",
      lb: 10,
      sp: 50,
      burstSp: 25,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 200,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD011",
      lb: 0,
      sp: 50,
      burstSp: 25,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 120,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD011",
      lb: 1,
      sp: 50,
      burstSp: 25,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 124.5,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD011",
      lb: 2,
      sp: 50,
      burstSp: 25,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 130.7,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD011",
      lb: 3,
      sp: 50,
      burstSp: 25,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 137.76,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD011",
      lb: 4,
      sp: 50,
      burstSp: 25,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 145.45,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD011",
      lb: 5,
      sp: 50,
      burstSp: 25,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 153.64,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD011",
      lb: 6,
      sp: 50,
      burstSp: 25,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 162.25,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD011",
      lb: 7,
      sp: 50,
      burstSp: 25,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 171.22,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD011",
      lb: 8,
      sp: 50,
      burstSp: 25,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 180.53,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD011",
      lb: 9,
      sp: 50,
      burstSp: 25,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 190.13,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD011",
      lb: 10,
      sp: 50,
      burstSp: 25,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 200,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD012",
      lb: 0,
      sp: 50,
      burstSp: 25,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 120,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD012",
      lb: 1,
      sp: 50,
      burstSp: 25,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 124.5,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD012",
      lb: 2,
      sp: 50,
      burstSp: 25,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 130.7,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD012",
      lb: 3,
      sp: 50,
      burstSp: 25,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 137.76,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD012",
      lb: 4,
      sp: 50,
      burstSp: 25,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 145.45,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD012",
      lb: 5,
      sp: 50,
      burstSp: 25,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 153.64,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD012",
      lb: 6,
      sp: 50,
      burstSp: 25,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 162.25,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD012",
      lb: 7,
      sp: 50,
      burstSp: 25,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 171.22,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD012",
      lb: 8,
      sp: 50,
      burstSp: 25,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 180.53,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD012",
      lb: 9,
      sp: 50,
      burstSp: 25,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 190.13,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD012",
      lb: 10,
      sp: 50,
      burstSp: 25,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 200,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD013",
      lb: 0,
      sp: 150,
      burstSp: 75,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 150,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD013",
      lb: 1,
      sp: 150,
      burstSp: 75,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 158.44,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD013",
      lb: 2,
      sp: 150,
      burstSp: 75,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 170.06,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD013",
      lb: 3,
      sp: 150,
      burstSp: 75,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 183.3,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD013",
      lb: 4,
      sp: 150,
      burstSp: 75,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 197.72,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD013",
      lb: 5,
      sp: 150,
      burstSp: 75,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 213.07,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD013",
      lb: 6,
      sp: 150,
      burstSp: 75,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 229.21,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD013",
      lb: 7,
      sp: 150,
      burstSp: 75,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 246.04,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD013",
      lb: 8,
      sp: 150,
      burstSp: 75,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 263.49,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD013",
      lb: 9,
      sp: 150,
      burstSp: 75,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 281.49,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD013",
      lb: 10,
      sp: 150,
      burstSp: 75,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 300,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD014",
      lb: 0,
      sp: 150,
      burstSp: 75,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 150,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD014",
      lb: 1,
      sp: 150,
      burstSp: 75,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 158.44,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD014",
      lb: 2,
      sp: 150,
      burstSp: 75,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 170.06,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD014",
      lb: 3,
      sp: 150,
      burstSp: 75,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 183.3,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD014",
      lb: 4,
      sp: 150,
      burstSp: 75,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 197.72,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD014",
      lb: 5,
      sp: 150,
      burstSp: 75,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 213.07,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD014",
      lb: 6,
      sp: 150,
      burstSp: 75,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 229.21,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD014",
      lb: 7,
      sp: 150,
      burstSp: 75,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 246.04,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD014",
      lb: 8,
      sp: 150,
      burstSp: 75,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 263.49,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD014",
      lb: 9,
      sp: 150,
      burstSp: 75,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 281.49,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD014",
      lb: 10,
      sp: 150,
      burstSp: 75,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 300,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD015",
      lb: 0,
      sp: 150,
      burstSp: 75,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 150,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD015",
      lb: 1,
      sp: 150,
      burstSp: 75,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 158.44,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD015",
      lb: 2,
      sp: 150,
      burstSp: 75,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 170.06,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD015",
      lb: 3,
      sp: 150,
      burstSp: 75,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 183.3,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD015",
      lb: 4,
      sp: 150,
      burstSp: 75,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 197.72,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD015",
      lb: 5,
      sp: 150,
      burstSp: 75,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 213.07,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD015",
      lb: 6,
      sp: 150,
      burstSp: 75,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 229.21,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD015",
      lb: 7,
      sp: 150,
      burstSp: 75,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 246.04,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD015",
      lb: 8,
      sp: 150,
      burstSp: 75,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 263.49,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD015",
      lb: 9,
      sp: 150,
      burstSp: 75,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 281.49,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD015",
      lb: 10,
      sp: 150,
      burstSp: 75,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 300,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD016",
      lb: 0,
      sp: 150,
      burstSp: 75,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 150,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD016",
      lb: 1,
      sp: 150,
      burstSp: 75,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 158.44,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD016",
      lb: 2,
      sp: 150,
      burstSp: 75,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 170.06,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD016",
      lb: 3,
      sp: 150,
      burstSp: 75,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 183.3,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD016",
      lb: 4,
      sp: 150,
      burstSp: 75,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 197.72,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD016",
      lb: 5,
      sp: 150,
      burstSp: 75,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 213.07,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD016",
      lb: 6,
      sp: 150,
      burstSp: 75,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 229.21,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD016",
      lb: 7,
      sp: 150,
      burstSp: 75,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 246.04,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD016",
      lb: 8,
      sp: 150,
      burstSp: 75,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 263.49,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD016",
      lb: 9,
      sp: 150,
      burstSp: 75,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 281.49,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD016",
      lb: 10,
      sp: 150,
      burstSp: 75,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 300,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD017",
      lb: 0,
      sp: 150,
      burstSp: 75,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 150,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD017",
      lb: 1,
      sp: 150,
      burstSp: 75,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 158.44,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD017",
      lb: 2,
      sp: 150,
      burstSp: 75,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 170.06,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD017",
      lb: 3,
      sp: 150,
      burstSp: 75,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 183.3,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD017",
      lb: 4,
      sp: 150,
      burstSp: 75,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 197.72,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD017",
      lb: 5,
      sp: 150,
      burstSp: 75,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 213.07,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD017",
      lb: 6,
      sp: 150,
      burstSp: 75,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 229.21,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD017",
      lb: 7,
      sp: 150,
      burstSp: 75,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 246.04,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD017",
      lb: 8,
      sp: 150,
      burstSp: 75,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 263.49,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD017",
      lb: 9,
      sp: 150,
      burstSp: 75,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 281.49,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD017",
      lb: 10,
      sp: 150,
      burstSp: 75,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 300,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD018",
      lb: 0,
      sp: 150,
      burstSp: 75,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 150,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD018",
      lb: 1,
      sp: 150,
      burstSp: 75,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 158.44,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD018",
      lb: 2,
      sp: 150,
      burstSp: 75,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 170.06,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD018",
      lb: 3,
      sp: 150,
      burstSp: 75,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 183.3,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD018",
      lb: 4,
      sp: 150,
      burstSp: 75,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 197.72,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD018",
      lb: 5,
      sp: 150,
      burstSp: 75,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 213.07,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD018",
      lb: 6,
      sp: 150,
      burstSp: 75,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 229.21,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD018",
      lb: 7,
      sp: 150,
      burstSp: 75,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 246.04,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD018",
      lb: 8,
      sp: 150,
      burstSp: 75,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 263.49,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD018",
      lb: 9,
      sp: 150,
      burstSp: 75,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 281.49,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD018",
      lb: 10,
      sp: 150,
      burstSp: 75,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 300,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD019",
      lb: 0,
      sp: 75,
      burstSp: 38,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 60,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD019",
      lb: 1,
      sp: 75,
      burstSp: 38,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 62.25,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD019",
      lb: 2,
      sp: 75,
      burstSp: 38,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 65.35,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD019",
      lb: 3,
      sp: 75,
      burstSp: 38,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 68.88,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD019",
      lb: 4,
      sp: 75,
      burstSp: 38,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 72.72,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD019",
      lb: 5,
      sp: 75,
      burstSp: 38,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 76.82,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD019",
      lb: 6,
      sp: 75,
      burstSp: 38,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 81.12,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD019",
      lb: 7,
      sp: 75,
      burstSp: 38,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 85.61,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD019",
      lb: 8,
      sp: 75,
      burstSp: 38,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 90.26,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD019",
      lb: 9,
      sp: 75,
      burstSp: 38,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 95.06,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD019",
      lb: 10,
      sp: 75,
      burstSp: 38,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 100,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD020",
      lb: 0,
      sp: 75,
      burstSp: 38,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 60,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD020",
      lb: 1,
      sp: 75,
      burstSp: 38,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 62.25,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD020",
      lb: 2,
      sp: 75,
      burstSp: 38,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 65.35,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD020",
      lb: 3,
      sp: 75,
      burstSp: 38,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 68.88,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD020",
      lb: 4,
      sp: 75,
      burstSp: 38,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 72.72,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD020",
      lb: 5,
      sp: 75,
      burstSp: 38,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 76.82,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD020",
      lb: 6,
      sp: 75,
      burstSp: 38,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 81.12,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD020",
      lb: 7,
      sp: 75,
      burstSp: 38,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 85.61,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD020",
      lb: 8,
      sp: 75,
      burstSp: 38,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 90.26,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD020",
      lb: 9,
      sp: 75,
      burstSp: 38,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 95.06,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD020",
      lb: 10,
      sp: 75,
      burstSp: 38,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 100,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD021",
      lb: 0,
      sp: 75,
      burstSp: 38,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 60,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD021",
      lb: 1,
      sp: 75,
      burstSp: 38,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 62.25,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD021",
      lb: 2,
      sp: 75,
      burstSp: 38,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 65.35,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD021",
      lb: 3,
      sp: 75,
      burstSp: 38,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 68.88,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD021",
      lb: 4,
      sp: 75,
      burstSp: 38,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 72.72,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD021",
      lb: 5,
      sp: 75,
      burstSp: 38,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 76.82,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD021",
      lb: 6,
      sp: 75,
      burstSp: 38,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 81.12,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD021",
      lb: 7,
      sp: 75,
      burstSp: 38,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 85.61,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD021",
      lb: 8,
      sp: 75,
      burstSp: 38,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 90.26,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD021",
      lb: 9,
      sp: 75,
      burstSp: 38,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 95.06,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD021",
      lb: 10,
      sp: 75,
      burstSp: 38,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 100,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD022",
      lb: 0,
      sp: 75,
      burstSp: 38,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 60,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD022",
      lb: 1,
      sp: 75,
      burstSp: 38,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 62.25,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD022",
      lb: 2,
      sp: 75,
      burstSp: 38,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 65.35,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD022",
      lb: 3,
      sp: 75,
      burstSp: 38,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 68.88,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD022",
      lb: 4,
      sp: 75,
      burstSp: 38,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 72.72,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD022",
      lb: 5,
      sp: 75,
      burstSp: 38,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 76.82,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD022",
      lb: 6,
      sp: 75,
      burstSp: 38,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 81.12,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD022",
      lb: 7,
      sp: 75,
      burstSp: 38,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 85.61,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD022",
      lb: 8,
      sp: 75,
      burstSp: 38,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 90.26,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD022",
      lb: 9,
      sp: 75,
      burstSp: 38,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 95.06,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD022",
      lb: 10,
      sp: 75,
      burstSp: 38,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 100,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD023",
      lb: 0,
      sp: 75,
      burstSp: 38,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 60,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD023",
      lb: 1,
      sp: 75,
      burstSp: 38,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 62.25,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD023",
      lb: 2,
      sp: 75,
      burstSp: 38,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 65.35,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD023",
      lb: 3,
      sp: 75,
      burstSp: 38,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 68.88,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD023",
      lb: 4,
      sp: 75,
      burstSp: 38,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 72.72,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD023",
      lb: 5,
      sp: 75,
      burstSp: 38,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 76.82,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD023",
      lb: 6,
      sp: 75,
      burstSp: 38,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 81.12,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD023",
      lb: 7,
      sp: 75,
      burstSp: 38,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 85.61,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD023",
      lb: 8,
      sp: 75,
      burstSp: 38,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 90.26,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD023",
      lb: 9,
      sp: 75,
      burstSp: 38,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 95.06,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD023",
      lb: 10,
      sp: 75,
      burstSp: 38,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 100,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD024",
      lb: 0,
      sp: 75,
      burstSp: 38,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 60,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD024",
      lb: 1,
      sp: 75,
      burstSp: 38,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 62.25,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD024",
      lb: 2,
      sp: 75,
      burstSp: 38,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 65.35,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD024",
      lb: 3,
      sp: 75,
      burstSp: 38,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 68.88,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD024",
      lb: 4,
      sp: 75,
      burstSp: 38,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 72.72,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD024",
      lb: 5,
      sp: 75,
      burstSp: 38,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 76.82,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD024",
      lb: 6,
      sp: 75,
      burstSp: 38,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 81.12,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD024",
      lb: 7,
      sp: 75,
      burstSp: 38,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 85.61,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD024",
      lb: 8,
      sp: 75,
      burstSp: 38,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 90.26,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD024",
      lb: 9,
      sp: 75,
      burstSp: 38,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 95.06,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD024",
      lb: 10,
      sp: 75,
      burstSp: 38,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 100,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD025",
      lb: 0,
      sp: 170,
      burstSp: 85,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 90,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD025",
      lb: 1,
      sp: 170,
      burstSp: 85,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 93.37,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD025",
      lb: 2,
      sp: 170,
      burstSp: 85,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 98.02,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD025",
      lb: 3,
      sp: 170,
      burstSp: 85,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 103.32,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD025",
      lb: 4,
      sp: 170,
      burstSp: 85,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 109.09,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD025",
      lb: 5,
      sp: 170,
      burstSp: 85,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 115.23,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD025",
      lb: 6,
      sp: 170,
      burstSp: 85,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 121.68,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD025",
      lb: 7,
      sp: 170,
      burstSp: 85,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 128.42,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD025",
      lb: 8,
      sp: 170,
      burstSp: 85,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 135.4,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD025",
      lb: 9,
      sp: 170,
      burstSp: 85,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 142.6,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD025",
      lb: 10,
      sp: 170,
      burstSp: 85,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 150,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD026",
      lb: 0,
      sp: 55,
      burstSp: 28,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 105,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD026",
      lb: 1,
      sp: 55,
      burstSp: 28,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 109.22,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD026",
      lb: 2,
      sp: 55,
      burstSp: 28,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 115.03,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD026",
      lb: 3,
      sp: 55,
      burstSp: 28,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 121.65,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD026",
      lb: 4,
      sp: 55,
      burstSp: 28,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 128.86,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD026",
      lb: 5,
      sp: 55,
      burstSp: 28,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 136.53,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD026",
      lb: 6,
      sp: 55,
      burstSp: 28,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 144.61,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD026",
      lb: 7,
      sp: 55,
      burstSp: 28,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 153.02,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD026",
      lb: 8,
      sp: 55,
      burstSp: 28,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 161.74,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD026",
      lb: 9,
      sp: 55,
      burstSp: 28,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 170.75,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD026",
      lb: 10,
      sp: 55,
      burstSp: 28,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 180,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD027",
      lb: 0,
      sp: 50,
      burstSp: 25,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 110,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD027",
      lb: 1,
      sp: 50,
      burstSp: 25,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 114.5,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD027",
      lb: 2,
      sp: 50,
      burstSp: 25,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 120.7,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD027",
      lb: 3,
      sp: 50,
      burstSp: 25,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 127.76,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD027",
      lb: 4,
      sp: 50,
      burstSp: 25,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 135.45,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD027",
      lb: 5,
      sp: 50,
      burstSp: 25,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 143.64,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD027",
      lb: 6,
      sp: 50,
      burstSp: 25,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 152.25,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD027",
      lb: 7,
      sp: 50,
      burstSp: 25,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 161.22,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD027",
      lb: 8,
      sp: 50,
      burstSp: 25,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 170.53,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD027",
      lb: 9,
      sp: 50,
      burstSp: 25,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 180.13,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD027",
      lb: 10,
      sp: 50,
      burstSp: 25,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 190,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD028",
      lb: 0,
      sp: 100,
      burstSp: 50,
      displayEffects: [
        {
          label: "\u901A\u5E38\u500D\u7387",
          value: 110,
          unit: "%"
        },
        {
          label: "\u6761\u4EF6\u500D\u7387",
          value: 140,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD028",
      lb: 1,
      sp: 100,
      burstSp: 50,
      displayEffects: [
        {
          label: "\u901A\u5E38\u500D\u7387",
          value: 113.94,
          unit: "%"
        },
        {
          label: "\u6761\u4EF6\u500D\u7387",
          value: 146.19,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD028",
      lb: 2,
      sp: 100,
      burstSp: 50,
      displayEffects: [
        {
          label: "\u901A\u5E38\u500D\u7387",
          value: 119.36,
          unit: "%"
        },
        {
          label: "\u6761\u4EF6\u500D\u7387",
          value: 154.71,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD028",
      lb: 3,
      sp: 100,
      burstSp: 50,
      displayEffects: [
        {
          label: "\u901A\u5E38\u500D\u7387",
          value: 125.54,
          unit: "%"
        },
        {
          label: "\u6761\u4EF6\u500D\u7387",
          value: 164.42,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD028",
      lb: 4,
      sp: 100,
      burstSp: 50,
      displayEffects: [
        {
          label: "\u901A\u5E38\u500D\u7387",
          value: 132.27,
          unit: "%"
        },
        {
          label: "\u6761\u4EF6\u500D\u7387",
          value: 174.99,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD028",
      lb: 5,
      sp: 100,
      burstSp: 50,
      displayEffects: [
        {
          label: "\u901A\u5E38\u500D\u7387",
          value: 139.43,
          unit: "%"
        },
        {
          label: "\u6761\u4EF6\u500D\u7387",
          value: 186.25,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD028",
      lb: 6,
      sp: 100,
      burstSp: 50,
      displayEffects: [
        {
          label: "\u901A\u5E38\u500D\u7387",
          value: 146.96,
          unit: "%"
        },
        {
          label: "\u6761\u4EF6\u500D\u7387",
          value: 198.09,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD028",
      lb: 7,
      sp: 100,
      burstSp: 50,
      displayEffects: [
        {
          label: "\u901A\u5E38\u500D\u7387",
          value: 154.82,
          unit: "%"
        },
        {
          label: "\u6761\u4EF6\u500D\u7387",
          value: 210.43,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD028",
      lb: 8,
      sp: 100,
      burstSp: 50,
      displayEffects: [
        {
          label: "\u901A\u5E38\u500D\u7387",
          value: 162.96,
          unit: "%"
        },
        {
          label: "\u6761\u4EF6\u500D\u7387",
          value: 223.23,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD028",
      lb: 9,
      sp: 100,
      burstSp: 50,
      displayEffects: [
        {
          label: "\u901A\u5E38\u500D\u7387",
          value: 171.36,
          unit: "%"
        },
        {
          label: "\u6761\u4EF6\u500D\u7387",
          value: 236.43,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD028",
      lb: 10,
      sp: 100,
      burstSp: 50,
      displayEffects: [
        {
          label: "\u901A\u5E38\u500D\u7387",
          value: 180,
          unit: "%"
        },
        {
          label: "\u6761\u4EF6\u500D\u7387",
          value: 250,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD029",
      lb: 0,
      sp: 65,
      burstSp: 33,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 80,
          unit: "%"
        },
        {
          label: "\u7D99\u7D9A\u30C0\u30E1\u30FC\u30B8\u500D\u7387",
          value: 10,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD029",
      lb: 1,
      sp: 65,
      burstSp: 33,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 82.81,
          unit: "%"
        },
        {
          label: "\u7D99\u7D9A\u30C0\u30E1\u30FC\u30B8\u500D\u7387",
          value: 10.56,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD029",
      lb: 2,
      sp: 65,
      burstSp: 33,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 86.69,
          unit: "%"
        },
        {
          label: "\u7D99\u7D9A\u30C0\u30E1\u30FC\u30B8\u500D\u7387",
          value: 11.34,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD029",
      lb: 3,
      sp: 65,
      burstSp: 33,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 91.1,
          unit: "%"
        },
        {
          label: "\u7D99\u7D9A\u30C0\u30E1\u30FC\u30B8\u500D\u7387",
          value: 12.22,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD029",
      lb: 4,
      sp: 65,
      burstSp: 33,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 95.91,
          unit: "%"
        },
        {
          label: "\u7D99\u7D9A\u30C0\u30E1\u30FC\u30B8\u500D\u7387",
          value: 13.18,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD029",
      lb: 5,
      sp: 65,
      burstSp: 33,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 101.02,
          unit: "%"
        },
        {
          label: "\u7D99\u7D9A\u30C0\u30E1\u30FC\u30B8\u500D\u7387",
          value: 14.2,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD029",
      lb: 6,
      sp: 65,
      burstSp: 33,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 106.4,
          unit: "%"
        },
        {
          label: "\u7D99\u7D9A\u30C0\u30E1\u30FC\u30B8\u500D\u7387",
          value: 15.28,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD029",
      lb: 7,
      sp: 65,
      burstSp: 33,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 112.01,
          unit: "%"
        },
        {
          label: "\u7D99\u7D9A\u30C0\u30E1\u30FC\u30B8\u500D\u7387",
          value: 16.4,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD029",
      lb: 8,
      sp: 65,
      burstSp: 33,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 117.83,
          unit: "%"
        },
        {
          label: "\u7D99\u7D9A\u30C0\u30E1\u30FC\u30B8\u500D\u7387",
          value: 17.57,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD029",
      lb: 9,
      sp: 65,
      burstSp: 33,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 123.83,
          unit: "%"
        },
        {
          label: "\u7D99\u7D9A\u30C0\u30E1\u30FC\u30B8\u500D\u7387",
          value: 18.77,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD029",
      lb: 10,
      sp: 65,
      burstSp: 33,
      displayEffects: [
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 130,
          unit: "%"
        },
        {
          label: "\u7D99\u7D9A\u30C0\u30E1\u30FC\u30B8\u500D\u7387",
          value: 20,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD030",
      lb: 0,
      sp: 100,
      burstSp: 50,
      displayEffects: [
        {
          label: "\u901A\u5E38\u500D\u7387",
          value: 110,
          unit: "%"
        },
        {
          label: "\u6761\u4EF6\u500D\u7387",
          value: 145,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD030",
      lb: 1,
      sp: 100,
      burstSp: 50,
      displayEffects: [
        {
          label: "\u901A\u5E38\u500D\u7387",
          value: 113.94,
          unit: "%"
        },
        {
          label: "\u6761\u4EF6\u500D\u7387",
          value: 151.47,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD030",
      lb: 2,
      sp: 100,
      burstSp: 50,
      displayEffects: [
        {
          label: "\u901A\u5E38\u500D\u7387",
          value: 119.36,
          unit: "%"
        },
        {
          label: "\u6761\u4EF6\u500D\u7387",
          value: 160.38,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD030",
      lb: 3,
      sp: 100,
      burstSp: 50,
      displayEffects: [
        {
          label: "\u901A\u5E38\u500D\u7387",
          value: 125.54,
          unit: "%"
        },
        {
          label: "\u6761\u4EF6\u500D\u7387",
          value: 170.53,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD030",
      lb: 4,
      sp: 100,
      burstSp: 50,
      displayEffects: [
        {
          label: "\u901A\u5E38\u500D\u7387",
          value: 132.27,
          unit: "%"
        },
        {
          label: "\u6761\u4EF6\u500D\u7387",
          value: 181.58,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD030",
      lb: 5,
      sp: 100,
      burstSp: 50,
      displayEffects: [
        {
          label: "\u901A\u5E38\u500D\u7387",
          value: 139.43,
          unit: "%"
        },
        {
          label: "\u6761\u4EF6\u500D\u7387",
          value: 193.35,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD030",
      lb: 6,
      sp: 100,
      burstSp: 50,
      displayEffects: [
        {
          label: "\u901A\u5E38\u500D\u7387",
          value: 146.96,
          unit: "%"
        },
        {
          label: "\u6761\u4EF6\u500D\u7387",
          value: 205.73,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD030",
      lb: 7,
      sp: 100,
      burstSp: 50,
      displayEffects: [
        {
          label: "\u901A\u5E38\u500D\u7387",
          value: 154.82,
          unit: "%"
        },
        {
          label: "\u6761\u4EF6\u500D\u7387",
          value: 218.63,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD030",
      lb: 8,
      sp: 100,
      burstSp: 50,
      displayEffects: [
        {
          label: "\u901A\u5E38\u500D\u7387",
          value: 162.96,
          unit: "%"
        },
        {
          label: "\u6761\u4EF6\u500D\u7387",
          value: 232.01,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD030",
      lb: 9,
      sp: 100,
      burstSp: 50,
      displayEffects: [
        {
          label: "\u901A\u5E38\u500D\u7387",
          value: 171.36,
          unit: "%"
        },
        {
          label: "\u6761\u4EF6\u500D\u7387",
          value: 245.81,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD030",
      lb: 10,
      sp: 100,
      burstSp: 50,
      displayEffects: [
        {
          label: "\u901A\u5E38\u500D\u7387",
          value: 180,
          unit: "%"
        },
        {
          label: "\u6761\u4EF6\u500D\u7387",
          value: 260,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD031",
      lb: 0,
      sp: 100,
      burstSp: 50,
      displayEffects: [
        {
          label: "\u901A\u5E38\u500D\u7387",
          value: 110,
          unit: "%"
        },
        {
          label: "\u6761\u4EF6\u500D\u7387",
          value: 150,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD031",
      lb: 1,
      sp: 100,
      burstSp: 50,
      displayEffects: [
        {
          label: "\u901A\u5E38\u500D\u7387",
          value: 113.94,
          unit: "%"
        },
        {
          label: "\u6761\u4EF6\u500D\u7387",
          value: 156.75,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD031",
      lb: 2,
      sp: 100,
      burstSp: 50,
      displayEffects: [
        {
          label: "\u901A\u5E38\u500D\u7387",
          value: 119.36,
          unit: "%"
        },
        {
          label: "\u6761\u4EF6\u500D\u7387",
          value: 166.05,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD031",
      lb: 3,
      sp: 100,
      burstSp: 50,
      displayEffects: [
        {
          label: "\u901A\u5E38\u500D\u7387",
          value: 125.54,
          unit: "%"
        },
        {
          label: "\u6761\u4EF6\u500D\u7387",
          value: 176.64,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD031",
      lb: 4,
      sp: 100,
      burstSp: 50,
      displayEffects: [
        {
          label: "\u901A\u5E38\u500D\u7387",
          value: 132.27,
          unit: "%"
        },
        {
          label: "\u6761\u4EF6\u500D\u7387",
          value: 188.17,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD031",
      lb: 5,
      sp: 100,
      burstSp: 50,
      displayEffects: [
        {
          label: "\u901A\u5E38\u500D\u7387",
          value: 139.43,
          unit: "%"
        },
        {
          label: "\u6761\u4EF6\u500D\u7387",
          value: 200.45,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD031",
      lb: 6,
      sp: 100,
      burstSp: 50,
      displayEffects: [
        {
          label: "\u901A\u5E38\u500D\u7387",
          value: 146.96,
          unit: "%"
        },
        {
          label: "\u6761\u4EF6\u500D\u7387",
          value: 213.37,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD031",
      lb: 7,
      sp: 100,
      burstSp: 50,
      displayEffects: [
        {
          label: "\u901A\u5E38\u500D\u7387",
          value: 154.82,
          unit: "%"
        },
        {
          label: "\u6761\u4EF6\u500D\u7387",
          value: 226.83,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD031",
      lb: 8,
      sp: 100,
      burstSp: 50,
      displayEffects: [
        {
          label: "\u901A\u5E38\u500D\u7387",
          value: 162.96,
          unit: "%"
        },
        {
          label: "\u6761\u4EF6\u500D\u7387",
          value: 240.79,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD031",
      lb: 9,
      sp: 100,
      burstSp: 50,
      displayEffects: [
        {
          label: "\u901A\u5E38\u500D\u7387",
          value: 171.36,
          unit: "%"
        },
        {
          label: "\u6761\u4EF6\u500D\u7387",
          value: 255.19,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD031",
      lb: 10,
      sp: 100,
      burstSp: 50,
      displayEffects: [
        {
          label: "\u901A\u5E38\u500D\u7387",
          value: 180,
          unit: "%"
        },
        {
          label: "\u6761\u4EF6\u500D\u7387",
          value: 270,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD032",
      lb: 0,
      sp: 65,
      burstSp: 33,
      displayEffects: [
        {
          label: "\u4ED8\u4E0E\u7387",
          value: 35,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD032",
      lb: 1,
      sp: 65,
      burstSp: 33,
      displayEffects: [
        {
          label: "\u4ED8\u4E0E\u7387",
          value: 36.12,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD032",
      lb: 2,
      sp: 65,
      burstSp: 33,
      displayEffects: [
        {
          label: "\u4ED8\u4E0E\u7387",
          value: 37.67,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD032",
      lb: 3,
      sp: 65,
      burstSp: 33,
      displayEffects: [
        {
          label: "\u4ED8\u4E0E\u7387",
          value: 39.44,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD032",
      lb: 4,
      sp: 65,
      burstSp: 33,
      displayEffects: [
        {
          label: "\u4ED8\u4E0E\u7387",
          value: 41.36,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD032",
      lb: 5,
      sp: 65,
      burstSp: 33,
      displayEffects: [
        {
          label: "\u4ED8\u4E0E\u7387",
          value: 43.41,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD032",
      lb: 6,
      sp: 65,
      burstSp: 33,
      displayEffects: [
        {
          label: "\u4ED8\u4E0E\u7387",
          value: 45.56,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD032",
      lb: 7,
      sp: 65,
      burstSp: 33,
      displayEffects: [
        {
          label: "\u4ED8\u4E0E\u7387",
          value: 47.81,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD032",
      lb: 8,
      sp: 65,
      burstSp: 33,
      displayEffects: [
        {
          label: "\u4ED8\u4E0E\u7387",
          value: 50.13,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD032",
      lb: 9,
      sp: 65,
      burstSp: 33,
      displayEffects: [
        {
          label: "\u4ED8\u4E0E\u7387",
          value: 52.53,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD032",
      lb: 10,
      sp: 65,
      burstSp: 33,
      displayEffects: [
        {
          label: "\u4ED8\u4E0E\u7387",
          value: 55,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD033",
      lb: 0,
      sp: 30,
      burstSp: 15,
      displayEffects: [
        {
          label: "ATK\u5F37\u5316",
          value: 8,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD033",
      lb: 1,
      sp: 30,
      burstSp: 15,
      displayEffects: [
        {
          label: "ATK\u5F37\u5316",
          value: 8.39,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD033",
      lb: 2,
      sp: 30,
      burstSp: 15,
      displayEffects: [
        {
          label: "ATK\u5F37\u5316",
          value: 8.94,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD033",
      lb: 3,
      sp: 30,
      burstSp: 15,
      displayEffects: [
        {
          label: "ATK\u5F37\u5316",
          value: 9.55,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD033",
      lb: 4,
      sp: 30,
      burstSp: 15,
      displayEffects: [
        {
          label: "ATK\u5F37\u5316",
          value: 10.23,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD033",
      lb: 5,
      sp: 30,
      burstSp: 15,
      displayEffects: [
        {
          label: "ATK\u5F37\u5316",
          value: 10.94,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD033",
      lb: 6,
      sp: 30,
      burstSp: 15,
      displayEffects: [
        {
          label: "ATK\u5F37\u5316",
          value: 11.7,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD033",
      lb: 7,
      sp: 30,
      burstSp: 15,
      displayEffects: [
        {
          label: "ATK\u5F37\u5316",
          value: 12.48,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD033",
      lb: 8,
      sp: 30,
      burstSp: 15,
      displayEffects: [
        {
          label: "ATK\u5F37\u5316",
          value: 13.3,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD033",
      lb: 9,
      sp: 30,
      burstSp: 15,
      displayEffects: [
        {
          label: "ATK\u5F37\u5316",
          value: 14.14,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD033",
      lb: 10,
      sp: 30,
      burstSp: 15,
      displayEffects: [
        {
          label: "ATK\u5F37\u5316",
          value: 15,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD034",
      lb: 0,
      sp: 30,
      burstSp: 15,
      displayEffects: [
        {
          label: "DEF\u5F37\u5316",
          value: 15,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD034",
      lb: 1,
      sp: 30,
      burstSp: 15,
      displayEffects: [
        {
          label: "DEF\u5F37\u5316",
          value: 15.84,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD034",
      lb: 2,
      sp: 30,
      burstSp: 15,
      displayEffects: [
        {
          label: "DEF\u5F37\u5316",
          value: 17.01,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD034",
      lb: 3,
      sp: 30,
      burstSp: 15,
      displayEffects: [
        {
          label: "DEF\u5F37\u5316",
          value: 18.33,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD034",
      lb: 4,
      sp: 30,
      burstSp: 15,
      displayEffects: [
        {
          label: "DEF\u5F37\u5316",
          value: 19.77,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD034",
      lb: 5,
      sp: 30,
      burstSp: 15,
      displayEffects: [
        {
          label: "DEF\u5F37\u5316",
          value: 21.31,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD034",
      lb: 6,
      sp: 30,
      burstSp: 15,
      displayEffects: [
        {
          label: "DEF\u5F37\u5316",
          value: 22.92,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD034",
      lb: 7,
      sp: 30,
      burstSp: 15,
      displayEffects: [
        {
          label: "DEF\u5F37\u5316",
          value: 24.6,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD034",
      lb: 8,
      sp: 30,
      burstSp: 15,
      displayEffects: [
        {
          label: "DEF\u5F37\u5316",
          value: 26.35,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD034",
      lb: 9,
      sp: 30,
      burstSp: 15,
      displayEffects: [
        {
          label: "DEF\u5F37\u5316",
          value: 28.15,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD034",
      lb: 10,
      sp: 30,
      burstSp: 15,
      displayEffects: [
        {
          label: "DEF\u5F37\u5316",
          value: 30,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD035",
      lb: 0,
      sp: 75,
      burstSp: 38,
      displayEffects: [
        {
          label: "ATK\u5F37\u5316",
          value: 8,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD035",
      lb: 1,
      sp: 75,
      burstSp: 38,
      displayEffects: [
        {
          label: "ATK\u5F37\u5316",
          value: 8.39,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD035",
      lb: 2,
      sp: 75,
      burstSp: 38,
      displayEffects: [
        {
          label: "ATK\u5F37\u5316",
          value: 8.94,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD035",
      lb: 3,
      sp: 75,
      burstSp: 38,
      displayEffects: [
        {
          label: "ATK\u5F37\u5316",
          value: 9.55,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD035",
      lb: 4,
      sp: 75,
      burstSp: 38,
      displayEffects: [
        {
          label: "ATK\u5F37\u5316",
          value: 10.23,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD035",
      lb: 5,
      sp: 75,
      burstSp: 38,
      displayEffects: [
        {
          label: "ATK\u5F37\u5316",
          value: 10.94,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD035",
      lb: 6,
      sp: 75,
      burstSp: 38,
      displayEffects: [
        {
          label: "ATK\u5F37\u5316",
          value: 11.7,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD035",
      lb: 7,
      sp: 75,
      burstSp: 38,
      displayEffects: [
        {
          label: "ATK\u5F37\u5316",
          value: 12.48,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD035",
      lb: 8,
      sp: 75,
      burstSp: 38,
      displayEffects: [
        {
          label: "ATK\u5F37\u5316",
          value: 13.3,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD035",
      lb: 9,
      sp: 75,
      burstSp: 38,
      displayEffects: [
        {
          label: "ATK\u5F37\u5316",
          value: 14.14,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD035",
      lb: 10,
      sp: 75,
      burstSp: 38,
      displayEffects: [
        {
          label: "ATK\u5F37\u5316",
          value: 15,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD036",
      lb: 0,
      sp: 75,
      burstSp: 38,
      displayEffects: [
        {
          label: "DEF\u5F37\u5316",
          value: 15,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD036",
      lb: 1,
      sp: 75,
      burstSp: 38,
      displayEffects: [
        {
          label: "DEF\u5F37\u5316",
          value: 15.84,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD036",
      lb: 2,
      sp: 75,
      burstSp: 38,
      displayEffects: [
        {
          label: "DEF\u5F37\u5316",
          value: 17.01,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD036",
      lb: 3,
      sp: 75,
      burstSp: 38,
      displayEffects: [
        {
          label: "DEF\u5F37\u5316",
          value: 18.33,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD036",
      lb: 4,
      sp: 75,
      burstSp: 38,
      displayEffects: [
        {
          label: "DEF\u5F37\u5316",
          value: 19.77,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD036",
      lb: 5,
      sp: 75,
      burstSp: 38,
      displayEffects: [
        {
          label: "DEF\u5F37\u5316",
          value: 21.31,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD036",
      lb: 6,
      sp: 75,
      burstSp: 38,
      displayEffects: [
        {
          label: "DEF\u5F37\u5316",
          value: 22.92,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD036",
      lb: 7,
      sp: 75,
      burstSp: 38,
      displayEffects: [
        {
          label: "DEF\u5F37\u5316",
          value: 24.6,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD036",
      lb: 8,
      sp: 75,
      burstSp: 38,
      displayEffects: [
        {
          label: "DEF\u5F37\u5316",
          value: 26.35,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD036",
      lb: 9,
      sp: 75,
      burstSp: 38,
      displayEffects: [
        {
          label: "DEF\u5F37\u5316",
          value: 28.15,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD036",
      lb: 10,
      sp: 75,
      burstSp: 38,
      displayEffects: [
        {
          label: "DEF\u5F37\u5316",
          value: 30,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD037",
      lb: 0,
      sp: 50,
      burstSp: 25,
      displayEffects: [
        {
          label: "ATK\u4F4E\u4E0B",
          value: 10,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD037",
      lb: 1,
      sp: 50,
      burstSp: 25,
      displayEffects: [
        {
          label: "ATK\u4F4E\u4E0B",
          value: 10.56,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD037",
      lb: 2,
      sp: 50,
      burstSp: 25,
      displayEffects: [
        {
          label: "ATK\u4F4E\u4E0B",
          value: 11.34,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD037",
      lb: 3,
      sp: 50,
      burstSp: 25,
      displayEffects: [
        {
          label: "ATK\u4F4E\u4E0B",
          value: 12.22,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD037",
      lb: 4,
      sp: 50,
      burstSp: 25,
      displayEffects: [
        {
          label: "ATK\u4F4E\u4E0B",
          value: 13.18,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD037",
      lb: 5,
      sp: 50,
      burstSp: 25,
      displayEffects: [
        {
          label: "ATK\u4F4E\u4E0B",
          value: 14.2,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD037",
      lb: 6,
      sp: 50,
      burstSp: 25,
      displayEffects: [
        {
          label: "ATK\u4F4E\u4E0B",
          value: 15.28,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD037",
      lb: 7,
      sp: 50,
      burstSp: 25,
      displayEffects: [
        {
          label: "ATK\u4F4E\u4E0B",
          value: 16.4,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD037",
      lb: 8,
      sp: 50,
      burstSp: 25,
      displayEffects: [
        {
          label: "ATK\u4F4E\u4E0B",
          value: 17.57,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD037",
      lb: 9,
      sp: 50,
      burstSp: 25,
      displayEffects: [
        {
          label: "ATK\u4F4E\u4E0B",
          value: 18.77,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD037",
      lb: 10,
      sp: 50,
      burstSp: 25,
      displayEffects: [
        {
          label: "ATK\u4F4E\u4E0B",
          value: 20,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD038",
      lb: 0,
      sp: 50,
      burstSp: 25,
      displayEffects: [
        {
          label: "DEF\u4F4E\u4E0B",
          value: 12,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD038",
      lb: 1,
      sp: 50,
      burstSp: 25,
      displayEffects: [
        {
          label: "DEF\u4F4E\u4E0B",
          value: 12.73,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD038",
      lb: 2,
      sp: 50,
      burstSp: 25,
      displayEffects: [
        {
          label: "DEF\u4F4E\u4E0B",
          value: 13.74,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD038",
      lb: 3,
      sp: 50,
      burstSp: 25,
      displayEffects: [
        {
          label: "DEF\u4F4E\u4E0B",
          value: 14.89,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD038",
      lb: 4,
      sp: 50,
      burstSp: 25,
      displayEffects: [
        {
          label: "DEF\u4F4E\u4E0B",
          value: 16.14,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD038",
      lb: 5,
      sp: 50,
      burstSp: 25,
      displayEffects: [
        {
          label: "DEF\u4F4E\u4E0B",
          value: 17.47,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD038",
      lb: 6,
      sp: 50,
      burstSp: 25,
      displayEffects: [
        {
          label: "DEF\u4F4E\u4E0B",
          value: 18.86,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD038",
      lb: 7,
      sp: 50,
      burstSp: 25,
      displayEffects: [
        {
          label: "DEF\u4F4E\u4E0B",
          value: 20.32,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD038",
      lb: 8,
      sp: 50,
      burstSp: 25,
      displayEffects: [
        {
          label: "DEF\u4F4E\u4E0B",
          value: 21.84,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD038",
      lb: 9,
      sp: 50,
      burstSp: 25,
      displayEffects: [
        {
          label: "DEF\u4F4E\u4E0B",
          value: 23.4,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD038",
      lb: 10,
      sp: 50,
      burstSp: 25,
      displayEffects: [
        {
          label: "DEF\u4F4E\u4E0B",
          value: 25,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD039",
      lb: 0,
      sp: 35,
      burstSp: 18,
      displayEffects: [
        {
          label: "\u56DE\u5FA9\u500D\u7387",
          value: 35,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD039",
      lb: 1,
      sp: 35,
      burstSp: 18,
      displayEffects: [
        {
          label: "\u56DE\u5FA9\u500D\u7387",
          value: 36.69,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD039",
      lb: 2,
      sp: 35,
      burstSp: 18,
      displayEffects: [
        {
          label: "\u56DE\u5FA9\u500D\u7387",
          value: 39.01,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD039",
      lb: 3,
      sp: 35,
      burstSp: 18,
      displayEffects: [
        {
          label: "\u56DE\u5FA9\u500D\u7387",
          value: 41.66,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD039",
      lb: 4,
      sp: 35,
      burstSp: 18,
      displayEffects: [
        {
          label: "\u56DE\u5FA9\u500D\u7387",
          value: 44.54,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD039",
      lb: 5,
      sp: 35,
      burstSp: 18,
      displayEffects: [
        {
          label: "\u56DE\u5FA9\u500D\u7387",
          value: 47.61,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD039",
      lb: 6,
      sp: 35,
      burstSp: 18,
      displayEffects: [
        {
          label: "\u56DE\u5FA9\u500D\u7387",
          value: 50.84,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD039",
      lb: 7,
      sp: 35,
      burstSp: 18,
      displayEffects: [
        {
          label: "\u56DE\u5FA9\u500D\u7387",
          value: 54.21,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD039",
      lb: 8,
      sp: 35,
      burstSp: 18,
      displayEffects: [
        {
          label: "\u56DE\u5FA9\u500D\u7387",
          value: 57.7,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD039",
      lb: 9,
      sp: 35,
      burstSp: 18,
      displayEffects: [
        {
          label: "\u56DE\u5FA9\u500D\u7387",
          value: 61.3,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD039",
      lb: 10,
      sp: 35,
      burstSp: 18,
      displayEffects: [
        {
          label: "\u56DE\u5FA9\u500D\u7387",
          value: 65,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD040",
      lb: 0,
      sp: 90,
      burstSp: 45,
      displayEffects: [
        {
          label: "\u56DE\u5FA9\u500D\u7387",
          value: 75,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD040",
      lb: 1,
      sp: 90,
      burstSp: 45,
      displayEffects: [
        {
          label: "\u56DE\u5FA9\u500D\u7387",
          value: 79.22,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD040",
      lb: 2,
      sp: 90,
      burstSp: 45,
      displayEffects: [
        {
          label: "\u56DE\u5FA9\u500D\u7387",
          value: 85.03,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD040",
      lb: 3,
      sp: 90,
      burstSp: 45,
      displayEffects: [
        {
          label: "\u56DE\u5FA9\u500D\u7387",
          value: 91.65,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD040",
      lb: 4,
      sp: 90,
      burstSp: 45,
      displayEffects: [
        {
          label: "\u56DE\u5FA9\u500D\u7387",
          value: 98.86,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD040",
      lb: 5,
      sp: 90,
      burstSp: 45,
      displayEffects: [
        {
          label: "\u56DE\u5FA9\u500D\u7387",
          value: 106.53,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD040",
      lb: 6,
      sp: 90,
      burstSp: 45,
      displayEffects: [
        {
          label: "\u56DE\u5FA9\u500D\u7387",
          value: 114.61,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD040",
      lb: 7,
      sp: 90,
      burstSp: 45,
      displayEffects: [
        {
          label: "\u56DE\u5FA9\u500D\u7387",
          value: 123.02,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD040",
      lb: 8,
      sp: 90,
      burstSp: 45,
      displayEffects: [
        {
          label: "\u56DE\u5FA9\u500D\u7387",
          value: 131.74,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD040",
      lb: 9,
      sp: 90,
      burstSp: 45,
      displayEffects: [
        {
          label: "\u56DE\u5FA9\u500D\u7387",
          value: 140.75,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD040",
      lb: 10,
      sp: 90,
      burstSp: 45,
      displayEffects: [
        {
          label: "\u56DE\u5FA9\u500D\u7387",
          value: 150,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD041",
      lb: 0,
      sp: 90,
      burstSp: 45,
      displayEffects: [
        {
          label: "\u56DE\u5FA9\u500D\u7387",
          value: 20,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD041",
      lb: 1,
      sp: 90,
      burstSp: 45,
      displayEffects: [
        {
          label: "\u56DE\u5FA9\u500D\u7387",
          value: 21.12,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD041",
      lb: 2,
      sp: 90,
      burstSp: 45,
      displayEffects: [
        {
          label: "\u56DE\u5FA9\u500D\u7387",
          value: 22.67,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD041",
      lb: 3,
      sp: 90,
      burstSp: 45,
      displayEffects: [
        {
          label: "\u56DE\u5FA9\u500D\u7387",
          value: 24.44,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD041",
      lb: 4,
      sp: 90,
      burstSp: 45,
      displayEffects: [
        {
          label: "\u56DE\u5FA9\u500D\u7387",
          value: 26.36,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD041",
      lb: 5,
      sp: 90,
      burstSp: 45,
      displayEffects: [
        {
          label: "\u56DE\u5FA9\u500D\u7387",
          value: 28.41,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD041",
      lb: 6,
      sp: 90,
      burstSp: 45,
      displayEffects: [
        {
          label: "\u56DE\u5FA9\u500D\u7387",
          value: 30.56,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD041",
      lb: 7,
      sp: 90,
      burstSp: 45,
      displayEffects: [
        {
          label: "\u56DE\u5FA9\u500D\u7387",
          value: 32.81,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD041",
      lb: 8,
      sp: 90,
      burstSp: 45,
      displayEffects: [
        {
          label: "\u56DE\u5FA9\u500D\u7387",
          value: 35.13,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD041",
      lb: 9,
      sp: 90,
      burstSp: 45,
      displayEffects: [
        {
          label: "\u56DE\u5FA9\u500D\u7387",
          value: 37.53,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD041",
      lb: 10,
      sp: 90,
      burstSp: 45,
      displayEffects: [
        {
          label: "\u56DE\u5FA9\u500D\u7387",
          value: 40,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD042",
      lb: 0,
      sp: 190,
      burstSp: 95,
      displayEffects: [
        {
          label: "\u56DE\u5FA9\u500D\u7387",
          value: 45,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD042",
      lb: 1,
      sp: 190,
      burstSp: 95,
      displayEffects: [
        {
          label: "\u56DE\u5FA9\u500D\u7387",
          value: 47.53,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD042",
      lb: 2,
      sp: 190,
      burstSp: 95,
      displayEffects: [
        {
          label: "\u56DE\u5FA9\u500D\u7387",
          value: 51.02,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD042",
      lb: 3,
      sp: 190,
      burstSp: 95,
      displayEffects: [
        {
          label: "\u56DE\u5FA9\u500D\u7387",
          value: 54.99,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD042",
      lb: 4,
      sp: 190,
      burstSp: 95,
      displayEffects: [
        {
          label: "\u56DE\u5FA9\u500D\u7387",
          value: 59.31,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD042",
      lb: 5,
      sp: 190,
      burstSp: 95,
      displayEffects: [
        {
          label: "\u56DE\u5FA9\u500D\u7387",
          value: 63.92,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD042",
      lb: 6,
      sp: 190,
      burstSp: 95,
      displayEffects: [
        {
          label: "\u56DE\u5FA9\u500D\u7387",
          value: 68.76,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD042",
      lb: 7,
      sp: 190,
      burstSp: 95,
      displayEffects: [
        {
          label: "\u56DE\u5FA9\u500D\u7387",
          value: 73.81,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD042",
      lb: 8,
      sp: 190,
      burstSp: 95,
      displayEffects: [
        {
          label: "\u56DE\u5FA9\u500D\u7387",
          value: 79.05,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD042",
      lb: 9,
      sp: 190,
      burstSp: 95,
      displayEffects: [
        {
          label: "\u56DE\u5FA9\u500D\u7387",
          value: 84.45,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD042",
      lb: 10,
      sp: 190,
      burstSp: 95,
      displayEffects: [
        {
          label: "\u56DE\u5FA9\u500D\u7387",
          value: 90,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD043",
      lb: 0,
      sp: 65,
      burstSp: 33,
      displayEffects: [
        {
          label: "\u7D99\u7D9A\u56DE\u5FA9\u500D\u7387",
          value: 15,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD043",
      lb: 1,
      sp: 65,
      burstSp: 33,
      displayEffects: [
        {
          label: "\u7D99\u7D9A\u56DE\u5FA9\u500D\u7387",
          value: 15.84,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD043",
      lb: 2,
      sp: 65,
      burstSp: 33,
      displayEffects: [
        {
          label: "\u7D99\u7D9A\u56DE\u5FA9\u500D\u7387",
          value: 17.01,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD043",
      lb: 3,
      sp: 65,
      burstSp: 33,
      displayEffects: [
        {
          label: "\u7D99\u7D9A\u56DE\u5FA9\u500D\u7387",
          value: 18.33,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD043",
      lb: 4,
      sp: 65,
      burstSp: 33,
      displayEffects: [
        {
          label: "\u7D99\u7D9A\u56DE\u5FA9\u500D\u7387",
          value: 19.77,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD043",
      lb: 5,
      sp: 65,
      burstSp: 33,
      displayEffects: [
        {
          label: "\u7D99\u7D9A\u56DE\u5FA9\u500D\u7387",
          value: 21.31,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD043",
      lb: 6,
      sp: 65,
      burstSp: 33,
      displayEffects: [
        {
          label: "\u7D99\u7D9A\u56DE\u5FA9\u500D\u7387",
          value: 22.92,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD043",
      lb: 7,
      sp: 65,
      burstSp: 33,
      displayEffects: [
        {
          label: "\u7D99\u7D9A\u56DE\u5FA9\u500D\u7387",
          value: 24.6,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD043",
      lb: 8,
      sp: 65,
      burstSp: 33,
      displayEffects: [
        {
          label: "\u7D99\u7D9A\u56DE\u5FA9\u500D\u7387",
          value: 26.35,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD043",
      lb: 9,
      sp: 65,
      burstSp: 33,
      displayEffects: [
        {
          label: "\u7D99\u7D9A\u56DE\u5FA9\u500D\u7387",
          value: 28.15,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD043",
      lb: 10,
      sp: 65,
      burstSp: 33,
      displayEffects: [
        {
          label: "\u7D99\u7D9A\u56DE\u5FA9\u500D\u7387",
          value: 30,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD044",
      lb: 0,
      sp: 180,
      burstSp: 90,
      displayEffects: [
        {
          label: "\u8607\u751FHP\u5272\u5408",
          value: 20,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD044",
      lb: 1,
      sp: 180,
      burstSp: 90,
      displayEffects: [
        {
          label: "\u8607\u751FHP\u5272\u5408",
          value: 20.84,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD044",
      lb: 2,
      sp: 180,
      burstSp: 90,
      displayEffects: [
        {
          label: "\u8607\u751FHP\u5272\u5408",
          value: 22.01,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD044",
      lb: 3,
      sp: 180,
      burstSp: 90,
      displayEffects: [
        {
          label: "\u8607\u751FHP\u5272\u5408",
          value: 23.33,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD044",
      lb: 4,
      sp: 180,
      burstSp: 90,
      displayEffects: [
        {
          label: "\u8607\u751FHP\u5272\u5408",
          value: 24.77,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD044",
      lb: 5,
      sp: 180,
      burstSp: 90,
      displayEffects: [
        {
          label: "\u8607\u751FHP\u5272\u5408",
          value: 26.31,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD044",
      lb: 6,
      sp: 180,
      burstSp: 90,
      displayEffects: [
        {
          label: "\u8607\u751FHP\u5272\u5408",
          value: 27.92,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD044",
      lb: 7,
      sp: 180,
      burstSp: 90,
      displayEffects: [
        {
          label: "\u8607\u751FHP\u5272\u5408",
          value: 29.6,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD044",
      lb: 8,
      sp: 180,
      burstSp: 90,
      displayEffects: [
        {
          label: "\u8607\u751FHP\u5272\u5408",
          value: 31.35,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD044",
      lb: 9,
      sp: 180,
      burstSp: 90,
      displayEffects: [
        {
          label: "\u8607\u751FHP\u5272\u5408",
          value: 33.15,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD044",
      lb: 10,
      sp: 180,
      burstSp: 90,
      displayEffects: [
        {
          label: "\u8607\u751FHP\u5272\u5408",
          value: 35,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD045",
      lb: 0,
      sp: 55,
      burstSp: 28,
      displayEffects: [
        {
          label: "\u30B7\u30FC\u30EB\u30C9\u500D\u7387",
          value: 50,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD045",
      lb: 1,
      sp: 55,
      burstSp: 28,
      displayEffects: [
        {
          label: "\u30B7\u30FC\u30EB\u30C9\u500D\u7387",
          value: 52.81,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD045",
      lb: 2,
      sp: 55,
      burstSp: 28,
      displayEffects: [
        {
          label: "\u30B7\u30FC\u30EB\u30C9\u500D\u7387",
          value: 56.69,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD045",
      lb: 3,
      sp: 55,
      burstSp: 28,
      displayEffects: [
        {
          label: "\u30B7\u30FC\u30EB\u30C9\u500D\u7387",
          value: 61.1,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD045",
      lb: 4,
      sp: 55,
      burstSp: 28,
      displayEffects: [
        {
          label: "\u30B7\u30FC\u30EB\u30C9\u500D\u7387",
          value: 65.91,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD045",
      lb: 5,
      sp: 55,
      burstSp: 28,
      displayEffects: [
        {
          label: "\u30B7\u30FC\u30EB\u30C9\u500D\u7387",
          value: 71.02,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD045",
      lb: 6,
      sp: 55,
      burstSp: 28,
      displayEffects: [
        {
          label: "\u30B7\u30FC\u30EB\u30C9\u500D\u7387",
          value: 76.4,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD045",
      lb: 7,
      sp: 55,
      burstSp: 28,
      displayEffects: [
        {
          label: "\u30B7\u30FC\u30EB\u30C9\u500D\u7387",
          value: 82.01,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD045",
      lb: 8,
      sp: 55,
      burstSp: 28,
      displayEffects: [
        {
          label: "\u30B7\u30FC\u30EB\u30C9\u500D\u7387",
          value: 87.83,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD045",
      lb: 9,
      sp: 55,
      burstSp: 28,
      displayEffects: [
        {
          label: "\u30B7\u30FC\u30EB\u30C9\u500D\u7387",
          value: 93.83,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD045",
      lb: 10,
      sp: 55,
      burstSp: 28,
      displayEffects: [
        {
          label: "\u30B7\u30FC\u30EB\u30C9\u500D\u7387",
          value: 100,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD046",
      lb: 0,
      sp: 75,
      burstSp: 38,
      displayEffects: [
        {
          label: "\u30B7\u30FC\u30EB\u30C9\u500D\u7387",
          value: 65,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD046",
      lb: 1,
      sp: 75,
      burstSp: 38,
      displayEffects: [
        {
          label: "\u30B7\u30FC\u30EB\u30C9\u500D\u7387",
          value: 68.66,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD046",
      lb: 2,
      sp: 75,
      burstSp: 38,
      displayEffects: [
        {
          label: "\u30B7\u30FC\u30EB\u30C9\u500D\u7387",
          value: 73.69,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD046",
      lb: 3,
      sp: 75,
      burstSp: 38,
      displayEffects: [
        {
          label: "\u30B7\u30FC\u30EB\u30C9\u500D\u7387",
          value: 79.43,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD046",
      lb: 4,
      sp: 75,
      burstSp: 38,
      displayEffects: [
        {
          label: "\u30B7\u30FC\u30EB\u30C9\u500D\u7387",
          value: 85.68,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD046",
      lb: 5,
      sp: 75,
      burstSp: 38,
      displayEffects: [
        {
          label: "\u30B7\u30FC\u30EB\u30C9\u500D\u7387",
          value: 92.33,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD046",
      lb: 6,
      sp: 75,
      burstSp: 38,
      displayEffects: [
        {
          label: "\u30B7\u30FC\u30EB\u30C9\u500D\u7387",
          value: 99.32,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD046",
      lb: 7,
      sp: 75,
      burstSp: 38,
      displayEffects: [
        {
          label: "\u30B7\u30FC\u30EB\u30C9\u500D\u7387",
          value: 106.62,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD046",
      lb: 8,
      sp: 75,
      burstSp: 38,
      displayEffects: [
        {
          label: "\u30B7\u30FC\u30EB\u30C9\u500D\u7387",
          value: 114.18,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD046",
      lb: 9,
      sp: 75,
      burstSp: 38,
      displayEffects: [
        {
          label: "\u30B7\u30FC\u30EB\u30C9\u500D\u7387",
          value: 121.98,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD046",
      lb: 10,
      sp: 75,
      burstSp: 38,
      displayEffects: [
        {
          label: "\u30B7\u30FC\u30EB\u30C9\u500D\u7387",
          value: 130,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD047",
      lb: 0,
      sp: 180,
      burstSp: 90,
      displayEffects: [
        {
          label: "\u30B7\u30FC\u30EB\u30C9\u500D\u7387",
          value: 35,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD047",
      lb: 1,
      sp: 180,
      burstSp: 90,
      displayEffects: [
        {
          label: "\u30B7\u30FC\u30EB\u30C9\u500D\u7387",
          value: 36.97,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD047",
      lb: 2,
      sp: 180,
      burstSp: 90,
      displayEffects: [
        {
          label: "\u30B7\u30FC\u30EB\u30C9\u500D\u7387",
          value: 39.68,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD047",
      lb: 3,
      sp: 180,
      burstSp: 90,
      displayEffects: [
        {
          label: "\u30B7\u30FC\u30EB\u30C9\u500D\u7387",
          value: 42.77,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD047",
      lb: 4,
      sp: 180,
      burstSp: 90,
      displayEffects: [
        {
          label: "\u30B7\u30FC\u30EB\u30C9\u500D\u7387",
          value: 46.13,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD047",
      lb: 5,
      sp: 180,
      burstSp: 90,
      displayEffects: [
        {
          label: "\u30B7\u30FC\u30EB\u30C9\u500D\u7387",
          value: 49.72,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD047",
      lb: 6,
      sp: 180,
      burstSp: 90,
      displayEffects: [
        {
          label: "\u30B7\u30FC\u30EB\u30C9\u500D\u7387",
          value: 53.48,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD047",
      lb: 7,
      sp: 180,
      burstSp: 90,
      displayEffects: [
        {
          label: "\u30B7\u30FC\u30EB\u30C9\u500D\u7387",
          value: 57.41,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD047",
      lb: 8,
      sp: 180,
      burstSp: 90,
      displayEffects: [
        {
          label: "\u30B7\u30FC\u30EB\u30C9\u500D\u7387",
          value: 61.48,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD047",
      lb: 9,
      sp: 180,
      burstSp: 90,
      displayEffects: [
        {
          label: "\u30B7\u30FC\u30EB\u30C9\u500D\u7387",
          value: 65.68,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD047",
      lb: 10,
      sp: 180,
      burstSp: 90,
      displayEffects: [
        {
          label: "\u30B7\u30FC\u30EB\u30C9\u500D\u7387",
          value: 70,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD048",
      lb: 0,
      sp: 40,
      burstSp: 20,
      displayEffects: [
        {
          label: "\u4ED8\u4E0E\u7387",
          value: 100,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD048",
      lb: 1,
      sp: 40,
      burstSp: 20,
      displayEffects: [
        {
          label: "\u4ED8\u4E0E\u7387",
          value: 100,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD048",
      lb: 2,
      sp: 39,
      burstSp: 20,
      displayEffects: [
        {
          label: "\u4ED8\u4E0E\u7387",
          value: 100,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD048",
      lb: 3,
      sp: 39,
      burstSp: 20,
      displayEffects: [
        {
          label: "\u4ED8\u4E0E\u7387",
          value: 100,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD048",
      lb: 4,
      sp: 38,
      burstSp: 19,
      displayEffects: [
        {
          label: "\u4ED8\u4E0E\u7387",
          value: 100,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD048",
      lb: 5,
      sp: 37,
      burstSp: 19,
      displayEffects: [
        {
          label: "\u4ED8\u4E0E\u7387",
          value: 100,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD048",
      lb: 6,
      sp: 36,
      burstSp: 18,
      displayEffects: [
        {
          label: "\u4ED8\u4E0E\u7387",
          value: 100,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD048",
      lb: 7,
      sp: 35,
      burstSp: 18,
      displayEffects: [
        {
          label: "\u4ED8\u4E0E\u7387",
          value: 100,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD048",
      lb: 8,
      sp: 34,
      burstSp: 17,
      displayEffects: [
        {
          label: "\u4ED8\u4E0E\u7387",
          value: 100,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD048",
      lb: 9,
      sp: 33,
      burstSp: 17,
      displayEffects: [
        {
          label: "\u4ED8\u4E0E\u7387",
          value: 100,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD048",
      lb: 10,
      sp: 32,
      burstSp: 16,
      displayEffects: [
        {
          label: "\u4ED8\u4E0E\u7387",
          value: 100,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD049",
      lb: 0,
      sp: 65,
      burstSp: 33,
      displayEffects: [
        {
          label: "\u53CD\u6483\u500D\u7387",
          value: 45,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD049",
      lb: 1,
      sp: 65,
      burstSp: 33,
      displayEffects: [
        {
          label: "\u53CD\u6483\u500D\u7387",
          value: 46.97,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD049",
      lb: 2,
      sp: 65,
      burstSp: 33,
      displayEffects: [
        {
          label: "\u53CD\u6483\u500D\u7387",
          value: 49.68,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD049",
      lb: 3,
      sp: 65,
      burstSp: 33,
      displayEffects: [
        {
          label: "\u53CD\u6483\u500D\u7387",
          value: 52.77,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD049",
      lb: 4,
      sp: 65,
      burstSp: 33,
      displayEffects: [
        {
          label: "\u53CD\u6483\u500D\u7387",
          value: 56.13,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD049",
      lb: 5,
      sp: 65,
      burstSp: 33,
      displayEffects: [
        {
          label: "\u53CD\u6483\u500D\u7387",
          value: 59.72,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD049",
      lb: 6,
      sp: 65,
      burstSp: 33,
      displayEffects: [
        {
          label: "\u53CD\u6483\u500D\u7387",
          value: 63.48,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD049",
      lb: 7,
      sp: 65,
      burstSp: 33,
      displayEffects: [
        {
          label: "\u53CD\u6483\u500D\u7387",
          value: 67.41,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD049",
      lb: 8,
      sp: 65,
      burstSp: 33,
      displayEffects: [
        {
          label: "\u53CD\u6483\u500D\u7387",
          value: 71.48,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD049",
      lb: 9,
      sp: 65,
      burstSp: 33,
      displayEffects: [
        {
          label: "\u53CD\u6483\u500D\u7387",
          value: 75.68,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD049",
      lb: 10,
      sp: 65,
      burstSp: 33,
      displayEffects: [
        {
          label: "\u53CD\u6483\u500D\u7387",
          value: 80,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD050",
      lb: 0,
      sp: 110,
      burstSp: 55,
      displayEffects: [
        {
          label: "\u4ED8\u4E0E\u7387",
          value: 100,
          unit: "%"
        },
        {
          label: "\u53CD\u6483\u500D\u7387",
          value: 55,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD050",
      lb: 1,
      sp: 110,
      burstSp: 55,
      displayEffects: [
        {
          label: "\u4ED8\u4E0E\u7387",
          value: 100,
          unit: "%"
        },
        {
          label: "\u53CD\u6483\u500D\u7387",
          value: 57.53,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD050",
      lb: 2,
      sp: 110,
      burstSp: 55,
      displayEffects: [
        {
          label: "\u4ED8\u4E0E\u7387",
          value: 100,
          unit: "%"
        },
        {
          label: "\u53CD\u6483\u500D\u7387",
          value: 61.02,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD050",
      lb: 3,
      sp: 110,
      burstSp: 55,
      displayEffects: [
        {
          label: "\u4ED8\u4E0E\u7387",
          value: 100,
          unit: "%"
        },
        {
          label: "\u53CD\u6483\u500D\u7387",
          value: 64.99,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD050",
      lb: 4,
      sp: 110,
      burstSp: 55,
      displayEffects: [
        {
          label: "\u4ED8\u4E0E\u7387",
          value: 100,
          unit: "%"
        },
        {
          label: "\u53CD\u6483\u500D\u7387",
          value: 69.31,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD050",
      lb: 5,
      sp: 110,
      burstSp: 55,
      displayEffects: [
        {
          label: "\u4ED8\u4E0E\u7387",
          value: 100,
          unit: "%"
        },
        {
          label: "\u53CD\u6483\u500D\u7387",
          value: 73.92,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD050",
      lb: 6,
      sp: 110,
      burstSp: 55,
      displayEffects: [
        {
          label: "\u4ED8\u4E0E\u7387",
          value: 100,
          unit: "%"
        },
        {
          label: "\u53CD\u6483\u500D\u7387",
          value: 78.76,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD050",
      lb: 7,
      sp: 110,
      burstSp: 55,
      displayEffects: [
        {
          label: "\u4ED8\u4E0E\u7387",
          value: 100,
          unit: "%"
        },
        {
          label: "\u53CD\u6483\u500D\u7387",
          value: 83.81,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD050",
      lb: 8,
      sp: 110,
      burstSp: 55,
      displayEffects: [
        {
          label: "\u4ED8\u4E0E\u7387",
          value: 100,
          unit: "%"
        },
        {
          label: "\u53CD\u6483\u500D\u7387",
          value: 89.05,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD050",
      lb: 9,
      sp: 110,
      burstSp: 55,
      displayEffects: [
        {
          label: "\u4ED8\u4E0E\u7387",
          value: 100,
          unit: "%"
        },
        {
          label: "\u53CD\u6483\u500D\u7387",
          value: 94.45,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD050",
      lb: 10,
      sp: 110,
      burstSp: 55,
      displayEffects: [
        {
          label: "\u4ED8\u4E0E\u7387",
          value: 100,
          unit: "%"
        },
        {
          label: "\u53CD\u6483\u500D\u7387",
          value: 100,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD051",
      lb: 0,
      sp: 45,
      burstSp: 23,
      displayEffects: [
        {
          label: "\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        }
      ]
    },
    {
      designId: "SKD051",
      lb: 1,
      sp: 45,
      burstSp: 23,
      displayEffects: [
        {
          label: "\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        }
      ]
    },
    {
      designId: "SKD051",
      lb: 2,
      sp: 44,
      burstSp: 22,
      displayEffects: [
        {
          label: "\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        }
      ]
    },
    {
      designId: "SKD051",
      lb: 3,
      sp: 44,
      burstSp: 22,
      displayEffects: [
        {
          label: "\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        }
      ]
    },
    {
      designId: "SKD051",
      lb: 4,
      sp: 43,
      burstSp: 22,
      displayEffects: [
        {
          label: "\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        }
      ]
    },
    {
      designId: "SKD051",
      lb: 5,
      sp: 42,
      burstSp: 21,
      displayEffects: [
        {
          label: "\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        }
      ]
    },
    {
      designId: "SKD051",
      lb: 6,
      sp: 41,
      burstSp: 21,
      displayEffects: [
        {
          label: "\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        }
      ]
    },
    {
      designId: "SKD051",
      lb: 7,
      sp: 40,
      burstSp: 20,
      displayEffects: [
        {
          label: "\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        }
      ]
    },
    {
      designId: "SKD051",
      lb: 8,
      sp: 39,
      burstSp: 20,
      displayEffects: [
        {
          label: "\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        }
      ]
    },
    {
      designId: "SKD051",
      lb: 9,
      sp: 38,
      burstSp: 19,
      displayEffects: [
        {
          label: "\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        }
      ]
    },
    {
      designId: "SKD051",
      lb: 10,
      sp: 36,
      burstSp: 18,
      displayEffects: [
        {
          label: "\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        }
      ]
    },
    {
      designId: "SKD052",
      lb: 0,
      sp: 45,
      burstSp: 23,
      displayEffects: [
        {
          label: "\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        }
      ]
    },
    {
      designId: "SKD052",
      lb: 1,
      sp: 45,
      burstSp: 23,
      displayEffects: [
        {
          label: "\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        }
      ]
    },
    {
      designId: "SKD052",
      lb: 2,
      sp: 44,
      burstSp: 22,
      displayEffects: [
        {
          label: "\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        }
      ]
    },
    {
      designId: "SKD052",
      lb: 3,
      sp: 44,
      burstSp: 22,
      displayEffects: [
        {
          label: "\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        }
      ]
    },
    {
      designId: "SKD052",
      lb: 4,
      sp: 43,
      burstSp: 22,
      displayEffects: [
        {
          label: "\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        }
      ]
    },
    {
      designId: "SKD052",
      lb: 5,
      sp: 42,
      burstSp: 21,
      displayEffects: [
        {
          label: "\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        }
      ]
    },
    {
      designId: "SKD052",
      lb: 6,
      sp: 41,
      burstSp: 21,
      displayEffects: [
        {
          label: "\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        }
      ]
    },
    {
      designId: "SKD052",
      lb: 7,
      sp: 40,
      burstSp: 20,
      displayEffects: [
        {
          label: "\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        }
      ]
    },
    {
      designId: "SKD052",
      lb: 8,
      sp: 39,
      burstSp: 20,
      displayEffects: [
        {
          label: "\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        }
      ]
    },
    {
      designId: "SKD052",
      lb: 9,
      sp: 38,
      burstSp: 19,
      displayEffects: [
        {
          label: "\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        }
      ]
    },
    {
      designId: "SKD052",
      lb: 10,
      sp: 36,
      burstSp: 18,
      displayEffects: [
        {
          label: "\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        }
      ]
    },
    {
      designId: "SKD053",
      lb: 0,
      sp: 40,
      burstSp: 20,
      displayEffects: [
        {
          label: "\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        }
      ]
    },
    {
      designId: "SKD053",
      lb: 1,
      sp: 40,
      burstSp: 20,
      displayEffects: [
        {
          label: "\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        }
      ]
    },
    {
      designId: "SKD053",
      lb: 2,
      sp: 39,
      burstSp: 20,
      displayEffects: [
        {
          label: "\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        }
      ]
    },
    {
      designId: "SKD053",
      lb: 3,
      sp: 39,
      burstSp: 20,
      displayEffects: [
        {
          label: "\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        }
      ]
    },
    {
      designId: "SKD053",
      lb: 4,
      sp: 38,
      burstSp: 19,
      displayEffects: [
        {
          label: "\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        }
      ]
    },
    {
      designId: "SKD053",
      lb: 5,
      sp: 37,
      burstSp: 19,
      displayEffects: [
        {
          label: "\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        }
      ]
    },
    {
      designId: "SKD053",
      lb: 6,
      sp: 36,
      burstSp: 18,
      displayEffects: [
        {
          label: "\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        }
      ]
    },
    {
      designId: "SKD053",
      lb: 7,
      sp: 35,
      burstSp: 18,
      displayEffects: [
        {
          label: "\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        }
      ]
    },
    {
      designId: "SKD053",
      lb: 8,
      sp: 34,
      burstSp: 17,
      displayEffects: [
        {
          label: "\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        }
      ]
    },
    {
      designId: "SKD053",
      lb: 9,
      sp: 33,
      burstSp: 17,
      displayEffects: [
        {
          label: "\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        }
      ]
    },
    {
      designId: "SKD053",
      lb: 10,
      sp: 32,
      burstSp: 16,
      displayEffects: [
        {
          label: "\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        }
      ]
    },
    {
      designId: "SKD054",
      lb: 0,
      sp: 40,
      burstSp: 20,
      displayEffects: [
        {
          label: "\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        }
      ]
    },
    {
      designId: "SKD054",
      lb: 1,
      sp: 40,
      burstSp: 20,
      displayEffects: [
        {
          label: "\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        }
      ]
    },
    {
      designId: "SKD054",
      lb: 2,
      sp: 39,
      burstSp: 20,
      displayEffects: [
        {
          label: "\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        }
      ]
    },
    {
      designId: "SKD054",
      lb: 3,
      sp: 39,
      burstSp: 20,
      displayEffects: [
        {
          label: "\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        }
      ]
    },
    {
      designId: "SKD054",
      lb: 4,
      sp: 38,
      burstSp: 19,
      displayEffects: [
        {
          label: "\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        }
      ]
    },
    {
      designId: "SKD054",
      lb: 5,
      sp: 37,
      burstSp: 19,
      displayEffects: [
        {
          label: "\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        }
      ]
    },
    {
      designId: "SKD054",
      lb: 6,
      sp: 36,
      burstSp: 18,
      displayEffects: [
        {
          label: "\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        }
      ]
    },
    {
      designId: "SKD054",
      lb: 7,
      sp: 35,
      burstSp: 18,
      displayEffects: [
        {
          label: "\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        }
      ]
    },
    {
      designId: "SKD054",
      lb: 8,
      sp: 34,
      burstSp: 17,
      displayEffects: [
        {
          label: "\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        }
      ]
    },
    {
      designId: "SKD054",
      lb: 9,
      sp: 33,
      burstSp: 17,
      displayEffects: [
        {
          label: "\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        }
      ]
    },
    {
      designId: "SKD054",
      lb: 10,
      sp: 32,
      burstSp: 16,
      displayEffects: [
        {
          label: "\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        }
      ]
    },
    {
      designId: "SKD055",
      lb: 0,
      sp: 55,
      burstSp: 28,
      displayEffects: [
        {
          label: "\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        }
      ]
    },
    {
      designId: "SKD055",
      lb: 1,
      sp: 55,
      burstSp: 28,
      displayEffects: [
        {
          label: "\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        }
      ]
    },
    {
      designId: "SKD055",
      lb: 2,
      sp: 54,
      burstSp: 27,
      displayEffects: [
        {
          label: "\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        }
      ]
    },
    {
      designId: "SKD055",
      lb: 3,
      sp: 53,
      burstSp: 27,
      displayEffects: [
        {
          label: "\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        }
      ]
    },
    {
      designId: "SKD055",
      lb: 4,
      sp: 52,
      burstSp: 26,
      displayEffects: [
        {
          label: "\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        }
      ]
    },
    {
      designId: "SKD055",
      lb: 5,
      sp: 51,
      burstSp: 26,
      displayEffects: [
        {
          label: "\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        }
      ]
    },
    {
      designId: "SKD055",
      lb: 6,
      sp: 50,
      burstSp: 25,
      displayEffects: [
        {
          label: "\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        }
      ]
    },
    {
      designId: "SKD055",
      lb: 7,
      sp: 48,
      burstSp: 24,
      displayEffects: [
        {
          label: "\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        }
      ]
    },
    {
      designId: "SKD055",
      lb: 8,
      sp: 47,
      burstSp: 24,
      displayEffects: [
        {
          label: "\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        }
      ]
    },
    {
      designId: "SKD055",
      lb: 9,
      sp: 46,
      burstSp: 23,
      displayEffects: [
        {
          label: "\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        }
      ]
    },
    {
      designId: "SKD055",
      lb: 10,
      sp: 44,
      burstSp: 22,
      displayEffects: [
        {
          label: "\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        }
      ]
    },
    {
      designId: "SKD056",
      lb: 0,
      sp: 135,
      burstSp: 68,
      displayEffects: [
        {
          label: "\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        },
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 120,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD056",
      lb: 1,
      sp: 135,
      burstSp: 68,
      displayEffects: [
        {
          label: "\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        },
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 125.62,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD056",
      lb: 2,
      sp: 135,
      burstSp: 68,
      displayEffects: [
        {
          label: "\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        },
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 133.37,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD056",
      lb: 3,
      sp: 135,
      burstSp: 68,
      displayEffects: [
        {
          label: "\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        },
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 142.2,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD056",
      lb: 4,
      sp: 135,
      burstSp: 68,
      displayEffects: [
        {
          label: "\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        },
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 151.81,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD056",
      lb: 5,
      sp: 135,
      burstSp: 68,
      displayEffects: [
        {
          label: "\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        },
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 162.04,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD056",
      lb: 6,
      sp: 135,
      burstSp: 68,
      displayEffects: [
        {
          label: "\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        },
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 172.81,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD056",
      lb: 7,
      sp: 135,
      burstSp: 68,
      displayEffects: [
        {
          label: "\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        },
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 184.03,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD056",
      lb: 8,
      sp: 135,
      burstSp: 68,
      displayEffects: [
        {
          label: "\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        },
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 195.66,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD056",
      lb: 9,
      sp: 135,
      burstSp: 68,
      displayEffects: [
        {
          label: "\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        },
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 207.66,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD056",
      lb: 10,
      sp: 135,
      burstSp: 68,
      displayEffects: [
        {
          label: "\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        },
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 220,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD057",
      lb: 0,
      sp: 115,
      burstSp: 58,
      displayEffects: [
        {
          label: "DEF\u4F4E\u4E0B",
          value: 10,
          unit: "%"
        },
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 110,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD057",
      lb: 1,
      sp: 115,
      burstSp: 58,
      displayEffects: [
        {
          label: "DEF\u4F4E\u4E0B",
          value: 10.56,
          unit: "%"
        },
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 115.06,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD057",
      lb: 2,
      sp: 115,
      burstSp: 58,
      displayEffects: [
        {
          label: "DEF\u4F4E\u4E0B",
          value: 11.34,
          unit: "%"
        },
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 122.04,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD057",
      lb: 3,
      sp: 115,
      burstSp: 58,
      displayEffects: [
        {
          label: "DEF\u4F4E\u4E0B",
          value: 12.22,
          unit: "%"
        },
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 129.98,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD057",
      lb: 4,
      sp: 115,
      burstSp: 58,
      displayEffects: [
        {
          label: "DEF\u4F4E\u4E0B",
          value: 13.18,
          unit: "%"
        },
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 138.63,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD057",
      lb: 5,
      sp: 115,
      burstSp: 58,
      displayEffects: [
        {
          label: "DEF\u4F4E\u4E0B",
          value: 14.2,
          unit: "%"
        },
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 147.84,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD057",
      lb: 6,
      sp: 115,
      burstSp: 58,
      displayEffects: [
        {
          label: "DEF\u4F4E\u4E0B",
          value: 15.28,
          unit: "%"
        },
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 157.53,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD057",
      lb: 7,
      sp: 115,
      burstSp: 58,
      displayEffects: [
        {
          label: "DEF\u4F4E\u4E0B",
          value: 16.4,
          unit: "%"
        },
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 167.63,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD057",
      lb: 8,
      sp: 115,
      burstSp: 58,
      displayEffects: [
        {
          label: "DEF\u4F4E\u4E0B",
          value: 17.57,
          unit: "%"
        },
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 178.09,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD057",
      lb: 9,
      sp: 115,
      burstSp: 58,
      displayEffects: [
        {
          label: "DEF\u4F4E\u4E0B",
          value: 18.77,
          unit: "%"
        },
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 188.89,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD057",
      lb: 10,
      sp: 115,
      burstSp: 58,
      displayEffects: [
        {
          label: "DEF\u4F4E\u4E0B",
          value: 20,
          unit: "%"
        },
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 200,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD058",
      lb: 0,
      sp: 110,
      burstSp: 55,
      displayEffects: [
        {
          label: "\u7D99\u7D9A\u30C0\u30E1\u30FC\u30B8\u500D\u7387",
          value: 12,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD058",
      lb: 1,
      sp: 110,
      burstSp: 55,
      displayEffects: [
        {
          label: "\u7D99\u7D9A\u30C0\u30E1\u30FC\u30B8\u500D\u7387",
          value: 12.73,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD058",
      lb: 2,
      sp: 110,
      burstSp: 55,
      displayEffects: [
        {
          label: "\u7D99\u7D9A\u30C0\u30E1\u30FC\u30B8\u500D\u7387",
          value: 13.74,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD058",
      lb: 3,
      sp: 110,
      burstSp: 55,
      displayEffects: [
        {
          label: "\u7D99\u7D9A\u30C0\u30E1\u30FC\u30B8\u500D\u7387",
          value: 14.89,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD058",
      lb: 4,
      sp: 110,
      burstSp: 55,
      displayEffects: [
        {
          label: "\u7D99\u7D9A\u30C0\u30E1\u30FC\u30B8\u500D\u7387",
          value: 16.14,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD058",
      lb: 5,
      sp: 110,
      burstSp: 55,
      displayEffects: [
        {
          label: "\u7D99\u7D9A\u30C0\u30E1\u30FC\u30B8\u500D\u7387",
          value: 17.47,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD058",
      lb: 6,
      sp: 110,
      burstSp: 55,
      displayEffects: [
        {
          label: "\u7D99\u7D9A\u30C0\u30E1\u30FC\u30B8\u500D\u7387",
          value: 18.86,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD058",
      lb: 7,
      sp: 110,
      burstSp: 55,
      displayEffects: [
        {
          label: "\u7D99\u7D9A\u30C0\u30E1\u30FC\u30B8\u500D\u7387",
          value: 20.32,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD058",
      lb: 8,
      sp: 110,
      burstSp: 55,
      displayEffects: [
        {
          label: "\u7D99\u7D9A\u30C0\u30E1\u30FC\u30B8\u500D\u7387",
          value: 21.84,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD058",
      lb: 9,
      sp: 110,
      burstSp: 55,
      displayEffects: [
        {
          label: "\u7D99\u7D9A\u30C0\u30E1\u30FC\u30B8\u500D\u7387",
          value: 23.4,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD058",
      lb: 10,
      sp: 110,
      burstSp: 55,
      displayEffects: [
        {
          label: "\u7D99\u7D9A\u30C0\u30E1\u30FC\u30B8\u500D\u7387",
          value: 25,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD059",
      lb: 0,
      sp: 130,
      burstSp: 65,
      displayEffects: [
        {
          label: "\u901A\u5E38\u500D\u7387",
          value: 65,
          unit: "%"
        },
        {
          label: "\u6761\u4EF6\u500D\u7387",
          value: 85,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD059",
      lb: 1,
      sp: 130,
      burstSp: 65,
      displayEffects: [
        {
          label: "\u901A\u5E38\u500D\u7387",
          value: 66.97,
          unit: "%"
        },
        {
          label: "\u6761\u4EF6\u500D\u7387",
          value: 88.37,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD059",
      lb: 2,
      sp: 130,
      burstSp: 65,
      displayEffects: [
        {
          label: "\u901A\u5E38\u500D\u7387",
          value: 69.68,
          unit: "%"
        },
        {
          label: "\u6761\u4EF6\u500D\u7387",
          value: 93.02,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD059",
      lb: 3,
      sp: 130,
      burstSp: 65,
      displayEffects: [
        {
          label: "\u901A\u5E38\u500D\u7387",
          value: 72.77,
          unit: "%"
        },
        {
          label: "\u6761\u4EF6\u500D\u7387",
          value: 98.32,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD059",
      lb: 4,
      sp: 130,
      burstSp: 65,
      displayEffects: [
        {
          label: "\u901A\u5E38\u500D\u7387",
          value: 76.13,
          unit: "%"
        },
        {
          label: "\u6761\u4EF6\u500D\u7387",
          value: 104.09,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD059",
      lb: 5,
      sp: 130,
      burstSp: 65,
      displayEffects: [
        {
          label: "\u901A\u5E38\u500D\u7387",
          value: 79.72,
          unit: "%"
        },
        {
          label: "\u6761\u4EF6\u500D\u7387",
          value: 110.23,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD059",
      lb: 6,
      sp: 130,
      burstSp: 65,
      displayEffects: [
        {
          label: "\u901A\u5E38\u500D\u7387",
          value: 83.48,
          unit: "%"
        },
        {
          label: "\u6761\u4EF6\u500D\u7387",
          value: 116.68,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD059",
      lb: 7,
      sp: 130,
      burstSp: 65,
      displayEffects: [
        {
          label: "\u901A\u5E38\u500D\u7387",
          value: 87.41,
          unit: "%"
        },
        {
          label: "\u6761\u4EF6\u500D\u7387",
          value: 123.42,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD059",
      lb: 8,
      sp: 130,
      burstSp: 65,
      displayEffects: [
        {
          label: "\u901A\u5E38\u500D\u7387",
          value: 91.48,
          unit: "%"
        },
        {
          label: "\u6761\u4EF6\u500D\u7387",
          value: 130.4,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD059",
      lb: 9,
      sp: 130,
      burstSp: 65,
      displayEffects: [
        {
          label: "\u901A\u5E38\u500D\u7387",
          value: 95.68,
          unit: "%"
        },
        {
          label: "\u6761\u4EF6\u500D\u7387",
          value: 137.6,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD059",
      lb: 10,
      sp: 130,
      burstSp: 65,
      displayEffects: [
        {
          label: "\u901A\u5E38\u500D\u7387",
          value: 100,
          unit: "%"
        },
        {
          label: "\u6761\u4EF6\u500D\u7387",
          value: 145,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD060",
      lb: 0,
      sp: 130,
      burstSp: 65,
      displayEffects: [
        {
          label: "\u901A\u5E38\u500D\u7387",
          value: 65,
          unit: "%"
        },
        {
          label: "\u6761\u4EF6\u500D\u7387",
          value: 90,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD060",
      lb: 1,
      sp: 130,
      burstSp: 65,
      displayEffects: [
        {
          label: "\u901A\u5E38\u500D\u7387",
          value: 66.97,
          unit: "%"
        },
        {
          label: "\u6761\u4EF6\u500D\u7387",
          value: 93.66,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD060",
      lb: 2,
      sp: 130,
      burstSp: 65,
      displayEffects: [
        {
          label: "\u901A\u5E38\u500D\u7387",
          value: 69.68,
          unit: "%"
        },
        {
          label: "\u6761\u4EF6\u500D\u7387",
          value: 98.69,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD060",
      lb: 3,
      sp: 130,
      burstSp: 65,
      displayEffects: [
        {
          label: "\u901A\u5E38\u500D\u7387",
          value: 72.77,
          unit: "%"
        },
        {
          label: "\u6761\u4EF6\u500D\u7387",
          value: 104.43,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD060",
      lb: 4,
      sp: 130,
      burstSp: 65,
      displayEffects: [
        {
          label: "\u901A\u5E38\u500D\u7387",
          value: 76.13,
          unit: "%"
        },
        {
          label: "\u6761\u4EF6\u500D\u7387",
          value: 110.68,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD060",
      lb: 5,
      sp: 130,
      burstSp: 65,
      displayEffects: [
        {
          label: "\u901A\u5E38\u500D\u7387",
          value: 79.72,
          unit: "%"
        },
        {
          label: "\u6761\u4EF6\u500D\u7387",
          value: 117.33,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD060",
      lb: 6,
      sp: 130,
      burstSp: 65,
      displayEffects: [
        {
          label: "\u901A\u5E38\u500D\u7387",
          value: 83.48,
          unit: "%"
        },
        {
          label: "\u6761\u4EF6\u500D\u7387",
          value: 124.32,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD060",
      lb: 7,
      sp: 130,
      burstSp: 65,
      displayEffects: [
        {
          label: "\u901A\u5E38\u500D\u7387",
          value: 87.41,
          unit: "%"
        },
        {
          label: "\u6761\u4EF6\u500D\u7387",
          value: 131.62,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD060",
      lb: 8,
      sp: 130,
      burstSp: 65,
      displayEffects: [
        {
          label: "\u901A\u5E38\u500D\u7387",
          value: 91.48,
          unit: "%"
        },
        {
          label: "\u6761\u4EF6\u500D\u7387",
          value: 139.18,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD060",
      lb: 9,
      sp: 130,
      burstSp: 65,
      displayEffects: [
        {
          label: "\u901A\u5E38\u500D\u7387",
          value: 95.68,
          unit: "%"
        },
        {
          label: "\u6761\u4EF6\u500D\u7387",
          value: 146.98,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD060",
      lb: 10,
      sp: 130,
      burstSp: 65,
      displayEffects: [
        {
          label: "\u901A\u5E38\u500D\u7387",
          value: 100,
          unit: "%"
        },
        {
          label: "\u6761\u4EF6\u500D\u7387",
          value: 155,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD061",
      lb: 0,
      sp: 45,
      burstSp: 23,
      displayEffects: [
        {
          label: "ATK\u5F37\u5316",
          value: 10,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD061",
      lb: 1,
      sp: 45,
      burstSp: 23,
      displayEffects: [
        {
          label: "ATK\u5F37\u5316",
          value: 10.56,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD061",
      lb: 2,
      sp: 45,
      burstSp: 23,
      displayEffects: [
        {
          label: "ATK\u5F37\u5316",
          value: 11.34,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD061",
      lb: 3,
      sp: 45,
      burstSp: 23,
      displayEffects: [
        {
          label: "ATK\u5F37\u5316",
          value: 12.22,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD061",
      lb: 4,
      sp: 45,
      burstSp: 23,
      displayEffects: [
        {
          label: "ATK\u5F37\u5316",
          value: 13.18,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD061",
      lb: 5,
      sp: 45,
      burstSp: 23,
      displayEffects: [
        {
          label: "ATK\u5F37\u5316",
          value: 14.2,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD061",
      lb: 6,
      sp: 45,
      burstSp: 23,
      displayEffects: [
        {
          label: "ATK\u5F37\u5316",
          value: 15.28,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD061",
      lb: 7,
      sp: 45,
      burstSp: 23,
      displayEffects: [
        {
          label: "ATK\u5F37\u5316",
          value: 16.4,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD061",
      lb: 8,
      sp: 45,
      burstSp: 23,
      displayEffects: [
        {
          label: "ATK\u5F37\u5316",
          value: 17.57,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD061",
      lb: 9,
      sp: 45,
      burstSp: 23,
      displayEffects: [
        {
          label: "ATK\u5F37\u5316",
          value: 18.77,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD061",
      lb: 10,
      sp: 45,
      burstSp: 23,
      displayEffects: [
        {
          label: "ATK\u5F37\u5316",
          value: 20,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD062",
      lb: 0,
      sp: 45,
      burstSp: 23,
      displayEffects: [
        {
          label: "DEF\u5F37\u5316",
          value: 20,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD062",
      lb: 1,
      sp: 45,
      burstSp: 23,
      displayEffects: [
        {
          label: "DEF\u5F37\u5316",
          value: 21.12,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD062",
      lb: 2,
      sp: 45,
      burstSp: 23,
      displayEffects: [
        {
          label: "DEF\u5F37\u5316",
          value: 22.67,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD062",
      lb: 3,
      sp: 45,
      burstSp: 23,
      displayEffects: [
        {
          label: "DEF\u5F37\u5316",
          value: 24.44,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD062",
      lb: 4,
      sp: 45,
      burstSp: 23,
      displayEffects: [
        {
          label: "DEF\u5F37\u5316",
          value: 26.36,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD062",
      lb: 5,
      sp: 45,
      burstSp: 23,
      displayEffects: [
        {
          label: "DEF\u5F37\u5316",
          value: 28.41,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD062",
      lb: 6,
      sp: 45,
      burstSp: 23,
      displayEffects: [
        {
          label: "DEF\u5F37\u5316",
          value: 30.56,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD062",
      lb: 7,
      sp: 45,
      burstSp: 23,
      displayEffects: [
        {
          label: "DEF\u5F37\u5316",
          value: 32.81,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD062",
      lb: 8,
      sp: 45,
      burstSp: 23,
      displayEffects: [
        {
          label: "DEF\u5F37\u5316",
          value: 35.13,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD062",
      lb: 9,
      sp: 45,
      burstSp: 23,
      displayEffects: [
        {
          label: "DEF\u5F37\u5316",
          value: 37.53,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD062",
      lb: 10,
      sp: 45,
      burstSp: 23,
      displayEffects: [
        {
          label: "DEF\u5F37\u5316",
          value: 40,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD063",
      lb: 0,
      sp: 100,
      burstSp: 50,
      displayEffects: [
        {
          label: "DEF\u4F4E\u4E0B",
          value: 15,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD063",
      lb: 1,
      sp: 100,
      burstSp: 50,
      displayEffects: [
        {
          label: "DEF\u4F4E\u4E0B",
          value: 15.84,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD063",
      lb: 2,
      sp: 100,
      burstSp: 50,
      displayEffects: [
        {
          label: "DEF\u4F4E\u4E0B",
          value: 17.01,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD063",
      lb: 3,
      sp: 100,
      burstSp: 50,
      displayEffects: [
        {
          label: "DEF\u4F4E\u4E0B",
          value: 18.33,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD063",
      lb: 4,
      sp: 100,
      burstSp: 50,
      displayEffects: [
        {
          label: "DEF\u4F4E\u4E0B",
          value: 19.77,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD063",
      lb: 5,
      sp: 100,
      burstSp: 50,
      displayEffects: [
        {
          label: "DEF\u4F4E\u4E0B",
          value: 21.31,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD063",
      lb: 6,
      sp: 100,
      burstSp: 50,
      displayEffects: [
        {
          label: "DEF\u4F4E\u4E0B",
          value: 22.92,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD063",
      lb: 7,
      sp: 100,
      burstSp: 50,
      displayEffects: [
        {
          label: "DEF\u4F4E\u4E0B",
          value: 24.6,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD063",
      lb: 8,
      sp: 100,
      burstSp: 50,
      displayEffects: [
        {
          label: "DEF\u4F4E\u4E0B",
          value: 26.35,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD063",
      lb: 9,
      sp: 100,
      burstSp: 50,
      displayEffects: [
        {
          label: "DEF\u4F4E\u4E0B",
          value: 28.15,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD063",
      lb: 10,
      sp: 100,
      burstSp: 50,
      displayEffects: [
        {
          label: "DEF\u4F4E\u4E0B",
          value: 30,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD064",
      lb: 0,
      sp: 100,
      burstSp: 50,
      displayEffects: [
        {
          label: "ATK\u4F4E\u4E0B",
          value: 10,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD064",
      lb: 1,
      sp: 100,
      burstSp: 50,
      displayEffects: [
        {
          label: "ATK\u4F4E\u4E0B",
          value: 10.56,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD064",
      lb: 2,
      sp: 100,
      burstSp: 50,
      displayEffects: [
        {
          label: "ATK\u4F4E\u4E0B",
          value: 11.34,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD064",
      lb: 3,
      sp: 100,
      burstSp: 50,
      displayEffects: [
        {
          label: "ATK\u4F4E\u4E0B",
          value: 12.22,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD064",
      lb: 4,
      sp: 100,
      burstSp: 50,
      displayEffects: [
        {
          label: "ATK\u4F4E\u4E0B",
          value: 13.18,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD064",
      lb: 5,
      sp: 100,
      burstSp: 50,
      displayEffects: [
        {
          label: "ATK\u4F4E\u4E0B",
          value: 14.2,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD064",
      lb: 6,
      sp: 100,
      burstSp: 50,
      displayEffects: [
        {
          label: "ATK\u4F4E\u4E0B",
          value: 15.28,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD064",
      lb: 7,
      sp: 100,
      burstSp: 50,
      displayEffects: [
        {
          label: "ATK\u4F4E\u4E0B",
          value: 16.4,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD064",
      lb: 8,
      sp: 100,
      burstSp: 50,
      displayEffects: [
        {
          label: "ATK\u4F4E\u4E0B",
          value: 17.57,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD064",
      lb: 9,
      sp: 100,
      burstSp: 50,
      displayEffects: [
        {
          label: "ATK\u4F4E\u4E0B",
          value: 18.77,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD064",
      lb: 10,
      sp: 100,
      burstSp: 50,
      displayEffects: [
        {
          label: "ATK\u4F4E\u4E0B",
          value: 20,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD065",
      lb: 0,
      sp: 135,
      burstSp: 68,
      displayEffects: [
        {
          label: "\u4ED8\u4E0E\u7387",
          value: 30,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD065",
      lb: 1,
      sp: 135,
      burstSp: 68,
      displayEffects: [
        {
          label: "\u4ED8\u4E0E\u7387",
          value: 31.12,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD065",
      lb: 2,
      sp: 135,
      burstSp: 68,
      displayEffects: [
        {
          label: "\u4ED8\u4E0E\u7387",
          value: 32.67,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD065",
      lb: 3,
      sp: 135,
      burstSp: 68,
      displayEffects: [
        {
          label: "\u4ED8\u4E0E\u7387",
          value: 34.44,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD065",
      lb: 4,
      sp: 135,
      burstSp: 68,
      displayEffects: [
        {
          label: "\u4ED8\u4E0E\u7387",
          value: 36.36,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD065",
      lb: 5,
      sp: 135,
      burstSp: 68,
      displayEffects: [
        {
          label: "\u4ED8\u4E0E\u7387",
          value: 38.41,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD065",
      lb: 6,
      sp: 135,
      burstSp: 68,
      displayEffects: [
        {
          label: "\u4ED8\u4E0E\u7387",
          value: 40.56,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD065",
      lb: 7,
      sp: 135,
      burstSp: 68,
      displayEffects: [
        {
          label: "\u4ED8\u4E0E\u7387",
          value: 42.81,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD065",
      lb: 8,
      sp: 135,
      burstSp: 68,
      displayEffects: [
        {
          label: "\u4ED8\u4E0E\u7387",
          value: 45.13,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD065",
      lb: 9,
      sp: 135,
      burstSp: 68,
      displayEffects: [
        {
          label: "\u4ED8\u4E0E\u7387",
          value: 47.53,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD065",
      lb: 10,
      sp: 135,
      burstSp: 68,
      displayEffects: [
        {
          label: "\u4ED8\u4E0E\u7387",
          value: 50,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD066",
      lb: 0,
      sp: 150,
      burstSp: 75,
      displayEffects: [
        {
          label: "ATK\u5F37\u5316",
          value: 15,
          unit: "%"
        },
        {
          label: "DEF\u5F37\u5316",
          value: 15,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD066",
      lb: 1,
      sp: 150,
      burstSp: 75,
      displayEffects: [
        {
          label: "ATK\u5F37\u5316",
          value: 15.84,
          unit: "%"
        },
        {
          label: "DEF\u5F37\u5316",
          value: 15.84,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD066",
      lb: 2,
      sp: 150,
      burstSp: 75,
      displayEffects: [
        {
          label: "ATK\u5F37\u5316",
          value: 17.01,
          unit: "%"
        },
        {
          label: "DEF\u5F37\u5316",
          value: 17.01,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD066",
      lb: 3,
      sp: 150,
      burstSp: 75,
      displayEffects: [
        {
          label: "ATK\u5F37\u5316",
          value: 18.33,
          unit: "%"
        },
        {
          label: "DEF\u5F37\u5316",
          value: 18.33,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD066",
      lb: 4,
      sp: 150,
      burstSp: 75,
      displayEffects: [
        {
          label: "ATK\u5F37\u5316",
          value: 19.77,
          unit: "%"
        },
        {
          label: "DEF\u5F37\u5316",
          value: 19.77,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD066",
      lb: 5,
      sp: 150,
      burstSp: 75,
      displayEffects: [
        {
          label: "ATK\u5F37\u5316",
          value: 21.31,
          unit: "%"
        },
        {
          label: "DEF\u5F37\u5316",
          value: 21.31,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD066",
      lb: 6,
      sp: 150,
      burstSp: 75,
      displayEffects: [
        {
          label: "ATK\u5F37\u5316",
          value: 22.92,
          unit: "%"
        },
        {
          label: "DEF\u5F37\u5316",
          value: 22.92,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD066",
      lb: 7,
      sp: 150,
      burstSp: 75,
      displayEffects: [
        {
          label: "ATK\u5F37\u5316",
          value: 24.6,
          unit: "%"
        },
        {
          label: "DEF\u5F37\u5316",
          value: 24.6,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD066",
      lb: 8,
      sp: 150,
      burstSp: 75,
      displayEffects: [
        {
          label: "ATK\u5F37\u5316",
          value: 26.35,
          unit: "%"
        },
        {
          label: "DEF\u5F37\u5316",
          value: 26.35,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD066",
      lb: 9,
      sp: 150,
      burstSp: 75,
      displayEffects: [
        {
          label: "ATK\u5F37\u5316",
          value: 28.15,
          unit: "%"
        },
        {
          label: "DEF\u5F37\u5316",
          value: 28.15,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD066",
      lb: 10,
      sp: 150,
      burstSp: 75,
      displayEffects: [
        {
          label: "ATK\u5F37\u5316",
          value: 30,
          unit: "%"
        },
        {
          label: "DEF\u5F37\u5316",
          value: 30,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD067",
      lb: 0,
      sp: 135,
      burstSp: 68,
      displayEffects: [
        {
          label: "\u7D99\u7D9A\u56DE\u5FA9\u500D\u7387",
          value: 10,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD067",
      lb: 1,
      sp: 135,
      burstSp: 68,
      displayEffects: [
        {
          label: "\u7D99\u7D9A\u56DE\u5FA9\u500D\u7387",
          value: 10.56,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD067",
      lb: 2,
      sp: 135,
      burstSp: 68,
      displayEffects: [
        {
          label: "\u7D99\u7D9A\u56DE\u5FA9\u500D\u7387",
          value: 11.34,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD067",
      lb: 3,
      sp: 135,
      burstSp: 68,
      displayEffects: [
        {
          label: "\u7D99\u7D9A\u56DE\u5FA9\u500D\u7387",
          value: 12.22,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD067",
      lb: 4,
      sp: 135,
      burstSp: 68,
      displayEffects: [
        {
          label: "\u7D99\u7D9A\u56DE\u5FA9\u500D\u7387",
          value: 13.18,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD067",
      lb: 5,
      sp: 135,
      burstSp: 68,
      displayEffects: [
        {
          label: "\u7D99\u7D9A\u56DE\u5FA9\u500D\u7387",
          value: 14.2,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD067",
      lb: 6,
      sp: 135,
      burstSp: 68,
      displayEffects: [
        {
          label: "\u7D99\u7D9A\u56DE\u5FA9\u500D\u7387",
          value: 15.28,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD067",
      lb: 7,
      sp: 135,
      burstSp: 68,
      displayEffects: [
        {
          label: "\u7D99\u7D9A\u56DE\u5FA9\u500D\u7387",
          value: 16.4,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD067",
      lb: 8,
      sp: 135,
      burstSp: 68,
      displayEffects: [
        {
          label: "\u7D99\u7D9A\u56DE\u5FA9\u500D\u7387",
          value: 17.57,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD067",
      lb: 9,
      sp: 135,
      burstSp: 68,
      displayEffects: [
        {
          label: "\u7D99\u7D9A\u56DE\u5FA9\u500D\u7387",
          value: 18.77,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD067",
      lb: 10,
      sp: 135,
      burstSp: 68,
      displayEffects: [
        {
          label: "\u7D99\u7D9A\u56DE\u5FA9\u500D\u7387",
          value: 20,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD068",
      lb: 0,
      sp: 120,
      burstSp: 60,
      displayEffects: [
        {
          label: "\u56DE\u5FA9\u500D\u7387",
          value: 55,
          unit: "%"
        },
        {
          label: "\u30B7\u30FC\u30EB\u30C9\u500D\u7387",
          value: 35,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD068",
      lb: 1,
      sp: 120,
      burstSp: 60,
      displayEffects: [
        {
          label: "\u56DE\u5FA9\u500D\u7387",
          value: 57.53,
          unit: "%"
        },
        {
          label: "\u30B7\u30FC\u30EB\u30C9\u500D\u7387",
          value: 36.97,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD068",
      lb: 2,
      sp: 120,
      burstSp: 60,
      displayEffects: [
        {
          label: "\u56DE\u5FA9\u500D\u7387",
          value: 61.02,
          unit: "%"
        },
        {
          label: "\u30B7\u30FC\u30EB\u30C9\u500D\u7387",
          value: 39.68,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD068",
      lb: 3,
      sp: 120,
      burstSp: 60,
      displayEffects: [
        {
          label: "\u56DE\u5FA9\u500D\u7387",
          value: 64.99,
          unit: "%"
        },
        {
          label: "\u30B7\u30FC\u30EB\u30C9\u500D\u7387",
          value: 42.77,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD068",
      lb: 4,
      sp: 120,
      burstSp: 60,
      displayEffects: [
        {
          label: "\u56DE\u5FA9\u500D\u7387",
          value: 69.31,
          unit: "%"
        },
        {
          label: "\u30B7\u30FC\u30EB\u30C9\u500D\u7387",
          value: 46.13,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD068",
      lb: 5,
      sp: 120,
      burstSp: 60,
      displayEffects: [
        {
          label: "\u56DE\u5FA9\u500D\u7387",
          value: 73.92,
          unit: "%"
        },
        {
          label: "\u30B7\u30FC\u30EB\u30C9\u500D\u7387",
          value: 49.72,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD068",
      lb: 6,
      sp: 120,
      burstSp: 60,
      displayEffects: [
        {
          label: "\u56DE\u5FA9\u500D\u7387",
          value: 78.76,
          unit: "%"
        },
        {
          label: "\u30B7\u30FC\u30EB\u30C9\u500D\u7387",
          value: 53.48,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD068",
      lb: 7,
      sp: 120,
      burstSp: 60,
      displayEffects: [
        {
          label: "\u56DE\u5FA9\u500D\u7387",
          value: 83.81,
          unit: "%"
        },
        {
          label: "\u30B7\u30FC\u30EB\u30C9\u500D\u7387",
          value: 57.41,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD068",
      lb: 8,
      sp: 120,
      burstSp: 60,
      displayEffects: [
        {
          label: "\u56DE\u5FA9\u500D\u7387",
          value: 89.05,
          unit: "%"
        },
        {
          label: "\u30B7\u30FC\u30EB\u30C9\u500D\u7387",
          value: 61.48,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD068",
      lb: 9,
      sp: 120,
      burstSp: 60,
      displayEffects: [
        {
          label: "\u56DE\u5FA9\u500D\u7387",
          value: 94.45,
          unit: "%"
        },
        {
          label: "\u30B7\u30FC\u30EB\u30C9\u500D\u7387",
          value: 65.68,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD068",
      lb: 10,
      sp: 120,
      burstSp: 60,
      displayEffects: [
        {
          label: "\u56DE\u5FA9\u500D\u7387",
          value: 100,
          unit: "%"
        },
        {
          label: "\u30B7\u30FC\u30EB\u30C9\u500D\u7387",
          value: 70,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD069",
      lb: 0,
      sp: 80,
      burstSp: 40,
      displayEffects: [
        {
          label: "\u53CD\u6483\u500D\u7387",
          value: 45,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD069",
      lb: 1,
      sp: 80,
      burstSp: 40,
      displayEffects: [
        {
          label: "\u53CD\u6483\u500D\u7387",
          value: 47.25,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD069",
      lb: 2,
      sp: 80,
      burstSp: 40,
      displayEffects: [
        {
          label: "\u53CD\u6483\u500D\u7387",
          value: 50.35,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD069",
      lb: 3,
      sp: 80,
      burstSp: 40,
      displayEffects: [
        {
          label: "\u53CD\u6483\u500D\u7387",
          value: 53.88,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD069",
      lb: 4,
      sp: 80,
      burstSp: 40,
      displayEffects: [
        {
          label: "\u53CD\u6483\u500D\u7387",
          value: 57.72,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD069",
      lb: 5,
      sp: 80,
      burstSp: 40,
      displayEffects: [
        {
          label: "\u53CD\u6483\u500D\u7387",
          value: 61.82,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD069",
      lb: 6,
      sp: 80,
      burstSp: 40,
      displayEffects: [
        {
          label: "\u53CD\u6483\u500D\u7387",
          value: 66.12,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD069",
      lb: 7,
      sp: 80,
      burstSp: 40,
      displayEffects: [
        {
          label: "\u53CD\u6483\u500D\u7387",
          value: 70.61,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD069",
      lb: 8,
      sp: 80,
      burstSp: 40,
      displayEffects: [
        {
          label: "\u53CD\u6483\u500D\u7387",
          value: 75.26,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD069",
      lb: 9,
      sp: 80,
      burstSp: 40,
      displayEffects: [
        {
          label: "\u53CD\u6483\u500D\u7387",
          value: 80.06,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD069",
      lb: 10,
      sp: 80,
      burstSp: 40,
      displayEffects: [
        {
          label: "\u53CD\u6483\u500D\u7387",
          value: 85,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD070",
      lb: 0,
      sp: 65,
      burstSp: 33,
      displayEffects: [
        {
          label: "\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        },
        {
          label: "\u56DE\u5FA9\u500D\u7387",
          value: 30,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD070",
      lb: 1,
      sp: 65,
      burstSp: 33,
      displayEffects: [
        {
          label: "\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        },
        {
          label: "\u56DE\u5FA9\u500D\u7387",
          value: 31.69,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD070",
      lb: 2,
      sp: 65,
      burstSp: 33,
      displayEffects: [
        {
          label: "\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        },
        {
          label: "\u56DE\u5FA9\u500D\u7387",
          value: 34.01,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD070",
      lb: 3,
      sp: 65,
      burstSp: 33,
      displayEffects: [
        {
          label: "\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        },
        {
          label: "\u56DE\u5FA9\u500D\u7387",
          value: 36.66,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD070",
      lb: 4,
      sp: 65,
      burstSp: 33,
      displayEffects: [
        {
          label: "\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        },
        {
          label: "\u56DE\u5FA9\u500D\u7387",
          value: 39.54,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD070",
      lb: 5,
      sp: 65,
      burstSp: 33,
      displayEffects: [
        {
          label: "\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        },
        {
          label: "\u56DE\u5FA9\u500D\u7387",
          value: 42.61,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD070",
      lb: 6,
      sp: 65,
      burstSp: 33,
      displayEffects: [
        {
          label: "\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        },
        {
          label: "\u56DE\u5FA9\u500D\u7387",
          value: 45.84,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD070",
      lb: 7,
      sp: 65,
      burstSp: 33,
      displayEffects: [
        {
          label: "\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        },
        {
          label: "\u56DE\u5FA9\u500D\u7387",
          value: 49.21,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD070",
      lb: 8,
      sp: 65,
      burstSp: 33,
      displayEffects: [
        {
          label: "\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        },
        {
          label: "\u56DE\u5FA9\u500D\u7387",
          value: 52.7,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD070",
      lb: 9,
      sp: 65,
      burstSp: 33,
      displayEffects: [
        {
          label: "\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        },
        {
          label: "\u56DE\u5FA9\u500D\u7387",
          value: 56.3,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD070",
      lb: 10,
      sp: 65,
      burstSp: 33,
      displayEffects: [
        {
          label: "\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        },
        {
          label: "\u56DE\u5FA9\u500D\u7387",
          value: 60,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD071",
      lb: 0,
      sp: 140,
      burstSp: 70,
      displayEffects: [
        {
          label: "\u80FD\u529B\u4F4E\u4E0B\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        },
        {
          label: "\u7D99\u7D9A\u30C0\u30E1\u30FC\u30B8\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        }
      ]
    },
    {
      designId: "SKD071",
      lb: 1,
      sp: 139,
      burstSp: 70,
      displayEffects: [
        {
          label: "\u80FD\u529B\u4F4E\u4E0B\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        },
        {
          label: "\u7D99\u7D9A\u30C0\u30E1\u30FC\u30B8\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        }
      ]
    },
    {
      designId: "SKD071",
      lb: 2,
      sp: 137,
      burstSp: 69,
      displayEffects: [
        {
          label: "\u80FD\u529B\u4F4E\u4E0B\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        },
        {
          label: "\u7D99\u7D9A\u30C0\u30E1\u30FC\u30B8\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        }
      ]
    },
    {
      designId: "SKD071",
      lb: 3,
      sp: 134,
      burstSp: 67,
      displayEffects: [
        {
          label: "\u80FD\u529B\u4F4E\u4E0B\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        },
        {
          label: "\u7D99\u7D9A\u30C0\u30E1\u30FC\u30B8\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        }
      ]
    },
    {
      designId: "SKD071",
      lb: 4,
      sp: 132,
      burstSp: 66,
      displayEffects: [
        {
          label: "\u80FD\u529B\u4F4E\u4E0B\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        },
        {
          label: "\u7D99\u7D9A\u30C0\u30E1\u30FC\u30B8\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        }
      ]
    },
    {
      designId: "SKD071",
      lb: 5,
      sp: 129,
      burstSp: 65,
      displayEffects: [
        {
          label: "\u80FD\u529B\u4F4E\u4E0B\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        },
        {
          label: "\u7D99\u7D9A\u30C0\u30E1\u30FC\u30B8\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        }
      ]
    },
    {
      designId: "SKD071",
      lb: 6,
      sp: 126,
      burstSp: 63,
      displayEffects: [
        {
          label: "\u80FD\u529B\u4F4E\u4E0B\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        },
        {
          label: "\u7D99\u7D9A\u30C0\u30E1\u30FC\u30B8\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        }
      ]
    },
    {
      designId: "SKD071",
      lb: 7,
      sp: 123,
      burstSp: 62,
      displayEffects: [
        {
          label: "\u80FD\u529B\u4F4E\u4E0B\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        },
        {
          label: "\u7D99\u7D9A\u30C0\u30E1\u30FC\u30B8\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        }
      ]
    },
    {
      designId: "SKD071",
      lb: 8,
      sp: 119,
      burstSp: 60,
      displayEffects: [
        {
          label: "\u80FD\u529B\u4F4E\u4E0B\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        },
        {
          label: "\u7D99\u7D9A\u30C0\u30E1\u30FC\u30B8\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        }
      ]
    },
    {
      designId: "SKD071",
      lb: 9,
      sp: 116,
      burstSp: 58,
      displayEffects: [
        {
          label: "\u80FD\u529B\u4F4E\u4E0B\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        },
        {
          label: "\u7D99\u7D9A\u30C0\u30E1\u30FC\u30B8\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        }
      ]
    },
    {
      designId: "SKD071",
      lb: 10,
      sp: 112,
      burstSp: 56,
      displayEffects: [
        {
          label: "\u80FD\u529B\u4F4E\u4E0B\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        },
        {
          label: "\u7D99\u7D9A\u30C0\u30E1\u30FC\u30B8\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        }
      ]
    },
    {
      designId: "SKD072",
      lb: 0,
      sp: 135,
      burstSp: 68,
      displayEffects: [
        {
          label: "\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        },
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 120,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD072",
      lb: 1,
      sp: 135,
      burstSp: 68,
      displayEffects: [
        {
          label: "\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        },
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 125.62,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD072",
      lb: 2,
      sp: 135,
      burstSp: 68,
      displayEffects: [
        {
          label: "\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        },
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 133.37,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD072",
      lb: 3,
      sp: 135,
      burstSp: 68,
      displayEffects: [
        {
          label: "\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        },
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 142.2,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD072",
      lb: 4,
      sp: 135,
      burstSp: 68,
      displayEffects: [
        {
          label: "\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        },
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 151.81,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD072",
      lb: 5,
      sp: 135,
      burstSp: 68,
      displayEffects: [
        {
          label: "\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        },
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 162.04,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD072",
      lb: 6,
      sp: 135,
      burstSp: 68,
      displayEffects: [
        {
          label: "\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        },
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 172.81,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD072",
      lb: 7,
      sp: 135,
      burstSp: 68,
      displayEffects: [
        {
          label: "\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        },
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 184.03,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD072",
      lb: 8,
      sp: 135,
      burstSp: 68,
      displayEffects: [
        {
          label: "\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        },
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 195.66,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD072",
      lb: 9,
      sp: 135,
      burstSp: 68,
      displayEffects: [
        {
          label: "\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        },
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 207.66,
          unit: "%"
        }
      ]
    },
    {
      designId: "SKD072",
      lb: 10,
      sp: 135,
      burstSp: 68,
      displayEffects: [
        {
          label: "\u89E3\u9664\u4EF6\u6570",
          value: 1,
          unit: "\u4EF6"
        },
        {
          label: "\u653B\u6483\u500D\u7387",
          value: 220,
          unit: "%"
        }
      ]
    }
  ]
};

// src/domain/redesign/balanceV2Masters.ts
var BALANCE_V2_MASTER_VERSION = balance_v2_default.version;
var BALANCE_V2_CHARACTER_ASSIGNMENTS = balance_v2_default.assignments;
var BALANCE_V2_LB_DISPLAY_ROWS = balance_v2_default.lbDisplayRows;
var BALANCE_V2_CONFIG = { status: "PREVIEW_PROVISIONAL", version: balance_v2_default.version, damageBonusCap: 50, healingBonusCap: 80, shieldBonusCap: 50, shieldHpCap: 0.5, periodicCapMultiplier: 2, lowHpThreshold: 0.4, highHpThreshold: 0.7, diversityFactors: [0, 0.25, 0.5, 0.75, 1] };
var passiveNames = ["\u540C\u5C5E\u6027ATK\u652F\u63F4", "\u540C\u5C5E\u6027DEF\u652F\u63F4", "\u751F\u5B58\u5473\u65B9\u306E\u5C5E\u6027\u6570\u3067\u81EA\u8EABATK", "\u4ED6\u306E\u751F\u5B58\u5473\u65B9\u304C2\u5C5E\u6027\u4EE5\u4E0A\u3067\u81EA\u8EABDEF", "\u901A\u5E38\u653B\u6483\u30C0\u30E1\u30FC\u30B8", "\u5358\u4F53\u653B\u6483\u30B9\u30AD\u30EB\u30C0\u30E1\u30FC\u30B8", "\u5168\u4F53\u653B\u6483\u30B9\u30AD\u30EB\u30C0\u30E1\u30FC\u30B8", "\u80FD\u529B\u4F4E\u4E0B\u4E2D\u306E\u6575\u3078\u306E\u76F4\u63A5\u30C0\u30E1\u30FC\u30B8", "\u7D99\u7D9A\u30C0\u30E1\u30FC\u30B8\u4E2D\u306E\u6575\u3078\u306E\u76F4\u63A5\u30C0\u30E1\u30FC\u30B8", "\u4E0E\u56DE\u5FA9\u91CF\uFF08\u8607\u751F\u9664\u5916\uFF09", "\u88AB\u56DE\u5FA9\u91CF\uFF08\u8607\u751F\u9664\u5916\uFF09", "\u4ED8\u4E0E\u30B7\u30FC\u30EB\u30C9\u91CF", "\u53CD\u6483\u30C0\u30E1\u30FC\u30B8", "HP40%\u4EE5\u4E0B\u3067\u81EA\u8EABATK", "HP70%\u4EE5\u4E0A\u3067\u81EA\u8EABDEF", "\u80FD\u52D5ATK\u5F37\u5316\u4E2D\u306E\u81EA\u8EABDEF"];
var passiveMax = [[8, 12, 16], [12, 18, 24], [20, 30, 40], [25, 35, 45], [20, 30, 40], [10, 15, 20], [10, 15, 20], [15, 22, 30], [20, 30, 40], [20, 30, 40], [20, 30, 40], [20, 30, 40], [25, 35, 45], [25, 35, 45], [20, 30, 40], [20, 30, 40]];
function getCharacterPassive(master, awakening) {
  const a = balance_v2_default.assignments.find((a2) => a2.id === master.id);
  if (!a || master.rarity === "N") return void 0;
  const index = Number(a.passiveType.slice(1)) - 1, level = Math.max(0, Math.min(5, awakening)) * 2;
  const percent = passiveMax[index][["R", "SR", "SSR"].indexOf(a.rarity)] * (0.4 + 0.6 * (level / 10) ** 1.3);
  return { id: `balance_v2_${a.passiveType}${index < 2 ? "_" + a.element : ""}`, type: a.passiveType, name: passiveNames[index], stat: [1, 3, 14, 15].includes(index) ? "def" : "atk", percent, level, target: index < 2 ? "party" : "self", ...index < 2 ? { targetElement: a.element } : {} };
}
function getBalanceV2Skill(designId, lb, options = {}) {
  if (!Number.isInteger(lb) || lb < 0 || lb > 10) throw new Error("\u691C\u8A3C\u30B9\u30AD\u30EBLB\u306F0\u301C10");
  const s = balance_v2_default.skills.find((s2) => s2.designId === designId || s2.id === designId);
  if (!s) throw new Error("\u691C\u8A3C\u30B9\u30AD\u30EBID\u4E0D\u660E");
  const n = Number(s.designId.slice(3)), ratio = (lb / 10) ** 1.25;
  const vals = s.effects0.map((e, i) => e.value + (s.effects10[i].value - e.value) * ratio);
  const lasting = (type, power2) => ({ type, power: power2, duration: s.duration ?? 3, carryAcrossWaves: true });
  const effects = [];
  for (let i = 0; i < s.effects0.length; i++) {
    const label = s.effects0[i].label, v = vals[i];
    if (label === "\u6761\u4EF6\u500D\u7387") continue;
    if (label === "\u653B\u6483\u500D\u7387" || label === "\u901A\u5E38\u500D\u7387") effects.push({ type: "damage", power: v, ...label === "\u901A\u5E38\u500D\u7387" ? { bonusPower: vals[i + 1], bonusCondition: [28, 59].includes(n) ? "debuff" : [30].includes(n) ? "dot" : "hp_below", hpThreshold: BALANCE_V2_CONFIG.lowHpThreshold } : {} });
    else if (label === "\u4ED8\u4E0E\u7387") effects.push({ ...lasting([32, 65].includes(n) ? "stun" : "taunt", 1), chance: v / 100 });
    else if (label.includes("\u89E3\u9664\u4EF6\u6570")) effects.push({ type: "cleanse", power: v, cleanseCategory: label === "\u80FD\u529B\u4F4E\u4E0B\u89E3\u9664\u4EF6\u6570" ? "debuff" : label === "\u7D99\u7D9A\u30C0\u30E1\u30FC\u30B8\u89E3\u9664\u4EF6\u6570" ? "dot" : { 51: "buff", 52: "protection", 53: "debuff", 54: "dot", 55: "stun", 56: "protection", 70: "dot", 72: "buff" }[n] });
    else if (label === "\u56DE\u5FA9\u500D\u7387") effects.push({ type: "heal", power: v, healingFormula: "caster_atk_percent" });
    else if (label === "\u8607\u751FHP\u5272\u5408") effects.push({ type: "revive", power: v, healingFormula: "target_max_hp_percent" });
    else {
      const type = { "\u7D99\u7D9A\u30C0\u30E1\u30FC\u30B8\u500D\u7387": "dot", "\u7D99\u7D9A\u56DE\u5FA9\u500D\u7387": "hot", "\u30B7\u30FC\u30EB\u30C9\u500D\u7387": "shield", "\u53CD\u6483\u500D\u7387": "counter", "ATK\u5F37\u5316": "atk_up", "DEF\u5F37\u5316": "def_up", "ATK\u4F4E\u4E0B": "atk_down", "DEF\u4F4E\u4E0B": "def_down" }[label];
      if (!type) throw new Error(`\u672A\u77E5\u52B9\u679C:${label}`);
      effects.push(lasting(type, v));
    }
  }
  let target = "first";
  if ([19, 20, 21, 22, 23, 24, 25, 58, 59, 60, 63, 64, 65].includes(n)) target = "all_enemies";
  else if ([35, 36, 41, 42, 47, 66, 67, 71].includes(n)) target = "all_allies";
  else if ([33, 34, 45, 48, 49, 50].includes(n)) target = "self";
  else if ([26, 57].includes(n)) target = "last";
  else if (n === 27) target = "lowest_hp";
  else if (n === 37) target = "highest_atk_enemy";
  else if ([39, 40, 43, 46, 68].includes(n)) target = "lowest_ally";
  else if (n === 44) target = "dead_ally";
  else if (n === 61) target = "highest_atk_ally";
  else if ([53, 54, 55, 62].includes(n)) target = "first_ally";
  else if (n === 69) target = "counter_ally";
  else if (n === 70) target = "dot_ally";
  return { id: s.id, name: `\u3010\u691C\u8A3C\u4EEE\u79F0\u3011${s.name}`, image: "/menu/event_banner_placeholder.png", rarity: s.rarity, element: s.element, spCost: Math.ceil(s.sp0 + (s.sp10 - s.sp0) * ratio), condition: { type: "always" }, target, fixedTarget: [56, 72].includes(n) || [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 28, 29, 30, 31].includes(n) && (options.firstTargetMode ?? "fixed") === "fixed", effects, description: `${s.designId} / LB${lb} / ${s.targetDescription}${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 28, 29, 30, 31].includes(n) ? `\uFF08\u5148\u982D\u72D9\u3044\u89E3\u91C8\u672A\u6C7A\u30FB\u691C\u8A3C\u7528:${options.firstTargetMode ?? "fixed"}\uFF09` : ""}\u3002\u540D\u79F0\u30FB\u753B\u50CF\u672A\u5BFE\u5FDC\u3002\u6570\u5024\u306F\u691C\u8A3C\u7528\u4EEE\u5024 (${balance_v2_default.version})\u3002\u30AC\u30C1\u30E3\u672A\u63A5\u7D9A\u3002` };
}
var BALANCE_V2_SKILL_CANDIDATES = balance_v2_default.skills.map((s) => getBalanceV2Skill(s.designId, 0));
var BALANCE_V2_SKILL_ID_MAPPING = balance_v2_default.skills.map((s) => ({ designId: s.designId, candidateId: s.id, legacyId: null, imageStatus: s.imageStatus, status: "QA_ONLY_NOT_GACHA" }));
var BALANCE_V2_ATTACK_ANCHORS = {
  N: { hp: [600, 4600, 13600], def: [30, 380, 1230], atk: [100, 200, 380, 600, 850, 1150, 1500, 1880, 2290, 2730, 3200] },
  R: { hp: [750, 6300, 19300], def: [40, 550, 1850], atk: [150, 300, 550, 880, 1300, 1800, 2400, 3080, 3850, 4720, 5700] },
  SR: { hp: [1050, 9700, 30700], def: [60, 880, 3180], atk: [300, 520, 900, 1450, 2200, 3150, 4300, 5650, 7200, 8950, 10900] },
  SSR: { hp: [1500, 14200, 47200], def: [90, 1400, 5150], atk: [500, 800, 1350, 2100, 3050, 4250, 5850, 7800, 10150, 12900, 16e3] }
};
function interpolatePreviewAnchor(level, levels, values) {
  const l = Math.max(levels[0], Math.min(levels[levels.length - 1], level));
  for (let i = 1; i < levels.length; i++) if (l <= levels[i]) return Math.round(values[i - 1] + (values[i] - values[i - 1]) * (l - levels[i - 1]) / (levels[i] - levels[i - 1]));
  return values[values.length - 1];
}

// src/domain/redesign/acquisitions.ts
var APPROVED_ACQUISITION_MASTER = {
  characterDuplicateSouls: 20,
  skillDuplicateMaterials: DUPLICATE_SKILL_MATERIALS,
  characterAtCap: "convert",
  skillAtCap: "convert"
};
var PREVIEW_ACQUISITION_MASTER = APPROVED_ACQUISITION_MASTER;
function applyAcquisitionEvents(original, events, master) {
  const state = structuredClone(original);
  const applied = new Set(state.appliedAcquisitionIds ?? []);
  const pending = new Map((state.pendingAcquisitions ?? []).map((p) => [p.id, p]));
  for (const event of [...pending.values(), ...events]) {
    if (applied.has(event.id)) continue;
    if (event.legacyId && state.legacyImportedIds?.includes(`${event.kind}:${event.legacyId}`)) {
      applied.add(event.id);
      pending.delete(event.id);
      continue;
    }
    const defer = (reason) => pending.set(event.id, { ...event, reason });
    if (event.kind === "character") {
      if (!CHARACTER_MASTERS.some((m) => m.id === event.masterId)) {
        defer("master_missing");
        continue;
      }
      const owned = state.characters.find((c) => c.id === event.masterId);
      if (!owned) state.characters.push({ id: event.masterId, level: 1, awakening: 0, exp: 0, growthVersion: GROWTH_VERSION });
      else {
        if (owned.awakening >= 5 && master.characterAtCap !== "convert") {
          defer("character_cap_policy_unfixed");
          continue;
        }
        const amount = master.characterDuplicateSouls;
        if (!Number.isSafeInteger(amount) || typeof amount !== "number" || amount < 0) {
          defer("conversion_master_unfixed");
          continue;
        }
        state.souls ??= {};
        state.souls[event.masterId] = (state.souls[event.masterId] ?? 0) + amount;
      }
    } else if (event.kind === "skill") {
      const skillMaster = SKILL_MASTERS.find((m) => m.id === event.masterId);
      if (!skillMaster) {
        defer("master_missing");
        continue;
      }
      const owned = state.skills.find((s) => s.id === event.masterId);
      if (!owned) state.skills.push({ id: event.masterId, level: 0 });
      else {
        if (owned.level >= 10 && master.skillAtCap !== "convert") {
          defer("skill_cap_policy_unfixed");
          continue;
        }
        const configured = master.skillDuplicateMaterials;
        const amount = configured && typeof configured === "object" ? configured[skillMaster.rarity] : configured;
        if (!Number.isSafeInteger(amount) || typeof amount !== "number" || amount < 0) {
          defer("conversion_master_unfixed");
          continue;
        }
        state.materials.skill += amount;
      }
    } else if (event.kind === "equipment") {
      if (!EQUIPMENT_MASTERS.some((m) => m.id === event.masterId)) {
        defer("master_missing");
        continue;
      }
      const instanceId = event.instanceId ?? event.id;
      if (!state.equipment.some((e) => e.instanceId === instanceId)) state.equipment.push({ instanceId, masterId: event.masterId, level: 1, lb: 0, exp: 0, growthVersion: GROWTH_VERSION });
    } else {
      defer("unsupported_kind");
      continue;
    }
    applied.add(event.id);
    pending.delete(event.id);
  }
  state.appliedAcquisitionIds = [...applied];
  state.pendingAcquisitions = [...pending.values()];
  return state;
}

// src/theme/sengoku-characters.json
var sengoku_characters_default = [
  {
    characterId: "char_ageha_01",
    upstreamName: "\u30A2\u30B2\u30CF",
    name: "\u8C4A\u81E3\u79C0\u5409",
    runtimeRarity: "SSR",
    sourceRarity: "SSR",
    temporaryRarityMismatch: false,
    imagePath: "/characters/ageha_transparent_asset.png",
    source: "\u30AD\u30E3\u30E9/SSR/SSR_\u8C4A\u81E3\u79C0\u5409.png",
    sha256: "c1021b8d9933dfbeaa00c3da9c4024c84ba7b7081371b6960a08092ab8b47ebb",
    width: 768,
    height: 1376
  },
  {
    characterId: "char_alice_01",
    upstreamName: "\u30A2\u30EA\u30B9",
    name: "\u304F\u30CE\u4E00",
    runtimeRarity: "SR",
    sourceRarity: "N",
    temporaryRarityMismatch: true,
    imagePath: "/characters/alice_transparent_asset.png",
    source: "\u30AD\u30E3\u30E9/N/N_\u304F\u30CE\u4E00.png",
    sha256: "cb831a05f5a0f8f392d15b08f87028ca87d31d8dd7ed0c6d2d395c2ec710fe50",
    width: 768,
    height: 1376
  },
  {
    characterId: "char_aoi_01",
    upstreamName: "\u30A2\u30AA\u30A4",
    name: "\u304A\u5E02\u306E\u65B9",
    runtimeRarity: "R",
    sourceRarity: "R",
    temporaryRarityMismatch: false,
    imagePath: "/characters/aoi_transparent_asset.png",
    source: "\u30AD\u30E3\u30E9/R/R_\u304A\u5E02\u306E\u65B9.png",
    sha256: "168d522ed589f6f144e2169cf0bd148a67b65e388b3d1373933aa5a5614e7116",
    width: 768,
    height: 1376
  },
  {
    characterId: "char_cecile_01",
    upstreamName: "\u30BB\u30B7\u30EB",
    name: "\u4E95\u4F0A\u76F4\u864E",
    runtimeRarity: "SR",
    sourceRarity: "SR",
    temporaryRarityMismatch: false,
    imagePath: "/characters/cecile_transparent_asset.png",
    source: "\u30AD\u30E3\u30E9/SR/SR_\u4E95\u4F0A\u76F4\u864E.png",
    sha256: "714b421c523fe48a5029c7337f4fc9c60ad672b78f0464f493253d951f310ca2",
    width: 768,
    height: 1376
  },
  {
    characterId: "char_chang_01",
    upstreamName: "\u30C1\u30E3\u30F3",
    name: "\u4E0A\u6749\u666F\u52DD",
    runtimeRarity: "R",
    sourceRarity: "R",
    temporaryRarityMismatch: false,
    imagePath: "/characters/chang_transparent_asset.png",
    source: "\u30AD\u30E3\u30E9/R/R_ \u4E0A\u6749\u666F\u52DD .png",
    sha256: "076596449fbcc6e5dd8fa30bc095b26362a0fa88ae5cfcc769b667369b72f901",
    width: 768,
    height: 1376
  },
  {
    characterId: "char_daimon_01",
    upstreamName: "\u30C0\u30A4\u30E2\u30F3",
    name: "\u4E95\u4F0A\u76F4\u653F",
    runtimeRarity: "R",
    sourceRarity: "R",
    temporaryRarityMismatch: false,
    imagePath: "/characters/daimon_transparent_asset.png",
    source: "\u30AD\u30E3\u30E9/R/R_\u4E95\u4F0A\u76F4\u653F.png",
    sha256: "4c353980d065a9f5d2694c7d9597264d8c69cec2aaf7bfddfd116dbe186aa87a",
    width: 768,
    height: 1376
  },
  {
    characterId: "char_genji_01",
    upstreamName: "\u30B2\u30F3\u30B8",
    name: "\u4ECA\u5DDD\u7FA9\u5143",
    runtimeRarity: "SR",
    sourceRarity: "SR",
    temporaryRarityMismatch: false,
    imagePath: "/characters/genji_transparent_asset.png",
    source: "\u30AD\u30E3\u30E9/SR/R_\u4ECA\u5DDD\u7FA9\u5143.png",
    sha256: "5c19e8a1a493a64045258028b2ab942fe93273669918555779972a751a71180f",
    width: 768,
    height: 1376
  },
  {
    characterId: "char_go_01",
    upstreamName: "\u30B4\u30A6",
    name: "\u6B66\u7530\u4FE1\u7384",
    runtimeRarity: "SSR",
    sourceRarity: "SSR",
    temporaryRarityMismatch: false,
    imagePath: "/characters/go_transparent_asset.png",
    source: "\u30AD\u30E3\u30E9/SSR/SSR_\u6B66\u7530\u4FE1\u7384.png",
    sha256: "d07bd2ed37d145dc51f0a54ce4307f02202ec8f502f76ab30aa622f90eb53d70",
    width: 768,
    height: 1376
  },
  {
    characterId: "char_gou_01",
    upstreamName: "\u30C0\u30A4\u30B9\u30B1",
    name: "\u4F1D\u4EE4",
    runtimeRarity: "N",
    sourceRarity: "N",
    temporaryRarityMismatch: false,
    imagePath: "/characters/gou_transparent_asset.png",
    source: "\u30AD\u30E3\u30E9/N/N_\u4F1D\u4EE4.png",
    sha256: "12e87ebb94f9947ecfae82b2ffbf67514fe8cc300f0087cd7099c33172824f97",
    width: 768,
    height: 1376
  },
  {
    characterId: "char_jihoon_01",
    upstreamName: "\u30B8\u30D5\u30F3",
    name: "\u524D\u7530\u5229\u5BB6",
    runtimeRarity: "R",
    sourceRarity: "R",
    temporaryRarityMismatch: false,
    imagePath: "/characters/jihoon_transparent_asset.png",
    source: "\u30AD\u30E3\u30E9/R/R_\u524D\u7530\u5229\u5BB6.png",
    sha256: "9c2282dc4a17807521445ec159788325c829b3028642120666c053f6d4fe9a41",
    width: 768,
    height: 1376
  },
  {
    characterId: "char_joe_01",
    upstreamName: "\u30B8\u30E7\u30FC",
    name: "\u5317\u6761\u6C0F\u5EB7",
    runtimeRarity: "R",
    sourceRarity: "R",
    temporaryRarityMismatch: false,
    imagePath: "/characters/joe_transparent_asset.png",
    source: "\u30AD\u30E3\u30E9/R/R_\u5317\u6761\u6C0F\u5EB7.png",
    sha256: "0292c7799c760609ed5e33901763e00a0c16298671a1250149ef8481e37f47b3",
    width: 768,
    height: 1376
  },
  {
    characterId: "char_kaede_01",
    upstreamName: "\u30AB\u30A8\u30C7",
    name: "\u771F\u7530\u5E78\u6751",
    runtimeRarity: "SSR",
    sourceRarity: "SSR",
    temporaryRarityMismatch: false,
    imagePath: "/characters/kaede_transparent_asset.png",
    source: "\u30AD\u30E3\u30E9/SSR/SSR_\u771F\u7530\u5E78\u6751.png",
    sha256: "b41f1399c59c76e299ed66f06665fbb0a9f0870c0df92e762c79cac8f6f2502c",
    width: 768,
    height: 1376
  },
  {
    characterId: "char_kageyama_01",
    upstreamName: "\u30AB\u30B2\u30E4\u30DE",
    name: "\u50E7\u5175",
    runtimeRarity: "SR",
    sourceRarity: "N",
    temporaryRarityMismatch: true,
    imagePath: "/characters/kageyama_transparent_asset.png",
    source: "\u30AD\u30E3\u30E9/N/N_\u50E7\u5175.png",
    sha256: "a81bdbf9f59bb6574678cf849ffb6c5244d401697e05944de1567cf9ffb30bb7",
    width: 768,
    height: 1376
  },
  {
    characterId: "char_kaito_01",
    upstreamName: "\u30AB\u30A4\u30C8",
    name: "\u5927\u53CB\u5B97\u9E9F",
    runtimeRarity: "R",
    sourceRarity: "R",
    temporaryRarityMismatch: false,
    imagePath: "/characters/kaito_transparent_asset.png",
    source: "\u30AD\u30E3\u30E9/R/R_\u5927\u53CB\u5B97\u9E9F.png",
    sha256: "dab9e03804ee5321e218ad3f79964f00e43a6edd18a2fd363f59a6bd4a3e105e",
    width: 768,
    height: 1376
  },
  {
    characterId: "char_karen_01",
    upstreamName: "\u30AB\u30EC\u30F3",
    name: "\u5FB3\u5DDD\u5BB6\u5EB7",
    runtimeRarity: "SSR",
    sourceRarity: "SSR",
    temporaryRarityMismatch: false,
    imagePath: "/characters/karen_transparent_asset.png",
    source: "\u30AD\u30E3\u30E9/SSR/SSR_\u5FB3\u5DDD\u5BB6\u5EB7 .png",
    sha256: "7ca40ae52a58ff9a697f6bb2f804ed585ba26b399a6f46a732b9db579472f9bb",
    width: 768,
    height: 1376
  },
  {
    characterId: "char_kengo_01",
    upstreamName: "\u30B1\u30F3\u30B4",
    name: "\u672C\u591A\u5FE0\u52DD",
    runtimeRarity: "SSR",
    sourceRarity: "SSR",
    temporaryRarityMismatch: false,
    imagePath: "/characters/kengo_transparent_asset.png",
    source: "\u30AD\u30E3\u30E9/SSR/SSR_\u672C\u591A\u5FE0\u52DD.png",
    sha256: "900ed8ca672b020441a0c16b77acde8038d883a2b6d3b35119abc3046550366e",
    width: 768,
    height: 1376
  },
  {
    characterId: "char_kenji_01",
    upstreamName: "\u30B1\u30F3\u30B8",
    name: "\u5C71\u4F0F",
    runtimeRarity: "N",
    sourceRarity: "N",
    temporaryRarityMismatch: false,
    imagePath: "/characters/kenji_transparent_asset.png",
    source: "\u30AD\u30E3\u30E9/N/N_\u5C71\u4F0F.png",
    sha256: "11d291295cfca45a37f17613ff8debf0ca4e087c5fee7ea441283a32b54e2361",
    width: 768,
    height: 1376
  },
  {
    characterId: "char_koharu_01",
    upstreamName: "\u30B3\u30CF\u30EB",
    name: "\u4E0A\u6749\u8B19\u4FE1",
    runtimeRarity: "SSR",
    sourceRarity: "SSR",
    temporaryRarityMismatch: false,
    imagePath: "/characters/koharu_transparent_asset.png",
    source: "\u30AD\u30E3\u30E9/SSR/SSR_\u4E0A\u6749\u8B19\u4FE1.png",
    sha256: "26705b58811996688cae3ae212e55d39bb185f17ddc2d32597aaf3d6b623eebb",
    width: 768,
    height: 1376
  },
  {
    characterId: "char_leo_01",
    upstreamName: "\u30EC\u30AA",
    name: "\u4F0A\u9054\u653F\u5B97",
    runtimeRarity: "SSR",
    sourceRarity: "SSR",
    temporaryRarityMismatch: false,
    imagePath: "/characters/leo_transparent_asset.png",
    source: "\u30AD\u30E3\u30E9/SSR/SSR_\u4F0A\u9054\u653F\u5B97.png",
    sha256: "4185d3b187f82285f9e7a62ddb1cca28ae9ceb90df9fb9c22c1baeb60f20706b",
    width: 941,
    height: 1672
  },
  {
    characterId: "char_leon_01",
    upstreamName: "\u30EC\u30AA\u30F3",
    name: "\u52A0\u85E4\u6E05\u6B63",
    runtimeRarity: "SR",
    sourceRarity: "SR",
    temporaryRarityMismatch: false,
    imagePath: "/characters/leon_transparent_asset.png",
    source: "\u30AD\u30E3\u30E9/SR/R_\u52A0\u85E4\u6E05\u6B63.png",
    sha256: "d5a2aabad541900bd1ef16a016eb84b08ea38bfbe4b818870163e0fd7f5a2c5e",
    width: 941,
    height: 1672
  },
  {
    characterId: "char_long_01",
    upstreamName: "\u30ED\u30F3",
    name: "\u5973\u4F8D",
    runtimeRarity: "SR",
    sourceRarity: "N",
    temporaryRarityMismatch: true,
    imagePath: "/characters/long_transparent_asset.png",
    source: "\u30AD\u30E3\u30E9/N/N_\u5973\u4F8D.png",
    sha256: "08b54875d444d5016c6612d664e4dbaf470f46414d8f4783141306df5c415d70",
    width: 768,
    height: 1376
  },
  {
    characterId: "char_lucas_01",
    upstreamName: "\u30EB\u30FC\u30AB\u30B9",
    name: "\u5CF6\u6D25\u7FA9\u5F18",
    runtimeRarity: "SR",
    sourceRarity: "SR",
    temporaryRarityMismatch: false,
    imagePath: "/characters/lucas_transparent_asset.png",
    source: "\u30AD\u30E3\u30E9/SR/SR_\u5CF6\u6D25\u7FA9\u5F18.png",
    sha256: "4a21de1b61a39f7133356b1d4ccc27c54ade08ebe7e9c92eeb4743fc9916b222",
    width: 768,
    height: 1376
  },
  {
    characterId: "char_makoto_01",
    upstreamName: "\u30DE\u30B3\u30C8",
    name: "\u5C0F\u65E9\u5DDD\u9686\u666F",
    runtimeRarity: "R",
    sourceRarity: "R",
    temporaryRarityMismatch: false,
    imagePath: "/characters/makoto_transparent_asset.png",
    source: "\u30AD\u30E3\u30E9/R/R_\u5C0F\u65E9\u5DDD\u9686\u666F.png",
    sha256: "b290f20e682e02aec85faf874f388b112b7fda332f6142c291a48602b961255a",
    width: 768,
    height: 1376
  },
  {
    characterId: "char_mark_01",
    upstreamName: "\u30DE\u30FC\u30AF",
    name: "\u5C0F\u677E\u59EB",
    runtimeRarity: "R",
    sourceRarity: "R",
    temporaryRarityMismatch: false,
    imagePath: "/characters/mark_transparent_asset.png",
    source: "\u30AD\u30E3\u30E9/R/R_\u5C0F\u677E\u59EB.png",
    sha256: "566c2b4c6c30b3e047904f36e3a7310978b4ab9bf61d6f2ee9176f11f8f9b75b",
    width: 768,
    height: 1376
  },
  {
    characterId: "char_martina_01",
    upstreamName: "\u30DE\u30EB\u30C6\u30A3\u30CA",
    name: "\u6226\u5DEB\u5973",
    runtimeRarity: "SR",
    sourceRarity: "N",
    temporaryRarityMismatch: true,
    imagePath: "/characters/martina_transparent_asset.png",
    source: "\u30AD\u30E3\u30E9/N/N_\u6226\u5DEB\u5973.png",
    sha256: "06b5e1c2b4ddf7909d676b44672415499426845241baa51e9b5a03c2e83bed63",
    width: 768,
    height: 1376
  },
  {
    characterId: "char_masato_01",
    upstreamName: "\u30DE\u30B5\u30C8",
    name: "\u5F13\u5175",
    runtimeRarity: "N",
    sourceRarity: "N",
    temporaryRarityMismatch: false,
    imagePath: "/characters/masato_transparent_asset.png",
    source: "\u30AD\u30E3\u30E9/N/N_\u5F13\u5175.png",
    sha256: "7004f60f587a55764b75ade8c3356cced983afee440c05f7d05fb06b586beb8d",
    width: 768,
    height: 1376
  },
  {
    characterId: "char_maya_01",
    upstreamName: "\u30DE\u30E4",
    name: "\u670D\u90E8\u534A\u8535",
    runtimeRarity: "SR",
    sourceRarity: "SR",
    temporaryRarityMismatch: false,
    imagePath: "/characters/maya_transparent_asset.png",
    source: "\u30AD\u30E3\u30E9/SR/SR_\u670D\u90E8\u534A\u8535.png",
    sha256: "60839aaba15d1a687ebf93babe0761c9e9bdabaaf42970d7b86a45ff1e708519",
    width: 768,
    height: 1376
  },
  {
    characterId: "char_mei_01",
    upstreamName: "\u30E1\u30A4",
    name: "\u5C71\u672C\u52D8\u52A9",
    runtimeRarity: "R",
    sourceRarity: "R",
    temporaryRarityMismatch: false,
    imagePath: "/characters/mei_transparent_asset.png",
    source: "\u30AD\u30E3\u30E9/R/R_ \u5C71\u672C\u52D8\u52A9.png",
    sha256: "eff9d95ab7ae935a2dd6e0259f848a0d0b21770556c90d615b97898046e62eec",
    width: 768,
    height: 1376
  },
  {
    characterId: "char_minami_01",
    upstreamName: "\u30DF\u30CA\u30DF",
    name: "\u5CF6\u5DE6\u8FD1",
    runtimeRarity: "R",
    sourceRarity: "R",
    temporaryRarityMismatch: false,
    imagePath: "/characters/minami_transparent_asset.png",
    source: "\u30AD\u30E3\u30E9/R/R_ \u5CF6\u5DE6\u8FD1.png",
    sha256: "25195e6ecae1b36e89e49dd520f044f84b3e21ad5a112c5efc9583743152bb60",
    width: 768,
    height: 1376
  },
  {
    characterId: "char_mio_01",
    upstreamName: "\u30DF\u30AA",
    name: "\u524D\u7530\u6176\u6B21",
    runtimeRarity: "SSR",
    sourceRarity: "SSR",
    temporaryRarityMismatch: false,
    imagePath: "/characters/mio_transparent_asset.png",
    source: "\u30AD\u30E3\u30E9/SSR/SSR_\u524D\u7530\u6176\u6B21.png",
    sha256: "6a2d3aaae293d093e2aa0ca80a15f37f0e1860b329c88782d581a798660e4ef3",
    width: 768,
    height: 1376
  },
  {
    characterId: "char_miyabi_01",
    upstreamName: "\u30DF\u30E4\u30D3",
    name: "\u660E\u667A\u5149\u79C0",
    runtimeRarity: "SSR",
    sourceRarity: "SSR",
    temporaryRarityMismatch: false,
    imagePath: "/characters/miyabi_transparent_asset.png",
    source: "\u30AD\u30E3\u30E9/SSR/SSR_\u660E\u667A\u5149\u79C0.png",
    sha256: "3907732641bfa7c99ad683aa58171dae53e16896a20f8ad1659a60cb2338776d",
    width: 768,
    height: 1376
  },
  {
    characterId: "char_momoko_01",
    upstreamName: "\u30E2\u30E2\u30B3",
    name: "\u5CF6\u6D25\u7FA9\u4E45",
    runtimeRarity: "R",
    sourceRarity: "R",
    temporaryRarityMismatch: false,
    imagePath: "/characters/momoko_transparent_asset.png",
    source: "\u30AD\u30E3\u30E9/R/R_\u5CF6\u6D25\u7FA9\u4E45.png",
    sha256: "d83781290119c4cf5be3174973b6317a259215223d3a0760416cd057d20b4742",
    width: 768,
    height: 1376
  },
  {
    characterId: "char_naoto_01",
    upstreamName: "\u30CA\u30AA\u30C8",
    name: "\u6F01\u5E2B",
    runtimeRarity: "N",
    sourceRarity: "N",
    temporaryRarityMismatch: false,
    imagePath: "/characters/naoto_transparent_asset.png",
    source: "\u30AD\u30E3\u30E9/N/N_\u6F01\u5E2B.png",
    sha256: "9f7e4cd38eed436ecc0f9bc91bed4195226c7326769efc6f5a4f2fe66fc6daa0",
    width: 768,
    height: 1376
  },
  {
    characterId: "char_noa_01",
    upstreamName: "\u30CE\u30A2",
    name: "\u67F4\u7530\u52DD\u5BB6",
    runtimeRarity: "SR",
    sourceRarity: "SR",
    temporaryRarityMismatch: false,
    imagePath: "/characters/noa_transparent_asset.png",
    source: "\u30AD\u30E3\u30E9/SR/SR_\u67F4\u7530\u52DD\u5BB6.png",
    sha256: "683d27ab68cc384f2c44fed9af7426d8329420de665da537c52333e17aafd18c",
    width: 768,
    height: 1376
  },
  {
    characterId: "char_reiji_01",
    upstreamName: "\u30EC\u30A4\u30B8",
    name: "\u7E54\u7530\u4FE1\u9577",
    runtimeRarity: "SSR",
    sourceRarity: "SSR",
    temporaryRarityMismatch: false,
    imagePath: "/characters/reiji_transparent_asset.png",
    source: "\u30AD\u30E3\u30E9/SSR/SSR_\u7E54\u7530\u4FE1\u9577.png",
    sha256: "2a982d0a2c2f0e2b77b074097771820bdc2fa33fb036eb0c6004cb51248a67ca",
    width: 768,
    height: 1376
  },
  {
    characterId: "char_reina_01",
    upstreamName: "\u30EC\u30A4\u30CA",
    name: "\u6BDB\u5229\u5143\u5C31",
    runtimeRarity: "SR",
    sourceRarity: "SR",
    temporaryRarityMismatch: false,
    imagePath: "/characters/reina_transparent_asset.png",
    source: "\u30AD\u30E3\u30E9/SR/SR_\u6BDB\u5229\u5143\u5C31.png",
    sha256: "0f9f47815163d5a17caff4ba13f14e53bdfa3ede1818867258fd7f56a9c65ef3",
    width: 768,
    height: 1376
  },
  {
    characterId: "char_ren_01",
    upstreamName: "\u30EC\u30F3",
    name: "\u658E\u85E4\u9053\u4E09",
    runtimeRarity: "R",
    sourceRarity: "R",
    temporaryRarityMismatch: false,
    imagePath: "/characters/ren_transparent_asset.png",
    source: "\u30AD\u30E3\u30E9/R/R_\u658E\u85E4\u9053\u4E09.png",
    sha256: "033bfca8d2c8d7148f64c80fe734e1503c9609f8e245abcd599fa079f5b91105",
    width: 768,
    height: 1376
  },
  {
    characterId: "char_ren_male_01",
    upstreamName: "\u30AB\u30BA\u30E4",
    name: "\u672C\u9858\u5BFA\u9855\u5982",
    runtimeRarity: "R",
    sourceRarity: "R",
    temporaryRarityMismatch: false,
    imagePath: "/characters/ren_male_transparent_asset.png",
    source: "\u30AD\u30E3\u30E9/R/R_ \u672C\u9858\u5BFA\u9855\u5982.png",
    sha256: "bfe6bd196734435bfe076f665710bc16397b4a3bd9263a0ac5e0619bdb7dd489",
    width: 768,
    height: 1376
  },
  {
    characterId: "char_riki_01",
    upstreamName: "\u30EA\u30AD",
    name: "\u6FC3\u59EB",
    runtimeRarity: "SR",
    sourceRarity: "SR",
    temporaryRarityMismatch: false,
    imagePath: "/characters/riki_transparent_asset.png",
    source: "\u30AD\u30E3\u30E9/SR/SR_\u6FC3\u59EB.png",
    sha256: "80aa8e6313333cedbfb9b2fd11b425aed0431b90d4593d9f26a4d00030778367",
    width: 768,
    height: 1376
  },
  {
    characterId: "char_rin_01",
    upstreamName: "\u30EA\u30F3",
    name: "\u6B66\u7530\u52DD\u983C",
    runtimeRarity: "R",
    sourceRarity: "R",
    temporaryRarityMismatch: false,
    imagePath: "/characters/rin_transparent_asset.png",
    source: "\u30AD\u30E3\u30E9/R/R_\u6B66\u7530\u52DD\u983C.png",
    sha256: "30132aaac513b016170a89d57ff2044b50989736261b1d3a66c671e2c9e08204",
    width: 768,
    height: 1376
  },
  {
    characterId: "char_rui_01",
    upstreamName: "\u30EB\u30A4",
    name: "\u76F4\u6C5F\u517C\u7D9A",
    runtimeRarity: "SR",
    sourceRarity: "SR",
    temporaryRarityMismatch: false,
    imagePath: "/characters/rui_transparent_asset.png",
    source: "\u30AD\u30E3\u30E9/SR/R_\u76F4\u6C5F\u517C\u7D9A.png",
    sha256: "995ba14d52df77606be68625dceb185bf983a9c4f35916042e055cfb189b922b",
    width: 768,
    height: 1376
  },
  {
    characterId: "char_sakura_01",
    upstreamName: "\u30B5\u30AF\u30E9",
    name: "\u771F\u7530\u660C\u5E78",
    runtimeRarity: "SR",
    sourceRarity: "SR",
    temporaryRarityMismatch: false,
    imagePath: "/characters/sakura_transparent_asset.png",
    source: "\u30AD\u30E3\u30E9/SR/SR_\u771F\u7530\u660C\u5E78.png",
    sha256: "5668d4d2c3f2cb8f2c8c6f08c16ebc99f10542f042873ff8e8ff9fbbb5eb91ec",
    width: 768,
    height: 1376
  },
  {
    characterId: "char_sawat_01",
    upstreamName: "\u30B5\u30EF\u30C3\u30C8",
    name: "\u706B\u85AC\u5E2B",
    runtimeRarity: "N",
    sourceRarity: "N",
    temporaryRarityMismatch: false,
    imagePath: "/characters/sawat_transparent_asset.png",
    source: "\u30AD\u30E3\u30E9/N/N_\u706B\u85AC\u5E2B.png",
    sha256: "2b110bd5988f191b80f6522c20b7ac0f1e4a1be2449496a9d9f1c4815fd37844",
    width: 768,
    height: 1376
  },
  {
    characterId: "char_seiya_01",
    upstreamName: "\u30BB\u30A4\u30E4",
    name: "\u77F3\u7530\u4E09\u6210",
    runtimeRarity: "SR",
    sourceRarity: "SR",
    temporaryRarityMismatch: false,
    imagePath: "/characters/seiya_transparent_asset.png",
    source: "\u30AD\u30E3\u30E9/SR/SR_\u77F3\u7530\u4E09\u6210.png",
    sha256: "b049007a344490485686d4f6b8c740dc56529974999b26fc11dfb03021da52c6",
    width: 768,
    height: 1376
  },
  {
    characterId: "char_serika_01",
    upstreamName: "\u30BB\u30EA\u30AB",
    name: "\u6D45\u4E95\u9577\u653F",
    runtimeRarity: "R",
    sourceRarity: "R",
    temporaryRarityMismatch: false,
    imagePath: "/characters/serika_transparent_asset.png",
    source: "\u30AD\u30E3\u30E9/R/R_\u6D45\u4E95\u9577\u653F .png",
    sha256: "da725ec093db1ed20e9fc5978a01bb1742a70765d75a9b2414f13925250a2843",
    width: 768,
    height: 1376
  },
  {
    characterId: "char_shin_01",
    upstreamName: "\u30B7\u30F3",
    name: "\u7247\u5009\u666F\u7DB1",
    runtimeRarity: "R",
    sourceRarity: "R",
    temporaryRarityMismatch: false,
    imagePath: "/characters/shin_transparent_asset.png",
    source: "\u30AD\u30E3\u30E9/R/R_\u7247\u5009\u666F\u7DB1.png",
    sha256: "0bbd271df219100bdc95f9fe188a4d1994d176ce43b82874b06a1f6d7a4771c6",
    width: 768,
    height: 1376
  },
  {
    characterId: "char_shion_01",
    upstreamName: "\u30B7\u30AA\u30F3",
    name: "\u7532\u6590\u59EB",
    runtimeRarity: "R",
    sourceRarity: "R",
    temporaryRarityMismatch: false,
    imagePath: "/characters/shion_transparent_asset.png",
    source: "\u30AD\u30E3\u30E9/R/R_\u7532\u6590\u59EB.png",
    sha256: "0c343ec94f5779e3c0595583909f198a97fcb0205b84d9c02abff373a04a2d82",
    width: 768,
    height: 1376
  },
  {
    characterId: "char_shun_01",
    upstreamName: "\u30B7\u30E5\u30F3",
    name: "\u753A\u5A18",
    runtimeRarity: "N",
    sourceRarity: "N",
    temporaryRarityMismatch: false,
    imagePath: "/characters/shun_transparent_asset.png",
    source: "\u30AD\u30E3\u30E9/N/N_\u753A\u5A18.png",
    sha256: "b689413a2670f2607dcb14be8ceb414864c41ddda081879ea2a6166bff6dbbc6",
    width: 768,
    height: 1376
  },
  {
    characterId: "char_sora_01",
    upstreamName: "\u30BD\u30E9",
    name: "\u7ACB\u82B1\u8ABE\u5343\u4EE3",
    runtimeRarity: "SR",
    sourceRarity: "SR",
    temporaryRarityMismatch: false,
    imagePath: "/characters/sora_transparent_asset.png",
    source: "\u30AD\u30E3\u30E9/SR/SR_\u7ACB\u82B1\u8ABE\u5343\u4EE3.png",
    sha256: "e3781b2907975d15fbbfcfd5d5d843e6225865e7433e56e69665a67c2679a211",
    width: 941,
    height: 1671
  },
  {
    characterId: "char_souta_01",
    upstreamName: "\u30BD\u30A6\u30BF",
    name: "\u8336\u5C4B\u306E\u5A18",
    runtimeRarity: "N",
    sourceRarity: "N",
    temporaryRarityMismatch: false,
    imagePath: "/characters/souta_transparent_asset.png",
    source: "\u30AD\u30E3\u30E9/N/N_\u8336\u5C4B\u306E\u5A18.png",
    sha256: "676d1cd5aabdbddc640a8e960a65c15217ff8a69a9d0974af6d50195f5fb7656",
    width: 768,
    height: 1376
  },
  {
    characterId: "char_taiga_01",
    upstreamName: "\u30BF\u30A4\u30AC",
    name: "\u9577\u5B97\u6211\u90E8\u5143\u89AA",
    runtimeRarity: "SR",
    sourceRarity: "SR",
    temporaryRarityMismatch: false,
    imagePath: "/characters/taiga_transparent_asset.png",
    source: "\u30AD\u30E3\u30E9/SR/R_\u9577\u5B97\u6211\u90E8\u5143\u89AA.png",
    sha256: "a7e97d89d869540cf894234fd5a01827bf98b6973f7e2fd3d34da836ced8c508",
    width: 768,
    height: 1376
  },
  {
    characterId: "char_takeshi_01",
    upstreamName: "\u30BF\u30B1\u30B7",
    name: "\u9670\u967D\u5E2B",
    runtimeRarity: "SR",
    sourceRarity: "N",
    temporaryRarityMismatch: true,
    imagePath: "/characters/takeshi_transparent_asset.png",
    source: "\u30AD\u30E3\u30E9/N/N_\u9670\u967D\u5E2B.png",
    sha256: "4f2110c734fda150cc8e916dc26bff3d7c5432229bf64986b48cc2c255a5fad3",
    width: 768,
    height: 1376
  },
  {
    characterId: "char_takuro_01",
    upstreamName: "\u30BF\u30AF\u30ED\u30A6",
    name: "\u96D1\u8CC0\u5B6B\u5E02",
    runtimeRarity: "SR",
    sourceRarity: "SR",
    temporaryRarityMismatch: false,
    imagePath: "/characters/takuro_transparent_asset.png",
    source: "\u30AD\u30E3\u30E9/SR/SR_\u96D1\u8CC0\u5B6B\u5E02.png",
    sha256: "b2879a9f03362a908b4d780141f64b89b20afabc1ca7b8644cf4a99240b5b5f1",
    width: 768,
    height: 1376
  },
  {
    characterId: "char_tatsuya_01",
    upstreamName: "\u30BF\u30C4\u30E4",
    name: "\u884C\u5546\u4EBA",
    runtimeRarity: "N",
    sourceRarity: "N",
    temporaryRarityMismatch: false,
    imagePath: "/characters/tatsuya_transparent_asset.png",
    source: "\u30AD\u30E3\u30E9/N/N_\u884C\u5546\u4EBA.png",
    sha256: "154f4d8ab82f34ec9e9ba85af3b83f60789a3247cbd30f87d566cc4c1875f05e",
    width: 768,
    height: 1376
  },
  {
    characterId: "char_tetsu_01",
    upstreamName: "\u30C6\u30C4",
    name: "\u9ED2\u7530\u5B98\u5175\u885B",
    runtimeRarity: "SR",
    sourceRarity: "SR",
    temporaryRarityMismatch: false,
    imagePath: "/characters/tetsu_transparent_asset.png",
    source: "\u30AD\u30E3\u30E9/SR/SR_\u9ED2\u7530\u5B98\u5175\u885B.png",
    sha256: "bbbf45245928ba1ad2969335d1bcc744bb95b6e3097b0aa45138081db56dfc15",
    width: 768,
    height: 1376
  },
  {
    characterId: "char_tomoya_01",
    upstreamName: "\u30C8\u30E2\u30E4",
    name: "\u9244\u7832\u5175",
    runtimeRarity: "N",
    sourceRarity: "N",
    temporaryRarityMismatch: false,
    imagePath: "/characters/tomoya_transparent_asset.png",
    source: "\u30AD\u30E3\u30E9/N/N_\u9244\u7832\u5175.png",
    sha256: "e34579d6019f247b2378134038b7e9b03556027d0599faf03c7dd0edd8041317",
    width: 768,
    height: 1376
  },
  {
    characterId: "char_yoshihiko_01",
    upstreamName: "\u30E8\u30B7\u30D2\u30B3",
    name: "\u935B\u51B6\u5E2B",
    runtimeRarity: "N",
    sourceRarity: "N",
    temporaryRarityMismatch: false,
    imagePath: "/characters/yoshihiko_transparent_asset.png",
    source: "\u30AD\u30E3\u30E9/N/N_\u935B\u51B6\u5E2B.png",
    sha256: "dd9f8f0f6fabe576dd9cd14708f51d207e39899adfa88450d00b97e3c714dee9",
    width: 768,
    height: 1376
  },
  {
    characterId: "char_yuji_01",
    upstreamName: "\u30E6\u30A6\u30B8",
    name: "\u7ACB\u82B1\u5B97\u8302",
    runtimeRarity: "R",
    sourceRarity: "R",
    temporaryRarityMismatch: false,
    imagePath: "/characters/yuuji_transparent_asset.png",
    source: "\u30AD\u30E3\u30E9/R/R_\u7ACB\u82B1\u5B97\u8302.png",
    sha256: "1ff3bf9eab53ba1e54da115851ac32c77b90c0cccfab016739734c976d44aa13",
    width: 768,
    height: 1376
  },
  {
    characterId: "char_yuki_01",
    upstreamName: "\u30E6\u30A6\u30AD",
    name: "\u7AF9\u4E2D\u534A\u5175\u885B",
    runtimeRarity: "R",
    sourceRarity: "R",
    temporaryRarityMismatch: false,
    imagePath: "/characters/yuki_transparent_asset.png",
    source: "\u30AD\u30E3\u30E9/R/R_\u7AF9\u4E2D\u534A\u5175\u885B.png",
    sha256: "5ba517217282a45b73482422bdaf0ccbd7e1abcfba926f83a3023abe39b0c113",
    width: 768,
    height: 1376
  },
  {
    characterId: "char_yukina_01",
    upstreamName: "\u30E6\u30AD\u30CA",
    name: "\u7D30\u5DDD\u30AC\u30E9\u30B7\u30E3",
    runtimeRarity: "R",
    sourceRarity: "R",
    temporaryRarityMismatch: false,
    imagePath: "/characters/yukina_transparent_asset.png",
    source: "\u30AD\u30E3\u30E9/R/R_ \u7D30\u5DDD\u30AC\u30E9\u30B7\u30E3.png",
    sha256: "7e737eb506b81555c19e8edac6948438a261a54d04a08054eceefd09826e5617",
    width: 768,
    height: 1376
  }
];

// src/theme/sengoku-masters.json
var sengoku_masters_default = {
  ACCESSORY_001: "\u9285\u306E\u8033\u98FE\u308A",
  ACCESSORY_002: "\u9244\u8F2A\u306E\u6307\u74B0",
  ACCESSORY_003: "\u9769\u7D10\u306E\u9996\u98FE\u308A",
  ACCESSORY_004: "\u6B66\u904B\u306E\u6728\u672D",
  ACCESSORY_005: "\u75BE\u98A8\u306E\u624B\u7532\u7D10",
  ACCESSORY_006: "\u9280\u9396\u306E\u9996\u98FE\u308A",
  ACCESSORY_007: "\u771F\u936E\u306E\u8155\u8F2A",
  ACCESSORY_008: "\u98A8\u9234\u306E\u6839\u4ED8",
  ACCESSORY_009: "\u9B3C\u9762\u306E\u6839\u4ED8",
  ACCESSORY_010: "\u7DE8\u9769\u306E\u8155\u8F2A",
  ACCESSORY_011: "\u65E9\u99C6\u3051\u306E\u5B88\u308A",
  ACCESSORY_012: "\u9EC4\u91D1\u5927\u9396",
  ACCESSORY_013: "\u6B66\u529F\u306E\u5370\u5224\u6307\u8F2A",
  ACCESSORY_014: "\u9244\u8F2A\u306E\u9996\u98FE\u308A",
  ACCESSORY_015: "\u68D8\u9244\u306E\u8155\u8F2A",
  ACCESSORY_016: "\u5C0F\u67C4\u306E\u9996\u98FE\u308A",
  ACCESSORY_017: "\u52DD\u8CA0\u8CFD",
  ACCESSORY_018: "\u6B66\u5177\u5E2F",
  ACCESSORY_019: "\u9AD1\u9ACF\u9280\u8F2A",
  ACCESSORY_020: "\u75BE\u98A8\u306E\u8033\u98FE\u308A",
  ACCESSORY_021: "\u9244\u9396\u306E\u8170\u98FE\u308A",
  ACCESSORY_022: "\u5357\u86EE\u5341\u5B57\u5B88",
  ACCESSORY_023: "\u65E9\u99C6\u3051\u306E\u8B77\u7B26",
  ACCESSORY_024: "\u86C7\u7D0B\u8155\u8F2A",
  ACCESSORY_025: "\u706B\u7E04\u5F3E\u306E\u9996\u98FE\u308A",
  ACCESSORY_026: "\u5F62\u898B\u306E\u5B88\u888B",
  ACCESSORY_027: "\u767D\u91D1\u5370\u5224\u6307\u8F2A",
  ACCESSORY_028: "\u8170\u5DEE\u3057\u77E2\u7B52",
  ACCESSORY_029: "\u84BC\u7389\u306E\u6307\u8F2A",
  ACCESSORY_030: "\u767D\u9280\u5927\u9396",
  ACCESSORY_031: "\u6B7B\u795E\u306E\u9280\u5B88",
  ACCESSORY_032: "\u767E\u5408\u7D0B\u9996\u98FE\u308A",
  ACCESSORY_033: "\u9B3C\u68D8\u306E\u9996\u8F2A",
  ACCESSORY_034: "\u91D1\u525B\u77F3\u306E\u8B77\u8F2A",
  ACCESSORY_035: "\u539F\u77F3\u7FE1\u7FE0\u8155\u8F2A",
  ACCESSORY_036: "\u6C34\u6676\u306E\u5FA1\u5B88",
  ACCESSORY_037: "\u98A8\u8AAD\u307F\u306E\u8155\u8F2A",
  ACCESSORY_038: "\u9ED2\u7D0B\u306E\u8B77\u7B26",
  ACCESSORY_039: "\u9244\u67B7\u306E\u8155\u8F2A",
  ACCESSORY_040: "\u7D05\u7389\u91D1\u98FE\u308A",
  ACCESSORY_041: "\u7C60\u624B\u30FB\u525B",
  ACCESSORY_042: "\u86C7\u795E\u306E\u8DB3\u8F2A",
  ACCESSORY_043: "\u9AD1\u9ACF\u9244\u5B88",
  ACCESSORY_044: "\u91D1\u525B\u306E\u8155\u7532",
  ACCESSORY_045: "\u6708\u767D\u77F3\u306E\u895F\u98FE\u308A",
  ACCESSORY_046: "\u6B66\u5C06\u306E\u7FE1\u7FE0\u5B88",
  ACCESSORY_047: "\u6F06\u5857\u308A\u306E\u685C\u6839\u4ED8",
  ACCESSORY_048: "\u5BB5\u95C7\u306E\u5B9D\u73E0",
  ACCESSORY_049: "\u904B\u547D\u306E\u8B77\u7B26",
  ACCESSORY_050: "\u5973\u738B\u306E\u5370\u5224",
  AWAKENING_BOOK: "\u899A\u9192\u306E\u79D8\u5DFB",
  BODY_001: "\u9EBB\u7FBD\u7E54",
  BODY_002: "\u6728\u7DBF\u9663\u7FBD\u7E54",
  BODY_003: "\u91CE\u826F\u7740",
  BODY_004: "\u7D79\u7FBD\u7E54",
  BODY_005: "\u9769\u80F4",
  BODY_006: "\u3086\u3063\u305F\u308A\u5C0F\u8896",
  BODY_007: "\u4E0A\u7B49\u9663\u7FBD\u7E54",
  BODY_008: "\u9ED2\u9769\u9577\u7FBD\u7E54",
  BODY_009: "\u4E8C\u679A\u80F4\u5177\u8DB3",
  BODY_010: "\u8EFD\u88C5\u5C0F\u8896",
  BODY_011: "\u6B66\u50CD\u304D\u306E\u9663\u7FBD\u7E54",
  BODY_012: "\u7DBF\u5165\u308C\u80F4\u7740",
  BODY_013: "\u98DB\u811A\u7FBD\u7E54",
  BODY_014: "\u9244\u677F\u80F4",
  BODY_015: "\u5FCD\u88C5\u675F",
  BODY_016: "\u5927\u93A7\u30FB\u525B",
  BODY_017: "\u9396\u5E37\u5B50",
  BODY_018: "\u5357\u86EE\u80F4\u7FBD\u7E54",
  BODY_019: "\u92F2\u6253\u9769\u80F4",
  BODY_020: "\u5F53\u4E16\u5177\u8DB3\u30FB\u525B\u529B",
  BODY_021: "\u75BE\u98A8\u9663\u7FBD\u7E54",
  BODY_022: "\u4E0A\u7B49\u7F85\u7D17\u9663\u7FBD\u7E54",
  BODY_023: "\u5927\u93A7\u300E\u76FE\u58C1\u300F",
  BODY_024: "\u96A0\u5BC6\u9396\u5E37\u5B50",
  BODY_025: "\u5929\u9D5E\u7D68\u306E\u9663\u7FBD\u7E54",
  BODY_026: "\u8987\u738B\u306E\u5927\u93A7",
  BODY_027: "\u86C7\u7D0B\u306E\u7D79\u5C0F\u8896",
  BODY_028: "\u6226\u59EB\u306E\u8EFD\u88C5\u5177\u8DB3",
  BODY_029: "\u7D05\u84EE\u306E\u9663\u7FBD\u7E54",
  BODY_030: "\u822C\u82E5\u523A\u7E4D\u306E\u9663\u7FBD\u7E54",
  CHAR_EXP_L: "\u4FEE\u7DF4\u306E\u5175\u7CE7\u4E38\u30FB\u5927",
  CHAR_EXP_M: "\u4FEE\u7DF4\u306E\u5175\u7CE7\u4E38\u30FB\u4E2D",
  CHAR_EXP_S: "\u4FEE\u7DF4\u306E\u5175\u7CE7\u4E38\u30FB\u5C0F",
  ENERGY_DRINK: "\u6D3B\u529B\u4E38",
  EQUIP_EXP_L: "\u935B\u932C\u306E\u7825\u77F3\u30FB\u5927",
  EQUIP_EXP_M: "\u935B\u932C\u306E\u7825\u77F3\u30FB\u4E2D",
  EQUIP_EXP_S: "\u935B\u932C\u306E\u7825\u77F3\u30FB\u5C0F",
  EQUIP_LB_PART: "\u935B\u51B6\u306E\u79D8\u92FC",
  HEAD_001: "\u6728\u7DBF\u9262\u5DFB",
  HEAD_002: "\u8D64\u5099\u3048\u9262\u5DFB",
  HEAD_003: "\u982D\u5DFE",
  HEAD_004: "\u4F5C\u696D\u7B20",
  HEAD_005: "\u52DD\u904B\u306E\u70CF\u5E3D\u5B50",
  HEAD_006: "\u5FCD\u3073\u982D\u5DFE",
  HEAD_007: "\u9ED2\u6F06\u9663\u7B20",
  HEAD_008: "\u85AC\u5E2B\u306E\u8986\u9762",
  HEAD_009: "\u9244\u515C",
  HEAD_010: "\u9060\u898B\u773C\u93E1",
  HEAD_011: "\u9244\u88FD\u9663\u7B20",
  HEAD_012: "\u591C\u898B\u306E\u9060\u773C\u93E1",
  HEAD_013: "\u9762\u982C\u30FB\u906E\u5149",
  HEAD_014: "\u9244\u9762\u982C",
  HEAD_015: "\u75BE\u98A8\u306E\u76EE\u5E87",
  HEAD_016: "\u96A0\u5BC6\u982D\u5DFE",
  HEAD_017: "\u9262\u91D1\u300E\u5343\u91CC\u773C\u300F",
  HEAD_018: "\u515C\u300E\u9632\u5841\u300F",
  HEAD_019: "\u8987\u8005\u306E\u76EE\u5E87",
  HEAD_020: "\u8276\u82B1\u306E\u9ED2\u7C2A",
  LEGS_001: "\u8EFD\u88C5\u88B4",
  LEGS_002: "\u7D99\u304E\u5F53\u3066\u88B4",
  LEGS_003: "\u91CE\u88B4",
  LEGS_004: "\u8349\u978B\u30FB\u75BE\u98A8",
  LEGS_005: "\u811A\u7D46",
  LEGS_006: "\u9769\u88B4",
  LEGS_007: "\u5F37\u5316\u91CE\u88B4",
  LEGS_008: "\u4F0A\u8CC0\u88B4",
  LEGS_009: "\u7D30\u8EAB\u88B4",
  LEGS_010: "\u4F5C\u696D\u88B4",
  LEGS_011: "\u9632\u8B77\u91CE\u88B4",
  LEGS_012: "\u9244\u92F2\u811A\u7D46",
  LEGS_013: "\u5FCD\u3073\u811A\u7D46",
  LEGS_014: "\u91CD\u88C5\u811B\u5F53",
  LEGS_015: "\u901A\u6C17\u9396\u811A\u7D46",
  LEGS_016: "\u92F2\u6253\u9769\u88B4",
  LEGS_017: "\u75BE\u98A8\u8DB3\u888B\u300E\u9583\u5149\u300F",
  LEGS_018: "\u5927\u811B\u5F53\u300E\u9632\u5841\u300F",
  LEGS_019: "\u97CB\u99C4\u5929\u306E\u8349\u978B",
  LEGS_020: "\u6F06\u9ED2\u306E\u5FCD\u3073\u811A\u7D46",
  NORMAL_GACHA_TICKET_CHARACTER: "\u59EB\u6B66\u5C06\u53EC\u559A\u672D",
  NORMAL_GACHA_TICKET_EQUIPMENT: "\u6B66\u5177\u53EC\u559A\u672D",
  NORMAL_GACHA_TICKET_SKILL: "\u6226\u6280\u53EC\u559A\u672D",
  PVP_POINT_TICKET: "\u6C7A\u95D8\u72B6",
  RAID_POINT_TICKET: "\u8A0E\u4F10\u4EE4",
  SKILL_001: "\u4E00\u6587\u5B57\u65AC\u308A",
  SKILL_002: "\u7AF9\u675F\u306E\u5B88\u308A",
  SKILL_003: "\u85AC\u5E2B\u306E\u624B\u5F53",
  SKILL_004: "\u75BE\u98A8\u306E\u8DB3\u904B\u3073",
  SKILL_005: "\u5FCD\u6CD5\u30FB\u6BD2\u91DD",
  SKILL_006: "\u9244\u58C1\u306E\u69CB\u3048",
  SKILL_007: "\u6311\u767A\u306E\u9B28",
  SKILL_008: "\u5F13\u53D6\u308A\u306E\u4E00\u5C04",
  SKILL_009: "\u596E\u8D77\u306E\u9663\u592A\u9F13",
  SKILL_010: "\u76EE\u6F70\u3057\u7C89",
  SKILL_011: "\u6E3E\u8EAB\u306E\u592A\u5200",
  SKILL_012: "\u8599\u5200\u30FB\u5927\u65CB\u98A8",
  SKILL_013: "\u85AC\u5E2B\u306E\u5FDC\u6025\u624B\u5F53",
  SKILL_014: "\u7159\u5E55\u306E\u5B88\u9663",
  SKILL_015: "\u7834\u7532\u306E\u706B\u85AC\u7389",
  SKILL_016: "\u4EC1\u738B\u7ACB\u3061\u30FB\u7AF9\u675F\u76FE",
  SKILL_017: "\u9B28\u306E\u58F0",
  SKILL_018: "\u91D1\u7815\u68D2\u30FB\u8133\u5929\u6483\u3061",
  SKILL_019: "\u8840\u5438\u3044\u306E\u9023\u5203",
  SKILL_020: "\u65E9\u99C6\u3051\u306E\u53F7\u4EE4",
  SKILL_021: "\u6025\u6240\u5C04\u3061",
  SKILL_022: "\u5927\u8599\u5200\u30FB\u93A7\u5D29\u3057",
  SKILL_023: "\u79D8\u85AC\u30FB\u91D1\u5275\u818F",
  SKILL_024: "\u7AF9\u675F\u30FB\u9244\u58C1\u9663",
  SKILL_025: "\u5FCD\u6CD5\u30FB\u7159\u7389\u4E71\u821E",
  SKILL_026: "\u6C7A\u8D77\u306E\u5927\u53F7\u4EE4",
  SKILL_027: "\u8840\u98A8\u65AC\u308A",
  SKILL_028: "\u93A7\u901A\u3057",
  SKILL_029: "\u85AC\u5E2B\u306E\u6D3B\u547D\u8853",
  SKILL_030: "\u4E71\u7834\u30FB\u4F1D\u4EE4\u5C01\u3058",
  SKILL_031: "\u653B\u9632\u4E00\u4F53\u30FB\u69CD\u887E",
  SKILL_032: "\u5FCD\u6CD5\u30FB\u6BD2\u5203",
  SKILL_033: "\u660E\u93E1\u6B62\u6C34",
  SKILL_034: "\u5FCD\u6CD5\u30FB\u9583\u5149\u7389",
  SKILL_035: "\u80CC\u6C34\u306E\u9663",
  SKILL_036: "\u5965\u7FA9\u30FB\u4E00\u5200\u4E21\u65AD",
  SKILL_037: "\u5965\u7FA9\u30FB\u5343\u5203\u4E71\u821E",
  SKILL_038: "\u91D1\u57CE\u9244\u58C1",
  SKILL_039: "\u79D8\u5965\u7FA9\u30FB\u795E\u533B\u306E\u9663",
  SKILL_040: "\u5996\u8853\u30FB\u8755\u307F\u306E\u9ED2\u9727",
  SKILL_041: "\u8987\u9053\u306E\u5927\u53F7\u4EE4",
  SKILL_042: "\u79D8\u5965\u7FA9\u30FB\u8840\u685C\u4E71\u821E",
  SKILL_043: "\u5965\u7FA9\u30FB\u5730\u88C2\u5927\u69CC",
  SKILL_044: "\u80CC\u6C34\u30FB\u4FEE\u7F85\u8FD4\u3057",
  SKILL_045: "\u8ECD\u7565\u30FB\u7DCF\u653B\u3081\u306E\u53F7\u4EE4",
  SKILL_046: "\u5996\u8853\u30FB\u6BD2\u8718\u86DB\u306E\u9663",
  SKILL_047: "\u5805\u9663\u30FB\u53CD\u6483\u306E\u69CD\u887E",
  SKILL_048: "\u4E0D\u5C48\u30FB\u547D\u8108\u306E\u7948\u308A",
  SKILL_049: "\u5FCD\u6CD5\u30FB\u5BB5\u95C7\u5C01\u3058",
  SKILL_050: "\u79D8\u5965\u7FA9\u30FB\u93A7\u65AD\u3061",
  SKILL_051: "\u525B\u62F3\u30FB\u4E00\u6483\u5FC5\u5012",
  SKILL_052: "\u4FEE\u7F85\u306E\u731B\u653B",
  SKILL_053: "\u4EC1\u738B\u7ACB\u3061",
  SKILL_054: "\u8987\u738B\u306E\u5A01\u5727",
  SKILL_055: "\u75BE\u98A8\u8FC5\u96F7",
  SKILL_056: "\u98A8\u5207\u308A\u306E\u592A\u5200",
  SKILL_057: "\u72D0\u706B\u306E\u622F\u308C",
  SKILL_058: "\u5BB5\u95C7\u306E\u5E7B\u60D1",
  SKILL_059: "\u6226\u59EB\u306E\u5A01\u5149",
  SKILL_060: "\u79D8\u5965\u7FA9\u30FB\u547D\u7E4B\u304E",
  SKILL_061: "\u91D1\u525B\u5D29\u3057",
  SKILL_062: "\u80CC\u6C34\u306E\u4E00\u592A\u5200",
  SKILL_063: "\u8001\u7DF4\u306E\u5B88\u308A",
  SKILL_064: "\u6D41\u6C34\u53CD\u6483",
  SKILL_065: "\u97CB\u99C4\u5929\u306E\u5148\u99C6\u3051",
  SKILL_066: "\u75BE\u98A8\u9023\u65AC",
  SKILL_067: "\u5FCD\u6CD5\u30FB\u53E3\u5C01\u3058",
  SKILL_068: "\u4E7E\u5764\u4E00\u64F2",
  SKILL_069: "\u7D05\u84EE\u306E\u4E00\u6483",
  SKILL_070: "\u5BB5\u95C7\u306E\u546A\u8A5B",
  SKILL_MANUAL: "\u5965\u7FA9\u6307\u5357\u66F8",
  SPECIAL_TICKET_CHARACTER: "\u7279\u9078\u30FB\u59EB\u6B66\u5C06\u53EC\u559A\u672D",
  SPECIAL_TICKET_EQUIPMENT: "\u7279\u9078\u30FB\u6B66\u5177\u53EC\u559A\u672D",
  SPECIAL_TICKET_SKILL: "\u7279\u9078\u30FB\u6226\u6280\u53EC\u559A\u672D",
  WEAPON_001: "\u5C0F\u5200",
  WEAPON_002: "\u706B\u7E04\u77ED\u7B52",
  WEAPON_003: "\u91D1\u7815\u68D2",
  WEAPON_004: "\u5C71\u5200",
  WEAPON_005: "\u5341\u624B",
  WEAPON_006: "\u5C0F\u67C4",
  WEAPON_007: "\u9244\u68D2",
  WEAPON_008: "\u9244\u62F3",
  WEAPON_009: "\u9244\u9264\u68D2",
  WEAPON_010: "\u5927\u53E3\u5F84\u77ED\u7B52",
  WEAPON_011: "\u77ED\u5200",
  WEAPON_012: "\u6539\u826F\u706B\u7E04\u77ED\u7B52",
  WEAPON_013: "\u6563\u5F3E\u706B\u7E04\u9283",
  WEAPON_014: "\u6226\u5834\u5C0F\u5200",
  WEAPON_015: "\u9244\u5341\u624B",
  WEAPON_016: "\u5FCD\u3073\u9023\u5F29",
  WEAPON_017: "\u5927\u69CC",
  WEAPON_018: "\u53CC\u5203\u5C0F\u5200",
  WEAPON_019: "\u92FC\u7CF8",
  WEAPON_020: "\u5F37\u5F13",
  WEAPON_021: "\u9264\u722A",
  WEAPON_022: "\u5357\u86EE\u5927\u7B52",
  WEAPON_023: "\u75FA\u308C\u6BD2\u306E\u77ED\u5200",
  WEAPON_024: "\u9023\u5F29\u30FB\u75BE\u98A8",
  WEAPON_025: "\u7834\u57CE\u5927\u69CC",
  WEAPON_026: "\u4ED5\u8FBC\u307F\u5200\u300E\u9ED2\u66DC\u300F",
  WEAPON_027: "\u9244\u7832\u300E\u70C8\u706B\u300F",
  WEAPON_028: "\u5996\u5200\u300E\u5438\u8840\u300F",
  WEAPON_029: "\u6BD2\u4ED5\u8FBC\u307F\u77ED\u5200",
  WEAPON_030: "\u6563\u5F3E\u706B\u7E04\u9283\u300E\u96F7\u5EA7\u300F",
  WEAPON_031: "\u5927\u7B52\u300E\u68FA\u300F",
  WEAPON_032: "\u53CC\u77ED\u7B52",
  WEAPON_033: "\u5341\u624B\u300E\u91D1\u525B\u300F",
  WEAPON_034: "\u5FCD\u5200",
  WEAPON_035: "\u96A0\u3057\u77ED\u7B52",
  WEAPON_036: "\u5200\u300E\u5F71\u6253\u3061\u300F",
  WEAPON_037: "\u72D9\u6483\u706B\u7E04\u9283",
  WEAPON_038: "\u9244\u9264\u722A",
  WEAPON_039: "\u5FCD\u5F13\u300E\u9759\u5BC2\u300F",
  WEAPON_040: "\u86C7\u8179\u5263",
  WEAPON_041: "\u5927\u8EAB\u69CD",
  WEAPON_042: "\u9244\u62F3\u300E\u963F\u4FEE\u7F85\u300F",
  WEAPON_043: "\u5996\u5200\u300E\u6BD2\u86C7\u300F",
  WEAPON_044: "\u5200\u300E\u96FB\u5149\u77F3\u706B\u300F",
  WEAPON_045: "\u5927\u7B52\u300E\u7D42\u672B\u306E\u9418\u300F",
  WEAPON_046: "\u91D1\u7259\u306E\u77ED\u5200",
  WEAPON_047: "\u8C6A\u5263\u300E\u70B9\u706B\u300F",
  WEAPON_048: "\u75BE\u98A8\u5200",
  WEAPON_049: "\u6BD2\u86C7\u306E\u9ED2\u5203",
  WEAPON_050: "\u652F\u914D\u8005\u306E\u9244\u6247"
};

// src/domain/gameplay/canonical/data/skills_20260821.json
var skills_20260821_default = {
  version: "2026-08-21",
  status: "PRODUCTION_FROZEN",
  authority: "Recovery Export + user FIX decisions in Production Freeze Final Pass.",
  cooldown_contract: {
    mapping_fixed_initial_cd_to_available_from_round: {
      "0": 1,
      "1": 2,
      "2": 3,
      "3": 4
    },
    next_use_rule: "If used in round N with cooldown C, next usable round is N+C.",
    trigger_skills: {
      cooldown: null,
      available_from_round: 1
    }
  },
  exclusive_skill_contract: {
    equippable_only_by_exclusive_character: true,
    consumes_skill_slot: true,
    max_exclusive_skills_per_character: 1
  },
  skills: [
    {
      skill_id: "SKILL_001",
      name: "\u30B9\u30C8\u30EA\u30FC\u30C8\u30D1\u30F3\u30C1",
      rarity: "N",
      kind: "NORMAL",
      exclusive_character_id: null,
      activation_type: "ACTIVE",
      cooldown: 3,
      available_from_round: 1,
      target: "ENEMY_SINGLE",
      effects: [
        "DAMAGE 90% ATK"
      ]
    },
    {
      skill_id: "SKILL_002",
      name: "\u30AF\u30A4\u30C3\u30AF\u30B7\u30FC\u30EB\u30C9",
      rarity: "N",
      kind: "NORMAL",
      exclusive_character_id: null,
      activation_type: "ACTIVE",
      cooldown: 3,
      available_from_round: 1,
      target: "SELF",
      effects: [
        "SHIELD 10% MaxHP / 2T"
      ]
    },
    {
      skill_id: "SKILL_003",
      name: "\u30CE\u30A4\u30BA\u30D2\u30FC\u30EB",
      rarity: "N",
      kind: "NORMAL",
      exclusive_character_id: null,
      activation_type: "ACTIVE",
      cooldown: 3,
      available_from_round: 1,
      target: "ALLY_SINGLE",
      effects: [
        "HEAL 10% target MaxHP"
      ]
    },
    {
      skill_id: "SKILL_004",
      name: "\u30B9\u30C6\u30C3\u30D7\u30C0\u30C3\u30B7\u30E5",
      rarity: "N",
      kind: "NORMAL",
      exclusive_character_id: null,
      activation_type: "ACTIVE",
      cooldown: 3,
      available_from_round: 1,
      target: "SELF",
      effects: [
        "SPD +12% / 2T"
      ]
    },
    {
      skill_id: "SKILL_005",
      name: "\u6BD2\u91DD",
      rarity: "N",
      kind: "NORMAL",
      exclusive_character_id: null,
      activation_type: "ACTIVE",
      cooldown: 3,
      available_from_round: 1,
      target: "ENEMY_SINGLE",
      effects: [
        "DAMAGE 55% ATK",
        "POISON 70% / 2T"
      ]
    },
    {
      skill_id: "SKILL_006",
      name: "\u30A2\u30A4\u30A2\u30F3\u30AC\u30FC\u30C9",
      rarity: "N",
      kind: "NORMAL",
      exclusive_character_id: null,
      activation_type: "ACTIVE",
      cooldown: 3,
      available_from_round: 1,
      target: "SELF",
      effects: [
        "DEF +15% / 2T"
      ]
    },
    {
      skill_id: "SKILL_007",
      name: "\u7F75\u8A48\u96D1\u8A00",
      rarity: "N",
      kind: "NORMAL",
      exclusive_character_id: null,
      activation_type: "ACTIVE",
      cooldown: 3,
      available_from_round: 1,
      target: "SELF",
      effects: [
        "TAUNT 80% / 1T"
      ]
    },
    {
      skill_id: "SKILL_008",
      name: "\u30B9\u30DE\u30FC\u30C8\u30B9\u30CA\u30A4\u30D7",
      rarity: "N",
      kind: "NORMAL",
      exclusive_character_id: null,
      activation_type: "ACTIVE",
      cooldown: 3,
      available_from_round: 1,
      target: "ENEMY_SINGLE",
      effects: [
        "DAMAGE 100% ATK"
      ]
    },
    {
      skill_id: "SKILL_009",
      name: "\u30C9\u30FC\u30D4\u30F3\u30B0\u6CE8\u5C04",
      rarity: "N",
      kind: "NORMAL",
      exclusive_character_id: null,
      activation_type: "ACTIVE",
      cooldown: 3,
      available_from_round: 1,
      target: "SELF",
      effects: [
        "ATK +15% / 2T"
      ]
    },
    {
      skill_id: "SKILL_010",
      name: "\u30E9\u30A4\u30C8\u30D5\u30E9\u30C3\u30B7\u30E5",
      rarity: "N",
      kind: "NORMAL",
      exclusive_character_id: null,
      activation_type: "ACTIVE",
      cooldown: 3,
      available_from_round: 1,
      target: "ENEMY_SINGLE",
      effects: [
        "BLIND 60% / 1T"
      ]
    },
    {
      skill_id: "SKILL_011",
      name: "\u30C1\u30E3\u30FC\u30B8\u30B9\u30E9\u30C3\u30B7\u30E5",
      rarity: "R",
      kind: "NORMAL",
      exclusive_character_id: null,
      activation_type: "ACTIVE",
      cooldown: 3,
      available_from_round: 1,
      target: "ENEMY_SINGLE",
      effects: [
        "DAMAGE 130% ATK"
      ]
    },
    {
      skill_id: "SKILL_012",
      name: "\u5927\u65CB\u98A8\u30D1\u30A4\u30D7",
      rarity: "R",
      kind: "NORMAL",
      exclusive_character_id: null,
      activation_type: "ACTIVE",
      cooldown: 3,
      available_from_round: 1,
      target: "ENEMY_ALL",
      effects: [
        "DAMAGE 75% ATK"
      ]
    },
    {
      skill_id: "SKILL_013",
      name: "\u30D5\u30A3\u30FC\u30EB\u30C9\u5FDC\u6025\u624B\u5F53",
      rarity: "R",
      kind: "NORMAL",
      exclusive_character_id: null,
      activation_type: "ACTIVE",
      cooldown: 3,
      available_from_round: 1,
      target: "ALLY_SINGLE",
      effects: [
        "HEAL 16% target MaxHP",
        "REMOVE_STATUS 1"
      ]
    },
    {
      skill_id: "SKILL_014",
      name: "\u30B9\u30E2\u30FC\u30AF\u30B9\u30AF\u30EA\u30FC\u30F3",
      rarity: "R",
      kind: "NORMAL",
      exclusive_character_id: null,
      activation_type: "ACTIVE",
      cooldown: 3,
      available_from_round: 2,
      target: "ALLY_ALL",
      effects: [
        "DEF +18% / 2T"
      ]
    },
    {
      skill_id: "SKILL_015",
      name: "\u5F37\u9178\u30A2\u30B8\u30C9\u30B9\u30D7\u30EC\u30FC",
      rarity: "R",
      kind: "NORMAL",
      exclusive_character_id: null,
      activation_type: "ACTIVE",
      cooldown: 3,
      available_from_round: 2,
      target: "ENEMY_SINGLE",
      effects: [
        "DEF -20% / 2T / chance 85%"
      ]
    },
    {
      skill_id: "SKILL_016",
      name: "\u30E9\u30A4\u30AA\u30C3\u30C8\u30D0\u30EA\u30A2",
      rarity: "R",
      kind: "NORMAL",
      exclusive_character_id: null,
      activation_type: "ACTIVE",
      cooldown: 4,
      available_from_round: 1,
      target: "SELF",
      effects: [
        "SHIELD 16% MaxHP / 2T",
        "TAUNT 100% / 2T"
      ]
    },
    {
      skill_id: "SKILL_017",
      name: "\u4E0D\u5C48\u306E\u6012\u53F7",
      rarity: "R",
      kind: "NORMAL",
      exclusive_character_id: null,
      activation_type: "ACTIVE",
      cooldown: 3,
      available_from_round: 2,
      target: "ALLY_ALL",
      effects: [
        "ATK +18% / 2T"
      ]
    },
    {
      skill_id: "SKILL_018",
      name: "\u9AD8\u5727\u96FB\u6483\u8B66\u68D2",
      rarity: "R",
      kind: "NORMAL",
      exclusive_character_id: null,
      activation_type: "ACTIVE",
      cooldown: 4,
      available_from_round: 2,
      target: "ENEMY_SINGLE",
      effects: [
        "DAMAGE 80% ATK",
        "STUN 45% / target next action"
      ]
    },
    {
      skill_id: "SKILL_019",
      name: "\u30D0\u30FC\u30B9\u30C8\u30E9\u30C3\u30B7\u30E5",
      rarity: "R",
      kind: "NORMAL",
      exclusive_character_id: null,
      activation_type: "ACTIVE",
      cooldown: 3,
      available_from_round: 1,
      target: "ENEMY_SINGLE",
      effects: [
        "DAMAGE 115% ATK",
        "LIFESTEAL 25% of damage"
      ]
    },
    {
      skill_id: "SKILL_020",
      name: "\u30BF\u30AF\u30C6\u30A3\u30AB\u30EB\u30EA\u30ED\u30FC\u30C9",
      rarity: "R",
      kind: "NORMAL",
      exclusive_character_id: null,
      activation_type: "ACTIVE",
      cooldown: 3,
      available_from_round: 2,
      target: "ALLY_ALL",
      effects: [
        "SPD +18% / 2T"
      ]
    },
    {
      skill_id: "SKILL_021",
      name: "\u6025\u6240\u6483\u3061",
      rarity: "SR",
      kind: "NORMAL",
      exclusive_character_id: null,
      activation_type: "ACTIVE",
      cooldown: 4,
      available_from_round: 2,
      target: "ENEMY_SINGLE",
      effects: [
        "DAMAGE 190% ATK"
      ]
    },
    {
      skill_id: "SKILL_022",
      name: "\u91CD\u9244\u30D1\u30A4\u30D7\u5927\u8599\u304E",
      rarity: "SR",
      kind: "NORMAL",
      exclusive_character_id: null,
      activation_type: "ACTIVE",
      cooldown: 4,
      available_from_round: 2,
      target: "ENEMY_ALL",
      effects: [
        "DAMAGE 105% ATK",
        "DEF -20% / 2T / chance 85%"
      ]
    },
    {
      skill_id: "SKILL_023",
      name: "\u8ECD\u7528\u6B62\u8840\u30D1\u30C3\u30AF",
      rarity: "SR",
      kind: "NORMAL",
      exclusive_character_id: null,
      activation_type: "ACTIVE",
      cooldown: 4,
      available_from_round: 2,
      target: "ALLY_ALL",
      effects: [
        "HEAL 18% target MaxHP",
        "REMOVE_STATUS 1"
      ]
    },
    {
      skill_id: "SKILL_024",
      name: "\u6A5F\u52D5\u9632\u72AF\u76FE\u9663\u5F62",
      rarity: "SR",
      kind: "NORMAL",
      exclusive_character_id: null,
      activation_type: "ACTIVE",
      cooldown: 4,
      available_from_round: 2,
      target: "ALLY_ALL",
      effects: [
        "SHIELD 20% MaxHP / 2T",
        "DEF +15% / 2T"
      ]
    },
    {
      skill_id: "SKILL_025",
      name: "\u50AC\u6D99\u30AC\u30B9\u5674\u5C04",
      rarity: "SR",
      kind: "NORMAL",
      exclusive_character_id: null,
      activation_type: "ACTIVE",
      cooldown: 4,
      available_from_round: 3,
      target: "ENEMY_ALL",
      effects: [
        "ATK -20% / 2T",
        "BLIND 75% / 2T"
      ]
    },
    {
      skill_id: "SKILL_026",
      name: "\u6C7A\u8D77\u306E\u30B7\u30E5\u30D7\u30EC\u30D2\u30B3\u30FC\u30EB",
      rarity: "SR",
      kind: "NORMAL",
      exclusive_character_id: null,
      activation_type: "ACTIVE",
      cooldown: 4,
      available_from_round: 2,
      target: "ALLY_ALL",
      effects: [
        "ATK +20% / 2T",
        "DEF +20% / 2T"
      ]
    },
    {
      skill_id: "SKILL_027",
      name: "\u8840\u306E\u5F37\u8972",
      rarity: "SR",
      kind: "NORMAL",
      exclusive_character_id: null,
      activation_type: "ACTIVE",
      cooldown: 4,
      available_from_round: 2,
      target: "ENEMY_SINGLE",
      effects: [
        "DAMAGE 165% ATK",
        "BLEED 90% / 3T"
      ]
    },
    {
      skill_id: "SKILL_028",
      name: "\u30B7\u30FC\u30EB\u30C9\u30AF\u30E9\u30C3\u30B7\u30E3\u30FC",
      rarity: "SR",
      kind: "NORMAL",
      exclusive_character_id: null,
      activation_type: "ACTIVE",
      cooldown: 4,
      available_from_round: 2,
      target: "ENEMY_SINGLE",
      effects: [
        "DAMAGE 175% ATK",
        "IGNORE_DEF 25%"
      ]
    },
    {
      skill_id: "SKILL_029",
      name: "\u7D99\u7D9A\u51E6\u7F6E\u85AC",
      rarity: "SR",
      kind: "NORMAL",
      exclusive_character_id: null,
      activation_type: "ACTIVE",
      cooldown: 5,
      available_from_round: 3,
      target: "ALLY_ALL",
      effects: [
        "HEAL 10% MaxHP immediate",
        "REGEN 6% MaxHP/Turn \xD73"
      ]
    },
    {
      skill_id: "SKILL_030",
      name: "\u6697\u53F7\u30B8\u30E3\u30DF\u30F3\u30B0",
      rarity: "SR",
      kind: "NORMAL",
      exclusive_character_id: null,
      activation_type: "ACTIVE",
      cooldown: 5,
      available_from_round: 3,
      target: "ENEMY_ALL",
      effects: [
        "SILENCE 60% / 1T (next action)",
        "SPD -15% / 2T"
      ]
    },
    {
      skill_id: "SKILL_031",
      name: "\u30AB\u30A6\u30F3\u30BF\u30FC\u30B9\u30D1\u30A4\u30AF",
      rarity: "SR",
      kind: "NORMAL",
      exclusive_character_id: null,
      activation_type: "ACTIVE",
      cooldown: 4,
      available_from_round: 2,
      target: "SELF",
      effects: [
        "SHIELD 22% MaxHP / 2T",
        "COUNTER 80% ATK / 2T"
      ]
    },
    {
      skill_id: "SKILL_032",
      name: "\u6697\u5668\u30FB\u6BD2\u5857\u308A\u306E\u5203",
      rarity: "SR",
      kind: "NORMAL",
      exclusive_character_id: null,
      activation_type: "ACTIVE",
      cooldown: 4,
      available_from_round: 2,
      target: "ENEMY_SINGLE",
      effects: [
        "DAMAGE 150% ATK",
        "POISON 90% / 3T"
      ]
    },
    {
      skill_id: "SKILL_033",
      name: "\u7CBE\u795E\u7D71\u4E00\u30FB\u660E\u93E1\u6B62\u6C34",
      rarity: "SR",
      kind: "NORMAL",
      exclusive_character_id: null,
      activation_type: "ACTIVE",
      cooldown: 4,
      available_from_round: 1,
      target: "SELF",
      effects: [
        "REMOVE_STATUS all",
        "SPD +25% / 2T"
      ]
    },
    {
      skill_id: "SKILL_034",
      name: "\u30D5\u30E9\u30C3\u30B7\u30E5\u30D0\u30F3\u5F37\u8972",
      rarity: "SR",
      kind: "NORMAL",
      exclusive_character_id: null,
      activation_type: "ACTIVE",
      cooldown: 4,
      available_from_round: 3,
      target: "ENEMY_ALL",
      effects: [
        "DAMAGE 95% ATK",
        "BLIND 80% / 2T"
      ]
    },
    {
      skill_id: "SKILL_035",
      name: "\u30A2\u30C9\u30EC\u30CA\u30EA\u30F3\u30D5\u30EB\u958B\u82B1",
      rarity: "SR",
      kind: "NORMAL",
      exclusive_character_id: null,
      activation_type: "ACTIVE",
      cooldown: 5,
      available_from_round: 2,
      target: "SELF",
      effects: [
        "ATK +35% / 3T",
        "DEF -15% / 3T"
      ]
    },
    {
      skill_id: "SKILL_036",
      name: "\u4E00\u9A0E\u5F53\u5343\u30FB\u7121\u6148\u60B2\u306E\u4E00\u6483",
      rarity: "SSR",
      kind: "NORMAL",
      exclusive_character_id: null,
      activation_type: "ACTIVE",
      cooldown: 5,
      available_from_round: 3,
      target: "ENEMY_SINGLE",
      effects: [
        "DAMAGE 290% ATK"
      ]
    },
    {
      skill_id: "SKILL_037",
      name: "\u5E83\u57DF\u30A2\u30B5\u30EB\u30C8\u30D5\u30EB\u30D0\u30FC\u30B9\u30C8",
      rarity: "SSR",
      kind: "NORMAL",
      exclusive_character_id: null,
      activation_type: "ACTIVE",
      cooldown: 5,
      available_from_round: 3,
      target: "ENEMY_ALL",
      effects: [
        "DAMAGE 155% ATK"
      ]
    },
    {
      skill_id: "SKILL_038",
      name: "\u7D76\u5BFE\u9632\u5FA1\u30FB\u9244\u58C1\u306E\u8981\u585E",
      rarity: "SSR",
      kind: "NORMAL",
      exclusive_character_id: null,
      activation_type: "ACTIVE",
      cooldown: 5,
      available_from_round: 3,
      target: "ALLY_ALL",
      effects: [
        "SHIELD 30% MaxHP / 2T",
        "DEF +25% / 2T"
      ]
    },
    {
      skill_id: "SKILL_039",
      name: "\u5947\u8DE1\u306E\u91CE\u6226\u6551\u6025\u57F7\u5200",
      rarity: "SSR",
      kind: "NORMAL",
      exclusive_character_id: null,
      activation_type: "ACTIVE",
      cooldown: 5,
      available_from_round: 3,
      target: "ALLY_ALL",
      effects: [
        "HEAL 26% MaxHP",
        "REMOVE_STATUS all"
      ]
    },
    {
      skill_id: "SKILL_040",
      name: "\u6F06\u9ED2\u306E\u5E83\u57DF\u5F37\u9178\u5927\u6563\u5E03",
      rarity: "SSR",
      kind: "NORMAL",
      exclusive_character_id: null,
      activation_type: "ACTIVE",
      cooldown: 5,
      available_from_round: 4,
      target: "ENEMY_ALL",
      effects: [
        "ATK -28% / 3T / chance 90%",
        "DEF -28% / 3T / chance 90%"
      ]
    },
    {
      skill_id: "SKILL_041",
      name: "\u738B\u8005\u306E\u6C7A\u8D77\u30FB\u5929\u4E0B\u5E03\u6B66",
      rarity: "SSR",
      kind: "NORMAL",
      exclusive_character_id: null,
      activation_type: "ACTIVE",
      cooldown: 5,
      available_from_round: 3,
      target: "ALLY_ALL",
      effects: [
        "ATK +25% / 3T",
        "DEF +25% / 3T",
        "SPD +20% / 3T"
      ]
    },
    {
      skill_id: "SKILL_042",
      name: "\u8840\u5BB4\u306E\u7D76\u5F71\u30FB\u9023\u6483",
      rarity: "SSR",
      kind: "NORMAL",
      exclusive_character_id: null,
      activation_type: "ACTIVE",
      cooldown: 5,
      available_from_round: 3,
      target: "ENEMY_SINGLE",
      effects: [
        "DAMAGE 220% ATK",
        "LIFESTEAL 40%",
        "BLEED 95% / 3T"
      ]
    },
    {
      skill_id: "SKILL_043",
      name: "\u58CA\u6EC5\u306E\u30B0\u30E9\u30F3\u30C9\u30B9\u30E9\u30E0",
      rarity: "SSR",
      kind: "NORMAL",
      exclusive_character_id: null,
      activation_type: "ACTIVE",
      cooldown: 5,
      available_from_round: 4,
      target: "ENEMY_ALL",
      effects: [
        "DAMAGE 135% ATK",
        "STUN 55% / 1T (next action)"
      ]
    },
    {
      skill_id: "SKILL_044",
      name: "\u72C2\u72AC\u306E\u8840\u306E\u5FA9\u8B90",
      rarity: "SSR",
      kind: "NORMAL",
      exclusive_character_id: null,
      activation_type: "ACTIVE",
      cooldown: 5,
      available_from_round: 3,
      target: "ENEMY_SINGLE",
      effects: [
        "DAMAGE continuous scaling by missing HP: HP100%=230%, HP50%\u2248275%, HP<=25%=320%"
      ]
    },
    {
      skill_id: "SKILL_045",
      name: "\u6226\u8853\u6307\u63EE\u30FB\u7DCF\u653B\u6483",
      rarity: "SSR",
      kind: "NORMAL",
      exclusive_character_id: null,
      activation_type: "ACTIVE",
      cooldown: 4,
      available_from_round: 3,
      target: "ALLY_ALL",
      effects: [
        "ATK +32% / 3T",
        "SPD +25% / 3T"
      ]
    },
    {
      skill_id: "SKILL_046",
      name: "\u6BD2\u8718\u86DB\u306E\u6ABB",
      rarity: "SSR",
      kind: "NORMAL",
      exclusive_character_id: null,
      activation_type: "ACTIVE",
      cooldown: 5,
      available_from_round: 4,
      target: "ENEMY_ALL",
      effects: [
        "DAMAGE 120% ATK",
        "POISON 95% / 3T",
        "SPD -20% / 3T"
      ]
    },
    {
      skill_id: "SKILL_047",
      name: "\u53CD\u6483\u306E\u88C5\u7532\u8981\u585E",
      rarity: "SSR",
      kind: "NORMAL",
      exclusive_character_id: null,
      activation_type: "ACTIVE",
      cooldown: 5,
      available_from_round: 4,
      target: "ALLY_ALL",
      effects: [
        "SHIELD 25% MaxHP / 2T",
        "DEF +20% / 2T",
        "COUNTER 100% ATK / 2T"
      ]
    },
    {
      skill_id: "SKILL_048",
      name: "\u4E0D\u5C48\u306E\u751F\u547D\u529B",
      rarity: "SSR",
      kind: "NORMAL",
      exclusive_character_id: null,
      activation_type: "ACTIVE",
      cooldown: 5,
      available_from_round: 3,
      target: "ALLY_ALL",
      effects: [
        "HEAL 15% MaxHP immediate",
        "REGEN 8% MaxHP/Turn \xD73"
      ]
    },
    {
      skill_id: "SKILL_049",
      name: "\u7121\u529B\u5316\u306E\u5E83\u57DF\u9583\u5149\u7206\u5F3E",
      rarity: "SSR",
      kind: "NORMAL",
      exclusive_character_id: null,
      activation_type: "ACTIVE",
      cooldown: 5,
      available_from_round: 4,
      target: "ENEMY_ALL",
      effects: [
        "BLIND 90% / 2T",
        "SILENCE 70% / 1T (next action)",
        "SPD -20% / 3T"
      ]
    },
    {
      skill_id: "SKILL_050",
      name: "\u6C7A\u6226\u306E\u4E00\u9583\u30FB\u65AD\u7F6A",
      rarity: "SSR",
      kind: "NORMAL",
      exclusive_character_id: null,
      activation_type: "ACTIVE",
      cooldown: 5,
      available_from_round: 3,
      target: "ENEMY_SINGLE",
      effects: [
        "DAMAGE 260% ATK",
        "IGNORE_DEF 45%"
      ]
    },
    {
      skill_id: "SKILL_051",
      name: "\u525B\u62F3\u30FB\u4E00\u6483\u5FC5\u5012",
      rarity: "SSR",
      kind: "EXCLUSIVE",
      exclusive_character_id: "char_go_01",
      activation_type: "ACTIVE",
      cooldown: 5,
      available_from_round: 3,
      target: "ENEMY_SINGLE",
      effects: [
        "DAMAGE 320% ATK",
        "IGNORE_DEF 55%"
      ]
    },
    {
      skill_id: "SKILL_052",
      name: "\u4FEE\u7F85\u306E\u731B\u653B",
      rarity: "SSR",
      kind: "EXCLUSIVE",
      exclusive_character_id: "char_kengo_01",
      activation_type: "ACTIVE",
      cooldown: 5,
      available_from_round: 3,
      target: "ENEMY_SINGLE",
      effects: [
        "DAMAGE 280% ATK",
        "LIFESTEAL 45%"
      ]
    },
    {
      skill_id: "SKILL_053",
      name: "\u55A7\u5629\u4E0A\u7B49",
      rarity: "SSR",
      kind: "EXCLUSIVE",
      exclusive_character_id: "char_koharu_01",
      activation_type: "ACTIVE",
      cooldown: 5,
      available_from_round: 2,
      target: "SELF",
      effects: [
        "SHIELD 35% MaxHP / 2T",
        "TAUNT 100% / 2T",
        "DEF +30% / 2T"
      ]
    },
    {
      skill_id: "SKILL_054",
      name: "\u8987\u738B\u306E\u5A01\u5727",
      rarity: "SSR",
      kind: "EXCLUSIVE",
      exclusive_character_id: "char_reiji_01",
      activation_type: "ON_DAMAGE_TAKEN",
      cooldown: null,
      available_from_round: 1,
      target: "ATTACKER_WHO_DAMAGED_SELF",
      effects: [
        "TRIGGER ON_DAMAGE_TAKEN",
        "COUNTER 150% ATK",
        "MAX 1 activation / round"
      ]
    },
    {
      skill_id: "SKILL_055",
      name: "\u30CD\u30AA\u30F3\u30FB\u30A2\u30AF\u30BB\u30EB",
      rarity: "SSR",
      kind: "EXCLUSIVE",
      exclusive_character_id: "char_ageha_01",
      activation_type: "BATTLE_START",
      cooldown: null,
      available_from_round: 1,
      target: "SELF",
      effects: [
        "TRIGGER ON_BATTLE_START / once per battle",
        "SPD +25% / 3T",
        "ATK +20% / 3T"
      ]
    },
    {
      skill_id: "SKILL_056",
      name: "\u30B9\u30C8\u30EA\u30FC\u30C8\u30FB\u30D5\u30ED\u30A6",
      rarity: "SSR",
      kind: "EXCLUSIVE",
      exclusive_character_id: "char_leo_01",
      activation_type: "ACTIVE",
      cooldown: 5,
      available_from_round: 3,
      target: "ENEMY_SINGLE",
      effects: [
        "DAMAGE 285% ATK",
        "SELF SPD +25% / 3T"
      ]
    },
    {
      skill_id: "SKILL_057",
      name: "\u904B\u547D\u306E\u60AA\u622F",
      rarity: "SSR",
      kind: "EXCLUSIVE",
      exclusive_character_id: "char_karen_01",
      activation_type: "ACTIVE",
      cooldown: 5,
      available_from_round: 3,
      target: "ENEMY_SINGLE",
      effects: [
        "DAMAGE 260% ATK",
        "BLIND 95% / 2T"
      ]
    },
    {
      skill_id: "SKILL_058",
      name: "\u5BB5\u95C7\u306E\u5E7B\u60D1",
      rarity: "SSR",
      kind: "EXCLUSIVE",
      exclusive_character_id: "char_miyabi_01",
      activation_type: "ACTIVE",
      cooldown: 5,
      available_from_round: 4,
      target: "ENEMY_ALL",
      effects: [
        "BLIND 95% / 2T",
        "SILENCE 75% / 1T",
        "SPD -25% / 2T"
      ]
    },
    {
      skill_id: "SKILL_059",
      name: "\u591C\u306E\u5973\u738B",
      rarity: "SSR",
      kind: "EXCLUSIVE",
      exclusive_character_id: "char_kaede_01",
      activation_type: "BATTLE_START",
      cooldown: null,
      available_from_round: 1,
      target: "ALLY_ALL",
      effects: [
        "TRIGGER ON_BATTLE_START / once per battle",
        "ATK +18% / 3T",
        "DEF +18% / 3T"
      ]
    },
    {
      skill_id: "SKILL_060",
      name: "\u6B4C\u821E\u4F0E\u753A\u306E\u5207\u308A\u672D",
      rarity: "SSR",
      kind: "EXCLUSIVE",
      exclusive_character_id: "char_mio_01",
      activation_type: "ACTIVE",
      cooldown: 5,
      available_from_round: 3,
      target: "ALLY_ALL",
      effects: [
        "HEAL 20% MaxHP immediate",
        "REGEN 7% MaxHP/Turn / 3T"
      ]
    },
    {
      skill_id: "SKILL_061",
      name: "\u9244\u62F3\u5236\u5727",
      rarity: "SR",
      kind: "EXCLUSIVE",
      exclusive_character_id: "char_tetsu_01",
      activation_type: "ACTIVE",
      cooldown: 4,
      available_from_round: 2,
      target: "ENEMY_SINGLE",
      effects: [
        "DAMAGE 210% ATK",
        "DEF -22% / 2T"
      ]
    },
    {
      skill_id: "SKILL_062",
      name: "\u30E9\u30B9\u30C8\u30FB\u30D6\u30ED\u30FC",
      rarity: "SR",
      kind: "EXCLUSIVE",
      exclusive_character_id: "char_lucas_01",
      activation_type: "ACTIVE",
      cooldown: 4,
      available_from_round: 2,
      target: "ENEMY_SINGLE",
      effects: [
        "DAMAGE scaling: HP100%=190% ATK; HP50%=215% ATK; HP25%=240% ATK; linear interpolation; HP<=25%=240% ATK"
      ]
    },
    {
      skill_id: "SKILL_063",
      name: "\u8001\u736A\u306A\u69CB\u3048",
      rarity: "SR",
      kind: "EXCLUSIVE",
      exclusive_character_id: "char_genji_01",
      activation_type: "ACTIVE",
      cooldown: 4,
      available_from_round: 2,
      target: "SELF",
      effects: [
        "SHIELD 25% MaxHP",
        "DEF +22% / 2T"
      ]
    },
    {
      skill_id: "SKILL_064",
      name: "\u6D41\u6C34\u53CD\u6483",
      rarity: "SR",
      kind: "EXCLUSIVE",
      exclusive_character_id: "char_long_01",
      activation_type: "ACTIVE",
      cooldown: 4,
      available_from_round: 2,
      target: "SELF",
      effects: [
        "SHIELD 20% MaxHP",
        "COUNTER 100% ATK / 2T"
      ]
    },
    {
      skill_id: "SKILL_065",
      name: "\u30B9\u30C8\u30EA\u30FC\u30C8\u30FB\u30E9\u30A4\u30C9",
      rarity: "SR",
      kind: "EXCLUSIVE",
      exclusive_character_id: "char_sora_01",
      activation_type: "BATTLE_START",
      cooldown: null,
      available_from_round: 1,
      target: "SELF",
      effects: [
        "TRIGGER ON_BATTLE_START / once per battle",
        "SPD +22% / 3T"
      ]
    },
    {
      skill_id: "SKILL_066",
      name: "\u30CF\u30A4\u30B9\u30D4\u30FC\u30C9\u30FB\u30E9\u30C3\u30B7\u30E5",
      rarity: "SR",
      kind: "EXCLUSIVE",
      exclusive_character_id: "char_reina_01",
      activation_type: "ACTIVE",
      cooldown: 4,
      available_from_round: 2,
      target: "ENEMY_SINGLE",
      effects: [
        "DAMAGE 215% ATK",
        "SELF SPD +20% / 2T"
      ]
    },
    {
      skill_id: "SKILL_067",
      name: "\u30B7\u30B9\u30C6\u30E0\u30FB\u30B8\u30E3\u30C3\u30AF",
      rarity: "SR",
      kind: "EXCLUSIVE",
      exclusive_character_id: "char_alice_01",
      activation_type: "ACTIVE",
      cooldown: 4,
      available_from_round: 3,
      target: "ENEMY_SINGLE",
      effects: [
        "SILENCE 60% / 1T",
        "SPD -20% / 2T"
      ]
    },
    {
      skill_id: "SKILL_068",
      name: "\u30AA\u30FC\u30EB\u30FB\u30A4\u30F3",
      rarity: "SR",
      kind: "EXCLUSIVE",
      exclusive_character_id: "char_maya_01",
      activation_type: "ACTIVE",
      cooldown: 4,
      available_from_round: 2,
      target: "ENEMY_SINGLE",
      effects: [
        "DAMAGE 200% ATK",
        "30% chance: DAMAGE 300% ATK"
      ]
    },
    {
      skill_id: "SKILL_069",
      name: "\u7D05\u84EE\u306E\u4E00\u6483",
      rarity: "SR",
      kind: "EXCLUSIVE",
      exclusive_character_id: "char_sakura_01",
      activation_type: "ACTIVE",
      cooldown: 4,
      available_from_round: 2,
      target: "ENEMY_SINGLE",
      effects: [
        "DAMAGE 205% ATK",
        "BLEED 95% / 3T"
      ]
    },
    {
      skill_id: "SKILL_070",
      name: "\u30DF\u30C3\u30C9\u30CA\u30A4\u30C8\u30FB\u30B3\u30FC\u30EB",
      rarity: "SR",
      kind: "EXCLUSIVE",
      exclusive_character_id: "char_cecile_01",
      activation_type: "ACTIVE",
      cooldown: 4,
      available_from_round: 3,
      target: "ENEMY_SINGLE",
      effects: [
        "ATK -22% / 2T",
        "BLIND 80% / 2T"
      ]
    }
  ]
};

// src/domain/gameplay/canonical/data/equipment_20260821.json
var equipment_20260821_default = {
  version: "2026-08-21",
  status: "PRODUCTION_FROZEN",
  equipments: [
    {
      equipment_id: "WEAPON_001",
      display_name: "\u30B9\u30C8\u30EA\u30FC\u30C8\u30CA\u30A4\u30D5",
      rarity: "N",
      category: "WEAPON",
      base_stats: {
        hp: 0,
        atk: 900,
        def: 0,
        spd: 0,
        luk: 0
      },
      fixed_effects: [
        "\u2014",
        "\u2014"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "WEAPON_002",
      display_name: "9mm\u30CF\u30F3\u30C9\u30AC\u30F3",
      rarity: "N",
      category: "WEAPON",
      base_stats: {
        hp: 0,
        atk: 1e3,
        def: 0,
        spd: 0,
        luk: 0
      },
      fixed_effects: [
        "\u2014",
        "\u2014"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "WEAPON_003",
      display_name: "\u91D1\u5C5E\u30D0\u30C3\u30C8",
      rarity: "N",
      category: "WEAPON",
      base_stats: {
        hp: 0,
        atk: 1100,
        def: 0,
        spd: 0,
        luk: 0
      },
      fixed_effects: [
        "\u2014",
        "\u2014"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "WEAPON_004",
      display_name: "\u30B5\u30D0\u30A4\u30D0\u30EB\u30DE\u30C1\u30A7\u30C6",
      rarity: "N",
      category: "WEAPON",
      base_stats: {
        hp: 0,
        atk: 1200,
        def: 0,
        spd: -15,
        luk: 0
      },
      fixed_effects: [
        "SPD-15",
        "\u2014"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "WEAPON_005",
      display_name: "\u7279\u6B8A\u8B66\u68D2",
      rarity: "N",
      category: "WEAPON",
      base_stats: {
        hp: 0,
        atk: 950,
        def: 200,
        spd: 0,
        luk: 0
      },
      fixed_effects: [
        "DEF+200",
        "\u2014"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "WEAPON_006",
      display_name: "\u6298\u308A\u305F\u305F\u307F\u30AB\u30DF\u30BD\u30EA",
      rarity: "N",
      category: "WEAPON",
      base_stats: {
        hp: 0,
        atk: 850,
        def: 0,
        spd: 0,
        luk: 3
      },
      fixed_effects: [
        "LUK+3",
        "\u2014"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "WEAPON_007",
      display_name: "\u9244\u30D1\u30A4\u30D7",
      rarity: "N",
      category: "WEAPON",
      base_stats: {
        hp: 0,
        atk: 1150,
        def: 0,
        spd: 0,
        luk: 0
      },
      fixed_effects: [
        "\u2014",
        "\u2014"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "WEAPON_008",
      display_name: "\u30E1\u30EA\u30B1\u30F3\u30B5\u30C3\u30AF",
      rarity: "N",
      category: "WEAPON",
      base_stats: {
        hp: 0,
        atk: 900,
        def: 0,
        spd: 30,
        luk: 0
      },
      fixed_effects: [
        "SPD+30",
        "\u2014"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "WEAPON_009",
      display_name: "\u9306\u3073\u305F\u30D0\u30FC\u30EB",
      rarity: "R",
      category: "WEAPON",
      base_stats: {
        hp: 0,
        atk: 1500,
        def: 0,
        spd: -20,
        luk: 0
      },
      fixed_effects: [
        "SPD-20",
        "\u2014"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "WEAPON_010",
      display_name: "\u30D0\u30B9\u30BF\u30FC\u30DE\u30B0\u30CA\u30E0",
      rarity: "R",
      category: "WEAPON",
      base_stats: {
        hp: 0,
        atk: 1900,
        def: 0,
        spd: -35,
        luk: 0
      },
      fixed_effects: [
        "SPD-35",
        "\u2014"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "WEAPON_011",
      display_name: "\u30C0\u30AC\u30FC",
      rarity: "R",
      category: "WEAPON",
      base_stats: {
        hp: 0,
        atk: 1450,
        def: 0,
        spd: 0,
        luk: 4
      },
      fixed_effects: [
        "LUK+4",
        "\u2014"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "WEAPON_012",
      display_name: "\u30AB\u30B9\u30BF\u30E0\u30D4\u30B9\u30C8\u30EB",
      rarity: "R",
      category: "WEAPON",
      base_stats: {
        hp: 0,
        atk: 1550,
        def: 0,
        spd: 45,
        luk: 0
      },
      fixed_effects: [
        "SPD+45",
        "\u2014"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "WEAPON_013",
      display_name: "\u30BD\u30A6\u30C9\u30AA\u30D5\u30FB\u30B7\u30E7\u30C3\u30C8\u30AC\u30F3",
      rarity: "R",
      category: "WEAPON",
      base_stats: {
        hp: 0,
        atk: 1850,
        def: 0,
        spd: -30,
        luk: 0
      },
      fixed_effects: [
        "SPD-30",
        "\u2014"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "WEAPON_014",
      display_name: "\u30B3\u30F3\u30D0\u30C3\u30C8\u30CA\u30A4\u30D5",
      rarity: "R",
      category: "WEAPON",
      base_stats: {
        hp: 0,
        atk: 1400,
        def: 0,
        spd: 0,
        luk: 5
      },
      fixed_effects: [
        "LUK+5",
        "\u2014"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "WEAPON_015",
      display_name: "\u96FB\u6483\u8B66\u68D2",
      rarity: "R",
      category: "WEAPON",
      base_stats: {
        hp: 0,
        atk: 1350,
        def: 0,
        spd: 55,
        luk: 0
      },
      fixed_effects: [
        "SPD+55",
        "\u2014"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "WEAPON_016",
      display_name: "\u6D88\u97F3\u30B5\u30D6\u30DE\u30B7\u30F3\u30AC\u30F3",
      rarity: "R",
      category: "WEAPON",
      base_stats: {
        hp: 0,
        atk: 1650,
        def: 0,
        spd: 30,
        luk: 0
      },
      fixed_effects: [
        "SPD+30",
        "\u2014"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "WEAPON_017",
      display_name: "\u30D8\u30F4\u30A3\u30B9\u30EC\u30C3\u30B8\u30CF\u30DE\u30FC",
      rarity: "R",
      category: "WEAPON",
      base_stats: {
        hp: 0,
        atk: 2e3,
        def: 0,
        spd: -60,
        luk: 0
      },
      fixed_effects: [
        "SPD-60",
        "\u2014"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "WEAPON_018",
      display_name: "\u30AB\u30B9\u30BF\u30E0\u30D0\u30BF\u30D5\u30E9\u30A4",
      rarity: "R",
      category: "WEAPON",
      base_stats: {
        hp: 0,
        atk: 1400,
        def: 0,
        spd: 0,
        luk: 6
      },
      fixed_effects: [
        "LUK+6",
        "\u2014"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "WEAPON_019",
      display_name: "\u30EF\u30A4\u30E4\u30FC\u30BD\u30FC",
      rarity: "R",
      category: "WEAPON",
      base_stats: {
        hp: 0,
        atk: 1500,
        def: 0,
        spd: 40,
        luk: 0
      },
      fixed_effects: [
        "SPD+40",
        "\u2014"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "WEAPON_020",
      display_name: "\u7AF6\u6280\u7528\u30B3\u30F3\u30DD\u30B8\u30C3\u30C8\u30DC\u30A6",
      rarity: "R",
      category: "WEAPON",
      base_stats: {
        hp: 0,
        atk: 1600,
        def: 0,
        spd: 0,
        luk: 3
      },
      fixed_effects: [
        "LUK+3",
        "\u2014"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "WEAPON_021",
      display_name: "\u30C1\u30BF\u30F3\u30CA\u30C3\u30AF\u30EB\u30AF\u30ED\u30FC",
      rarity: "R",
      category: "WEAPON",
      base_stats: {
        hp: 0,
        atk: 1450,
        def: 0,
        spd: 60,
        luk: 0
      },
      fixed_effects: [
        "SPD+60",
        "\u2014"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "WEAPON_022",
      display_name: "\u30AA\u30FC\u30C8\u30DE\u30C1\u30C3\u30AF\u30DE\u30B0\u30CA\u30E0",
      rarity: "R",
      category: "WEAPON",
      base_stats: {
        hp: 0,
        atk: 1850,
        def: 0,
        spd: -35,
        luk: 0
      },
      fixed_effects: [
        "SPD-35",
        "\u2014"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "WEAPON_023",
      display_name: "\u30B9\u30BF\u30F3\u30A2\u30B5\u30B7\u30F3\u30C0\u30AC\u30FC",
      rarity: "SR",
      category: "WEAPON",
      base_stats: {
        hp: 0,
        atk: 2400,
        def: 0,
        spd: 0,
        luk: 7
      },
      fixed_effects: [
        "LUK+7",
        "Normal STUN+8%"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "WEAPON_024",
      display_name: "\u6D88\u97F3\u30B5\u30D7\u30EC\u30C3\u30B5\u30FCSMG",
      rarity: "SR",
      category: "WEAPON",
      base_stats: {
        hp: 0,
        atk: 2500,
        def: 0,
        spd: 90,
        luk: 0
      },
      fixed_effects: [
        "SPD+90",
        "SPD+8%"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "WEAPON_025",
      display_name: "\u30A4\u30F3\u30C0\u30B9\u30C8\u30EA\u30A2\u30EB\u30FB\u30C7\u30E2\u30EA\u30C3\u30B7\u30E3\u30FC",
      rarity: "SR",
      category: "WEAPON",
      base_stats: {
        hp: 0,
        atk: 3100,
        def: 0,
        spd: -50,
        luk: 0
      },
      fixed_effects: [
        "SPD-50",
        "Ignore DEF12%"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "WEAPON_026",
      display_name: "\u4ED5\u8FBC\u307F\u65E5\u672C\u5200\u300E\u9ED2\u66DC\u300F",
      rarity: "SR",
      category: "WEAPON",
      base_stats: {
        hp: 0,
        atk: 2700,
        def: 0,
        spd: 0,
        luk: 8
      },
      fixed_effects: [
        "LUK+8",
        "Crit Rate10%"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "WEAPON_027",
      display_name: "\u30A2\u30B5\u30EB\u30C8\u30E9\u30A4\u30D5\u30EB",
      rarity: "SR",
      category: "WEAPON",
      base_stats: {
        hp: 0,
        atk: 2850,
        def: 0,
        spd: 0,
        luk: 0
      },
      fixed_effects: [
        "\u2014",
        "ATK+8%"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "WEAPON_028",
      display_name: "\u9AD8\u5468\u6CE2\u30D6\u30EC\u30FC\u30C9",
      rarity: "SR",
      category: "WEAPON",
      base_stats: {
        hp: 0,
        atk: 2600,
        def: 0,
        spd: 0,
        luk: 9
      },
      fixed_effects: [
        "LUK+9",
        "Lifesteal8%"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "WEAPON_029",
      display_name: "\u5316\u5B66\u6CE8\u5165\u5F0F\u30C0\u30AC\u30FC",
      rarity: "SR",
      category: "WEAPON",
      base_stats: {
        hp: 0,
        atk: 2350,
        def: 0,
        spd: 0,
        luk: 11
      },
      fixed_effects: [
        "LUK+11",
        "Poison chance15%"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "WEAPON_030",
      display_name: "\u6563\u5F3E\u9283\u300E\u30EC\u30A4\u30B6\u30FC\u300F",
      rarity: "SR",
      category: "WEAPON",
      base_stats: {
        hp: 0,
        atk: 2800,
        def: 0,
        spd: -30,
        luk: 0
      },
      fixed_effects: [
        "SPD-30",
        "DEF DOWN success+10pt"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "WEAPON_031",
      display_name: "\u30D8\u30F4\u30A3\u30EA\u30DC\u30EB\u30D0\u30FC\u300E\u30B3\u30D5\u30A3\u30F3\u300F",
      rarity: "SR",
      category: "WEAPON",
      base_stats: {
        hp: 0,
        atk: 2950,
        def: 0,
        spd: 0,
        luk: 6
      },
      fixed_effects: [
        "LUK+6",
        "HP<30% ATK+15%"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "WEAPON_032",
      display_name: "\u30C7\u30E5\u30A2\u30EB\u30AB\u30B9\u30BF\u30E0\u30D4\u30B9\u30C8\u30EB",
      rarity: "SR",
      category: "WEAPON",
      base_stats: {
        hp: 0,
        atk: 2500,
        def: 0,
        spd: 101,
        luk: 0
      },
      fixed_effects: [
        "SPD+100",
        "SPD+10%"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "WEAPON_033",
      display_name: "\u30B9\u30BF\u30F3\u8B66\u68D2\u30AB\u30B9\u30BF\u30E0",
      rarity: "SR",
      category: "WEAPON",
      base_stats: {
        hp: 0,
        atk: 2300,
        def: 801,
        spd: 0,
        luk: 0
      },
      fixed_effects: [
        "DEF+800",
        "DEF+12%"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "WEAPON_034",
      display_name: "\u30A2\u30B5\u30B7\u30F3\u30DE\u30C1\u30A7\u30C6",
      rarity: "SR",
      category: "WEAPON",
      base_stats: {
        hp: 0,
        atk: 2650,
        def: 0,
        spd: 0,
        luk: 9
      },
      fixed_effects: [
        "LUK+9",
        "Crit Damage18%"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "WEAPON_035",
      display_name: "\u30B3\u30F3\u30D1\u30AF\u30C8\u30B5\u30D6\u30D4\u30B9\u30C8\u30EB",
      rarity: "SR",
      category: "WEAPON",
      base_stats: {
        hp: 0,
        atk: 2450,
        def: 0,
        spd: 95,
        luk: 0
      },
      fixed_effects: [
        "SPD+95",
        "Battle Start SPD12%/2T"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "WEAPON_036",
      display_name: "\u30AB\u30BF\u30CA\u300E\u5F71\u6253\u3061\u300F",
      rarity: "SR",
      category: "WEAPON",
      base_stats: {
        hp: 0,
        atk: 2700,
        def: 0,
        spd: 0,
        luk: 7
      },
      fixed_effects: [
        "LUK+7",
        "Crit Rate8%"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "WEAPON_037",
      display_name: "\u6D88\u97F3\u30B9\u30CA\u30A4\u30D1\u30FC\u30E9\u30A4\u30D5\u30EB",
      rarity: "SR",
      category: "WEAPON",
      base_stats: {
        hp: 0,
        atk: 3050,
        def: 0,
        spd: -45,
        luk: 0
      },
      fixed_effects: [
        "SPD-45",
        "Crit Rate12%"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "WEAPON_038",
      display_name: "\u30B9\u30C1\u30FC\u30EB\u30CF\u30F3\u30C9\u30AF\u30ED\u30FC",
      rarity: "SR",
      category: "WEAPON",
      base_stats: {
        hp: 0,
        atk: 2400,
        def: 0,
        spd: 85,
        luk: 0
      },
      fixed_effects: [
        "SPD+85",
        "Normal REMOVE_BUFF12%"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "WEAPON_039",
      display_name: "\u30B5\u30A4\u30EC\u30F3\u30C8\u30B9\u30C1\u30FC\u30EB\u5F13",
      rarity: "SR",
      category: "WEAPON",
      base_stats: {
        hp: 0,
        atk: 2550,
        def: 0,
        spd: 0,
        luk: 10
      },
      fixed_effects: [
        "LUK+10",
        "Normal SILENCE12%"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "WEAPON_040",
      display_name: "\u5909\u5F62\u86C7\u8179\u5203",
      rarity: "SR",
      category: "WEAPON",
      base_stats: {
        hp: 0,
        atk: 2750,
        def: 0,
        spd: 45,
        luk: 0
      },
      fixed_effects: [
        "SPD+45",
        "Normal Damage10%"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "WEAPON_041",
      display_name: "\u30AB\u30FC\u30D3\u30F3\u30E9\u30A4\u30D5\u30EB",
      rarity: "SSR",
      category: "WEAPON",
      base_stats: {
        hp: 1,
        atk: 3600,
        def: 1100,
        spd: 0,
        luk: 0
      },
      fixed_effects: [
        "DEF+1100",
        "HP+10%"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "WEAPON_042",
      display_name: "\u30A2\u30A4\u30A2\u30F3\u30CA\u30C3\u30AF\u30EB\u300E\u963F\u4FEE\u7F85\u300F",
      rarity: "SSR",
      category: "WEAPON",
      base_stats: {
        hp: 0,
        atk: 3750,
        def: 0,
        spd: 110,
        luk: 0
      },
      fixed_effects: [
        "SPD+110",
        "Debuffed ATK+15%"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "WEAPON_043",
      display_name: "\u30C7\u30B9\u30FB\u30D0\u30A4\u30D1\u30FC",
      rarity: "SSR",
      category: "WEAPON",
      base_stats: {
        hp: 0,
        atk: 4150,
        def: 0,
        spd: 0,
        luk: 12
      },
      fixed_effects: [
        "LUK+12",
        "Crit Damage25%"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "WEAPON_044",
      display_name: "\u30B5\u30A4\u30D0\u30FC\u30FB\u30AB\u30BF\u30CA\u300E\u96FB\u5149\u77F3\u706B\u300F",
      rarity: "SSR",
      category: "WEAPON",
      base_stats: {
        hp: 0,
        atk: 3650,
        def: 0,
        spd: 161,
        luk: 0
      },
      fixed_effects: [
        "SPD+160",
        "SPD+12%"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "WEAPON_045",
      display_name: "\u30B7\u30E7\u30C3\u30C8\u30AC\u30F3\u300E\u7D42\u672B\u306E\u9418\u300F",
      rarity: "SSR",
      category: "WEAPON",
      base_stats: {
        hp: 0,
        atk: 4500,
        def: 0,
        spd: -65,
        luk: 0
      },
      fixed_effects: [
        "SPD-65",
        "Normal Damage18%"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "WEAPON_046",
      display_name: "\u30A4\u30F3\u30B4\u30C3\u30C8\u30FB\u30D5\u30A1\u30F3\u30B0",
      rarity: "SSR",
      category: "WEAPON",
      base_stats: {
        hp: 0,
        atk: 4e3,
        def: 0,
        spd: 0,
        luk: 14
      },
      fixed_effects: [
        "LUK+14",
        "Crit Rate15%"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "WEAPON_047",
      display_name: "\u30EC\u30F4\u30FB\u30A4\u30B0\u30CB\u30C3\u30B7\u30E7\u30F3",
      rarity: "SSR",
      category: "WEAPON",
      base_stats: {
        hp: 0,
        atk: 4500,
        def: 0,
        spd: 0,
        luk: 8
      },
      fixed_effects: [
        "LUK+8",
        "First Kill\u2192ATK18%/3T"
      ],
      exclusive_character_id: "char_go_01",
      random_options: false
    },
    {
      equipment_id: "WEAPON_048",
      display_name: "\u30B5\u30A4\u30D0\u30FC\u30C7\u30C3\u30AD\u30FB\u30D6\u30EC\u30FC\u30C9",
      rarity: "SSR",
      category: "WEAPON",
      base_stats: {
        hp: 0,
        atk: 3800,
        def: 0,
        spd: 170,
        luk: 0
      },
      fixed_effects: [
        "SPD+170",
        "First Skill\u2192SPD18%/3T"
      ],
      exclusive_character_id: "char_leo_01",
      random_options: false
    },
    {
      equipment_id: "WEAPON_049",
      display_name: "\u6BD2\u86C7\u306E\u9ED2\u5203",
      rarity: "SSR",
      category: "WEAPON",
      base_stats: {
        hp: 0,
        atk: 4200,
        def: 0,
        spd: 0,
        luk: 10
      },
      fixed_effects: [
        "LUK+10",
        "First Skill\u2192Lifesteal15%/3T"
      ],
      exclusive_character_id: "char_kengo_01",
      random_options: false
    },
    {
      equipment_id: "WEAPON_050",
      display_name: "\u652F\u914D\u8005\u306E\u9244\u6247",
      rarity: "SSR",
      category: "WEAPON",
      base_stats: {
        hp: 0,
        atk: 3600,
        def: 1600,
        spd: 0,
        luk: 0
      },
      fixed_effects: [
        "DEF+1600",
        "HP<40%\u2192DEF25%/3T"
      ],
      exclusive_character_id: "char_koharu_01",
      random_options: false
    },
    {
      equipment_id: "HEAD_001",
      display_name: "\u30B9\u30C8\u30EA\u30FC\u30C8\u30AD\u30E3\u30C3\u30D7",
      rarity: "N",
      category: "HEAD",
      base_stats: {
        hp: 3500,
        atk: 0,
        def: 0,
        spd: 0,
        luk: 0
      },
      fixed_effects: [
        "\u2014",
        "\u2014"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "HEAD_002",
      display_name: "\u30D1\u30F3\u30AF\u30D0\u30F3\u30C0\u30CA",
      rarity: "N",
      category: "HEAD",
      base_stats: {
        hp: 3200,
        atk: 0,
        def: 0,
        spd: 20,
        luk: 0
      },
      fixed_effects: [
        "SPD+20",
        "\u2014"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "HEAD_003",
      display_name: "\u30CB\u30C3\u30C8\u30AD\u30E3\u30C3\u30D7",
      rarity: "N",
      category: "HEAD",
      base_stats: {
        hp: 3700,
        atk: 0,
        def: 150,
        spd: 0,
        luk: 0
      },
      fixed_effects: [
        "DEF+150",
        "\u2014"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "HEAD_004",
      display_name: "\u30EF\u30FC\u30AF\u30AD\u30E3\u30C3\u30D7",
      rarity: "N",
      category: "HEAD",
      base_stats: {
        hp: 4e3,
        atk: 0,
        def: 0,
        spd: 0,
        luk: 0
      },
      fixed_effects: [
        "\u2014",
        "\u2014"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "HEAD_005",
      display_name: "\u30B5\u30F3\u30B0\u30E9\u30B9",
      rarity: "N",
      category: "HEAD",
      base_stats: {
        hp: 3300,
        atk: 0,
        def: 0,
        spd: 0,
        luk: 3
      },
      fixed_effects: [
        "LUK+3",
        "\u2014"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "HEAD_006",
      display_name: "\u30CF\u30C3\u30AB\u30FC\u30D8\u30C3\u30C9\u30BB\u30C3\u30C8",
      rarity: "R",
      category: "HEAD",
      base_stats: {
        hp: 5e3,
        atk: 0,
        def: 0,
        spd: 40,
        luk: 0
      },
      fixed_effects: [
        "SPD+40",
        "\u2014"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "HEAD_007",
      display_name: "\u30DE\u30D5\u30A3\u30A2\u30D5\u30A7\u30C9\u30E9",
      rarity: "R",
      category: "HEAD",
      base_stats: {
        hp: 5400,
        atk: 0,
        def: 0,
        spd: 0,
        luk: 4
      },
      fixed_effects: [
        "LUK+4",
        "\u2014"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "HEAD_008",
      display_name: "\u9632\u6BD2\u30DE\u30B9\u30AF",
      rarity: "R",
      category: "HEAD",
      base_stats: {
        hp: 6200,
        atk: 0,
        def: 0,
        spd: 0,
        luk: 0
      },
      fixed_effects: [
        "\u2014",
        "\u2014"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "HEAD_009",
      display_name: "\u30AB\u30FC\u30DC\u30F3\u30E9\u30A4\u30C0\u30FC\u30D8\u30EB\u30E1\u30C3\u30C8",
      rarity: "R",
      category: "HEAD",
      base_stats: {
        hp: 6500,
        atk: 0,
        def: 500,
        spd: 0,
        luk: 0
      },
      fixed_effects: [
        "DEF+500",
        "\u2014"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "HEAD_010",
      display_name: "\u30A2\u30F3\u30C6\u30A3\u30FC\u30AF\u30B4\u30FC\u30B0\u30EB",
      rarity: "R",
      category: "HEAD",
      base_stats: {
        hp: 5200,
        atk: 0,
        def: 0,
        spd: 0,
        luk: 5
      },
      fixed_effects: [
        "LUK+5",
        "\u2014"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "HEAD_011",
      display_name: "\u30D0\u30EA\u30B9\u30C6\u30A3\u30C3\u30AF\u30D8\u30EB\u30E1\u30C3\u30C8",
      rarity: "R",
      category: "HEAD",
      base_stats: {
        hp: 7e3,
        atk: 0,
        def: 650,
        spd: 0,
        luk: 0
      },
      fixed_effects: [
        "DEF+650",
        "\u2014"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "HEAD_012",
      display_name: "\u30DE\u30EB\u30C1\u30CA\u30A4\u30C8\u30D3\u30B8\u30E7\u30F3\u30B4\u30FC\u30B0\u30EB",
      rarity: "SR",
      category: "HEAD",
      base_stats: {
        hp: 8500,
        atk: 0,
        def: 0,
        spd: 0,
        luk: 7
      },
      fixed_effects: [
        "LUK+7",
        "Blind Resist15%"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "HEAD_013",
      display_name: "\u91CD\u5DE5\u696D\u30D7\u30ED\u30C6\u30AF\u30C8\u6EB6\u63A5\u30DE\u30B9\u30AF",
      rarity: "SR",
      category: "HEAD",
      base_stats: {
        hp: 9500,
        atk: 0,
        def: 700,
        spd: 0,
        luk: 0
      },
      fixed_effects: [
        "DEF+700",
        "Blind Resist25%"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "HEAD_014",
      display_name: "\u30D0\u30EA\u30B9\u30C6\u30A3\u30C3\u30AF\u30D5\u30A7\u30A4\u30B9\u30B7\u30FC\u30EB\u30C9",
      rarity: "SR",
      category: "HEAD",
      base_stats: {
        hp: 10500,
        atk: 0,
        def: 1e3,
        spd: 0,
        luk: 0
      },
      fixed_effects: [
        "DEF+1000",
        "Status Resist12%"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "HEAD_015",
      display_name: "\u30B5\u30A4\u30D0\u30FC\u30B9\u30DE\u30FC\u30C8\u30B0\u30E9\u30B9",
      rarity: "SR",
      category: "HEAD",
      base_stats: {
        hp: 8200,
        atk: 0,
        def: 0,
        spd: 90,
        luk: 0
      },
      fixed_effects: [
        "SPD+90",
        "SPD+8%"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "HEAD_016",
      display_name: "\u96A0\u5BC6\u7528\u30A2\u30B5\u30B7\u30F3\u30D5\u30FC\u30C9",
      rarity: "SR",
      category: "HEAD",
      base_stats: {
        hp: 8800,
        atk: 0,
        def: 0,
        spd: 0,
        luk: 6
      },
      fixed_effects: [
        "LUK+6",
        "Silence Resist15%"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "HEAD_017",
      display_name: "\u30B5\u30A4\u30D0\u30FC\u30FB\u30D0\u30A4\u30B6\u30FC\u300E\u5343\u91CC\u773C\u300F",
      rarity: "SR",
      category: "HEAD",
      base_stats: {
        hp: 8500,
        atk: 0,
        def: 0,
        spd: 50,
        luk: 8
      },
      fixed_effects: [
        "LUK+8/SPD+50",
        "Crit Rate10%"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "HEAD_018",
      display_name: "\u30D8\u30EB\u30E1\u30C3\u30C8\u300E\u9632\u5841\u300F",
      rarity: "SSR",
      category: "HEAD",
      base_stats: {
        hp: 14e3,
        atk: 0,
        def: 1800,
        spd: 0,
        luk: 0
      },
      fixed_effects: [
        "DEF+1800",
        "DR8%"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "HEAD_019",
      display_name: "\u652F\u914D\u8005\u306E\u30E2\u30CE\u30AF\u30EB",
      rarity: "SSR",
      category: "HEAD",
      base_stats: {
        hp: 11500,
        atk: 0,
        def: 0,
        spd: 0,
        luk: 12
      },
      fixed_effects: [
        "LUK+12",
        "Status Resist18%"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "HEAD_020",
      display_name: "\u8276\u82B1\u306E\u9ED2\u7C2A",
      rarity: "SSR",
      category: "HEAD",
      base_stats: {
        hp: 10500,
        atk: 0,
        def: 0,
        spd: 130,
        luk: 12
      },
      fixed_effects: [
        "SPD+130/LUK+12",
        "First Status\u2192Status Resist25%/3T"
      ],
      exclusive_character_id: "char_miyabi_01",
      random_options: false
    },
    {
      equipment_id: "BODY_001",
      display_name: "\u30A6\u30A4\u30F3\u30C9\u30D6\u30EC\u30FC\u30AB\u30FC",
      rarity: "N",
      category: "BODY",
      base_stats: {
        hp: 4e3,
        atk: 0,
        def: 500,
        spd: 0,
        luk: 0
      },
      fixed_effects: [
        "\u2014"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "BODY_002",
      display_name: "\u30C7\u30CB\u30E0\u30D9\u30B9\u30C8",
      rarity: "N",
      category: "BODY",
      base_stats: {
        hp: 4400,
        atk: 0,
        def: 550,
        spd: 0,
        luk: 0
      },
      fixed_effects: [
        "\u2014"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "BODY_003",
      display_name: "\u4F5C\u696D\u7528\u3064\u306A\u304E",
      rarity: "N",
      category: "BODY",
      base_stats: {
        hp: 4600,
        atk: 0,
        def: 600,
        spd: 0,
        luk: 0
      },
      fixed_effects: [
        "\u2014"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "BODY_004",
      display_name: "\u30B5\u30C6\u30F3\u30D6\u30EB\u30BE\u30F3",
      rarity: "N",
      category: "BODY",
      base_stats: {
        hp: 4200,
        atk: 0,
        def: 500,
        spd: 15,
        luk: 0
      },
      fixed_effects: [
        "SPD+15"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "BODY_005",
      display_name: "\u30EC\u30B6\u30FC\u30B8\u30E3\u30B1\u30C3\u30C8",
      rarity: "N",
      category: "BODY",
      base_stats: {
        hp: 5e3,
        atk: 0,
        def: 700,
        spd: 0,
        luk: 0
      },
      fixed_effects: [
        "\u2014"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "BODY_006",
      display_name: "\u30EB\u30FC\u30BA\u30B5\u30A4\u30BA\u30D5\u30FC\u30C7\u30A3",
      rarity: "N",
      category: "BODY",
      base_stats: {
        hp: 5500,
        atk: 0,
        def: 450,
        spd: 0,
        luk: 0
      },
      fixed_effects: [
        "\u2014"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "BODY_007",
      display_name: "\u30D6\u30E9\u30F3\u30C9\u30D1\u30FC\u30AB\u30FC",
      rarity: "R",
      category: "BODY",
      base_stats: {
        hp: 7e3,
        atk: 0,
        def: 950,
        spd: 0,
        luk: 0
      },
      fixed_effects: [
        "\u2014"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "BODY_008",
      display_name: "\u30ED\u30F3\u30B0\u30EC\u30B6\u30FC\u30B3\u30FC\u30C8",
      rarity: "R",
      category: "BODY",
      base_stats: {
        hp: 7500,
        atk: 0,
        def: 1100,
        spd: 0,
        luk: 0
      },
      fixed_effects: [
        "\u2014"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "BODY_009",
      display_name: "\u30C0\u30D6\u30EB\u30E9\u30A4\u30C0\u30FC\u30B9",
      rarity: "R",
      category: "BODY",
      base_stats: {
        hp: 7200,
        atk: 0,
        def: 1250,
        spd: 0,
        luk: 0
      },
      fixed_effects: [
        "\u2014"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "BODY_010",
      display_name: "\u30A4\u30F3\u30CA\u30FC\u30B7\u30E3\u30C4",
      rarity: "R",
      category: "BODY",
      base_stats: {
        hp: 8e3,
        atk: 0,
        def: 850,
        spd: 25,
        luk: 0
      },
      fixed_effects: [
        "SPD+25"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "BODY_011",
      display_name: "\u30EF\u30FC\u30AF\u30C7\u30CB\u30E0\u30B8\u30E3\u30B1\u30C3\u30C8",
      rarity: "R",
      category: "BODY",
      base_stats: {
        hp: 7600,
        atk: 0,
        def: 1050,
        spd: 0,
        luk: 0
      },
      fixed_effects: [
        "\u2014"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "BODY_012",
      display_name: "\u30D7\u30ED\u30C6\u30AF\u30C8\u30D1\u30D5\u30A1\u30FC\u30D9\u30B9\u30C8",
      rarity: "R",
      category: "BODY",
      base_stats: {
        hp: 8300,
        atk: 0,
        def: 1150,
        spd: 0,
        luk: 0
      },
      fixed_effects: [
        "\u2014"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "BODY_013",
      display_name: "\u30D5\u30E9\u30A4\u30C8\u30B8\u30E3\u30B1\u30C3\u30C8",
      rarity: "R",
      category: "BODY",
      base_stats: {
        hp: 7800,
        atk: 0,
        def: 1200,
        spd: 0,
        luk: 0
      },
      fixed_effects: [
        "\u2014"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "BODY_014",
      display_name: "\u9632\u5F3E\u30D9\u30B9\u30C8",
      rarity: "R",
      category: "BODY",
      base_stats: {
        hp: 9e3,
        atk: 0,
        def: 1500,
        spd: 0,
        luk: 0
      },
      fixed_effects: [
        "\u2014"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "BODY_015",
      display_name: "\u30A2\u30B5\u30B7\u30F3\u30C6\u30C3\u30AF\u30A6\u30A7\u30A2\u30B3\u30FC\u30C8",
      rarity: "R",
      category: "BODY",
      base_stats: {
        hp: 7500,
        atk: 0,
        def: 900,
        spd: 50,
        luk: 0
      },
      fixed_effects: [
        "SPD+50"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "BODY_016",
      display_name: "\u5F37\u5316\u8010\u885D\u6483\u91CD\u88C5\u30A2\u30FC\u30DE\u30FC",
      rarity: "SR",
      category: "BODY",
      base_stats: {
        hp: 13500,
        atk: 0,
        def: 2400,
        spd: -50,
        luk: 0
      },
      fixed_effects: [
        "SPD-50 / HP10%"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "BODY_017",
      display_name: "\u30CA\u30CE\u30D5\u30A1\u30A4\u30D0\u30FC\u9632\u5203\u30A2\u30A6\u30BF\u30FC",
      rarity: "SR",
      category: "BODY",
      base_stats: {
        hp: 11e3,
        atk: 0,
        def: 1850,
        spd: 0,
        luk: 0
      },
      fixed_effects: [
        "Status Resist12%"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "BODY_018",
      display_name: "\u9632\u5F3E\u30C0\u30D6\u30EB\u30B9\u30FC\u30C4\u30B8\u30E3\u30B1\u30C3\u30C8",
      rarity: "SR",
      category: "BODY",
      base_stats: {
        hp: 10500,
        atk: 0,
        def: 1700,
        spd: 0,
        luk: 6
      },
      fixed_effects: [
        "LUK+6 / DEF10%"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "BODY_019",
      display_name: "\u30D1\u30F3\u30AF\u30B9\u30BF\u30C3\u30BA\u30EC\u30B6\u30FC\u30E9\u30A4\u30C0\u30FC\u30B9",
      rarity: "SR",
      category: "BODY",
      base_stats: {
        hp: 1e4,
        atk: 0,
        def: 2e3,
        spd: 0,
        luk: 0
      },
      fixed_effects: [
        "DR5%"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "BODY_020",
      display_name: "\u91CD\u4F5C\u696D\u7528\u5916\u9AA8\u683C\u30D9\u30B9\u30C8",
      rarity: "SR",
      category: "BODY",
      base_stats: {
        hp: 1e4,
        atk: 500,
        def: 2150,
        spd: 0,
        luk: 0
      },
      fixed_effects: [
        "ATK+500 / ATK8%"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "BODY_021",
      display_name: "\u30A6\u30A4\u30F3\u30C9\u30D6\u30EC\u30FC\u30AB\u30FC\u30FB\u30AB\u30B9\u30BF\u30E0",
      rarity: "SR",
      category: "BODY",
      base_stats: {
        hp: 9500,
        atk: 0,
        def: 1550,
        spd: 75,
        luk: 0
      },
      fixed_effects: [
        "SPD+75 / SPD8%"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "BODY_022",
      display_name: "\u9AD8\u7D1A\u30A6\u30FC\u30EB\u30C1\u30A7\u30B9\u30BF\u30FC\u30B3\u30FC\u30C8",
      rarity: "SR",
      category: "BODY",
      base_stats: {
        hp: 11500,
        atk: 0,
        def: 1650,
        spd: 0,
        luk: 7
      },
      fixed_effects: [
        "LUK+7 / Status Resist15%"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "BODY_023",
      display_name: "\u30B5\u30A4\u30D0\u30FC\u30D9\u30B9\u30C8\u300E\u76FE\u58C1\u300F",
      rarity: "SR",
      category: "BODY",
      base_stats: {
        hp: 13e3,
        atk: 0,
        def: 2300,
        spd: 0,
        luk: 0
      },
      fixed_effects: [
        "DR7%"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "BODY_024",
      display_name: "\u30CA\u30CE\u30E1\u30C3\u30B7\u30E5\u30FB\u30B9\u30C6\u30EB\u30B9\u30B9\u30FC\u30C4",
      rarity: "SR",
      category: "BODY",
      base_stats: {
        hp: 1e4,
        atk: 0,
        def: 1500,
        spd: 90,
        luk: 0
      },
      fixed_effects: [
        "SPD+90 / Silence Resist15%"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "BODY_025",
      display_name: "\u30F4\u30A7\u30EB\u30F4\u30A7\u30C3\u30C8\u30FB\u30B3\u30FC\u30C8",
      rarity: "SR",
      category: "BODY",
      base_stats: {
        hp: 12e3,
        atk: 0,
        def: 1800,
        spd: 0,
        luk: 0
      },
      fixed_effects: [
        "Healing Received12%"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "BODY_026",
      display_name: "\u8987\u738B\u306E\u30E9\u30A4\u30C0\u30FC\u30B9",
      rarity: "SSR",
      category: "BODY",
      base_stats: {
        hp: 16e3,
        atk: 650,
        def: 3e3,
        spd: 0,
        luk: 0
      },
      fixed_effects: [
        "ATK+650 / DEF15%"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "BODY_027",
      display_name: "\u86C7\u7D0B\u306E\u30B7\u30EB\u30AF\u30B7\u30E3\u30C4",
      rarity: "SSR",
      category: "BODY",
      base_stats: {
        hp: 14e3,
        atk: 0,
        def: 2500,
        spd: 0,
        luk: 12
      },
      fixed_effects: [
        "LUK+12 / Status Resist20%"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "BODY_028",
      display_name: "\u30B5\u30A4\u30D0\u30FC\u30DF\u30CB\u30C9\u30EC\u30B9",
      rarity: "SSR",
      category: "BODY",
      base_stats: {
        hp: 13500,
        atk: 0,
        def: 2300,
        spd: 130,
        luk: 0
      },
      fixed_effects: [
        "SPD+130 / Healing Received18%"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "BODY_029",
      display_name: "\u30DC\u30EB\u30C9\u30FC\u30DB\u30B9\u30C8\u30B9\u30FC\u30C4",
      rarity: "SSR",
      category: "BODY",
      base_stats: {
        hp: 14500,
        atk: 0,
        def: 2600,
        spd: 0,
        luk: 12
      },
      fixed_effects: [
        "LUK+12 / First Status\u2192Cleanse1+DEF15%/3T"
      ],
      exclusive_character_id: "char_mio_01",
      random_options: false
    },
    {
      equipment_id: "BODY_030",
      display_name: "\u822C\u82E5\u523A\u7E4D\u306E\u30B9\u30AB\u30B8\u30E3\u30F3",
      rarity: "SSR",
      category: "BODY",
      base_stats: {
        hp: 15500,
        atk: 700,
        def: 2900,
        spd: 0,
        luk: 0
      },
      fixed_effects: [
        "ATK+700 / HP<40%\u2192DR10%/3T"
      ],
      exclusive_character_id: "char_reiji_01",
      random_options: false
    },
    {
      equipment_id: "LEGS_001",
      display_name: "\u30C6\u30C3\u30AF\u30B8\u30E7\u30AC\u30FC",
      rarity: "N",
      category: "LEGS",
      base_stats: {
        hp: 0,
        atk: 0,
        def: 400,
        spd: 25,
        luk: 0
      },
      fixed_effects: [
        "SPD+25",
        "\u2014"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "LEGS_002",
      display_name: "\u30C0\u30E1\u30FC\u30B8\u30B8\u30FC\u30F3\u30BA",
      rarity: "N",
      category: "LEGS",
      base_stats: {
        hp: 0,
        atk: 0,
        def: 450,
        spd: 0,
        luk: 2
      },
      fixed_effects: [
        "LUK+2",
        "\u2014"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "LEGS_003",
      display_name: "\u30EF\u30FC\u30AF\u30D1\u30F3\u30C4",
      rarity: "N",
      category: "LEGS",
      base_stats: {
        hp: 2e3,
        atk: 0,
        def: 550,
        spd: 0,
        luk: 0
      },
      fixed_effects: [
        "HP+2000",
        "\u2014"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "LEGS_004",
      display_name: "\u30CF\u30A4\u30AB\u30C3\u30C8\u30B9\u30CB\u30FC\u30AB\u30FC",
      rarity: "N",
      category: "LEGS",
      base_stats: {
        hp: 0,
        atk: 0,
        def: 350,
        spd: 35,
        luk: 0
      },
      fixed_effects: [
        "SPD+35",
        "\u2014"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "LEGS_005",
      display_name: "\u30B3\u30F3\u30D7\u30EC\u30C3\u30B7\u30E7\u30F3\u30B9\u30D1\u30C3\u30C4",
      rarity: "N",
      category: "LEGS",
      base_stats: {
        hp: 0,
        atk: 0,
        def: 400,
        spd: 30,
        luk: 0
      },
      fixed_effects: [
        "SPD+30",
        "\u2014"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "LEGS_006",
      display_name: "\u30EC\u30B6\u30FC\u30E9\u30A4\u30C0\u30FC\u30D1\u30F3\u30C4",
      rarity: "R",
      category: "LEGS",
      base_stats: {
        hp: 3500,
        atk: 0,
        def: 850,
        spd: 0,
        luk: 0
      },
      fixed_effects: [
        "HP+3500",
        "\u2014"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "LEGS_007",
      display_name: "\u5F37\u5316\u30AB\u30FC\u30B4\u30D1\u30F3\u30C4",
      rarity: "R",
      category: "LEGS",
      base_stats: {
        hp: 0,
        atk: 0,
        def: 900,
        spd: 45,
        luk: 0
      },
      fixed_effects: [
        "SPD+45",
        "\u2014"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "LEGS_008",
      display_name: "\u30B5\u30EB\u30A8\u30EB\u30B9\u30A6\u30A7\u30C3\u30C8",
      rarity: "R",
      category: "LEGS",
      base_stats: {
        hp: 0,
        atk: 0,
        def: 700,
        spd: 60,
        luk: 0
      },
      fixed_effects: [
        "SPD+60",
        "\u2014"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "LEGS_009",
      display_name: "\u30B9\u30C8\u30EC\u30C3\u30C1\u30B9\u30AD\u30CB\u30FC",
      rarity: "R",
      category: "LEGS",
      base_stats: {
        hp: 0,
        atk: 0,
        def: 650,
        spd: 0,
        luk: 5
      },
      fixed_effects: [
        "LUK+5",
        "\u2014"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "LEGS_010",
      display_name: "\u4F5C\u696D\u7528\u30AA\u30FC\u30D0\u30FC\u30AA\u30FC\u30EB",
      rarity: "R",
      category: "LEGS",
      base_stats: {
        hp: 3e3,
        atk: 0,
        def: 1e3,
        spd: 0,
        luk: 0
      },
      fixed_effects: [
        "HP+3000",
        "\u2014"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "LEGS_011",
      display_name: "\u30D7\u30ED\u30C6\u30AF\u30C8\u30FB\u30B3\u30F3\u30D0\u30C3\u30C8\u30D1\u30F3\u30C4",
      rarity: "R",
      category: "LEGS",
      base_stats: {
        hp: 3500,
        atk: 0,
        def: 1150,
        spd: 0,
        luk: 0
      },
      fixed_effects: [
        "HP+3500",
        "\u2014"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "LEGS_012",
      display_name: "\u5F37\u5316\u30B9\u30C1\u30FC\u30EB\u30C8\u30A5\u30FC\u30D6\u30FC\u30C4",
      rarity: "SR",
      category: "LEGS",
      base_stats: {
        hp: 0,
        atk: 0,
        def: 1500,
        spd: 90,
        luk: 0
      },
      fixed_effects: [
        "SPD+90",
        "Normal Damage8%"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "LEGS_013",
      display_name: "\u30CA\u30CE\u30AB\u30FC\u30DC\u30F3\u30FB\u30E9\u30F3\u30CB\u30F3\u30B0\u30B9\u30D1\u30C3\u30C4",
      rarity: "SR",
      category: "LEGS",
      base_stats: {
        hp: 0,
        atk: 0,
        def: 1300,
        spd: 130,
        luk: 0
      },
      fixed_effects: [
        "SPD+130",
        "SPD8%"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "LEGS_014",
      display_name: "\u30D8\u30F4\u30A3\u30BF\u30AF\u30C6\u30A3\u30AB\u30EB\u30B0\u30EA\u30FC\u30D6",
      rarity: "SR",
      category: "LEGS",
      base_stats: {
        hp: 6e3,
        atk: 0,
        def: 2e3,
        spd: -30,
        luk: 0
      },
      fixed_effects: [
        "HP+6000/SPD-30",
        "DEF10%"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "LEGS_015",
      display_name: "\u9AD8\u901A\u6C17\u30C6\u30C3\u30AF\u30E1\u30C3\u30B7\u30E5\u30D1\u30F3\u30C4",
      rarity: "SR",
      category: "LEGS",
      base_stats: {
        hp: 0,
        atk: 0,
        def: 1400,
        spd: 110,
        luk: 0
      },
      fixed_effects: [
        "SPD+110",
        "Status Resist12%"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "LEGS_016",
      display_name: "\u30B9\u30D1\u30A4\u30AF\u30B9\u30BF\u30C3\u30BA\u30EC\u30B6\u30FC\u30D1\u30F3\u30C4",
      rarity: "SR",
      category: "LEGS",
      base_stats: {
        hp: 0,
        atk: 0,
        def: 1650,
        spd: 0,
        luk: 7
      },
      fixed_effects: [
        "LUK+7",
        "Crit Resist12%"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "LEGS_017",
      display_name: "\u30AB\u30FC\u30DC\u30F3\u30D5\u30A1\u30A4\u30D0\u30FC\u30FB\u30B9\u30CB\u30FC\u30AB\u30FC\u300E\u9583\u5149\u300F",
      rarity: "SR",
      category: "LEGS",
      base_stats: {
        hp: 0,
        atk: 0,
        def: 1250,
        spd: 150,
        luk: 0
      },
      fixed_effects: [
        "SPD+150",
        "SPD10%"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "LEGS_018",
      display_name: "\u30A2\u30FC\u30DE\u30FC\u30C9\u30D6\u30FC\u30C4\u300E\u9632\u5841\u300F",
      rarity: "SSR",
      category: "LEGS",
      base_stats: {
        hp: 8e3,
        atk: 0,
        def: 2800,
        spd: -40,
        luk: 0
      },
      fixed_effects: [
        "HP+8000/SPD-40",
        "DEF15%"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "LEGS_019",
      display_name: "\u30B9\u30D4\u30FC\u30C9\u30B9\u30BF\u30FC\u30FB\u30B9\u30CB\u30FC\u30AB\u30FC",
      rarity: "SSR",
      category: "LEGS",
      base_stats: {
        hp: 0,
        atk: 0,
        def: 1800,
        spd: 210,
        luk: 0
      },
      fixed_effects: [
        "SPD+210",
        "Status Resist18%"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "LEGS_020",
      display_name: "\u6F06\u9ED2\u306E\u30A2\u30B5\u30B7\u30F3\u30ED\u30F3\u30B0\u30D6\u30FC\u30C4",
      rarity: "SSR",
      category: "LEGS",
      base_stats: {
        hp: 0,
        atk: 0,
        def: 1700,
        spd: 230,
        luk: 10
      },
      fixed_effects: [
        "SPD+230/LUK+10",
        "Battle Start SPD15%/3T"
      ],
      exclusive_character_id: "char_ageha_01",
      random_options: false
    },
    {
      equipment_id: "ACCESSORY_001",
      display_name: "\u30CD\u30AA\u30F3\u30B9\u30BF\u30C3\u30C9\u30D4\u30A2\u30B9",
      rarity: "N",
      category: "ACCESSORY",
      base_stats: {
        hp: 0,
        atk: 0,
        def: 0,
        spd: 0,
        luk: 2
      },
      fixed_effects: [],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "ACCESSORY_002",
      display_name: "\u30B9\u30C1\u30FC\u30EB\u30D5\u30E9\u30C3\u30C8\u30EA\u30F3\u30B0",
      rarity: "N",
      category: "ACCESSORY",
      base_stats: {
        hp: 0,
        atk: 0,
        def: 0,
        spd: 0,
        luk: 3
      },
      fixed_effects: [],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "ACCESSORY_003",
      display_name: "\u30EC\u30B6\u30FC\u30D9\u30EB\u30C8\u30C1\u30E7\u30FC\u30AB\u30FC",
      rarity: "N",
      category: "ACCESSORY",
      base_stats: {
        hp: 1200,
        atk: 0,
        def: 0,
        spd: 0,
        luk: 0
      },
      fixed_effects: [],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "ACCESSORY_004",
      display_name: "\u523B\u5370\u4ED8\u304D\u30C9\u30C3\u30B0\u30BF\u30B0",
      rarity: "N",
      category: "ACCESSORY",
      base_stats: {
        hp: 0,
        atk: 250,
        def: 0,
        spd: 0,
        luk: 0
      },
      fixed_effects: [],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "ACCESSORY_005",
      display_name: "\u30E9\u30D0\u30FC\u30EA\u30B9\u30C8\u30D0\u30F3\u30C9",
      rarity: "N",
      category: "ACCESSORY",
      base_stats: {
        hp: 0,
        atk: 0,
        def: 0,
        spd: 20,
        luk: 0
      },
      fixed_effects: [],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "ACCESSORY_006",
      display_name: "\u30B7\u30EB\u30D0\u30FC\u30C1\u30A7\u30FC\u30F3\u30CD\u30C3\u30AF\u30EC\u30B9",
      rarity: "N",
      category: "ACCESSORY",
      base_stats: {
        hp: 0,
        atk: 0,
        def: 0,
        spd: 0,
        luk: 4
      },
      fixed_effects: [],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "ACCESSORY_007",
      display_name: "\u771F\u936E\u30A2\u30FC\u30E0\u30D0\u30F3\u30B0\u30EB",
      rarity: "N",
      category: "ACCESSORY",
      base_stats: {
        hp: 0,
        atk: 0,
        def: 200,
        spd: 0,
        luk: 0
      },
      fixed_effects: [],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "ACCESSORY_008",
      display_name: "\u30CD\u30AA\u30F3\u30E9\u30D0\u30FC\u30AD\u30FC\u30DB\u30EB\u30C0\u30FC",
      rarity: "N",
      category: "ACCESSORY",
      base_stats: {
        hp: 0,
        atk: 0,
        def: 0,
        spd: 10,
        luk: 3
      },
      fixed_effects: [],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "ACCESSORY_009",
      display_name: "\u30B9\u30AB\u30EB\u30D4\u30F3\u30D0\u30C3\u30B8",
      rarity: "N",
      category: "ACCESSORY",
      base_stats: {
        hp: 1600,
        atk: 0,
        def: 0,
        spd: 0,
        luk: 0
      },
      fixed_effects: [],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "ACCESSORY_010",
      display_name: "\u7DE8\u307F\u8FBC\u307F\u9769\u30D6\u30EC\u30B9",
      rarity: "N",
      category: "ACCESSORY",
      base_stats: {
        hp: 0,
        atk: 0,
        def: 150,
        spd: 0,
        luk: 2
      },
      fixed_effects: [],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "ACCESSORY_011",
      display_name: "\u30D6\u30E9\u30F3\u30C9\u30AF\u30ED\u30CE\u30B0\u30E9\u30D5",
      rarity: "N",
      category: "ACCESSORY",
      base_stats: {
        hp: 800,
        atk: 0,
        def: 0,
        spd: 25,
        luk: 0
      },
      fixed_effects: [],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "ACCESSORY_012",
      display_name: "\u6975\u592A\u30B4\u30FC\u30EB\u30C9\u30C1\u30A7\u30FC\u30F3",
      rarity: "R",
      category: "ACCESSORY",
      base_stats: {
        hp: 0,
        atk: 0,
        def: 0,
        spd: 0,
        luk: 6
      },
      fixed_effects: [],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "ACCESSORY_013",
      display_name: "\u30B9\u30AF\u30A8\u30A2\u5370\u53F0\u30EA\u30F3\u30B0",
      rarity: "R",
      category: "ACCESSORY",
      base_stats: {
        hp: 0,
        atk: 450,
        def: 0,
        spd: 0,
        luk: 4
      },
      fixed_effects: [],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "ACCESSORY_014",
      display_name: "\u30C1\u30BF\u30F3\u30C1\u30E7\u30FC\u30AB\u30FC",
      rarity: "R",
      category: "ACCESSORY",
      base_stats: {
        hp: 0,
        atk: 0,
        def: 400,
        spd: 25,
        luk: 0
      },
      fixed_effects: [],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "ACCESSORY_015",
      display_name: "\u30B9\u30D1\u30A4\u30AF\u30B9\u30BF\u30C3\u30BA\u30EA\u30B9\u30C8\u30D0\u30F3\u30C9",
      rarity: "R",
      category: "ACCESSORY",
      base_stats: {
        hp: 0,
        atk: 400,
        def: 300,
        spd: 0,
        luk: 0
      },
      fixed_effects: [],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "ACCESSORY_016",
      display_name: "\u30AB\u30DF\u30BD\u30EA\u5203\u30DA\u30F3\u30C0\u30F3\u30C8",
      rarity: "R",
      category: "ACCESSORY",
      base_stats: {
        hp: 0,
        atk: 600,
        def: 0,
        spd: 0,
        luk: 0
      },
      fixed_effects: [],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "ACCESSORY_017",
      display_name: "\u30AE\u30E3\u30F3\u30D6\u30E9\u30FC\u30C0\u30A4\u30B9",
      rarity: "R",
      category: "ACCESSORY",
      base_stats: {
        hp: 0,
        atk: 0,
        def: 0,
        spd: 0,
        luk: 9
      },
      fixed_effects: [],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "ACCESSORY_018",
      display_name: "\u30E6\u30FC\u30C6\u30A3\u30EA\u30C6\u30A3\u30D9\u30EB\u30C8",
      rarity: "R",
      category: "ACCESSORY",
      base_stats: {
        hp: 1500,
        atk: 0,
        def: 550,
        spd: 0,
        luk: 0
      },
      fixed_effects: [],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "ACCESSORY_019",
      display_name: "\u30B7\u30EB\u30D0\u30FC\u30B4\u30B7\u30C3\u30AF\u30B9\u30AB\u30EB\u30EA\u30F3\u30B0",
      rarity: "R",
      category: "ACCESSORY",
      base_stats: {
        hp: 0,
        atk: 400,
        def: 0,
        spd: 0,
        luk: 6
      },
      fixed_effects: [],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "ACCESSORY_020",
      display_name: "\u30B9\u30BF\u30C3\u30C9\u30A4\u30E4\u30FC\u30AB\u30D5",
      rarity: "R",
      category: "ACCESSORY",
      base_stats: {
        hp: 0,
        atk: 0,
        def: 0,
        spd: 55,
        luk: 0
      },
      fixed_effects: [],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "ACCESSORY_021",
      display_name: "\u30B9\u30C1\u30FC\u30EB\u30A6\u30A9\u30EC\u30C3\u30C8\u30C1\u30A7\u30FC\u30F3",
      rarity: "R",
      category: "ACCESSORY",
      base_stats: {
        hp: 0,
        atk: 0,
        def: 0,
        spd: 0,
        luk: 8
      },
      fixed_effects: [],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "ACCESSORY_022",
      display_name: "\u30B4\u30B7\u30C3\u30AF\u30AF\u30ED\u30B9\u30DA\u30F3\u30C0\u30F3\u30C8",
      rarity: "R",
      category: "ACCESSORY",
      base_stats: {
        hp: 2500,
        atk: 0,
        def: 250,
        spd: 0,
        luk: 0
      },
      fixed_effects: [],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "ACCESSORY_023",
      display_name: "\u30B9\u30DE\u30FC\u30C8\u30D5\u30A3\u30C3\u30C8\u30C8\u30E9\u30C3\u30AB\u30FC",
      rarity: "R",
      category: "ACCESSORY",
      base_stats: {
        hp: 1500,
        atk: 0,
        def: 0,
        spd: 60,
        luk: 0
      },
      fixed_effects: [],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "ACCESSORY_024",
      display_name: "\u30B3\u30D6\u30E9\u30D0\u30F3\u30B0\u30EB",
      rarity: "R",
      category: "ACCESSORY",
      base_stats: {
        hp: 0,
        atk: 450,
        def: 0,
        spd: 0,
        luk: 6
      },
      fixed_effects: [],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "ACCESSORY_025",
      display_name: "\u5F3E\u4E38\u30B7\u30A7\u30EB\u30CD\u30C3\u30AF\u30EC\u30B9",
      rarity: "R",
      category: "ACCESSORY",
      base_stats: {
        hp: 0,
        atk: 700,
        def: 0,
        spd: 0,
        luk: 0
      },
      fixed_effects: [],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "ACCESSORY_026",
      display_name: "\u30A2\u30F3\u30C6\u30A3\u30FC\u30AF\u30ED\u30B1\u30C3\u30C8\u30DA\u30F3\u30C0\u30F3\u30C8",
      rarity: "R",
      category: "ACCESSORY",
      base_stats: {
        hp: 3e3,
        atk: 0,
        def: 0,
        spd: 0,
        luk: 5
      },
      fixed_effects: [],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "ACCESSORY_027",
      display_name: "\u30D7\u30E9\u30C1\u30CA\u5370\u53F0\u30EA\u30F3\u30B0",
      rarity: "SR",
      category: "ACCESSORY",
      base_stats: {
        hp: 0,
        atk: 850,
        def: 0,
        spd: 0,
        luk: 8
      },
      fixed_effects: [
        "Healing Received10%"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "ACCESSORY_028",
      display_name: "\u30DB\u30EB\u30B9\u30BF\u30FC",
      rarity: "SR",
      category: "ACCESSORY",
      base_stats: {
        hp: 0,
        atk: 0,
        def: 500,
        spd: 80,
        luk: 0
      },
      fixed_effects: [
        "SPD8%"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "ACCESSORY_029",
      display_name: "\u30D6\u30EB\u30FC\u30B5\u30D5\u30A1\u30A4\u30A2\u30EA\u30F3\u30B0",
      rarity: "SR",
      category: "ACCESSORY",
      base_stats: {
        hp: 0,
        atk: 0,
        def: 0,
        spd: 50,
        luk: 12
      },
      fixed_effects: [
        "Crit Rate8%"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "ACCESSORY_030",
      display_name: "\u6975\u592A\u30AF\u30ED\u30FC\u30E0\u30C1\u30A7\u30FC\u30F3",
      rarity: "SR",
      category: "ACCESSORY",
      base_stats: {
        hp: 0,
        atk: 950,
        def: 0,
        spd: 0,
        luk: 7
      },
      fixed_effects: [
        "ATK6%"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "ACCESSORY_031",
      display_name: "\u6B7B\u795E\u306E\u30B7\u30EB\u30D0\u30FC\u30C1\u30E3\u30FC\u30E0",
      rarity: "SR",
      category: "ACCESSORY",
      base_stats: {
        hp: 5e3,
        atk: 0,
        def: 0,
        spd: 0,
        luk: 0
      },
      fixed_effects: [
        "Crit Resist12%"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "ACCESSORY_032",
      display_name: "\u767E\u5408\u306E\u523B\u5370\u30CD\u30C3\u30AF\u30EC\u30B9",
      rarity: "SR",
      category: "ACCESSORY",
      base_stats: {
        hp: 0,
        atk: 1050,
        def: 0,
        spd: 0,
        luk: 0
      },
      fixed_effects: [
        "Status Chance10%"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "ACCESSORY_033",
      display_name: "\u30D8\u30F4\u30A3\u30B9\u30D1\u30A4\u30AF\u30C1\u30E7\u30FC\u30AB\u30FC",
      rarity: "SR",
      category: "ACCESSORY",
      base_stats: {
        hp: 0,
        atk: 600,
        def: 750,
        spd: 0,
        luk: 0
      },
      fixed_effects: [
        "DEF8%"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "ACCESSORY_034",
      display_name: "\u30C0\u30A4\u30E4\u30E2\u30F3\u30C9\u30A2\u30F3\u30AB\u30FC\u30EA\u30F3\u30B0",
      rarity: "SR",
      category: "ACCESSORY",
      base_stats: {
        hp: 3e3,
        atk: 0,
        def: 0,
        spd: 0,
        luk: 13
      },
      fixed_effects: [
        "Status Resist12%"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "ACCESSORY_035",
      display_name: "\u539F\u77F3\u30BF\u30FC\u30B3\u30A4\u30BA\u30D0\u30F3\u30B0\u30EB",
      rarity: "SR",
      category: "ACCESSORY",
      base_stats: {
        hp: 0,
        atk: 0,
        def: 900,
        spd: 0,
        luk: 7
      },
      fixed_effects: [
        "Healing Received10%"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "ACCESSORY_036",
      display_name: "\u5929\u7136\u6C34\u6676\u30C1\u30E3\u30FC\u30E0",
      rarity: "SR",
      category: "ACCESSORY",
      base_stats: {
        hp: 4500,
        atk: 0,
        def: 0,
        spd: 0,
        luk: 7
      },
      fixed_effects: [
        "Healing Done12%"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "ACCESSORY_037",
      display_name: "\u30B9\u30DE\u30FC\u30C8\u30A6\u30A9\u30C3\u30C1PRO",
      rarity: "SR",
      category: "ACCESSORY",
      base_stats: {
        hp: 2500,
        atk: 0,
        def: 0,
        spd: 110,
        luk: 0
      },
      fixed_effects: [
        "SPD10%"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "ACCESSORY_038",
      display_name: "\u9ED2\u306E\u30C8\u30E9\u30A4\u30D0\u30EB\u30B7\u30FC\u30EB",
      rarity: "SR",
      category: "ACCESSORY",
      base_stats: {
        hp: 0,
        atk: 1100,
        def: -200,
        spd: 0,
        luk: 0
      },
      fixed_effects: [
        "ATK8%"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "ACCESSORY_039",
      display_name: "\u9244\u88FD\u30B7\u30E3\u30C3\u30AF\u30EB\u30D6\u30EC\u30B9",
      rarity: "SR",
      category: "ACCESSORY",
      base_stats: {
        hp: 0,
        atk: 0,
        def: 850,
        spd: 0,
        luk: 7
      },
      fixed_effects: [
        "Status Resist10%"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "ACCESSORY_040",
      display_name: "\u30EB\u30D3\u30FC\u30B4\u30FC\u30EB\u30C9\u30C1\u30E3\u30FC\u30E0",
      rarity: "SR",
      category: "ACCESSORY",
      base_stats: {
        hp: 0,
        atk: 1e3,
        def: 0,
        spd: 0,
        luk: 0
      },
      fixed_effects: [
        "Crit Damage15%"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "ACCESSORY_041",
      display_name: "\u5F37\u5316\u30AB\u30FC\u30DC\u30F3\u6226\u95D8\u30B0\u30ED\u30FC\u30D6",
      rarity: "SR",
      category: "ACCESSORY",
      base_stats: {
        hp: 0,
        atk: 700,
        def: 650,
        spd: 30,
        luk: 0
      },
      fixed_effects: [
        "Normal Damage8%"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "ACCESSORY_042",
      display_name: "\u30B9\u30CD\u30FC\u30AF\u30A2\u30F3\u30AF\u30EC\u30C3\u30C8",
      rarity: "SSR",
      category: "ACCESSORY",
      base_stats: {
        hp: 0,
        atk: 0,
        def: 0,
        spd: 170,
        luk: 12
      },
      fixed_effects: [
        "SPD12%"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "ACCESSORY_043",
      display_name: "\u30B9\u30C1\u30FC\u30EB\u30B9\u30AB\u30EB\u30AD\u30FC\u30C1\u30A7\u30FC\u30F3",
      rarity: "SSR",
      category: "ACCESSORY",
      base_stats: {
        hp: 0,
        atk: 0,
        def: 0,
        spd: 0,
        luk: 20
      },
      fixed_effects: [
        "Crit Rate12%"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "ACCESSORY_044",
      display_name: "\u30C1\u30BF\u30F3\u30A2\u30B9\u30EA\u30FC\u30C8\u30D0\u30F3\u30C9",
      rarity: "SSR",
      category: "ACCESSORY",
      base_stats: {
        hp: 5e3,
        atk: 0,
        def: 1400,
        spd: 0,
        luk: 0
      },
      fixed_effects: [
        "Status Resist18%"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "ACCESSORY_045",
      display_name: "\u30AA\u30D1\u30FC\u30EB\u895F\u30D4\u30F3\u30D0\u30C3\u30B8",
      rarity: "SSR",
      category: "ACCESSORY",
      base_stats: {
        hp: 0,
        atk: 0,
        def: 0,
        spd: 0,
        luk: 22
      },
      fixed_effects: [
        "Status Chance15%"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "ACCESSORY_046",
      display_name: "\u6975\u9053\u5E79\u90E8\u306E\u7FE1\u7FE0\u5B88\u308A",
      rarity: "SSR",
      category: "ACCESSORY",
      base_stats: {
        hp: 5e3,
        atk: 0,
        def: 1e3,
        spd: 0,
        luk: 0
      },
      fixed_effects: [
        "DR6%"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "ACCESSORY_047",
      display_name: "\u6F06\u5857\u308A\u306E\u685C\u6839\u4ED8",
      rarity: "SSR",
      category: "ACCESSORY",
      base_stats: {
        hp: 0,
        atk: 0,
        def: 0,
        spd: 130,
        luk: 16
      },
      fixed_effects: [
        "Crit Damage22%"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "ACCESSORY_048",
      display_name: "\u30CA\u30A4\u30C8\u30B8\u30E5\u30A8\u30EB",
      rarity: "SSR",
      category: "ACCESSORY",
      base_stats: {
        hp: 0,
        atk: 1600,
        def: 0,
        spd: 0,
        luk: 12
      },
      fixed_effects: [
        "ATK10%"
      ],
      exclusive_character_id: null,
      random_options: false
    },
    {
      equipment_id: "ACCESSORY_049",
      display_name: "\u30D5\u30A7\u30A4\u30C8\u30FB\u30C1\u30E3\u30FC\u30E0",
      rarity: "SSR",
      category: "ACCESSORY",
      base_stats: {
        hp: 0,
        atk: 0,
        def: 0,
        spd: 120,
        luk: 25
      },
      fixed_effects: [
        "First Skill\u2192Status Chance20%/3T"
      ],
      exclusive_character_id: "char_karen_01",
      random_options: false
    },
    {
      equipment_id: "ACCESSORY_050",
      display_name: "\u30AF\u30A4\u30FC\u30F3\u30BA\u30FB\u30B7\u30B0\u30CD\u30C3\u30C8",
      rarity: "SSR",
      category: "ACCESSORY",
      base_stats: {
        hp: 6e3,
        atk: 0,
        def: 0,
        spd: 0,
        luk: 16
      },
      fixed_effects: [
        "Battle Start Ally-all DEF8%/2T"
      ],
      exclusive_character_id: "char_kaede_01",
      random_options: false
    }
  ]
};

// config/game04-master-assets.json
var game04_master_assets_default = {
  version: "2026-09-18",
  namingAuthority: "GAME04_SENGOKU_ITEM_SKILL_EQUIPMENT_NAME_FIX_2026-09-16",
  connectedAssetSourceCommit: "aa72725",
  summary: {
    total: 258,
    sengokuConnected: 63,
    awaitingGenericImage: 165,
    awaitingExclusiveImage: 30
  },
  assets: [
    {
      id: "CHAR_EXP_S",
      name: "\u4FEE\u7DF4\u306E\u5175\u7CE7\u4E38\u30FB\u5C0F",
      category: "ITEM",
      path: "/items/char_exp_s.png",
      format: "PNG",
      size: [
        512,
        512
      ],
      status: "SENGOKU_CONNECTED"
    },
    {
      id: "CHAR_EXP_M",
      name: "\u4FEE\u7DF4\u306E\u5175\u7CE7\u4E38\u30FB\u4E2D",
      category: "ITEM",
      path: "/items/char_exp_m.png",
      format: "PNG",
      size: [
        512,
        512
      ],
      status: "SENGOKU_CONNECTED"
    },
    {
      id: "CHAR_EXP_L",
      name: "\u4FEE\u7DF4\u306E\u5175\u7CE7\u4E38\u30FB\u5927",
      category: "ITEM",
      path: "/items/char_exp_l.png",
      format: "PNG",
      size: [
        512,
        512
      ],
      status: "SENGOKU_CONNECTED"
    },
    {
      id: "EQUIP_EXP_S",
      name: "\u935B\u932C\u306E\u7825\u77F3\u30FB\u5C0F",
      category: "ITEM",
      path: "/items/equip_exp_s.png",
      format: "PNG",
      size: [
        512,
        512
      ],
      status: "SENGOKU_CONNECTED"
    },
    {
      id: "EQUIP_EXP_M",
      name: "\u935B\u932C\u306E\u7825\u77F3\u30FB\u4E2D",
      category: "ITEM",
      path: "/items/equip_exp_m.png",
      format: "PNG",
      size: [
        512,
        512
      ],
      status: "SENGOKU_CONNECTED"
    },
    {
      id: "EQUIP_EXP_L",
      name: "\u935B\u932C\u306E\u7825\u77F3\u30FB\u5927",
      category: "ITEM",
      path: "/items/equip_exp_l.png",
      format: "PNG",
      size: [
        512,
        512
      ],
      status: "SENGOKU_CONNECTED"
    },
    {
      id: "AWAKENING_BOOK",
      name: "\u899A\u9192\u306E\u79D8\u5DFB",
      category: "ITEM",
      path: "/items/awakening_book.png",
      format: "PNG",
      size: [
        512,
        512
      ],
      status: "SENGOKU_CONNECTED"
    },
    {
      id: "SKILL_MANUAL",
      name: "\u5965\u7FA9\u6307\u5357\u66F8",
      category: "ITEM",
      path: "/items/skill_manual.png",
      format: "PNG",
      size: [
        512,
        512
      ],
      status: "SENGOKU_CONNECTED"
    },
    {
      id: "EQUIP_LB_PART",
      name: "\u935B\u51B6\u306E\u79D8\u92FC",
      category: "ITEM",
      path: "/items/equip_lb_part.png",
      format: "PNG",
      size: [
        512,
        512
      ],
      status: "SENGOKU_CONNECTED"
    },
    {
      id: "ENERGY_DRINK",
      name: "\u6D3B\u529B\u4E38",
      category: "ITEM",
      path: "/items/energy_drink.png",
      format: "PNG",
      size: [
        512,
        512
      ],
      status: "SENGOKU_CONNECTED"
    },
    {
      id: "PVP_POINT_TICKET",
      name: "\u6C7A\u95D8\u72B6",
      category: "ITEM",
      path: "/items/pvp_point_ticket.png",
      format: "PNG",
      size: [
        512,
        512
      ],
      status: "SENGOKU_CONNECTED"
    },
    {
      id: "RAID_POINT_TICKET",
      name: "\u8A0E\u4F10\u4EE4",
      category: "ITEM",
      path: "/items/raid_point_ticket.png",
      format: "PNG",
      size: [
        512,
        512
      ],
      status: "SENGOKU_CONNECTED"
    },
    {
      id: "NORMAL_GACHA_TICKET_CHARACTER",
      name: "\u59EB\u6B66\u5C06\u53EC\u559A\u672D",
      category: "ITEM",
      path: "/items/normal_gacha_ticket_character.png",
      format: "PNG",
      size: [
        512,
        512
      ],
      status: "SENGOKU_CONNECTED"
    },
    {
      id: "NORMAL_GACHA_TICKET_SKILL",
      name: "\u6226\u6280\u53EC\u559A\u672D",
      category: "ITEM",
      path: "/items/normal_gacha_ticket_skill.png",
      format: "PNG",
      size: [
        512,
        512
      ],
      status: "SENGOKU_CONNECTED"
    },
    {
      id: "NORMAL_GACHA_TICKET_EQUIPMENT",
      name: "\u6B66\u5177\u53EC\u559A\u672D",
      category: "ITEM",
      path: "/items/normal_gacha_ticket_equipment.png",
      format: "PNG",
      size: [
        512,
        512
      ],
      status: "SENGOKU_CONNECTED"
    },
    {
      id: "SPECIAL_TICKET_CHARACTER",
      name: "\u7279\u9078\u30FB\u59EB\u6B66\u5C06\u53EC\u559A\u672D",
      category: "ITEM",
      path: "/items/special_ticket_character.png",
      format: "PNG",
      size: [
        512,
        512
      ],
      status: "SENGOKU_CONNECTED"
    },
    {
      id: "SPECIAL_TICKET_SKILL",
      name: "\u7279\u9078\u30FB\u6226\u6280\u53EC\u559A\u672D",
      category: "ITEM",
      path: "/items/special_ticket_skill.png",
      format: "PNG",
      size: [
        512,
        512
      ],
      status: "SENGOKU_CONNECTED"
    },
    {
      id: "SPECIAL_TICKET_EQUIPMENT",
      name: "\u7279\u9078\u30FB\u6B66\u5177\u53EC\u559A\u672D",
      category: "ITEM",
      path: "/items/special_ticket_equipment.png",
      format: "PNG",
      size: [
        512,
        512
      ],
      status: "SENGOKU_CONNECTED"
    },
    {
      id: "SKILL_001",
      name: "\u4E00\u6587\u5B57\u65AC\u308A",
      category: "SKILL",
      path: "/skills/skill_001_street_punch.jpg",
      format: "JPEG",
      size: [
        1024,
        1024
      ],
      status: "SENGOKU_CONNECTED"
    },
    {
      id: "SKILL_002",
      name: "\u7AF9\u675F\u306E\u5B88\u308A",
      category: "SKILL",
      path: "/skills/skill_002_quick_shield.jpg",
      format: "JPEG",
      size: [
        1024,
        1024
      ],
      status: "SENGOKU_CONNECTED"
    },
    {
      id: "SKILL_003",
      name: "\u85AC\u5E2B\u306E\u624B\u5F53",
      category: "SKILL",
      path: "/skills/skill_003_noise_heal.jpg",
      format: "JPEG",
      size: [
        1024,
        1024
      ],
      status: "SENGOKU_CONNECTED"
    },
    {
      id: "SKILL_004",
      name: "\u75BE\u98A8\u306E\u8DB3\u904B\u3073",
      category: "SKILL",
      path: "/skills/skill_004_step_dash.jpg",
      format: "JPEG",
      size: [
        1024,
        1024
      ],
      status: "SENGOKU_CONNECTED"
    },
    {
      id: "SKILL_005",
      name: "\u5FCD\u6CD5\u30FB\u6BD2\u91DD",
      category: "SKILL",
      path: "/skills/skill_005_poison_needle.jpg",
      format: "JPEG",
      size: [
        1024,
        1024
      ],
      status: "SENGOKU_CONNECTED"
    },
    {
      id: "SKILL_006",
      name: "\u9244\u58C1\u306E\u69CB\u3048",
      category: "SKILL",
      path: "/skills/skill_006_iron_guard.jpg",
      format: "JPEG",
      size: [
        1024,
        1024
      ],
      status: "SENGOKU_CONNECTED"
    },
    {
      id: "SKILL_007",
      name: "\u6311\u767A\u306E\u9B28",
      category: "SKILL",
      path: "/skills/skill_007_toxic_slang.jpg",
      format: "JPEG",
      size: [
        1024,
        1024
      ],
      status: "SENGOKU_CONNECTED"
    },
    {
      id: "SKILL_008",
      name: "\u5F13\u53D6\u308A\u306E\u4E00\u5C04",
      category: "SKILL",
      path: "/skills/skill_008_smart_snipe.jpg",
      format: "JPEG",
      size: [
        1024,
        1024
      ],
      status: "SENGOKU_CONNECTED"
    },
    {
      id: "SKILL_009",
      name: "\u596E\u8D77\u306E\u9663\u592A\u9F13",
      category: "SKILL",
      path: "/skills/skill_009_drug_injection.jpg",
      format: "JPEG",
      size: [
        1024,
        1024
      ],
      status: "SENGOKU_CONNECTED"
    },
    {
      id: "SKILL_010",
      name: "\u76EE\u6F70\u3057\u7C89",
      category: "SKILL",
      path: "/skills/skill_010_light_flash.jpg",
      format: "JPEG",
      size: [
        1024,
        1024
      ],
      status: "SENGOKU_CONNECTED"
    },
    {
      id: "SKILL_011",
      name: "\u6E3E\u8EAB\u306E\u592A\u5200",
      category: "SKILL",
      path: "/skills/skill_011_meditate.jpg",
      format: "JPEG",
      size: [
        1024,
        1024
      ],
      status: "SENGOKU_CONNECTED"
    },
    {
      id: "SKILL_012",
      name: "\u8599\u5200\u30FB\u5927\u65CB\u98A8",
      category: "SKILL",
      path: "/skills/skill_012_lucky_shoot.jpg",
      format: "JPEG",
      size: [
        1024,
        1024
      ],
      status: "SENGOKU_CONNECTED"
    },
    {
      id: "SKILL_013",
      name: "\u85AC\u5E2B\u306E\u5FDC\u6025\u624B\u5F53",
      category: "SKILL",
      path: "/skills/skill_013_charge_slash.jpg",
      format: "JPEG",
      size: [
        1024,
        1024
      ],
      status: "SENGOKU_CONNECTED"
    },
    {
      id: "SKILL_014",
      name: "\u7159\u5E55\u306E\u5B88\u9663",
      category: "SKILL",
      path: "/skills/skill_014_blunt_sweep.jpg",
      format: "JPEG",
      size: [
        1024,
        1024
      ],
      status: "SENGOKU_CONNECTED"
    },
    {
      id: "SKILL_015",
      name: "\u7834\u7532\u306E\u706B\u85AC\u7389",
      category: "SKILL",
      path: "/skills/skill_015_recovery_program.jpg",
      format: "JPEG",
      size: [
        1024,
        1024
      ],
      status: "SENGOKU_CONNECTED"
    },
    {
      id: "SKILL_016",
      name: "\u4EC1\u738B\u7ACB\u3061\u30FB\u7AF9\u675F\u76FE",
      category: "SKILL",
      path: "/skills/skill_016_smoke_screen.jpg",
      format: "JPEG",
      size: [
        1024,
        1024
      ],
      status: "SENGOKU_CONNECTED"
    },
    {
      id: "SKILL_017",
      name: "\u9B28\u306E\u58F0",
      category: "SKILL",
      path: "/skills/skill_017_acid_spray.jpg",
      format: "JPEG",
      size: [
        1024,
        1024
      ],
      status: "SENGOKU_CONNECTED"
    },
    {
      id: "SKILL_018",
      name: "\u91D1\u7815\u68D2\u30FB\u8133\u5929\u6483\u3061",
      category: "SKILL",
      path: "/skills/skill_018_jamming_wave.jpg",
      format: "JPEG",
      size: [
        1024,
        1024
      ],
      status: "SENGOKU_CONNECTED"
    },
    {
      id: "SKILL_019",
      name: "\u8840\u5438\u3044\u306E\u9023\u5203",
      category: "SKILL",
      path: "/skills/skill_019_impulse_barrier.jpg",
      format: "JPEG",
      size: [
        1024,
        1024
      ],
      status: "SENGOKU_CONNECTED"
    },
    {
      id: "SKILL_020",
      name: "\u65E9\u99C6\u3051\u306E\u53F7\u4EE4",
      category: "SKILL",
      path: "/skills/skill_020_indomitable_will.jpg",
      format: "JPEG",
      size: [
        1024,
        1024
      ],
      status: "SENGOKU_CONNECTED"
    },
    {
      id: "SKILL_021",
      name: "\u6025\u6240\u5C04\u3061",
      category: "SKILL",
      path: "/skills/skill_021_high_voltage.jpg",
      format: "JPEG",
      size: [
        1024,
        1024
      ],
      status: "SENGOKU_CONNECTED"
    },
    {
      id: "SKILL_022",
      name: "\u5927\u8599\u5200\u30FB\u93A7\u5D29\u3057",
      category: "SKILL",
      path: "/skills/skill_022_tactical_reload.jpg",
      format: "JPEG",
      size: [
        1024,
        1024
      ],
      status: "SENGOKU_CONNECTED"
    },
    {
      id: "SKILL_023",
      name: "\u79D8\u85AC\u30FB\u91D1\u5275\u818F",
      category: "SKILL",
      path: "/skills/skill_023_double_drive.jpg",
      format: "JPEG",
      size: [
        1024,
        1024
      ],
      status: "SENGOKU_CONNECTED"
    },
    {
      id: "SKILL_024",
      name: "\u7AF9\u675F\u30FB\u9244\u58C1\u9663",
      category: "SKILL",
      path: "/skills/skill_024_inspiring_roar.jpg",
      format: "JPEG",
      size: [
        1024,
        1024
      ],
      status: "SENGOKU_CONNECTED"
    },
    {
      id: "SKILL_025",
      name: "\u5FCD\u6CD5\u30FB\u7159\u7389\u4E71\u821E",
      category: "SKILL",
      path: "/skills/skill_025_protect_shield.jpg",
      format: "JPEG",
      size: [
        1024,
        1024
      ],
      status: "SENGOKU_CONNECTED"
    },
    {
      id: "SKILL_026",
      name: "\u6C7A\u8D77\u306E\u5927\u53F7\u4EE4",
      category: "SKILL",
      path: "/skills/skill_026_venom_blade.jpg",
      format: "JPEG",
      size: [
        1024,
        1024
      ],
      status: "SENGOKU_CONNECTED"
    },
    {
      id: "SKILL_027",
      name: "\u8840\u98A8\u65AC\u308A",
      category: "SKILL",
      path: "/skills/skill_027_synapse_burst.jpg",
      format: "JPEG",
      size: [
        1024,
        1024
      ],
      status: "SENGOKU_CONNECTED"
    },
    {
      id: "SKILL_028",
      name: "\u93A7\u901A\u3057",
      category: "SKILL",
      path: "/skills/skill_028_nanomachine_storm.jpg",
      format: "JPEG",
      size: [
        1024,
        1024
      ],
      status: "SENGOKU_CONNECTED"
    },
    {
      id: "SKILL_029",
      name: "\u85AC\u5E2B\u306E\u6D3B\u547D\u8853",
      category: "SKILL",
      path: "/skills/skill_029_toxic_gas.jpg",
      format: "JPEG",
      size: [
        1024,
        1024
      ],
      status: "SENGOKU_CONNECTED"
    },
    {
      id: "SKILL_030",
      name: "\u4E71\u7834\u30FB\u4F1D\u4EE4\u5C01\u3058",
      category: "SKILL",
      path: "/skills/skill_030_force_field.jpg",
      format: "JPEG",
      size: [
        1024,
        1024
      ],
      status: "SENGOKU_CONNECTED"
    },
    {
      id: "SKILL_031",
      name: "\u653B\u9632\u4E00\u4F53\u30FB\u69CD\u887E",
      category: "SKILL",
      path: "/skills/skill_031_hyper_accel.jpg",
      format: "JPEG",
      size: [
        1024,
        1024
      ],
      status: "SENGOKU_CONNECTED"
    },
    {
      id: "SKILL_032",
      name: "\u5FCD\u6CD5\u30FB\u6BD2\u5203",
      category: "SKILL",
      path: "/skills/skill_032_stun_grenade.jpg",
      format: "JPEG",
      size: [
        1024,
        1024
      ],
      status: "SENGOKU_CONNECTED"
    },
    {
      id: "SKILL_033",
      name: "\u660E\u93E1\u6B62\u6C34",
      category: "SKILL",
      path: "/skills/skill_033_atomic_cannon.jpg",
      format: "JPEG",
      size: [
        1024,
        1024
      ],
      status: "SENGOKU_CONNECTED"
    },
    {
      id: "SKILL_034",
      name: "\u5FCD\u6CD5\u30FB\u9583\u5149\u7389",
      category: "SKILL",
      path: "/skills/skill_034_life_steal.jpg",
      format: "JPEG",
      size: [
        1024,
        1024
      ],
      status: "SENGOKU_CONNECTED"
    },
    {
      id: "SKILL_035",
      name: "\u80CC\u6C34\u306E\u9663",
      category: "SKILL",
      path: "/skills/skill_035_hologram_decoy.jpg",
      format: "JPEG",
      size: [
        1024,
        1024
      ],
      status: "SENGOKU_CONNECTED"
    },
    {
      id: "SKILL_036",
      name: "\u5965\u7FA9\u30FB\u4E00\u5200\u4E21\u65AD",
      category: "SKILL",
      path: "/skills/skill_036_power_of_unity.jpg",
      format: "JPEG",
      size: [
        1024,
        1024
      ],
      status: "SENGOKU_CONNECTED"
    },
    {
      id: "SKILL_037",
      name: "\u5965\u7FA9\u30FB\u5343\u5203\u4E71\u821E",
      category: "SKILL",
      path: "/skills/skill_037_crimson_end_bullet.jpg",
      format: "JPEG",
      size: [
        1024,
        1024
      ],
      status: "SENGOKU_CONNECTED"
    },
    {
      id: "SKILL_038",
      name: "\u91D1\u57CE\u9244\u58C1",
      category: "SKILL",
      path: "/skills/skill_038_barrier_shatter.jpg",
      format: "JPEG",
      size: [
        1024,
        1024
      ],
      status: "SENGOKU_CONNECTED"
    },
    {
      id: "SKILL_039",
      name: "\u79D8\u5965\u7FA9\u30FB\u795E\u533B\u306E\u9663",
      category: "SKILL",
      path: "/skills/skill_039_timeline_rush.jpg",
      format: "JPEG",
      size: [
        1024,
        1024
      ],
      status: "SENGOKU_CONNECTED"
    },
    {
      id: "SKILL_040",
      name: "\u5996\u8853\u30FB\u8755\u307F\u306E\u9ED2\u9727",
      category: "SKILL",
      path: "/skills/skill_040_execution_strike.jpg",
      format: "JPEG",
      size: [
        1024,
        1024
      ],
      status: "SENGOKU_CONNECTED"
    },
    {
      id: "SKILL_041",
      name: "\u8987\u9053\u306E\u5927\u53F7\u4EE4",
      category: "SKILL",
      path: "/skills/skill_041_quick_search.jpg",
      format: "JPEG",
      size: [
        1024,
        1024
      ],
      status: "SENGOKU_CONNECTED"
    },
    {
      id: "SKILL_042",
      name: "\u79D8\u5965\u7FA9\u30FB\u8840\u685C\u4E71\u821E",
      category: "SKILL",
      path: "/skills/skill_042_linked_strike.jpg",
      format: "JPEG",
      size: [
        1024,
        1024
      ],
      status: "SENGOKU_CONNECTED"
    },
    {
      id: "SKILL_043",
      name: "\u5965\u7FA9\u30FB\u5730\u88C2\u5927\u69CC",
      category: "SKILL",
      path: "/skills/skill_043_gouge_wound.jpg",
      format: "JPEG",
      size: [
        1024,
        1024
      ],
      status: "SENGOKU_CONNECTED"
    },
    {
      id: "SKILL_044",
      name: "\u80CC\u6C34\u30FB\u4FEE\u7F85\u8FD4\u3057",
      category: "SKILL",
      path: "/skills/skill_044_cycle_off.jpg",
      format: "JPEG",
      size: [
        1024,
        1024
      ],
      status: "SENGOKU_CONNECTED"
    },
    {
      id: "SKILL_045",
      name: "\u8ECD\u7565\u30FB\u7DCF\u653B\u3081\u306E\u53F7\u4EE4",
      category: "SKILL",
      path: "/skills/skill_045_preparation.jpg",
      format: "JPEG",
      size: [
        1024,
        1024
      ],
      status: "SENGOKU_CONNECTED"
    },
    {
      id: "SKILL_046",
      name: "\u5996\u8853\u30FB\u6BD2\u8718\u86DB\u306E\u9663",
      category: "SKILL",
      path: "/skills/skill_046_life_extension.jpg",
      format: "JPEG",
      size: [
        1024,
        1024
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "SKILL_047",
      name: "\u5805\u9663\u30FB\u53CD\u6483\u306E\u69CD\u887E",
      category: "SKILL",
      path: "/skills/skill_047_chain_shield.jpg",
      format: "JPEG",
      size: [
        1024,
        1024
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "SKILL_048",
      name: "\u4E0D\u5C48\u30FB\u547D\u8108\u306E\u7948\u308A",
      category: "SKILL",
      path: "/skills/skill_048_provocation_trigger.jpg",
      format: "JPEG",
      size: [
        1024,
        1024
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "SKILL_049",
      name: "\u5FCD\u6CD5\u30FB\u5BB5\u95C7\u5C01\u3058",
      category: "SKILL",
      path: "/skills/skill_049_toxic_propagation.jpg",
      format: "JPEG",
      size: [
        1024,
        1024
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "SKILL_050",
      name: "\u79D8\u5965\u7FA9\u30FB\u93A7\u65AD\u3061",
      category: "SKILL",
      path: "/skills/skill_050_combo_heal.jpg",
      format: "JPEG",
      size: [
        1024,
        1024
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "SKILL_051",
      name: "\u525B\u62F3\u30FB\u4E00\u6483\u5FC5\u5012",
      category: "SKILL",
      path: "/skills/skill_051_draw_smash.jpg",
      format: "JPEG",
      size: [
        1024,
        1024
      ],
      status: "AWAITING_EXCLUSIVE_IMAGE"
    },
    {
      id: "SKILL_052",
      name: "\u4FEE\u7F85\u306E\u731B\u653B",
      category: "SKILL",
      path: "/skills/skill_052_in_sync_breathing.jpg",
      format: "JPEG",
      size: [
        1024,
        1024
      ],
      status: "AWAITING_EXCLUSIVE_IMAGE"
    },
    {
      id: "SKILL_053",
      name: "\u4EC1\u738B\u7ACB\u3061",
      category: "SKILL",
      path: "/skills/skill_053_coordinated_care.jpg",
      format: "JPEG",
      size: [
        1024,
        1024
      ],
      status: "AWAITING_EXCLUSIVE_IMAGE"
    },
    {
      id: "SKILL_054",
      name: "\u8987\u738B\u306E\u5A01\u5727",
      category: "SKILL",
      path: "/skills/skill_054_trump_card.jpg",
      format: "JPEG",
      size: [
        1024,
        1024
      ],
      status: "AWAITING_EXCLUSIVE_IMAGE"
    },
    {
      id: "SKILL_055",
      name: "\u75BE\u98A8\u8FC5\u96F7",
      category: "SKILL",
      path: "/skills/skill_055_reserve_draw.jpg",
      format: "JPEG",
      size: [
        1024,
        1024
      ],
      status: "AWAITING_EXCLUSIVE_IMAGE"
    },
    {
      id: "SKILL_056",
      name: "\u98A8\u5207\u308A\u306E\u592A\u5200",
      category: "SKILL",
      path: "/skills/skill_056_ap_accelerator.jpg",
      format: "JPEG",
      size: [
        1024,
        1024
      ],
      status: "AWAITING_EXCLUSIVE_IMAGE"
    },
    {
      id: "SKILL_057",
      name: "\u72D0\u706B\u306E\u622F\u308C",
      category: "SKILL",
      path: "/skills/skill_057_tactical_charge.jpg",
      format: "JPEG",
      size: [
        1024,
        1024
      ],
      status: "AWAITING_EXCLUSIVE_IMAGE"
    },
    {
      id: "SKILL_058",
      name: "\u5BB5\u95C7\u306E\u5E7B\u60D1",
      category: "SKILL",
      path: "/skills/skill_058_toxic_stimulation.jpg",
      format: "JPEG",
      size: [
        1024,
        1024
      ],
      status: "AWAITING_EXCLUSIVE_IMAGE"
    },
    {
      id: "SKILL_059",
      name: "\u6226\u59EB\u306E\u5A01\u5149",
      category: "SKILL",
      path: "/skills/skill_059_venom_catalyst.jpg",
      format: "JPEG",
      size: [
        1024,
        1024
      ],
      status: "AWAITING_EXCLUSIVE_IMAGE"
    },
    {
      id: "SKILL_060",
      name: "\u79D8\u5965\u7FA9\u30FB\u547D\u7E4B\u304E",
      category: "SKILL",
      path: "/skills/skill_060_tactical_draw.jpg",
      format: "JPEG",
      size: [
        1024,
        1024
      ],
      status: "AWAITING_EXCLUSIVE_IMAGE"
    },
    {
      id: "SKILL_061",
      name: "\u91D1\u525B\u5D29\u3057",
      category: "SKILL",
      path: "/skills/skill_061_adrenaline_rush.jpg",
      format: "JPEG",
      size: [
        1024,
        1024
      ],
      status: "AWAITING_EXCLUSIVE_IMAGE"
    },
    {
      id: "SKILL_062",
      name: "\u80CC\u6C34\u306E\u4E00\u592A\u5200",
      category: "SKILL",
      path: "/skills/skill_062_cycle_advance.jpg",
      format: "JPEG",
      size: [
        1024,
        1024
      ],
      status: "AWAITING_EXCLUSIVE_IMAGE"
    },
    {
      id: "SKILL_063",
      name: "\u8001\u7DF4\u306E\u5B88\u308A",
      category: "SKILL",
      path: "/skills/skill_063_limiter_release.jpg",
      format: "JPEG",
      size: [
        1024,
        1024
      ],
      status: "AWAITING_EXCLUSIVE_IMAGE"
    },
    {
      id: "SKILL_064",
      name: "\u6D41\u6C34\u53CD\u6483",
      category: "SKILL",
      path: "/skills/skill_064_search_destroy.jpg",
      format: "JPEG",
      size: [
        1024,
        1024
      ],
      status: "AWAITING_EXCLUSIVE_IMAGE"
    },
    {
      id: "SKILL_065",
      name: "\u97CB\u99C4\u5929\u306E\u5148\u99C6\u3051",
      category: "SKILL",
      path: "/skills/skill_065_absolute_discipline.jpg",
      format: "JPEG",
      size: [
        1024,
        1024
      ],
      status: "AWAITING_EXCLUSIVE_IMAGE"
    },
    {
      id: "SKILL_066",
      name: "\u75BE\u98A8\u9023\u65AC",
      category: "SKILL",
      path: "/skills/skill_066_discard_storm.jpg",
      format: "JPEG",
      size: [
        1024,
        1024
      ],
      status: "AWAITING_EXCLUSIVE_IMAGE"
    },
    {
      id: "SKILL_067",
      name: "\u5FCD\u6CD5\u30FB\u53E3\u5C01\u3058",
      category: "SKILL",
      path: "/skills/skill_067_blessing_of_neon.jpg",
      format: "JPEG",
      size: [
        1024,
        1024
      ],
      status: "AWAITING_EXCLUSIVE_IMAGE"
    },
    {
      id: "SKILL_068",
      name: "\u4E7E\u5764\u4E00\u64F2",
      category: "SKILL",
      path: "/skills/skill_068_underhand_deal.jpg",
      format: "JPEG",
      size: [
        1024,
        1024
      ],
      status: "AWAITING_EXCLUSIVE_IMAGE"
    },
    {
      id: "SKILL_069",
      name: "\u7D05\u84EE\u306E\u4E00\u6483",
      category: "SKILL",
      path: "/skills/skill_069_disruption.jpg",
      format: "JPEG",
      size: [
        1024,
        1024
      ],
      status: "AWAITING_EXCLUSIVE_IMAGE"
    },
    {
      id: "SKILL_070",
      name: "\u5BB5\u95C7\u306E\u546A\u8A5B",
      category: "SKILL",
      path: "/skills/skill_070_jamming_barrier.jpg",
      format: "JPEG",
      size: [
        1024,
        1024
      ],
      status: "AWAITING_EXCLUSIVE_IMAGE"
    },
    {
      id: "WEAPON_001",
      name: "\u5C0F\u5200",
      category: "EQUIPMENT",
      path: "/equipments/weapon_001.png",
      format: "PNG",
      size: [
        1024,
        1024
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "WEAPON_002",
      name: "\u706B\u7E04\u77ED\u7B52",
      category: "EQUIPMENT",
      path: "/equipments/weapon_002.png",
      format: "PNG",
      size: [
        1024,
        1024
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "WEAPON_003",
      name: "\u91D1\u7815\u68D2",
      category: "EQUIPMENT",
      path: "/equipments/weapon_003.png",
      format: "PNG",
      size: [
        1024,
        1024
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "WEAPON_004",
      name: "\u5C71\u5200",
      category: "EQUIPMENT",
      path: "/equipments/weapon_004.png",
      format: "PNG",
      size: [
        1024,
        1024
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "WEAPON_005",
      name: "\u5341\u624B",
      category: "EQUIPMENT",
      path: "/equipments/weapon_005.png",
      format: "PNG",
      size: [
        1024,
        1024
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "WEAPON_006",
      name: "\u5C0F\u67C4",
      category: "EQUIPMENT",
      path: "/equipments/weapon_006.png",
      format: "PNG",
      size: [
        1024,
        1024
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "WEAPON_007",
      name: "\u9244\u68D2",
      category: "EQUIPMENT",
      path: "/equipments/weapon_007.png",
      format: "PNG",
      size: [
        1024,
        1024
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "WEAPON_008",
      name: "\u9244\u62F3",
      category: "EQUIPMENT",
      path: "/equipments/weapon_008.png",
      format: "PNG",
      size: [
        1024,
        1024
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "WEAPON_009",
      name: "\u9244\u9264\u68D2",
      category: "EQUIPMENT",
      path: "/equipments/weapon_009.png",
      format: "PNG",
      size: [
        1024,
        1024
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "WEAPON_010",
      name: "\u5927\u53E3\u5F84\u77ED\u7B52",
      category: "EQUIPMENT",
      path: "/equipments/weapon_010.png",
      format: "PNG",
      size: [
        1024,
        1024
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "WEAPON_011",
      name: "\u77ED\u5200",
      category: "EQUIPMENT",
      path: "/equipments/weapon_011.png",
      format: "PNG",
      size: [
        1024,
        1024
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "WEAPON_012",
      name: "\u6539\u826F\u706B\u7E04\u77ED\u7B52",
      category: "EQUIPMENT",
      path: "/equipments/weapon_012.png",
      format: "PNG",
      size: [
        1024,
        1024
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "WEAPON_013",
      name: "\u6563\u5F3E\u706B\u7E04\u9283",
      category: "EQUIPMENT",
      path: "/equipments/weapon_013.png",
      format: "PNG",
      size: [
        1024,
        1024
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "WEAPON_014",
      name: "\u6226\u5834\u5C0F\u5200",
      category: "EQUIPMENT",
      path: "/equipments/weapon_014.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "WEAPON_015",
      name: "\u9244\u5341\u624B",
      category: "EQUIPMENT",
      path: "/equipments/weapon_015.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "WEAPON_016",
      name: "\u5FCD\u3073\u9023\u5F29",
      category: "EQUIPMENT",
      path: "/equipments/weapon_016.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "WEAPON_017",
      name: "\u5927\u69CC",
      category: "EQUIPMENT",
      path: "/equipments/weapon_017.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "WEAPON_018",
      name: "\u53CC\u5203\u5C0F\u5200",
      category: "EQUIPMENT",
      path: "/equipments/weapon_018.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "WEAPON_019",
      name: "\u92FC\u7CF8",
      category: "EQUIPMENT",
      path: "/equipments/weapon_019.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "WEAPON_020",
      name: "\u5F37\u5F13",
      category: "EQUIPMENT",
      path: "/equipments/weapon_020.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "WEAPON_021",
      name: "\u9264\u722A",
      category: "EQUIPMENT",
      path: "/equipments/weapon_021.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "WEAPON_022",
      name: "\u5357\u86EE\u5927\u7B52",
      category: "EQUIPMENT",
      path: "/equipments/weapon_022.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "WEAPON_023",
      name: "\u75FA\u308C\u6BD2\u306E\u77ED\u5200",
      category: "EQUIPMENT",
      path: "/equipments/weapon_023.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "WEAPON_024",
      name: "\u9023\u5F29\u30FB\u75BE\u98A8",
      category: "EQUIPMENT",
      path: "/equipments/weapon_024.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "WEAPON_025",
      name: "\u7834\u57CE\u5927\u69CC",
      category: "EQUIPMENT",
      path: "/equipments/weapon_025.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "WEAPON_026",
      name: "\u4ED5\u8FBC\u307F\u5200\u300E\u9ED2\u66DC\u300F",
      category: "EQUIPMENT",
      path: "/equipments/weapon_026.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "WEAPON_027",
      name: "\u9244\u7832\u300E\u70C8\u706B\u300F",
      category: "EQUIPMENT",
      path: "/equipments/weapon_027.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "WEAPON_028",
      name: "\u5996\u5200\u300E\u5438\u8840\u300F",
      category: "EQUIPMENT",
      path: "/equipments/weapon_028.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "WEAPON_029",
      name: "\u6BD2\u4ED5\u8FBC\u307F\u77ED\u5200",
      category: "EQUIPMENT",
      path: "/equipments/weapon_029.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "WEAPON_030",
      name: "\u6563\u5F3E\u706B\u7E04\u9283\u300E\u96F7\u5EA7\u300F",
      category: "EQUIPMENT",
      path: "/equipments/weapon_030.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "WEAPON_031",
      name: "\u5927\u7B52\u300E\u68FA\u300F",
      category: "EQUIPMENT",
      path: "/equipments/weapon_031.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "WEAPON_032",
      name: "\u53CC\u77ED\u7B52",
      category: "EQUIPMENT",
      path: "/equipments/weapon_032.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "WEAPON_033",
      name: "\u5341\u624B\u300E\u91D1\u525B\u300F",
      category: "EQUIPMENT",
      path: "/equipments/weapon_033.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "WEAPON_034",
      name: "\u5FCD\u5200",
      category: "EQUIPMENT",
      path: "/equipments/weapon_034.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "WEAPON_035",
      name: "\u96A0\u3057\u77ED\u7B52",
      category: "EQUIPMENT",
      path: "/equipments/weapon_035.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "WEAPON_036",
      name: "\u5200\u300E\u5F71\u6253\u3061\u300F",
      category: "EQUIPMENT",
      path: "/equipments/weapon_036.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "WEAPON_037",
      name: "\u72D9\u6483\u706B\u7E04\u9283",
      category: "EQUIPMENT",
      path: "/equipments/weapon_037.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "WEAPON_038",
      name: "\u9244\u9264\u722A",
      category: "EQUIPMENT",
      path: "/equipments/weapon_038.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "WEAPON_039",
      name: "\u5FCD\u5F13\u300E\u9759\u5BC2\u300F",
      category: "EQUIPMENT",
      path: "/equipments/weapon_039.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "WEAPON_040",
      name: "\u86C7\u8179\u5263",
      category: "EQUIPMENT",
      path: "/equipments/weapon_040.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "WEAPON_041",
      name: "\u5927\u8EAB\u69CD",
      category: "EQUIPMENT",
      path: "/equipments/weapon_041.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "WEAPON_042",
      name: "\u9244\u62F3\u300E\u963F\u4FEE\u7F85\u300F",
      category: "EQUIPMENT",
      path: "/equipments/weapon_042.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "WEAPON_043",
      name: "\u5996\u5200\u300E\u6BD2\u86C7\u300F",
      category: "EQUIPMENT",
      path: "/equipments/weapon_043.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "WEAPON_044",
      name: "\u5200\u300E\u96FB\u5149\u77F3\u706B\u300F",
      category: "EQUIPMENT",
      path: "/equipments/weapon_044.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "WEAPON_045",
      name: "\u5927\u7B52\u300E\u7D42\u672B\u306E\u9418\u300F",
      category: "EQUIPMENT",
      path: "/equipments/weapon_045.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "WEAPON_046",
      name: "\u91D1\u7259\u306E\u77ED\u5200",
      category: "EQUIPMENT",
      path: "/equipments/weapon_046.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "WEAPON_047",
      name: "\u8C6A\u5263\u300E\u70B9\u706B\u300F",
      category: "EQUIPMENT",
      path: "/equipments/weapon_047.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_EXCLUSIVE_IMAGE"
    },
    {
      id: "WEAPON_048",
      name: "\u75BE\u98A8\u5200",
      category: "EQUIPMENT",
      path: "/equipments/weapon_048.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_EXCLUSIVE_IMAGE"
    },
    {
      id: "WEAPON_049",
      name: "\u6BD2\u86C7\u306E\u9ED2\u5203",
      category: "EQUIPMENT",
      path: "/equipments/weapon_049.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_EXCLUSIVE_IMAGE"
    },
    {
      id: "WEAPON_050",
      name: "\u652F\u914D\u8005\u306E\u9244\u6247",
      category: "EQUIPMENT",
      path: "/equipments/weapon_050.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_EXCLUSIVE_IMAGE"
    },
    {
      id: "HEAD_001",
      name: "\u6728\u7DBF\u9262\u5DFB",
      category: "EQUIPMENT",
      path: "/equipments/head_001.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "HEAD_002",
      name: "\u8D64\u5099\u3048\u9262\u5DFB",
      category: "EQUIPMENT",
      path: "/equipments/head_002.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "HEAD_003",
      name: "\u982D\u5DFE",
      category: "EQUIPMENT",
      path: "/equipments/head_003.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "HEAD_004",
      name: "\u4F5C\u696D\u7B20",
      category: "EQUIPMENT",
      path: "/equipments/head_004.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "HEAD_005",
      name: "\u52DD\u904B\u306E\u70CF\u5E3D\u5B50",
      category: "EQUIPMENT",
      path: "/equipments/head_005.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "HEAD_006",
      name: "\u5FCD\u3073\u982D\u5DFE",
      category: "EQUIPMENT",
      path: "/equipments/head_006.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "HEAD_007",
      name: "\u9ED2\u6F06\u9663\u7B20",
      category: "EQUIPMENT",
      path: "/equipments/head_007.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "HEAD_008",
      name: "\u85AC\u5E2B\u306E\u8986\u9762",
      category: "EQUIPMENT",
      path: "/equipments/head_008.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "HEAD_009",
      name: "\u9244\u515C",
      category: "EQUIPMENT",
      path: "/equipments/head_009.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "HEAD_010",
      name: "\u9060\u898B\u773C\u93E1",
      category: "EQUIPMENT",
      path: "/equipments/head_010.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "HEAD_011",
      name: "\u9244\u88FD\u9663\u7B20",
      category: "EQUIPMENT",
      path: "/equipments/head_011.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "HEAD_012",
      name: "\u591C\u898B\u306E\u9060\u773C\u93E1",
      category: "EQUIPMENT",
      path: "/equipments/head_012.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "HEAD_013",
      name: "\u9762\u982C\u30FB\u906E\u5149",
      category: "EQUIPMENT",
      path: "/equipments/head_013.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "HEAD_014",
      name: "\u9244\u9762\u982C",
      category: "EQUIPMENT",
      path: "/equipments/head_014.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "HEAD_015",
      name: "\u75BE\u98A8\u306E\u76EE\u5E87",
      category: "EQUIPMENT",
      path: "/equipments/head_015.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "HEAD_016",
      name: "\u96A0\u5BC6\u982D\u5DFE",
      category: "EQUIPMENT",
      path: "/equipments/head_016.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "HEAD_017",
      name: "\u9262\u91D1\u300E\u5343\u91CC\u773C\u300F",
      category: "EQUIPMENT",
      path: "/equipments/head_017.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "HEAD_018",
      name: "\u515C\u300E\u9632\u5841\u300F",
      category: "EQUIPMENT",
      path: "/equipments/head_018.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "HEAD_019",
      name: "\u8987\u8005\u306E\u76EE\u5E87",
      category: "EQUIPMENT",
      path: "/equipments/head_019.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "HEAD_020",
      name: "\u8276\u82B1\u306E\u9ED2\u7C2A",
      category: "EQUIPMENT",
      path: "/equipments/head_020.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_EXCLUSIVE_IMAGE"
    },
    {
      id: "BODY_001",
      name: "\u9EBB\u7FBD\u7E54",
      category: "EQUIPMENT",
      path: "/equipments/body_001.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "BODY_002",
      name: "\u6728\u7DBF\u9663\u7FBD\u7E54",
      category: "EQUIPMENT",
      path: "/equipments/body_002.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "BODY_003",
      name: "\u91CE\u826F\u7740",
      category: "EQUIPMENT",
      path: "/equipments/body_003.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "BODY_004",
      name: "\u7D79\u7FBD\u7E54",
      category: "EQUIPMENT",
      path: "/equipments/body_004.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "BODY_005",
      name: "\u9769\u80F4",
      category: "EQUIPMENT",
      path: "/equipments/body_005.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "BODY_006",
      name: "\u3086\u3063\u305F\u308A\u5C0F\u8896",
      category: "EQUIPMENT",
      path: "/equipments/body_006.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "BODY_007",
      name: "\u4E0A\u7B49\u9663\u7FBD\u7E54",
      category: "EQUIPMENT",
      path: "/equipments/body_007.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "BODY_008",
      name: "\u9ED2\u9769\u9577\u7FBD\u7E54",
      category: "EQUIPMENT",
      path: "/equipments/body_008.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "BODY_009",
      name: "\u4E8C\u679A\u80F4\u5177\u8DB3",
      category: "EQUIPMENT",
      path: "/equipments/body_009.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "BODY_010",
      name: "\u8EFD\u88C5\u5C0F\u8896",
      category: "EQUIPMENT",
      path: "/equipments/body_010.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "BODY_011",
      name: "\u6B66\u50CD\u304D\u306E\u9663\u7FBD\u7E54",
      category: "EQUIPMENT",
      path: "/equipments/body_011.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "BODY_012",
      name: "\u7DBF\u5165\u308C\u80F4\u7740",
      category: "EQUIPMENT",
      path: "/equipments/body_012.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "BODY_013",
      name: "\u98DB\u811A\u7FBD\u7E54",
      category: "EQUIPMENT",
      path: "/equipments/body_013.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "BODY_014",
      name: "\u9244\u677F\u80F4",
      category: "EQUIPMENT",
      path: "/equipments/body_014.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "BODY_015",
      name: "\u5FCD\u88C5\u675F",
      category: "EQUIPMENT",
      path: "/equipments/body_015.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "BODY_016",
      name: "\u5927\u93A7\u30FB\u525B",
      category: "EQUIPMENT",
      path: "/equipments/body_016.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "BODY_017",
      name: "\u9396\u5E37\u5B50",
      category: "EQUIPMENT",
      path: "/equipments/body_017.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "BODY_018",
      name: "\u5357\u86EE\u80F4\u7FBD\u7E54",
      category: "EQUIPMENT",
      path: "/equipments/body_018.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "BODY_019",
      name: "\u92F2\u6253\u9769\u80F4",
      category: "EQUIPMENT",
      path: "/equipments/body_019.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "BODY_020",
      name: "\u5F53\u4E16\u5177\u8DB3\u30FB\u525B\u529B",
      category: "EQUIPMENT",
      path: "/equipments/body_020.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "BODY_021",
      name: "\u75BE\u98A8\u9663\u7FBD\u7E54",
      category: "EQUIPMENT",
      path: "/equipments/body_021.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "BODY_022",
      name: "\u4E0A\u7B49\u7F85\u7D17\u9663\u7FBD\u7E54",
      category: "EQUIPMENT",
      path: "/equipments/body_022.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "BODY_023",
      name: "\u5927\u93A7\u300E\u76FE\u58C1\u300F",
      category: "EQUIPMENT",
      path: "/equipments/body_023.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "BODY_024",
      name: "\u96A0\u5BC6\u9396\u5E37\u5B50",
      category: "EQUIPMENT",
      path: "/equipments/body_024.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "BODY_025",
      name: "\u5929\u9D5E\u7D68\u306E\u9663\u7FBD\u7E54",
      category: "EQUIPMENT",
      path: "/equipments/body_025.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "BODY_026",
      name: "\u8987\u738B\u306E\u5927\u93A7",
      category: "EQUIPMENT",
      path: "/equipments/body_026.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "BODY_027",
      name: "\u86C7\u7D0B\u306E\u7D79\u5C0F\u8896",
      category: "EQUIPMENT",
      path: "/equipments/body_027.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "BODY_028",
      name: "\u6226\u59EB\u306E\u8EFD\u88C5\u5177\u8DB3",
      category: "EQUIPMENT",
      path: "/equipments/body_028.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "BODY_029",
      name: "\u7D05\u84EE\u306E\u9663\u7FBD\u7E54",
      category: "EQUIPMENT",
      path: "/equipments/body_029.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_EXCLUSIVE_IMAGE"
    },
    {
      id: "BODY_030",
      name: "\u822C\u82E5\u523A\u7E4D\u306E\u9663\u7FBD\u7E54",
      category: "EQUIPMENT",
      path: "/equipments/body_030.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_EXCLUSIVE_IMAGE"
    },
    {
      id: "LEGS_001",
      name: "\u8EFD\u88C5\u88B4",
      category: "EQUIPMENT",
      path: "/equipments/legs_001.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "LEGS_002",
      name: "\u7D99\u304E\u5F53\u3066\u88B4",
      category: "EQUIPMENT",
      path: "/equipments/legs_002.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "LEGS_003",
      name: "\u91CE\u88B4",
      category: "EQUIPMENT",
      path: "/equipments/legs_003.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "LEGS_004",
      name: "\u8349\u978B\u30FB\u75BE\u98A8",
      category: "EQUIPMENT",
      path: "/equipments/legs_004.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "LEGS_005",
      name: "\u811A\u7D46",
      category: "EQUIPMENT",
      path: "/equipments/legs_005.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "LEGS_006",
      name: "\u9769\u88B4",
      category: "EQUIPMENT",
      path: "/equipments/legs_006.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "LEGS_007",
      name: "\u5F37\u5316\u91CE\u88B4",
      category: "EQUIPMENT",
      path: "/equipments/legs_007.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "LEGS_008",
      name: "\u4F0A\u8CC0\u88B4",
      category: "EQUIPMENT",
      path: "/equipments/legs_008.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "LEGS_009",
      name: "\u7D30\u8EAB\u88B4",
      category: "EQUIPMENT",
      path: "/equipments/legs_009.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "LEGS_010",
      name: "\u4F5C\u696D\u88B4",
      category: "EQUIPMENT",
      path: "/equipments/legs_010.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "LEGS_011",
      name: "\u9632\u8B77\u91CE\u88B4",
      category: "EQUIPMENT",
      path: "/equipments/legs_011.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "LEGS_012",
      name: "\u9244\u92F2\u811A\u7D46",
      category: "EQUIPMENT",
      path: "/equipments/legs_012.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "LEGS_013",
      name: "\u5FCD\u3073\u811A\u7D46",
      category: "EQUIPMENT",
      path: "/equipments/legs_013.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "LEGS_014",
      name: "\u91CD\u88C5\u811B\u5F53",
      category: "EQUIPMENT",
      path: "/equipments/legs_014.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "LEGS_015",
      name: "\u901A\u6C17\u9396\u811A\u7D46",
      category: "EQUIPMENT",
      path: "/equipments/legs_015.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "LEGS_016",
      name: "\u92F2\u6253\u9769\u88B4",
      category: "EQUIPMENT",
      path: "/equipments/legs_016.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "LEGS_017",
      name: "\u75BE\u98A8\u8DB3\u888B\u300E\u9583\u5149\u300F",
      category: "EQUIPMENT",
      path: "/equipments/legs_017.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "LEGS_018",
      name: "\u5927\u811B\u5F53\u300E\u9632\u5841\u300F",
      category: "EQUIPMENT",
      path: "/equipments/legs_018.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "LEGS_019",
      name: "\u97CB\u99C4\u5929\u306E\u8349\u978B",
      category: "EQUIPMENT",
      path: "/equipments/legs_019.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "LEGS_020",
      name: "\u6F06\u9ED2\u306E\u5FCD\u3073\u811A\u7D46",
      category: "EQUIPMENT",
      path: "/equipments/legs_020.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_EXCLUSIVE_IMAGE"
    },
    {
      id: "ACCESSORY_001",
      name: "\u9285\u306E\u8033\u98FE\u308A",
      category: "EQUIPMENT",
      path: "/equipments/accessory_001.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "ACCESSORY_002",
      name: "\u9244\u8F2A\u306E\u6307\u74B0",
      category: "EQUIPMENT",
      path: "/equipments/accessory_002.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "ACCESSORY_003",
      name: "\u9769\u7D10\u306E\u9996\u98FE\u308A",
      category: "EQUIPMENT",
      path: "/equipments/accessory_003.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "ACCESSORY_004",
      name: "\u6B66\u904B\u306E\u6728\u672D",
      category: "EQUIPMENT",
      path: "/equipments/accessory_004.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "ACCESSORY_005",
      name: "\u75BE\u98A8\u306E\u624B\u7532\u7D10",
      category: "EQUIPMENT",
      path: "/equipments/accessory_005.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "ACCESSORY_006",
      name: "\u9280\u9396\u306E\u9996\u98FE\u308A",
      category: "EQUIPMENT",
      path: "/equipments/accessory_006.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "ACCESSORY_007",
      name: "\u771F\u936E\u306E\u8155\u8F2A",
      category: "EQUIPMENT",
      path: "/equipments/accessory_007.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "ACCESSORY_008",
      name: "\u98A8\u9234\u306E\u6839\u4ED8",
      category: "EQUIPMENT",
      path: "/equipments/accessory_008.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "ACCESSORY_009",
      name: "\u9B3C\u9762\u306E\u6839\u4ED8",
      category: "EQUIPMENT",
      path: "/equipments/accessory_009.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "ACCESSORY_010",
      name: "\u7DE8\u9769\u306E\u8155\u8F2A",
      category: "EQUIPMENT",
      path: "/equipments/accessory_010.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "ACCESSORY_011",
      name: "\u65E9\u99C6\u3051\u306E\u5B88\u308A",
      category: "EQUIPMENT",
      path: "/equipments/accessory_011.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "ACCESSORY_012",
      name: "\u9EC4\u91D1\u5927\u9396",
      category: "EQUIPMENT",
      path: "/equipments/accessory_012.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "ACCESSORY_013",
      name: "\u6B66\u529F\u306E\u5370\u5224\u6307\u8F2A",
      category: "EQUIPMENT",
      path: "/equipments/accessory_013.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "ACCESSORY_014",
      name: "\u9244\u8F2A\u306E\u9996\u98FE\u308A",
      category: "EQUIPMENT",
      path: "/equipments/accessory_014.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "ACCESSORY_015",
      name: "\u68D8\u9244\u306E\u8155\u8F2A",
      category: "EQUIPMENT",
      path: "/equipments/accessory_015.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "ACCESSORY_016",
      name: "\u5C0F\u67C4\u306E\u9996\u98FE\u308A",
      category: "EQUIPMENT",
      path: "/equipments/accessory_016.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "ACCESSORY_017",
      name: "\u52DD\u8CA0\u8CFD",
      category: "EQUIPMENT",
      path: "/equipments/accessory_017.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "ACCESSORY_018",
      name: "\u6B66\u5177\u5E2F",
      category: "EQUIPMENT",
      path: "/equipments/accessory_018.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "ACCESSORY_019",
      name: "\u9AD1\u9ACF\u9280\u8F2A",
      category: "EQUIPMENT",
      path: "/equipments/accessory_019.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "ACCESSORY_020",
      name: "\u75BE\u98A8\u306E\u8033\u98FE\u308A",
      category: "EQUIPMENT",
      path: "/equipments/accessory_020.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "ACCESSORY_021",
      name: "\u9244\u9396\u306E\u8170\u98FE\u308A",
      category: "EQUIPMENT",
      path: "/equipments/accessory_021.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "ACCESSORY_022",
      name: "\u5357\u86EE\u5341\u5B57\u5B88",
      category: "EQUIPMENT",
      path: "/equipments/accessory_022.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "ACCESSORY_023",
      name: "\u65E9\u99C6\u3051\u306E\u8B77\u7B26",
      category: "EQUIPMENT",
      path: "/equipments/accessory_023.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "ACCESSORY_024",
      name: "\u86C7\u7D0B\u8155\u8F2A",
      category: "EQUIPMENT",
      path: "/equipments/accessory_024.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "ACCESSORY_025",
      name: "\u706B\u7E04\u5F3E\u306E\u9996\u98FE\u308A",
      category: "EQUIPMENT",
      path: "/equipments/accessory_025.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "ACCESSORY_026",
      name: "\u5F62\u898B\u306E\u5B88\u888B",
      category: "EQUIPMENT",
      path: "/equipments/accessory_026.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "ACCESSORY_027",
      name: "\u767D\u91D1\u5370\u5224\u6307\u8F2A",
      category: "EQUIPMENT",
      path: "/equipments/accessory_027.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "ACCESSORY_028",
      name: "\u8170\u5DEE\u3057\u77E2\u7B52",
      category: "EQUIPMENT",
      path: "/equipments/accessory_028.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "ACCESSORY_029",
      name: "\u84BC\u7389\u306E\u6307\u8F2A",
      category: "EQUIPMENT",
      path: "/equipments/accessory_029.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "ACCESSORY_030",
      name: "\u767D\u9280\u5927\u9396",
      category: "EQUIPMENT",
      path: "/equipments/accessory_030.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "ACCESSORY_031",
      name: "\u6B7B\u795E\u306E\u9280\u5B88",
      category: "EQUIPMENT",
      path: "/equipments/accessory_031.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "ACCESSORY_032",
      name: "\u767E\u5408\u7D0B\u9996\u98FE\u308A",
      category: "EQUIPMENT",
      path: "/equipments/accessory_032.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "ACCESSORY_033",
      name: "\u9B3C\u68D8\u306E\u9996\u8F2A",
      category: "EQUIPMENT",
      path: "/equipments/accessory_033.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "ACCESSORY_034",
      name: "\u91D1\u525B\u77F3\u306E\u8B77\u8F2A",
      category: "EQUIPMENT",
      path: "/equipments/accessory_034.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "ACCESSORY_035",
      name: "\u539F\u77F3\u7FE1\u7FE0\u8155\u8F2A",
      category: "EQUIPMENT",
      path: "/equipments/accessory_035.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "ACCESSORY_036",
      name: "\u6C34\u6676\u306E\u5FA1\u5B88",
      category: "EQUIPMENT",
      path: "/equipments/accessory_036.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "ACCESSORY_037",
      name: "\u98A8\u8AAD\u307F\u306E\u8155\u8F2A",
      category: "EQUIPMENT",
      path: "/equipments/accessory_037.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "ACCESSORY_038",
      name: "\u9ED2\u7D0B\u306E\u8B77\u7B26",
      category: "EQUIPMENT",
      path: "/equipments/accessory_038.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "ACCESSORY_039",
      name: "\u9244\u67B7\u306E\u8155\u8F2A",
      category: "EQUIPMENT",
      path: "/equipments/accessory_039.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "ACCESSORY_040",
      name: "\u7D05\u7389\u91D1\u98FE\u308A",
      category: "EQUIPMENT",
      path: "/equipments/accessory_040.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "ACCESSORY_041",
      name: "\u7C60\u624B\u30FB\u525B",
      category: "EQUIPMENT",
      path: "/equipments/accessory_041.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "ACCESSORY_042",
      name: "\u86C7\u795E\u306E\u8DB3\u8F2A",
      category: "EQUIPMENT",
      path: "/equipments/accessory_042.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "ACCESSORY_043",
      name: "\u9AD1\u9ACF\u9244\u5B88",
      category: "EQUIPMENT",
      path: "/equipments/accessory_043.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "ACCESSORY_044",
      name: "\u91D1\u525B\u306E\u8155\u7532",
      category: "EQUIPMENT",
      path: "/equipments/accessory_044.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "ACCESSORY_045",
      name: "\u6708\u767D\u77F3\u306E\u895F\u98FE\u308A",
      category: "EQUIPMENT",
      path: "/equipments/accessory_045.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "ACCESSORY_046",
      name: "\u6B66\u5C06\u306E\u7FE1\u7FE0\u5B88",
      category: "EQUIPMENT",
      path: "/equipments/accessory_046.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "ACCESSORY_047",
      name: "\u6F06\u5857\u308A\u306E\u685C\u6839\u4ED8",
      category: "EQUIPMENT",
      path: "/equipments/accessory_047.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "ACCESSORY_048",
      name: "\u5BB5\u95C7\u306E\u5B9D\u73E0",
      category: "EQUIPMENT",
      path: "/equipments/accessory_048.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_GENERIC_IMAGE"
    },
    {
      id: "ACCESSORY_049",
      name: "\u904B\u547D\u306E\u8B77\u7B26",
      category: "EQUIPMENT",
      path: "/equipments/accessory_049.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_EXCLUSIVE_IMAGE"
    },
    {
      id: "ACCESSORY_050",
      name: "\u5973\u738B\u306E\u5370\u5224",
      category: "EQUIPMENT",
      path: "/equipments/accessory_050.png",
      format: "PNG",
      size: [
        341,
        341
      ],
      status: "AWAITING_EXCLUSIVE_IMAGE"
    }
  ]
};

// src/domain/redesign/masters.ts
var ELEMENTS = ["fire", "water", "earth", "wind", "light", "dark"];
var LEGACY_BATTLE_RULES = { defenseFactor: 0.45, advantageMultiplier: 1.5, disadvantageMultiplier: 0.75, spRecoveryDivisor: 120, burstLukDivisor: 20, enemySpRecoveryDivisor: 30, maxPlayerActions: 300, initialSpRatio: 0 };
var COMMON_BATTLE_RULES = { ...LEGACY_BATTLE_RULES, version: "common-v2-20260920", defenseFactor: 1 };
var BATTLE_RULES = { ...COMMON_BATTLE_RULES, version: "balance-v2-20260920", balanceV2: BALANCE_V2_CONFIG };
var power = { N: 1, R: 1.08, SR: 1.16, SSR: 1.24 };
var image = (id) => game04_master_assets_default.assets.find((a) => a.id === id)?.path ?? "/menu/event_banner_placeholder.png";
var name = (id) => sengoku_masters_default[id] ?? id;
var COMMON_CHARACTER_MASTERS = sengoku_characters_default.map((c, i) => {
  const rarity = c.sourceRarity, factor = power[rarity], role = ["\u653B\u6483", "\u5B88\u5099", "\u56DE\u5FA9", "\u652F\u63F4", "\u6280\u5DE7"][i % 5];
  return {
    id: c.characterId,
    name: c.name,
    image: c.imagePath,
    rarity,
    element: ELEMENTS[i % 6],
    role,
    stats: { hp: Math.round((950 + (i % 5 === 1 ? 300 : 0)) * factor), sp: 60 + i % 5 * 5, atk: Math.round((110 + (i % 5 === 0 ? 30 : 0)) * factor), def: Math.round((45 + (i % 5 === 1 ? 20 : 0)) * factor), luk: 20 + i % 15 },
    passive: { id: `passive_${c.characterId}`, name: ["\u6B66\u52C7\u306E\u5FC3\u5F97", "\u5B88\u52E2\u306E\u5FC3\u5F97", "\u6148\u611B\u306E\u5FC3\u5F97", "\u9663\u5F62\u306E\u5FC3\u5F97", "\u6A5F\u7565\u306E\u5FC3\u5F97"][i % 5], stat: ["atk", "def", "hp", "sp", "luk"][i % 5], percent: 2, target: "party" }
  };
});
var CHARACTER_MASTERS = COMMON_CHARACTER_MASTERS.map((old) => {
  const a = BALANCE_V2_CHARACTER_ASSIGNMENTS.find((a2) => a2.id === old.id);
  const master = { ...old, ...a ? { rarity: a.rarity, element: a.element, role: a.role } : {}, passive: void 0 };
  master.passive = getCharacterPassive(master, 0);
  return master;
});
var LEGACY_SKILL_MASTERS = skills_20260821_default.skills.filter((s) => !s.exclusive_character_id).map((s, i) => {
  const kind = i % 8, rarity = s.rarity, f = power[rarity];
  const effect = kind === 1 ? [{ type: "def_up", power: 20, duration: 3, carryAcrossWaves: false }] : kind === 2 ? [{ type: "heal", power: 120 * f }] : kind === 3 ? [{ type: "poison", power: 15, duration: 3, carryAcrossWaves: false }] : kind === 4 ? [{ type: "atk_up", power: 20, duration: 3, carryAcrossWaves: true }] : kind === 5 ? [{ type: "revive", power: 30 }] : kind === 6 ? [{ type: "def_down", power: 25, duration: 3, carryAcrossWaves: false }] : [{ type: "damage", power: (kind === 7 ? 90 : 180) * f }];
  return { id: s.skill_id, name: name(s.skill_id), image: image(s.skill_id), rarity, element: ELEMENTS[i % 6], spCost: 24 + i % 4 * 8, condition: kind === 2 ? { type: "ally_hp_below", value: 0.65 } : kind === 5 ? { type: "ally_dead" } : { type: "always" }, target: kind === 1 || kind === 4 ? "all_allies" : kind === 2 ? "lowest_ally" : kind === 5 ? "dead_ally" : kind === 7 ? "all_enemies" : "lowest_hp", effects: effect, description: ["\u6575\u5358\u4F53\u3078\u5C5E\u6027\u653B\u6483", "\u5473\u65B9\u5168\u4F53\u306E\u5B88\u5099\u3092\u5F37\u5316", "\u50B7\u3064\u3044\u305F\u5473\u65B9\u3092\u56DE\u5FA9", "\u6575\u306B\u7D99\u7D9A\u30C0\u30E1\u30FC\u30B8", "\u5473\u65B9\u5168\u4F53\u306E\u653B\u6483\u3092\u5F37\u5316", "\u6226\u95D8\u4E0D\u80FD\u306E\u5473\u65B9\u3092\u8607\u751F", "\u6575\u306E\u5B88\u5099\u3092\u4F4E\u4E0B", "\u6575\u5168\u4F53\u3078\u5C5E\u6027\u653B\u6483"][kind] };
});
function commonPreviewSkill(skill) {
  const unsupported = skill.effects.some((e) => e.type === "poison" || e.type === "sp");
  return {
    ...structuredClone(skill),
    ...unsupported ? { unsupportedReason: "\u7D99\u7D9A\u30C0\u30E1\u30FC\u30B8\u30FBSP\u88DC\u5145\u306F\u5171\u901A\u30EB\u30FC\u30EB\u672AFIX\u306E\u305F\u3081\u65B0\u6226\u95D8\u3067\u306F\u767A\u52D5\u4FDD\u7559" } : {},
    effects: skill.effects.filter((e) => e.type !== "poison" && e.type !== "sp").map((e) => ({
      ...e,
      ...e.type === "heal" ? { healingFormula: e.healingFormula ?? "caster_atk_percent" } : {},
      ...e.type === "revive" ? { healingFormula: e.healingFormula ?? "target_max_hp_percent" } : {},
      ...e.duration ? { carryAcrossWaves: true } : {}
    })),
    description: unsupported ? "\u3010\u767A\u52D5\u4FDD\u7559\u30FB\u672AFIX\u3011\u7D99\u7D9A\u30C0\u30E1\u30FC\u30B8\uFF0FSP\u88DC\u5145\u306E\u8A73\u7D30\u30EB\u30FC\u30EB\u5F85\u3061" : `${skill.description}\uFF08\u500B\u5225\u500D\u7387\u30FB\u6D88\u8CBBSP\u30FB\u56DE\u5FA9\u5F0F\u306F\u958B\u767A\u4EEE\u8A2D\u5B9A\uFF09`
  };
}
var SKILL_MASTERS = LEGACY_SKILL_MASTERS.map(commonPreviewSkill);
var COMMON_SKILL_MASTERS = SKILL_MASTERS;
function prepareBattleWaves(waves, rules) {
  const frozen = structuredClone(waves);
  if (rules.version !== "common-v2-20260920" && rules.version !== "balance-v2-20260920") return frozen;
  return frozen.map((wave) => wave.map((enemy2) => ({
    ...enemy2,
    hitSpGain: enemy2.hitSpGain ?? 5,
    skills: enemy2.skills.map(commonPreviewSkill),
    passives: enemy2.passives.filter((p) => p.stat === "atk" || p.stat === "def"),
    phases: enemy2.phases?.map((phase) => ({ ...phase, skills: phase.skills?.map(commonPreviewSkill) }))
  })));
}
var EQUIPMENT_MASTERS = equipment_20260821_default.equipments.filter((e) => !e.exclusive_character_id).map((e) => {
  const rarity = e.rarity, f = power[rarity], slot = e.category === "WEAPON" ? "weapon" : e.category === "HEAD" ? "head" : e.category === "BODY" ? "body" : e.category === "LEGS" ? "legs" : "accessory1";
  return { id: e.equipment_id, name: name(e.equipment_id), image: image(e.equipment_id), rarity, slot, stats: { hp: slot === "body" ? Math.round(80 * f) : 0, sp: slot === "accessory1" ? 5 : 0, atk: slot === "weapon" ? Math.round(16 * f) : 0, def: slot === "head" || slot === "legs" ? Math.round(8 * f) : 0, luk: slot === "accessory1" ? 3 : 0 } };
});
function getSkillSlots(awakening) {
  return awakening >= 3 ? 3 : awakening >= 1 ? 2 : 1;
}
function getLegacyCharacterStats(master, level, awakening) {
  return Object.fromEntries(Object.entries(master.stats).map(([k, v]) => [k, Math.round(v * (1 + (Math.max(1, level) - 1) * 0.055) * (awakening >= 4 ? 1 + (awakening - 3) * 0.1 : 1))]));
}
function getCharacterStats(master, level, awakening) {
  const stats = getLegacyCharacterStats(master, level, awakening);
  if (master.role.includes("\u653B\u6483") && !master.role.includes("\u652F\u63F4")) {
    const anchors = BALANCE_V2_ATTACK_ANCHORS[master.rarity];
    stats.hp = interpolatePreviewAnchor(level, [1, 50, 100], anchors.hp);
    stats.def = interpolatePreviewAnchor(level, [1, 50, 100], anchors.def);
    stats.atk = interpolatePreviewAnchor(level, [1, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100], anchors.atk);
  }
  return stats;
}
function getEquipmentStats(master, level, lb) {
  return Object.fromEntries(Object.entries(master.stats).map(([k, v]) => [k, Math.round(v * (1 + (Math.max(1, level) - 1) * 0.04) * (1 + lb * 0.1))]));
}
function buildBattleParty(state, rules = BATTLE_RULES) {
  return state.deck.map((member) => {
    const owned = state.characters.find((c) => c.id === member.characterId), master = (rules.version === "balance-v2-20260920" ? CHARACTER_MASTERS : COMMON_CHARACTER_MASTERS).find((c) => c.id === member.characterId);
    if (!owned || !master) throw new Error("\u7DE8\u6210\u30AD\u30E3\u30E9\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093");
    const stats = (rules.version === "balance-v2-20260920" ? getCharacterStats : getLegacyCharacterStats)(master, owned.level, owned.awakening);
    for (const instanceId of Object.values(member.equipment)) {
      const e = state.equipment.find((e2) => e2.instanceId === instanceId), m = EQUIPMENT_MASTERS.find((m2) => m2.id === e?.masterId);
      if (e && m) {
        const bonus = getEquipmentStats(m, e.level, e.lb);
        for (const key2 of Object.keys(stats)) stats[key2] += bonus[key2];
      }
    }
    return { id: master.id, name: master.name, image: master.image, level: owned.level, element: master.element, stats, skills: member.skillIds.slice(0, getSkillSlots(owned.awakening)).map((id) => {
      const s = (rules.version === "common-v2-20260920" || rules.version === "balance-v2-20260920" ? SKILL_MASTERS : LEGACY_SKILL_MASTERS).find((s2) => s2.id === id), o = state.skills.find((s2) => s2.id === id);
      if (!s || !o) throw new Error("\u672A\u6240\u6301\u306E\u30B9\u30AD\u30EB\u3067\u3059");
      return { ...s, effects: s.effects.map((e) => ({ ...e, power: e.power * (1 + o.level * 0.05) })) };
    }), passives: rules.version === "balance-v2-20260920" ? getCharacterPassive(master, owned.awakening) ? [getCharacterPassive(master, owned.awakening)] : [] : master.passive && (rules.version !== "common-v2-20260920" || master.passive.stat === "atk" || master.passive.stat === "def") ? [{ ...master.passive, level: owned.awakening * 2, percent: master.passive.percent * (1 + owned.awakening * 2) }] : [] };
  });
}
function createInitialState(userId) {
  const starters = CHARACTER_MASTERS.filter((c) => c.rarity === "N").slice(0, 5);
  return { userId, version: 0, cash: 0, diamonds: 0, energy: 0, energyMax: 50, souls: {}, characters: starters.map((c) => ({ id: c.id, level: 1, awakening: 0, exp: 0, growthVersion: GROWTH_VERSION })), skills: SKILL_MASTERS.slice(0, 8).map((s) => ({ id: s.id, level: 0 })), equipment: [], deck: starters.map((c, i) => ({ characterId: c.id, skillIds: [SKILL_MASTERS[i % SKILL_MASTERS.length].id], equipment: {} })), materials: { character: 20, skill: 10, equipment: 20, equipmentLb: 5, unlock: 1 }, clearedStages: [], vipExpiresAt: null };
}
function importLegacyAssets(original, legacy) {
  const state = structuredClone(original);
  state.souls ??= {};
  const ledger = new Set(state.legacyImportedIds ?? []);
  for (const c of legacy.characters) {
    const key2 = `character:${c.id}`;
    if (ledger.has(key2) || !CHARACTER_MASTERS.some((m) => m.id === c.character_id)) continue;
    const owned = state.characters.find((m) => m.id === c.character_id);
    if (owned) {
      owned.level = Math.max(owned.level, c.level);
      owned.awakening = Math.max(owned.awakening, Math.min(5, c.awakening_level));
      state.souls[c.character_id] = (state.souls[c.character_id] ?? 0) + 10;
    } else state.characters.push({ id: c.character_id, level: c.level, awakening: Math.min(5, c.awakening_level) });
    ledger.add(key2);
  }
  for (const s of legacy.skills) {
    const key2 = `skill:${s.id}`;
    if (ledger.has(key2) || !SKILL_MASTERS.some((m) => m.id === s.skill_card_id)) continue;
    const owned = state.skills.find((m) => m.id === s.skill_card_id);
    if (owned) {
      owned.level = Math.max(owned.level, Math.min(10, s.plus_val));
      state.materials.skill += 2;
    } else state.skills.push({ id: s.skill_card_id, level: Math.min(10, s.plus_val) });
    ledger.add(key2);
  }
  for (const e of legacy.equipment) {
    const key2 = `equipment:${e.id}`;
    if (ledger.has(key2) || !EQUIPMENT_MASTERS.some((m) => m.id === e.equipment_id)) continue;
    state.equipment.push({ instanceId: e.id, masterId: e.equipment_id, level: e.level, lb: e.plus_val });
    ledger.add(key2);
  }
  state.legacyImportedIds = [...ledger];
  return state;
}
function buildInitialState(userId, legacy) {
  return importLegacyAssets(createInitialState(userId), legacy);
}
function grantReward(original, reward, instanceId, acquisitionMaster = PREVIEW_ACQUISITION_MASTER) {
  if (isGrowthRewardKind(reward.kind)) {
    if (!reward.id) throw new Error("\u80B2\u6210\u5831\u916CID\u304C\u5FC5\u8981\u3067\u3059");
    return grantGrowthReward(original, { kind: reward.kind, id: reward.id, amount: reward.amount });
  }
  const state = structuredClone(original);
  const amount = reward.amount;
  if (!Number.isSafeInteger(amount) || amount < 0) throw new Error("\u5831\u916C\u6570\u91CF\u304C\u4E0D\u6B63\u3067\u3059");
  if (reward.kind === "character" || reward.kind === "skill" || reward.kind === "equipment") {
    if (!reward.id || !instanceId) throw new Error("\u7372\u5F97\u30A4\u30D9\u30F3\u30C8ID\u304C\u5FC5\u8981\u3067\u3059");
    return applyAcquisitionEvents(state, Array.from({ length: amount }, (_, i) => ({ id: `reward:${instanceId}:${i}`, kind: reward.kind, masterId: reward.id, instanceId: amount === 1 ? instanceId : `${instanceId}:${i}` })), acquisitionMaster);
  }
  switch (reward.kind) {
    case "cash":
      state.cash += amount;
      break;
    case "character_material":
      state.materials.character += amount;
      break;
    case "skill_material":
      state.materials.skill += amount;
      break;
    case "equipment_material":
      state.materials.equipment += amount;
      break;
    case "equipment_lb":
      state.materials.equipmentLb += amount;
      break;
    case "unlock_item":
      state.materials.unlock += amount;
      break;
    case "soul":
      if (reward.id) {
        state.souls ??= {};
        state.souls[reward.id] = (state.souls[reward.id] ?? 0) + amount;
      }
      break;
  }
  return state;
}

// src/domain/redesign/normalGacha.ts
var NORMAL_GACHA_MASTER = {
  version: "GROWTH_FIXED_20260921",
  singleCost: 1e3,
  dailyFreeCount: 10,
  // Existing daily contract: Asia/Tokyo midnight. Within-rarity pool rows remain uniform.
  buckets: [
    ["N", "CHARACTER", 980],
    ["N", "SKILL", 1470],
    ["N", "EQUIPMENT", 2450],
    ["R", "CHARACTER", 800],
    ["R", "SKILL", 1200],
    ["R", "EQUIPMENT", 2e3],
    ["SR", "CHARACTER", 200],
    ["SR", "SKILL", 300],
    ["SR", "EQUIPMENT", 500],
    ["SSR", "CHARACTER", 20],
    ["SSR", "SKILL", 30],
    ["SSR", "EQUIPMENT", 50]
  ]
};
var sources = { CHARACTER: "CHAR_NORMAL", SKILL: "SKILL_NORMAL", EQUIPMENT: "EQUIP_NORMAL" };
var masters = { CHARACTER: CHARACTER_MASTERS, SKILL: SKILL_MASTERS, EQUIPMENT: EQUIPMENT_MASTERS };
function normalGachaDay(now) {
  return new Date(now + 9 * 36e5).toISOString().slice(0, 10);
}
function normalGachaPool(pool) {
  const rows = pool.filter((row) => sources[row.item_type] === row.gacha_id).map((row) => {
    const group = masters[row.item_type];
    const master = group?.find((item) => item.id === row.item_id);
    if (!master) throw new Error("\u6392\u51FA\u5BFE\u8C61\u306E\u63A5\u7D9A\u3092\u78BA\u8A8D\u3067\u304D\u307E\u305B\u3093\u3002\u6D88\u8CBB\u306F\u884C\u3044\u307E\u305B\u3093\u3002");
    return { ...row, rarity: master.rarity };
  });
  for (const [rarity, kind] of NORMAL_GACHA_MASTER.buckets) {
    const bucket = rows.filter((row) => row.rarity === rarity && row.item_type === kind);
    if (!bucket.length || bucket.some((row) => !masters[kind].some((master) => master.id === row.item_id))) throw new Error("\u6392\u51FA\u5BFE\u8C61\u306E\u63A5\u7D9A\u3092\u78BA\u8A8D\u3067\u304D\u307E\u305B\u3093\u3002\u6D88\u8CBB\u306F\u884C\u3044\u307E\u305B\u3093\u3002");
  }
  return rows;
}
function applyNormalGacha(original, payload, pool, requestId, now, policy, random) {
  const count = payload.count;
  if (count !== 1 && count !== 10) throw new Error("\u56DE\u6570\u304C\u4E0D\u6B63\u3067\u3059\u3002");
  if (payload.currency !== "CASH" && payload.currency !== "FREE") throw new Error("\u652F\u6255\u65B9\u6CD5\u304C\u4E0D\u6B63\u3067\u3059\u3002");
  const rows = normalGachaPool(pool);
  const free = payload.currency === "FREE";
  let state = structuredClone(original);
  if (free && (count !== 10 || state.dailyNormalGachaDate === normalGachaDay(now))) throw new Error("\u672C\u65E5\u306E\u7121\u659910\u9023\u306F\u5229\u7528\u6E08\u307F\u3067\u3059\u3002");
  const cost = free ? 0 : NORMAL_GACHA_MASTER.singleCost * count;
  if (state.cash < cost) throw new Error("\u92AD\u304C\u4E0D\u8DB3\u3057\u3066\u3044\u307E\u3059\u3002");
  state.cash -= cost;
  if (free) state.dailyNormalGachaDate = normalGachaDay(now);
  const results = [];
  const draw = () => {
    const value = random();
    if (!(value >= 0 && value < 1)) throw new Error("\u62BD\u9078\u5024\u304C\u4E0D\u6B63\u3067\u3059\u3002");
    return value;
  };
  for (let i = 0; i < count; i++) {
    let roll = draw() * 1e4;
    const bucket = NORMAL_GACHA_MASTER.buckets.find((b) => {
      roll -= b[2];
      return roll < 0;
    });
    const choices = rows.filter((row2) => row2.rarity === bucket[0] && row2.item_type === bucket[1]);
    const row = choices[Math.floor(draw() * choices.length)];
    const master = masters[bucket[1]].find((m) => m.id === row.item_id);
    const kind = bucket[1].toLowerCase();
    const beforeSouls = state.souls[row.item_id] ?? 0, beforeMaterial = state.materials.skill;
    const existed = kind === "character" ? state.characters.some((c) => c.id === row.item_id) : kind === "skill" ? state.skills.some((s) => s.id === row.item_id) : false;
    const eventId = `normal_gacha:${requestId}:${i}`;
    const acquired = applyAcquisitionEvents(state, [{ id: eventId, kind, masterId: row.item_id, instanceId: eventId }], policy);
    state = acquired;
    if (!acquired.appliedAcquisitionIds?.includes(eventId)) throw new Error("\u7372\u5F97\u8CC7\u7523\u306E\u63A5\u7D9A\u3092\u78BA\u8A8D\u3067\u304D\u307E\u305B\u3093\u3002\u6D88\u8CBB\u306F\u884C\u3044\u307E\u305B\u3093\u3002");
    results.push({
      id: row.item_id,
      kind,
      rarity: row.rarity,
      name: master.name,
      image: master.image,
      outcome: kind === "equipment" ? "\u88C5\u5099\u3092\u500B\u4F53\u3067\u7372\u5F97" : !existed ? "\u65B0\u898F\u7372\u5F97" : kind === "character" ? `\u56FA\u6709\u9B42 +${state.souls[row.item_id] - beforeSouls}` : `\u30B9\u30AD\u30EBLB\u7D20\u6750 +${state.materials.skill - beforeMaterial}`
    });
  }
  return { state, results, cost, masterVersion: NORMAL_GACHA_MASTER.version };
}

// src/domain/redesign/growth.ts
var GROWTH_PREVIEW_RULES = { characterLevelCaps: [50, 60, 70, 80, 90, 100], skillMax: 10, equipmentLevelCap: 100, equipmentLbMax: 10 };
var EQUIPMENT_SLOTS = ["weapon", "head", "body", "legs", "accessory1", "accessory2"];
var getCharacterLevelCap = (awakening) => GROWTH_PREVIEW_RULES.characterLevelCaps[Math.max(0, Math.min(5, awakening))];
var requireValue = (condition, message) => {
  if (!condition) throw new Error(message);
};
function isEquipmentAssigned(state, id) {
  return state.deck.some((m) => Object.values(m.equipment).includes(id));
}
function equipmentFits(slot, masterSlot) {
  return slot.startsWith("accessory") ? masterSlot.startsWith("accessory") : slot === masterSlot;
}
function validateDeck(state, deck) {
  requireValue(Array.isArray(deck) && deck.length === 5, "\u6B66\u5C06\u30925\u4EBA\u7DE8\u6210\u3057\u3066\u304F\u3060\u3055\u3044\u3002");
  requireValue(new Set(deck.map((m) => m.characterId)).size === deck.length, "\u540C\u3058\u6B66\u5C06\u306F\u7DE8\u6210\u3067\u304D\u307E\u305B\u3093\u3002");
  const usedEquipment = /* @__PURE__ */ new Set();
  for (const member of deck) {
    const owned = state.characters.find((c) => c.id === member.characterId);
    requireValue(owned && owned.level > 0, "\u672A\u6240\u6301\u306E\u6B66\u5C06\u3067\u3059\u3002");
    requireValue(Array.isArray(member.skillIds) && member.skillIds.length <= getSkillSlots(owned.awakening), "\u30B9\u30AD\u30EB\u67A0\u304C\u4E0D\u8DB3\u3057\u3066\u3044\u307E\u3059\u3002");
    requireValue(new Set(member.skillIds).size === member.skillIds.length, "\u540C\u3058\u6B66\u5C06\u306B\u540C\u4E00\u30B9\u30AD\u30EB\u306F\u88C5\u5099\u3067\u304D\u307E\u305B\u3093\u3002");
    requireValue(member.skillIds.every((id) => state.skills.some((s) => s.id === id)), "\u672A\u6240\u6301\u306E\u30B9\u30AD\u30EB\u3067\u3059\u3002");
    requireValue(member.equipment && typeof member.equipment === "object", "\u88C5\u5099\u8A2D\u5B9A\u3092\u78BA\u8A8D\u3057\u3066\u304F\u3060\u3055\u3044\u3002");
    for (const [slot, id] of Object.entries(member.equipment)) {
      requireValue(EQUIPMENT_SLOTS.includes(slot), "\u88C5\u5099\u90E8\u4F4D\u304C\u4E0D\u6B63\u3067\u3059\u3002");
      const equipment = state.equipment.find((e) => e.instanceId === id);
      const master = EQUIPMENT_MASTERS.find((e) => e.id === equipment?.masterId);
      requireValue(equipment && master && equipmentFits(slot, master.slot), "\u88C5\u5099\u3068\u90E8\u4F4D\u304C\u4E00\u81F4\u3057\u307E\u305B\u3093\u3002");
      requireValue(!usedEquipment.has(id), "\u540C\u3058\u88C5\u5099\u3092\u8907\u6570\u306E\u67A0\u3078\u88C5\u5099\u3067\u304D\u307E\u305B\u3093\u3002");
      usedEquipment.add(id);
    }
  }
}
var integer = (value, label) => {
  requireValue(typeof value === "number" && Number.isSafeInteger(value) && value >= 0, `${label}\u304C\u4E0D\u6B63\u3067\u3059\u3002`);
  return value;
};
var getEquipmentLevelCap = (lb) => 50 + Math.max(0, Math.min(10, lb)) * 5;
function quoteLevelGrowth(state, kind, id, items = {}) {
  const owned = kind === "character" ? state.characters.find((c) => c.id === id) : state.equipment.find((e) => e.instanceId === id);
  const master = kind === "character" ? CHARACTER_MASTERS.find((c) => c.id === id) : EQUIPMENT_MASTERS.find((e) => e.id === state.equipment.find((o) => o.instanceId === id)?.masterId);
  requireValue(owned && master, "\u80B2\u6210\u5BFE\u8C61\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093\u3002");
  const levelBefore = owned.level;
  requireValue(owned.growthVersion === GROWTH_VERSION || levelBefore === 1 && (owned.exp === void 0 || owned.exp === 0), "\u65E7\u80B2\u6210\u30C7\u30FC\u30BF\u306E\u79FB\u884C\u78BA\u8A8D\u5F85\u3061\u3067\u3059\u3002\u73FE\u5728Lv\u30FBEXP\u306F\u4FDD\u6301\u3057\u3066\u3044\u307E\u3059\u3002");
  const levelCap = kind === "character" ? getCharacterLevelCap(owned.awakening) : getEquipmentLevelCap(owned.lb);
  requireValue(levelBefore < levelCap, "\u89E3\u653E\u6E08\u307FLv\u4E0A\u9650\u3067\u3059\u3002");
  const expBefore = owned.exp ?? 0, threshold = cumulativeExp(kind, master.rarity, levelBefore);
  requireValue(Number.isSafeInteger(expBefore) && expBefore >= threshold && expBefore < cumulativeExp(kind, master.rarity, levelBefore + 1), "Lv\u30FBEXP\u306E\u79FB\u884C\u78BA\u8A8D\u304C\u5FC5\u8981\u3067\u3059\u3002");
  const inventory = state.growthInventory ?? emptyGrowthInventory();
  const carryBefore = integer(inventory.carryExp[kind], "\u7E70\u8D8AEXP");
  const room = cumulativeExp(kind, master.rarity, levelCap) - expBefore;
  let applied = Math.min(room, carryBefore), carryAfter = carryBefore - applied;
  const consumedItems = { small: 0, medium: 0, large: 0, xlarge: 0 };
  for (const size of EXP_SIZES) {
    const selected = integer(items[size] ?? 0, "\u6295\u5165\u500B\u6570");
    requireValue(selected <= inventory.expItems[kind][size], "EXP\u30A2\u30A4\u30C6\u30E0\u304C\u4E0D\u8DB3\u3057\u3066\u3044\u307E\u3059\u3002");
    if (applied >= room) continue;
    const used = Math.min(selected, Math.ceil((room - applied) / EXP_VALUES[size]));
    consumedItems[size] = used;
    const value = used * EXP_VALUES[size];
    requireValue(Number.isSafeInteger(value), "\u6295\u5165\u500B\u6570\u304C\u5927\u304D\u3059\u304E\u307E\u3059\u3002");
    const accepted = Math.min(room - applied, value);
    applied += accepted;
    carryAfter += value - accepted;
  }
  requireValue(applied > 0, "EXP\u30A2\u30A4\u30C6\u30E0\u307E\u305F\u306F\u7E70\u8D8AEXP\u3092\u9078\u629E\u3057\u3066\u304F\u3060\u3055\u3044\u3002");
  const expAfter = expBefore + applied;
  let levelAfter = levelBefore;
  while (levelAfter < levelCap && expAfter >= cumulativeExp(kind, master.rarity, levelAfter + 1)) levelAfter++;
  const cash = cumulativeCash(kind, master.rarity, levelAfter) - cumulativeCash(kind, master.rarity, levelBefore);
  return { levelBefore, levelAfter, expBefore, expAfter, cash, consumedItems, carryBefore, carryAfter, levelCap };
}
function applyGrowthAction(input, action, payload) {
  const state = structuredClone(input);
  if (action === "save_deck") {
    validateDeck(state, payload.deck);
    state.deck = structuredClone(payload.deck);
    return state;
  }
  if (action === "character_level" || action === "equipment_level") {
    const kind = action === "character_level" ? "character" : "equipment";
    const id = String(payload.characterId ?? payload.instanceId ?? "");
    const items = payload.items;
    requireValue(items === void 0 || items !== null && typeof items === "object" && !Array.isArray(items), "EXP\u500B\u6570\u3092\u78BA\u8A8D\u3057\u3066\u304F\u3060\u3055\u3044\u3002");
    const quote = quoteLevelGrowth(state, kind, id, items ?? {});
    requireValue(state.cash >= quote.cash, "\u92AD\u304C\u4E0D\u8DB3\u3057\u3066\u3044\u307E\u3059\u3002\u9078\u629E\u6570\u3092\u5909\u66F4\u3057\u3066\u304F\u3060\u3055\u3044\u3002");
    const inventory = state.growthInventory ??= emptyGrowthInventory();
    for (const size of EXP_SIZES) inventory.expItems[kind][size] -= quote.consumedItems[size];
    inventory.carryExp[kind] = quote.carryAfter;
    state.cash -= quote.cash;
    const owned = kind === "character" ? state.characters.find((c) => c.id === id) : state.equipment.find((e) => e.instanceId === id);
    owned.level = quote.levelAfter;
    owned.exp = quote.expAfter;
    owned.growthVersion = GROWTH_VERSION;
    return state;
  }
  if (["character_unlock", "character_awaken", "soul_exchange", "soul_select"].includes(action)) {
    const id = String(payload.characterId ?? ""), master = CHARACTER_MASTERS.find((c) => c.id === id), owned = state.characters.find((c) => c.id === id);
    requireValue(master, "\u6B66\u5C06\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093\u3002");
    const rarity = master.rarity;
    const inventory = state.growthInventory ??= emptyGrowthInventory();
    if (action === "character_unlock") {
      requireValue(!owned, "\u3053\u306E\u6B66\u5C06\u306F\u65E2\u306B\u6240\u6301\u3057\u3066\u3044\u307E\u3059\u3002");
      const cost = SOUL_UNLOCK[rarity];
      requireValue((state.souls[id] ?? 0) >= cost, "\u56FA\u6709\u9B42\u304C\u4E0D\u8DB3\u3057\u3066\u3044\u307E\u3059\u3002\u6C4E\u7528\u9B42\u306F\u521D\u56DE\u89E3\u653E\u306B\u4F7F\u3048\u307E\u305B\u3093\u3002");
      state.souls[id] -= cost;
      state.characters.push({ id, level: 1, awakening: 0, exp: 0, growthVersion: GROWTH_VERSION });
    } else if (action === "soul_exchange") {
      const amount = integer(payload.amount, "\u4EA4\u63DB\u6570");
      requireValue(amount > 0 && amount % 2 === 0, "\u56FA\u6709\u9B42\u30922\u500B\u5358\u4F4D\u3067\u6307\u5B9A\u3057\u3066\u304F\u3060\u3055\u3044\u3002");
      requireValue((state.souls[id] ?? 0) >= amount, "\u56FA\u6709\u9B42\u304C\u4E0D\u8DB3\u3057\u3066\u3044\u307E\u3059\u3002");
      state.souls[id] -= amount;
      inventory.genericSouls[rarity] += amount / 2;
    } else if (action === "soul_select") {
      const amount = integer(payload.amount ?? 1, "\u9078\u629E\u5F0F\u30A2\u30A4\u30C6\u30E0\u6570");
      requireValue(amount > 0 && owned && owned.awakening < 5, "\u540C\u30EC\u30A2\u30EA\u30C6\u30A3\u306E\u6240\u6301\u30FB\u672A\u6700\u5927\u899A\u9192\u6B66\u5C06\u3092\u9078\u629E\u3057\u3066\u304F\u3060\u3055\u3044\u3002");
      requireValue(inventory.soulSelectors[rarity] >= amount, "\u9078\u629E\u5F0F\u30A2\u30A4\u30C6\u30E0\u304C\u4E0D\u8DB3\u3057\u3066\u3044\u307E\u3059\u3002");
      inventory.soulSelectors[rarity] -= amount;
      state.souls[id] = (state.souls[id] ?? 0) + amount * 10;
    } else {
      requireValue(owned && owned.awakening < 5, "\u672A\u6240\u6301\u307E\u305F\u306F\u6700\u5927\u899A\u9192\u3067\u3059\u3002");
      const cost = AWAKENING_SOULS[rarity][owned.awakening];
      const specific = integer(payload.specificSouls ?? Math.min(state.souls[id] ?? 0, cost), "\u56FA\u6709\u9B42");
      const generic = integer(payload.genericSouls ?? cost - specific, "\u6C4E\u7528\u9B42");
      requireValue(specific + generic === cost, "\u9B42\u306E\u5408\u8A08\u5FC5\u8981\u6570\u304C\u4E00\u81F4\u3057\u307E\u305B\u3093\u3002");
      requireValue((state.souls[id] ?? 0) >= specific && inventory.genericSouls[rarity] >= generic && state.cash >= cost * 2e3, "\u9B42\u307E\u305F\u306F\u92AD\u304C\u4E0D\u8DB3\u3057\u3066\u3044\u307E\u3059\u3002");
      state.souls[id] = (state.souls[id] ?? 0) - specific;
      inventory.genericSouls[rarity] -= generic;
      state.cash -= cost * 2e3;
      owned.awakening++;
    }
    return state;
  }
  if (action === "skill_level") {
    const owned = state.skills.find((s) => s.id === payload.skillId), master = SKILL_MASTERS.find((s) => s.id === payload.skillId);
    requireValue(owned && master && owned.level < 10, "\u672A\u6240\u6301\u307E\u305F\u306F\u6700\u5927LB\u3067\u3059\u3002");
    const cost = LB_STEPS[owned.level] * SKILL_LB_FACTORS[master.rarity];
    requireValue(state.materials.skill >= cost && state.cash >= cost * 1e3, "\u30B9\u30AD\u30EBLB\u7D20\u6750\u307E\u305F\u306F\u92AD\u304C\u4E0D\u8DB3\u3057\u3066\u3044\u307E\u3059\u3002");
    state.materials.skill -= cost;
    state.cash -= cost * 1e3;
    owned.level++;
    return state;
  }
  if (action === "equipment_lb") {
    const owned = state.equipment.find((e) => e.instanceId === payload.instanceId), master = EQUIPMENT_MASTERS.find((e) => e.id === owned?.masterId);
    requireValue(owned && master && owned.lb < 10, "\u672A\u6240\u6301\u307E\u305F\u306F\u6700\u5927LB\u3067\u3059\u3002");
    const cost = LB_STEPS[owned.lb] * EQUIPMENT_LB_FACTORS[master.rarity];
    requireValue(state.materials.equipmentLb >= cost && state.cash >= cost * 500, "\u88C5\u5099LB\u7D20\u6750\u307E\u305F\u306F\u92AD\u304C\u4E0D\u8DB3\u3057\u3066\u3044\u307E\u3059\u3002");
    state.materials.equipmentLb -= cost;
    state.cash -= cost * 500;
    owned.lb++;
    return state;
  }
  if (action === "equipment_dismantle") {
    const ids = payload.instanceIds;
    requireValue(Array.isArray(ids) && ids.length > 0 && new Set(ids).size === ids.length, "\u5206\u89E3\u3059\u308B\u88C5\u5099\u3092\u9078\u629E\u3057\u3066\u304F\u3060\u3055\u3044\u3002");
    let material = 0;
    for (const id of ids) {
      const owned = state.equipment.find((e) => e.instanceId === id), master = EQUIPMENT_MASTERS.find((e) => e.id === owned?.masterId);
      requireValue(owned && master && !owned.locked && !isEquipmentAssigned(state, id), "\u88C5\u5099\u4E2D\u30FB\u30ED\u30C3\u30AF\u4E2D\u306E\u88C5\u5099\u306F\u5206\u89E3\u3067\u304D\u307E\u305B\u3093\u3002");
      requireValue(owned.level === 1 && owned.lb === 0 && !(owned.exp ?? 0) || payload.confirmTrained === true, "\u80B2\u6210\u6E08\u307F\u88C5\u5099\u306E\u5206\u89E3\u78BA\u8A8D\u304C\u5FC5\u8981\u3067\u3059\u3002\u6295\u5165\u8CC7\u6E90\u306F\u8FD4\u9084\u3055\u308C\u307E\u305B\u3093\u3002");
      material += DISMANTLE_MATERIALS[master.rarity];
    }
    state.equipment = state.equipment.filter((e) => !ids.includes(e.instanceId));
    state.materials.equipmentLb += material;
    return state;
  }
  throw new Error("\u5BFE\u5FDC\u3057\u3066\u3044\u306A\u3044\u80B2\u6210\u64CD\u4F5C\u3067\u3059\u3002");
}

// src/domain/redesign/quests.ts
var AREAS = [
  ["mikawa", "\u4E09\u6CB3\u306E\u5730", "\u6700\u521D\u306E\u4E00\u6B69", "\u6575\u306E\u5C5E\u6027\u3068\u884C\u52D5\u30AB\u30A6\u30F3\u30C8\u3092\u898B\u3066\u3001\u6B66\u5C06\u306E\u4E26\u3073\u3092\u6574\u3048\u3088\u3046\u3002"],
  ["owari", "\u5C3E\u5F35\u306E\u65D7", "\u71B1\u304D\u65D7\u5370", "\u8907\u6570\u306E\u6575\u306B\u306F\u5168\u4F53\u653B\u6483\u3068\u72D9\u3046\u9806\u756A\u304C\u529B\u306B\u306A\u308B\u3002"],
  ["mino", "\u7F8E\u6FC3\u306E\u57CE", "\u5805\u57CE\u3078\u306E\u9053", "\u5805\u3044\u5B88\u308A\u306B\u306F\u5B88\u5099\u3092\u4E0B\u3052\u308B\u6280\u3092\u7D44\u307F\u5408\u308F\u305B\u3088\u3046\u3002"],
  ["omi", "\u8FD1\u6C5F\u306E\u6E56", "\u6E56\u4E0A\u306E\u76DF\u7D04", "\u50B7\u3064\u3044\u305F\u4EF2\u9593\u3092\u56DE\u5FA9\u3057\u3001\u9023\u6226\u3092\u5207\u308A\u629C\u3051\u3088\u3046\u3002"],
  ["kai", "\u7532\u6590\u306E\u5C71", "\u98A8\u6797\u306E\u8A66\u7DF4", "\u5F37\u3044\u4E00\u6483\u306B\u5099\u3048\u3001\u5B88\u308A\u3068\u653B\u6483\u306E\u9806\u3092\u8003\u3048\u3088\u3046\u3002"],
  ["echigo", "\u8D8A\u5F8C\u306E\u96EA", "\u96EA\u89E3\u3051\u306E\u7FA9", "\u6575\u306E\u56DE\u5FA9\u5F79\u3092\u3069\u3046\u5D29\u3059\u304B\u304C\u52DD\u6557\u3092\u5206\u3051\u308B\u3002"],
  ["kyoto", "\u4EAC\u6D1B\u306E\u5F71", "\u82B1\u3068\u7B56\u8B00", "\u5F31\u4F53\u3068\u7D99\u7D9A\u30C0\u30E1\u30FC\u30B8\u3092\u898B\u6975\u3081\u3001\u65E9\u3081\u306B\u6C7A\u7740\u3092\u3064\u3051\u3088\u3046\u3002"],
  ["izumo", "\u51FA\u96F2\u306E\u793E", "\u7948\u308A\u306E\u5411\u3053\u3046", "\u5149\u3068\u95C7\u306E\u76F8\u6027\u3001\u652F\u63F4\u6280\u306E\u7D44\u307F\u5408\u308F\u305B\u3092\u898B\u76F4\u305D\u3046\u3002"],
  ["satsuma", "\u85A9\u6469\u306E\u708E", "\u4E0D\u5C48\u306E\u9663", "\u9023\u6226\u306B\u5099\u3048\u3066HP\u3068SP\u3092\u6B8B\u3057\u3001\u6575\u9663\u3092\u7A81\u7834\u3057\u3088\u3046\u3002"],
  ["sekigahara", "\u95A2\u30F6\u539F", "\u6681\u306E\u7D04\u675F", "\u5909\u308F\u308A\u3086\u304F\u6575\u306E\u9663\u3092\u8AAD\u307F\u3001\u4E94\u4EBA\u306E\u529B\u3092\u7D50\u96C6\u3057\u3088\u3046\u3002"]
];
var STAGE_NAMES = ["\u8857\u9053\u306E\u5148\u3078", "\u65D7\u3092\u63B2\u3052\u3066", "\u6E21\u308A\u306E\u9663", "\u591C\u660E\u3051\u306E\u653B\u9632", "\u5D29\u308C\u306C\u8A93\u3044", "\u6C7A\u6226\u524D\u591C", "\u57CE\u9580\u3092\u8D8A\u3048\u3066"];
function themeSkills(area, source) {
  const effect = ["damage", "damage", "def_up", "heal", "atk_up", "heal", "poison", "atk_down", "def_up", "damage"][area];
  const chosen = COMMON_SKILL_MASTERS.find((s) => s.effects.some((e) => e.type === effect));
  return chosen ? [chosen, ...source.filter((s) => s.id !== chosen.id)].slice(0, 2) : source.slice(0, 2);
}
function enemy(area, stage, wave, slot, boss2) {
  const master = COMMON_CHARACTER_MASTERS[(area * 6 + stage + wave + slot) % COMMON_CHARACTER_MASTERS.length];
  const rank = area * 7 + stage;
  const growth = 1 + rank * 0.09;
  const skills = themeSkills(area, COMMON_SKILL_MASTERS.filter((s) => s.element === master.element));
  return {
    id: `quest-enemy-${area + 1}-${stage + 1}-${wave + 1}-${slot + 1}`,
    name: master.name,
    image: master.image,
    element: master.element,
    level: 1 + rank,
    stats: { hp: Math.round((boss2 ? 1100 : 370) * growth), sp: boss2 ? 80 : 40, atk: Math.round((boss2 ? 100 : 55) * growth), def: Math.round((area === 2 ? 55 : 15) * growth), luk: 10 + rank },
    skills,
    passives: [],
    hitSpGain: 5,
    actionCount: boss2 ? 3 : 4 + slot % 2,
    order: slot,
    boss: boss2,
    ...boss2 ? { phases: [{ hpBelow: 0.45, name: "\u6C7A\u6B7B\u306E\u9663", actionCount: 2, skills: themeSkills((area + 1) % 10, skills) }] } : {}
  };
}
var QUEST_AREAS = AREAS.map(([id, name2, chapter, description], area) => ({
  id,
  index: area + 1,
  name: name2,
  description,
  image: `/bg/sengoku/${area % 2 ? "castle-town" : "castle-approach"}.jpg`,
  stages: STAGE_NAMES.map((stageName, stage) => {
    const waveCount = Math.min(5, 1 + Math.floor(stage / 2) + (area > 5 ? 1 : 0));
    return {
      id: `${id}-${stage + 1}`,
      areaId: id,
      index: stage + 1,
      name: stage === 6 ? chapter : stageName,
      description,
      energyCost: 3 + Math.floor(area / 2),
      waves: Array.from({ length: waveCount }, (_, wave) => {
        const boss2 = stage === 6 && wave === waveCount - 1;
        return Array.from({ length: boss2 ? 1 : Math.min(3, 1 + Math.floor(stage / 3) + wave % 2) }, (_2, slot) => enemy(area, stage, wave, slot, boss2));
      }),
      firstRewards: [{ kind: "cash", amount: 100 + area * 30 }, { kind: "soul", id: COMMON_CHARACTER_MASTERS[(area * 6 + stage) % COMMON_CHARACTER_MASTERS.length].id, amount: 2 }],
      rewards: [{ kind: "cash", amount: 20 + area * 10 }, { kind: "character_material", amount: 1 + Math.floor(area / 3) }, { kind: "skill_material", amount: 1 }, { kind: "equipment_material", amount: 1 }],
      rareRewards: [{ kind: "soul", id: COMMON_CHARACTER_MASTERS[(area * 6 + stage) % COMMON_CHARACTER_MASTERS.length].id, amount: 1, chance: 0.08 }, { kind: "equipment_lb", amount: 1, chance: 0.05 }, { kind: "equipment", id: EQUIPMENT_MASTERS[(area * 7 + stage) % EQUIPMENT_MASTERS.length].id, amount: 1, chance: 0.12 }, ...area >= 2 ? [{ kind: "unlock_item", amount: 1, chance: 0.04 }] : []],
      encounterChance: 0.08
    };
  })
}));
var QUEST_STAGES = QUEST_AREAS.flatMap((area) => area.stages);
function getQuestStage(id) {
  return QUEST_STAGES.find((stage) => stage.id === id);
}
function isQuestStageUnlocked(id, clearedStages) {
  const index = QUEST_STAGES.findIndex((stage) => stage.id === id);
  return index >= 0 && (index === 0 || clearedStages.includes(QUEST_STAGES[index - 1].id));
}

// src/domain/redesign/missions.ts
function evaluateMissions(state, config) {
  if (!config.enabled) return [];
  const cleared = new Set(state.clearedStages);
  const ids = /* @__PURE__ */ new Set();
  return config.missions.filter((master) => master.enabled).map((master) => {
    if (!master.id || ids.has(master.id)) throw new Error("\u4EFB\u52D9\u30DE\u30B9\u30BF\u30FC\u306EID\u304C\u91CD\u8907\u3057\u3066\u3044\u307E\u3059\u3002");
    ids.add(master.id);
    let stages;
    if (master.condition.type === "stage_clear") {
      const stageId = master.condition.stageId;
      if (!QUEST_STAGES.some((stage) => stage.id === stageId)) throw new Error("\u4EFB\u52D9\u306E\u5BFE\u8C61\u30B9\u30C6\u30FC\u30B8\u304C\u5B58\u5728\u3057\u307E\u305B\u3093\u3002");
      stages = [stageId];
    } else if (master.condition.type === "area_clear") {
      const areaId = master.condition.areaId;
      const area = QUEST_AREAS.find((candidate) => candidate.id === areaId);
      if (!area?.stages.length) throw new Error("\u4EFB\u52D9\u306E\u5BFE\u8C61\u30A8\u30EA\u30A2\u304C\u5B58\u5728\u3057\u307E\u305B\u3093\u3002");
      stages = area.stages.map((stage) => stage.id);
    } else throw new Error("\u4EFB\u52D9\u6761\u4EF6\u304C\u672A\u5BFE\u5FDC\u3067\u3059\u3002");
    const current = stages.filter((id) => cleared.has(id)).length;
    return {
      id: master.id,
      name: master.name,
      description: master.description,
      rewards: master.rewards,
      current,
      target: stages.length,
      status: state.claimedMissionIds?.includes(master.id) ? "claimed" : current === stages.length ? "claimable" : "progress"
    };
  });
}
function getClaimableMission(state, config, id) {
  const row = evaluateMissions(state, config).find((candidate) => candidate.id === id);
  if (!row || row.status !== "claimable") throw new Error("\u3053\u306E\u4EFB\u52D9\u306E\u5831\u916C\u306F\u53D7\u3051\u53D6\u308C\u307E\u305B\u3093\u3002");
  return config.missions.find((master) => master.id === id);
}

// src/domain/redesign/battleLegacy.ts
var advantage = { fire: "wind", wind: "earth", earth: "water", water: "fire", light: "dark", dark: "light" };
function elementMultiplier(attack2, defend, rules) {
  if (advantage[attack2] === defend) return rules.advantageMultiplier;
  if (advantage[defend] === attack2) return rules.disadvantageMultiplier;
  return 1;
}
function burstChance(level, luk, divisor) {
  return Math.min(80, Math.max(0, level / 2 + luk / Math.max(1, divisor))) / 100;
}
function simulateBattle(input) {
  if (input.party.length !== 5 || input.waves.length < 1 || input.waves.length > 5 || input.waves.some((w) => w.length < 1 || w.length > 3)) throw new Error("Battle requires five party members and 1\u20135 waves of 1\u20133 enemies");
  if (new Set(input.party.map((p) => p.id)).size !== 5) throw new Error("Duplicate party member");
  const rules = input.rules;
  for (const n of [rules.spRecoveryDivisor, rules.enemySpRecoveryDivisor, rules.burstLukDivisor, rules.maxPlayerActions]) if (!Number.isFinite(n) || n <= 0) throw new Error("Invalid battle rules");
  let seed = input.seed >>> 0;
  const random = () => {
    seed += 1831565813;
    let t = seed;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
  const makeUnit = (u, enemy2) => {
    const e = u;
    return { ...u, stats: { ...u.stats }, skills: [...u.skills], hp: u.stats.hp, sp: enemy2 ? u.stats.sp : 0, count: enemy2 ? Math.max(1, e.actionCount) : 0, resetCount: enemy2 ? Math.max(1, e.actionCount) : 0, order: e.order ?? 0, enemy: enemy2, actions: 0, statuses: [], appliedPhases: [], phase: null, phases: e.phases, deathHandled: false };
  };
  const party = input.party.map((u) => makeUnit(u, false));
  const applyPassives = (units) => {
    for (const target of units) {
      const sums = {};
      for (const owner of units) for (const passive of owner.passives) if (passive.target === "party" || owner.id === target.id) sums[passive.stat] = (sums[passive.stat] ?? 0) + passive.percent;
      for (const key2 of Object.keys(sums)) target.stats[key2] = Math.max(1, Math.round(target.stats[key2] * (1 + (sums[key2] ?? 0) / 100)));
      target.hp = target.stats.hp;
      if (target.enemy) target.sp = target.stats.sp;
    }
  };
  applyPassives(party);
  const maxSp = party.reduce((sum, u) => sum + u.stats.sp, 0);
  let partySp = Math.max(0, Math.min(maxSp, Math.round(maxSp * rules.initialSpRatio)));
  let wave = 0, playerActions = 0, totalDamage = 0, wavesCleared = 0, burst = false;
  let enemies = input.waves[0].map((u) => makeUnit(u, true));
  applyPassives(enemies);
  const frames = [];
  const analysis = party.map((u) => ({ id: u.id, name: u.name, damage: 0, healing: 0, spGenerated: 0, actions: 0, skills: 0, bursts: 0 }));
  const snapshot = (u) => ({ id: u.id, hp: u.hp, maxHp: u.stats.hp, sp: u.sp, maxSp: u.stats.sp, count: u.count, actions: u.actions, statuses: u.statuses.map((s) => ({ ...s })), phase: u.phase, image: u.image });
  const frame = (kind, text, actorId, skillId) => frames.push({ index: frames.length, wave: wave + 1, kind, text, actorId, skillId, partySp, maxSp, burst, party: party.map(snapshot), enemies: enemies.map(snapshot) });
  const side = (u) => u.enemy ? enemies : party;
  const opposite = (u) => u.enemy ? party : enemies;
  const stat = (u, key2) => Math.max(1, u.stats[key2] * (1 + u.statuses.reduce((v, s) => v + (s.type === `${key2}_up` ? s.power / 100 : s.type === `${key2}_down` ? -s.power / 100 : 0), 0)));
  const condition = (u, skill) => {
    const value = skill.condition.value ?? 0.5;
    switch (skill.condition.type) {
      case "hp_below":
        return u.hp / u.stats.hp <= value;
      case "ally_hp_below":
        return side(u).some((t) => t.hp > 0 && t.hp / t.stats.hp <= value);
      case "ally_dead":
        return side(u).some((t) => t.hp <= 0);
      case "enemy_count":
        return opposite(u).filter((t) => t.hp > 0).length >= value;
      case "every_n_actions":
        return (u.actions + 1) % Math.max(1, value) === 0;
      default:
        return true;
    }
  };
  const choose = (u, sp, discount = 1) => u.skills.map((skill, slot) => ({ skill, slot })).filter(({ skill }) => skill.spCost > 0 && condition(u, skill) && Math.ceil(skill.spCost * discount) <= sp).sort((a, b) => b.skill.spCost - a.skill.spCost || a.slot - b.slot)[0]?.skill;
  const targets = (u, skill) => {
    const allies = side(u).filter((t) => t.hp > 0), foes = opposite(u).filter((t) => t.hp > 0);
    switch (skill.target) {
      case "self":
        return [u];
      case "dead_ally":
        return side(u).filter((t) => t.hp <= 0).slice(0, 1);
      case "all_allies":
        return allies;
      case "lowest_ally":
        return allies.sort((a, b) => a.hp / a.stats.hp - b.hp / b.stats.hp).slice(0, 1);
      case "all_enemies":
        return foes;
      case "lowest_hp":
        return foes.sort((a, b) => a.hp / a.stats.hp - b.hp / b.stats.hp).slice(0, 1);
      case "highest_hp":
        return foes.sort((a, b) => b.hp - a.hp).slice(0, 1);
      case "random":
        return foes.length ? [foes[Math.floor(random() * foes.length)]] : [];
      default:
        return foes.slice(0, 1);
    }
  };
  const basic = (u) => ({ id: "basic", name: "\u901A\u5E38\u653B\u6483", image: "", rarity: "N", element: u.element, spCost: 0, condition: { type: "always" }, target: "first", effects: [{ type: "damage", power: 100 }], description: "\u524D\u65B9\u306E\u6575\u3078\u901A\u5E38\u653B\u6483" });
  const effect = (u, t, e, element) => {
    const a = analysis.find((x) => x.id === u.id);
    if (e.type === "damage") {
      if (t.hp <= 0) return { achievement: 0, text: "" };
      const mult = elementMultiplier(element, t.element, rules);
      const damage = Math.max(1, Math.round((stat(u, "atk") * e.power / 100 - stat(t, "def") * rules.defenseFactor) * mult));
      const actual = Math.min(t.hp, damage);
      t.hp -= actual;
      if (!u.enemy && t.enemy) {
        totalDamage += damage;
        if (a) a.damage += damage;
      }
      if (t.enemy) t.sp = t.hp > 0 ? Math.min(t.stats.sp, t.sp + Math.floor(actual / rules.enemySpRecoveryDivisor)) : 0;
      return { achievement: actual, text: `${t.name} \u2212${damage}${mult > 1 ? " WEAK" : mult < 1 ? " RESIST" : ""}` };
    }
    if (e.type === "heal" || e.type === "revive") {
      if (e.type === "heal" && t.hp <= 0 || e.type === "revive" && t.hp > 0) return { achievement: 0, text: "" };
      const amount = Math.min(t.stats.hp - t.hp, Math.max(1, Math.round(e.type === "revive" ? t.stats.hp * e.power / 100 : u.stats.atk * e.power / 100)));
      t.hp += amount;
      t.deathHandled = false;
      if (e.type === "revive" && t.enemy) {
        t.count = t.resetCount;
        t.sp = 0;
      }
      if (a) a.healing += amount;
      return { achievement: amount, text: `${t.name} ${e.type === "revive" ? "\u8607\u751F" : "\u56DE\u5FA9"} +${amount}` };
    }
    if (e.type === "sp") {
      if (t.enemy) t.sp = Math.max(0, Math.min(t.stats.sp, t.sp + e.power));
      else partySp = Math.max(0, Math.min(maxSp, partySp + e.power));
      return { achievement: Math.max(0, e.power), text: `SP ${e.power >= 0 ? "+" : ""}${e.power}` };
    }
    if (t.hp > 0) t.statuses.push({ type: e.type, power: e.power, remaining: Math.max(1, e.duration ?? 3), carry: e.carryAcrossWaves ?? false, sourceId: u.id, sourceEnemy: u.enemy });
    return { achievement: Math.abs(e.power), text: `${t.name} ${e.type === "poison" ? "\u6BD2" : e.type === "atk_up" ? "\u653B\u6483\u4E0A\u6607" : e.type === "def_up" ? "\u9632\u5FA1\u4E0A\u6607" : e.type === "atk_down" ? "\u653B\u6483\u4F4E\u4E0B" : "\u9632\u5FA1\u4F4E\u4E0B"}` };
  };
  const handleDeaths = () => {
    for (let chain = 0; chain < 30; chain++) {
      const dead = [...party, ...enemies].find((t) => t.hp <= 0 && !t.deathHandled);
      if (!dead) break;
      dead.deathHandled = true;
      dead.sp = 0;
      dead.count = 0;
      for (const e of dead.deathEffects ?? []) {
        const list = e.type === "revive" ? [dead] : ["damage", "poison", "atk_down", "def_down"].includes(e.type) ? opposite(dead) : side(dead);
        for (const t of list) effect(dead, t, e, dead.element);
      }
    }
  };
  const phases = () => {
    for (const u of enemies) if (u.hp > 0) u.phases?.forEach((phase, i) => {
      if (!u.appliedPhases.includes(i) && u.hp / u.stats.hp <= phase.hpBelow) {
        u.appliedPhases.push(i);
        u.phase = phase.name;
        if (phase.image) u.image = phase.image;
        if (phase.skills) u.skills = phase.skills;
        if (phase.actionCount) {
          u.resetCount = phase.actionCount;
          u.count = Math.min(u.count, phase.actionCount);
        }
        frame("phase", `${u.name}\uFF1A${phase.name}`, u.id);
      }
    });
  };
  const act = (u, skill, discount = 1) => {
    const cost = Math.ceil(skill.spCost * discount);
    if (u.enemy) u.sp -= cost;
    else partySp -= cost;
    const spentSp = partySp;
    let achievement = 0;
    const texts = [];
    for (const t of targets(u, skill)) for (const e of skill.effects) {
      const applied = effect(u, t, e, skill.element);
      achievement += applied.achievement;
      if (applied.text) texts.push(applied.text);
    }
    if (!u.enemy) {
      const gained = Math.max(0, Math.floor(achievement * u.stats.luk / rules.spRecoveryDivisor));
      const before = partySp;
      partySp = Math.min(maxSp, partySp + gained);
      const a = analysis.find((x) => x.id === u.id);
      a.actions++;
      a.skills += Number(skill.id !== "basic");
      a.spGenerated += partySp - before;
      texts.push(`SP +${partySp - before}`);
      playerActions++;
    }
    u.actions++;
    for (const s of u.statuses) if (s.type === "poison" && u.hp > 0) {
      const damage = Math.max(1, Math.round(u.stats.hp * s.power / 100));
      u.hp = Math.max(0, u.hp - damage);
      if (u.enemy && s.sourceEnemy === false) {
        totalDamage += damage;
        const source = analysis.find((a) => a.id === s.sourceId);
        if (source) source.damage += damage;
      }
      texts.push(`${u.name} \u6BD2 \u2212${damage}`);
    }
    u.statuses = u.statuses.map((s) => ({ ...s, remaining: s.remaining - 1 })).filter((s) => s.remaining > 0);
    handleDeaths();
    phases();
    frame(u.enemy ? "enemy" : "action", `${u.name} \xB7 ${skill.name}\u3000${texts.join(" / ")}`, u.id, skill.id);
    return spentSp < maxSp && partySp >= maxSp;
  };
  const enemyInterrupts = () => {
    for (const u of enemies) if (u.hp > 0) u.count--;
    const last = frames[frames.length - 1];
    if (last?.kind === "action") last.enemies = enemies.map(snapshot);
    for (const u of [...enemies].sort((a, b) => a.order - b.order)) {
      if (u.hp <= 0 || u.count > 0 || !party.some((t) => t.hp > 0)) continue;
      frame("enemy", `${u.name}\uFF1AEnemy Action`, u.id);
      let skill = choose(u, u.sp);
      if (!skill) act(u, basic(u));
      let guard = 0;
      while (skill && u.hp > 0 && party.some((t) => t.hp > 0) && guard++ < 100) {
        act(u, skill);
        skill = choose(u, u.sp);
      }
      u.count = u.hp > 0 ? u.resetCount : 0;
      frame("enemy", `${u.name}\uFF1A\u6B21\u306E\u884C\u52D5\u307E\u3067 ${u.count}`, u.id);
    }
  };
  frame("start", "\u5168\u6B66\u5C06\u306E\u30D1\u30C3\u30B7\u30D6\u304C\u767A\u52D5\u3002\u5408\u6226\u958B\u59CB");
  let cursor = 0;
  while (party.some((u) => u.hp > 0) && playerActions < rules.maxPlayerActions) {
    if (enemies.every((u2) => u2.hp <= 0)) {
      wavesCleared++;
      if (wave + 1 >= input.waves.length) break;
      wave++;
      enemies = input.waves[wave].map((u2) => makeUnit(u2, true));
      applyPassives(enemies);
      for (const u2 of party) u2.statuses = u2.statuses.filter((s) => s.carry);
      frame("wave", `WAVE ${wave + 1}\uFF1AHP\u30FBSP\u3092\u5F15\u304D\u7D99\u3044\u3067\u9032\u8ECD`);
    }
    const u = party[cursor % 5];
    cursor++;
    if (u.hp <= 0) continue;
    const reachedFull = act(u, choose(u, partySp) ?? basic(u));
    if (reachedFull && u.hp > 0 && enemies.some((e) => e.hp > 0) && random() < burstChance(u.level, u.stats.luk, rules.burstLukDivisor)) {
      burst = true;
      analysis.find((a) => a.id === u.id).bursts++;
      frame("burst", `${u.name} BURST\uFF01 \u6D88\u8CBBSP 50%`, u.id);
    }
    enemyInterrupts();
    if (burst) {
      for (let n = 0; n < 5 && partySp > 0 && u.hp > 0 && enemies.some((e) => e.hp > 0) && playerActions < rules.maxPlayerActions; n++) {
        const skill = choose(u, partySp, 0.5);
        if (!skill) break;
        act(u, skill, 0.5);
        enemyInterrupts();
      }
      burst = false;
      frame("burst", "BURST\u7D42\u4E86\u3002\u7DE8\u6210\u9806\u306E\u884C\u52D5\u3078\u623B\u308B");
    }
  }
  if (enemies.every((u) => u.hp <= 0) && wavesCleared <= wave) wavesCleared++;
  const outcome = !party.some((u) => u.hp > 0) ? "lose" : wavesCleared === input.waves.length ? "win" : "limit";
  frame("end", outcome === "win" ? "\u52DD\u5229" : outcome === "lose" ? "\u6557\u5317" : "\u6C7A\u7740\u306B\u81F3\u3089\u305A\u64A4\u9000");
  return { seed: input.seed, outcome, totalDamage, playerActions, wavesCleared, party: input.party, waves: input.waves, frames, analysis };
}

// src/domain/redesign/battleCommonV1.ts
var advantage2 = { fire: "wind", wind: "earth", earth: "water", water: "fire", light: "dark", dark: "light" };
function elementMultiplier2(a, d, rules) {
  return advantage2[a] === d ? rules.advantageMultiplier : advantage2[d] === a ? rules.disadvantageMultiplier : 1;
}
var COMMON_BATTLE_VERSION = "common-v2-20260920";
var commonBurstChance = (luk) => Math.min(0.8, 0.5 + Math.max(0, Math.min(100, luk)) * 3e-3);
var commonSpGain = (luk, basic) => Math.floor((basic ? 20 : 10) * (1 + Math.max(0, Math.min(100, luk)) / 200));
function commonDamage(atk, def, power2, element, random) {
  return Math.max(1, Math.floor((atk * power2 / 100 - def) * element * (0.9 + random * 0.2)));
}
function splitDisplayDamage(total, hits) {
  const n = Math.max(1, Math.floor(hits));
  return Array.from({ length: n }, (_, i) => Math.floor(total / n) + Number(i < total % n));
}
function simulateBattle2(input) {
  if (input.rules.version === COMMON_BATTLE_VERSION)
    return simulateCommonBattle(input);
  if (input.rules.version && input.rules.version !== "legacy-v1")
    throw new Error("Unsupported battle rules version");
  return simulateBattle(input);
}
function simulateCommonBattle(input) {
  if (!input.party.length || input.party.length > 5 || !input.waves.length || input.waves.length > 5 || input.waves.some((w) => !w.length || w.length > 3))
    throw new Error("Invalid battle formation");
  if (new Set(input.party.map((u) => u.id)).size !== input.party.length)
    throw new Error("Duplicate party member");
  const validateCondition = (c) => {
    if (!["always", "hp_below", "ally_hp_below", "every_n_actions", "enemy_count", "ally_dead"].includes(c.type)) throw new Error("Unsupported skill condition");
    if (c.value !== void 0 && !Number.isFinite(c.value)) throw new Error("Invalid condition value");
    if (["every_n_actions", "enemy_count"].includes(c.type) && (c.value === void 0 || !Number.isInteger(c.value) || c.value < 1)) throw new Error("Invalid condition count");
    if (["hp_below", "ally_hp_below"].includes(c.type) && c.value !== void 0 && (c.value < 0 || c.value > 1)) throw new Error("Invalid HP condition ratio");
  };
  const validateEffect = (e) => {
    if (!["damage", "heal", "revive", "atk_up", "def_up", "atk_down", "def_down", "stun"].includes(e.type))
      throw new Error(`Unapproved common-v2 effect: ${e.type}`);
    if (e.duration !== void 0 && (!Number.isInteger(e.duration) || e.duration < 1))
      throw new Error("Invalid effect duration");
    if (e.displayHits !== void 0 && (!Number.isInteger(e.displayHits) || e.displayHits < 1 || e.displayHits > 100))
      throw new Error("Invalid display hit count");
    if (!Number.isFinite(e.power) || e.power < 0)
      throw new Error("Invalid effect power");
    if ((e.type === "heal" || e.type === "revive") && !["caster_atk_percent", "target_max_hp_percent"].includes(e.healingFormula ?? ""))
      throw new Error("Explicit provisional healingFormula required");
    if (e.type === "stun" && e.chance === void 0)
      throw new Error("Explicit provisional stun chance required");
    if (e.chance !== void 0 && (!Number.isFinite(e.chance) || e.chance < 0 || e.chance > 1))
      throw new Error("Invalid effect chance");
  };
  for (const u of [...input.party, ...input.waves.flat()]) {
    for (const value of ["hp", "sp", "atk", "def", "luk"].map((k) => u.stats[k]))
      if (!Number.isFinite(value) || value < 0)
        throw new Error("Invalid battle stats");
    if (u.stats.hp <= 0)
      throw new Error("Invalid HP");
    for (const p of u.passives) {
      if (p.condition) validateCondition(p.condition);
      if (!Number.isFinite(p.percent) || p.percent < 0)
        throw new Error("Invalid passive strength");
      if (!["atk", "def"].includes(p.stat))
        throw new Error(`Unapproved v2 passive stat: ${p.stat}`);
    }
    for (const s of [...u.skills, ...(u.phases ?? []).flatMap((p) => p.skills ?? [])]) {
      validateCondition(s.condition);
      if (!Number.isFinite(s.spCost) || s.spCost < 0 || input.waves.flat().includes(u) && s.spCost < 1)
        throw new Error("Invalid active skill SP cost");
      if (s.effects.filter((e) => e.type === "damage").length > 1)
        throw new Error("Independent multiple attacks need additional authority");
      s.effects.forEach(validateEffect);
    }
    u.deathEffects?.forEach(validateEffect);
  }
  for (const wave2 of input.waves) {
    if (new Set(wave2.map((u) => u.id)).size !== wave2.length)
      throw new Error("Duplicate enemy id");
    for (const e of wave2) {
      if (e.initialCount !== void 0 && (!Number.isInteger(e.initialCount) || e.initialCount < 1))
        throw new Error("Invalid enemy initial count");
      for (const p of e.phases ?? [])
        if (!Number.isFinite(p.hpBelow) || p.hpBelow < 0 || p.hpBelow > 1 || p.actionCount !== void 0 && (!Number.isInteger(p.actionCount) || p.actionCount < 1) || p.maxSp !== void 0 && (!Number.isFinite(p.maxSp) || p.maxSp < 0))
          throw new Error("Invalid phase master");
      if (!Number.isFinite(e.hitSpGain) || e.hitSpGain < 0 || !Number.isInteger(e.actionCount) || e.actionCount < 1)
        throw new Error("Explicit enemy hitSpGain and positive actionCount required");
    }
  }
  let seed = input.seed >>> 0;
  const random = () => {
    seed += 1831565813;
    let t = seed;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
  const make = (u, enemy2) => {
    const e = u;
    return { ...u, stats: { ...u.stats }, skills: [...u.skills], hp: u.stats.hp, sp: enemy2 ? u.stats.sp : 0, count: enemy2 ? e.initialCount ?? e.actionCount : 0, resetCount: e.actionCount, initialCount: e.initialCount ?? e.actionCount, order: e.order ?? 0, enemy: enemy2, actions: 0, statuses: [], phase: null, phaseIndex: -1, phases: e.phases, dead: false, deaths: 0, usedDeath: /* @__PURE__ */ new Set(), immune: false, passive: { atk: 0, def: 0 }, hitSpGain: e.hitSpGain ?? 0, pendingSp: 0, inBlock: false, revivedAt: -1 };
  };
  const party = input.party.map((u) => make(u, false));
  let wave = 0, enemies = input.waves[0].map((u) => make(u, true));
  let partySp = 0, gauge = 0, playerActions = 0, serial = 0, totalDamage = 0, wavesCleared = 0, burst = false, ended = null, reason = "";
  const frames = [];
  const analysis = party.map((u) => ({ id: u.id, name: u.name, damage: 0, healing: 0, spGenerated: 0, actions: 0, skills: 0, bursts: 0 }));
  const side = (u) => u.enemy ? enemies : party;
  const opposite = (u) => u.enemy ? party : enemies;
  const alive = (u) => u.hp > 0;
  const sum = (u, type) => u.statuses.filter((s) => s.type === type).reduce((n, s) => n + s.power, 0);
  const stat = (u, key2) => u.stats[key2] * (1 + u.passive[key2] / 100) * (1 + Math.min(sum(u, `${key2}_up`), key2 === "atk" ? 50 : 100) / 100 - Math.min(sum(u, `${key2}_down`), key2 === "atk" ? 30 : 50) / 100);
  const snapshot = (u) => ({ id: u.id, hp: u.hp, maxHp: u.stats.hp, sp: u.sp, maxSp: u.stats.sp, count: u.count, actions: u.actions, statuses: u.statuses.map((s) => ({ ...s })), phase: u.phase, image: u.image, stunImmune: u.immune, dead: u.dead, effectiveAtk: stat(u, "atk"), effectiveDef: stat(u, "def"), skills: u.phase ? u.skills : void 0 });
  const frame = (kind, text, u, skill, extra = {}) => frames.push({ index: frames.length, wave: wave + 1, kind, text, actorId: u?.id, skillId: skill?.id, partySp, maxSp: 400, burst, party: party.map(snapshot), enemies: enemies.map(snapshot), burstGauge: gauge, maxBurstGauge: 200, playerActions, remainingActions: 300 - playerActions, skillStates: Object.fromEntries([...party, ...enemies].map((unit) => [unit.id, unit.skills.map((s) => ({ skillId: s.id, cost: Math.ceil(s.spCost * (burst && !unit.enemy ? 0.5 : 1)), status: extra.event === "action_start" && unit === u && s === skill ? "active" : !alive(unit) || !usable(unit, s) ? "condition_unmet" : Math.ceil(s.spCost * (burst && !unit.enemy ? 0.5 : 1)) > (unit.enemy ? unit.sp : partySp) ? "insufficient_sp" : "ready", reason: s.unsupportedReason }))])), ...extra });
  const condition = (u, c) => {
    const v = c.value ?? 0.5;
    switch (c.type) {
      case "hp_below":
        return u.hp / u.stats.hp <= v;
      case "ally_hp_below":
        return side(u).some((t) => alive(t) && t.hp / t.stats.hp <= v);
      case "ally_dead":
        return side(u).some((t) => !alive(t));
      case "enemy_count":
        return opposite(u).filter(alive).length >= v;
      case "every_n_actions":
        return (u.actions + 1) % Math.max(1, v) === 0;
      default:
        return true;
    }
  };
  const passiveConditions = /* @__PURE__ */ new WeakMap();
  const passives = (reevaluate = true) => {
    if (reevaluate)
      for (const owner of [...party, ...enemies])
        passiveConditions.set(owner, new Map(owner.passives.map((p) => [p.id, !p.condition || condition(owner, p.condition)])));
    for (const list of [party, enemies])
      for (const target of list) {
        const best = /* @__PURE__ */ new Map();
        for (const owner of list.filter(alive))
          for (const p of owner.passives)
            if ((p.target === "party" || owner === target) && (passiveConditions.get(owner)?.get(p.id) ?? false)) {
              const old = best.get(p.id);
              if (!old || p.percent > old.percent)
                best.set(p.id, { stat: p.stat, percent: p.percent });
            }
        target.passive = { atk: 0, def: 0 };
        for (const p of best.values())
          target.passive[p.stat] += p.percent;
        target.passive.atk = Math.min(50, target.passive.atk);
        target.passive.def = Math.min(50, target.passive.def);
      }
  };
  let applyingSkill = false;
  const applicable = (t, e, skillId) => {
    if (e.type === "revive")
      return !alive(t);
    if (!alive(t))
      return false;
    if (e.type === "stun")
      return !t.immune && !t.statuses.some((s) => s.type === "stun");
    if (["atk_up", "def_up", "atk_down", "def_down"].includes(e.type)) {
      const cap = e.type === "atk_up" ? 50 : e.type === "def_up" ? 100 : e.type === "atk_down" ? 30 : 50;
      return !t.statuses.some((s) => s.sourceSkillId === skillId && !(applyingSkill && s.appliedAction === serial && s.type !== e.type)) && sum(t, e.type) < cap;
    }
    return true;
  };
  const select = (u, target, candidates, preview = false) => {
    let list = candidates ?? (["self", "lowest_ally", "all_allies", "dead_ally"].includes(target) ? side(u) : opposite(u)).filter((t) => target === "dead_ally" ? !alive(t) : alive(t));
    if (target === "self")
      return list.includes(u) ? [u] : [];
    if (target === "all_allies" || target === "all_enemies")
      return list;
    if (target === "lowest_hp")
      list = [...list].sort((a, b) => a.hp - b.hp);
    if (target === "highest_hp")
      list = [...list].sort((a, b) => b.hp - a.hp);
    if (target === "lowest_ally" || target === "lowest_hp_ratio")
      list = [...list].sort((a, b) => a.hp / a.stats.hp - b.hp / b.stats.hp);
    if (target === "highest_hp_ratio")
      list = [...list].sort((a, b) => b.hp / b.stats.hp - a.hp / a.stats.hp);
    if (target === "random" && list.length && !preview)
      return [list[Math.floor(random() * list.length)]];
    return list.slice(0, 1);
  };
  const effectTargets = (u, skill, e, selected, preview = false) => {
    const rule = e.target && e.target !== "selected" ? e.target : skill.target;
    if (e.type === "heal") {
      if (selected && (!e.target || e.target === "selected"))
        return selected.filter(alive);
      const living = side(u).filter(alive);
      if (rule === "self")
        return alive(u) ? [u] : [];
      if (rule === "all_allies")
        return living.filter((t) => t.hp / t.stats.hp <= 0.6).length >= Math.ceil(living.length / 2) ? living : [];
      return select(u, "lowest_ally", living.filter((t) => t.hp / t.stats.hp <= 0.5), preview);
    }
    if (selected && (!e.target || e.target === "selected"))
      return selected.filter((t) => applicable(t, e, skill.id));
    const all = ["self", "lowest_ally", "all_allies", "dead_ally"].includes(rule) ? side(u) : opposite(u);
    return select(u, rule, all.filter((t) => applicable(t, e, skill.id)), preview);
  };
  const usable = (u, s) => !s.unsupportedReason && condition(u, s.condition) && s.effects.some((e) => effectTargets(u, s, e, void 0, true).length > 0);
  const choose = (u, discount = 1) => u.skills.find((s) => usable(u, s) && Math.ceil(s.spCost * discount) <= (u.enemy ? u.sp : partySp));
  const basic = (u) => ({ id: "basic", name: "\u901A\u5E38\u653B\u6483", image: "", rarity: "N", element: u.element, spCost: 0, condition: { type: "always" }, target: "first", effects: [{ type: "damage", power: 100 }], description: "" });
  const applyEffect = (u, targets, e, skill) => {
    const plans = targets.filter((t) => applicable(t, e, skill.id)).map((t) => {
      const success = e.chance === void 0 || random() < e.chance;
      const amount = e.type === "damage" ? commonDamage(stat(u, "atk"), stat(t, "def"), e.power, elementMultiplier2(skill.element, t.element, { ...input.rules, advantageMultiplier: 1.5, disadvantageMultiplier: 0.75 }), random()) : e.type === "heal" || e.type === "revive" ? Math.max(0, Math.floor((e.healingFormula === "caster_atk_percent" ? stat(u, "atk") : t.stats.hp) * e.power / 100)) : e.power;
      return { t, success, amount };
    });
    for (const { t, success, amount } of plans) {
      if (!success) {
        frame("action", `${t.name}\uFF1A${e.type} \u4E0D\u6210\u7ACB`, u, skill, { event: "effect_miss", targetIds: [t.id] });
        continue;
      }
      if (e.type === "damage") {
        const actual = Math.min(t.hp, amount);
        t.hp -= actual;
        if (!u.enemy && t.enemy) {
          totalDamage += amount;
          const a = analysis.find((a2) => a2.id === u.id);
          if (a)
            a.damage += amount;
        }
        if (t.enemy && actual > 0) {
          if (t.inBlock)
            t.pendingSp += t.hitSpGain;
          else
            t.sp = Math.min(t.stats.sp, t.sp + t.hitSpGain);
        }
        frame(u.enemy ? "enemy" : "action", `${t.name} \u2212${amount}`, u, skill, { event: "damage", targetIds: [t.id], hits: splitDisplayDamage(amount, e.displayHits ?? 1) });
      } else if (e.type === "heal" || e.type === "revive") {
        const actual = Math.min(t.stats.hp - t.hp, amount);
        t.hp += actual;
        if (e.type === "revive" && t.hp > 0) {
          t.dead = false;
          if (t.enemy) {
            t.sp = 0;
            t.count = t.initialCount;
            t.revivedAt = serial;
          }
        }
        const a = analysis.find((a2) => a2.id === u.id);
        if (a)
          a.healing += actual;
        frame("action", `${t.name} ${e.type === "revive" ? "\u8607\u751F" : "\u56DE\u5FA9"} +${actual}`, u, skill, { event: e.type, targetIds: [t.id] });
      } else {
        t.statuses.push({ type: e.type, power: e.power, remaining: e.type === "stun" ? 1 : e.duration ?? 3, carry: true, sourceId: u.id, sourceEnemy: u.enemy, sourceSkillId: skill.id, appliedAction: serial });
        frame("action", `${t.name}\uFF1A${e.type} \u4ED8\u4E0E`, u, skill, { event: "effect_applied", targetIds: [t.id] });
      }
    }
  };
  const deaths = (attacker) => {
    const queue = [];
    const collect = (cause = attacker) => {
      for (const u of [...side(cause), ...opposite(cause)])
        if (u.hp <= 0 && !u.dead) {
          u.dead = true;
          u.deaths++;
          u.statuses = [];
          u.immune = false;
          u.sp = 0;
          u.pendingSp = 0;
          u.count = 0;
          frame("action", `${u.name} \u6226\u95D8\u4E0D\u80FD`, u, void 0, { event: "death" });
          for (let index = 0; index < (u.deathEffects?.length ?? 0); index++)
            if (!u.usedDeath.has(index)) {
              u.usedDeath.add(index);
              queue.push({ u, effect: u.deathEffects[index], index });
            }
        }
    };
    collect();
    passives(false);
    while (queue.length) {
      const { u, effect, index } = queue.shift();
      const s = { ...basic(u), id: `death:${u.id}:${index}`, effects: [effect] };
      const targets = effect.target ? effectTargets(u, { ...s, target: effect.target === "selected" ? "first" : effect.target }, effect) : effect.type === "revive" ? [u] : ["damage", "atk_down", "def_down", "stun"].includes(effect.type) ? opposite(u) : side(u);
      applyEffect(u, targets, effect, s);
      collect(u);
      passives(false);
    }
  };
  const check = () => {
    if (!party.some(alive)) {
      ended = "lose";
      reason = enemies.some(alive) ? "party_defeated" : "mutual_annihilation";
    } else if (!enemies.some(alive) && wave === input.waves.length - 1) {
      ended = "win";
      reason = "final_wave_defeated";
    }
  };
  const phases = () => {
    for (const u of enemies.filter(alive)) {
      const next = u.phaseIndex + 1, p = u.phases?.[next];
      if (p && u.hp / u.stats.hp <= p.hpBelow) {
        u.phaseIndex = next;
        u.phase = p.name;
        if (p.image)
          u.image = p.image;
        if (p.skills)
          u.skills = [...p.skills];
        if (p.actionCount !== void 0)
          u.resetCount = p.actionCount;
        if (p.maxSp !== void 0) {
          u.stats.sp = p.maxSp;
          u.sp = Math.min(u.sp, p.maxSp);
        }
        frame("phase", `${u.name}\uFF1A${p.name}`, u, void 0, { event: "phase" });
      }
    }
  };
  const act = (u, skill, discount) => {
    serial++;
    if (serial > 1e5)
      throw new Error("Battle execution safety guard exceeded");
    if (!u.enemy)
      playerActions++;
    const beforeSp = partySp, beforeGauge = gauge;
    const cost = Math.ceil(skill.spCost * discount);
    if (u.enemy)
      u.sp -= cost;
    else
      partySp -= cost;
    frame(u.enemy ? "enemy" : "action", `${u.name} \xB7 ${skill.name} SP \u2212${cost}`, u, skill, { event: "action_start" });
    const main = skill.effects.find((e) => (!e.target || e.target === "selected") && effectTargets(u, skill, e, void 0, true).length > 0);
    const selected = main ? effectTargets(u, skill, main) : void 0;
    applyingSkill = true;
    for (const e of skill.effects)
      applyEffect(u, effectTargets(u, skill, e, selected), e, skill);
    applyingSkill = false;
    deaths(u);
    check();
    if (!ended && enemies.some(alive))
      phases();
    u.actions++;
    for (const s of u.statuses)
      if (s.type !== "stun" && s.appliedAction !== serial)
        s.remaining--;
    for (const s of u.statuses.filter((s2) => s2.remaining <= 0))
      frame("action", `${u.name}\uFF1A${s.type} \u7D42\u4E86`, u, skill, { event: "effect_expired" });
    u.statuses = u.statuses.filter((s) => s.remaining > 0);
    u.immune = false;
    if (!u.enemy) {
      const a = analysis.find((a2) => a2.id === u.id);
      a.actions++;
      a.skills += Number(skill.id !== "basic");
      if (!burst) {
        const gain = commonSpGain(u.stats.luk, skill.id === "basic");
        partySp = Math.min(400, partySp + gain);
        gauge = Math.min(200, gauge + gain);
        a.spGenerated += gain;
      }
    }
    passives();
    frame(u.enemy ? "enemy" : "action", `${u.name} \u884C\u52D5\u5B8C\u4E86`, u, skill, { event: "action_end", spDelta: partySp - beforeSp, gaugeDelta: gauge - beforeGauge });
  };
  const stunned = (u) => u.statuses.some((s) => s.type === "stun");
  const skip = (u) => {
    serial++;
    if (!u.enemy)
      playerActions++;
    u.statuses = u.statuses.filter((s) => s.type !== "stun");
    u.immune = true;
    frame(u.enemy ? "enemy" : "action", `${u.name} \u884C\u52D5\u4E0D\u80FD\uFF1A\u30B9\u30AD\u30C3\u30D7\u30FB\u518D\u4ED8\u4E0E\u8010\u6027`, u, void 0, { event: "stun_skip" });
  };
  const interrupts = () => {
    for (const e of enemies.filter(alive))
      if (e.revivedAt !== serial)
        e.count--;
    frame("enemy", "\u6575\u306E\u884C\u52D5\u30AB\u30A6\u30F3\u30C8\u66F4\u65B0", void 0, void 0, { event: "counts" });
    const due = enemies.filter((e) => alive(e) && e.count <= 0).sort((a, b) => a.order - b.order).map((e) => ({ e, deaths: e.deaths }));
    for (const entry of due) {
      const u = entry.e;
      if (!alive(u) || u.deaths !== entry.deaths || ended || !enemies.some(alive))
        continue;
      frame("enemy", `${u.name} \u5272\u8FBC\u307F`, u, void 0, { event: "interrupt_start" });
      if (stunned(u))
        skip(u);
      else {
        u.inBlock = true;
        const blockDeaths = u.deaths;
        let skill = choose(u);
        if (!skill)
          act(u, basic(u), 1);
        while (skill && alive(u) && u.deaths === blockDeaths && !ended && enemies.some(alive)) {
          if (stunned(u)) {
            skip(u);
            break;
          }
          act(u, skill, 1);
          if (!alive(u) || ended || stunned(u)) {
            if (alive(u) && stunned(u) && !ended)
              skip(u);
            break;
          }
          skill = choose(u);
        }
        u.inBlock = false;
        if (alive(u))
          u.sp = Math.min(u.stats.sp, u.sp + u.pendingSp);
        u.pendingSp = 0;
      }
      if (alive(u) && u.revivedAt !== serial)
        u.count = u.resetCount;
      frame("enemy", `${u.name} \u5272\u8FBC\u307F\u7D42\u4E86`, u, void 0, { event: "interrupt_end" });
    }
  };
  passives();
  frame("start", "\u5408\u6226\u958B\u59CB\uFF1A\u5171\u901ASP 0/400\u30FB\u30D0\u30FC\u30B9\u30C8\u30B2\u30FC\u30B8 0/200", void 0, void 0, { event: "start" });
  let cursor = 0;
  while (!ended) {
    const u = party[cursor % party.length];
    cursor++;
    if (!alive(u))
      continue;
    let skipped = false;
    if (stunned(u)) {
      skip(u);
      skipped = true;
    } else {
      if (gauge >= 200) {
        gauge = 0;
        burst = random() < commonBurstChance(u.stats.luk);
        if (burst)
          analysis.find((a) => a.id === u.id).bursts++;
        frame("burst", burst ? `${u.name} BURST\uFF1A\u6700\u59275\u884C\u52D5` : `${u.name} BURST\u62BD\u9078\u5931\u6557`, u, void 0, { event: burst ? "burst_start" : "burst_failed" });
      }
      const deathCount = u.deaths, count = burst ? 5 : 1;
      for (let n = 0; n < count; n++) {
        if (stunned(u)) {
          skip(u);
          skipped = true;
          frame("burst", "\u884C\u52D5\u4E0D\u80FD\u3067BURST\u4E2D\u65AD", u, void 0, { event: "burst_interrupted" });
          break;
        }
        act(u, choose(u, burst ? 0.5 : 1) ?? basic(u), burst ? 0.5 : 1);
        if (ended || !enemies.some(alive) || playerActions >= 300)
          break;
        interrupts();
        if (ended || !alive(u) || u.deaths !== deathCount || !enemies.some(alive))
          break;
        if (burst && n < count - 1)
          frame("burst", `${u.name} BURST\u518D\u958B`, u, void 0, { event: "burst_resume" });
      }
    }
    if (burst) {
      burst = false;
      frame("burst", "BURST\u7D42\u4E86", u, void 0, { event: "burst_end" });
    }
    check();
    if (!ended && playerActions >= 300) {
      ended = "lose";
      reason = "action_limit";
    }
    if (ended)
      break;
    if (!enemies.some(alive)) {
      wavesCleared++;
      wave++;
      enemies = input.waves[wave].map((u2) => make(u2, true));
      passives();
      frame("wave", `WAVE ${wave + 1}\uFF1AHP\u30FBSP\u30FB\u30B2\u30FC\u30B8\u30FB\u72B6\u614B\u3092\u5F15\u7D99\u304E`, void 0, void 0, { event: "wave" });
    } else if (skipped)
      interrupts();
  }
  if (!enemies.some(alive))
    wavesCleared++;
  frame("end", ended === "win" ? "\u52DD\u5229" : reason === "action_limit" ? "300\u884C\u52D5\u4E0A\u9650\uFF1A\u6557\u5317" : "\u6557\u5317", void 0, void 0, { event: "end", reason });
  return { seed: input.seed, outcome: ended, totalDamage, playerActions, wavesCleared, party: input.party, waves: input.waves, frames, analysis, rulesVersion: COMMON_BATTLE_VERSION, reason };
}

// src/domain/redesign/battleBalanceV2.ts
var BALANCE_BATTLE_VERSION = "balance-v2-20260920";
function simulateBalanceBattle(input) {
  const config = input.rules.balanceV2;
  if (!config || config.status !== "PREVIEW_PROVISIONAL") throw new Error("Explicit balance v2 configuration required");
  for (const key2 of ["damageBonusCap", "healingBonusCap", "shieldBonusCap", "shieldHpCap", "periodicCapMultiplier", "lowHpThreshold", "highHpThreshold"]) if (!Number.isFinite(config[key2]) || config[key2] < 0) throw new Error("Invalid balance v2 config: " + key2);
  if (config.diversityFactors.length !== 5 || config.diversityFactors.some((v) => !Number.isFinite(v) || v < 0)) throw new Error("Invalid diversity config");
  if (!input.party.length || input.party.length > 5 || !input.waves.length || input.waves.length > 5 || input.waves.some((w) => !w.length || w.length > 3))
    throw new Error("Invalid battle formation");
  if (new Set(input.party.map((u) => u.id)).size !== input.party.length)
    throw new Error("Duplicate party member");
  const validateCondition = (c) => {
    if (!["always", "hp_below", "ally_hp_below", "every_n_actions", "enemy_count", "ally_dead"].includes(c.type)) throw new Error("Unsupported skill condition");
    if (c.value !== void 0 && !Number.isFinite(c.value)) throw new Error("Invalid condition value");
    if (["every_n_actions", "enemy_count"].includes(c.type) && (c.value === void 0 || !Number.isInteger(c.value) || c.value < 1)) throw new Error("Invalid condition count");
    if (["hp_below", "ally_hp_below"].includes(c.type) && c.value !== void 0 && (c.value < 0 || c.value > 1)) throw new Error("Invalid HP condition ratio");
  };
  const validateEffect = (e) => {
    if (!["damage", "heal", "revive", "atk_up", "def_up", "atk_down", "def_down", "stun", "dot", "hot", "shield", "taunt", "counter", "cleanse"].includes(e.type))
      throw new Error(`Unapproved common-v2 effect: ${e.type}`);
    if (e.type === "cleanse" && (!["buff", "protection", "debuff", "dot", "stun"].includes(e.cleanseCategory ?? "") || !Number.isInteger(e.power) || e.power < 1)) throw new Error("Explicit cleanse category and positive count required");
    if (e.bonusCondition && (!["debuff", "dot", "hp_below"].includes(e.bonusCondition) || !Number.isFinite(e.bonusPower) || e.bonusPower < 0)) throw new Error("Invalid conditional damage master");
    if (e.hpThreshold !== void 0 && (!Number.isFinite(e.hpThreshold) || e.hpThreshold < 0 || e.hpThreshold > 1)) throw new Error("Invalid damage HP threshold");
    if (e.duration !== void 0 && (!Number.isInteger(e.duration) || e.duration < 1))
      throw new Error("Invalid effect duration");
    if (e.displayHits !== void 0 && (!Number.isInteger(e.displayHits) || e.displayHits < 1 || e.displayHits > 100))
      throw new Error("Invalid display hit count");
    if (!Number.isFinite(e.power) || e.power < 0)
      throw new Error("Invalid effect power");
    if ((e.type === "heal" || e.type === "revive") && !["caster_atk_percent", "target_max_hp_percent"].includes(e.healingFormula ?? ""))
      throw new Error("Explicit provisional healingFormula required");
    if (e.type === "stun" && e.chance === void 0)
      throw new Error("Explicit provisional stun chance required");
    if (e.chance !== void 0 && (!Number.isFinite(e.chance) || e.chance < 0 || e.chance > 1))
      throw new Error("Invalid effect chance");
  };
  for (const u of [...input.party, ...input.waves.flat()]) {
    for (const value of ["hp", "sp", "atk", "def", "luk"].map((k) => u.stats[k]))
      if (!Number.isFinite(value) || value < 0)
        throw new Error("Invalid battle stats");
    if (u.stats.hp <= 0)
      throw new Error("Invalid HP");
    for (const p of u.passives) {
      if (p.type && !/^P(0[1-9]|1[0-6])$/.test(p.type)) throw new Error("Unsupported passive type");
      if (p.condition) validateCondition(p.condition);
      if (!Number.isFinite(p.percent) || p.percent < 0)
        throw new Error("Invalid passive strength");
      if (!p.type && !["atk", "def"].includes(p.stat))
        throw new Error(`Unapproved v2 passive stat: ${p.stat}`);
    }
    for (const s of [...u.skills, ...(u.phases ?? []).flatMap((p) => p.skills ?? [])]) {
      validateCondition(s.condition);
      if (!Number.isFinite(s.spCost) || s.spCost < 0 || input.waves.flat().includes(u) && s.spCost < 1)
        throw new Error("Invalid active skill SP cost");
      s.effects.forEach(validateEffect);
    }
    u.deathEffects?.forEach(validateEffect);
  }
  for (const wave2 of input.waves) {
    if (new Set(wave2.map((u) => u.id)).size !== wave2.length)
      throw new Error("Duplicate enemy id");
    for (const e of wave2) {
      if (e.initialCount !== void 0 && (!Number.isInteger(e.initialCount) || e.initialCount < 1))
        throw new Error("Invalid enemy initial count");
      for (const p of e.phases ?? [])
        if (!Number.isFinite(p.hpBelow) || p.hpBelow < 0 || p.hpBelow > 1 || p.actionCount !== void 0 && (!Number.isInteger(p.actionCount) || p.actionCount < 1) || p.maxSp !== void 0 && (!Number.isFinite(p.maxSp) || p.maxSp < 0))
          throw new Error("Invalid phase master");
      if (!Number.isFinite(e.hitSpGain) || e.hitSpGain < 0 || !Number.isInteger(e.actionCount) || e.actionCount < 1)
        throw new Error("Explicit enemy hitSpGain and positive actionCount required");
    }
  }
  let seed = input.seed >>> 0;
  const random = () => {
    seed += 1831565813;
    let t = seed;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
  const make = (u, enemy2) => {
    const e = u;
    return { ...u, stats: { ...u.stats }, skills: [...u.skills], hp: u.stats.hp, sp: enemy2 ? u.stats.sp : 0, count: enemy2 ? e.initialCount ?? e.actionCount : 0, resetCount: e.actionCount, initialCount: e.initialCount ?? e.actionCount, order: e.order ?? 0, enemy: enemy2, actions: 0, statuses: [], phase: null, phaseIndex: -1, phases: e.phases, dead: false, deaths: 0, usedDeath: /* @__PURE__ */ new Set(), immune: false, passive: { atk: 0, def: 0 }, hitSpGain: e.hitSpGain ?? 0, pendingSp: 0, inBlock: false, revivedAt: -1 };
  };
  const party = input.party.map((u) => make(u, false));
  let wave = 0, enemies = input.waves[0].map((u) => make(u, true));
  let partySp = 0, gauge = 0, playerActions = 0, serial = 0, totalDamage = 0, wavesCleared = 0, burst = false, ended = null, reason = "";
  const frames = [];
  const analysis = party.map((u) => ({ id: u.id, name: u.name, damage: 0, healing: 0, spGenerated: 0, actions: 0, skills: 0, bursts: 0 }));
  const side = (u) => u.enemy ? enemies : party;
  const opposite = (u) => u.enemy ? party : enemies;
  const alive = (u) => u.hp > 0;
  const sum = (u, type) => u.statuses.filter((s) => s.type === type).reduce((n, s) => n + s.power, 0);
  const stat = (u, key2) => u.stats[key2] * (1 + u.passive[key2] / 100) * (1 + Math.min(sum(u, `${key2}_up`), key2 === "atk" ? 50 : 100) / 100 - Math.min(sum(u, `${key2}_down`), key2 === "atk" ? 30 : 50) / 100);
  const extraPassives = /* @__PURE__ */ new WeakMap();
  const snapshot = (u) => ({ id: u.id, hp: u.hp, maxHp: u.stats.hp, sp: u.sp, maxSp: u.stats.sp, count: u.count, actions: u.actions, statuses: u.statuses.map((s) => ({ ...s })), phase: u.phase, image: u.image, stunImmune: u.immune, dead: u.dead, effectiveAtk: stat(u, "atk"), effectiveDef: stat(u, "def"), skills: u.phase ? u.skills : void 0, passiveEffects: u.passives.map((p) => ({ id: p.id, type: p.type, percent: p.percent, targetElement: p.targetElement, active: alive(u) && (passiveConditions.get(u)?.get(p.id) ?? false) })) });
  const frame = (kind, text, u, skill, extra = {}) => frames.push({ index: frames.length, wave: wave + 1, kind, text, actorId: u?.id, skillId: skill?.id, partySp, maxSp: 400, burst, party: party.map(snapshot), enemies: enemies.map(snapshot), burstGauge: gauge, maxBurstGauge: 200, playerActions, remainingActions: 300 - playerActions, skillStates: Object.fromEntries([...party, ...enemies].map((unit) => [unit.id, unit.skills.map((s) => ({ skillId: s.id, cost: Math.ceil(s.spCost * (burst && !unit.enemy ? 0.5 : 1)), status: extra.event === "action_start" && unit === u && s === skill ? "active" : !alive(unit) || !usable(unit, s) ? "condition_unmet" : Math.ceil(s.spCost * (burst && !unit.enemy ? 0.5 : 1)) > (unit.enemy ? unit.sp : partySp) ? "insufficient_sp" : "ready", reason: s.unsupportedReason ?? (!condition(unit, s.condition) ? "condition_unmet" : !usable(unit, s) ? s.effects.some((e) => ["atk_up", "def_up", "atk_down", "def_down", "dot", "hot", "shield", "taunt", "counter", "stun"].includes(e.type)) && [...party, ...enemies].some((t) => alive(t) && t.statuses.some((effect) => effect.sourceSkillId === s.id)) ? "reapply_unavailable" : "condition_unmet" : void 0) }))])), ...extra });
  const condition = (u, c) => {
    const v = c.value ?? 0.5;
    switch (c.type) {
      case "hp_below":
        return u.hp / u.stats.hp <= v;
      case "ally_hp_below":
        return side(u).some((t) => alive(t) && t.hp / t.stats.hp <= v);
      case "ally_dead":
        return side(u).some((t) => !alive(t));
      case "enemy_count":
        return opposite(u).filter(alive).length >= v;
      case "every_n_actions":
        return (u.actions + 1) % Math.max(1, v) === 0;
      default:
        return true;
    }
  };
  const passiveConditions = /* @__PURE__ */ new WeakMap();
  const diversitySnapshot = /* @__PURE__ */ new WeakMap();
  const targetConditions = /* @__PURE__ */ new WeakMap();
  const passives = (reevaluate = true) => {
    if (reevaluate) for (const owner of [...party, ...enemies]) {
      const living = side(owner).filter(alive);
      diversitySnapshot.set(owner, config.diversityFactors[Math.min(4, new Set(living.map((t) => t.element)).size - 1)] ?? 0);
      const others = new Set(living.filter((t) => t !== owner).map((t) => t.element)).size;
      passiveConditions.set(owner, new Map(owner.passives.map((p) => [
        p.id,
        (!p.condition || condition(owner, p.condition)) && (p.type !== "P04" || others >= 2) && (p.type !== "P14" || owner.hp / owner.stats.hp <= config.lowHpThreshold) && (p.type !== "P15" || owner.hp / owner.stats.hp >= config.highHpThreshold) && (p.type !== "P16" || owner.statuses.some((s) => s.type === "atk_up"))
      ])));
      targetConditions.set(owner, { debuff: owner.statuses.some((s) => s.type === "atk_down" || s.type === "def_down"), dot: owner.statuses.some((s) => s.type === "dot") });
    }
    for (const list of [party, enemies]) for (const target of list) {
      const best = /* @__PURE__ */ new Map();
      for (const owner of list.filter(alive)) for (const p of owner.passives) {
        if (!(passiveConditions.get(owner)?.get(p.id) ?? false)) continue;
        const type = p.type;
        if (type === "P01" || type === "P02") {
          if (target.element !== (p.targetElement ?? owner.element)) continue;
        } else if (type ? owner !== target : p.target !== "party" && owner !== target) continue;
        let percent = p.percent;
        if (type === "P03") percent *= diversitySnapshot.get(owner) ?? 0;
        const key2 = type === "P01" || type === "P02" ? `${type}:${p.targetElement ?? owner.element}` : type ?? p.id;
        const stat2 = type ? ["P01", "P03", "P14"].includes(type) ? "atk" : ["P02", "P04", "P15", "P16"].includes(type) ? "def" : type : p.stat;
        if (!best.has(key2) || best.get(key2).percent < percent) best.set(key2, { stat: stat2, percent });
      }
      target.passive = { atk: 0, def: 0 };
      const extra = /* @__PURE__ */ new Map();
      for (const p of best.values()) {
        if (p.stat === "atk" || p.stat === "def") target.passive[p.stat] += p.percent;
        else extra.set(p.stat, (extra.get(p.stat) ?? 0) + p.percent);
      }
      target.passive.atk = Math.min(50, target.passive.atk);
      target.passive.def = Math.min(50, target.passive.def);
      extraPassives.set(target, extra);
    }
  };
  const bonus = (u, key2) => extraPassives.get(u)?.get(key2) ?? 0;
  const category = (s) => ["atk_up", "def_up"].includes(s.type) ? "buff" : ["shield", "hot", "counter", "taunt"].includes(s.type) ? "protection" : ["atk_down", "def_down"].includes(s.type) ? "debuff" : s.type;
  const periodicTotal = (values) => values.length ? Math.min(values.reduce((a, b) => a + b, 0), Math.max(...values) * config.periodicCapMultiplier) : 0;
  const periodicAmount = (t, s) => (s.amount ?? 0) * (s.type === "hot" ? 1 + Math.min(config.healingBonusCap, (s.healingBonus ?? 0) + bonus(t, "P11")) / 100 : 1);
  let currentActor;
  let currentHasDamage = false;
  let applyingSkill = false;
  const applicable = (t, e, skillId) => {
    if (e.type === "cleanse") return alive(t) && t.statuses.some((s) => category(s) === e.cleanseCategory);
    if (e.type === "revive")
      return !alive(t);
    if (!alive(t))
      return false;
    if (e.type === "stun")
      return !t.immune && !t.statuses.some((s) => s.type === "stun");
    if (["atk_up", "def_up", "atk_down", "def_down"].includes(e.type)) {
      const cap = e.type === "atk_up" ? 50 : e.type === "def_up" ? 100 : e.type === "atk_down" ? 30 : 50;
      return !t.statuses.some((s) => s.sourceSkillId === skillId && !(applyingSkill && s.appliedAction === serial && s.type !== e.type)) && sum(t, e.type) < cap;
    }
    if (["dot", "hot", "shield", "taunt", "counter"].includes(e.type)) {
      if (t.statuses.some((s) => s.sourceSkillId === skillId && !(applyingSkill && s.appliedAction === serial && s.type !== e.type))) return false;
      if (e.type === "shield") return t.statuses.filter((s) => s.type === "shield").reduce((a, s) => a + (s.amount ?? 0), 0) < t.stats.hp * config.shieldHpCap;
      if ((e.type === "dot" || e.type === "hot") && currentActor && !currentHasDamage) {
        const values = t.statuses.filter((s) => s.type === e.type).map((s) => periodicAmount(t, s));
        const amount = stat(currentActor, "atk") * e.power / 100 * (e.type === "hot" ? 1 + Math.min(config.healingBonusCap, bonus(currentActor, "P10") + bonus(t, "P11")) / 100 : 1);
        return periodicTotal([...values, amount]) > periodicTotal(values);
      }
    }
    return true;
  };
  const select = (u, target, candidates, preview = false) => {
    let list = candidates ?? (["self", "lowest_ally", "all_allies", "dead_ally", "first_ally", "highest_atk_ally", "counter_ally", "dot_ally"].includes(target) ? side(u) : opposite(u)).filter((t) => target === "dead_ally" ? !alive(t) : alive(t));
    if (target === "self")
      return list.includes(u) ? [u] : [];
    if (target === "all_allies" || target === "all_enemies")
      return list;
    if (target === "last") list = [...list].reverse();
    if (target === "highest_atk_ally") list = [...list].sort((a, b) => b.stats.atk - a.stats.atk);
    if (target === "highest_atk_enemy") list = [...list].sort((a, b) => stat(b, "atk") - stat(a, "atk"));
    if (target === "counter_ally") list = [...list].sort((a, b) => Number(b.statuses.some((s) => s.type === "taunt")) - Number(a.statuses.some((s) => s.type === "taunt")));
    if (target === "dot_ally") list = [...list].sort((a, b) => Number(b.statuses.some((s) => s.type === "dot")) - Number(a.statuses.some((s) => s.type === "dot")));
    if (target === "lowest_hp")
      list = [...list].sort((a, b) => a.hp - b.hp);
    if (target === "highest_hp")
      list = [...list].sort((a, b) => b.hp - a.hp);
    if (target === "lowest_ally" || target === "lowest_hp_ratio")
      list = [...list].sort((a, b) => a.hp / a.stats.hp - b.hp / b.stats.hp);
    if (target === "highest_hp_ratio")
      list = [...list].sort((a, b) => b.hp / b.stats.hp - a.hp / a.stats.hp);
    if (target === "random" && list.length && !preview)
      return [list[Math.floor(random() * list.length)]];
    return list.slice(0, 1);
  };
  const effectTargets = (u, skill, e, selected, preview = false) => {
    currentActor = u;
    currentHasDamage = skill.effects.some((e2) => e2.type === "damage");
    const rule = e.target && e.target !== "selected" ? e.target : skill.target;
    if (rule === "dot_ally" && (!selected || e.target && e.target !== "selected")) {
      const poison = side(u).filter((t) => alive(t) && t.statuses.some((s) => s.type === "dot"));
      if (poison.length) return poison.slice(0, 1);
      return select(u, "lowest_ally", side(u).filter((t) => alive(t) && t.hp / t.stats.hp <= 0.5), preview);
    }
    if (e.type === "heal") {
      if (selected && (!e.target || e.target === "selected"))
        return selected.filter(alive);
      const living = side(u).filter(alive);
      if (rule === "self")
        return alive(u) ? [u] : [];
      if (rule === "all_allies")
        return living.filter((t) => t.hp / t.stats.hp <= 0.6).length >= Math.ceil(living.length / 2) ? living : [];
      return select(u, "lowest_ally", living.filter((t) => t.hp / t.stats.hp <= 0.5), preview);
    }
    if (selected && (!e.target || e.target === "selected"))
      return selected.filter((t) => applicable(t, e, skill.id));
    if (e.type === "damage" && rule === "first" && !skill.fixedTarget) {
      const taunting = opposite(u).filter((t) => alive(t) && t.statuses.some((s) => s.type === "taunt"));
      if (taunting.length) return taunting.slice(0, 1);
    }
    const all = ["self", "lowest_ally", "all_allies", "dead_ally", "first_ally", "highest_atk_ally", "counter_ally", "dot_ally"].includes(rule) ? side(u) : opposite(u);
    if (e.type === "hot" && rule === "all_allies" && !all.some((t) => t.hp < t.stats.hp && applicable(t, e, skill.id))) return [];
    if (e.type === "hot" && rule === "lowest_ally") return select(u, rule, all.filter((t) => t.hp < t.stats.hp && applicable(t, e, skill.id)), preview);
    return select(u, rule, all.filter((t) => applicable(t, e, skill.id)), preview);
  };
  const usable = (u, s) => !s.unsupportedReason && condition(u, s.condition) && s.effects.some((e) => effectTargets(u, s, e, void 0, true).length > 0);
  const choose = (u, discount = 1) => u.skills.find((s) => usable(u, s) && Math.ceil(s.spCost * discount) <= (u.enemy ? u.sp : partySp));
  const basic = (u) => ({ id: "basic", name: "\u901A\u5E38\u653B\u6483", image: "", rarity: "N", element: u.element, spCost: 0, condition: { type: "always" }, target: "first", effects: [{ type: "damage", power: 100 }], description: "" });
  let hitThisAction = /* @__PURE__ */ new Set();
  let directTargets = /* @__PURE__ */ new Map();
  let effectSequence = 0;
  let isCounter = false;
  const absorb = (t, amount, u, skill) => {
    let remaining = amount;
    const shields = t.statuses.filter((s) => s.type === "shield").sort((a, b) => a.remaining - b.remaining || (a.sequence ?? 0) - (b.sequence ?? 0));
    for (const shield of shields) {
      const used = Math.min(remaining, shield.amount ?? 0);
      shield.amount = (shield.amount ?? 0) - used;
      remaining -= used;
      if (!remaining) break;
    }
    t.statuses = t.statuses.filter((s) => s.type !== "shield" || (s.amount ?? 0) > 0);
    if (remaining < amount) frame("action", `${t.name} \u30B7\u30FC\u30EB\u30C9\u5438\u53CE ${amount - remaining}`, u, skill, { event: "shield_absorbed", targetIds: [t.id] });
    t.hp = Math.max(0, t.hp - remaining);
    return remaining;
  };
  const damageBonus = (u, t, skill) => {
    let value = isCounter ? bonus(u, "P13") : skill.id === "basic" ? bonus(u, "P05") : bonus(u, skill.target === "all_enemies" ? "P07" : "P06");
    if (targetConditions.get(t)?.debuff) value += bonus(u, "P08");
    if (targetConditions.get(t)?.dot) value += bonus(u, "P09");
    return Math.min(config.damageBonusCap, value);
  };
  const applyEffect = (u, targets, e, skill) => {
    currentActor = u;
    currentHasDamage = skill.effects.some((e2) => e2.type === "damage");
    const plans = targets.filter((t) => applicable(t, e, skill.id)).map((t) => {
      const success = e.chance === void 0 || random() < e.chance;
      let power2 = e.power;
      if (e.bonusCondition && (e.bonusCondition === "debuff" && t.statuses.some((s) => s.type === "atk_down" || s.type === "def_down") || e.bonusCondition === "dot" && t.statuses.some((s) => s.type === "dot") || e.bonusCondition === "hp_below" && u.hp / u.stats.hp <= (e.hpThreshold ?? config.lowHpThreshold))) power2 = e.bonusPower ?? power2;
      const amount = e.type === "damage" ? Math.max(1, Math.floor((stat(u, "atk") * power2 / 100 - stat(t, "def")) * elementMultiplier2(skill.element, t.element, { ...input.rules, advantageMultiplier: 1.5, disadvantageMultiplier: 0.75 }) * (0.9 + random() * 0.2) * (1 + damageBonus(u, t, skill) / 100))) : e.type === "heal" ? Math.max(0, Math.floor((e.healingFormula === "target_max_hp_percent" ? t.stats.hp : stat(u, "atk")) * power2 / 100 * (1 + Math.min(config.healingBonusCap, bonus(u, "P10") + bonus(t, "P11")) / 100))) : e.type === "revive" ? Math.max(1, Math.floor(t.stats.hp * power2 / 100)) : e.type === "shield" ? Math.max(0, Math.floor(stat(u, "atk") * power2 / 100 * (1 + Math.min(config.shieldBonusCap, bonus(u, "P12")) / 100))) : e.type === "dot" || e.type === "hot" ? stat(u, "atk") * power2 / 100 : power2;
      return { t, success, amount };
    });
    for (const { t, success, amount } of plans) {
      if (!success) {
        frame("action", `${t.name}\uFF1A${e.type} \u4E0D\u6210\u7ACB`, u, skill, { event: "effect_miss", targetIds: [t.id] });
        continue;
      }
      if (e.type === "damage") {
        const hpDamage = absorb(t, amount, u, skill);
        if (!u.enemy && t.enemy) {
          totalDamage += hpDamage;
          const a = analysis.find((a2) => a2.id === u.id);
          if (a) a.damage += hpDamage;
        }
        if (!isCounter && !skill.id.startsWith("death:")) directTargets.set(t, t.deaths);
        if (t.enemy && !hitThisAction.has(t) && !skill.id.startsWith("death:")) {
          hitThisAction.add(t);
          if (t.inBlock) t.pendingSp += t.hitSpGain;
          else t.sp = Math.min(t.stats.sp, t.sp + t.hitSpGain);
        }
        frame(u.enemy ? "enemy" : "action", `${t.name} \u2212${hpDamage}`, u, skill, { event: isCounter ? "counter" : "damage", targetIds: [t.id], hits: splitDisplayDamage(hpDamage, e.displayHits ?? 1) });
      } else if (e.type === "heal" || e.type === "revive") {
        const actual = Math.min(t.stats.hp - t.hp, amount);
        t.hp += actual;
        if (e.type === "revive" && t.hp > 0) {
          t.dead = false;
          if (t.enemy) {
            t.sp = 0;
            t.pendingSp = 0;
            t.count = t.initialCount;
            t.revivedAt = serial;
          }
        }
        const a = analysis.find((a2) => a2.id === u.id);
        if (a) a.healing += actual;
        frame("action", `${t.name} ${e.type === "revive" ? "\u8607\u751F" : "\u56DE\u5FA9"} +${actual}`, u, skill, { event: e.type, targetIds: [t.id] });
      } else if (e.type === "cleanse") {
        const candidates = t.statuses.filter((s) => category(s) === e.cleanseCategory).sort((a, b) => (b.appliedAction ?? 0) - (a.appliedAction ?? 0) || (a.sequence ?? 0) - (b.sequence ?? 0)).slice(0, Math.floor(e.power));
        t.statuses = t.statuses.filter((s) => !candidates.includes(s));
        if (candidates.some((s) => s.type === "stun")) t.immune = true;
        frame("action", `${t.name} ${e.cleanseCategory} ${candidates.length}\u4EF6\u89E3\u9664`, u, skill, { event: "cleanse", targetIds: [t.id], reason: e.cleanseCategory });
      } else {
        const stored = e.type === "shield" ? Math.min(amount, Math.max(0, t.stats.hp * config.shieldHpCap - t.statuses.filter((s) => s.type === "shield").reduce((n, s) => n + (s.amount ?? 0), 0))) : amount;
        if (e.type === "shield" && stored <= 0) continue;
        t.statuses.push({ type: e.type, power: e.power, remaining: e.type === "stun" ? 1 : e.duration ?? 3, carry: true, sourceId: u.id, sourceEnemy: u.enemy, sourceSkillId: skill.id, appliedAction: serial, amount: ["dot", "hot", "shield"].includes(e.type) ? stored : void 0, healingBonus: e.type === "hot" ? bonus(u, "P10") : void 0, sequence: effectSequence++ });
        frame("action", `${t.name}\uFF1A${e.type} \u4ED8\u4E0E`, u, skill, { event: "effect_applied", targetIds: [t.id] });
      }
    }
  };
  const deaths = (attacker) => {
    const queue = [];
    const collect = (cause = attacker) => {
      for (const u of [...side(cause), ...opposite(cause)])
        if (u.hp <= 0 && !u.dead) {
          u.dead = true;
          u.deaths++;
          u.statuses = [];
          u.immune = false;
          u.sp = 0;
          u.pendingSp = 0;
          u.count = 0;
          frame("action", `${u.name} \u6226\u95D8\u4E0D\u80FD`, u, void 0, { event: "death" });
          for (let index = 0; index < (u.deathEffects?.length ?? 0); index++)
            if (!u.usedDeath.has(index)) {
              u.usedDeath.add(index);
              queue.push({ u, effect: u.deathEffects[index], index });
            }
        }
    };
    collect();
    passives(false);
    while (queue.length) {
      const { u, effect, index } = queue.shift();
      const s = { ...basic(u), id: `death:${u.id}:${index}`, effects: [effect] };
      const targets = effect.target ? effectTargets(u, { ...s, target: effect.target === "selected" ? "first" : effect.target }, effect) : effect.type === "revive" ? [u] : ["damage", "atk_down", "def_down", "stun"].includes(effect.type) ? opposite(u) : side(u);
      applyEffect(u, targets, effect, s);
      collect(u);
      passives(false);
    }
  };
  const check = () => {
    if (!party.some(alive)) {
      ended = "lose";
      reason = enemies.some(alive) ? "party_defeated" : "mutual_annihilation";
    } else if (!enemies.some(alive) && wave === input.waves.length - 1) {
      ended = "win";
      reason = "final_wave_defeated";
    }
  };
  const phases = () => {
    for (const u of enemies.filter(alive)) {
      const next = u.phaseIndex + 1, p = u.phases?.[next];
      if (p && u.hp / u.stats.hp <= p.hpBelow) {
        u.phaseIndex = next;
        u.phase = p.name;
        if (p.image)
          u.image = p.image;
        if (p.skills)
          u.skills = [...p.skills];
        if (p.actionCount !== void 0)
          u.resetCount = p.actionCount;
        if (p.maxSp !== void 0) {
          u.stats.sp = p.maxSp;
          u.sp = Math.min(u.sp, p.maxSp);
        }
        frame("phase", `${u.name}\uFF1A${p.name}`, u, void 0, { event: "phase" });
      }
    }
  };
  const act = (u, skill, discount) => {
    serial++;
    if (serial > 1e5)
      throw new Error("Battle execution safety guard exceeded");
    if (!u.enemy)
      playerActions++;
    const beforeSp = partySp, beforeGauge = gauge;
    const cost = Math.ceil(skill.spCost * discount);
    if (u.enemy)
      u.sp -= cost;
    else
      partySp -= cost;
    frame(u.enemy ? "enemy" : "action", `${u.name} \xB7 ${skill.name} SP \u2212${cost}`, u, skill, { event: "action_start" });
    const main = skill.effects.find((e) => (!e.target || e.target === "selected") && effectTargets(u, skill, e, void 0, true).length > 0);
    const selected = skill.target === "all_allies" ? side(u).filter(alive) : skill.target === "all_enemies" ? opposite(u).filter(alive) : main ? effectTargets(u, skill, main) : void 0;
    hitThisAction = /* @__PURE__ */ new Set();
    directTargets = /* @__PURE__ */ new Map();
    applyingSkill = true;
    for (const e of skill.effects)
      applyEffect(u, effectTargets(u, skill, e, selected), e, skill);
    applyingSkill = false;
    deaths(u);
    const attacked = [...opposite(u)].filter((t) => directTargets.has(t));
    for (const t of attacked) {
      if (!alive(u) || !alive(t) || t.deaths !== directTargets.get(t) || stunned(t)) continue;
      const counter = t.statuses.filter((s) => s.type === "counter").sort((a, b) => b.power - a.power)[0];
      if (!counter) continue;
      isCounter = true;
      hitThisAction = /* @__PURE__ */ new Set();
      const skillCounter = { ...basic(t), id: `counter:${counter.sourceSkillId}`, name: "\u53CD\u6483", effects: [{ type: "damage", power: counter.power }] };
      applyEffect(t, [u], skillCounter.effects[0], skillCounter);
      isCounter = false;
      deaths(t);
    }
    if (alive(u)) {
      const effects = u.statuses.filter((s) => s.type === "dot" && s.appliedAction !== serial);
      if (effects.length) {
        const amount = Math.floor(periodicTotal(effects.map((s) => periodicAmount(u, s))));
        const hpDamage = absorb(u, amount, u, skill);
        if (u.enemy) {
          totalDamage += hpDamage;
        }
        frame("action", `${u.name} \u7D99\u7D9A\u30C0\u30E1\u30FC\u30B8 \u2212${hpDamage}`, u, skill, { event: "dot", targetIds: [u.id] });
        deaths(u);
      }
    }
    if (alive(u)) {
      const effects = u.statuses.filter((s) => s.type === "hot" && s.appliedAction !== serial);
      if (effects.length) {
        const amount = Math.min(u.stats.hp - u.hp, Math.floor(periodicTotal(effects.map((s) => periodicAmount(u, s)))));
        u.hp += amount;
        frame("action", `${u.name} \u7D99\u7D9A\u56DE\u5FA9 +${amount}`, u, skill, { event: "hot", targetIds: [u.id] });
      }
    }
    u.actions++;
    for (const s of u.statuses)
      if (s.type !== "stun" && s.appliedAction !== serial)
        s.remaining--;
    for (const s of u.statuses.filter((s2) => s2.remaining <= 0))
      frame("action", `${u.name}\uFF1A${s.type} \u7D42\u4E86`, u, skill, { event: "effect_expired" });
    u.statuses = u.statuses.filter((s) => s.remaining > 0);
    u.immune = false;
    if (!u.enemy) {
      const a = analysis.find((a2) => a2.id === u.id);
      a.actions++;
      a.skills += Number(skill.id !== "basic");
      if (!burst) {
        const gain = commonSpGain(u.stats.luk, skill.id === "basic");
        partySp = Math.min(400, partySp + gain);
        gauge = Math.min(200, gauge + gain);
        a.spGenerated += gain;
      }
    }
    passives();
    check();
    if (!ended && playerActions >= 300) {
      ended = "lose";
      reason = "action_limit";
    }
    if (!ended && enemies.some(alive)) phases();
    frame(u.enemy ? "enemy" : "action", `${u.name} \u884C\u52D5\u5B8C\u4E86`, u, skill, { event: "action_end", spDelta: partySp - beforeSp, gaugeDelta: gauge - beforeGauge });
  };
  const stunned = (u) => u.statuses.some((s) => s.type === "stun");
  const skip = (u) => {
    serial++;
    if (!u.enemy)
      playerActions++;
    u.statuses = u.statuses.filter((s) => s.type !== "stun");
    u.immune = true;
    frame(u.enemy ? "enemy" : "action", `${u.name} \u884C\u52D5\u4E0D\u80FD\uFF1A\u30B9\u30AD\u30C3\u30D7\u30FB\u518D\u4ED8\u4E0E\u8010\u6027`, u, void 0, { event: "stun_skip" });
  };
  const interrupts = () => {
    for (const e of enemies.filter(alive))
      if (e.revivedAt !== serial)
        e.count--;
    frame("enemy", "\u6575\u306E\u884C\u52D5\u30AB\u30A6\u30F3\u30C8\u66F4\u65B0", void 0, void 0, { event: "counts" });
    const due = enemies.filter((e) => alive(e) && e.count <= 0).sort((a, b) => a.order - b.order).map((e) => ({ e, deaths: e.deaths }));
    for (const entry of due) {
      const u = entry.e;
      if (!alive(u) || u.deaths !== entry.deaths || ended || !enemies.some(alive))
        continue;
      frame("enemy", `${u.name} \u5272\u8FBC\u307F`, u, void 0, { event: "interrupt_start" });
      if (stunned(u))
        skip(u);
      else {
        u.inBlock = true;
        const blockDeaths = u.deaths;
        let skill = choose(u);
        if (!skill)
          act(u, basic(u), 1);
        while (skill && alive(u) && u.deaths === blockDeaths && !ended && enemies.some(alive)) {
          if (stunned(u)) {
            skip(u);
            break;
          }
          act(u, skill, 1);
          if (!alive(u) || ended || stunned(u)) {
            if (alive(u) && stunned(u) && !ended)
              skip(u);
            break;
          }
          skill = choose(u);
        }
        u.inBlock = false;
        if (alive(u))
          u.sp = Math.min(u.stats.sp, u.sp + u.pendingSp);
        u.pendingSp = 0;
      }
      if (alive(u) && u.revivedAt !== serial)
        u.count = u.resetCount;
      frame("enemy", `${u.name} \u5272\u8FBC\u307F\u7D42\u4E86`, u, void 0, { event: "interrupt_end" });
    }
  };
  passives();
  frame("start", "\u5408\u6226\u958B\u59CB\uFF1A\u5171\u901ASP 0/400\u30FB\u30D0\u30FC\u30B9\u30C8\u30B2\u30FC\u30B8 0/200", void 0, void 0, { event: "start" });
  let cursor = 0;
  while (!ended) {
    const u = party[cursor % party.length];
    cursor++;
    if (!alive(u))
      continue;
    let skipped = false;
    if (stunned(u)) {
      skip(u);
      skipped = true;
    } else {
      if (gauge >= 200) {
        gauge = 0;
        burst = random() < commonBurstChance(u.stats.luk);
        if (burst)
          analysis.find((a) => a.id === u.id).bursts++;
        frame("burst", burst ? `${u.name} BURST\uFF1A\u6700\u59275\u884C\u52D5` : `${u.name} BURST\u62BD\u9078\u5931\u6557`, u, void 0, { event: burst ? "burst_start" : "burst_failed" });
      }
      const deathCount = u.deaths, count = burst ? 5 : 1;
      for (let n = 0; n < count; n++) {
        if (stunned(u)) {
          skip(u);
          skipped = true;
          frame("burst", "\u884C\u52D5\u4E0D\u80FD\u3067BURST\u4E2D\u65AD", u, void 0, { event: "burst_interrupted" });
          break;
        }
        act(u, choose(u, burst ? 0.5 : 1) ?? basic(u), burst ? 0.5 : 1);
        if (ended || !enemies.some(alive) || playerActions >= 300)
          break;
        interrupts();
        if (ended || !alive(u) || u.deaths !== deathCount || !enemies.some(alive))
          break;
        if (burst && n < count - 1)
          frame("burst", `${u.name} BURST\u518D\u958B`, u, void 0, { event: "burst_resume" });
      }
    }
    if (burst) {
      burst = false;
      frame("burst", "BURST\u7D42\u4E86", u, void 0, { event: "burst_end" });
    }
    check();
    if (!ended && playerActions >= 300) {
      ended = "lose";
      reason = "action_limit";
    }
    if (ended)
      break;
    if (!enemies.some(alive)) {
      wavesCleared++;
      wave++;
      enemies = input.waves[wave].map((u2) => make(u2, true));
      passives();
      frame("wave", `WAVE ${wave + 1}\uFF1AHP\u30FBSP\u30FB\u30B2\u30FC\u30B8\u30FB\u72B6\u614B\u3092\u5F15\u7D99\u304E`, void 0, void 0, { event: "wave" });
    } else if (skipped)
      interrupts();
  }
  if (!enemies.some(alive))
    wavesCleared++;
  frame("end", ended === "win" ? "\u52DD\u5229" : reason === "action_limit" ? "300\u884C\u52D5\u4E0A\u9650\uFF1A\u6557\u5317" : "\u6557\u5317", void 0, void 0, { event: "end", reason });
  return { seed: input.seed, outcome: ended, totalDamage, playerActions, wavesCleared, party: input.party, waves: input.waves, frames, analysis, rulesVersion: BALANCE_BATTLE_VERSION, reason };
}

// src/domain/redesign/battle.ts
function simulateBattle3(input) {
  if (input.rules.version === BALANCE_BATTLE_VERSION) return simulateBalanceBattle(input);
  return simulateBattle2(input);
}

// src/domain/redesign/raid.ts
var base = COMMON_CHARACTER_MASTERS[12];
var attack = COMMON_SKILL_MASTERS.find((s) => s.effects.some((e) => e.type === "damage"));
var boss = { hitSpGain: 5, id: "raid_boss", name: "\u708E\u5F71\u306E\u5B88\u5C06", image: base.image, level: 1, element: "fire", stats: { hp: 6500, sp: 110, atk: 160, def: 45, luk: 20 }, skills: [attack], passives: [], actionCount: 4, order: 0, boss: true, phases: [{ hpBelow: 0.4, name: "\u70C8\u706B\u306E\u9663", actionCount: 3 }] };
var RAID_MASTERS = [
  { id: "encounter_flame", name: "\u708E\u5F71\u306E\u5B88\u5C06", type: "encounter", enemy: boss, energyCost: 5, durationMinutes: 60, maxParticipants: 10, maxLevel: 1, appearanceLevels: [1], appearanceImages: {}, enemyGrowthPerLevel: 0.15, sharedHpGrowthPerLevel: 0.2, victoryMultiplier: 1.5, sharedHp: 15e4, participationRewards: [{ kind: "character_material", amount: 2 }], defeatRewards: [{ kind: "character_material", amount: 30 }] },
  { id: "unlock_shadow", name: "\u5E38\u95C7\u306E\u8987\u5C06", type: "unlock", enemy: { ...boss, id: "raid_shadow", name: "\u5E38\u95C7\u306E\u8987\u5C06", element: "dark", image: COMMON_CHARACTER_MASTERS[24].image }, energyCost: 5, durationMinutes: 4320, maxParticipants: 20, maxLevel: 20, appearanceLevels: [1, 10, 20], appearanceImages: { 10: COMMON_CHARACTER_MASTERS[30].image, 20: COMMON_CHARACTER_MASTERS[36].image }, enemyGrowthPerLevel: 0.15, sharedHpGrowthPerLevel: 0.2, victoryMultiplier: 1.5, sharedHp: 2e5, participationRewards: [{ kind: "skill_material", amount: 2 }], defeatRewards: [{ kind: "skill_material", amount: 15 }, { kind: "equipment_material", amount: 5 }] }
];
function getRaidMaster(id) {
  const master = RAID_MASTERS.find((m) => m.id === id);
  if (!master) throw new Error("\u5BFE\u8C61\u30EC\u30A4\u30C9\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093\u3002");
  return master;
}
function getRoomRaidMaster(room) {
  return room.territorySnapshot?.raidMaster ?? getRaidMaster(room.masterId);
}
function raidAppearanceLevel(master, level) {
  return Math.max(1, ...master.appearanceLevels.filter((n) => n <= level));
}
function raidEnemy(master, level) {
  const appearanceLevel = raidAppearanceLevel(master, level);
  return { ...structuredClone(master.enemy), level, image: master.appearanceImages[String(appearanceLevel)] ?? master.enemy.image, stats: Object.fromEntries(Object.entries(master.enemy.stats).map(([key2, value]) => [key2, Math.round(value * (1 + (level - 1) * master.enemyGrowthPerLevel))])) };
}
function createRaidRoom(masterId, ownerId, id, now, territorySnapshot) {
  const m = territorySnapshot?.raidMaster ?? getRaidMaster(masterId);
  return { ...territorySnapshot ? { territorySnapshot: structuredClone(territorySnapshot) } : {}, id, masterId, ownerId, level: 1, hp: m.sharedHp, maxHp: m.sharedHp, createdAt: new Date(now).toISOString(), expiresAt: new Date(now + m.durationMinutes * 6e4).toISOString(), status: "active", rescueCount: 0, rescueWindowStartedAt: new Date(now).toISOString(), participants: [{ userId: ownerId, name: "\u4E3B\u50AC\u8005", wins: 0, attempts: 0, totalDamage: 0, joinedLevel: 1 }], settledBattleIds: [], rewardGrants: [] };
}
function applyRaidAction(original, originalState, action, payload = {}, now = Date.now(), acquisitionMaster) {
  const room = structuredClone(original), state = structuredClone(originalState), master = getRoomRaidMaster(room);
  if (room.status === "active" && Date.parse(room.expiresAt) <= now) room.status = "expired";
  let me = room.participants.find((p) => p.userId === state.userId);
  if (action === "raid_claim") {
    for (const g of room.rewardGrants) if (g.userId === state.userId && !g.claimed) {
      g.rewards.forEach((r, i) => Object.assign(state, grantReward(state, r, `${room.id}:${g.id}:${i}`, acquisitionMaster)));
      g.claimed = true;
    }
    return { room, state };
  }
  if (action === "raid_refresh") return { room, state };
  if (action === "raid_battle" && payload.battleId && room.settledBattleIds.includes(payload.battleId)) return { room, state };
  if (action === "encounter_ignore") {
    if (master.type !== "encounter" || room.ownerId !== state.userId || !me || me.attempts > 0) throw new Error("\u3053\u306E\u906D\u9047\u306F\u7121\u8996\u3067\u304D\u307E\u305B\u3093\u3002");
    me.leftAt = new Date(now).toISOString();
    room.status = "expired";
    return { room, state };
  }
  if (room.status !== "active" && action !== "raid_battle") throw new Error("\u3053\u306E\u30EC\u30A4\u30C9\u306F\u7D42\u4E86\u3057\u307E\u3057\u305F\u3002");
  if (me?.leftAt && action !== "raid_battle") throw new Error("\u9000\u51FA\u6E08\u307F\u306E\u30EC\u30A4\u30C9\u306B\u306F\u518D\u53C2\u52A0\u3067\u304D\u307E\u305B\u3093\u3002");
  if (action === "raid_join") {
    if (!me) {
      if (room.participants.filter((p) => !p.leftAt).length >= master.maxParticipants) throw new Error("\u53C2\u52A0\u4EBA\u6570\u304C\u4E0A\u9650\u306B\u9054\u3057\u3066\u3044\u307E\u3059\u3002");
      me = { userId: state.userId, name: payload.name || "\u53C2\u6226\u8005", wins: 0, attempts: 0, totalDamage: 0, joinedLevel: room.level };
      room.participants.push(me);
    }
    return { room, state };
  }
  if (!me) throw new Error("\u5148\u306B\u30EC\u30A4\u30C9\u3078\u53C2\u52A0\u3057\u3066\u304F\u3060\u3055\u3044\u3002");
  if (action === "raid_leave") {
    if (room.ownerId === state.userId) throw new Error("\u4E3B\u50AC\u8005\u306F\u9000\u51FA\u3067\u304D\u307E\u305B\u3093\u3002");
    me.leftAt = new Date(now).toISOString();
    return { room, state };
  }
  if (action === "raid_rescue") {
    if (master.type === "unlock" && now - Date.parse(room.rescueWindowStartedAt) >= 216e5) {
      room.rescueCount = 0;
      room.rescueWindowStartedAt = new Date(now).toISOString();
    }
    if (room.rescueCount >= 3) throw new Error("\u6551\u63F4\u4F9D\u983C\u306E\u6B8B\u308A\u56DE\u6570\u304C\u3042\u308A\u307E\u305B\u3093\u3002");
    room.rescueCount++;
    return { room, state };
  }
  if (action === "raid_battle") {
    if (!payload.battleId || !payload.result) throw new Error("\u30B5\u30FC\u30D0\u30FC\u306E\u6226\u95D8\u7D50\u679C\u304C\u5FC5\u8981\u3067\u3059\u3002");
    if (room.settledBattleIds.includes(payload.battleId)) return { room, state };
    const appliesToSharedHp = payload.battleLevel === room.level && room.status === "active" && !me.leftAt;
    if (!payload.energyAlreadyPaid) {
      if (state.energy < master.energyCost) throw new Error("\u884C\u52D5\u529B\u304C\u8DB3\u308A\u307E\u305B\u3093\u3002");
      state.energy -= master.energyCost;
    }
    const damage = Math.max(0, Math.floor(payload.result.totalDamage * (payload.result.outcome === "win" ? master.victoryMultiplier : 1)));
    if (!Number.isFinite(damage)) throw new Error("\u6226\u95D8\u7D50\u679C\u304C\u4E0D\u6B63\u3067\u3059\u3002");
    me.attempts++;
    me.wins += payload.result.outcome === "win" ? 1 : 0;
    me.totalDamage += damage;
    me.lastResult = payload.result.outcome === "win" ? "\u52DD\u5229" : "\u6557\u5317";
    if (appliesToSharedHp) room.hp = Math.max(0, room.hp - damage);
    room.settledBattleIds.push(payload.battleId);
    if (me.attempts === 1) room.rewardGrants.push({ id: `participation:${state.userId}`, userId: state.userId, level: room.level, rewards: master.participationRewards, claimed: false });
    if (appliesToSharedHp && room.hp === 0) {
      for (const p of room.participants) if (!p.leftAt && p.wins >= 3 && p.joinedLevel <= room.level) room.rewardGrants.push({ id: `defeat:${room.level}:${p.userId}`, userId: p.userId, level: room.level, rewards: master.defeatRewards, claimed: false });
      if (master.type === "unlock" && room.level < master.maxLevel) {
        room.level++;
        room.maxHp = Math.round(master.sharedHp * (1 + (room.level - 1) * master.sharedHpGrowthPerLevel));
        room.hp = room.maxHp;
      } else room.status = "defeated";
    }
    return { room, state };
  }
  throw new Error("\u5BFE\u5FDC\u3057\u3066\u3044\u306A\u3044\u30EC\u30A4\u30C9\u64CD\u4F5C\u3067\u3059\u3002");
}

// src/domain/redesign/territory.ts
var TERRITORY_MASTER = {
  version: "PREVIEW_PROVISIONAL_20260920_balance_v2",
  status: "PREVIEW_PROVISIONAL",
  initialExp: 0,
  legacyMigrationExp: 0,
  levelCap: 3,
  levels: [{ level: 1, requiredExp: 0, hostingSlots: 1 }, { level: 2, requiredExp: 100, hostingSlots: 2 }, { level: 3, requiredExp: 300, hostingSlots: 3 }],
  destinations: [
    { id: "azuchi", name: "\u5B89\u571F\u57CE\u3078\u306E\u4FB5\u653B", castle: "\u5B89\u571F\u57CE", difficulty: "\u901A\u5E38", itemSource: "\u30AF\u30A8\u30B9\u30C8\u306E\u30EC\u30A2\u5831\u916C", raidMasterId: "unlock_shadow", requiredLevel: 1, itemName: "\u9818\u571F\u4FB5\u653B\u672D", itemId: "raid_unlock", itemCount: 1, durationMinutes: 4320, clearExp: 100 },
    { id: "gifu", name: "\u5C90\u961C\u57CE\u3078\u306E\u4FB5\u653B", castle: "\u5C90\u961C\u57CE", difficulty: "\u4E0A\u4F4D", itemSource: "\u30AF\u30A8\u30B9\u30C8\u306E\u30EC\u30A2\u5831\u916C", raidMasterId: "unlock_shadow", requiredLevel: 2, itemName: "\u9818\u571F\u4FB5\u653B\u672D", itemId: "raid_unlock", itemCount: 1, durationMinutes: 4320, clearExp: 100 }
  ],
  battleRules: structuredClone(BATTLE_RULES),
  raidMasters: RAID_MASTERS.filter((m) => m.type === "unlock").map((master) => ({ ...structuredClone(master), enemy: prepareBattleWaves([[master.enemy]], BATTLE_RULES)[0][0] }))
};
function validateTerritoryMaster(master) {
  const natural = (v) => Number.isSafeInteger(v) && v >= 0;
  if (!master.version || !["PREVIEW_PROVISIONAL", "APPROVED"].includes(master.status) || !natural(master.initialExp) || !natural(master.legacyMigrationExp) || !natural(master.levelCap) || master.levelCap < 1 || master.levels.length !== master.levelCap) throw Error("\u9818\u571F\u4FB5\u653B\u30DE\u30B9\u30BF\u30FC\u306E\u6210\u9577\u8A2D\u5B9A\u304C\u4E0D\u6B63\u3067\u3059\u3002");
  for (let i = 0; i < master.levels.length; i++) {
    const row = master.levels[i];
    if (row.level !== i + 1 || !natural(row.requiredExp) || !natural(row.hostingSlots) || row.hostingSlots < 1 || i === 0 && row.requiredExp !== 0 || i > 0 && (row.requiredExp <= master.levels[i - 1].requiredExp || row.hostingSlots < master.levels[i - 1].hostingSlots)) throw Error("\u9818\u571F\u4FB5\u653B\u30EC\u30D9\u30EB\u8868\u306E\u9806\u5E8F\u304C\u4E0D\u6B63\u3067\u3059\u3002");
  }
  const positive = (v) => Number.isFinite(v) && v > 0;
  const nonnegative = (v) => Number.isFinite(v) && v >= 0;
  const rules = master.battleRules;
  if (!rules || !positive(rules.advantageMultiplier) || !positive(rules.disadvantageMultiplier) || !positive(rules.spRecoveryDivisor) || !positive(rules.burstLukDivisor) || !positive(rules.enemySpRecoveryDivisor) || !natural(rules.maxPlayerActions) || rules.maxPlayerActions < 1 || !nonnegative(rules.defenseFactor) || !nonnegative(rules.initialSpRatio) || rules.initialSpRatio > 1) throw Error("\u9818\u571F\u4FB5\u653B\u306E\u6226\u95D8\u30EB\u30FC\u30EB\u304C\u4E0D\u6B63\u3067\u3059\u3002");
  for (const raid of master.raidMasters) {
    if (!raid.id || !natural(raid.energyCost) || !natural(raid.durationMinutes) || raid.durationMinutes < 1 || !natural(raid.maxParticipants) || raid.maxParticipants < 1 || !natural(raid.maxLevel) || raid.maxLevel < 1 || !positive(raid.sharedHp) || !nonnegative(raid.victoryMultiplier) || !nonnegative(raid.enemyGrowthPerLevel) || !nonnegative(raid.sharedHpGrowthPerLevel)) throw Error("\u9818\u571F\u4FB5\u653B\u306E\u30DC\u30B9\u8A2D\u5B9A\u304C\u4E0D\u6B63\u3067\u3059\u3002");
    if (!raid.enemy || !positive(raid.enemy.stats.hp) || !Object.values(raid.enemy.stats).every(nonnegative) || !natural(raid.enemy.actionCount) || raid.enemy.actionCount < 1 || !raid.appearanceImages || !Array.isArray(raid.appearanceLevels) || raid.appearanceLevels[0] !== 1 || raid.appearanceLevels.some((lv, i) => !natural(lv) || lv > raid.maxLevel || i > 0 && lv <= raid.appearanceLevels[i - 1])) throw Error("\u9818\u571F\u4FB5\u653B\u306E\u6575\u30FB\u898B\u305F\u76EE\u6BB5\u968E\u304C\u4E0D\u6B63\u3067\u3059\u3002");
    for (const reward of [...raid.participationRewards, ...raid.defeatRewards]) if (!natural(reward.amount) || reward.chance !== void 0 && (!nonnegative(reward.chance) || reward.chance > 1)) throw Error("\u9818\u571F\u4FB5\u653B\u306E\u5831\u916C\u8A2D\u5B9A\u304C\u4E0D\u6B63\u3067\u3059\u3002");
  }
  if (new Set(master.destinations.map((d) => d.id)).size !== master.destinations.length || new Set(master.raidMasters.map((m) => m.id)).size !== master.raidMasters.length) throw Error("\u9818\u571F\u4FB5\u653B\u30DE\u30B9\u30BF\u30FC\u306EID\u304C\u91CD\u8907\u3057\u3066\u3044\u307E\u3059\u3002");
  for (const d of master.destinations) {
    const raid = master.raidMasters.find((m) => m.id === d.raidMasterId);
    if (!d.id || !d.itemId || !natural(d.requiredLevel) || d.requiredLevel < 1 || d.requiredLevel > master.levelCap || !natural(d.itemCount) || d.itemCount < 1 || !natural(d.durationMinutes) || d.durationMinutes < 1 || !natural(d.clearExp) || !raid || raid.type !== "unlock" || !natural(raid.maxLevel) || raid.maxLevel < 1 || !Number.isFinite(raid.enemyGrowthPerLevel) || raid.enemyGrowthPerLevel < 0 || !Number.isFinite(raid.sharedHpGrowthPerLevel) || raid.sharedHpGrowthPerLevel < 0) throw Error("\u9818\u571F\u4FB5\u653B\u5148\u306E\u8A2D\u5B9A\u304C\u4E0D\u6B63\u3067\u3059\u3002");
  }
}
function territoryLevel(master, experience) {
  const exp = Number.isFinite(experience) ? Math.max(0, experience) : 0;
  return master.levels.reduce((level, row) => row.requiredExp <= exp ? row.level : level, 1);
}
function projectTerritory(master, progress, items, activeHostingCount) {
  validateTerritoryMaster(master);
  const experience = Math.max(0, progress.experience), level = territoryLevel(master, experience), hostingSlots = master.levels.find((row) => row.level === level).hostingSlots;
  return { masterVersion: master.version, status: master.status, experience, level, nextLevelExp: master.levels.find((row) => row.level === level + 1)?.requiredExp ?? null, hostingSlots, activeHostingCount, destinations: master.destinations.map((destination) => {
    const ownedItemCount = items[destination.itemId] ?? 0, reasons = [];
    if (level < destination.requiredLevel) reasons.push(`\u9818\u571F\u4FB5\u653BLv.${destination.requiredLevel}\u304C\u5FC5\u8981\u3067\u3059\u3002`);
    if (activeHostingCount >= hostingSlots) reasons.push("\u540C\u6642\u958B\u50AC\u67A0\u304C\u57CB\u307E\u3063\u3066\u3044\u307E\u3059\u3002");
    if (ownedItemCount < destination.itemCount) reasons.push(`\u958B\u50AC\u30A2\u30A4\u30C6\u30E0\u304C${destination.itemCount - ownedItemCount}\u500B\u4E0D\u8DB3\u3057\u3066\u3044\u307E\u3059\u3002`);
    return { ...destination, raidMaster: structuredClone(master.raidMasters.find((m) => m.id === destination.raidMasterId)), ownedItemCount, canHost: reasons.length === 0, reasons };
  }) };
}

// supabase/functions/game04-redesign-api/source.ts
var headers = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info", "Access-Control-Allow-Methods": "POST, OPTIONS", "Content-Type": "application/json", "Cache-Control": "no-store" };
var url = Deno.env.get("SUPABASE_URL");
var key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
var EXPECTED_PROJECT = "lrgyllgzcdcphlbmkknc";
var ApiError = class extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
};
async function db(path, body) {
  const response = await fetch(`${url}/rest/v1/${path}`, { method: body === void 0 ? "GET" : "POST", headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" }, ...body === void 0 ? {} : { body: JSON.stringify(body) } });
  let result;
  try {
    result = await response.json();
  } catch {
    throw new ApiError("\u63A5\u7D9A\u304C\u6DF7\u307F\u5408\u3063\u3066\u3044\u307E\u3059\u3002\u5C11\u3057\u5F85\u3063\u3066\u518D\u5EA6\u304A\u8A66\u3057\u304F\u3060\u3055\u3044\u3002", 503);
  }
  if (!response.ok) {
    const messages = {
      TERRITORY_LEVEL_REQUIRED: "\u9818\u571F\u4FB5\u653B\u30EC\u30D9\u30EB\u304C\u4E0D\u8DB3\u3057\u3066\u3044\u307E\u3059\u3002",
      TERRITORY_HOSTING_SLOTS_FULL: "\u540C\u6642\u958B\u50AC\u67A0\u304C\u57CB\u307E\u3063\u3066\u3044\u307E\u3059\u3002\u958B\u50AC\u4E2D\u306E\u4FB5\u653B\u3092\u78BA\u8A8D\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
      TERRITORY_ITEM_REQUIRED: "\u958B\u50AC\u30A2\u30A4\u30C6\u30E0\u304C\u4E0D\u8DB3\u3057\u3066\u3044\u307E\u3059\u3002",
      TERRITORY_DESTINATION_NOT_FOUND: "\u4FB5\u653B\u5148\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093\u3002\u518D\u8AAD\u307F\u8FBC\u307F\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
      REQUEST_ID_REUSED: "\u3053\u306E\u64CD\u4F5C\u306F\u51E6\u7406\u6E08\u307F\u3067\u3059\u3002\u518D\u8AAD\u307F\u8FBC\u307F\u3057\u3066\u304F\u3060\u3055\u3044\u3002"
    };
    throw new ApiError(messages[result.message] ?? result.message ?? "\u30C7\u30FC\u30BF\u3092\u4FDD\u5B58\u3067\u304D\u307E\u305B\u3093\u3067\u3057\u305F\u3002", result.code === "40001" ? 409 : response.status >= 500 ? 503 : 400);
  }
  return result;
}
var rpc = (name2, body) => db(`rpc/${name2}`, body);
async function uuidFor(value) {
  const hash = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)));
  hash[6] = hash[6] & 15 | 64;
  hash[8] = hash[8] & 63 | 128;
  const h = [...hash.slice(0, 16)].map((b) => b.toString(16).padStart(2, "0")).join("");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}
async function acquisitionInput(userId) {
  return rpc("game04_acquisition_input", { p_user_id: userId });
}
async function stateFor(userId) {
  const input = await acquisitionInput(userId);
  for (let attempt = 0; attempt < 4; attempt++) {
    const state = await rpc("game04_get_growth_state", { p_user_id: userId, p_initial: buildInitialState(userId, input.legacy) });
    const migrated = importLegacyAssets(state, input.legacy);
    const imported = applyAcquisitionEvents(migrated, input.events, input.master);
    if (JSON.stringify(imported) === JSON.stringify(state)) return state;
    try {
      return (await commit(state, imported, crypto.randomUUID())).state;
    } catch (error) {
      if (!(error instanceof ApiError) || error.status !== 409 || attempt === 3) throw error;
    }
  }
  throw new ApiError("\u30C7\u30FC\u30BF\u66F4\u65B0\u4E2D\u3067\u3059\u3002\u3082\u3046\u4E00\u5EA6\u304A\u8A66\u3057\u304F\u3060\u3055\u3044\u3002", 409);
}
async function commit(before, after, requestId, battle = null, room = null, roomVersion = null, receipt = {}) {
  return rpc("game04_commit_growth_state", {
    p_user_id: before.userId,
    p_expected_version: before.version,
    p_state: after,
    p_cash_delta: after.cash - before.cash,
    p_energy_delta: after.energy - before.energy,
    p_request_id: requestId,
    p_battle: battle,
    p_raid: room,
    p_raid_expected_version: roomVersion,
    p_receipt: receipt
  });
}
async function roomFor(id) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) throw new ApiError("\u30EC\u30A4\u30C9\u304C\u4E0D\u6B63\u3067\u3059\u3002");
  const [row] = await db(`game04_raid_rooms?id=eq.${id}&select=state,version`);
  if (!row) throw new ApiError("\u30EC\u30A4\u30C9\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093\u3002", 404);
  return { ...row.state, version: row.version };
}
async function roomsFor(userId) {
  const rows = await rpc("game04_raid_rooms_for_user", { p_user_id: userId });
  return rows.map((row) => ({
    ...row.state,
    version: row.version,
    status: row.state.status === "active" && Date.parse(row.state.expiresAt) <= Date.now() ? "expired" : row.state.status
  }));
}
async function territoryContext(userId) {
  return rpc("game04_territory_context", { p_user_id: userId });
}
async function rewardPolicy() {
  const [row] = await db("game04_redesign_master?key=eq.acquisition_conversion&select=data");
  if (!row?.data) throw new ApiError("\u7372\u5F97\u8A2D\u5B9A\u3092\u78BA\u8A8D\u3067\u304D\u307E\u305B\u3093\u3002", 503);
  return row.data;
}
async function questPlayerExpReward(stageId) {
  const [row] = await db("game04_redesign_master?key=eq.quest_player_exp&select=status,data");
  const amount = row?.data?.stages?.[stageId];
  if (amount === void 0) return { amount: 0, version: row?.data?.version ?? "UNCONFIGURED", status: "UNCONFIGURED" };
  if (!Number.isSafeInteger(amount) || amount < 0 || !row?.data?.version) throw new ApiError("\u30AF\u30A8\u30B9\u30C8EXP\u8A2D\u5B9A\u304C\u4E0D\u6B63\u3067\u3059\u3002", 503);
  return { amount, version: row.data.version, status: row.status };
}
async function missionConfig() {
  const [row] = await db("game04_redesign_master?key=eq.missions&select=data");
  return row?.data ?? { enabled: false, missions: [] };
}
async function responseFor(userId, extra = {}) {
  const statePromise = stateFor(userId);
  const [state, rooms, socialEvents, pending, territory, missions] = await Promise.all([
    statePromise,
    roomsFor(userId),
    db("game04_social_events?select=*&order=created_at.desc&limit=30"),
    db(`game04_battles?user_id=eq.${userId}&status=eq.started&select=id,kind,target_id&order=created_at.asc&limit=1`),
    statePromise.then(() => territoryContext(userId)),
    missionConfig()
  ]);
  return { state, rooms, socialEvents, missions: evaluateMissions(state, missions), territory: projectTerritory(territory.master, territory.progress, territory.items, territory.activeHostingCount), pendingBattle: pending[0] ?? null, ...extra };
}
async function runBattle(userId, name2, payload, id, playerName) {
  let preparedBattle;
  let [record] = await db(`game04_battles?id=eq.${id}&user_id=eq.${userId}&select=*`);
  if (record?.status === "settled") return responseFor(userId, record.result);
  if (!record) {
    const outstanding = await db(`game04_battles?user_id=eq.${userId}&status=eq.started&select=id&limit=1`);
    if (outstanding.length) throw new ApiError("\u672A\u5B8C\u4E86\u306E\u6226\u95D8\u3092\u518D\u958B\u3057\u3066\u304F\u3060\u3055\u3044\u3002", 409);
    const state = await stateFor(userId);
    validateDeck(state, state.deck);
    const kind = name2 === "quest_battle" ? "quest" : "raid";
    let waves, cost, targetId, raidLevel;
    let startRoom = null;
    if (kind === "quest") {
      const stage = getQuestStage(String(payload.stageId));
      if (!stage || !isQuestStageUnlocked(stage.id, state.clearedStages)) throw new ApiError("\u3053\u306E\u30B9\u30C6\u30FC\u30B8\u306F\u672A\u89E3\u653E\u3067\u3059\u3002");
      waves = stage.waves;
      cost = stage.energyCost;
      targetId = stage.id;
    } else {
      const room = await roomFor(String(payload.roomId)), master = getRoomRaidMaster(room);
      const me = room.participants.find((p) => p.userId === userId);
      if (room.status !== "active" || Date.parse(room.expiresAt) <= Date.now() || !me || me.leftAt) throw new ApiError("\u53C2\u52A0\u3067\u304D\u308B\u958B\u50AC\u4E2D\u30EC\u30A4\u30C9\u3092\u9078\u3093\u3067\u304F\u3060\u3055\u3044\u3002");
      startRoom = room;
      waves = [[raidEnemy(master, room.level)]];
      cost = master.energyCost;
      targetId = room.id;
      raidLevel = room.level;
    }
    if (state.energy < cost) throw new ApiError("\u884C\u52D5\u529B\u304C\u8DB3\u308A\u307E\u305B\u3093\u3002");
    const seed = crypto.getRandomValues(new Uint32Array(1))[0];
    const rules = startRoom?.territorySnapshot?.battleRules ?? BATTLE_RULES;
    const input = { seed, party: buildBattleParty(state, rules), waves: startRoom?.territorySnapshot ? structuredClone(waves) : prepareBattleWaves(waves, rules), rules, raidLevel, ...kind === "quest" ? { playerExpReward: await questPlayerExpReward(targetId) } : {} };
    preparedBattle = simulateBattle3(input);
    await commit(state, { ...state, energy: state.energy - cost }, id, { id, kind, targetId, seed, input, status: "started" }, startRoom, startRoom?.version ?? null);
    [record] = await db(`game04_battles?id=eq.${id}&user_id=eq.${userId}&select=*`);
    if (!record) throw new ApiError("\u6226\u95D8\u306E\u4FDD\u5B58\u72B6\u614B\u3092\u78BA\u8A8D\u3067\u304D\u307E\u305B\u3093\u3002\u518D\u958B\u3057\u3066\u304F\u3060\u3055\u3044\u3002", 503);
    if (record.status === "settled") return responseFor(userId, record.result);
    if (JSON.stringify(record.input) !== JSON.stringify(input)) preparedBattle = void 0;
  }
  const battle = preparedBattle ?? simulateBattle3(record.input);
  const settlementId = await uuidFor(`settlement:${id}`);
  for (let attempt = 0; attempt < 4; attempt++) {
    const state = await stateFor(userId);
    let after = structuredClone(state);
    let room = null, version = null;
    const rewards = [];
    let playerGrowth;
    let firstClear = false, encounterRaidId = null;
    if (record.kind === "quest" && battle.outcome === "win") {
      const stage = getQuestStage(record.target_id);
      firstClear = !state.clearedStages.includes(stage.id);
      let rng = record.seed >>> 0;
      const random = () => {
        rng = Math.imul(rng, 1664525) + 1013904223 >>> 0;
        return rng / 4294967296;
      };
      const luck = record.input.party.reduce((n, p) => n + p.stats.luk, 0) / 5;
      rewards.push(...stage.rewards, ...firstClear ? stage.firstRewards : [], ...stage.rareRewards.filter((r) => random() < Math.min(1, (r.chance ?? 0) * (1 + luck / 1e3))));
      const policy = await rewardPolicy();
      for (let i = 0; i < rewards.length; i++) after = grantReward(after, rewards[i], await uuidFor(`reward:${id}:${i}`), policy);
      if (firstClear) after.clearedStages.push(stage.id);
      const expReward = record.input.playerExpReward;
      if (expReward) {
        const progress = state.playerProgress;
        if (progress?.version === GROWTH_VERSION && progress.status === "active") {
          const grown = applyPlayerExperience(progress.level, progress.exp, expReward.amount, after.energy, after.energyMax);
          after.playerProgress = { ...progress, level: grown.level, exp: grown.exp };
          after.energy = grown.energy;
          playerGrowth = {
            status: expReward.status,
            rewardVersion: expReward.version,
            offeredExp: expReward.amount,
            gainedExp: grown.exp - progress.exp,
            beforeLevel: progress.level,
            level: grown.level,
            exp: grown.exp,
            energyRecovered: grown.energy - state.energy,
            energy: grown.energy,
            energyMax: state.energyMax
          };
        } else playerGrowth = { status: "MIGRATION_PENDING", offeredExp: expReward.amount, gainedExp: 0 };
      }
      if (random() < stage.encounterChance) {
        encounterRaidId = await uuidFor(`encounter:${id}`);
        room = createRaidRoom("encounter_flame", userId, encounterRaidId, Date.now());
        room.participants[0].name = playerName;
        version = -1;
      }
    } else if (record.kind === "raid") {
      const currentRoom = await roomFor(record.target_id);
      version = currentRoom.version;
      const transition = applyRaidAction(currentRoom, after, "raid_battle", { battleId: id, battleLevel: record.input.raidLevel, result: battle, energyAlreadyPaid: true });
      room = transition.room;
      after = transition.state;
    }
    const result = { battle, rewards, firstClear, encounterRaidId, ...playerGrowth ? { playerGrowth } : {} };
    try {
      const settled = await commit(state, after, settlementId, { id, status: "settled", result }, room, version);
      return responseFor(userId, settled.battleResult ?? result);
    } catch (error) {
      const [saved] = await db(`game04_battles?id=eq.${id}&user_id=eq.${userId}&select=status,result`);
      if (saved?.status === "settled") return responseFor(userId, saved.result);
      if (!(error instanceof ApiError) || error.status !== 409 || attempt === 3) throw error;
    }
  }
}
Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response(null, { headers });
  try {
    if (new URL(url).hostname !== `${EXPECTED_PROJECT}.supabase.co`) throw new ApiError("\u958B\u767A\u74B0\u5883\u306E\u63A5\u7D9A\u8A2D\u5B9A\u3092\u78BA\u8A8D\u3057\u3066\u304F\u3060\u3055\u3044\u3002", 503);
    if (request.method !== "POST") throw new ApiError("Method not allowed", 405);
    const authorization = request.headers.get("authorization") || "";
    if (!/^Bearer \S+$/.test(authorization)) throw new ApiError("\u30ED\u30B0\u30A4\u30F3\u3057\u3066\u304F\u3060\u3055\u3044\u3002", 401);
    const auth = await fetch(`${url}/auth/v1/user`, { headers: { apikey: key, Authorization: authorization } });
    const user = await auth.json();
    if (!auth.ok || !user.id) throw new ApiError("\u30ED\u30B0\u30A4\u30F3\u3057\u76F4\u3057\u3066\u304F\u3060\u3055\u3044\u3002", 401);
    const [profile] = await db(`users?id=eq.${user.id}&select=id,username`);
    if (!profile) throw new ApiError("\u5148\u306B\u30D7\u30EC\u30A4\u30E4\u30FC\u540D\u3092\u767B\u9332\u3057\u3066\u304F\u3060\u3055\u3044\u3002", 409);
    const { action, payload = {}, requestId } = await request.json();
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(requestId)) throw new ApiError("\u64CD\u4F5CID\u304C\u4E0D\u6B63\u3067\u3059\u3002");
    if (action === "normal_gacha_status") {
      const state2 = await stateFor(user.id);
      const pool = await db("gacha_items_master?gacha_id=in.(CHAR_NORMAL,SKILL_NORMAL,EQUIP_NORMAL)&select=gacha_id,item_id,item_type,rarity&limit=1000");
      const day = normalGachaDay(Date.now());
      return new Response(JSON.stringify(await responseFor(user.id, { normalGacha: { pool, day, available: state2.dailyNormalGachaDate !== day } })), { headers });
    }
    if (action === "get_state" || action === "raid_refresh") return new Response(JSON.stringify(await responseFor(user.id)), { headers });
    if (action === "quest_battle" || action === "raid_battle") return new Response(JSON.stringify(await runBattle(user.id, action, payload, requestId, profile.username)), { headers });
    if (action === "territory_host" || action === "raid_unlock") {
      await stateFor(user.id);
      let destinationId = String(payload.destinationId ?? "");
      if (action === "raid_unlock") {
        const context = await territoryContext(user.id);
        destinationId = context.master.destinations.find((d) => d.raidMasterId === String(payload.masterId))?.id ?? "";
      }
      const hosted = await rpc("game04_host_territory", { p_user_id: user.id, p_request_id: requestId, p_destination_id: destinationId });
      return new Response(JSON.stringify(await responseFor(user.id, { territoryRoomId: hosted.room.id })), { headers });
    }
    const [prior] = await db(`game04_requests?user_id=eq.${user.id}&request_id=eq.${requestId}&select=request_id,result`);
    if (prior) {
      const response = await responseFor(user.id, prior.result?.receipt ?? {});
      if (action === "normal_gacha") {
        const pool = await db("gacha_items_master?gacha_id=in.(CHAR_NORMAL,SKILL_NORMAL,EQUIP_NORMAL)&select=gacha_id,item_id,item_type,rarity&limit=1000");
        const day = normalGachaDay(Date.now());
        return new Response(JSON.stringify({ ...response, normalGacha: { pool, day, available: response.state.dailyNormalGachaDate !== day } }), { headers });
      }
      return new Response(JSON.stringify(response), { headers });
    }
    const state = await stateFor(user.id);
    let after, room = null, version = null;
    if (action === "normal_gacha") {
      const pool = await db("gacha_items_master?gacha_id=in.(CHAR_NORMAL,SKILL_NORMAL,EQUIP_NORMAL)&select=gacha_id,item_id,item_type,rarity&limit=1000");
      const drawn = applyNormalGacha(state, payload, pool, requestId, Date.now(), await rewardPolicy(), () => crypto.getRandomValues(new Uint32Array(1))[0] / 4294967296);
      const receipt = { normalGachaResults: drawn.results, normalGachaCost: drawn.cost, normalGachaMasterVersion: drawn.masterVersion };
      const saved = await commit(state, drawn.state, requestId, null, null, null, receipt);
      const day = normalGachaDay(Date.now());
      return new Response(JSON.stringify(await responseFor(user.id, { ...saved.receipt ?? receipt, normalGacha: { pool, day, available: saved.state?.dailyNormalGachaDate !== day } })), { headers });
    }
    if (action === "claim_mission") {
      const mission = getClaimableMission(state, await missionConfig(), String(payload.missionId));
      after = structuredClone(state);
      const policy = await rewardPolicy();
      for (let i = 0; i < mission.rewards.length; i++) after = grantReward(after, mission.rewards[i], await uuidFor(`mission:${user.id}:${mission.id}:${i}`), policy);
      after.claimedMissionIds = [...state.claimedMissionIds ?? [], mission.id];
    } else if (action === "set_home") {
      after = structuredClone(state);
      if (payload.characterId !== void 0) {
        if (!state.characters.some((c) => c.id === payload.characterId) || !CHARACTER_MASTERS.some((c) => c.id === payload.characterId)) throw new ApiError("\u672A\u6240\u6301\u306E\u6B66\u5C06\u3067\u3059\u3002");
        after.homeCharacterId = payload.characterId;
      }
      if (payload.backgroundId !== void 0) {
        if (!["castle-town", "castle-approach"].includes(payload.backgroundId)) throw new ApiError("\u80CC\u666F\u304C\u4E0D\u6B63\u3067\u3059\u3002");
        after.homeBackgroundId = payload.backgroundId;
      }
    } else if (["raid_join", "raid_leave", "raid_rescue", "raid_claim", "encounter_ignore"].includes(action)) {
      const current = await roomFor(String(payload.roomId));
      version = current.version;
      const changed = applyRaidAction(current, state, action, { name: profile.username }, Date.now(), action === "raid_claim" ? await rewardPolicy() : void 0);
      room = changed.room;
      after = changed.state;
    } else after = applyGrowthAction(state, action, payload);
    await commit(state, after, requestId, null, room, version);
    return new Response(JSON.stringify(await responseFor(user.id)), { headers });
  } catch (error) {
    const conflict = error instanceof ApiError && error.status === 409;
    const message = conflict ? "\u4ED6\u306E\u64CD\u4F5C\u3067\u66F4\u65B0\u3055\u308C\u307E\u3057\u305F\u3002\u518D\u8AAD\u307F\u8FBC\u307F\u3057\u3066\u304A\u8A66\u3057\u304F\u3060\u3055\u3044\u3002" : error instanceof Error ? error.message : "\u51E6\u7406\u306B\u5931\u6557\u3057\u307E\u3057\u305F\u3002";
    return new Response(JSON.stringify({ error: message }), { status: error instanceof ApiError ? error.status : 400, headers });
  }
});
