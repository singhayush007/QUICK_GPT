import LoginForm from "../components/LoginForm";
import LoginHero from "../components/LoginHero";

export default function LoginPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <LoginHero />
      <LoginForm />
    </div>
  );
}
