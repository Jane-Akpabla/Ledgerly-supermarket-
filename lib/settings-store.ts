export interface BrandSettings {
  brandName: string;
  logoUrl: string;
  primaryColor: string;
  theme: "light" | "dark";
}

const STORAGE_KEY = "ledgerlySettings";

const DEFAULT_SETTINGS: BrandSettings = {
  brandName: "Ledgerly",
  logoUrl: "",
  primaryColor: "#3b82f6",
  theme: "light",
};

let settings: BrandSettings = { ...DEFAULT_SETTINGS };
const subscribers = new Set<(settings: BrandSettings) => void>();

const notifySubscribers = () => {
  const currentSettings = { ...settings };
  subscribers.forEach((callback) => callback(currentSettings));
};

const applyPrimaryColor = (color: string) => {
  document.documentElement.style.setProperty("--color-primary", color);
};

const applyThemeClass = (theme: "light" | "dark") => {
  if (theme === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
};

const persistSettings = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.warn("Unable to persist settings:", error);
  }
};

const loadSettingsFromStorage = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<BrandSettings>;
      settings = { ...DEFAULT_SETTINGS, ...parsed };
    } else {
      settings = { ...DEFAULT_SETTINGS };
    }
  } catch (error) {
    settings = { ...DEFAULT_SETTINGS };
    console.warn("Unable to load saved settings:", error);
  }

  applyPrimaryColor(settings.primaryColor);
  applyThemeClass(settings.theme);
  notifySubscribers();
};

export const settingsStore = {
  getSettings: (): BrandSettings => ({ ...settings }),

  updateBrandName: (name: string) => {
    settings.brandName = name;
    persistSettings();
    notifySubscribers();
  },

  updateLogoUrl: (url: string) => {
    settings.logoUrl = url;
    persistSettings();
    notifySubscribers();
  },

  updatePrimaryColor: (color: string) => {
    settings.primaryColor = color;
    persistSettings();
    applyPrimaryColor(color);
    notifySubscribers();
  },

  updateTheme: (theme: "light" | "dark") => {
    settings.theme = theme;
    persistSettings();
    applyThemeClass(theme);
    notifySubscribers();
  },

  resetToDefaults: () => {
    settings = { ...DEFAULT_SETTINGS };
    localStorage.removeItem(STORAGE_KEY);
    applyPrimaryColor(settings.primaryColor);
    applyThemeClass(settings.theme);
    notifySubscribers();
  },

  loadSettings: () => {
    loadSettingsFromStorage();
  },

  subscribe: (callback: (settings: BrandSettings) => void) => {
    subscribers.add(callback);
    return () => subscribers.delete(callback);
  },

  unsubscribe: (callback: (settings: BrandSettings) => void) => {
    subscribers.delete(callback);
  },
};
