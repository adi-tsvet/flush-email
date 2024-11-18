"use client";

import Link from "next/link";
import axios from "axios";
import { useEffect, useState } from "react";

export default function HomePage() {
  const [stats, setStats] = useState({ sentEmails: 0, formats: 0, templates: 0 });

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

    fetchStats();
  }, []); // Dependency array added to ensure useEffect runs only once.

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h1 className="text-2xl font-bold text-center mb-6">Welcome, User!</h1>
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
