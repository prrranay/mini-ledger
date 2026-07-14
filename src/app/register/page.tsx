import RegisterForm from "@/components/auth/register-form";

export const metadata = {
  title: "Register | Smart Mini Ledger",
  description: "Create your account.",
};

export default function RegisterPage() {
  const showGoogle = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
  return <RegisterForm showGoogle={showGoogle} />;
}
