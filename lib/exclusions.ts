import fs from "fs";
import path from "path";

const EXCLUSIONS_FILE = path.join(process.cwd(), "lib", "excluded_payments.json");
const EXCLUDED_GIFTS_FILE = path.join(process.cwd(), "lib", "excluded_gifts.json");

// Cache em memória para pagamentos excluídos
let memoryPaymentExclusions = new Set<string>();
let isPaymentsLoaded = false;

// Cache em memória para presentes excluídos
let memoryGiftExclusions = new Set<string>();
let isGiftsLoaded = false;

function loadPaymentExclusions(): Set<string> {
  if (isPaymentsLoaded) return memoryPaymentExclusions;

  try {
    if (fs.existsSync(EXCLUSIONS_FILE)) {
      const content = fs.readFileSync(EXCLUSIONS_FILE, "utf-8");
      const list = JSON.parse(content);
      if (Array.isArray(list)) {
        memoryPaymentExclusions = new Set(list.map(String));
      }
    }
  } catch (e) {
    console.warn("[Exclusions] Aviso ao ler arquivo de exclusões de pagamentos:", e);
  }

  isPaymentsLoaded = true;
  return memoryPaymentExclusions;
}

function savePaymentExclusions(): void {
  try {
    const list = Array.from(memoryPaymentExclusions);
    fs.writeFileSync(EXCLUSIONS_FILE, JSON.stringify(list, null, 2), "utf-8");
  } catch (e) {
    console.warn("[Exclusions] Aviso ao salvar arquivo de exclusões de pagamentos:", e);
  }
}

export function isPaymentExcluded(mpPaymentId: string): boolean {
  if (!mpPaymentId) return false;
  const set = loadPaymentExclusions();
  return set.has(String(mpPaymentId));
}

export function addExcludedPayment(mpPaymentId: string): void {
  if (!mpPaymentId) return;
  const set = loadPaymentExclusions();
  set.add(String(mpPaymentId));
  savePaymentExclusions();
}

export function getExcludedPaymentIds(): Set<string> {
  return loadPaymentExclusions();
}

// --- Gestão de Presentes Excluídos ---

function loadGiftExclusions(): Set<string> {
  if (isGiftsLoaded) return memoryGiftExclusions;

  try {
    if (fs.existsSync(EXCLUDED_GIFTS_FILE)) {
      const content = fs.readFileSync(EXCLUDED_GIFTS_FILE, "utf-8");
      const list = JSON.parse(content);
      if (Array.isArray(list)) {
        memoryGiftExclusions = new Set(list.map((t) => String(t).trim().toLowerCase()));
      }
    }
  } catch (e) {
    console.warn("[Exclusions] Aviso ao ler arquivo de exclusões de presentes:", e);
  }

  isGiftsLoaded = true;
  return memoryGiftExclusions;
}

function saveGiftExclusions(): void {
  try {
    const list = Array.from(memoryGiftExclusions);
    fs.writeFileSync(EXCLUDED_GIFTS_FILE, JSON.stringify(list, null, 2), "utf-8");
  } catch (e) {
    console.warn("[Exclusions] Aviso ao salvar arquivo de exclusões de presentes:", e);
  }
}

export function isGiftExcluded(title: string): boolean {
  if (!title) return false;
  const set = loadGiftExclusions();
  return set.has(title.trim().toLowerCase());
}

export function addExcludedGift(title: string): void {
  if (!title) return;
  const set = loadGiftExclusions();
  set.add(title.trim().toLowerCase());
  saveGiftExclusions();
}
