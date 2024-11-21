"use client";

import { useSession, signIn } from "next-auth/react";
import Link from "next/link";
import axios from "axios";
import { useEffect, useState } from "react";

export default function HomePage() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState({ sentEmails: 0, formats: 0, templates: 0 });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [emailsResponse, formatsResponse, templatesResponse] = await Promise.all([
          axios.get("/api/get-emails"),
          axios.get("/api/company-format"),
          axios.get("/api/email-templates"),
        ]);

        setStats({
          sentEmails: emailsResponse.data.length || 0,
          formats: formatsResponse.data.length || 0,
          templates: templatesResponse.data.length || 0,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    if (session) fetchStats();
  }, [session]);

  const handleLogin = async () => {
    try {
      await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
    } catch (err) {
      setError("Invalid email or password. Please try again.");
    }
  };

  if (status === "loading") return <div>Loading...</div>;

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <h1 className="text-2xl font-bold mb-4">Flush Email</h1>
        <div className="bg-white p-6 rounded-lg shadow-md w-96">
          <h2 className="text-xl font-semibold mb-4">Log in</h2>
          {error && <p className="text-red-600 mb-4">{error}</p>}
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 mb-4 border rounded-lg"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Log in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h1 className="text-2xl font-bold text-center mb-6">
        Welcome, {session.user?.username || "User"}!
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Sent Emails" count={stats.sentEmails} link="/emails" />
        <StatCard title="Email Formats" count={stats.formats} link="/email-address-format" />
        <StatCard title="Email Templates" count={stats.templates} link="/email-template" />
      </div>
    </div>
  );
}


function StatCard({ title, count, link }: { title: string; count: number; link: string }) {
  return (
    <Link href={link} className="bg-gray-50 p-4 rounded-lg shadow hover:bg-gray-100">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="text-3xl font-bold text-blue-600">{count}</p>
    </Link>
  );
}
