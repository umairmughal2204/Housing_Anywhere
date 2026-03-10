import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  name: string;
  role: "tenant" | "landlord";
  isLandlord: boolean;
  landlordProfile?: {
    businessType: "individual" | "dealer" | "agency";
    numberOfProperties: number;
    phoneNumber: string;
    businessName?: string;
    licenseNumber?: string;
    address: string;
    city: string;
    postalCode: string;
  };
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => void;
  registerAsLandlord: (profileData: User["landlordProfile"]) => void;
}

interface SignupData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: "tenant" | "landlord";
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("authToken");
    
    if (storedUser && storedToken) {
      const parsedUser = JSON.parse(storedUser);
      // Ensure backward compatibility - add name field if it doesn't exist
      if (!parsedUser.name) {
        parsedUser.name = `${parsedUser.firstName} ${parsedUser.lastName}`;
      }
      // Add isLandlord flag if it doesn't exist
      if (parsedUser.isLandlord === undefined) {
        parsedUser.isLandlord = parsedUser.role === "landlord" || !!parsedUser.landlordProfile;
      }
      setUser(parsedUser);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Mock authentication - in production, this would be a real API call
    if (password.length < 6) {
      throw new Error("Invalid credentials");
    }

    // Create mock user
    const firstName = email.split("@")[0].charAt(0).toUpperCase() + email.split("@")[0].slice(1);
    const lastName = "User";
    const mockUser: User = {
      id: "user_" + Date.now(),
      email,
      firstName,
      lastName,
      name: `${firstName} ${lastName}`,
      role: "tenant",
      isLandlord: false,
    };

    // Store in localStorage
    localStorage.setItem("user", JSON.stringify(mockUser));
    localStorage.setItem("authToken", "mock_token_" + Date.now());

    setUser(mockUser);
  };

  const signup = async (data: SignupData) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Mock validation
    if (data.password.length < 8) {
      throw new Error("Password must be at least 8 characters");
    }

    // Create user
    const newUser: User = {
      id: "user_" + Date.now(),
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      name: `${data.firstName} ${data.lastName}`,
      role: data.role,
      isLandlord: data.role === "landlord",
    };

    // Store in localStorage
    localStorage.setItem("user", JSON.stringify(newUser));
    localStorage.setItem("authToken", "mock_token_" + Date.now());

    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("authToken");
    setUser(null);
  };

  const registerAsLandlord = (profileData: User["landlordProfile"]) => {
    if (user) {
      const updatedUser: User = {
        ...user,
        isLandlord: true,
        landlordProfile: profileData,
      };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
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