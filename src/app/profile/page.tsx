"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { MdEdit, MdSave, MdCancel } from "react-icons/md";

export default function ProfilePage() {
  const [username, setUsername] = useState("");
  const [currentGmailId, setCurrentGmailId] = useState("");
  const [currentGmailAppPassword, setCurrentGmailAppPassword] = useState("");
  const [newGmailId, setNewGmailId] = useState("");
  const [newGmailAppPassword, setNewGmailAppPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [isEditingGmailDetails, setIsEditingGmailDetails] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showGmailAppPassword, setShowGmailAppPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Fetch user profile details
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get("/api/profile");
        const { username, gmail_id, gmail_app_password } = response.data;
        setUsername(username);
        setCurrentGmailId(gmail_id);
        setCurrentGmailAppPassword(gmail_app_password);
      } catch (error) {
        setErrorMessage("Failed to fetch profile details.");
        console.log(error)
      }
    };

    fetchProfile();
  }, []);

  // Automatically hide messages after 5 seconds
  useEffect(() => {
    if (successMessage || errorMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage("");
        setErrorMessage("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, errorMessage]);

  // Validation for email
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Handle updating Gmail details
  const handleSaveGmailDetails = async () => {
    try {
      const payload: any = {};
      if (newGmailId && !validateEmail(newGmailId)) {
        setErrorMessage("Please enter a valid Gmail ID.");
        return;
      }

      payload.gmailId = newGmailId || currentGmailId;
      payload.gmailAppPassword = newGmailAppPassword || currentGmailAppPassword;

      const response = await axios.put("/api/profile", payload);

      if (response.status === 200) {
        setSuccessMessage("Gmail details updated successfully!");
        setCurrentGmailId(newGmailId || currentGmailId);
        setCurrentGmailAppPassword(newGmailAppPassword || currentGmailAppPassword);
        setIsEditingGmailDetails(false);
      }
    } catch (error: any) {
      setErrorMessage("Failed to update Gmail details.");
      console.log(error)
    }
  };

  // Handle updating password
  const handleSavePassword = async () => {
    try {
      if (!currentPassword || !newPassword) {
        setErrorMessage("Both current and new passwords are required.");
        return;
      }

      const payload = { currentPassword, newPassword };
      const response = await axios.put("/api/profile", payload);

      if (response.status === 200) {
        setSuccessMessage("Password updated successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setIsEditingPassword(false);
      }
    } catch (error: any) {
      setErrorMessage("Failed to update password. Please try again.");
      console.log(error)
    }
  };

  return (
    <div className="profile-container">
      <h1 className="profile-title">Profile</h1>

      {/* Success/Error Messages */}
      {successMessage && <p className="success-message">{successMessage}</p>}
      {errorMessage && <p className="error-message">{errorMessage}</p>}

      {/* Profile Picture and Username */}
      <div className="profile-picture">
        <img
          src="https://via.placeholder.com/150"
          alt="Profile"
          className="profile-avatar"
        />
        <h2 className="profile-username">{username}</h2>
      </div>

      {/* Gmail Details */}
      <div className="profile-section">
        <label className="profile-label">Gmail Details</label>
        {isEditingGmailDetails ? (
          <div className="editable-field">
            <input
              type="email"
              className="input-field"
              value={newGmailId || currentGmailId}
              onChange={(e) => setNewGmailId(e.target.value)}
              placeholder="Enter Gmail ID"
            />
            <div className="password-field">
              <input
                type={showGmailAppPassword ? "text" : "password"}
                className="input-field"
                value={newGmailAppPassword || currentGmailAppPassword}
                onChange={(e) => setNewGmailAppPassword(e.target.value)}
                placeholder="Enter Gmail App Password"
              />
              <span
                onClick={() => setShowGmailAppPassword(!showGmailAppPassword)}
                className="toggle-password"
              >
                {showGmailAppPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
              </span>
            </div>
            <div className="action-buttons">
              <button onClick={handleSaveGmailDetails} className="save-button">
                <MdSave />
              </button>
              <button
                onClick={() => setIsEditingGmailDetails(false)}
                className="cancel-button"
              >
                <MdCancel />
              </button>
            </div>
          </div>
        ) : (
          <div className="view-field">
            <p>Email: {currentGmailId}</p>
            <p>Password: ******</p>
            <button
              onClick={() => setIsEditingGmailDetails(true)}
              className="edit-button"
            >
              <MdEdit />
            </button>
          </div>
        )}
      </div>

      {/* Change Password */}
      <div className="profile-section">
        <label className="profile-label">Change Password</label>
        {isEditingPassword ? (
          <div className="editable-field">
            <input
              type="password"
              className="input-field"
              placeholder="Current Password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <div className="password-field">
              <input
                type={showNewPassword ? "text" : "password"}
                className="input-field"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <span
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="toggle-password"
              >
                {showNewPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
              </span>
            </div>
            <div className="action-buttons">
              <button onClick={handleSavePassword} className="save-button">
                <MdSave />
              </button>
              <button
                onClick={() => setIsEditingPassword(false)}
                className="cancel-button"
              >
                <MdCancel />
              </button>
            </div>
          </div>
        ) : (
          <div className="view-field">
            <button
              onClick={() => setIsEditingPassword(true)}
              className="edit-button"
            >
              <MdEdit />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
