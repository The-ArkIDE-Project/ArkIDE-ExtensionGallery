class TimeCalendarUltra {
  getInfo() {
    return {
      id: "timecalendarultra",
      name: "Time & Calendar",
      color1: "#f57c00",
      color2: "#ffb74d",
      color3: "#e65100",
      blocks: [
        {opcode:"timestamp",   blockType:Scratch.BlockType.REPORTER, text:"current timestamp"},
        {opcode:"millis",      blockType:Scratch.BlockType.REPORTER, text:"current milliseconds"},
        {opcode:"date",        blockType:Scratch.BlockType.REPORTER, text:"current date"},
        {opcode:"time",        blockType:Scratch.BlockType.REPORTER, text:"current time"},
        {opcode:"year",        blockType:Scratch.BlockType.REPORTER, text:"current year"},
        {opcode:"month",       blockType:Scratch.BlockType.REPORTER, text:"current month"},
        {opcode:"day",         blockType:Scratch.BlockType.REPORTER, text:"current day"},
        {opcode:"hour",        blockType:Scratch.BlockType.REPORTER, text:"current hour"},
        {opcode:"minute",      blockType:Scratch.BlockType.REPORTER, text:"current minute"},
        {opcode:"second",      blockType:Scratch.BlockType.REPORTER, text:"current second"},
        {opcode:"weekday",     blockType:Scratch.BlockType.REPORTER, text:"day of week"},
        {opcode:"weekend",     blockType:Scratch.BlockType.BOOLEAN,  text:"is weekend?"},
        {opcode:"morning",     blockType:Scratch.BlockType.BOOLEAN,  text:"is morning?"},
        {opcode:"afternoon",   blockType:Scratch.BlockType.BOOLEAN,  text:"is afternoon?"},
        {opcode:"night",       blockType:Scratch.BlockType.BOOLEAN,  text:"is night?"},
        {opcode:"leap",        blockType:Scratch.BlockType.BOOLEAN,  text:"is leap year [YEAR]?",            arguments:{YEAR:{type:Scratch.ArgumentType.NUMBER}}},
        {opcode:"daysbetween", blockType:Scratch.BlockType.REPORTER, text:"days between [A] and [B]",        arguments:{A:{type:Scratch.ArgumentType.STRING},B:{type:Scratch.ArgumentType.STRING}}},
        {opcode:"adddays",     blockType:Scratch.BlockType.REPORTER, text:"add days [N] to date [D]",        arguments:{N:{type:Scratch.ArgumentType.NUMBER},D:{type:Scratch.ArgumentType.STRING}}},
        {opcode:"addmonths",   blockType:Scratch.BlockType.REPORTER, text:"add months [N] to date [D]",      arguments:{N:{type:Scratch.ArgumentType.NUMBER},D:{type:Scratch.ArgumentType.STRING}}},
        {opcode:"addyears",    blockType:Scratch.BlockType.REPORTER, text:"add years [N] to date [D]",       arguments:{N:{type:Scratch.ArgumentType.NUMBER},D:{type:Scratch.ArgumentType.STRING}}},
        {opcode:"age",         blockType:Scratch.BlockType.REPORTER, text:"age from birthdate [D]",          arguments:{D:{type:Scratch.ArgumentType.STRING}}},
        {opcode:"daysinmonth", blockType:Scratch.BlockType.REPORTER, text:"days in month [M] year [Y]",      arguments:{M:{type:Scratch.ArgumentType.NUMBER},Y:{type:Scratch.ArgumentType.NUMBER}}},
        {opcode:"timezone",    blockType:Scratch.BlockType.REPORTER, text:"current timezone"},
        {opcode:"tzone",       blockType:Scratch.BlockType.REPORTER, text:"time in timezone [Z]",            arguments:{Z:{type:Scratch.ArgumentType.STRING}}},
        {opcode:"dzone",       blockType:Scratch.BlockType.REPORTER, text:"date in timezone [Z]",            arguments:{Z:{type:Scratch.ArgumentType.STRING}}},
        {opcode:"iso",         blockType:Scratch.BlockType.REPORTER, text:"iso date"},
        {opcode:"julian",      blockType:Scratch.BlockType.REPORTER, text:"julian day number"},
        {opcode:"dst",         blockType:Scratch.BlockType.BOOLEAN,  text:"is daylight saving time?"}
      ]
    };
  }

  now()        { return new Date(); }
  timestamp()  { return Math.floor(Date.now() / 1000); }
  millis()     { return Date.now(); }
  date()       { return this.now().toISOString().split("T")[0]; }
  time()       { return this.now().toTimeString().split(" ")[0]; }
  year()       { return this.now().getFullYear(); }
  month()      { return this.now().getMonth() + 1; }
  day()        { return this.now().getDate(); }
  hour()       { return this.now().getHours(); }
  minute()     { return this.now().getMinutes(); }
  second()     { return this.now().getSeconds(); }
  weekday()    { return this.now().toLocaleDateString("en", { weekday: "long" }); }
  weekend()    { return [0, 6].includes(this.now().getDay()); }
  morning()    { const h = this.hour(); return h >= 5  && h < 12; }
  afternoon()  { const h = this.hour(); return h >= 12 && h < 18; }
  night()      { const h = this.hour(); return h >= 18 || h < 5; }
  leap(a)      { return (a.YEAR % 4 === 0 && a.YEAR % 100 !== 0) || a.YEAR % 400 === 0; }

  daysbetween(a) {
    const diff = new Date(a.B) - new Date(a.A);
    return Math.abs(Math.floor(diff / 86400000));
  }

  adddays(a)   { const d = new Date(a.D); d.setDate(d.getDate() + Number(a.N));             return d.toISOString().split("T")[0]; }
  addmonths(a) { const d = new Date(a.D); d.setMonth(d.getMonth() + Number(a.N));           return d.toISOString().split("T")[0]; }
  addyears(a)  { const d = new Date(a.D); d.setFullYear(d.getFullYear() + Number(a.N));     return d.toISOString().split("T")[0]; }

  // FIX: precise age calculation accounting for month and day (not just year difference)
  age(a) {
    const birth = new Date(a.D);
    const today = this.now();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }

  daysinmonth(a) { return new Date(a.Y, a.M, 0).getDate(); }
  timezone()     { return Intl.DateTimeFormat().resolvedOptions().timeZone; }
  tzone(a)       { return new Date().toLocaleTimeString("en", { timeZone: a.Z }); }
  dzone(a)       { return new Date().toLocaleDateString("en", { timeZone: a.Z }); }
  iso()          { return this.now().toISOString(); }
  julian()       { return Math.floor((Date.now() / 86400000) + 2440587.5); }
  dst() {
    const jan = new Date(this.year(), 0, 1);
    const jul = new Date(this.year(), 6, 1);
    return Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset()) !== this.now().getTimezoneOffset();
  }
}

Scratch.extensions.register(new TimeCalendarUltra());
