"use server";

import { z } from "zod";

import { signIn } from "./auth";
import axios from "axios";
const authFormSchema = z.object({
  username: z.string().optional(),
  email: z.string().email(),
  password: z.string().min(6),
});

export interface LoginActionState {
  status: "idle" | "in_progress" | "success" | "failed" | "invalid_data";
}

export const login = async (
  _: LoginActionState,
  formData: FormData
): Promise<LoginActionState> => {
  try {
    const validatedData = authFormSchema.parse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    await signIn("credentials", {
      email: validatedData.email,
      password: validatedData.password,
      redirect: false,
    });

    return { status: "success" };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { status: "invalid_data" };
    }

    return { status: "failed" };
  }
};

export interface RegisterActionState {
  status:
    | "idle"
    | "in_progress"
    | "success"
    | "failed"
    | "user_exists"
    | "invalid_data";
}

export const register = async (
  _: RegisterActionState,
  formData: FormData
): Promise<RegisterActionState> => {
  try {
    const validatedData = authFormSchema.parse({
      username: formData.get("username"),
      email: formData.get("email"),
      password: formData.get("password"),
    });
    const res_check_email = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/account/check-email/`,
      {
        email: validatedData.email,
      }
    );
    if (res_check_email.data.email_exists) return { status: "user_exists" };
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/registration/`,
      {
        username: validatedData.username,
        email: validatedData.email,
        password1: validatedData.password,
        password2: validatedData.password,
      }
    );
    if (response.status === 201) {
      return { status: "success" };
    }
    return { status: "failed" };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { status: "invalid_data" };
    }
    return { status: "failed" };
  }
};
