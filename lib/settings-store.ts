export interface BrandSettings {
  brandName: string;
  logoUrl: string;
  primaryColor: string;
  theme: "light" | "dark";
}

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

export const settingsStore = {
  getSettings: (): BrandSettings => ({ ...settings }),

  updateBrandName: (name: string) => {
    settings.brandName = name;
    localStorage.setItem("brandName", name);
    notifySubscribers();
  },

  updateLogoUrl: (url: string) => {
    settings.logoUrl = url;
    localStorage.setItem("logoUrl", url);
    notifySubscribers();
  },

  updatePrimaryColor: (color: string) => {
    settings.primaryColor = color;
    localStorage.setItem("primaryColor", color);
    applyPrimaryColor(color);
    notifySubscribers();
  },

  updateTheme: (theme: "light" | "dark") => {
    settings.theme = theme;
    localStorage.setItem("theme", theme);
    applyThemeClass(theme);
    notifySubscribers();
  },

  resetToDefaults: () => {
    settings = { ...DEFAULT_SETTINGS };
    localStorage.removeItem("brandName");
    localStorage.removeItem("logoUrl");
    localStorage.removeItem("primaryColor");
    localStorage.removeItem("theme");
    applyPrimaryColor(settings.primaryColor);
    applyThemeClass(settings.theme);
    notifySubscribers();
  },

  loadSettings: () => {
    const savedBrandName = localStorage.getItem("brandName");
    const savedLogoUrl = localStorage.getItem("logoUrl");
    const savedColor = localStorage.getItem("primaryColor");
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;

    settings = { ...DEFAULT_SETTINGS };

    if (savedBrandName) settings.brandName = savedBrandName;
    if (savedLogoUrl) settings.logoUrl = savedLogoUrl;
    if (savedColor) settings.primaryColor = savedColor;
    if (savedTheme) settings.theme = savedTheme;

    applyPrimaryColor(settings.primaryColor);
    applyThemeClass(settings.theme);
    notifySubscribers();
  },

  subscribe: (callback: (settings: BrandSettings) => void) => {
    subscribers.add(callback);
    return () => subscribers.delete(callback);
  },

  unsubscribe: (callback: (settings: BrandSettings) => void) => {
    subscribers.delete(callback);
  },
};
