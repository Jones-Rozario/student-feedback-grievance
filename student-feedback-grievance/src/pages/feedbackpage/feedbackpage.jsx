import React, { useState } from "react";
import styled, { keyframes } from "styled-components";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { FaStar } from "react-icons/fa";
import backgroundImage from "../../assests/Red_Building_Cropped.jpg";
import HeaderBar from "../../components/HeaderBar";
import FooterBar from "../../components/FooterBar";
        
// Styled components
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const PageContainer = styled.div`
  min-height: 100vh;
  position: relative;
  display: flex;
  justify-content: center;
  padding: 2rem;
  padding-top: 6rem;

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
    filter: blur(4px);
    z-index: -2;
  }

  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.3);
    z-index: -1;
  }
`;

const Container = styled.div`
  max-width: 800px;
  width: 100%;
  margin: 0 auto;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 15px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
  animation: ${fadeIn} 0.5s ease-out;
  backdrop-filter: blur(10px);
`;

const Title = styled.h1`
  color: #2c3e50;
  text-align: center;
  margin-bottom: 2rem;
  font-size: 2.5rem;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
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
  color: #34495e;
  font-weight: 600;
  font-size: 1.1rem;
`;

const RatingContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

const StarButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.2);
  }

  svg {
    width: 2rem;
    height: 2rem;
    color: ${(props) => (props.selected ? "#f1c40f" : "#bdc3c7")};
    transition: color 0.2s ease;
  }

  &:hover svg {
    color: #f1c40f;
  }
`;

const TextArea = styled.textarea`
  padding: 1rem;
  border: 2px solid #ecf0f1;
  border-radius: 8px;
  resize: vertical;
  min-height: 100px;
  font-family: inherit;
  transition: border-color 0.3s ease;
  background: rgba(255, 255, 255, 0.9);

  &:focus {
    outline: none;
    border-color: #3498db;
  }
`;

const SubmitButton = styled(motion.button)`
  background: #3498db;
  color: white;
  padding: 1rem 2rem;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  &:hover {
    background: #2980b9;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }

  &:disabled {
    background: #bdc3c7;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const FeedbackPage = () => {
  const [formData, setFormData] = useState({
    courseName: "",
    facultyName: "",
    teachingEfficiency: 0,
    courseContent: 0,
    communication: 0,
    studentEngagement: 0,
    overallRating: 0,
    additionalComments: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRatingChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // TODO: Add API call to submit feedback
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulated API call
      console.log(formData);
      toast.success("Feedback submitted successfully!");
      setFormData({
        courseName: "",
        facultyName: "",
        teachingEfficiency: 0,
        courseContent: 0,
        communication: 0,
        studentEngagement: 0,
        overallRating: 0,
        additionalComments: "",
      });
    } catch (error) {
      toast.error("Failed to submit feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const ratingQuestions = [
    { field: "teachingEfficiency", label: "Teaching Efficiency" },
    { field: "courseContent", label: "Course Content Quality" },
    { field: "communication", label: "Communication Skills" },
    { field: "studentEngagement", label: "Student Engagement" },
    { field: "overallRating", label: "Overall Rating" },
  ];

  return (
    <>
      <HeaderBar />
      <PageContainer>
        <Container>
          <Title>Course Feedback Form</Title>
          <Form onSubmit={handleSubmit}>
            <FormGroup
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Label>Course Name</Label>
              <select
                name="courseName"
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    courseName: e.target.value,
                  }))
                }
                id="courseName"
                style={{
                  padding: "10px",
                  borderRadius: "5px",
                  border: "1px solid #ccc",
                  width: "100%",
                  outline: "none",
                  backgroundColor: "white",
                  color: "black",
                  fontSize: "16px",
                  textAlign: "center",
                  textTransform: "uppercase",
                }}
                required
              >
                <option value="">Select Course</option>
                <option value="1">Course 1</option>
                <option value="2">Course 2</option>
                <option value="3">Course 3</option>
              </select>
            </FormGroup>

            <FormGroup
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Label>Faculty Name</Label>
              <select
                name="facultyName"
                id="facultyName"
                required
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    facultyName: e.target.value,
                  }))
                }
                style={{
                  padding: "10px",
                  borderRadius: "5px",
                  border: "1px solid #ccc",
                  width: "100%",
                  outline: "none",
                  backgroundColor: "white",
                  color: "black",
                  fontSize: "16px",
                  textAlign: "center",
                  textTransform: "uppercase",
                }}
              >
                <option value="">Select Faculty</option>
                <option value="1">Faculty 1</option>
                <option value="2">Faculty 2</option>
                <option value="3">Faculty 3</option>
              </select>
            </FormGroup>

            {ratingQuestions.map((question, index) => (
              <FormGroup
                key={question.field}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * (index + 2) }}
              >
                <Label>{question.label}</Label>
                <RatingContainer>
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <StarButton
                      key={rating}
                      type="button"
                      selected={formData[question.field] >= rating}
                      onClick={() => handleRatingChange(question.field, rating)}
                    >
                      <FaStar />
                    </StarButton>
                  ))}
                </RatingContainer>
              </FormGroup>
            ))}

            <FormGroup
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              <Label>Additional Comments</Label>
              <TextArea
                value={formData.additionalComments}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    additionalComments: e.target.value,
                  }))
                }
                placeholder="Share your thoughts and suggestions..."
              />
            </FormGroup>

            <SubmitButton
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isSubmitting ? "Submitting..." : "Submit Feedback"}
            </SubmitButton>
          </Form>
        </Container>
      </PageContainer>
      <FooterBar />
        </>
  );
};

export default FeedbackPage;
