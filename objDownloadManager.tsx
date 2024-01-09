const fs = require("fs");
const https = require("https");
const AdmZip = require("adm-zip");
const csv = require("csv-parser");

const objCollector = require("./objCollector");
const { lstFiltes } = require("./staticData");

var objCollectorYear = new objCollector.objCollector();

// Helper function to recursively extract CPE matches
function extractCPEMatches(nodes) {
  let cpeMatches = [];
  for (const node of nodes) {
    if (node.cpe_match) {
      cpeMatches = cpeMatches.concat(node.cpe_match);
    }
    if (node.children && node.children.length) {
      cpeMatches = cpeMatches.concat(extractCPEMatches(node.children));
    }
  }
  return cpeMatches;
}

const SEPARATOR = "-><-"; // Custom separator to avoid conflict with dots in values

function mapUniqueKeys(obj, map = new Map(), currentPath = []) {
  // Iterate over each property in the object
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      // Handle the case where the property is another object or an array
      if (typeof obj[key] === "object" && obj[key] !== null) {
        mapUniqueKeys(obj[key], map, currentPath.concat(key));
      } else {
        // Handle the case where the property is a value
        const path = currentPath.concat(key).join(SEPARATOR);
        if (!map.has(path)) {
          map.set(path, new Set()); // Use Set to avoid duplicates
        }
        // If the value is an array, add each element to the Set
        if (Array.isArray(obj[key])) {
          obj[key].forEach((item) => map.get(path).add(item));
        } else {
          map.get(path).add(obj[key]);
        }
      }
    }
  }

  // If the currentPath is empty, we are at the root, return the combined map
  if (currentPath.length === 0) {
    const combinedMap = new Map();
    for (const [path, valuesSet] of map.entries()) {
      // Extract the key from the path, considering custom separator
      const key = path.split(SEPARATOR).pop();
      if (!combinedMap.has(key)) {
        combinedMap.set(key, new Set());
      }
      // Combine Sets of values
      valuesSet.forEach((value) => combinedMap.get(key).add(value));
    }
    // Convert Sets to Arrays
    for (const [key, valueSet] of combinedMap.entries()) {
      combinedMap.set(key, Array.from(valueSet));
    }
    return combinedMap;
  }

  return map;
}

export class objDownloadManager {
  constructor() {
    /*const json = {
      a: 1,
      b: {
        c: 2,
        d: {
          e: 3,
        },
      },
      f: {
        c: 4,
      },
    };

    const uniqueKeysMap = mapUniqueKeys(json);

    // Logging the result
    uniqueKeysMap.forEach((value, key) => {
      console.log(key, value);
    });*/
  }

  async startup() {
    const downloadFolder = "./download";

    // Check if the download folder exists, create it if it doesn't
    if (!fs.existsSync(downloadFolder)) {
      fs.mkdirSync(downloadFolder);
      console.log(`Created download folder: ${downloadFolder}`);
    }

    const currentYear = new Date().getFullYear();
    const baseUrl = "https://nvd.nist.gov/feeds/json/cve/1.1/nvdcve-1.1-";

    // Loop through the years from 2002 to the current year
    for (let year = 2002; year <= currentYear; year++) {
      const url = `${baseUrl}${year}.json.zip`;
      const zipFilePath = `${downloadFolder}/nvdcve-1.1-${year}.json.zip`;
      const extractedFilePath = `${downloadFolder}/nvdcve-1.1-${year}.json`;

      // Skip downloading the zip file if it already exists
      if (!fs.existsSync(extractedFilePath)) {
        // Download the zip file for the current year
        const file = fs.createWriteStream(zipFilePath);
        await new Promise((resolve, reject) => {
          https
            .get(url, (response) => {
              response.pipe(file);
              file.on("finish", () => {
                file.close();
                console.log(
                  `Zip file for year ${year} downloaded successfully.`
                );
                resolve();
              });
            })
            .on("error", (err) => {
              fs.unlinkSync(zipFilePath);
              reject(err);
            });
        });

        // Extract the zip file for the current year
        const zip = new AdmZip(zipFilePath);
        zip.extractAllTo(downloadFolder, true);
        console.log(`Zip file for year ${year} extracted successfully.`);

        // Delete the zip file
        fs.unlinkSync(zipFilePath);
      }
    }
    console.log("All files downloaded and extracted.");
    await this.processAllCVEData();
    console.log("added to map");
    return objCollectorYear;
  }

  processCVEData(fileYear) {
    const filePath = `./download/nvdcve-1.1-${fileYear}.json`;

    // Read the JSON data from the file
    const jsonData = fs.readFileSync(filePath, "utf8");
    const cveData = JSON.parse(jsonData);

    const cveItems = cveData.CVE_Items;

    //objCollectorYear.lstCve.set("Hello", "yay");

    // Loop through each item in the JSON data
    for (const cveItem of cveItems) {
      const cveMeta = cveItem.cve.CVE_data_meta;
      const cveId = cveMeta.ID;
      const descriptionTmp = cveItem.cve.description.description_data[0]?.value;
      //const cpeMatches = extractCPEMatches(cveItem.configurations.nodes);
      const cpeMatches = cveItem.configurations.nodes[0]?.cpe_match;

      if (!cveId || !descriptionTmp || !cpeMatches) {
        //console.log(`Invalid structure for CVE item: ${cveId}. Skipping.`);
        continue;
      }

      //const cpeValues = cpeMatches.map((cpeMatch) => cpeMatch.cpe23Uri);

      var cpeValues = cpeMatches.map((cpeMatch) => {
        const cpeParts = cpeMatch.cpe23Uri.split(":").slice(2);
        //var tmp1 =  cpeParts.join(":");
        var rebuild = "";

        for (var t in cpeParts) {
          if (cpeParts[t] != "-" && cpeParts[t] != "*") {
            rebuild += cpeParts[t] + ":";
          }
        }
        rebuild = rebuild.slice(0, -1);

        if (objCollectorYear.lstUniqCpe.has(rebuild)) {
          var lstTmp = objCollectorYear.lstUniqCpe.get(rebuild);
          if (!lstTmp.includes(cveId)) {
            lstTmp.push(cveId);
            objCollectorYear.lstUniqCpe.set(rebuild, lstTmp);
          }
        } else {
          objCollectorYear.lstUniqCpe.set(rebuild, [cveId]);
        }

        return rebuild;
      });

      var impact = cveItem.impact.baseMetricV2 || cveItem.impact.baseMetricV3;

      if (!impact) {
        console.log(`Impact details not available for CVE item: ${cveId}`);
        continue;
      }

      const uniqueKeysMap = mapUniqueKeys(cveItem);

      // Logging the result

      //if (cveId == "CVE-2017-0144") {
      //console.log(cveItem);
      //console.log(cveItem.configurations.nodes);
      /*uniqueKeysMap.forEach((value, key) => {
          console.log(key, value);
        });*/
      if (uniqueKeysMap.has("cpe23Uri")) {
        var lstCpe = uniqueKeysMap.get("cpe23Uri");
        for (var c in lstCpe) {
          const cpeParts = lstCpe[c].split(":").slice(2);
          //var tmp1 =  cpeParts.join(":");
          var rebuild = "";

          for (var t in cpeParts) {
            if (cpeParts[t] != "-" && cpeParts[t] != "*") {
              rebuild += cpeParts[t] + ":";
            }
          }
          rebuild = rebuild.slice(0, -1);

          if (objCollectorYear.lstUniqCpe.has(rebuild)) {
            var lstTmp = objCollectorYear.lstUniqCpe.get(rebuild);
            if (!lstTmp.includes(cveId)) {
              lstTmp.push(cveId);
              objCollectorYear.lstUniqCpe.set(rebuild, lstTmp);
            }
          } else {
            objCollectorYear.lstUniqCpe.set(rebuild, [cveId]);
          }

          if (!cpeValues.includes(rebuild)) {
            cpeValues.push(rebuild);
          }
          //console.log(rebuild);
        }
      }
      //}
      //console.log(cveItem.impact);
      //console.log(cpeValues);
      var categories = this.getCategories(descriptionTmp);
      var descriptionTmpClean = descriptionTmp?.replace(/[^a-zA-Z0-9 ]/g, '');

      var objCve = {
        baseMetricV2: cveItem.impact?.baseMetricV2,
        baseMetricV3: cveItem.impact?.baseMetricV3,
        cve: cveId,
        description: descriptionTmpClean,
        lstCpe: cpeValues,
        categories: categories,
      };
      objCollectorYear.lstCve.set(cveId, objCve);

      /*if (cveId == "CVE-2017-0144") {
        console.log(cpeValues);
      }*/
      //console.log(objCve);
      //break;
    }
  }

  getCategories(desc) {
    var clean = desc.toString().toLowerCase();
    var lst = [];
    for (var filter in lstFiltes) {
      if (clean.includes(lstFiltes[filter])) {
        lst.push(lstFiltes[filter]);
      }
    }
    return lst;
  }

  async processAllCVEData() {
    const currentYear = new Date().getFullYear();

    for (let year = 2002; year <= currentYear; year++) {
      const fileName = `nvdcve-1.1-${year}.json`;
      const filePath = `./download/${fileName}`;

      if (fs.existsSync(filePath)) {
        console.log(`Processing ${fileName}`);
        this.processCVEData(year);
      } else {
        console.log(`${fileName} does not exist.`);
      }
    }

    //console.log(objCollectorYear.lstUniqCpe);
    await this.extractSearchsploit();
    //console.log(objCollectorYear.lstCveToSearchsploit);
    await this.extractDataFromFile();
    console.log("finished loading data into cache");
  }

  async extractSearchsploit() {
    await new Promise((resolve, reject) => {
      fs.createReadStream("./files_exploits.csv")
        .pipe(csv())
        .on("data", (row) => {
          const id = row.id;
          const file = row.file;
          const description = row.description;
          const cveValues = row.codes.split(";");

          //results.push({ id, cveValues, file, description });
          var descriptionTmpClean = description?.replace(/[^a-zA-Z0-9 ]/g, '');
          objCollectorYear.lstSearchsploit.set(id, {
            cveValues: cveValues,
            file: file,
            description: descriptionTmpClean,
          });

          for (var c in cveValues) {
            if (cveValues[c] && cveValues[c].includes("CVE")) {
              if (objCollectorYear.lstCveToSearchsploit.has(cveValues[c])) {
                var lstTmp = objCollectorYear.lstCveToSearchsploit.get(
                  cveValues[c]
                );
                lstTmp.push(id);
                objCollectorYear.lstCveToSearchsploit.set(cveValues[c], lstTmp);
              } else {
                objCollectorYear.lstCveToSearchsploit.set(cveValues[c], [id]);
              }
            }
          }
          //console.log(objCollectorYear.lstCveToSearchsploit);
          //lstCveToSearchsploit

          //objCollectorYear.lstCve.set(cveId, objCve);
        })
        .on("end", () => {
          console.log("CSV file processing completed.");
          resolve();
        })
        .on("error", (error) => {
          reject(error);
        });
    });

    //console.log(results);
  }

  async extractDataFromFile() {
    try {
      const fileData = await this.readFile("./modules_metadata_base.json");
      //console.log(fileData);
      const jsonData = JSON.parse(fileData);
      const hashMap = new Map();

      for (const key in jsonData) {
        const item = jsonData[key];
        const references = item.references;

        for (const reference of references) {
          if (reference.startsWith("CVE-")) {
            const cveNumber = reference;
            const data = {
              name: item.name,
              fullname: item.fullname,
              aliases: item.aliases,
              rank: item.rank,
              disclosure_date: item.disclosure_date,
              type: item.type,
              author: item.author,
              description: item.description,
              platform: item.platform,
              arch: item.arch,
              rport: item.rport,
              autofilter_ports: item.autofilter_ports,
              autofilter_services: item.autofilter_services,
              targets: item.targets,
              mod_time: item.mod_time,
              path: item.path,
              is_install_path: item.is_install_path,
              ref_name: item.ref_name,
              check: item.check,
              post_auth: item.post_auth,
              default_credential: item.default_credential,
              notes: item.notes,
              session_types: item.session_types,
              needs_cleanup: item.needs_cleanup,
            };

            if (hashMap.has(cveNumber)) {
              hashMap.get(cveNumber).push(data);
            } else {
              hashMap.set(cveNumber, [data]);
            }
          }
        }
      }

      //return hashMap;
      objCollectorYear.lstCveToMetasploit = hashMap;
    } catch (error) {
      console.error("Error reading file:", error);
      return null;
    }
  }

  async readFile(loc) {
    const buffer = await fs.readFileSync(loc);
    const fileContent = buffer.toString();
    return fileContent;
  }
}
