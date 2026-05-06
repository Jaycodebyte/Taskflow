export async function syncAuthProfile(profile, attempts = 8) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const response = await fetch("/api/auth/profile", {
      method: profile ? "PUT" : "GET",
      headers: profile ? { "Content-Type": "application/json" } : undefined,
      body: profile ? JSON.stringify(profile) : undefined,
    });

    if (response.ok) {
      return response.json();
    }

    if (response.status !== 401 || attempt === attempts - 1) {
      const error = await response.json().catch(() => null);
      throw new Error(error?.error || "Unable to sync your profile.");
    }

    await new Promise((resolve) => setTimeout(resolve, 350));
  }

  throw new Error("Unable to sync your profile.");
}
