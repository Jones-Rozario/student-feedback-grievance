import React from "react";
import StatsCard from "./StatsCard";
import "./GreetingSection.css";
import { FaList, FaCheck, FaUserCheck } from "react-icons/fa";
import { AnimatePresence, motion } from "framer-motion";

const GreetingSection = () => {
  const stats = [
    {
      icon: <FaList />,
      label: "Total Grievances:",
      value: 56,
    },
    {
      icon: <FaCheck />,
      label: "Grievances Resolved:",
      value: 24,
    },
    {
      icon: <FaUserCheck />,
      label: "Grievances Resolved:",
      value: 47,
    },
  ];

  const helloJones = "Hello Jones,";

  const hoverEffect = {
    initial: { scale: 1 },
    whileHover: { scale: 1.05 },
  };

  return (
    <section className="greeting-section">
      <div className="greeting-bg" />
      <div className="greeting-content">
        <div className="head-typo">
          <h1>
            <AnimatePresence>
              {helloJones.split("").map((char, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  {char}
                </motion.span>
              ))}
            </AnimatePresence>
          </h1>
          <p>Manage Your Grievances with ease</p>
        </div>
        <div className="stats-row">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.4 }}
            >
              <StatsCard {...stat} hoverEffect={hoverEffect} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GreetingSection;
