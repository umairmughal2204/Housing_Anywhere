import { useEffect, useState } from "react";
import { Settings as SettingsIcon, Save } from "lucide-react";
import { AdminPortalLayout } from "../components/admin-portal-layout";
import { API_BASE } from "../config";

interface PlatformSettings {
  tenantProtectionFeeRate: number;
  tenantProtectionFeeCap: number;
}

export function AdminSettings() {
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/admin/settings`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to load settings");
        setSettings((await res.json()) as PlatformSettings);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error");
      } finally {
        setIsLoading(false);
      }
    };
    void load();
  }, []);

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!settings) return;

    const token = localStorage.getItem("authToken");
    setIsSaving(true);
    setError(null);
    setStatus(null);

    try {
      const res = await fetch(`${API_BASE}/api/admin/settings`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error("Failed to save settings");
      setSettings((await res.json()) as PlatformSettings);
      setStatus("Settings saved successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AdminPortalLayout>
      <div className="max-w-[700px] mx-auto">
        <div className="mb-[20px] sm:mb-[32px]">
          <h1 className="text-[22px] sm:text-[28px] font-bold text-neutral-black tracking-[-0.02em]">Settings</h1>
          <p className="text-neutral-gray text-[13px] sm:text-[14px] mt-[4px]">Platform-wide configuration</p>
        </div>

        {error && (
          <div className="mb-[16px] px-[16px] py-[12px] bg-red-50 border border-red-200 rounded-[12px] text-red-600 text-[14px]">
            {error}
          </div>
        )}
        {status && (
          <div className="mb-[16px] px-[16px] py-[12px] bg-green-50 border border-green-200 rounded-[12px] text-green-700 text-[14px]">
            {status}
          </div>
        )}

        {isLoading ? (
          <div className="bg-white border border-[rgba(0,0,0,0.06)] rounded-[16px] p-[24px] animate-pulse space-y-[16px]">
            <div className="h-[16px] w-[40%] bg-neutral-light-gray rounded-full" />
            <div className="h-[44px] w-full bg-neutral-light-gray rounded-[10px]" />
            <div className="h-[16px] w-[40%] bg-neutral-light-gray rounded-full" />
            <div className="h-[44px] w-full bg-neutral-light-gray rounded-[10px]" />
          </div>
        ) : settings ? (
          <form onSubmit={handleSave} className="bg-white border border-[rgba(0,0,0,0.06)] rounded-[16px] p-[16px] sm:p-[24px] space-y-[24px]">
            <div className="flex items-center gap-[12px] pb-[16px] border-b border-[rgba(0,0,0,0.06)]">
              <div className="w-[40px] h-[40px] rounded-[10px] bg-brand-light flex items-center justify-center flex-shrink-0">
                <SettingsIcon className="w-[20px] h-[20px] text-brand-primary" />
              </div>
              <div>
                <h2 className="text-neutral-black text-[16px] font-bold">Tenant Protection Fee</h2>
                <p className="text-neutral-gray text-[13px]">Applied to every booking to cover Tenant Protection</p>
              </div>
            </div>

            <div>
              <label className="block text-neutral-black text-[13px] font-semibold mb-[8px]">
                Fee percentage (% of monthly rent)
              </label>
              <div className="relative max-w-[220px]">
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={0.1}
                  required
                  value={settings.tenantProtectionFeeRate}
                  onChange={(e) =>
                    setSettings((prev) => (prev ? { ...prev, tenantProtectionFeeRate: Number(e.target.value) } : prev))
                  }
                  className="w-full pl-[14px] pr-[36px] py-[10px] border border-[rgba(0,0,0,0.16)] rounded-[10px] text-neutral-black text-[14px] outline-none focus:border-brand-primary"
                />
                <span className="absolute right-[14px] top-1/2 -translate-y-1/2 text-neutral-gray text-[14px]">%</span>
              </div>
            </div>

            <div>
              <label className="block text-neutral-black text-[13px] font-semibold mb-[8px]">
                Maximum fee cap (currency amount)
              </label>
              <input
                type="number"
                min={0}
                step={1}
                required
                value={settings.tenantProtectionFeeCap}
                onChange={(e) =>
                  setSettings((prev) => (prev ? { ...prev, tenantProtectionFeeCap: Number(e.target.value) } : prev))
                }
                className="w-full max-w-[220px] px-[14px] py-[10px] border border-[rgba(0,0,0,0.16)] rounded-[10px] text-neutral-black text-[14px] outline-none focus:border-brand-primary"
              />
              <p className="text-neutral-gray text-[12px] mt-[6px]">
                The fee never exceeds this amount, even for high-rent listings.
              </p>
            </div>

            <div className="pt-[8px] flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-[8px] px-[24px] py-[11px] rounded-[10px] bg-brand-primary text-white text-[14px] font-semibold hover:bg-brand-primary-dark transition-colors disabled:opacity-60"
              >
                <Save className="w-[16px] h-[16px]" />
                {isSaving ? "Saving..." : "Save changes"}
              </button>
            </div>
          </form>
        ) : null}
      </div>
    </AdminPortalLayout>
  );
}
