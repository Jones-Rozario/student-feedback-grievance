import React, { useState } from "react";
import { toast } from "react-toastify";
import { apiAxios } from "../utils/api";

const ForgotPassword = () => {
  const [id, setId] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const axiosInstance = apiAxios();
      const response = await axiosInstance.post("/auth/forgot-password", { id, role });
      setSubmitted(true);
    } catch (err) {
      console.log(err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: 400,
        margin: "60px auto",
        padding: 24,
        background: "#fff",
        borderRadius: 8,
        boxShadow: "0 2px 8px #eee",
      }}
    >
      <h2 style={{ textAlign: "center" }}>Forgot Password</h2>
      {submitted ? (
        <div style={{ color: "#2e7d32", textAlign: "center" }}>
          If an account exists, a reset link has been sent to the registered
          email.
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label>ID</label>
            <input
              type="text"
              value={id}
              onChange={(e) => setId(e.target.value)}
              style={{ width: "100%", padding: 8, marginTop: 4 }}
              required
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label>Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{ width: "100%", padding: 8, marginTop: 4 }}
              required
            >
              <option value="" disabled>
                Select role
              </option>
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: 10,
              background: "#3498db",
              color: "#fff",
              border: "none",
              borderRadius: 4,
              fontWeight: 600,
            }}
          >
            {loading ? "Requesting..." : "Request Reset"}
          </button>
        </form>
      )}
    </div>
  );
};

export default ForgotPassword;
