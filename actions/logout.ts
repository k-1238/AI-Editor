"use server";

import { signOut } from "@/app/(auth)/auth";

export const logout = async () => {
  // some server stuff
  await signOut();
};
