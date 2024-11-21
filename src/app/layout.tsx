"use client";

import Link from "next/link";
import "../app/globals.css";
import Image from "next/image";
import { SessionProvider } from "next-auth/react";
import { useSession, signIn, signOut } from "next-auth/react";
import { useState } from "react";
import axios from "axios";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>Flush Email</title>
        <link rel="icon" href="/logo.png" type="image/png" />
      </head>
      <body className="bg-gray-100 text-gray-900 font-sans antialiased">
        <SessionProvider>
          <AuthenticatedLayout>{children}</AuthenticatedLayout>
        </SessionProvider>
      </body>
    </html>
  );
}

function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!session) {
    return <AuthPage />;
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="bg-white w-64 p-6 shadow-lg h-screen sticky top-0">
        <div className="flex items-center mb-10">
          <Image src="/logo.png" alt="Flush Email Logo" width={40} height={40} className="mr-4" />
          <h1 className="text-2xl font-bold text-blue-600">Flush Email</h1>
        </div>
        <nav className="space-y-4">
          <Link href="/" className="block p-3 rounded-lg text-gray-700 hover:bg-gray-100">
            Dashboard
          </Link>
          <Link href="/emails" className="block p-3 rounded-lg text-gray-700 hover:bg-gray-100">
            Emails
          </Link>
          <Link
            href="/email-template"
            className="block p-3 rounded-lg text-gray-700 hover:bg-gray-100"
          >
            Email Template
          </Link>
          <Link
            href="/email-address-format"
            className="block p-3 rounded-lg text-gray-700 hover:bg-gray-100"
          >
            Email Address Format
          </Link>
          <Link href="/profile" className="block p-3 rounded-lg text-gray-700 hover:bg-gray-100">
            Profile
          </Link>
          <Link
            href="/linkedinMessages"
            className="block p-3 rounded-lg text-gray-700 hover:bg-gray-100"
          >
            LinkedIn Messages
          </Link>
          <button
            onClick={() => signOut()}
            className="block p-3 rounded-lg w-full text-white bg-red-600 hover:bg-red-700"
          >
            Log Out
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto">{children}</main>
    </div>
  );
}

function AuthPage() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [gmailId, setGmailId] = useState("");
  const [gmailAppPassword, setGmailAppPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleLogin = async () => {
    setError("");
    try {
      const result = await signIn("credentials", {
        username,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid username or password.");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    }
  };

  const handleRegister = async () => {
    setError("");
    setSuccess(false);
    try {
      const response = await axios.post("/api/register", {
        username,
        password,
        gmailId,
        gmailAppPassword,
      });

      if (response.status === 201) {
        setSuccess(true);
        setIsRegistering(false); // Automatically switch to login after successful registration
      }
    } catch (err) {
      setError("Registration failed. Please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <Image src="/logo.png" alt="Flush Email Logo" width={100} height={100} className="mb-4" />
      <h1 className="text-2xl font-bold mb-6">
        {isRegistering ? "Create an Account" : "Log in to Flush Email"}
      </h1>
      <div className="bg-white p-6 rounded-lg shadow-md w-96">
        {success && isRegistering && <p className="text-green-600 mb-4">Registration successful!</p>}
        {error && <p className="text-red-600 mb-4">{error}</p>}

        {isRegistering ? (
          <>
            {/* Register Form */}
            <input
              type="text"
              placeholder="Username"
              className="w-full p-3 mb-4 border rounded-lg"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full p-3 mb-4 border rounded-lg"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <input
              type="email"
              placeholder="Gmail ID"
              className="w-full p-3 mb-4 border rounded-lg"
              value={gmailId}
              onChange={(e) => setGmailId(e.target.value)}
            />
            <input
              type="password"
              placeholder="Gmail App Password"
              className="w-full p-3 mb-4 border rounded-lg"
              value={gmailAppPassword}
              onChange={(e) => setGmailAppPassword(e.target.value)}
            />
            <button
              onClick={handleRegister}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Register
            </button>
            <div className="mt-4 text-center">
              <p>
                Already have an account?{" "}
                <button
                  onClick={() => setIsRegistering(false)}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 hover:underline"
                >
                  Log in
                </button>
              </p>
            </div>
          </>
        ) : (
          <>
            {/* Login Form */}
            <input
              type="text"
              placeholder="Username"
              className="w-full p-3 mb-4 border rounded-lg"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full p-3 mb-4 border rounded-lg"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              onClick={handleLogin}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 hover:underline"
            >
              Log In
            </button>
            <div className="mt-4 text-center">
              <p>
                Don’t have an account?{" "}
                <button
                  onClick={() => setIsRegistering(true)}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 hover:underline"
                >
                  Register here
                </button>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
