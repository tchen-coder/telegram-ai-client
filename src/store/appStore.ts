import { createContext, useContext } from 'react';

export interface AppUser {
  userId: string;
  userName: string;
}

export interface AppState {
  user: AppUser | null;
  currentRoleId: number | null;
  setCurrentRoleId: (id: number | null) => void;
}

export const AppContext = createContext<AppState>({
  user: null,
  currentRoleId: null,
  setCurrentRoleId: () => {},
});

export function useApp() {
  return useContext(AppContext);
}
