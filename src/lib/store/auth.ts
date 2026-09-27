import { create } from "zustand";

/**
 * Ephemeral (non-persisted) mirror of Clerk's session state.
 *
 * Clerk's `useAuth()` hook throws when called outside a `<ClerkProvider>`, and in
 * guest mode (no publishable key) the app renders with NO provider at all. Guest-
 * safe hooks like `useHistory`/`useCloudStats` therefore can't call `useAuth()`
 * directly. Instead, `<AuthBridge>` (mounted only inside `<ClerkProvider>`) writes
 * the live auth state here, and those hooks read it — safe on every render path.
 *
 * Defaults describe the guest: loaded, signed-out. In guest mode nothing ever
 * updates it, so cloud fetches (gated on `isLoaded && isSignedIn`) never fire.
 */
interface AuthState {
  isLoaded: boolean;
  isSignedIn: boolean;
  setAuth: (isLoaded: boolean, isSignedIn: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isLoaded: true,
  isSignedIn: false,
  setAuth: (isLoaded, isSignedIn) => set({ isLoaded, isSignedIn }),
}));
