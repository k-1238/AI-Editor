"use server";

import { signOut } from "@/app/(auth)/auth";
import axios from "axios";

export const logout = async () => {
  // some server stuff
  await axios
    .post(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/logout/`)
    .then(async () => {
      await signOut();
    });
};
