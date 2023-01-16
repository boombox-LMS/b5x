import { NewUser } from "@b5x/types";

export interface RawSeedUser {
  persona: string;
  email?: string;
  username?: string;
  groups?: string[];
}

export interface NewSeedUser extends NewUser {
  firstName: string;
  lastName: string;
  createdAt: string;
}

// TODO: SavedSeedUser?
export interface SavedSeedUser {
  id: number;
  email: string;
  persona: string;
  groups: string[];
}
