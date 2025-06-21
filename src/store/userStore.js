import { create } from "zustand";
import { users } from "../data/mockData";

const getInitialProfile = () => {
  // This check ensures localStorage is only accessed on the client-side.
  if (typeof window !== "undefined") {
    const savedProfile = localStorage.getItem("userProfile");
    if (savedProfile) {
      try {
        return JSON.parse(savedProfile);
      } catch (e) {
        console.error("Failed to parse user profile from localStorage", e);
        // If parsing fails, fall back to default.
      }
    }
  }
  return users[0]; // Default mock data
};

export const useProfileStore = create((set) => ({
  profileData: getInitialProfile(),
  setProfileData: (newProfileData) => {
    set({ profileData: newProfileData });
    // Also update localStorage whenever the profile data changes.
    if (typeof window !== "undefined") {
      localStorage.setItem("userProfile", JSON.stringify(newProfileData));
    }
  },
}));
