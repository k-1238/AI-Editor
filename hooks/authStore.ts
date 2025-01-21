import { create } from "zustand";
import { z } from "zod";

// Define a Zod schema for authentication data
const authSchema = z.object({
  token: z.string(),
  user: z.object({
    id: z.number(),
    name: z.string(),
    email: z.string().email(),
  }),
});

// Define the TypeScript type based on the schema
type AuthData = z.infer<typeof authSchema>;

// Define the Zustand store
interface AuthStore {
  authData: AuthData | null; // Holds authenticated user data
  isAuthenticated: boolean; // Flag to check if the user is authenticated
  setAuthData: (data: unknown) => void; // Sets the authentication data
  clearAuthData: () => void; // Clears the authentication data
}

const useAuthStore = create<AuthStore>((set) => ({
  authData: null,
  isAuthenticated: false,
  setAuthData: (data) => {
    try {
      const validatedData = authSchema.parse(data); // Validate data with Zod
      set({ authData: validatedData, isAuthenticated: true });
    } catch (error) {
      console.error("Invalid authentication data:", error);
    }
  },
  clearAuthData: () => set({ authData: null, isAuthenticated: false }),
}));

export default useAuthStore;
