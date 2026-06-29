import { StateCreator } from "zustand";
import { GameStore } from "../types";
import { Asset } from "../../types";
import { investInMarket, computeNetWorth, clamp } from "../../engine/economyEngine";
import {
  canFoundBusiness,
  foundBusiness as createBusiness,
  sellBusiness as liquidateBusiness,
  hireEmployee as hireBizEmployee,
  fireEmployee as fireBizEmployee,
  normalizeBusinessEmployees,
} from "../../engine/businessEngine";
import { createPropertyAsset } from "../../engine/housingEngine";
import { PROPERTY_MAP } from "../../data/properties";
import { hireLawyer, resolveTrial, applyVerdictToRecord } from "../../engine/legalEngine";

function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export interface EconomySlice {
  investInStocks: (amount: number) => { ok: boolean; message: string };
  foundBusiness: (name: string) => { ok: boolean; message: string };
  sellBusiness: (businessId: string) => { ok: boolean; message: string };
  purchaseProperty: (propertyDefId: string) => { ok: boolean; message: string };
  purchaseAsset: (asset: Omit<Asset, "id" | "purchasedAge">) => boolean;
  sellAsset: (assetId: string) => boolean;
  hireEmployee: (
    businessId: string,
    role: string,
  ) => { ok: boolean; message: string };
  fireEmployee: (
    businessId: string,
    employeeId: string,
  ) => { ok: boolean; message: string };
  addCoins: (n: number) => void;
  spendCoins: (n: number) => boolean;
  addGems: (n: number) => void;
  spendGems: (n: number) => boolean;
  resolveCourt: (
    lawyerQuality: number,
    lawyerCost?: number,
  ) => { ok: boolean; message: string };
  clearPendingCourt: () => void;
}

export const createEconomySlice: StateCreator<
  GameStore,
  [["zustand/immer", never]],
  [],
  EconomySlice
> = (set, get) => ({
  investInStocks: (amount) => {
    const { character } = get();
    if (!character) return { ok: false, message: "No character." };
    const result = investInMarket(character, amount);
    if (!result.ok || !result.asset)
      return { ok: false, message: result.message };
    set((s) => {
      if (!s.character) return;
      s.character.bankBalance = result.bankBalance;
      s.character.assets.push(result.asset!);
      const netWorth = computeNetWorth(s.character);
      s.character.stats.wealth = clamp(netWorth / 10000);
    });
    void get()._persist();
    return { ok: true, message: result.message };
  },

  foundBusiness: (name) => {
    const { character } = get();
    if (!character) return { ok: false, message: "No character." };
    if (!canFoundBusiness(character))
      return { ok: false, message: "You need to be an entrepreneur first." };
    const biz = createBusiness(character, name);
    if (!biz) return { ok: false, message: "Could not found business." };
    set((s) => {
      if (s.character) s.character.businesses.push(biz);
    });
    void get()._persist();
    return { ok: true, message: `Founded ${name}!` };
  },

  sellBusiness: (businessId) => {
    const { character } = get();
    if (!character) return { ok: false, message: "No character." };
    const biz = character.businesses.find((b) => b.id === businessId);
    if (!biz) return { ok: false, message: "Business not found." };
    const payout = liquidateBusiness(biz);
    set((s) => {
      if (!s.character) return;
      s.character.businesses = s.character.businesses.filter(
        (b) => b.id !== businessId,
      );
      s.character.bankBalance += payout;
    });
    void get()._persist();
    return { ok: true, message: `Sold for ${payout}.` };
  },

  purchaseProperty: (propertyDefId) => {
    const { character } = get();
    if (!character) return { ok: false, message: "No character." };
    const def = PROPERTY_MAP[propertyDefId];
    if (!def) return { ok: false, message: "Property not found." };
    if (character.age < def.minAge)
      return { ok: false, message: `Must be at least ${def.minAge}.` };
    const { asset, downPayment } = createPropertyAsset(def, character.age);
    if (character.bankBalance < downPayment)
      return { ok: false, message: "Insufficient funds for down payment." };
    set((s) => {
      if (!s.character) return;
      s.character.assets.push(asset);
      s.character.bankBalance -= downPayment;
      s.character.stats.wealth = clamp(computeNetWorth(s.character) / 10000);
    });
    void get()._persist();
    return { ok: true, message: `Purchased ${def.name}.` };
  },

  purchaseAsset: (assetData) => {
    const { character } = get();
    if (!character) return false;
    const downPayment =
      assetData.debt !== undefined
        ? assetData.value - assetData.debt
        : assetData.value;
    if (character.bankBalance < downPayment) return false;

    set((s) => {
      if (!s.character) return;
      s.character.assets.push({
        ...assetData,
        id: generateId(),
        purchasedAge: s.character.age,
      });
      s.character.bankBalance = Math.max(
        0,
        s.character.bankBalance - downPayment,
      );
      s.character.stats.wealth = clamp(computeNetWorth(s.character) / 10000);
    });
    void get()._persist();
    return true;
  },

  sellAsset: (assetId) => {
    const { character } = get();
    if (!character) return false;
    const asset = character.assets.find((a) => a.id === assetId);
    if (!asset) return false;
    const proceeds = Math.max(0, asset.value - (asset.debt ?? 0));

    set((s) => {
      if (!s.character) return;
      s.character.assets = s.character.assets.filter((a) => a.id !== assetId);
      s.character.bankBalance += proceeds;
      s.character.stats.wealth = clamp(computeNetWorth(s.character) / 10000);
    });
    void get()._persist();
    return true;
  },

  hireEmployee: (businessId, role) => {
    const { character } = get();
    if (!character) return { ok: false, message: "No character." };
    const biz = character.businesses.find((b) => b.id === businessId);
    if (!biz) return { ok: false, message: "Business not found." };
    set((s) => {
      if (!s.character) return;
      const i = s.character.businesses.findIndex((b) => b.id === businessId);
      const normalized = {
        ...biz,
        employees: normalizeBusinessEmployees(biz.employees),
      };
      s.character.businesses[i] = hireBizEmployee(normalized, role);
    });
    void get()._persist();
    return { ok: true, message: `Hired ${role}.` };
  },

  fireEmployee: (businessId, employeeId) => {
    const { character } = get();
    if (!character) return { ok: false, message: "No character." };
    const biz = character.businesses.find((b) => b.id === businessId);
    if (!biz) return { ok: false, message: "Business not found." };
    set((s) => {
      if (!s.character) return;
      const i = s.character.businesses.findIndex((b) => b.id === businessId);
      const normalized = {
        ...biz,
        employees: normalizeBusinessEmployees(biz.employees),
      };
      s.character.businesses[i] = fireBizEmployee(normalized, employeeId);
    });
    void get()._persist();
    return { ok: true, message: "Employee released." };
  },

  addCoins: (n) => {
    set((s) => {
      if (s.character) s.character.coins += n;
    });
    void get()._persist();
  },

  spendCoins: (n) => {
    const { character } = get();
    if (!character || character.coins < n) return false;
    set((s) => {
      if (s.character) s.character.coins -= n;
    });
    void get()._persist();
    return true;
  },

  addGems: (n) => {
    set((s) => {
      if (s.character) s.character.gems += n;
    });
    void get()._persist();
  },

  spendGems: (n) => {
    const { character } = get();
    if (!character || character.gems < n) return false;
    set((s) => {
      if (s.character) s.character.gems -= n;
    });
    void get()._persist();
    return true;
  },

  resolveCourt: (lawyerQuality, lawyerCost = 0) => {
    const { character } = get();
    if (!character?.legalCase)
      return { ok: false, message: "No active case." };
    if (character.bankBalance < lawyerCost)
      return { ok: false, message: "Insufficient funds for lawyer." };
    const withLawyer = hireLawyer(character.legalCase, lawyerQuality);
    const verdict = resolveTrial(character, withLawyer);
    set((s) => {
      if (!s.character) return;
      s.character.criminalRecord = applyVerdictToRecord(
        s.character,
        withLawyer.crimeId,
        verdict,
      );
      s.character.legalCase = undefined;
      s.character.heatLevel = Math.max(0, (s.character.heatLevel ?? 0) - 30);
      s.character.bankBalance = Math.max(
        0,
        s.character.bankBalance - lawyerCost - verdict.fine,
      );
      s.pendingCourt = false;
    });
    void get()._persist();
    return { ok: true, message: verdict.message };
  },

  clearPendingCourt: () =>
    set((s) => {
      s.pendingCourt = false;
    }),
});
