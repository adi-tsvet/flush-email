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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (status === "loading") {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!session) {
    return <AuthPage />;
  }

  return (
    <div className="flex min-h-screen relative">
      {/* Sidebar */}
      <div
        className={`fixed z-20 inset-y-0 left-0 transform transition-transform duration-200 ease-in-out bg-white w-64 shadow-lg md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        onClick={() => setSidebarOpen(false)} // Close on click
      >
        <aside className="h-full p-6">
          <div className="flex items-center mb-6">
            <Image src="/logo.png" alt="Flush Email Logo" width={40} height={40} />
            <h1 className="text-2xl font-bold text-blue-600 ml-4">Flush Email</h1>
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
              href="/linkedinScrapper"
              className="block p-3 rounded-lg text-gray-700 hover:bg-gray-100"
            >
              LinkedIn Scrapper
            </Link>
            <button
              onClick={() => signOut()}
              className="block p-3 rounded-lg w-full text-white bg-red-600 hover:bg-red-700"
            >
              Log Out
            </button>
          </nav>
        </aside>
      </div>

      {/* Hamburger Button - Shown Only on Mobile */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed w-10 mb-10 text-white bg-blue-600 shadow-lg hover:bg-blue-700 transition-all md:hidden top-4"
          aria-label="Open navigation"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}


      {/* Overlay for Mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-10 md:hidden"
          onClick={() => setSidebarOpen(false)} // Close sidebar on clicking the overlay
        ></div>
      )}

      {/* Main Content */}
      <main
        className={`flex-1 p-6 transition-all duration-200 ease-in-out ${
          sidebarOpen ? "blur-sm pointer-events-none md:blur-none" : ""
        } md:ml-64`}
        onClick={() => setSidebarOpen(false)} // Close on content click in mobile
      >
        {children}
      </main>
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
      console.log(err)
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
      console.log(err)
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <Image src="/logo.png" alt="Flush Email Logo" width={100} height={100} className="mb-4" />
      <h1 className="text-2xl font-bold mb-6">
        {isRegistering ? "Create an Account" : "Log in to Flush Email"}
      </h1>
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm">
        {success && isRegistering && <p className="text-green-600 mb-4">Registration successful!</p>}
        {error && <p className="text-red-600 mb-4">{error}</p>}

        {isRegistering ? (
          <>
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
                  className="text-blue-600 hover:underline"
                >
                  Log in
                </button>
              </p>
            </div>
          </>
        ) : (
          <>
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
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Log In
            </button>
            <div className="mt-4 text-center">
              <p>
                Don’t have an account?{" "}
                <button
                  onClick={() => setIsRegistering(true)}
                  className="text-blue-600 hover:underline"
                >
                  Register
                </button>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
