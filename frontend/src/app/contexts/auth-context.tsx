import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { API_BASE } from "../config";

interface LandlordProfile {
  businessType: "individual" | "dealer" | "agency";
  numberOfProperties: number;
  countryOfRegistration: string;
  phoneCountryCode: string;
  phoneNumber: string;
  businessName?: string;
  licenseNumber?: string;
  address?: string;
  city?: string;
  postalCode?: string;
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  name: string;
  hasPassword?: boolean;
  profilePictureUrl?: string;
  role: "tenant" | "landlord";
  isLandlord: boolean;
  dateOfBirth?: string;
  gender?: "male" | "female" | "other";
  cityOfResidence?: string;
  nationality?: string;
  occupation?: "student" | "working" | "other";
  organization?: string;
  aboutMe?: string;
  languages?: string[];
  phoneCountryCode?: string;
  phoneNumber?: string;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  landlordProfile?: LandlordProfile;
}

interface ProfileUpdateData {
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  gender?: "male" | "female" | "other";
  cityOfResidence?: string;
  nationality?: string;
  occupation?: "student" | "working" | "other";
  organization?: string;
  aboutMe?: string;
  languages?: string[];
}

interface ContactUpdateData {
  email: string;
  phoneCountryCode: string;
  phoneNumber: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  loginWithGoogle: (credential: string, rememberMe?: boolean) => Promise<void>;
  signup: (data: SignupData) => Promise<SignupCodeResponse>;
  confirmSignupCode: (pendingSignupId: string, code: string) => Promise<void>;
  signupWithGoogle: (credential: string) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPasswordWithToken: (token: string, newPassword: string) => Promise<void>;
  logout: () => void;
  registerAsLandlord: (profileData: LandlordProfile) => Promise<void>;
  updateProfile: (data: ProfileUpdateData) => Promise<void>;
  updateContactDetails: (data: ContactUpdateData) => Promise<void>;
  changePassword: (newPassword: string, currentPassword?: string) => Promise<void>;
  uploadProfilePicture: (file: File) => Promise<void>;
  deleteAccount: () => Promise<void>;
}

interface SignupData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: "tenant" | "landlord";
}

interface SignupCodeResponse {
  pendingSignupId: string;
  expiresAt: string;
  message?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthResponse {
  token: string;
  user: User;
}

interface UserResponse {
  user: User;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const saveUser = (nextUser: User) => {
    localStorage.setItem("user", JSON.stringify(nextUser));
    setUser(nextUser);
  };

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
        saveUser(data.user);
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

  const login = async (email: string, password: string, rememberMe = false) => {
    const requestInit: RequestInit = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, rememberMe }),
    };

    const loginUrl = `${API_BASE}/api/auth/login`;

    const performLoginRequest = async () => fetch(loginUrl, requestInit);

    let response: Response;
    try {
      response = await performLoginRequest();
    } catch (error) {
      if (error instanceof TypeError) {
        await new Promise((resolve) => window.setTimeout(resolve, 400));
        response = await performLoginRequest();
      } else {
        throw error;
      }
    }

    if (response.status === 401 && !response.url.includes("/api/auth/login")) {
      logout();
      throw new Error("Session expired, please log in again");
    }

    if (!response.ok) {
      let errorMessage = "Login failed";
      try {
        const error = (await response.json()) as { message?: string };
        errorMessage = error.message ?? errorMessage;
      } catch {
        // Keep fallback message when non-JSON errors are returned.
      }
      throw new Error(errorMessage);
    }

    const data = (await response.json()) as AuthResponse;
    localStorage.setItem("authToken", data.token);
    saveUser(data.user);
  };

  const signup = async (data: SignupData) => {
    const response = await fetch(`${API_BASE}/api/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (response.status === 401) {
      logout();
      throw new Error("Session expired, please log in again");
    }

    if (!response.ok) {
      const error = (await response.json()) as { message?: string };
      throw new Error(error.message ?? "Signup failed");
    }

    const payload = (await response.json()) as SignupCodeResponse;
    return payload;
  };

  const confirmSignupCode = async (pendingSignupId: string, code: string) => {
    const response = await fetch(`${API_BASE}/api/auth/signup/confirm`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ pendingSignupId, code }),
    });

    if (!response.ok) {
      let errorMessage = "Verification failed";
      try {
        const error = (await response.json()) as { message?: string };
        errorMessage = error.message ?? errorMessage;
      } catch {
        // Keep fallback message when non-JSON errors are returned.
      }

      throw new Error(errorMessage);
    }

    const payload = (await response.json()) as AuthResponse;
    localStorage.setItem("authToken", payload.token);
    saveUser(payload.user);
  };

  const authenticateWithGoogle = async (credential: string, rememberMe = false) => {
    const response = await fetch(`${API_BASE}/api/auth/google`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ credential, rememberMe }),
    });

    if (response.status === 429) {
      throw new Error("Too many attempts. Please wait a few minutes before trying again.");
    }

    if (response.status === 401) {
      logout();
      throw new Error("Session expired, please log in again");
    }

    if (!response.ok) {
      let errorMessage = "Google authentication failed";
      try {
        const error = (await response.json()) as { message?: string };
        errorMessage = error.message ?? errorMessage;
      } catch {
        errorMessage = `Request failed with status ${response.status}`;
      }
      throw new Error(errorMessage);
    }

    const payload = (await response.json()) as AuthResponse;
    localStorage.setItem("authToken", payload.token);
    saveUser(payload.user);
  };

  const signupWithGoogle = async (credential: string) => {
    await authenticateWithGoogle(credential);
  };

  const loginWithGoogle = async (credential: string, rememberMe = false) => {
    await authenticateWithGoogle(credential, rememberMe);
  };

  const requestPasswordReset = async (email: string) => {
    const response = await fetch(`${API_BASE}/api/auth/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      let errorMessage = "Failed to send reset email";
      try {
        const error = (await response.json()) as { message?: string };
        errorMessage = error.message ?? errorMessage;
      } catch {
        // Keep fallback message when non-JSON errors are returned.
      }
      throw new Error(errorMessage);
    }
  };

  const resetPasswordWithToken = async (token: string, newPassword: string) => {
    const response = await fetch(`${API_BASE}/api/auth/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token, newPassword }),
    });

    if (!response.ok) {
      let errorMessage = "Failed to reset password";
      try {
        const error = (await response.json()) as { message?: string };
        errorMessage = error.message ?? errorMessage;
      } catch {
        // Keep fallback message when non-JSON errors are returned.
      }
      throw new Error(errorMessage);
    }
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

    if (response.status === 401) {
      logout();
      throw new Error("Session expired, please log in again");
    }

    if (!response.ok) {
      const error = (await response.json()) as { message?: string };
      throw new Error(error.message ?? "Failed to register landlord profile");
    }

    const payload = (await response.json()) as AuthResponse;
    localStorage.setItem("authToken", payload.token);
    saveUser(payload.user);
  };

  const updateProfile = async (data: ProfileUpdateData) => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      throw new Error("You must be logged in");
    }

    const response = await fetch(`${API_BASE}/api/auth/me/profile`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (response.status === 401) {
      logout();
      throw new Error("Session expired, please log in again");
    }

    if (!response.ok) {
      const error = (await response.json()) as { message?: string };
      throw new Error(error.message ?? "Failed to update profile");
    }

    const payload = (await response.json()) as UserResponse;
    saveUser(payload.user);
  };

  const updateContactDetails = async (data: ContactUpdateData) => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      throw new Error("You must be logged in");
    }

    const response = await fetch(`${API_BASE}/api/auth/me/contact`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (response.status === 401) {
      logout();
      throw new Error("Session expired, please log in again");
    }

    if (!response.ok) {
      const error = (await response.json()) as { message?: string };
      throw new Error(error.message ?? "Failed to update contact details");
    }

    const payload = (await response.json()) as AuthResponse;
    localStorage.setItem("authToken", payload.token);
    saveUser(payload.user);
  };

  const changePassword = async (newPassword: string, currentPassword?: string) => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      throw new Error("You must be logged in");
    }

    const response = await fetch(`${API_BASE}/api/auth/me/password`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    if (response.status === 401) {
      logout();
      throw new Error("Session expired, please log in again");
    }

    if (!response.ok) {
      const error = (await response.json()) as { message?: string };
      throw new Error(error.message ?? "Failed to update password");
    }
  };

  const uploadProfilePicture = async (file: File) => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      throw new Error("You must be logged in");
    }

    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch(`${API_BASE}/api/auth/me/profile-picture`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (response.status === 401) {
      logout();
      throw new Error("Session expired, please log in again");
    }

    if (!response.ok) {
      const error = (await response.json()) as { message?: string };
      throw new Error(error.message ?? "Failed to upload profile picture");
    }

    const payload = (await response.json()) as UserResponse;
    saveUser(payload.user);
  };

  const deleteAccount = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      throw new Error("You must be logged in");
    }

    const response = await fetch(`${API_BASE}/api/auth/me`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = (await response.json()) as { message?: string };
      throw new Error(error.message ?? "Failed to delete account");
    }

    localStorage.removeItem("user");
    localStorage.removeItem("authToken");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        loginWithGoogle,
        signup,
        confirmSignupCode,
        signupWithGoogle,
        requestPasswordReset,
        resetPasswordWithToken,
        logout,
        registerAsLandlord,
        updateProfile,
        updateContactDetails,
        changePassword,
        uploadProfilePicture,
        deleteAccount,
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