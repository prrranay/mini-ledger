import LoginForm from "@/components/auth/login-form";

export const metadata = {
  title: "Login | Smart Mini Ledger",
  description: "Sign in to your account.",
};

export default function LoginPage() {
  const showGoogle = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
  return <LoginForm showGoogle={showGoogle} />;
}
