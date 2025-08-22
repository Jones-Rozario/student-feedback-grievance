import React, { useState } from "react";
import "./loginpage.css";
import Lottie from "lottie-react";
import phoneHand from "../../../assests/animations/getting-started-logo-animation.json";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import { apiAxios } from "../../../utils/api";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    id: "",
    password: "",
    role: "student",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPasswordHint, setShowPasswordHint] = useState(false);
  const [passwordHint, setPasswordHint] = useState("");

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Clear error and success on any change
    setError("");
    setSuccess("");

    // CHANGE MADE HERE: handle 'email' for faculty
    if (name === "role") {
      setFormData({
        id: "", // reset id/email when role changes
        password: "",
        role: value,
      });
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const getPasswordHint = async () => {
    try {
      const axiosInstance = apiAxios();
      const response = await axiosInstance.get(`/auth/password-hint/${formData.id}/${formData.role}`);
      if (response.data) {
        setPasswordHint(response.data.hint);
        setShowPasswordHint(true);
      } else {
        setError("Could not get password hint");
      }
    } catch (err) {
      setError("Error getting password hint");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const axiosInstance = apiAxios();
      const payload = {
        password: formData.password,
        role: formData.role,
      };

      // CHANGE MADE HERE: Send email instead of id if faculty
      if (formData.role === "faculty") {
        payload.email = formData.id;
      } else {
        payload.id = formData.id;
      }

      const response = await axiosInstance.post("/auth/login", payload);

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        login(response.data.user, response.data.token);
        setSuccess("Login successful!");
        setTimeout(() => {
          if (response.data.user.role === "student") {
            navigate("/home");
          } else if (response.data.user.role === "faculty") {
            navigate("/faculty/performance");
          } else if (response.data.user.role === "admin") {
            navigate("/admin/dashboard");
          }
        }, 1000);
      } else {
        setError(response.data.error || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage = error.response?.data?.error || "Login failed. Please try again.";
      setError(errorMessage);
    }
  };

  // CHANGE MADE HERE: Dynamic placeholder based on role
  const getInputPlaceholder = () => {
    if (formData.role === "student") return "Enter your register number";
    if (formData.role === "faculty") return "Enter your email-id";
    return "Enter your id";
  };

  // CHANGE MADE HERE: Dynamic input name
  const getInputName = () => {
    return "id"; // Always use 'id' key in state for both email and id
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <motion.div
          initial={{
            width: "105%",
            height: "120%",
            transform: "rotate(-30deg)",
            left: "-20%",
          }}
          animate={{
            transform: "rotate(0deg)",
            left: "0%",
            top: "0%",
          }}
          transition={{
            delay: 0.5,
            duration: 1,
            ease: "easeInOut",
          }}
          className="login-shape"
        ></motion.div>
        <div className="login-image-circle">
          <Lottie animationData={phoneHand} loop={true} />
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 10 }}
        transition={{ delay: 1.5, duration: 1, ease: "easeInOut" }}
        className="login-right"
      >
        <div className="login-page-header-short">
          <h2 className="login-title-short">Welcome to the Grievance & Feedback Portal</h2>
          <div className="login-subtitle-short">
            Department of Computer Science and Engineering - CEG
          </div>
        </div>

        <h2 className="login-welcome">
          Hey,
          <br />
          Welcome Back
        </h2>

        <div style={{ marginBottom: 18 }}>
          <select
            className="login-input"
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
          >
            <option value="student">Student</option>
            <option value="faculty">Faculty</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <input
          className="login-input"
          type={formData.role === "faculty" ? "email" : "text"} // CHANGE MADE HERE
          placeholder={getInputPlaceholder()} // CHANGE MADE HERE
          name={getInputName()} // Always "id"
          value={formData.id}
          onChange={handleChange}
          required
        />

        <input
          className="login-input"
          type="password"
          placeholder="Enter your password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <button type="button" onClick={getPasswordHint} className="hint-btn">
          Get Password Hint
        </button>

        {showPasswordHint && (
          <div className="password-hint">
            <p>
              <strong>Password Hint:</strong> {passwordHint}
            </p>
          </div>
        )}

        <div style={{ marginTop: 12, textAlign: "right" }}>
          <a
            href="/forgot-password"
            style={{
              color: "#3498db",
              textDecoration: "underline",
              cursor: "pointer",
              fontSize: "0.95em",
            }}
          >
            Forgot Password?
          </a>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <button className="login-button" onClick={handleSubmit}>
          Log In
        </button>
      </motion.div>
    </div>
  );
};

export default LoginPage;

