import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import HomePage from "./pages/homepage/homepage";
import GetStartedPage from "./pages/getstartedpage/getstartedpage";
import LoginPage from "./pages/loginpage/loginpage";
import FeedbackPage from "./pages/feedbackpage/feedbackpage";
import GrievancePage from "./pages/grievancepage/grievancepage";

const App = () => {
  return (
    <BrowserRouter>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <Routes>
        <Route path="/" element={<GetStartedPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/feedback" element={<FeedbackPage />} />
        <Route path="/grievance" element={<GrievancePage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
