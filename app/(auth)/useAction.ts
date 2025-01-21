"use client";
import { useState } from "react";

function useActionState<ActionState, FormDataType>(
  action: (state: ActionState, formData: FormDataType) => Promise<ActionState>,
  initialState: ActionState
): [ActionState, (formData: FormDataType) => Promise<void>] {
  const [state, setState] = useState(initialState);

  const formAction = async (formData: FormDataType) => {
    const result = await action(state, formData);
    setState(result);
  };

  return [state, formAction];
}

export default useActionState;
