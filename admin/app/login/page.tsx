import type { Metadata } from "next";
import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = { title: "Sign in" };

/**
 * Only same-site relative paths are accepted as a post-login destination.
 * "//evil.com" and "/\evil.com" are protocol-relative to browsers, so they
 * would turn this page into an open redirect.
 */
function safeNext(value: string | string[] | undefined) {
  if (typeof value !== "string") return "/";
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return "/";
  return value;
}

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const params = await searchParams;
  return (
    <LoginForm
      next={safeNext(params.next)}
      expired={params.reason === "expired"}
    />
  );
}
