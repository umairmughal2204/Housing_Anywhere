import { useEffect, useState } from "react";
import { API_BASE } from "../config";

interface PlatformSettings {
  tenantProtectionFeeRate: number;
  tenantProtectionFeeCap: number;
}

const DEFAULT_SETTINGS: PlatformSettings = {
  tenantProtectionFeeRate: 10,
  tenantProtectionFeeCap: 250,
};

export function usePlatformSettings() {
  const [settings, setSettings] = useState<PlatformSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    let isCancelled = false;

    void fetch(`${API_BASE}/api/settings`)
      .then((res) => (res.ok ? (res.json() as Promise<PlatformSettings>) : null))
      .then((data) => {
        if (data && !isCancelled) setSettings(data);
      })
      .catch(() => {});

    return () => {
      isCancelled = true;
    };
  }, []);

  return settings;
}
