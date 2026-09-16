import type { Metadata } from "next";
import AuthPanel from "@/components/auth/AuthPanel";

export const metadata: Metadata = {
  title: "Login or Register",
  description: "Join Velastia and unlock exclusive offers, reward points and more.",
};

export default function LoginPage() {
  return <AuthPanel />;
}
