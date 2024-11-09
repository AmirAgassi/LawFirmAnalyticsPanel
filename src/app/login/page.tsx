"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const result = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid username or password");
    } else if (result?.ok) {
      router.push("/dashboard");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-8">
        <h1 className="text-2xl font-bold mb-6 text-center">Sign In</h1>
        {error && (
          <div className="mb-4 p-3 text-sm text-red-500 bg-red-100 dark:bg-red-900/20 rounded">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="w-full p-3 rounded border border-gray-300 dark:border-gray-700 bg-transparent"
              required
            />
          </div>
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full p-3 rounded border border-gray-300 dark:border-gray-700 bg-transparent"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-foreground text-background p-3 rounded hover:opacity-90 transition-opacity"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
} 