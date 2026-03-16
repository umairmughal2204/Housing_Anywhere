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

  return (
    <AuthProvider>
      <RouterProvider router={router} />
      <Toaster richColors position="top-right" />
    </AuthProvider>
  );
}