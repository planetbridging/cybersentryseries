import objCpeLookup from "./objCpelookup";

const PDFDocument = require("pdfkit-table");
const axios = require("axios");

export class objPdfGenerator {
  async sendPdfCpe(res, req, searchCpe) {
    try {
      //console.log("send pdf?");
      // Create a new PDF document

      const doc = new PDFDocument();
      const search = req.body.xml;
      // Set PDF content and properties for the title page

      // Add an image on the title page
      doc.image("public/imgs/bewear-feature.jpg", { width: 500 });
      doc.moveDown();
      //doc.fontSize(12).text("Project: Bewear");
      doc
        .fontSize(25)
        .text("Project: Bewear", { align: "center", padding: 40 });
      doc.fontSize(12).text("Email: cvelookup@gmail.com", { align: "center" });
      doc.fontSize(12).text("Created by: Samuel Watson", { align: "center" });
      doc.fontSize(12).text("Website: http://flawbot.com", { align: "center" });
      doc.fontSize(10).text(`Created on: ${new Date().toLocaleString()}`, {
        align: "center",
      });

      // Add a new page for the content
      //doc.addPage();

      doc.moveDown();

      doc.moveDown();

      doc.moveDown();

      var searchResults = await axios.get(
        "http://localhost:8123/cpelookup?search=" + searchCpe
      );
      var data = searchResults["data"];

      doc.fontSize(25).text("Cpelookup search: " + searchCpe, {
        align: "center",
        padding: 40,
      });
      doc.moveDown();

      if (data["found"] != "") {
        var oCpelookup = new objCpeLookup();
        var ocpeCatLst = oCpelookup.getUniqCategories(data["found"]);
        var oCpeCatLstString = ocpeCatLst[2].join(",");
        doc.fontSize(18).text("Unique categories " + ocpeCatLst[1].toString(), {
          align: "center",
          padding: 40,
        });

        doc.fontSize(12).text(oCpeCatLstString, {});

        doc.moveDown();

        var ocpeExploitsLst = oCpelookup.getUniqExploits(data["found"]);

        const table = {
          title: "Unique exploits " + ocpeExploitsLst[1].toString(),
          subtitle: "https://www.exploit-db.com/exploits/{id}",
          headers: ["Searchsploit", "Cve Values", "File", "Description"],
          rows: [],
        };
        try {
          var tmpMap = new Map();
          for (var oExploits in ocpeExploitsLst[2]) {
            //example of data processing
            /* {
    cveValues: [ "CVE-2021-44790" ],
    file: "exploits/multiple/webapps/51193.py",
    description: "Apache 2.4.x - Buffer Overflow"
  }*/
            if (!tmpMap.has(ocpeExploitsLst[2][oExploits][0])) {
              tmpMap.set(ocpeExploitsLst[2][oExploits][0]);
              table.rows.push([
                ocpeExploitsLst[2][oExploits][0],
                ocpeExploitsLst[2][oExploits][1]["cveValues"].toString(),
                ocpeExploitsLst[2][oExploits][1]["file"],
                ocpeExploitsLst[2][oExploits][1]["description"],
              ]);
            }
          }
          doc.addPage();
          await doc.table(table, {
            width: 400,
          });
        } catch {
          doc.fontSize(25).text("Failed to generate uniq exploit tbl", {
            align: "center",
            padding: 40,
          });
          doc.moveDown();
        }
      }

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", 'inline; filename="document.pdf"');

      // Pipe the PDF document to the response
      doc.pipe(res);
      doc.end();
    } catch (ex) {
      console.log(ex);
      res.send("somethign didnt work");
    }
  }
}
