"use client";

import { useState, useEffect } from "react";
import axios from "axios";

export default function ProfilePage() {
  const [username, setUsername] = useState("");
  const [currentGmailId, setCurrentGmailId] = useState("");
  const [currentGmailAppPassword, setCurrentGmailAppPassword] = useState("");
  const [newGmailId, setNewGmailId] = useState("");
  const [newGmailAppPassword, setNewGmailAppPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isEditingGmail, setIsEditingGmail] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Fetch user profile details
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get("/api/profile");
        const { username, gmail_id, gmail_app_password } = response.data;
        setUsername(username);
        setCurrentGmailId(gmail_id);
        setCurrentGmailAppPassword(gmail_app_password);
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };

    fetchProfile();
  }, []);

  const handleUpdate = async () => {
    try {
      const payload: any = {};
      if (isEditingGmail) {
        payload.gmailId = newGmailId || currentGmailId;
        payload.gmailAppPassword = newGmailAppPassword || currentGmailAppPassword;
      }
      if (isEditingPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }

      const response = await axios.put("/api/profile", payload);

      if (response.status === 200) {
        setSuccessMessage("Profile updated successfully!");
        setErrorMessage("");

        if (isEditingGmail) {
          setCurrentGmailId(newGmailId || currentGmailId);
          setCurrentGmailAppPassword(newGmailAppPassword || currentGmailAppPassword);
          setIsEditingGmail(false);
        }

        if (isEditingPassword) {
          setCurrentPassword("");
          setNewPassword("");
          setIsEditingPassword(false);
        }
      }
    } catch (err: any) {
      setErrorMessage(err.response?.data?.error || "Failed to update profile.");
      setSuccessMessage("");
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white shadow-md rounded-lg p-8">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Profile</h1>
      
      {successMessage && (
        <p className="text-green-600 text-center mb-4">{successMessage}</p>
      )}
      {errorMessage && (
        <p className="text-red-600 text-center mb-4">{errorMessage}</p>
      )}

      {/* Username */}
      <div className="mb-8">
        <label className="block font-semibold text-gray-700 mb-2">Username:</label>
        <p className="text-gray-800">{username}</p>
      </div>

      {/* Gmail Details */}
      <div className="mb-8">
        <label className="block font-semibold text-gray-700 mb-2">Gmail ID:</label>
        {isEditingGmail ? (
          <div className="space-y-4">
            <input
              type="email"
              placeholder="New Gmail ID"
              className="w-full p-3 border rounded-lg"
              value={newGmailId}
              onChange={(e) => setNewGmailId(e.target.value)}
            />
            <input
              type="password"
              placeholder="New Gmail App Password"
              className="w-full p-3 border rounded-lg"
              value={newGmailAppPassword}
              onChange={(e) => setNewGmailAppPassword(e.target.value)}
            />
            <div className="flex justify-end space-x-4">
              <button
                onClick={handleUpdate}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Save
              </button>
              <button
                onClick={() => setIsEditingGmail(false)}
                className="px-6 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex justify-between items-center">
            <p className="text-gray-800">{currentGmailId}</p>
            <button
              onClick={() => setIsEditingGmail(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Edit
            </button>
          </div>
        )}
      </div>

      {/* Password Change */}
      <div className="mb-8">
        <label className="block font-semibold text-gray-700 mb-2">Change Password:</label>
        {isEditingPassword ? (
          <div className="space-y-4">
            <input
              type="password"
              placeholder="Current Password"
              className="w-full p-3 border rounded-lg"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <input
              type="password"
              placeholder="New Password"
              className="w-full p-3 border rounded-lg"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <div className="flex justify-end space-x-4">
              <button
                onClick={handleUpdate}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Save
              </button>
              <button
                onClick={() => setIsEditingPassword(false)}
                className="px-6 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex justify-end">
            <button
              onClick={() => setIsEditingPassword(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Change Password
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
