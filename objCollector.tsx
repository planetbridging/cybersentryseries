const oMysql = require("./objMysql");

export class objCollector {
  constructor() {
    this.lstCve = new Map();
    this.lstUniqCpe = new Map();
    this.lstCpeToCve = new Map();
    this.lstSearchsploit = new Map();
    this.lstCveToSearchsploit = new Map();
    this.lstCveToMetasploit = new Map();

    this.DBLocation = process.env.DBLocation;
    this.DBNAME = process.env.DBNAME;
    this.DBUN = process.env.DBUN;
    this.DBPASSWORD = process.env.DBPASSWORD;
    this.testForDatabaseConnection();
  }

  getFirstItemOfAllMaps() {
    let firstItems = {};

    // Helper function to get the first item of a Map
    const getFirstItem = (map) => {
      if (map.size === 0) return null;
      return Array.from(map.entries())[0];
    };

    firstItems["lstCve"] = getFirstItem(this.lstCve);
    firstItems["lstUniqCpe"] = getFirstItem(this.lstUniqCpe);
    firstItems["lstCpeToCve"] = getFirstItem(this.lstCpeToCve);
    firstItems["lstSearchsploit"] = getFirstItem(this.lstSearchsploit);
    firstItems["lstCveToSearchsploit"] = getFirstItem(this.lstCveToSearchsploit);
    firstItems["lstCveToMetasploit"] = getFirstItem(this.lstCveToMetasploit);

    return firstItems;
  }

  testForDatabaseConnection(){
    try{
      this.oSql = new oMysql.objSql(this.DBLocation, this.DBUN, this.DBPASSWORD, true, this.DBNAME);
      console.log("Connected to database",this.DBNAME);
    }catch(ex){
      console.log("Unable to connect to database",ex);
      this.oSql = null;
    }
  }

  createStatsJson() {
    var j = {};
    j["lstCve"] = this.lstCve.size;
    j["lstUniqCpe"] = this.lstUniqCpe.size;
    j["lstCpeToCve"] = this.lstCpeToCve.size;
    j["lstSearchsploit"] = this.lstSearchsploit.size;
    j["lstCveToSearchsploit"] = this.lstCveToSearchsploit.size;
    j["lstCveToMetasploit"] = this.lstCveToMetasploit.size;
    return j;
  }
  

  async remoteDBsaving() {
    //MYSQL_CLIENT_SSL

    await this.oSql.createDb("bewear");

    var lstDb = await this.oSql.getLstTbl("bewear");
    console.log(lstDb);



    if(!lstDb.includes("lstCve")){
      console.log("uploading lstCve");
      await this.bulkSave(`lstCve`, `cve`, this.lstCve);
    }

    if(!lstDb.includes("lstUniqCpe")){
      console.log("uploading lstUniqCpe");
      await this.bulkSave(`lstUniqCpe`, `uniqCpe`, this.lstUniqCpe);
    }

    if(!lstDb.includes("lstSearchsploit")){
      console.log("uploading lstSearchsploit");
      await this.bulkSave(`lstSearchsploit`, `searchsploit`, this.lstSearchsploit);
    }

    if(!lstDb.includes("lstCveToSearchsploit")){
      console.log("uploading lstCveToSearchsploit");
      await this.bulkSave(`lstCveToSearchsploit`, `cveToSearchsploit`, this.lstCveToSearchsploit);
    }

    //if(!lstDb.includes("lstCveToMetasploit")){
      //console.log("uploading lstCveToMetasploit");
      //await this.bulkSave(`lstCveToMetasploit`, `cveToMetasploit`, this.lstCveToMetasploit);
    //}
    //console.log(this.lstCveToMetasploit);
    await this.createViews(lstDb);
  }

  async createViews(lstDb){
    var cveSearchsploit = `CREATE VIEW view_CveToSearchsploit AS
    SELECT 
        lstCve.cve AS cveID, 
        lstCve.data AS cveData, 
        lstCveToSearchsploit.data AS searchsploitData
    FROM 
        lstCve
    JOIN 
        lstCveToSearchsploit 
        ON lstCve.cve = lstCveToSearchsploit.cveToSearchsploit;
    `;

    if(!lstDb.includes("view_CveToSearchsploit")){
      await this.oSql.randomSql(
        cveSearchsploit
      );
    }
  }

  async bulkSave(name, subname, lst) {
    var query = `CREATE TABLE IF NOT EXISTS ` +
          name +
          ` (
        id INT AUTO_INCREMENT PRIMARY KEY,
        ` +
          subname +
          ` VARCHAR(255) NOT NULL,
        data JSON,
        UNIQUE INDEX ` +
          subname +
          `_index (` +
          subname +
          `)
      );`;
      console.log(query);
    var resp = await this.oSql.randomSql(
      query
    );

    console.log(resp);
  
    await this.bulkInsetLst(name, subname, lst);
  }

  async bulkInsetLst(name, subname, lst) {
    var lstFromDb = await this.oSql.randomSql(`SELECT ` + subname + ` from ` + name);
    const tmpMap = new Map();
  
    // Insert each cve value into the Map
    lstFromDb.forEach((row) => {
      tmpMap.set(row[subname]); // Setting the value to 'true' for each key
    });
  
    for (let [key, value] of lst) {
      console.log(`Key: ${key}`);
      if (!tmpMap.has(key)) {``

      
      
      await this.oSql.randomSql(
          `INSERT INTO ` +
            name +
            ` (` +
            subname +
            `, data) VALUES ('` +
            key +
            `', '` +
            JSON.stringify(value) +
            `');
        `
        );
      }
    }
  }
}
