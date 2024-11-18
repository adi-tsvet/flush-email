"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { AiFillDelete, AiFillEdit } from "react-icons/ai";

type CompanyFormat = {
  id: number;
  company_name: string;
  domain: string;
  email_format: string;
};

const predefinedCombinations = [
  "{firstname}.{lastname}@{domain}",
  "{lastname}.{f}@{domain}",
  "{firstname}_{lastname}@{domain}",
  "{firstname}{lastname}@{domain}",
  "{firstname}{l}@{domain}",
  "{f}{lastname}@{domain}",
  "{f}.{lastname}@{domain}",
  "{firstname}@{domain}",
  "{lastname}@{domain}",
  "{f}{l}@{domain}",
  "{lastname}.{firstname}@{domain}",
  "{lastname}_{firstname}@{domain}",
  "{lastname}{firstname}@{domain}",
  "{lastname}{f}@{domain}",
  "{firstname}-{lastname}@{domain}",
  "{lastname}-{firstname}@{domain}",
];

export default function ManageCompanyFormats() {
  const [companyFormats, setCompanyFormats] = useState<CompanyFormat[]>([]);
  const [filteredFormats, setFilteredFormats] = useState<CompanyFormat[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentFormat, setCurrentFormat] = useState<CompanyFormat | null>(null);
  const [emailFormat, setEmailFormat] = useState<string>(""); // Email format input
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [customFormat, setCustomFormat] = useState(""); // Custom email format

  // Fetch Company Formats
  const fetchCompanyFormats = async () => {
    try {
      const response = await axios.get("/api/company-format");
      setCompanyFormats(response.data);
      setFilteredFormats(response.data);
    } catch (error) {
      console.error("Error fetching company formats:", error);
    }
  };

  useEffect(() => {
    fetchCompanyFormats();
  }, []);

  // Handle Search
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    const filtered = companyFormats.filter((format) =>
      format.company_name.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredFormats(filtered);
  };

  // Save Format
  const handleSaveFormat = async () => {
    if (!currentFormat?.company_name || !currentFormat.domain || !emailFormat) {
      alert("All fields are required.");
      return;
    }

    if (!emailFormat.includes("@{domain}")) {
      alert("The format must include '@{domain}'.");
      return;
    }

    setLoading(true);
    try {
      const formatToSave = { ...currentFormat, email_format: emailFormat };

      if (currentFormat.id) {
        // Update existing format
        await axios.put("/api/company-format", formatToSave);
      } else {
        // Ensure unique company name
        const existingFormat = companyFormats.find(
          (format) =>
            format.company_name.toLowerCase() === currentFormat.company_name.toLowerCase()
        );
        if (existingFormat) {
          alert("A format with this company name already exists.");
          setLoading(false);
          return;
        }
        // Add new format
        await axios.post("/api/company-format", formatToSave);
      }

      fetchCompanyFormats();
      setShowModal(false);
      setCurrentFormat(null);
      setEmailFormat("");
    } catch (error) {
      console.error("Error saving format:", error);
    } finally {
      setLoading(false);
    }
  };

  // Delete Format
  const handleDeleteFormat = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this format?")) return;

    try {
      await axios.delete(`/api/company-format?id=${id}`);
      fetchCompanyFormats();
    } catch (error) {
      console.error("Error deleting format:", error);
    }
  };

  // Edit Format
  const handleEditFormat = (format: CompanyFormat) => {
    const [emailFormat] = format.email_format.split("@{domain}");
    setCurrentFormat(format);
    setEmailFormat(`${emailFormat}@{domain}`);
    setShowModal(true);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Manage Company Email Formats</h2>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search by Company Name"
        className="border p-2 rounded w-full mb-4"
        value={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
      />

      <button
        className="w-full p-3 rounded-lg text-white bg-blue-600 hover:bg-blue-700 mb-4"
        onClick={() => {
          setCurrentFormat({ id: 0, company_name: "", domain: "", email_format: "" });
          setEmailFormat("");
          setShowModal(true);
        }}
      >
        Add New Format
      </button>

      <ul className="divide-y divide-gray-200">
        {filteredFormats.map((format) => (
          <li key={format.id} className="flex justify-between items-center py-2">
            <div>
              <p>
                <strong>Company:</strong> {format.company_name}
              </p>
              <p>
                <strong>Domain:</strong> {format.domain}
              </p>
              <p>
                <strong>Format:</strong> {format.email_format}
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                className="text-white-600 hover:text-white-200"
                onClick={() => handleEditFormat(format)}
              >
                <AiFillEdit className="h-5 w-5" />
              </button>
              <button
                className="text-red-400 hover:text-red-700"
                onClick={() => handleDeleteFormat(format.id)}
              >
                <AiFillDelete className="h-5 w-5" />
              </button>
            </div>
          </li>
        ))}
      </ul>

      {/* Modal for Add/Edit Format */}
      {showModal && currentFormat && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-xl font-semibold mb-4">
              {currentFormat.id ? "Edit Format" : "Add New Format"}
            </h3>
            <input
              type="text"
              placeholder="Company Name"
              className="w-full p-3 mb-4 border rounded-lg"
              value={currentFormat.company_name}
              onChange={(e) =>
                setCurrentFormat((prev) => ({ ...prev!, company_name: e.target.value }))
              }
            />
            <input
              type="text"
              placeholder="Domain (e.g., example.com)"
              className="w-full p-3 mb-4 border rounded-lg"
              value={currentFormat.domain}
              onChange={(e) =>
                setCurrentFormat((prev) => ({ ...prev!, domain: e.target.value }))
              }
            />

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Email Format</label>
              <select
                className="w-full p-3 mb-2 border rounded-lg"
                value={emailFormat}
                onChange={(e) => setEmailFormat(e.target.value)}
              >
                <option value="">Select Predefined Format</option>
                {predefinedCombinations.map((combination) => (
                  <option key={combination} value={combination}>
                    {combination}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Add Custom Format (e.g., {f}-{lastname})"
                className="w-full p-3 mb-2 border rounded-lg"
                value={customFormat}
                onChange={(e) => setCustomFormat(e.target.value)}
                onBlur={() => {
                  if (customFormat) {
                    setEmailFormat(customFormat + "@{domain}");
                    setCustomFormat("");
                  }
                }}
              />
            </div>

            <div className="flex justify-end space-x-4">
              <button
                className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 text-gray-800"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className={`px-4 py-2 rounded-lg text-white ${
                  loading ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
                }`}
                onClick={handleSaveFormat}
                disabled={loading}
              >
                {loading ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
