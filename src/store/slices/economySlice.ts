import { StateCreator } from "zustand";
import { GameStore } from "../types";
import { Asset } from "../../types";
import { investInMarket, computeNetWorth, clamp, applyCashDelta } from "../../engine/economyEngine";
import { appendFinanceLedger, repayPersonalDebt } from "../../engine/financeLedgerEngine";
import { getFinancedPurchaseTerms } from "../../engine/financingEngine";
import {
  canFoundBusiness,
  foundBusiness as createBusiness,
  foundFranchise as createFranchise,
  sellBusiness as liquidateBusiness,
  hireEmployee as hireBizEmployee,
  fireEmployee as fireBizEmployee,
  normalizeBusinessEmployees,
} from "../../engine/businessEngine";
import {
  createPropertyAsset,
  renovatePropertyCost,
  applyRenovation,
  setPropertyOccupancy,
} from "../../engine/housingEngine";
import { createCollectibleAsset } from "../../engine/assetCatalogEngine";
import { PROPERTY_MAP } from "../../data/properties";
import { getInstrumentById } from "../../data/marketInstruments";
import {
  getInsuranceProduct,
  createPolicy,
} from "../../data/insurancePolicies";
import { hireLawyer, resolveTrial, applyVerdictToRecord } from "../../engine/legalEngine";
import { tickCreditScore } from "../../engine/creditScoreEngine";
import { generateAngelOpportunities } from "../../engine/marketEngine";

function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export interface EconomySlice {
  investInStocks: (amount: number, options?: { useMargin?: boolean; catalogId?: string }) => { ok: boolean; message: string };
  foundBusiness: (name: string) => { ok: boolean; message: string };
  foundFranchise: (franchiseId: string) => { ok: boolean; message: string };
  sellBusiness: (businessId: string) => { ok: boolean; message: string };
  purchaseProperty: (propertyDefId: string, occupancy?: 'primary' | 'rental') => { ok: boolean; message: string };
  purchaseAsset: (asset: Omit<Asset, "id" | "purchasedAge">) => boolean;
  purchaseCollectible: (collectibleId: string) => { ok: boolean; message: string };
  purchaseInsurance: (productId: string) => { ok: boolean; message: string };
  sellInsurance: (policyId: string) => { ok: boolean; message: string };
  setInsuranceEquipped: (policyId: string, equipped: boolean) => { ok: boolean; message: string };
  setAssetEquipped: (assetId: string, equipped: boolean) => { ok: boolean; message: string };
  setBusinessEquipped: (businessId: string, equipped: boolean) => { ok: boolean; message: string };
  investAngel: (opportunityId: string) => { ok: boolean; message: string };
  refreshAngelDeals: () => void;
  renovateProperty: (assetId: string) => { ok: boolean; message: string };
  setPropertyMode: (assetId: string, mode: 'primary' | 'rental') => { ok: boolean; message: string };
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
  repayDebt: (amount: number) => { ok: boolean; message: string };
}

function applyLoanInquiry(s: { character: GameStore['character'] }, newLoan: boolean) {
  if (!s.character || !newLoan) return;
  const next = tickCreditScore(s.character, { newLoan: true });
  s.character.creditScore = next.creditScore;
  s.character.creditFactors = next.creditFactors;
  s.character.creditInquiries = next.creditInquiries;
  if (s.character.creditHistoryStartAge === undefined) {
    s.character.creditHistoryStartAge = s.character.age;
  }
}

export const createEconomySlice: StateCreator<
  GameStore,
  [["zustand/immer", never]],
  [],
  EconomySlice
> = (set, get) => ({
  investInStocks: (amount, options) => {
    const { character } = get();
    if (!character) return { ok: false, message: "No character." };
    const instrument = options?.catalogId
      ? getInstrumentById(options.catalogId)
      : getInstrumentById('stock_index');
    if (instrument?.minCredit && (character.creditScore ?? 650) < instrument.minCredit) {
      return { ok: false, message: `Need credit ${instrument.minCredit}+ for this product.` };
    }
    const result = investInMarket(character, amount, {
      useMargin: options?.useMargin,
      catalogId: options?.catalogId ?? instrument?.id ?? 'stock_index',
      name: instrument?.name,
    });
    if (!result.ok || !result.asset)
      return { ok: false, message: result.message };
    set((s) => {
      if (!s.character) return;
      s.character.bankBalance = result.bankBalance;
      if (result.debt !== undefined) s.character.debt = result.debt;
      const asset = {
        ...result.asset!,
        instrumentKind: instrument?.kind,
        priceHistory: [{ age: s.character.age, value: result.asset!.value }],
      };
      s.character.assets.push(asset);
      if ((result.debt ?? 0) > (character.debt ?? 0)) {
        applyLoanInquiry(s, true);
      }
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
      return { ok: false, message: "You need to be an entrepreneur first (or open a franchise)." };
    const biz = createBusiness(character, name);
    if (!biz) return { ok: false, message: "Could not found business." };
    set((s) => {
      if (s.character) s.character.businesses.push(biz);
    });
    void get()._persist();
    return { ok: true, message: `Founded ${name}!` };
  },

  foundFranchise: (franchiseId) => {
    const { character } = get();
    if (!character) return { ok: false, message: "No character." };
    const result = createFranchise(character, franchiseId);
    if (!result) return { ok: false, message: "Cannot open this franchise (capital, credit, or age)." };
    const { business, terms } = result;
    set((s) => {
      if (!s.character) return;
      const cash = applyCashDelta(
        s.character.bankBalance,
        s.character.debt ?? 0,
        -terms.downPayment,
      );
      s.character.bankBalance = cash.bankBalance;
      s.character.debt = cash.debt + terms.loan;
      s.character.businesses.push(business);
      applyLoanInquiry(s, terms.loan > 0);
      s.character.stats.wealth = clamp(computeNetWorth(s.character) / 10000);
    });
    void get()._persist();
    return { ok: true, message: `Opened ${business.name}! ${terms.message}` };
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

  purchaseProperty: (propertyDefId, occupancy = 'primary') => {
    const { character } = get();
    if (!character) return { ok: false, message: "No character." };
    const def = PROPERTY_MAP[propertyDefId];
    if (!def) return { ok: false, message: "Property not found." };
    if (character.age < def.minAge)
      return { ok: false, message: `Must be at least ${def.minAge}.` };
    const { asset } = createPropertyAsset(
      def,
      character.age,
      character.countryCode,
      undefined,
      occupancy,
    );
    const price = asset.value;
    const terms = getFinancedPurchaseTerms(price, character, asset.debt ?? 0);
    if (!terms.approved) {
      return { ok: false, message: terms.message };
    }
    // Align asset debt to approved loan
    asset.debt = terms.loan > 0 ? terms.loan : undefined;
    set((s) => {
      if (!s.character) return;
      const cash = applyCashDelta(
        s.character.bankBalance,
        s.character.debt ?? 0,
        -terms.downPayment,
      );
      s.character.assets.push(asset);
      s.character.bankBalance = cash.bankBalance;
      s.character.debt = cash.debt;
      applyLoanInquiry(s, terms.loan > 0);
      s.character.stats.wealth = clamp(computeNetWorth(s.character) / 10000);
    });
    void get()._persist();
    return { ok: true, message: `Purchased ${def.name}. ${terms.message}` };
  },

  purchaseAsset: (assetData) => {
    const { character } = get();
    if (!character) return false;
    const price = assetData.value;
    const requestedLoan = assetData.debt ?? 0;
    const terms = getFinancedPurchaseTerms(price, character, requestedLoan);
    if (!terms.approved) return false;

    set((s) => {
      if (!s.character) return;
      s.character.assets.push({
        ...assetData,
        debt: terms.loan > 0 ? terms.loan : undefined,
        id: generateId(),
        purchasedAge: s.character.age,
      });
      const cash = applyCashDelta(
        s.character.bankBalance,
        s.character.debt ?? 0,
        -terms.downPayment,
      );
      s.character.bankBalance = cash.bankBalance;
      s.character.debt = cash.debt;
      applyLoanInquiry(s, terms.loan > 0);
      s.character.stats.wealth = clamp(computeNetWorth(s.character) / 10000);
    });
    void get()._persist();
    return true;
  },

  purchaseCollectible: (collectibleId) => {
    const { character } = get();
    if (!character) return { ok: false, message: "No character." };
    const draft = createCollectibleAsset(collectibleId, character.countryCode);
    if (!draft) return { ok: false, message: "Collectible not found." };
    const terms = getFinancedPurchaseTerms(draft.value, character, 0);
    if (!terms.approved) return { ok: false, message: terms.message };
    // Collectibles: cash preferred; allow finance under same caps
    const ok = get().purchaseAsset({ ...draft, debt: terms.loan });
    return ok
      ? { ok: true, message: `Bought ${draft.name}.` }
      : { ok: false, message: "Purchase failed." };
  },

  purchaseInsurance: (productId) => {
    const { character } = get();
    if (!character) return { ok: false, message: "No character." };
    const product = getInsuranceProduct(productId);
    if (!product) return { ok: false, message: "Product not found." };
    const policy = createPolicy(product, character.age, character.countryCode);
    if (character.bankBalance < policy.annualPremium) {
      return { ok: false, message: "Need cash for the first premium." };
    }
    set((s) => {
      if (!s.character) return;
      const cash = applyCashDelta(
        s.character.bankBalance,
        s.character.debt ?? 0,
        -policy.annualPremium,
      );
      s.character.bankBalance = cash.bankBalance;
      s.character.debt = cash.debt;
      if (!s.character.insurancePolicies) s.character.insurancePolicies = [];
      s.character.insurancePolicies.push(policy);
    });
    void get()._persist();
    return { ok: true, message: `Purchased ${product.name}.` };
  },

  sellInsurance: (policyId) => {
    const { character } = get();
    if (!character) return { ok: false, message: "No character." };
    const policy = (character.insurancePolicies ?? []).find((p) => p.id === policyId);
    if (!policy) return { ok: false, message: "Policy not found." };
    const refund = Math.round(policy.annualPremium * 0.25);
    set((s) => {
      if (!s.character) return;
      s.character.insurancePolicies = (s.character.insurancePolicies ?? []).filter(
        (p) => p.id !== policyId,
      );
      s.character.bankBalance += refund;
    });
    void get()._persist();
    return { ok: true, message: `Cancelled policy. Refund ${refund}.` };
  },

  setInsuranceEquipped: (policyId, equipped) => {
    const { character } = get();
    if (!character) return { ok: false, message: "No character." };
    const idx = (character.insurancePolicies ?? []).findIndex((p) => p.id === policyId);
    if (idx < 0) return { ok: false, message: "Policy not found." };
    set((s) => {
      if (!s.character?.insurancePolicies) return;
      s.character.insurancePolicies[idx] = {
        ...s.character.insurancePolicies[idx],
        equipped,
      };
    });
    void get()._persist();
    return { ok: true, message: equipped ? "Policy equipped." : "Policy unequipped — premiums paused." };
  },

  setAssetEquipped: (assetId, equipped) => {
    const { character } = get();
    if (!character) return { ok: false, message: "No character." };
    const asset = character.assets.find((a) => a.id === assetId);
    if (!asset) return { ok: false, message: "Asset not found." };
    set((s) => {
      if (!s.character) return;
      s.character.assets = s.character.assets.map((a) => {
        if (a.id === assetId) return { ...a, equipped };
        // One daily driver / display piece / primary home of same type
        if (
          equipped &&
          a.type === asset.type &&
          (a.type === 'vehicle' || a.type === 'collectible' || a.type === 'property')
        ) {
          return { ...a, equipped: false };
        }
        return a;
      });
    });
    void get()._persist();
    return { ok: true, message: equipped ? "Equipped." : "Unequipped." };
  },

  setBusinessEquipped: (businessId, equipped) => {
    const { character } = get();
    if (!character) return { ok: false, message: "No character." };
    if (!character.businesses.some((b) => b.id === businessId)) {
      return { ok: false, message: "Business not found." };
    }
    set((s) => {
      if (!s.character) return;
      s.character.businesses = s.character.businesses.map((b) => ({
        ...b,
        equipped: b.id === businessId ? equipped : equipped ? false : b.equipped,
      }));
    });
    void get()._persist();
    return { ok: true, message: equipped ? "Business featured." : "Business unfeatured." };
  },

  investAngel: (opportunityId) => {
    const { character } = get();
    if (!character) return { ok: false, message: "No character." };
    const opp = (character.angelOpportunities ?? []).find((o) => o.id === opportunityId);
    if (!opp) return { ok: false, message: "Deal not found." };
    const result = investInMarket(character, opp.askAmount, {
      useMargin: false,
      catalogId: `angel_${opp.id}`,
      name: `${opp.name} (${opp.equityPct}% stake)`,
    });
    if (!result.ok || !result.asset) return { ok: false, message: result.message };
    set((s) => {
      if (!s.character) return;
      s.character.bankBalance = result.bankBalance;
      if (result.debt !== undefined) s.character.debt = result.debt;
      s.character.assets.push({
        ...result.asset!,
        type: 'angel_stake',
        instrumentKind: 'angel_stake',
      });
      s.character.angelOpportunities = (s.character.angelOpportunities ?? []).filter(
        (o) => o.id !== opportunityId,
      );
      s.character.stats.wealth = clamp(computeNetWorth(s.character) / 10000);
    });
    void get()._persist();
    return { ok: true, message: result.message };
  },

  refreshAngelDeals: () => {
    const { character } = get();
    if (!character) return;
    set((s) => {
      if (!s.character) return;
      s.character.angelOpportunities = generateAngelOpportunities(s.character);
    });
    void get()._persist();
  },

  renovateProperty: (assetId) => {
    const { character } = get();
    if (!character) return { ok: false, message: "No character." };
    const asset = character.assets.find((a) => a.id === assetId);
    if (!asset || asset.type !== 'property') return { ok: false, message: "Property not found." };
    const cost = renovatePropertyCost(asset);
    if (character.bankBalance < cost) return { ok: false, message: "Need cash to renovate." };
    set((s) => {
      if (!s.character) return;
      const i = s.character.assets.findIndex((a) => a.id === assetId);
      const cash = applyCashDelta(s.character.bankBalance, s.character.debt ?? 0, -cost);
      s.character.bankBalance = cash.bankBalance;
      s.character.debt = cash.debt;
      s.character.assets[i] = applyRenovation(s.character.assets[i]);
      s.character.stats.wealth = clamp(computeNetWorth(s.character) / 10000);
    });
    void get()._persist();
    return { ok: true, message: `Renovated for ${cost.toLocaleString()}.` };
  },

  setPropertyMode: (assetId, mode) => {
    const { character } = get();
    if (!character) return { ok: false, message: "No character." };
    const asset = character.assets.find((a) => a.id === assetId);
    if (!asset || asset.type !== 'property') return { ok: false, message: "Property not found." };
    set((s) => {
      if (!s.character) return;
      const i = s.character.assets.findIndex((a) => a.id === assetId);
      s.character.assets[i] = setPropertyOccupancy(s.character.assets[i], mode);
    });
    void get()._persist();
    return { ok: true, message: mode === 'rental' ? 'Listed as rental.' : 'Set as primary home.' };
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
      s.character.businesses[i] = hireBizEmployee(normalized, role, s.character.countryCode);
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

  repayDebt: (amount) => {
    const { character } = get();
    if (!character) return { ok: false, message: "No character." };
    const result = repayPersonalDebt(character, amount);
    if (!result.ok) return { ok: false, message: result.message };
    set((s) => {
      if (!s.character) return;
      s.character.bankBalance = result.bankBalance;
      s.character.debt = result.debt;
      if (result.entry) {
        s.character.financeLedger = appendFinanceLedger(
          s.character.financeLedger,
          result.entry,
        );
      }
      s.character.stats.wealth = result.wealth;
      const credit = tickCreditScore(s.character, { onTimePayment: true });
      s.character.creditScore = credit.creditScore;
      s.character.creditFactors = credit.creditFactors;
      s.character.creditInquiries = credit.creditInquiries;
    });
    void get()._persist();
    return { ok: true, message: result.message };
  },
});
