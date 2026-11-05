import { useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { getErrorMessage } from "@/shared/utils/error.utils";
import { useAuthStore } from "@/store/authStore";
import { MIN_PASSWORD_LENGTH } from "../constants/auth.constants";
import { authService } from "@/shared/services/auth.service";

export type AuthMode = "login" | "register";

/** State + submit handler of the login / sign-up form. */
export function useAuthForm() {
  const setToken = useAuthStore((s) => s.setToken);
  const [mode, setMode] = useState<AuthMode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const isRegister = mode === "register";

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (isRegister && password.length < MIN_PASSWORD_LENGTH) {
      return void toast.error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
    }
    setSubmitting(true);
    try {
      const data = isRegister ? await authService.register({ name, email, password }) : await authService.login({ email, password });
      if (data.success) setToken(data.token);
      else toast.error(data.message);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return {
    mode,
    isRegister,
    toggleMode: () => setMode(isRegister ? "login" : "register"),
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    toggleShowPassword: () => setShowPassword((v) => !v),
    submitting,
    submit,
  };
}
