export interface ClassConfig {
  display: string;
  colorHex: string;
  colorTw: string;
  description: string;
}

export const CLASS_CONFIG: Record<string, ClassConfig> = {
  exoplanet_transit: {
    display: "Exoplanet Transit",
    colorHex: "#3C3489",
    colorTw: "planet",
    description: "Planetary transit candidate",
  },
  eclipsing_binary: {
    display: "Eclipsing Binary",
    colorHex: "#712B13",
    colorTw: "binary",
    description: "Eclipsing stellar binary",
  },
  blend_contamination: {
    display: "Blend / Contamination",
    colorHex: "#D48B00",
    colorTw: "blend",
    description: "Blend or nearby contaminant",
  },
  stellar_variability_or_other: {
    display: "Stellar Variability / Other",
    colorHex: "#444441",
    colorTw: "noise",
    description: "Stellar variability or noise",
  },
};

const ALIASES: Record<string, string> = {
  exoplanet_like: "exoplanet_transit",
  eclipsing_binary_like: "eclipsing_binary",
  noise_or_other: "stellar_variability_or_other",
};

export function resolveClass(cls: string): string {
  return ALIASES[cls] ?? cls;
}

export function getClassConfig(cls: string): ClassConfig {
  return CLASS_CONFIG[resolveClass(cls)] ?? CLASS_CONFIG["stellar_variability_or_other"];
}
