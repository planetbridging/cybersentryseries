$(document).ready(function () {
  console.log("welcome to cyber sentry series front end dom");
});

function downloadPDF(elementId) {
  // Get the element you want to convert to PDF
  var element = document.getElementById(elementId);

  // Use html2pdf's promise-based API
  html2pdf()
    .from(element)
    .set({
      margin: 10,
      filename: "document.pdf",
      html2canvas: { scale: 2 },
      jsPDF: {
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compressPDF: true,
      },
    })
    .save();
}
