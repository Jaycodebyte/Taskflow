import * as React from 'react';
import { useSession } from "@auth/create/react";


const useUser = () => {
  const { data: session, status } = useSession();
  const id = session?.user?.id

  const [user, setUser] = React.useState(session?.user ?? null);

  React.useEffect(() => {
    let isActive = true;

    if (status === "loading") {
      return () => {
        isActive = false;
      };
    }

    if (!session?.user) {
      setUser(null);
      return () => {
        isActive = false;
      };
    }

    setUser(session.user);

    const fetchProfile = async () => {
      if (!id) return;

      try {
        const response = await fetch("/api/auth/profile");
        if (!response.ok) return;
        const profile = await response.json();
        if (isActive) {
          setUser({ ...session.user, ...profile });
        }
      } catch {
        if (isActive) {
          setUser(session.user);
        }
      }
    };

    fetchProfile();

    return () => {
      isActive = false;
    };
  }, [id, session?.user?.email, session?.user?.name, status]);

  const refetchUser = React.useCallback(async () => {
    if (!session?.user) {
      setUser(null);
      return;
    }

    try {
      const response = await fetch("/api/auth/profile");
      if (!response.ok) {
        setUser(session.user);
        return;
      }
      const profile = await response.json();
      setUser({ ...session.user, ...profile });
    } catch {
      setUser(session.user);
    }
  }, [session?.user]);

  return {
    user,
    data: user || session?.user || null,
    loading: status === 'loading',
    refetch: refetchUser,
  };
};

export { useUser }

export default useUser;
