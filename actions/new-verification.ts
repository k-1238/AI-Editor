"use server";

import { getUserByEmail } from "@/data/user";
import { getVerificationTokenByToken } from "@/data/verification-token";
import axios from "axios";

export const newVerification = async (token: string) => {
  const existingToken = await getVerificationTokenByToken(token);
  if (!existingToken) {
    return { error: "Token does not exist!" };
  }

  const hasExpired = new Date(existingToken.expires) < new Date();

  if (hasExpired) {
    return { error: "Token has expired!" };
  }

  const existingUser = await getUserByEmail(existingToken.email);
  if (!existingUser) {
    return { error: "Email does not exist" };
  }
  const res = await axios.post(
    "http://127.0.0.1:8000/api/auth/update-user-and-delete-token",
    {
      user_id: existingUser.id,
      token_id: existingToken.token,
    },
    {
      withCredentials: true,
    }
  );
  if(res.status === 200) 
    return { success: "Email verified!" };
  if(res.status === 400)
    return { error: "Email already verified!" };
};
