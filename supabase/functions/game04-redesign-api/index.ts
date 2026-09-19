// src/domain/redesign/acquisitions.ts
var PREVIEW_ACQUISITION_MASTER = {
  characterDuplicateSouls: 10,
  skillDuplicateMaterials: 2,
  characterAtCap: "pending",
  skillAtCap: "pending"
};
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
      if (!owned) state.characters.push({ id: event.masterId, level: 1, awakening: 0 });
      else {
        if (owned.awakening >= 5 && master.characterAtCap !== "convert") {
          defer("character_cap_policy_unfixed");
          continue;
        }
        const amount = master.characterDuplicateSouls;
        if (!Number.isSafeInteger(amount) || amount === null || amount < 0) {
          defer("conversion_master_unfixed");
          continue;
        }
        state.souls ??= {};
        state.souls[event.masterId] = (state.souls[event.masterId] ?? 0) + amount;
      }
    } else if (event.kind === "skill") {
      if (!SKILL_MASTERS.some((m) => m.id === event.masterId)) {
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
        const amount = master.skillDuplicateMaterials;
        if (!Number.isSafeInteger(amount) || amount === null || amount < 0) {
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
      if (!state.equipment.some((e) => e.instanceId === instanceId)) state.equipment.push({ instanceId, masterId: event.masterId, level: 1, lb: 0 });
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
var BATTLE_RULES = { defenseFactor: 0.45, advantageMultiplier: 1.5, disadvantageMultiplier: 0.75, spRecoveryDivisor: 120, burstLukDivisor: 20, enemySpRecoveryDivisor: 30, maxPlayerActions: 300, initialSpRatio: 0 };
var power = { N: 1, R: 1.08, SR: 1.16, SSR: 1.24 };
var image = (id) => game04_master_assets_default.assets.find((a) => a.id === id)?.path ?? "/menu/event_banner_placeholder.png";
var name = (id) => sengoku_masters_default[id] ?? id;
var CHARACTER_MASTERS = sengoku_characters_default.map((c, i) => {
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
var SKILL_MASTERS = skills_20260821_default.skills.filter((s) => !s.exclusive_character_id).map((s, i) => {
  const kind = i % 8, rarity = s.rarity, f = power[rarity];
  const effect = kind === 1 ? [{ type: "def_up", power: 20, duration: 3, carryAcrossWaves: false }] : kind === 2 ? [{ type: "heal", power: 120 * f }] : kind === 3 ? [{ type: "poison", power: 15, duration: 3, carryAcrossWaves: false }] : kind === 4 ? [{ type: "atk_up", power: 20, duration: 3, carryAcrossWaves: true }] : kind === 5 ? [{ type: "revive", power: 30 }] : kind === 6 ? [{ type: "def_down", power: 25, duration: 3, carryAcrossWaves: false }] : [{ type: "damage", power: (kind === 7 ? 90 : 180) * f }];
  return { id: s.skill_id, name: name(s.skill_id), image: image(s.skill_id), rarity, element: ELEMENTS[i % 6], spCost: 24 + i % 4 * 8, condition: kind === 2 ? { type: "ally_hp_below", value: 0.65 } : kind === 5 ? { type: "ally_dead" } : { type: "always" }, target: kind === 1 || kind === 4 ? "all_allies" : kind === 2 ? "lowest_ally" : kind === 5 ? "dead_ally" : kind === 7 ? "all_enemies" : "lowest_hp", effects: effect, description: ["\u6575\u5358\u4F53\u3078\u5C5E\u6027\u653B\u6483", "\u5473\u65B9\u5168\u4F53\u306E\u5B88\u5099\u3092\u5F37\u5316", "\u50B7\u3064\u3044\u305F\u5473\u65B9\u3092\u56DE\u5FA9", "\u6575\u306B\u7D99\u7D9A\u30C0\u30E1\u30FC\u30B8", "\u5473\u65B9\u5168\u4F53\u306E\u653B\u6483\u3092\u5F37\u5316", "\u6226\u95D8\u4E0D\u80FD\u306E\u5473\u65B9\u3092\u8607\u751F", "\u6575\u306E\u5B88\u5099\u3092\u4F4E\u4E0B", "\u6575\u5168\u4F53\u3078\u5C5E\u6027\u653B\u6483"][kind] };
});
var EQUIPMENT_MASTERS = equipment_20260821_default.equipments.filter((e) => !e.exclusive_character_id).map((e) => {
  const rarity = e.rarity, f = power[rarity], slot = e.category === "WEAPON" ? "weapon" : e.category === "HEAD" ? "head" : e.category === "BODY" ? "body" : e.category === "LEGS" ? "legs" : "accessory1";
  return { id: e.equipment_id, name: name(e.equipment_id), image: image(e.equipment_id), rarity, slot, stats: { hp: slot === "body" ? Math.round(80 * f) : 0, sp: slot === "accessory1" ? 5 : 0, atk: slot === "weapon" ? Math.round(16 * f) : 0, def: slot === "head" || slot === "legs" ? Math.round(8 * f) : 0, luk: slot === "accessory1" ? 3 : 0 } };
});
function getSkillSlots(awakening) {
  return awakening >= 3 ? 3 : awakening >= 1 ? 2 : 1;
}
function getCharacterStats(master, level, awakening) {
  return Object.fromEntries(Object.entries(master.stats).map(([k, v]) => [k, Math.round(v * (1 + (Math.max(1, level) - 1) * 0.055) * (awakening >= 4 ? 1 + (awakening - 3) * 0.1 : 1))]));
}
function getEquipmentStats(master, level, lb) {
  return Object.fromEntries(Object.entries(master.stats).map(([k, v]) => [k, Math.round(v * (1 + (Math.max(1, level) - 1) * 0.04) * (1 + lb * 0.1))]));
}
function buildBattleParty(state) {
  return state.deck.map((member) => {
    const owned = state.characters.find((c) => c.id === member.characterId), master = CHARACTER_MASTERS.find((c) => c.id === member.characterId);
    if (!owned || !master) throw new Error("\u7DE8\u6210\u30AD\u30E3\u30E9\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093");
    const stats = getCharacterStats(master, owned.level, owned.awakening);
    for (const instanceId of Object.values(member.equipment)) {
      const e = state.equipment.find((e2) => e2.instanceId === instanceId), m = EQUIPMENT_MASTERS.find((m2) => m2.id === e?.masterId);
      if (e && m) {
        const bonus = getEquipmentStats(m, e.level, e.lb);
        for (const key2 of Object.keys(stats)) stats[key2] += bonus[key2];
      }
    }
    return { id: master.id, name: master.name, image: master.image, level: owned.level, element: master.element, stats, skills: member.skillIds.slice(0, getSkillSlots(owned.awakening)).map((id) => {
      const s = SKILL_MASTERS.find((s2) => s2.id === id), o = state.skills.find((s2) => s2.id === id);
      if (!s || !o) throw new Error("\u672A\u6240\u6301\u306E\u30B9\u30AD\u30EB\u3067\u3059");
      return { ...s, effects: s.effects.map((e) => ({ ...e, power: e.power * (1 + o.level * 0.05) })) };
    }), passives: [{ ...master.passive, level: owned.awakening * 2, percent: master.passive.percent * (1 + owned.awakening * 2) }] };
  });
}
function createInitialState(userId) {
  const starters = CHARACTER_MASTERS.filter((c) => c.rarity === "N").slice(0, 5);
  return { userId, version: 0, cash: 0, diamonds: 0, energy: 0, energyMax: 50, souls: {}, characters: starters.map((c) => ({ id: c.id, level: 1, awakening: 0 })), skills: SKILL_MASTERS.slice(0, 8).map((s) => ({ id: s.id, level: 0 })), equipment: [], deck: starters.map((c, i) => ({ characterId: c.id, skillIds: [SKILL_MASTERS[i % SKILL_MASTERS.length].id], equipment: {} })), materials: { character: 20, skill: 10, equipment: 20, equipmentLb: 5, unlock: 1 }, clearedStages: [], vipExpiresAt: null };
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

// src/domain/redesign/growth.ts
var GROWTH_PREVIEW_RULES = {
  characterLevelCaps: [30, 40, 50, 60, 80, 100],
  characterCash: 100,
  characterMaterial: 1,
  awakeningSouls: [10, 20, 30, 40, 50],
  unlockSouls: 20,
  skillMax: 10,
  skillMaterial: 1,
  equipmentLevelCap: 100,
  equipmentLbMax: 10,
  equipmentCash: 50,
  equipmentMaterial: 1,
  equipmentLbMaterial: 1,
  dismantleCash: 50,
  dismantleLbMaterial: 1
};
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
function applyGrowthAction(input, action, payload) {
  const state = structuredClone(input);
  const rules = GROWTH_PREVIEW_RULES;
  if (action === "save_deck") {
    validateDeck(state, payload.deck);
    state.deck = structuredClone(payload.deck);
    return state;
  }
  if (action === "character_unlock") {
    const id = String(payload.characterId ?? "");
    requireValue(CHARACTER_MASTERS.some((c) => c.id === id), "\u6B66\u5C06\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093\u3002");
    const owned = state.characters.find((c) => c.id === id);
    requireValue(!owned, "\u3053\u306E\u6B66\u5C06\u306F\u65E2\u306B\u6240\u6301\u3057\u3066\u3044\u307E\u3059\u3002");
    requireValue((state.souls[id] ?? 0) >= rules.unlockSouls, "\u6B66\u5C06\u306E\u9B42\u304C\u4E0D\u8DB3\u3057\u3066\u3044\u307E\u3059\u3002");
    state.souls[id] -= rules.unlockSouls;
    state.characters.push({ id, level: 1, awakening: 0 });
    return state;
  }
  if (action === "character_level" || action === "character_awaken") {
    const owned = state.characters.find((c) => c.id === payload.characterId && c.level > 0);
    requireValue(owned, "\u6B66\u5C06\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093\u3002");
    if (action === "character_level") {
      requireValue(owned.level < getCharacterLevelCap(owned.awakening), "Lv\u4E0A\u9650\u3067\u3059\u3002\u899A\u9192\u3067\u4E0A\u9650\u3092\u89E3\u653E\u3067\u304D\u307E\u3059\u3002");
      requireValue(state.cash >= rules.characterCash && state.materials.character >= rules.characterMaterial, "\u92AD\u307E\u305F\u306F\u6B66\u5C06\u80B2\u6210\u7D20\u6750\u304C\u4E0D\u8DB3\u3057\u3066\u3044\u307E\u3059\u3002");
      state.cash -= rules.characterCash;
      state.materials.character -= rules.characterMaterial;
      owned.level++;
    } else {
      requireValue(owned.awakening < 5, "\u899A\u9192\u306F\u6700\u5927\u3067\u3059\u3002");
      const cost = rules.awakeningSouls[owned.awakening];
      requireValue((state.souls[owned.id] ?? 0) >= cost, "\u6B66\u5C06\u306E\u9B42\u304C\u4E0D\u8DB3\u3057\u3066\u3044\u307E\u3059\u3002");
      state.souls[owned.id] -= cost;
      owned.awakening++;
    }
    return state;
  }
  if (action === "skill_level") {
    const skill = state.skills.find((s) => s.id === payload.skillId);
    requireValue(skill, "\u30B9\u30AD\u30EB\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093\u3002");
    requireValue(skill.level < rules.skillMax, "\u30B9\u30AD\u30EB\u306F\u6700\u5927Lv\u3067\u3059\u3002");
    requireValue(state.materials.skill >= rules.skillMaterial, "\u30B9\u30AD\u30EBLB\u7D20\u6750\u304C\u4E0D\u8DB3\u3057\u3066\u3044\u307E\u3059\u3002");
    state.materials.skill -= rules.skillMaterial;
    skill.level++;
    return state;
  }
  if (action === "equipment_level" || action === "equipment_lb") {
    const equipment = state.equipment.find((e) => e.instanceId === payload.instanceId);
    requireValue(equipment, "\u88C5\u5099\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093\u3002");
    if (action === "equipment_level") {
      requireValue(equipment.level < rules.equipmentLevelCap, "\u88C5\u5099\u306F\u6700\u5927Lv\u3067\u3059\u3002");
      requireValue(state.cash >= rules.equipmentCash && state.materials.equipment >= rules.equipmentMaterial, "\u92AD\u307E\u305F\u306F\u88C5\u5099\u80B2\u6210\u7D20\u6750\u304C\u4E0D\u8DB3\u3057\u3066\u3044\u307E\u3059\u3002");
      state.cash -= rules.equipmentCash;
      state.materials.equipment -= rules.equipmentMaterial;
      equipment.level++;
    } else {
      requireValue(equipment.lb < rules.equipmentLbMax, "\u88C5\u5099LB\u306F\u6700\u5927\u3067\u3059\u3002");
      requireValue(state.materials.equipmentLb >= rules.equipmentLbMaterial, "\u88C5\u5099LB\u7D20\u6750\u304C\u4E0D\u8DB3\u3057\u3066\u3044\u307E\u3059\u3002");
      state.materials.equipmentLb -= rules.equipmentLbMaterial;
      equipment.lb++;
    }
    return state;
  }
  if (action === "equipment_dismantle") {
    const ids = payload.instanceIds;
    requireValue(Array.isArray(ids) && ids.length > 0 && new Set(ids).size === ids.length, "\u5206\u89E3\u3059\u308B\u88C5\u5099\u3092\u9078\u629E\u3057\u3066\u304F\u3060\u3055\u3044\u3002");
    for (const id of ids) {
      const equipment = state.equipment.find((e) => e.instanceId === id);
      requireValue(equipment && !equipment.locked && !isEquipmentAssigned(state, id), "\u88C5\u5099\u4E2D\u30FB\u30ED\u30C3\u30AF\u4E2D\u306E\u88C5\u5099\u306F\u5206\u89E3\u3067\u304D\u307E\u305B\u3093\u3002");
    }
    const count = ids.length;
    state.equipment = state.equipment.filter((e) => !ids.includes(e.instanceId));
    state.cash += rules.dismantleCash * count;
    state.materials.equipmentLb += rules.dismantleLbMaterial * count;
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
  const chosen = SKILL_MASTERS.find((s) => s.effects.some((e) => e.type === effect));
  return chosen ? [chosen, ...source.filter((s) => s.id !== chosen.id)].slice(0, 2) : source.slice(0, 2);
}
function enemy(area, stage, wave, slot, boss2) {
  const master = CHARACTER_MASTERS[(area * 6 + stage + wave + slot) % CHARACTER_MASTERS.length];
  const rank = area * 7 + stage;
  const growth = 1 + rank * 0.09;
  const skills = themeSkills(area, SKILL_MASTERS.filter((s) => s.element === master.element));
  return {
    id: `quest-enemy-${area + 1}-${stage + 1}-${wave + 1}-${slot + 1}`,
    name: master.name,
    image: master.image,
    element: master.element,
    level: 1 + rank,
    stats: { hp: Math.round((boss2 ? 1100 : 370) * growth), sp: boss2 ? 80 : 40, atk: Math.round((boss2 ? 100 : 55) * growth), def: Math.round((area === 2 ? 55 : 15) * growth), luk: 10 + rank },
    skills,
    passives: [],
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
      firstRewards: [{ kind: "cash", amount: 100 + area * 30 }, { kind: "soul", id: CHARACTER_MASTERS[(area * 6 + stage) % CHARACTER_MASTERS.length].id, amount: 2 }],
      rewards: [{ kind: "cash", amount: 20 + area * 10 }, { kind: "character_material", amount: 1 + Math.floor(area / 3) }, { kind: "skill_material", amount: 1 }, { kind: "equipment_material", amount: 1 }],
      rareRewards: [{ kind: "soul", id: CHARACTER_MASTERS[(area * 6 + stage) % CHARACTER_MASTERS.length].id, amount: 1, chance: 0.08 }, { kind: "equipment_lb", amount: 1, chance: 0.05 }, { kind: "equipment", id: EQUIPMENT_MASTERS[(area * 7 + stage) % EQUIPMENT_MASTERS.length].id, amount: 1, chance: 0.12 }, ...area >= 2 ? [{ kind: "unlock_item", amount: 1, chance: 0.04 }] : []],
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

// src/domain/redesign/battle.ts
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

// src/domain/redesign/raid.ts
var base = CHARACTER_MASTERS[12];
var attack = SKILL_MASTERS.find((s) => s.effects.some((e) => e.type === "damage"));
var boss = { id: "raid_boss", name: "\u708E\u5F71\u306E\u5B88\u5C06", image: base.image, level: 1, element: "fire", stats: { hp: 6500, sp: 110, atk: 160, def: 45, luk: 20 }, skills: [attack], passives: [], actionCount: 4, order: 0, boss: true, phases: [{ hpBelow: 0.4, name: "\u70C8\u706B\u306E\u9663", actionCount: 3 }] };
var RAID_MASTERS = [
  { id: "encounter_flame", name: "\u708E\u5F71\u306E\u5B88\u5C06", type: "encounter", enemy: boss, energyCost: 5, durationMinutes: 60, maxParticipants: 10, maxLevel: 1, appearanceLevels: [1], victoryMultiplier: 1.5, sharedHp: 15e4, participationRewards: [{ kind: "character_material", amount: 2 }], defeatRewards: [{ kind: "character_material", amount: 30 }] },
  { id: "unlock_shadow", name: "\u5E38\u95C7\u306E\u8987\u5C06", type: "unlock", enemy: { ...boss, id: "raid_shadow", name: "\u5E38\u95C7\u306E\u8987\u5C06", element: "dark", image: CHARACTER_MASTERS[24].image }, energyCost: 5, durationMinutes: 4320, maxParticipants: 20, maxLevel: 20, appearanceLevels: [1, 10, 20], victoryMultiplier: 1.5, sharedHp: 2e5, participationRewards: [{ kind: "skill_material", amount: 2 }], defeatRewards: [{ kind: "skill_material", amount: 15 }, { kind: "equipment_material", amount: 5 }] }
];
function getRaidMaster(id) {
  const master = RAID_MASTERS.find((m) => m.id === id);
  if (!master) throw new Error("\u5BFE\u8C61\u30EC\u30A4\u30C9\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093\u3002");
  return master;
}
function raidAppearanceLevel(master, level) {
  return Math.max(1, ...master.appearanceLevels.filter((n) => n <= level));
}
function raidEnemy(master, level) {
  const appearanceLevel = raidAppearanceLevel(master, level);
  return { ...structuredClone(master.enemy), level, image: master.type === "unlock" && appearanceLevel >= 10 ? CHARACTER_MASTERS[appearanceLevel >= 20 ? 36 : 30].image : master.enemy.image, stats: Object.fromEntries(Object.entries(master.enemy.stats).map(([key2, value]) => [key2, Math.round(value * (1 + (level - 1) * 0.15))])) };
}
function createRaidRoom(masterId, ownerId, id, now) {
  const m = getRaidMaster(masterId);
  return { id, masterId, ownerId, level: 1, hp: m.sharedHp, maxHp: m.sharedHp, createdAt: new Date(now).toISOString(), expiresAt: new Date(now + m.durationMinutes * 6e4).toISOString(), status: "active", rescueCount: 0, rescueWindowStartedAt: new Date(now).toISOString(), participants: [{ userId: ownerId, name: "\u4E3B\u50AC\u8005", wins: 0, attempts: 0, totalDamage: 0, joinedLevel: 1 }], settledBattleIds: [], rewardGrants: [] };
}
function applyRaidAction(original, originalState, action, payload = {}, now = Date.now(), acquisitionMaster) {
  const room = structuredClone(original), state = structuredClone(originalState), master = getRaidMaster(room.masterId);
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
        room.maxHp = Math.round(master.sharedHp * (1 + (room.level - 1) * 0.2));
        room.hp = room.maxHp;
      } else room.status = "defeated";
    }
    return { room, state };
  }
  throw new Error("\u5BFE\u5FDC\u3057\u3066\u3044\u306A\u3044\u30EC\u30A4\u30C9\u64CD\u4F5C\u3067\u3059\u3002");
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
  const result = await response.json();
  if (!response.ok) throw new ApiError(result.message || "\u30C7\u30FC\u30BF\u3092\u4FDD\u5B58\u3067\u304D\u307E\u305B\u3093\u3067\u3057\u305F\u3002", result.code === "40001" ? 409 : 400);
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
    const state = await rpc("game04_get_state", { p_user_id: userId, p_initial: buildInitialState(userId, input.legacy) });
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
async function commit(before, after, requestId, battle = null, room = null, roomVersion = null) {
  return rpc("game04_commit_state", {
    p_user_id: before.userId,
    p_expected_version: before.version,
    p_state: after,
    p_cash_delta: after.cash - before.cash,
    p_energy_delta: after.energy - before.energy,
    p_request_id: requestId,
    p_battle: battle,
    p_raid: room,
    p_raid_expected_version: roomVersion
  });
}
async function roomFor(id) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) throw new ApiError("\u30EC\u30A4\u30C9\u304C\u4E0D\u6B63\u3067\u3059\u3002");
  const [row] = await db(`game04_raid_rooms?id=eq.${id}&select=state,version`);
  if (!row) throw new ApiError("\u30EC\u30A4\u30C9\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093\u3002", 404);
  return { ...row.state, version: row.version };
}
async function roomsFor(userId) {
  const rows = await db("game04_raid_rooms?select=state,version&order=created_at.desc&limit=200");
  return rows.map((row) => ({
    ...row.state,
    version: row.version,
    status: row.state.status === "active" && Date.parse(row.state.expiresAt) <= Date.now() ? "expired" : row.state.status
  })).filter((room) => room.status === "active" || room.participants.some((p) => p.userId === userId));
}
async function rewardPolicy() {
  const [row] = await db("game04_redesign_master?key=eq.acquisition_conversion&select=data");
  if (!row?.data) throw new ApiError("\u7372\u5F97\u8A2D\u5B9A\u3092\u78BA\u8A8D\u3067\u304D\u307E\u305B\u3093\u3002", 503);
  return row.data;
}
async function missionConfig() {
  const [row] = await db("game04_redesign_master?key=eq.missions&select=data");
  return row?.data ?? { enabled: false, missions: [] };
}
async function responseFor(userId, extra = {}) {
  const [state, rooms, socialEvents, pending] = await Promise.all([
    stateFor(userId),
    roomsFor(userId),
    db("game04_social_events?select=*&order=created_at.desc&limit=30"),
    db(`game04_battles?user_id=eq.${userId}&status=eq.started&select=id,kind,target_id&order=created_at.asc&limit=1`)
  ]);
  return { state, rooms, socialEvents, missions: evaluateMissions(state, await missionConfig()), pendingBattle: pending[0] ?? null, ...extra };
}
async function runBattle(userId, name2, payload, id, playerName) {
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
      const room = await roomFor(String(payload.roomId)), master = getRaidMaster(room.masterId);
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
    const input = { seed, party: buildBattleParty(state), waves, rules: BATTLE_RULES, raidLevel };
    await commit(state, { ...state, energy: state.energy - cost }, id, { id, kind, targetId, seed, input, status: "started" }, startRoom, startRoom?.version ?? null);
    record = { id, kind, target_id: targetId, input, seed, status: "started" };
  }
  const battle = simulateBattle(record.input);
  const settlementId = await uuidFor(`settlement:${id}`);
  for (let attempt = 0; attempt < 4; attempt++) {
    const state = await stateFor(userId);
    let after = structuredClone(state);
    let room = null, version = null;
    const rewards = [];
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
    const result = { battle, rewards, firstClear, encounterRaidId };
    try {
      await commit(state, after, settlementId, { id, status: "settled", result }, room, version);
      return responseFor(userId, result);
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
    if (action === "get_state" || action === "raid_refresh") return new Response(JSON.stringify(await responseFor(user.id)), { headers });
    if (action === "quest_battle" || action === "raid_battle") return new Response(JSON.stringify(await runBattle(user.id, action, payload, requestId, profile.username)), { headers });
    const [prior] = await db(`game04_requests?user_id=eq.${user.id}&request_id=eq.${requestId}&select=request_id`);
    if (prior) return new Response(JSON.stringify(await responseFor(user.id)), { headers });
    const state = await stateFor(user.id);
    let after, room = null, version = null;
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
    } else if (action === "raid_unlock") {
      const master = getRaidMaster(String(payload.masterId));
      if (master.type !== "unlock" || state.materials.unlock < 1) throw new ApiError("\u30EC\u30A4\u30C9\u89E3\u7981\u672D\u304C\u8DB3\u308A\u307E\u305B\u3093\u3002");
      after = structuredClone(state);
      after.materials.unlock--;
      room = createRaidRoom(master.id, user.id, requestId, Date.now());
      version = -1;
      room.participants[0].name = profile.username;
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
