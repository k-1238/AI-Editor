"use server";

import * as z from "zod";

import { RegisterSchema } from "@/schemas";
import axios from "axios";
import { getUserByEmail } from "@/data/user";

export const register = async (values: z.infer<typeof RegisterSchema>) => {
  const validatedFields = RegisterSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { email, name, password } = validatedFields.data;
  const isExist = await getUserByEmail(email);
  if (isExist) {
    return { error: "Email already in use!" };
  }
  let result;
  await axios
    .post(
      "http://127.0.0.1:8000/api/auth/register",
      { name, email, password },
      {
        withCredentials: true,
      }
    )
    .then(async (res) => {
      await axios
        .post("http://127.0.0.1:8000/api/auth/request-verification", {
          email: res.data.user.email,
        })
        .then(async (res) => {
          result = res.data.result;
        })
        .catch((err) => {
          console.log(err.response.status);
        });
    })
    .catch((err) => {
      console.log(err.response.status);
    });
    return result;
};
