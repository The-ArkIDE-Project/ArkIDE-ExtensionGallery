class CountriesExtension {
  constructor() {
    this._cache = {};
  }

  getInfo() {
    return {
      id: "countries",
      name: "Countries",
      color1: "#1e90ff",
      color2: "#63b3ff",
      color3: "#0b3c78",
      menus: {
        COUNTRIES: {
          acceptReporters: true,
          items: [
            "Afghanistan","Albania","Algeria","Andorra","Angola","Antigua and Barbuda",
            "Argentina","Armenia","Australia","Austria","Azerbaijan","Bahamas","Bahrain",
            "Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bhutan",
            "Bolivia","Bosnia and Herzegovina","Botswana","Brazil","Brunei","Bulgaria",
            "Burkina Faso","Burundi","Cambodia","Cameroon","Canada","Central African Republic",
            "Chad","Chile","China","Colombia","Comoros","Costa Rica","Croatia","Cuba",
            "Cyprus","Czech Republic","Denmark","Dominican Republic","Ecuador","Egypt",
            "El Salvador","Equatorial Guinea","Eritrea","Estonia","Eswatini","Ethiopia",
            "Fiji","Finland","France","Gabon","Gambia","Georgia","Germany","Ghana",
            "Greece","Grenada","Guatemala","Guinea","Guyana","Haiti","Honduras","Hungary",
            "Iceland","India","Indonesia","Iran","Iraq","Ireland","Israel","Italy",
            "Jamaica","Japan","Jordan","Kazakhstan","Kenya","Kuwait","Kyrgyzstan","Laos",
            "Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania",
            "Luxembourg","Madagascar","Malawi","Malaysia","Maldives","Mali","Malta",
            "Mauritania","Mauritius","Mexico","Moldova","Monaco","Mongolia","Montenegro",
            "Morocco","Mozambique","Myanmar","Namibia","Nepal","Netherlands","New Zealand",
            "Nicaragua","Niger","Nigeria","North Korea","North Macedonia","Norway","Oman",
            "Pakistan","Panama","Paraguay","Peru","Philippines","Poland","Portugal","Qatar",
            "Romania","Russia","Rwanda","Saudi Arabia","Senegal","Serbia","Seychelles",
            "Sierra Leone","Singapore","Slovakia","Slovenia","Somalia","South Africa",
            "South Korea","Spain","Sri Lanka","Sudan","Suriname","Sweden","Switzerland",
            "Syria","Taiwan","Tajikistan","Tanzania","Thailand","Togo","Tunisia","Turkey",
            "Turkmenistan","Uganda","Ukraine","United Arab Emirates","United Kingdom",
            "United States","Uruguay","Uzbekistan","Vatican City","Venezuela","Vietnam",
            "Yemen","Zambia","Zimbabwe"
          ]
        }
      },
      blocks: [
        { opcode:"capital",        blockType:Scratch.BlockType.REPORTER, text:"capital of [COUNTRY]",           arguments:{COUNTRY:{type:Scratch.ArgumentType.STRING,menu:"COUNTRIES"}}},
        { opcode:"population",     blockType:Scratch.BlockType.REPORTER, text:"population of [COUNTRY]",        arguments:{COUNTRY:{type:Scratch.ArgumentType.STRING,menu:"COUNTRIES"}}},
        { opcode:"region",         blockType:Scratch.BlockType.REPORTER, text:"region of [COUNTRY]",            arguments:{COUNTRY:{type:Scratch.ArgumentType.STRING,menu:"COUNTRIES"}}},
        { opcode:"subregion",      blockType:Scratch.BlockType.REPORTER, text:"subregion of [COUNTRY]",         arguments:{COUNTRY:{type:Scratch.ArgumentType.STRING,menu:"COUNTRIES"}}},
        { opcode:"currency",       blockType:Scratch.BlockType.REPORTER, text:"currency of [COUNTRY]",          arguments:{COUNTRY:{type:Scratch.ArgumentType.STRING,menu:"COUNTRIES"}}},
        { opcode:"area",           blockType:Scratch.BlockType.REPORTER, text:"area of [COUNTRY]",              arguments:{COUNTRY:{type:Scratch.ArgumentType.STRING,menu:"COUNTRIES"}}},
        { opcode:"timezone",       blockType:Scratch.BlockType.REPORTER, text:"timezone of [COUNTRY]",          arguments:{COUNTRY:{type:Scratch.ArgumentType.STRING,menu:"COUNTRIES"}}},
        { opcode:"flag",           blockType:Scratch.BlockType.REPORTER, text:"flag URL of [COUNTRY]",          arguments:{COUNTRY:{type:Scratch.ArgumentType.STRING,menu:"COUNTRIES"}}},
        { opcode:"independent",    blockType:Scratch.BlockType.BOOLEAN,  text:"is [COUNTRY] independent?",      arguments:{COUNTRY:{type:Scratch.ArgumentType.STRING,menu:"COUNTRIES"}}},
        { opcode:"languages",      blockType:Scratch.BlockType.REPORTER, text:"languages of [COUNTRY]",         arguments:{COUNTRY:{type:Scratch.ArgumentType.STRING,menu:"COUNTRIES"}}},
        { opcode:"currentCountry", blockType:Scratch.BlockType.REPORTER, text:"current country"},
        { opcode:"currentCity",    blockType:Scratch.BlockType.REPORTER, text:"current city"},
        { opcode:"currentAddress", blockType:Scratch.BlockType.REPORTER, text:"current address"},
        { opcode:"currentIP",      blockType:Scratch.BlockType.REPORTER, text:"current IP"}
      ]
    };
  }

  // FIX: added caching to avoid repeated API calls for same country
  async fetchCountry(name) {
    if (this._cache[name]) return this._cache[name];
    try {
      const r = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(name)}?fullText=true`);
      const data = await r.json();
      this._cache[name] = data[0];
      return this._cache[name];
    } catch {
      return null;
    }
  }

  async capital(a)     { return (await this.fetchCountry(a.COUNTRY))?.capital?.[0] ?? "N/A"; }
  async population(a)  { return (await this.fetchCountry(a.COUNTRY))?.population ?? "N/A"; }
  async region(a)      { return (await this.fetchCountry(a.COUNTRY))?.region ?? "N/A"; }
  // FIX: replaced broken numberOfRegions (subdivisions doesn't exist in API) with subregion
  async subregion(a)   { return (await this.fetchCountry(a.COUNTRY))?.subregion ?? "N/A"; }
  async currency(a) {
    const c = await this.fetchCountry(a.COUNTRY);
    if (!c?.currencies) return "N/A";
    return Object.values(c.currencies)[0]?.name ?? "N/A";
  }
  async area(a)        { return (await this.fetchCountry(a.COUNTRY))?.area ?? "N/A"; }
  async timezone(a)    { return (await this.fetchCountry(a.COUNTRY))?.timezones?.[0] ?? "N/A"; }
  async flag(a)        { return (await this.fetchCountry(a.COUNTRY))?.flags?.png ?? "N/A"; }
  async independent(a) { return (await this.fetchCountry(a.COUNTRY))?.independent ?? false; }
  async languages(a) {
    const c = await this.fetchCountry(a.COUNTRY);
    if (!c?.languages) return "N/A";
    return Object.values(c.languages).join(", ");
  }

  async currentIP() {
    try {
      return (await (await fetch("https://api.ipify.org?format=json")).json()).ip;
    } catch { return "N/A"; }
  }

  async getLocation() {
    return new Promise((res, rej) => navigator.geolocation.getCurrentPosition(res, rej));
  }

  async reverse(lat, lon) {
    return await (await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`)).json();
  }

  async currentCountry() {
    try {
      const p = await this.getLocation();
      const g = await this.reverse(p.coords.latitude, p.coords.longitude);
      return g.address.country ?? "N/A";
    } catch { return "Permission denied"; }
  }

  async currentCity() {
    try {
      const p = await this.getLocation();
      const g = await this.reverse(p.coords.latitude, p.coords.longitude);
      return g.address.city || g.address.town || g.address.village || "N/A";
    } catch { return "Permission denied"; }
  }

  async currentAddress() {
    try {
      const p = await this.getLocation();
      const g = await this.reverse(p.coords.latitude, p.coords.longitude);
      return g.display_name ?? "N/A";
    } catch { return "Permission denied"; }
  }
}

Scratch.extensions.register(new CountriesExtension());
