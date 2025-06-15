import React from "react";
import HeaderBar from "../../components/HeaderBar";
import GreetingSection from "../../components/GreetingSection";
import FormsSection from "../../components/FormsSection";
import FooterBar from "../../components/FooterBar";
import styles from "./homepage.module.css";

const Homepage = () => (
  <div>
    <HeaderBar />
    <div className={styles.backgroundImage} />
    <GreetingSection />
    <FormsSection />
    <FooterBar />
  </div>
);

export default Homepage;
