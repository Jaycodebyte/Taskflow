import useAuth from "@/utils/useAuth";
import { useEffect } from "react";

export default function LogoutPage() {
  const { signOut } = useAuth();

  useEffect(() => {
    signOut({ callbackUrl: "/", redirect: true });
  }, [signOut]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#357AFF] border-t-transparent mx-auto mb-4"></div>
        <p className="text-gray-600 font-bold">Signing you out...</p>
      </div>
    </div>
  );
}
