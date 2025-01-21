"use server";

import { z } from "zod";

import { signIn } from "./auth";
import Cookies from "js-cookie";
import axios from "axios";
const authFormSchema = z.object({
  username: z.string().optional(),
  email: z.string().email(),
  password: z.string().min(6),
});
const csrfToken = Cookies.get("csrftoken");

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
      redirectTo: "/chat",
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
    const response = await axios.post("http://127.0.0.1:8000/api/register/", {
      username: validatedData.username,
      email: validatedData.email,
      password: validatedData.password,
      password2: validatedData.password,
    });
    if (response.status === 201) {
      return { status: "success" };
    } else if (response.status === 400 && response.data.non_field_errors) {
      return { status: "user_exists" };
    }

    return { status: "failed" };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { status: "invalid_data" };
    }

    return { status: "failed" };
  }
};
