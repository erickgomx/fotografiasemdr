import fs from "fs";
import path from "path";

const EXCLUSIONS_FILE = path.join(process.cwd(), "lib", "excluded_payments.json");

// Cache em memória
let memoryExclusions = new Set<string>();
let isLoaded = false;

function loadExclusions(): Set<string> {
  if (isLoaded) return memoryExclusions;

  try {
    if (fs.existsSync(EXCLUSIONS_FILE)) {
      const content = fs.readFileSync(EXCLUSIONS_FILE, "utf-8");
      const list = JSON.parse(content);
      if (Array.isArray(list)) {
        memoryExclusions = new Set(list.map(String));
      }
    }
  } catch (e) {
    console.warn("[Exclusions] Aviso ao ler arquivo de exclusões:", e);
  }

  isLoaded = true;
  return memoryExclusions;
}

function saveExclusions(): void {
  try {
    const list = Array.from(memoryExclusions);
    fs.writeFileSync(EXCLUSIONS_FILE, JSON.stringify(list, null, 2), "utf-8");
  } catch (e) {
    console.warn("[Exclusions] Aviso ao salvar arquivo de exclusões:", e);
  }
}

export function isPaymentExcluded(mpPaymentId: string): boolean {
  if (!mpPaymentId) return false;
  const set = loadExclusions();
  return set.has(String(mpPaymentId));
}

export function addExcludedPayment(mpPaymentId: string): void {
  if (!mpPaymentId) return;
  const set = loadExclusions();
  set.add(String(mpPaymentId));
  saveExclusions();
}

export function getExcludedPaymentIds(): Set<string> {
  return loadExclusions();
}
