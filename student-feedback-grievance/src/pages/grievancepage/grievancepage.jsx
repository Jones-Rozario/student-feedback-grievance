import React, { useState } from "react";
import styled, { keyframes } from "styled-components";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { FaExclamationCircle } from "react-icons/fa";
import backgroundImage from "../../assests/Red_Building_Cropped.jpg";
import HeaderBar from "../../components/HeaderBar";
import FooterBar from "../../components/FooterBar";
// Animations
const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const pulse = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
`;

const PageContainer = styled.div`
  min-height: 100vh;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: url(${backgroundImage});
    background-size: cover;
    background-position: center;
    filter: blur(4px) brightness(0.8);
    z-index: -2;
  }

  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.4);
    z-index: -1;
  }
`;

const Container = styled.div`
  max-width: 800px;
  width: 100%;
  margin: 2rem auto;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 15px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  animation: ${slideIn} 0.6s ease-out;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const Title = styled.h1`
  color: #e74c3c;
  text-align: center;
  margin-bottom: 2rem;
  font-size: 2.5rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;

  svg {
    animation: ${pulse} 2s infinite;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  color: #2c3e50;
  font-weight: 600;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  svg {
    color: #e74c3c;
  }
`;

const Select = styled.select`
  padding: 12px;
  border-radius: 8px;
  border: 2px solid #e0e0e0;
  width: 100%;
  outline: none;
  background-color: white;
  color: #2c3e50;
  font-size: 1rem;
  transition: all 0.3s ease;
  cursor: pointer;

  &:focus {
    border-color: #e74c3c;
    box-shadow: 0 0 0 2px rgba(231, 76, 60, 0.1);
  }

  option {
    padding: 10px;
  }
`;

const TextArea = styled.textarea`
  padding: 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  resize: vertical;
  min-height: 120px;
  font-family: inherit;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.9);
  color: #2c3e50;
  
  &:focus {
    outline: none;
    border-color: #e74c3c;
    box-shadow: 0 0 0 2px rgba(231, 76, 60, 0.1);
  }

  &::placeholder {
    color: #95a5a6;
  }
`;

const SubmitButton = styled(motion.button)`
  background: #e74c3c;
  color: white;
  padding: 1rem 2rem;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  
  &:hover {
    background: #c0392b;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
  
  &:disabled {
    background: #bdc3c7;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  svg {
    font-size: 1.2rem;
  }
`;

const PriorityContainer = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`;

const PriorityButton = styled(motion.button)`
  padding: 0.8rem 1.5rem;
  border: 2px solid ${props => props.selected ? '#e74c3c' : '#e0e0e0'};
  border-radius: 8px;
  background: ${props => props.selected ? 'rgba(231, 76, 60, 0.1)' : 'white'};
  color: ${props => props.selected ? '#e74c3c' : '#2c3e50'};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  flex: 1;
  min-width: 120px;

  &:hover {
    border-color: #e74c3c;
    background: rgba(231, 76, 60, 0.1);
    color: #e74c3c;
  }
`;

const GrievancePage = () => {
  const [formData, setFormData] = useState({
    category: "",
    priority: "",
    subject: "",
    description: "",
    department: "",
    attachments: null
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // TODO: Add API call to submit grievance
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Grievance submitted successfully!");
      setFormData({
        category: "",
        priority: "",
        subject: "",
        description: "",
        department: "",
        attachments: null
      });
    } catch (error) {
      toast.error("Failed to submit grievance. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = [
    "Academic",
    "Administrative",
    "Infrastructure",
    "Hostel",
    "Other"
  ];

  const priorities = ["Low", "Medium", "High", "Urgent"];

  const departments = [
    "Computer Science",
    "Electrical Engineering",
    "Mechanical Engineering",
    "Civil Engineering",
    "Administration"
  ];

  return (
    <>
    <HeaderBar />
    <PageContainer>
      <Container>
        <Title>
          <FaExclamationCircle />
          Submit Grievance
        </Title>
        <Form onSubmit={handleSubmit}>
          <FormGroup
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Label>
              <FaExclamationCircle />
              Category
            </Label>
            <Select
              value={formData.category}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, category: e.target.value }))
              }
              required
            >
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </Select>
          </FormGroup>

          <FormGroup
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Label>
              <FaExclamationCircle />
              Priority Level
            </Label>
            <PriorityContainer>
              {priorities.map((priority) => (
                <PriorityButton
                  key={priority}
                  type="button"
                  selected={formData.priority === priority}
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, priority }))
                  }
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {priority}
                </PriorityButton>
              ))}
            </PriorityContainer>
          </FormGroup>

          <FormGroup
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Label>
              <FaExclamationCircle />
              Department
            </Label>
            <Select
              value={formData.department}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, department: e.target.value }))
              }
              required
            >
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </Select>
          </FormGroup>

          <FormGroup
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Label>
              <FaExclamationCircle />
              Subject
            </Label>
            <TextArea
              value={formData.subject}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, subject: e.target.value }))
              }
              placeholder="Brief description of your grievance"
              required
            />
          </FormGroup>

          <FormGroup
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Label>
              <FaExclamationCircle />
              Detailed Description
            </Label>
            <TextArea
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Please provide detailed information about your grievance..."
              required
            />
          </FormGroup>

          <FormGroup
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Label>
              <FaExclamationCircle />
              Attachments (if any)
            </Label>
            <input
              type="file"
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  attachments: e.target.files[0],
                }))
              }
              style={{
                padding: "10px",
                border: "2px dashed #e0e0e0",
                borderRadius: "8px",
                width: "100%",
                cursor: "pointer",
              }}
            />
          </FormGroup>

          <SubmitButton
            type="submit"
            disabled={isSubmitting}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FaExclamationCircle />
            {isSubmitting ? "Submitting..." : "Submit Grievance"}
          </SubmitButton>
        </Form>
      </Container>
    </PageContainer>
    <FooterBar />
    </>
  );
};

export default GrievancePage;
