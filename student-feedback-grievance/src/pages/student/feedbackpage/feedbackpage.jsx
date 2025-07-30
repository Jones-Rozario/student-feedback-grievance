import React, { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { FaStar } from "react-icons/fa";
import backgroundImage from "../../../assests/Red_Building_Cropped.jpg";
import HeaderBar from "../../../components/HeaderBar";
import FooterBar from "../../../components/FooterBar";
import { useAuth } from "../../../contexts/AuthContext";
import { apiAxios } from "../../../utils/api";

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

const FacultyInfo = styled.div`
  background: #e3f2fd;
  padding: 12px;
  border-radius: 8px;
  margin-top: 8px;
  border-left: 4px solid #2196f3;
`;

const FeedbackPage = () => {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    course: null,
    faculty: null,
    questionRating: [
      {
        question:
          "Has the faculty covered entire syllabus prescribed by CSVTU/DTE/College Board?",
        rating: 0,
      },
      {
        question: "Has the faculty covered relevant topics beyond syllabus?",
        rating: 0,
      },
      {
        question:
          "Effectiveness of faculty in terms of (i) Technical/Course content",
        rating: 0,
      },
      {
        question: " (ii) Communication skills",
        rating: 0,
      },
      {
        question: "(iii) Use of teaching aids",
        rating: 0,
      },
      {
        question: "Pace at which the course content covered",
        rating: 0,
      },
      {
        question: "Motivation and inspiration for students to learn",
        rating: 0,
      },
      {
        question: "Practical demonstration",
        rating: 0,
      },
      {
        question: "Hands on training",
        rating: 0,
      },
      {
        question: "Clarity of expectations of students",
        rating: 0,
      },
      {
        question: "Willingness to offer advice and help to students",
        rating: 0,
      },
    ],
    additionalComments: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [courses, setCourses] = useState([]);
  const [courseFacultyMapping, setCourseFacultyMapping] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedbackStatus, setFeedbackStatus] = useState({});
  const [academicYears, setAcademicYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState({});
  const [selectedSemester, setSelectedSemester] = useState(
    currentUser.current_semester
  );

  function getAcademicYear() {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // getMonth() is 0-based

    // If current month is June or later, academic year starts this year
    const startYear = month >= 6 ? year : year - 1;
    const endYear = String(startYear + 1);

    return `${startYear} - ${endYear}`;
  }

  function getAcademicYearSemesterList(joinedYear) {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth(); // 0 = Jan, 11 = Dec

    // Academic year starts from June (Month index 5)
    const lastAcademicYear = currentMonth >= 5 ? currentYear : currentYear - 1;

    const academicList = [];
    let semester = 1;

    // Limit to max 4 academic years (joinedYear to joinedYear + 3)
    const endYear = Math.min(joinedYear + 3, lastAcademicYear);

    for (let year = joinedYear; year <= endYear; year++) {
      const academicYear = `${year} - ${year + 1}`;
      const semesters = [];

      // Push two semesters per academic year
      semesters.push(semester++);
      semesters.push(semester++);

      academicList.push({ academicYear, semesters });
    }

    return academicList;
  }

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      // 1. Fetch regular assignments
      const regularResponse = await apiAxios().get(
        `/assignments/semester/${
          selectedSemester || currentUser?.current_semester
        }/batch/${currentUser?.batch}?academic_year=${
          selectedYear.academicYear || getAcademicYear()
        }`
      );
      if (regularResponse.status !== 200) {
        throw new Error("Failed to fetch assignments");
      }
      const regularData = regularResponse.data;
      const mapping = {};
      const courseList = [];
      regularData.forEach((assignment) => {
        if (
          assignment.course &&
          assignment.faculty &&
          assignment.course.isElective === false // Only regular courses
        ) {
          mapping[assignment.course._id] = assignment.faculty;
          courseList.push({
            ...assignment.course,
            batch: assignment.batch,
            isElective: assignment.course.isElective,
            academic_year: assignment.academic_year,
          });
        }
      });

      // 2. Fetch student's elective assignments
      const electiveResponse = await apiAxios().get(
        `/elective-student-assignments/student/${currentUser?.id}`
      );
      if (electiveResponse.status === 200) {
        const electiveData = electiveResponse.data;
        // electiveData is an array of assignments, each with electives array
        const electives = electiveData[0]?.electives || [];

        console.log("Electives taken by the student", electives);
        // 3. For each elective, fetch the faculty assignment
        const electiveAssignments = await Promise.all(
          electives.map(async (elective) => {
            if (!elective.electiveCourse || !elective.batch) return null;
            // Fetch the assignment for this elective course, batch, and academic year
            const res = await apiAxios().get(
              `/assignments/semester/${
                selectedSemester || currentUser?.current_semester
              }/batch/${elective.batch}?academic_year=${
                selectedYear.academicYear || getAcademicYear()
              }&isElective=true`
            );
            if (res.status !== 200) return null;
            const data = res.data;

            // Find the assignment for this course
            const assignment = data.find(
              (a) => a.course && a.course._id === elective.electiveCourse._id
            );
            if (!assignment || !assignment.faculty) return null;
            return {
              course: {
                ...assignment.course,
                batch: elective.batch,
                isElective: true,
              },
              faculty: assignment.faculty,
            };
          })
        );
        console.log("Elective faculties assignments", electiveAssignments);

        // Add valid elective assignments to mapping and courseList
        electiveAssignments.forEach((item) => {
          if (item && item.course && item.faculty) {
            mapping[item.course._id] = item.faculty;
            // Avoid duplicate courses (if already in courseList)
            if (!courseList.some((c) => c._id === item.course._id)) {
              courseList.push(item.course);
            }
          }
        });
      }

      setCourseFacultyMapping(mapping);
      setCourses(courseList);

      // Check feedback status for each course
      const statusMap = {};
      for (const course of courseList) {
        try {
          const studentId = currentUser?.studentRef || currentUser?._id;
          const feedbackResponse = await apiAxios().get(
            `/feedback/check/${studentId}/${course._id}/${
              course.batch || currentUser?.batch
            }/${selectedSemester || currentUser?.current_semester}`
          );
          if (feedbackResponse.status === 200) {
            const feedbackData = feedbackResponse.data;
            statusMap[course._id] = feedbackData.exists;
          }
        } catch (error) {
          console.error(
            `Error checking feedback for course ${course._id}:`,
            error
          );
          statusMap[course._id] = false;
        }
      }
      setFeedbackStatus(statusMap);

      const isFeedbackGiven = Object.values(statusMap).every((s) => s === true);

      if (courseList.length > 0) {
        try {
          const studentId = currentUser?.studentRef || currentUser?._id;
          if (!studentId) {
            console.error("No valid student ID found");
            return;
          }
          const axiosInstance = apiAxios();
          const response = await axiosInstance.put(`/students/${studentId}`, {
            isFeedbackGiven,
          });
          if (response.status === 200) {
            const result = response.data;
            currentUser.isFeedbackGiven = isFeedbackGiven;
          } else {
            const errorData = response.data;
            console.error(
              "Failed to update student feedback status:",
              errorData
            );
          }
        } catch (error) {
          console.error("Error updating student feedback status:", error);
        }
      }

      // Set default course and faculty if available
      if (courseList.length > 0) {
        const defaultCourse = courseList[0];
        const defaultFaculty = mapping[defaultCourse._id];
        setFormData((prev) => ({
          ...prev,
          course: defaultCourse,
          faculty: defaultFaculty,
        }));
      }
    } catch (error) {
      console.error("Error fetching assignments:", error);
      setError("Failed to load course assignments. Please try again later.");
      toast.error("Failed to load course assignments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const academicList = getAcademicYearSemesterList(currentUser.joined_year);

    const academic = academicList[academicList.length - 1];
    setAcademicYears(academicList);
    setSelectedYear(academic);
    setSelectedSemester(academic?.semesters[academic.semesters.length - 1]);
    if (currentUser?.current_semester && currentUser?.batch) {
      fetchAssignments();
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser?.current_semester && currentUser?.batch) {
      fetchAssignments();
    }
  }, [selectedSemester, selectedYear]);

  // console.log("form data ", formData)

  const handleCourseChange = (courseId) => {
    const selectedCourse = courses.find((course) => course._id === courseId);
    const assignedFaculty = courseFacultyMapping[courseId];

    setFormData((prev) => ({
      ...prev,
      course: selectedCourse,
      faculty: assignedFaculty,
      // Reset ratings when course changes
      questionRating: prev.questionRating.map((item) => ({
        ...item,
        rating: 0,
      })),
      additionalComments: "",
    }));
  };

  const handleRatingChange = (questionIndex, rating) => {
    setFormData((prev) => ({
      ...prev,
      questionRating: prev.questionRating.map((item, index) =>
        index === questionIndex ? { ...item, rating } : item
      ),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.course || !formData.faculty) {
      toast.error("Please select a course");
      return;
    }

    // Check if all questions have ratings
    const hasAllRatings = formData.questionRating.every(
      (item) => item.rating > 0
    );
    if (!hasAllRatings) {
      toast.error("Please provide ratings for all questions");
      return;
    }

    // Check if feedback already given for this course
    if (feedbackStatus[formData.course._id]) {
      toast.error("Feedback already given for this course");
      return;
    }

    setIsSubmitting(true);

    console.log({
      academic_year: selectedYear.academicYear,
      faculty: formData.faculty._id,
      course: formData.course._id,
      batch: String(formData.course.batch || currentUser.batch),
      semester: selectedSemester,
      questionRating: formData.questionRating,
    });

    try {
      const studentId = currentUser?.studentRef || currentUser?._id;
      const response = await apiAxios().post("/feedback", {
        academic_year: selectedYear.academicYear,
        student: studentId,
        faculty: formData.faculty._id,
        course: formData.course._id,
        batch: String(formData.course.batch || currentUser.batch),
        semester: selectedSemester,
        questionRating: formData.questionRating,
        additionalComments: formData.additionalComments,
      });

      if (response.status !== 201) {
        const errorData = response.data;
        throw new Error(errorData.error || "Failed to submit feedback");
      }

      const result = response.data;
      console.log("Feedback submitted:", result);
      toast.success("Feedback submitted successfully!");

      // Update feedback status for this course
      setFeedbackStatus((prev) => ({
        ...prev,
        [formData.course._id]: true,
      }));

      // Check if all feedback is now given
      const updatedStatus = {
        ...feedbackStatus,
        [formData.course._id]: true,
      };

      const allFeedbackGiven = Object.values(updatedStatus).every(
        (status) => status === true
      );

      if (allFeedbackGiven) {
        try {
          console.log("All feedback completed, updating student status...");
          const updateResponse = await apiAxios().put(
            `/students/${studentId}`,
            { isFeedbackGiven: true }
          );

          if (updateResponse.status === 200) {
            const result = updateResponse.data;
            console.log(
              "Updated student feedback status to completed:",
              result
            );
            currentUser.isFeedbackGiven = true;
          } else {
            const errorData = updateResponse.data;
            console.error(
              "Failed to update student feedback status:",
              errorData
            );
          }
        } catch (error) {
          console.error("Error updating student feedback status:", error);
        }
      }

      // Reset form
      setFormData({
        course: courses[0] || null,
        faculty: courses[0] ? courseFacultyMapping[courses[0]._id] : null,
        questionRating: formData.questionRating.map((item) => ({
          ...item,
          rating: 0,
        })),
        additionalComments: "",
      });
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error(
        error.message || "Failed to submit feedback. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  console.log(selectedYear, selectedSemester);
  if (loading) {
    return (
      <>
        <HeaderBar />
        <PageContainer>
          <Container>
            <Title>Course Feedback Form</Title>
            <div style={{ textAlign: "center", padding: "2rem" }}>
              Loading course assignments...
            </div>
          </Container>
        </PageContainer>
        <FooterBar />
      </>
    );
  }

  if (error) {
    return (
      <>
        <HeaderBar />
        <PageContainer>
          <Container>
            <Title>Course Feedback Form</Title>
            <div
              style={{ textAlign: "center", padding: "2rem", color: "#e74c3c" }}
            >
              {error}
            </div>
          </Container>
        </PageContainer>
        <FooterBar />
      </>
    );
  }

  if (courses.length === 0) {
    return (
      <>
        <HeaderBar />
        <PageContainer>
          <Container>
            <Title>Course Feedback Form</Title>
            <FormGroup
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Label>Academic Year</Label>
              <select
                name="courseName"
                value={selectedYear?.academicYear || ""}
                onChange={(e) => {
                  const selected = academicYears.find(
                    (year) => year.academicYear === e.target.value
                  );
                  setSelectedYear(selected);
                  setSelectedSemester(selected?.semesters[0]);
                }}
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
                <option value="">Select Academic Year</option>
                {academicYears.map((year, i) => (
                  <option key={i} value={year.academicYear}>
                    {year.academicYear}
                  </option>
                ))}
              </select>
            </FormGroup>

            <FormGroup
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Label>Semester</Label>
              <select
                name="courseName"
                value={selectedSemester || ""}
                onChange={(e) => setSelectedSemester(Number(e.target.value))}
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
                {selectedYear?.semesters
                  ?.filter((sem) => sem <= currentUser.current_semester)
                  ?.map((sem, i) => (
                    <option key={i} value={sem}>
                      {sem}
                    </option>
                  ))}
              </select>
            </FormGroup>

            <div style={{ textAlign: "center", padding: "2rem" }}>
              No courses assigned for your semester and batch.
            </div>
          </Container>
        </PageContainer>
        <FooterBar />
      </>
    );
  }

  // Check if all feedback is given (only after loading is complete)
  const allFeedbackGiven =
    !loading &&
    Object.values(feedbackStatus).every((status) => status === true) &&
    courses.length > 0;

  if (allFeedbackGiven) {
    return (
      <>
        <HeaderBar />
        <PageContainer>
          <Container>
            <Title>Course Feedback Form</Title>

            <FormGroup
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Label>Academic Year</Label>
              <select
                name="courseName"
                value={selectedYear?.academicYear || ""}
                onChange={(e) => {
                  const selected = academicYears.find(
                    (year) => year.academicYear === e.target.value
                  );
                  setSelectedYear(selected);
                  setSelectedSemester(selected?.semesters[0]);
                }}
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
                <option value="">Select Academic Year</option>
                {academicYears.map((year, i) => (
                  <option key={i} value={year.academicYear}>
                    {year.academicYear}
                  </option>
                ))}
              </select>
            </FormGroup>

            <FormGroup
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Label>Semester</Label>
              <select
                name="courseName"
                value={selectedSemester || ""}
                onChange={(e) => setSelectedSemester(Number(e.target.value))}
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
                {selectedYear?.semesters
                  ?.filter((sem) => sem <= currentUser.current_semester)
                  .map((sem, i) => (
                    <option key={i} value={sem}>
                      {sem}
                    </option>
                  ))}
              </select>
            </FormGroup>
            <div
              style={{
                background: "#e8f5e8",
                padding: "15px",
                borderRadius: "8px",
                border: "2px solid #4caf50",
                textAlign: "center",
                color: "#2e7d32",
                fontWeight: "bold",
              }}
            >
              ✓ You have given feedback for all the courses!
            </div>
          </Container>
        </PageContainer>
        <FooterBar />
      </>
    );
  }

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
              <Label>Academic Year</Label>
              <select
                name="courseName"
                value={selectedYear?.academicYear || ""}
                onChange={(e) => {
                  const selected = academicYears.find(
                    (year) => year.academicYear === e.target.value
                  );
                  setSelectedYear(selected);
                  setSelectedSemester(selected?.semesters[0]);
                }}
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
                <option value="">Select Academic Year</option>
                {academicYears.map((year, i) => (
                  <option key={i} value={year.academicYear}>
                    {year.academicYear}
                  </option>
                ))}
              </select>
            </FormGroup>

            <FormGroup
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Label>Semester</Label>
              <select
                name="courseName"
                value={selectedSemester || ""}
                onChange={(e) => setSelectedSemester(Number(e.target.value))}
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
                {selectedYear?.semesters
                  ?.filter((sem) => sem <= currentUser.current_semester)
                  .map((sem, i) => (
                    <option key={i} value={sem}>
                      {sem}
                    </option>
                  ))}
              </select>
            </FormGroup>

            <FormGroup
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Label>Course Name</Label>
              <select
                name="courseName"
                value={formData.course?._id || ""}
                onChange={(e) => handleCourseChange(e.target.value)}
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
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.name} {course.code}{" "}
                    {course.isElective ? "(Elective)" : ""}{" "}
                    {feedbackStatus[course._id] ? "(Feedback Given)" : ""}
                  </option>
                ))}
              </select>
            </FormGroup>

            {formData.course && formData.faculty && (
              <FormGroup
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Label>Faculty Name</Label>
                <FacultyInfo>
                  <strong>{formData.faculty.name}</strong>
                  <br />
                  <small>{formData.faculty.designation}</small>
                </FacultyInfo>
              </FormGroup>
            )}

            {formData.course &&
              formData.faculty &&
              feedbackStatus[formData.course._id] && (
                <FormGroup
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <div
                    style={{
                      background: "#e8f5e8",
                      padding: "15px",
                      borderRadius: "8px",
                      border: "2px solid #4caf50",
                      textAlign: "center",
                      color: "#2e7d32",
                      fontWeight: "bold",
                    }}
                  >
                    ✓ Feedback already given for this course
                  </div>
                </FormGroup>
              )}

            {formData.course &&
              formData.faculty &&
              !feedbackStatus[formData.course._id] && (
                <>
                  {formData.questionRating.map((question, index) => (
                    <FormGroup
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 * (index + 2) }}
                    >
                      <Label>{question.question}</Label>
                      <RatingContainer>
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <StarButton
                            key={rating}
                            type="button"
                            selected={question.rating >= rating}
                            onClick={() => handleRatingChange(index, rating)}
                          >
                            <FaStar />
                          </StarButton>
                        ))}
                      </RatingContainer>
                    </FormGroup>
                  ))}

                  {/* <FormGroup
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
                  </FormGroup> */}

                  <SubmitButton
                    type="submit"
                    disabled={isSubmitting}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isSubmitting ? "Submitting..." : "Submit Feedback"}
                  </SubmitButton>
                </>
              )}
          </Form>
        </Container>
      </PageContainer>
      <FooterBar />
    </>
  );
};

export default FeedbackPage;
