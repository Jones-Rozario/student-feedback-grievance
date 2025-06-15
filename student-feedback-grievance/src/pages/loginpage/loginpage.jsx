import React, { useState } from "react";
import "./loginpage.css";
import Lottie from "lottie-react";
import phoneHand from "../../assests/animations/getting-started-logo-animation.json";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [number, setNumber] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

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
        initial={{
          opacity: 0,
          x: 100,
        }}
        animate={{
          opacity: 1,
          x: 10,
        }}
        transition={{
          delay: 1.5,
          duration: 1,
          ease: "easeInOut",
        }}
        className="login-right"
      >
        <h2 className="login-welcome">
          Hey,
          <br />
          Welcome Back
        </h2>
        <input
          className="login-input"
          type="text"
          placeholder="Enter your registered number"
          value={number}
          onChange={(e) => setNumber(e.target.value)}
        />
        <input
          className="login-input"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="login-button" onClick={() => navigate("/home")}>
          Log In
        </button>
      </motion.div>
    </div>
  );
}
