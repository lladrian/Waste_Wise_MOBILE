import { userService } from "@/services/userService";
import { useRouter, useSegments } from "expo-router";
import React, { createContext, useContext, useEffect, useState } from "react";
import { authService } from "../services/authService";
import { otpService } from "../services/otpService";
import { localStorage } from "../storage/localStorage";
import { User } from "../types";

// Types
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  signup: (userData: SignupData) => Promise<SignupResponse>;
  verifyOTP: (email: string, otpCode: string) => Promise<void>; // Return the response
  resendOTP: (userId: string) => Promise<{ message: string }>;
  updateUser: (user: User) => void;
  refreshUser: () => Promise<void>;
}

interface SignupData {
  first_name: string;
  middle_name: string;
  last_name: string;
  gender: string;
  contact_number: string;
  password: string;
  email: string;
  barangay: string;
  role: string;
}

interface SignupResponse {
  message: string;
  userId?: string;
  requiresVerification?: boolean;
}

interface VerifyOTPResponse {
  message: string;
  token?: string;
  user?: User;
}

// Create Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider Component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    loading: true,
  });

  const router = useRouter();
  const segments = useSegments();

  // Check authentication on app start
  useEffect(() => {
    checkAuth();
  }, []);

  // Handle route protection based on auth state
  useEffect(() => {
    if (!state.loading) {
      const inAuthGroup = segments[0] === "auth";

      if (
        !state.user ||
        !state.isAuthenticated ||
        state.user.is_verified === false
      ) {
        // Redirect to login if not authenticated or not verified
        if (!inAuthGroup) {
          router.replace("/auth/login");
        }
      } else if (
        state.user &&
        state.isAuthenticated &&
        state.user.is_verified === true
      ) {
        // Redirect to appropriate dashboard if authenticated and verified
        if (inAuthGroup) {
          if (state.user.role === "resident") {
            router.replace("/resident");
          } else if (state.user.role === "collector") {
            router.replace("/collector");
          } else {
            router.replace("/resident");
          }
        }
      }
    }
  }, [state.user, state.isAuthenticated, state.loading, segments]);

  /**
   * Check if user is authenticated by verifying stored user data
   */
  const checkAuth = async (): Promise<void> => {
    try {
      const userData = await localStorage.getUser();

      if (userData) {
        setState({
          user: userData,
          token: null,
          isAuthenticated: true,
          loading: false,
        });
      } else {
        setState({
          user: null,
          token: null,
          isAuthenticated: false,
          loading: false,
        });
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setState({
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
      });
    }
  };

  /**
   * Login user with email and password
   */
  const login = async (email: string, password: string): Promise<void> => {
    try {
      setState((prev) => ({ ...prev, loading: true }));

      const response = await authService.login(email, password);
      console.log("Login response:", response);

      // Check if user is verified
      if (response.user && response.user.is_verified === false) {
        // Save user data to localStorage but DON'T set as authenticated
        await localStorage.setUser(response.user);

        // Store the user in state but mark as not authenticated
        setState({
          user: response.user,
          token: null,
          isAuthenticated: false, // Important: not authenticated
          loading: false,
        });

        // Throw error to trigger OTP modal
        const error: any = new Error(
          "Account not verified. Please verify your account."
        );
        error.requiresVerification = true;
        error.email = email;
        error.userId = response.user._id;
        throw error;
      }

      // Only set authenticated if user is verified
      if (response.user && response.user.is_verified === true) {
        await localStorage.setUser(response.user);

        setState({
          user: response.user,
          token: null,
          isAuthenticated: true, // Authenticated only when verified
          loading: false,
        });
      } else {
        throw new Error("Account verification status unknown.");
      }
    } catch (error) {
      setState((prev) => ({ ...prev, loading: false }));
      throw error;
    }
  };

  /**
   * Register new user
   */
  const signup = async (userData: SignupData): Promise<SignupResponse> => {
    try {
      setState((prev) => ({ ...prev, loading: true }));

      const response = await authService.signup({
        ...userData,
        role: "resident", // Force resident role for signup
      });

      setState((prev) => ({ ...prev, loading: false }));

      // Return the response for OTP handling in the component
      return response;
    } catch (error) {
      setState((prev) => ({ ...prev, loading: false }));
      throw error;
    }
  };

  /**
   * Update user verification status after successful OTP verification
   */
  const updateUserVerified = async (userId: string): Promise<void> => {
    try {
      // Fetch updated user data from the server using user ID
      const updatedUser = await userService.updateUserVerified(userId, true);

      if (updatedUser) {
        // Update both context state and local storage
        await localStorage.setUser(updatedUser);

        setState((prevState) => ({
          ...prevState,
          user: updatedUser,
          isAuthenticated: true,
        }));

        console.log(
          "User verification status updated:",
          updatedUser.is_verified
        );
      }
    } catch (error) {
      console.error("Failed to update user verification status:", error);
      throw error;
    }
  };

  /**
   * Verify OTP code for account activation
   */

  const verifyOTP = async (
    email: string,
    otpCode: string,
    userId?: string
  ): Promise<void> => {
    try {
      setState((prev) => ({ ...prev, loading: true }));

      console.log("Starting OTP verification for:", { email, otpCode, userId });

      // Verify OTP with the server
      const response = await otpService.verifyOTP({
        email,
        otp: otpCode,
        otp_type: "verification",
      });

      console.log("OTP Verification Response:", response);

      // If OTP verification is successful, update user verification status
      if (
        response.message &&
        response.message.includes("OTP verified successfully")
      ) {
        console.log("OTP verified successfully, updating user status...");

        // Get current user data
        let currentUser = state.user;
        if (!currentUser) {
          currentUser = await localStorage.getUser();
        }

        // Update user verification status
        if (currentUser) {
          const updatedUser = {
            ...currentUser,
            is_verified: true,
            verified_at: new Date().toISOString(),
          };

          // Save updated user to localStorage
          await localStorage.setUser(updatedUser);

          // Update state and mark as authenticated
          setState((prevState) => ({
            ...prevState,
            user: updatedUser,
            isAuthenticated: true, // Now mark as authenticated
          }));

          console.log(
            "User verification status updated successfully, user is now authenticated"
          );
        } else {
          console.warn("No user data found to update");
        }
      }
    } catch (error: any) {
      console.error("OTP Verification Error:", error);
      setState((prev) => ({ ...prev, loading: false }));
      throw error;
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  };
  /**
   * Resend OTP code
   */
  const resendOTP = async (email: string): Promise<{ message: string }> => {
    try {
      const response = await otpService.resendOTP(email, "verification");
      return response;
    } catch (error) {
      throw error;
    }
  };

  /**
   * Logout user and clear all stored data
   */
  const logout = async (): Promise<void> => {
    try {
      setState((prev) => ({ ...prev, loading: true }));

      await localStorage.clearAuth();

      setState({
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
      });

      router.replace("/auth/login");
    } catch (error) {
      console.error("Logout error:", error);
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  /**
   * Update user data in both context state and local storage
   */
  const updateUser = (user: User): void => {
    setState((prevState) => ({
      ...prevState,
      user: user,
    }));

    // Persist to local storage
    localStorage.setUser(user).catch((error) => {
      console.error("Failed to save user to local storage:", error);
    });
  };

  /**
   * Refresh user data from local storage
   */
  const refreshUser = async (): Promise<void> => {
    try {
      const userData = await localStorage.getUser();
      if (userData) {
        setState((prevState) => ({
          ...prevState,
          user: userData,
        }));
      }
    } catch (error) {
      console.error("Error refreshing user data:", error);
    }
  };

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    signup,
    verifyOTP,
    resendOTP,
    updateUser,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Custom hook to use auth context
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
