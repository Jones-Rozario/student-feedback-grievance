import jsPDF from "jspdf";
import "jspdf-autotable";
import logoPng from "../assests/anna_univ_logo.png";
import {apiAxios} from "./api"

export const generateFacultyReport = async (academicYear) => {
  try {
    // Fetch consolidated faculty report data from backend
    const res = await apiAxios().get(
      `/feedback/faculty-feedback-report?academic_year=${encodeURIComponent(academicYear)}`
    );
    const data = res.data;
	
console.log(data);
    const doc = new jsPDF();

    for (let i = 0; i < data.length; i++) {
      const faculty = data[i];

      // Add Logo + Header
      doc.addImage(logoPng, "PNG", 20, 10, 25, 25);
      doc.setFontSize(14);
      doc.setFont("times", "bold");
      doc.text("ANNA UNIVERSITY", 105, 20, { align: "center" });
      doc.text("COLLEGE OF ENGINEERING, GUINDY CAMPUS", 105, 28, {
        align: "center",
      });
      doc.text("DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING", 105, 36, {
        align: "center",
      });

      doc.setFontSize(12);
      doc.text("FEEDBACK REPORT", 105, 48, { align: "center" });

      doc.setFont("times", "normal");

      // Faculty Details
      doc.setFontSize(11);
      doc.text(`Name of the Faculty : ${faculty.name}`, 20, 65);
      doc.text(`Designation : ${faculty.designation}`, 20, 72);
      doc.text(`Academic Year : ${academicYear}`, 20, 79);

      // Student Feedback Section
      doc.setFontSize(12);
      doc.text("STUDENTS FEEDBACK", 105, 90, { align: "center" });

      // Table for Assignments + Feedback
      const tableData = faculty.assignments.map((a, index) => [
        index + 1,
        academicYear,
        a.semester,
        a.course?.code || "N/A",
        a.course?.name || "N/A",
        a.batch,
        a.course?.regulation || "N/A",
        a.avgFeedback?.toFixed(2) || "0.00",
      ]);

      doc.autoTable({
        startY: 100,
        head: [
          [
            "S.No",
            "Academic Year",
            "Semester",
            "Subject Code",
            "Subject Name",
            "Batch",
            "Regulation",
            "Avg Feedback (25)",
          ],
        ],
        body: tableData,
        theme: "grid",
        headStyles: { fillColor: [41, 128, 185] },
        styles: { fontSize: 10 },
      });

      // Totals
      const finalY = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(11);
      doc.text(`Total   : ${faculty.total.toFixed(2)}`, 20, finalY);
      doc.text(
        `Average : ${faculty.average.toFixed(2)}`,
        20,
        finalY + 7
      );

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(100);
      doc.text(
        "This is System Generated Feedback Report from DCSE, Anna University, Chennai-25.",
        105,
        285,
        { align: "center" }
      );
      doc.text(`Timestamp: ${new Date().toLocaleString()}`, 105, 292, {
        align: "center",
      });

      // New page for next faculty
      if (i < data.length - 1) {
        doc.addPage();
      }
    }

    doc.save(`FacultyFeedbackReport_${academicYear}.pdf`);
  } catch (err) {
    console.error("Error generating PDF:", err);
    alert("Failed to generate report");
  }
};
