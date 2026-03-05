class InternetDeviceUltra {
  getInfo() {
    return {
      id: "internetdeviceultra",
      name: "Internet & Device",
      color1: "#e67e22",
      color2: "#f0b27a",
      color3: "#a04000",
      blocks: [
        {opcode:"online",       blockType:Scratch.BlockType.BOOLEAN,  text:"is online?"},
        {opcode:"browser",      blockType:Scratch.BlockType.REPORTER, text:"browser name"},
        {opcode:"version",      blockType:Scratch.BlockType.REPORTER, text:"browser version"},
        {opcode:"platform",     blockType:Scratch.BlockType.REPORTER, text:"platform"},
        {opcode:"ua",           blockType:Scratch.BlockType.REPORTER, text:"user agent"},
        {opcode:"cores",        blockType:Scratch.BlockType.REPORTER, text:"cpu cores"},
        {opcode:"memory",       blockType:Scratch.BlockType.REPORTER, text:"device memory (GB)"},
        {opcode:"width",        blockType:Scratch.BlockType.REPORTER, text:"screen width"},
        {opcode:"height",       blockType:Scratch.BlockType.REPORTER, text:"screen height"},
        {opcode:"dpr",          blockType:Scratch.BlockType.REPORTER, text:"device pixel ratio"},
        {opcode:"orientation",  blockType:Scratch.BlockType.REPORTER, text:"screen orientation"},
        {opcode:"timezone",     blockType:Scratch.BlockType.REPORTER, text:"timezone"},
        {opcode:"language",     blockType:Scratch.BlockType.REPORTER, text:"language"},
        {opcode:"languages",    blockType:Scratch.BlockType.REPORTER, text:"languages list"},
        {opcode:"touch",        blockType:Scratch.BlockType.BOOLEAN,  text:"touch supported?"},
        {opcode:"touchPoints",  blockType:Scratch.BlockType.REPORTER, text:"max touch points"},
        {opcode:"battery",      blockType:Scratch.BlockType.REPORTER, text:"battery level (%)"},
        {opcode:"charging",     blockType:Scratch.BlockType.BOOLEAN,  text:"is charging?"}
      ]
    };
  }

  online() { return navigator.onLine; }

  // FIX: improved browser detection with fallback parsing from userAgent string
  browser() {
    if (navigator.userAgentData?.brands) {
      // Filter out generic "Not A Brand" entries
      const brand = navigator.userAgentData.brands.find(b => !b.brand.includes("Not"));
      if (brand) return brand.brand;
    }
    // Fallback: parse userAgent string
    const ua = navigator.userAgent;
    if (ua.includes("Firefox")) return "Firefox";
    if (ua.includes("Edg")) return "Edge";
    if (ua.includes("Chrome")) return "Chrome";
    if (ua.includes("Safari")) return "Safari";
    return "Unknown";
  }

  version() {
    if (navigator.userAgentData?.brands) {
      const brand = navigator.userAgentData.brands.find(b => !b.brand.includes("Not"));
      if (brand) return brand.version;
    }
    // Fallback: extract version from userAgent
    const ua = navigator.userAgent;
    const match = ua.match(/(Firefox|Edg|Chrome|Safari)\/(\d+)/);
    return match ? match[2] : "Unknown";
  }

  platform()    { return navigator.platform; }
  ua()          { return navigator.userAgent; }
  cores()       { return navigator.hardwareConcurrency || "N/A"; }
  memory()      { return navigator.deviceMemory || "N/A"; }
  width()       { return screen.width; }
  height()      { return screen.height; }
  dpr()         { return window.devicePixelRatio; }
  orientation() { return screen.orientation?.type || "unknown"; }
  timezone()    { return Intl.DateTimeFormat().resolvedOptions().timeZone; }
  language()    { return navigator.language; }
  languages()   { return navigator.languages.join(","); }
  touch()       { return "ontouchstart" in window; }
  touchPoints() { return navigator.maxTouchPoints || 0; }

  // FIX: added try/catch - getBattery() not available on Firefox/Safari
  async battery() {
    try {
      const b = await navigator.getBattery();
      return Math.round(b.level * 100);
    } catch {
      return "N/A";
    }
  }

  async charging() {
    try {
      const b = await navigator.getBattery();
      return b.charging;
    } catch {
      return false;
    }
  }
}

Scratch.extensions.register(new InternetDeviceUltra());
