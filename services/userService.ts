import { User } from "@/types";
import api from "./api";

export const userService = {
  /**
   * Update user verification status
   */
  async updateUserVerified(id: string, verified: boolean): Promise<User> {
    try {
      const response = await api.put(`/users/update_user_verified/${id}`, {
        verify: verified,
      });
      return response.data;
    } catch (error) {
      console.error("Error updating user verification status:", error);
      throw error;
    }
  },

  /**
   * Update user location
   */
  async updateUserLocation(
    userId: string,
    location: { latitude: number; longitude: number }
  ): Promise<User> {
    try {
      const response = await api.put(
        `/users/update_user_resident_position/${userId}`,
        location
      );
      return response.data;
    } catch (error) {
      console.error("Error updating user location:", error);
      throw error;
    }
  },

  /**
   * Get user profile
   */
  async getUserProfile(userId: string): Promise<User> {
    try {
      const response = await api.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      throw error;
    }
  },

  /**
   * Update user profile
   */
  async updateUserProfile(
    userId: string,
    profileData: Partial<User>
  ): Promise<User> {
    try {
      const response = await api.put(`/users/${userId}`, profileData);
      return response.data;
    } catch (error) {
      console.error("Error updating user profile:", error);
      throw error;
    }
  },

  /**
   * Change user password
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    try {
      await api.put(`/users/${userId}/password`, {
        currentPassword,
        newPassword,
      });
    } catch (error) {
      console.error("Error changing password:", error);
      throw error;
    }
  },

  /**
   * Upload user profile picture
   */
  async uploadProfilePicture(
    userId: string,
    imageUri: string
  ): Promise<{ imageUrl: string }> {
    try {
      const formData = new FormData();
      formData.append("profilePicture", {
        uri: imageUri,
        type: "image/jpeg",
        name: `profile-${userId}.jpg`,
      } as any);

      const response = await api.post(
        `/users/${userId}/profile-picture`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      throw error;
    }
  },

  /**
   * Delete user account
   */
  async deleteAccount(userId: string): Promise<void> {
    try {
      await api.delete(`/users/${userId}`);
    } catch (error) {
      console.error("Error deleting account:", error);
      throw error;
    }
  },

  /**
   * Get user statistics (for dashboard)
   */
  async getUserStats(userId: string): Promise<{
    totalReports: number;
    pendingReports: number;
    resolvedReports: number;
    collectionStreak: number;
  }> {
    try {
      const response = await api.get(`/users/${userId}/stats`);
      return response.data;
    } catch (error) {
      console.error("Error fetching user stats:", error);
      throw error;
    }
  },

  /**
   * Update user notification preferences
   */
  async updateNotificationPreferences(
    userId: string,
    preferences: {
      pushNotifications: boolean;
      emailNotifications: boolean;
      scheduleReminders: boolean;
      collectionAlerts: boolean;
    }
  ): Promise<User> {
    try {
      const response = await api.put(
        `/users/${userId}/notifications`,
        preferences
      );
      return response.data;
    } catch (error) {
      console.error("Error updating notification preferences:", error);
      throw error;
    }
  },

  /**
   * Verify user email
   */
  async verifyEmail(userId: string, verificationCode: string): Promise<void> {
    try {
      await api.post(`/users/${userId}/verify-email`, { verificationCode });
    } catch (error) {
      console.error("Error verifying email:", error);
      throw error;
    }
  },

  /**
   * Resend verification email
   */
  async resendVerificationEmail(userId: string): Promise<void> {
    try {
      await api.post(`/users/${userId}/resend-verification`);
    } catch (error) {
      console.error("Error resending verification email:", error);
      throw error;
    }
  },
};
