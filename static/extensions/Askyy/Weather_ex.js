class WeatherUltraPlus {
  constructor() {
    this._geoCache = {};
    this._weatherCache = {};
  }

  getInfo() {
    return {
      id: "weatherultraplus",
      name: "Weather",
      color1: "#2980b9",
      color2: "#85c1e9",
      color3: "#1b4f72",
      menus: {
        CITIES: {
          acceptReporters: true,
          items: [
            // EUROPE
            "Rome","Milan","Naples","Turin","Venice","Florence","Bologna","Genoa","Palermo","Catania",
            "Paris","Marseille","Lyon","Toulouse","Nice","Bordeaux","Lille","Strasbourg",
            "London","Manchester","Birmingham","Liverpool","Leeds","Bristol","Nottingham",
            "Berlin","Hamburg","Munich","Cologne","Frankfurt","Stuttgart","Dusseldorf","Leipzig",
            "Madrid","Barcelona","Valencia","Seville","Zaragoza","Malaga","Murcia",
            "Lisbon","Porto","Braga",
            "Vienna","Graz","Linz",
            "Prague","Brno","Ostrava",
            "Warsaw","Krakow","Wroclaw","Gdansk","Poznan",
            "Budapest","Debrecen",
            "Athens","Thessaloniki",
            "Stockholm","Gothenburg","Malmo",
            "Oslo","Bergen",
            "Helsinki","Espoo",
            "Copenhagen","Aarhus",
            "Dublin","Cork",
            "Brussels","Antwerp","Ghent",
            "Amsterdam","Rotterdam","The Hague","Utrecht",
            "Zurich","Geneva","Basel",
            "Moscow","Saint Petersburg","Kazan","Sochi",
            "Kyiv","Lviv","Odessa",
            "Bucharest","Cluj-Napoca",
            "Sofia","Plovdiv",
            "Belgrade","Novi Sad",
            "Zagreb","Split",
            "Ljubljana","Sarajevo","Skopje","Tirana",
            // AMERICAS
            "New York","Los Angeles","Chicago","Houston","Phoenix","Philadelphia","San Antonio",
            "San Diego","Dallas","San Jose","Austin","Seattle","San Francisco","Denver","Boston",
            "Miami","Orlando","Tampa","Atlanta","Nashville",
            "Toronto","Montreal","Vancouver","Calgary","Edmonton","Ottawa",
            "Mexico City","Guadalajara","Monterrey","Puebla",
            "Havana","Santo Domingo","San Juan",
            "Bogota","Medellin","Cali","Barranquilla",
            "Caracas","Lima","Santiago","Buenos Aires","Montevideo",
            "Rio de Janeiro","Sao Paulo","Brasilia","Salvador","Recife","Fortaleza",
            // AFRICA
            "Cairo","Alexandria","Casablanca","Rabat","Marrakesh","Algiers","Tunis","Tripoli",
            "Dakar","Accra","Lagos","Abuja","Nairobi","Addis Ababa","Kampala",
            "Dar es Salaam","Johannesburg","Cape Town","Durban",
            // ASIA
            "Tokyo","Osaka","Seoul","Busan","Beijing","Shanghai","Shenzhen","Guangzhou","Chengdu",
            "Hong Kong","Taipei","Bangkok","Hanoi","Ho Chi Minh City",
            "Kuala Lumpur","Singapore","Jakarta","Manila",
            "Delhi","Mumbai","Bangalore","Chennai","Hyderabad","Kolkata",
            "Karachi","Lahore","Islamabad","Dhaka","Tehran","Baghdad",
            "Riyadh","Jeddah","Dubai","Abu Dhabi","Doha","Kuwait City",
            "Jerusalem","Tel Aviv",
            // OCEANIA
            "Sydney","Melbourne","Brisbane","Perth","Adelaide","Auckland","Wellington"
          ]
        }
      },
      blocks: [
        {opcode:"temp",     blockType:Scratch.BlockType.REPORTER, text:"temperature in [CITY]",              arguments:{CITY:{type:Scratch.ArgumentType.STRING,menu:"CITIES"}}},
        {opcode:"feels",    blockType:Scratch.BlockType.REPORTER, text:"feels like in [CITY]",               arguments:{CITY:{type:Scratch.ArgumentType.STRING,menu:"CITIES"}}},
        {opcode:"humidity", blockType:Scratch.BlockType.REPORTER, text:"humidity in [CITY]",                 arguments:{CITY:{type:Scratch.ArgumentType.STRING,menu:"CITIES"}}},
        {opcode:"wind",     blockType:Scratch.BlockType.REPORTER, text:"wind speed in [CITY]",               arguments:{CITY:{type:Scratch.ArgumentType.STRING,menu:"CITIES"}}},
        {opcode:"windDir",  blockType:Scratch.BlockType.REPORTER, text:"wind direction in [CITY]",           arguments:{CITY:{type:Scratch.ArgumentType.STRING,menu:"CITIES"}}},
        {opcode:"desc",     blockType:Scratch.BlockType.REPORTER, text:"weather description in [CITY]",      arguments:{CITY:{type:Scratch.ArgumentType.STRING,menu:"CITIES"}}},
        {opcode:"rain",     blockType:Scratch.BlockType.BOOLEAN,  text:"is it raining in [CITY]?",           arguments:{CITY:{type:Scratch.ArgumentType.STRING,menu:"CITIES"}}},
        {opcode:"snow",     blockType:Scratch.BlockType.BOOLEAN,  text:"is it snowing in [CITY]?",           arguments:{CITY:{type:Scratch.ArgumentType.STRING,menu:"CITIES"}}},
        {opcode:"tomorrow", blockType:Scratch.BlockType.REPORTER, text:"temperature tomorrow in [CITY]",     arguments:{CITY:{type:Scratch.ArgumentType.STRING,menu:"CITIES"}}},
        {opcode:"diff",     blockType:Scratch.BlockType.REPORTER, text:"temperature difference [A] vs [B]",  arguments:{A:{type:Scratch.ArgumentType.STRING,menu:"CITIES"},B:{type:Scratch.ArgumentType.STRING,menu:"CITIES"}}},
        {opcode:"hotter",   blockType:Scratch.BlockType.REPORTER, text:"hotter city between [A] and [B]",   arguments:{A:{type:Scratch.ArgumentType.STRING,menu:"CITIES"},B:{type:Scratch.ArgumentType.STRING,menu:"CITIES"}}}
      ]
    };
  }

  async geo(city) {
    if (this._geoCache[city]) return this._geoCache[city];
    const r = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`);
    const data = (await r.json()).results?.[0] ?? null;
    this._geoCache[city] = data;
    return data;
  }

  async weather(city) {
    // FIX: cache weather results to avoid duplicate API calls per block
    if (this._weatherCache[city]) return this._weatherCache[city];
    const g = await this.geo(city);
    if (!g) return null;
    const r = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${g.latitude}&longitude=${g.longitude}` +
      `&hourly=temperature_2m,relativehumidity_2m,apparent_temperature&current_weather=true`
    );
    const data = await r.json();
    this._weatherCache[city] = data;
    // Cache expires after 10 minutes
    setTimeout(() => { delete this._weatherCache[city]; }, 600000);
    return data;
  }

  // FIX: get the current hour index to read correct hourly value (not always index 0)
  _currentHourIndex(data) {
    if (!data?.hourly?.time) return 0;
    const now = new Date().toISOString().substring(0, 13); // "YYYY-MM-DDTHH"
    const idx = data.hourly.time.findIndex(t => t.startsWith(now));
    return idx >= 0 ? idx : 0;
  }

  async temp(a)  { return (await this.weather(a.CITY))?.current_weather?.temperature ?? "N/A"; }

  // FIX: use current hour index instead of always index 0
  async feels(a) {
    const w = await this.weather(a.CITY);
    if (!w) return "N/A";
    return w.hourly?.apparent_temperature?.[this._currentHourIndex(w)] ?? "N/A";
  }

  async humidity(a) {
    const w = await this.weather(a.CITY);
    if (!w) return "N/A";
    return w.hourly?.relativehumidity_2m?.[this._currentHourIndex(w)] ?? "N/A";
  }

  async wind(a)    { return (await this.weather(a.CITY))?.current_weather?.windspeed    ?? "N/A"; }
  async windDir(a) { return (await this.weather(a.CITY))?.current_weather?.winddirection ?? "N/A"; }

  async desc(a) {
    const c = (await this.weather(a.CITY))?.current_weather?.weathercode;
    if (c === undefined) return "N/A";
    if (c === 0) return "clear";
    if (c <= 3)  return "cloudy";
    if (c >= 51 && c <= 67) return "rain";
    if (c >= 71 && c <= 77) return "snow";
    if (c >= 80 && c <= 82) return "showers";
    if (c >= 95) return "thunderstorm";
    return "unknown";
  }

  async rain(a) { const c = (await this.weather(a.CITY))?.current_weather?.weathercode; return c >= 51 && c <= 67; }
  async snow(a) { const c = (await this.weather(a.CITY))?.current_weather?.weathercode; return c >= 71 && c <= 77; }

  // FIX: use index 24 only if available, otherwise last available hour
  async tomorrow(a) {
    const w = await this.weather(a.CITY);
    const temps = w?.hourly?.temperature_2m;
    if (!temps) return "N/A";
    return temps[Math.min(24, temps.length - 1)] ?? "N/A";
  }

  async diff(a)   {
    const tA = await this.temp({CITY: a.A});
    const tB = await this.temp({CITY: a.B});
    if (tA === "N/A" || tB === "N/A") return "N/A";
    return (tA - tB).toFixed(1);
  }

  async hotter(a) {
    const d = await this.diff(a);
    if (d === "N/A") return "N/A";
    return d > 0 ? a.A : a.B;
  }
}

Scratch.extensions.register(new WeatherUltraPlus());
