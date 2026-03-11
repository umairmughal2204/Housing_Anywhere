import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface LandlordProfile {
  businessType: "individual" | "dealer" | "agency";
  numberOfProperties: number;
  phoneNumber: string;
  businessName?: string;
  licenseNumber?: string;
  address: string;
  city: string;
  postalCode: string;
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  name: string;
  role: "tenant" | "landlord";
  isLandlord: boolean;
  landlordProfile?: LandlordProfile;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => void;
  registerAsLandlord: (profileData: LandlordProfile) => Promise<void>;
}

interface SignupData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: "tenant" | "landlord";
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";

interface AuthResponse {
  token: string;
  user: User;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const bootstrapAuth = async () => {
      const storedToken = localStorage.getItem("authToken");
      const storedUser = localStorage.getItem("user");

      if (!storedToken || !storedUser) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        });

        if (!response.ok) {
          throw new Error("Session expired");
        }

        const data = (await response.json()) as { user: User };
        localStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user);
      } catch {
        localStorage.removeItem("user");
        localStorage.removeItem("authToken");
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    void bootstrapAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = (await response.json()) as { message?: string };
      throw new Error(error.message ?? "Login failed");
    }

    const data = (await response.json()) as AuthResponse;
    localStorage.setItem("user", JSON.stringify(data.user));
    localStorage.setItem("authToken", data.token);
    setUser(data.user);
  };

  const signup = async (data: SignupData) => {
    const response = await fetch(`${API_BASE}/api/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = (await response.json()) as { message?: string };
      throw new Error(error.message ?? "Signup failed");
    }

    const payload = (await response.json()) as AuthResponse;
    localStorage.setItem("user", JSON.stringify(payload.user));
    localStorage.setItem("authToken", payload.token);
    setUser(payload.user);
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("authToken");
    setUser(null);
  };

  const registerAsLandlord = async (profileData: LandlordProfile) => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      throw new Error("You must be logged in");
    }

    const response = await fetch(`${API_BASE}/api/auth/register-landlord`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      const error = (await response.json()) as { message?: string };
      throw new Error(error.message ?? "Failed to register landlord profile");
    }

    const payload = (await response.json()) as AuthResponse;
    localStorage.setItem("user", JSON.stringify(payload.user));
    localStorage.setItem("authToken", payload.token);
    setUser(payload.user);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
        registerAsLandlord,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}