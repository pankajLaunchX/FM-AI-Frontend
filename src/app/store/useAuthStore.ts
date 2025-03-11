import { create } from "zustand";

interface AuthState {
  accessToken: string | null;
  setAccessToken: (token: string) => void;
  refreshAccessToken: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,

  setAccessToken: (token) => set({ accessToken: token }),

  refreshAccessToken: async () => {
    try {

      const response = await fetch("/api/auth/refresh", {
        credentials: "include", // Allows cookies to be sent
      });
      const data = await response.json()
      const at = data.accessToken;
      console.log(at)
      set({accessToken : at});
    } catch (error) {
      console.error("Failed to refresh token", error);
      set({ accessToken: null }); // Clear access token on failure
    }
  }

//   logout: () => {
//     set({ accessToken: null });
//     axios.post("/api/auth/logout", {}, { withCredentials: true });
//   },
}));
