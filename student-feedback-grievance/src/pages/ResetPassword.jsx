import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { apiAxios } from "../utils/api";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [tokenInput, setTokenInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const query = useQuery();
  const urlToken = query.get("token") || "";

  const token = urlToken || tokenInput;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.error("Reset token is required");
      return;
    }
    if (!newPassword || !confirmPassword) {
      toast.error("All fields are required");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const axiosInstance = apiAxios();
      const response = await axiosInstance.post("/auth/reset-password", { token, newPassword });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "60px auto", padding: 24, background: "#fff", borderRadius: 8, boxShadow: "0 2px 8px #eee" }}>
      <h2 style={{ textAlign: "center" }}>Reset Password</h2>
      {success ? (
        <div style={{ color: "#2e7d32", textAlign: "center" }}>
          Password reset successful! Redirecting to login...
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {!urlToken && (
            <div style={{ marginBottom: 16 }}>
              <label>Reset Token</label>
              <input type="text" value={tokenInput} onChange={e => setTokenInput(e.target.value)} style={{ width: "100%", padding: 8, marginTop: 4 }} required />
            </div>
          )}
          <div style={{ marginBottom: 16 }}>
            <label>New Password</label>
            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} style={{ width: "100%", padding: 8, marginTop: 4 }} required />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label>Confirm New Password</label>
            <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} style={{ width: "100%", padding: 8, marginTop: 4 }} required />
          </div>
          <button type="submit" disabled={loading} style={{ width: "100%", padding: 10, background: "#3498db", color: "#fff", border: "none", borderRadius: 4, fontWeight: 600 }}>
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      )}
    </div>
  );
};

export default ResetPassword; 