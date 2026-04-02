import { RouterProvider } from "react-router";
import { router } from "./routes";
import { AuthProvider } from "./contexts/auth-context";
import { Toaster } from "sonner";
import { useEffect } from "react";
import { initAutoTranslate } from "./utils/translate";

export default function App() {
  useEffect(() => {
    initAutoTranslate();
  }, []);

  useEffect(() => {
    let previousPath = `${router.state.location.pathname}${router.state.location.search}`;

    const unsubscribe = router.subscribe((state) => {
      const nextPath = `${state.location.pathname}${state.location.search}`;
      if (nextPath !== previousPath) {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
        previousPath = nextPath;
      }
    });

    return unsubscribe;
  }, []);

  return (
    <AuthProvider>
      <RouterProvider router={router} />
      <Toaster
        richColors
        position="top-right"
        toastOptions={{
          classNames: {
            toast: "group toast group-[.toaster]:bg-white group-[.toaster]:text-neutral-black group-[.toaster]:border group-[.toaster]:border-neutral-hover group-[.toaster]:shadow-md group-[.toaster]:rounded-lg",
            description: "group-[.toast]:text-neutral-gray group-[.toast]:text-[14px]",
            actionButton: "group-[.toast]:bg-brand-primary group-[.toast]:text-white group-[.toast]:px-[16px] group-[.toast]:py-[8px]",
            closeButton: "group-[.toast]:bg-neutral-light-gray group-[.toast]:text-neutral-gray hover:group-[.toast]:bg-neutral-hover",
          },
          style: {
            background: "white",
            color: "#1A1A1A",
            border: "1px solid rgba(0,0,0,0.08)",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            padding: "16px",
            fontSize: "14px",
            fontWeight: "500",
          },
        }}
      />
    </AuthProvider>
  );
}