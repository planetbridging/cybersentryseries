export class objCollector {
  constructor() {
    this.lstCve = new Map();
    this.lstUniqCpe = new Map();
    this.lstCpeToCve = new Map();
    this.lstSearchsploit = new Map();
    this.lstCveToSearchsploit = new Map();
    this.lstCveToMetasploit = new Map();
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
}
