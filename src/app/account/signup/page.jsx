import { useState } from "react";
import { ArrowRight, LogIn, ShieldCheck, UserPlus, Users } from "lucide-react";
import useAuth from "@/utils/useAuth";
import { syncAuthProfile } from "@/utils/syncAuthProfile";

function SignUpPage() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("");

  const { signInWithCredentials, signUpWithCredentials } = useAuth();

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!email || !password || !name || !role) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    try {
      const result = await signUpWithCredentials({
        email,
        password,
        name,
        role,
        callbackUrl: "/dashboard",
        redirect: false,
      });

      if (result?.error) {
        const signInResult = await signInWithCredentials({
          email,
          password,
          callbackUrl: "/dashboard",
          redirect: false,
        });

        if (signInResult?.error) {
          setError("An account with that email may already exist. Try signing in.");
          setLoading(false);
          return;
        }

        await syncAuthProfile({ name, role });
        window.location.href = signInResult?.url || "/dashboard";
        return;
      }

      await syncAuthProfile({ name, role });

      window.location.href = result?.url || "/dashboard";
    } catch (err) {
      if (err.message === "Unauthorized") {
        try {
          const signInResult = await signInWithCredentials({
            email,
            password,
            callbackUrl: "/dashboard",
            redirect: false,
          });

          if (!signInResult?.error) {
            await syncAuthProfile({ name, role });
            window.location.href = signInResult?.url || "/dashboard";
            return;
          }
        } catch {
          /* fall through to the visible error below */
        }
      }

      if (err.message === "Unauthorized") {
        setError("This email already has an account. Please sign in instead.");
        setLoading(false);
        return;
      }

      setError(err.message || "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-white p-4 text-gray-900">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_28%,rgba(53,122,255,0.10),transparent_28%),radial-gradient(circle_at_82%_72%,rgba(99,102,241,0.08),transparent_30%)]" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-[#357AFF]" />
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-[24vw] font-black uppercase leading-none text-blue-500/[0.04]">
        TASKFLOW
      </div>
      <form
        noValidate
        onSubmit={onSubmit}
        className="relative z-10 w-full max-w-xl rounded-[2rem] border border-gray-100 bg-white p-6 shadow-2xl shadow-blue-100/60 sm:p-10"
      >
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#357AFF] text-lg font-black text-white shadow-lg shadow-blue-200">
            TF
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-gray-900">
              TaskFlow
            </h1>
            <p className="mt-1 text-sm font-bold tracking-wider text-gray-400">
              Team Task Management Platform
            </p>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-2 gap-3">
          <a
            href="/account/signin"
            className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-4 font-black text-gray-500 transition-colors hover:bg-gray-100"
          >
            <LogIn className="h-5 w-5" />
            Sign In
          </a>
          <a
            href="/account/signup"
            className="flex items-center justify-center gap-2 rounded-xl bg-[#357AFF] px-4 py-4 font-black text-white shadow-lg shadow-blue-200"
          >
            <UserPlus className="h-5 w-5" />
            Register
          </a>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <label className="block text-sm font-black uppercase tracking-widest text-gray-500">
              Role Required
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: "admin", label: "Admin", icon: ShieldCheck },
                { value: "member", label: "Member", icon: Users },
              ].map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setRole(item.value)}
                  className={`flex min-h-20 items-center justify-center gap-2 rounded-xl border px-4 py-3 font-black transition-all ${
                    role === item.value
                      ? "border-[#357AFF] bg-[#357AFF] text-white shadow-lg shadow-blue-100"
                      : "border-gray-200 bg-white text-gray-500 hover:border-[#357AFF] hover:text-[#357AFF]"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-black uppercase tracking-widest text-gray-500">
              Full Name
            </label>
            <input
              required
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              className="w-full rounded-xl border border-gray-100 bg-gray-50 px-5 py-4 text-base font-medium text-gray-900 outline-none transition-all focus:border-[#357AFF] focus:ring-4 focus:ring-blue-50"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-black uppercase tracking-widest text-gray-500">
              Email
            </label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
              className="w-full rounded-xl border border-gray-100 bg-gray-50 px-5 py-4 text-base font-medium text-gray-900 outline-none transition-all focus:border-[#357AFF] focus:ring-4 focus:ring-blue-50"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-black uppercase tracking-widest text-gray-500">
              Password
            </label>
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-gray-100 bg-gray-50 px-5 py-4 text-base font-medium text-gray-900 outline-none transition-all focus:border-[#357AFF] focus:ring-4 focus:ring-blue-50"
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm font-bold text-red-500">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#357AFF] px-6 py-4 text-lg font-black text-white transition-all hover:bg-[#2E69DE] focus:outline-none disabled:opacity-50 active:scale-95"
          >
            {loading ? "Creating Account..." : "Sign Up"}
            {!loading && <ArrowRight className="h-5 w-5" />}
          </button>

          <p className="text-center text-sm font-bold text-gray-500">
            Already have an account?{" "}
            <a
              href="/account/signin"
              className="text-[#357AFF] hover:underline"
            >
              Sign in
            </a>
          </p>
        </div>
      </form>
    </div>
  );
}

export default SignUpPage;
