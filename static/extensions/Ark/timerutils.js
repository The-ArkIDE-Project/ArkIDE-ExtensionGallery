(function(Scratch) {
  'use strict';

  class CountdownExtension {
    getInfo() {
      return {
        id: 'countdowntimer',
        name: 'Countdown Timer',
        color1: '#4875fe',
        color2: '#4875fe',
        color3: '#4875fe',
        blocks: [
          {
            opcode: 'timeUntilDate',
            blockType: Scratch.BlockType.REPORTER,
            text: 'time until [DATE] in [UNIT]',
            arguments: {
              DATE: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: '2025-12-31'
              },
              UNIT: {
                type: Scratch.ArgumentType.STRING,
                menu: 'timeUnits'
              }
            }
          },
          {
            opcode: 'timeBetweenDates',
            blockType: Scratch.BlockType.REPORTER,
            text: 'time from [START] to [END] in [UNIT]',
            arguments: {
              START: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: '2025-01-01'
              },
              END: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: '2025-12-31'
              },
              UNIT: {
                type: Scratch.ArgumentType.STRING,
                menu: 'timeUnits'
              }
            }
          },
          {
            opcode: 'daysUntil',
            blockType: Scratch.BlockType.REPORTER,
            text: 'days until [DATE]',
            arguments: {
              DATE: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: '2025-12-31'
              }
            }
          },
          {
            opcode: 'hoursUntil',
            blockType: Scratch.BlockType.REPORTER,
            text: 'hours until [DATE]',
            arguments: {
              DATE: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: '2025-12-31'
              }
            }
          },
          {
            opcode: 'minutesUntil',
            blockType: Scratch.BlockType.REPORTER,
            text: 'minutes until [DATE]',
            arguments: {
              DATE: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: '2025-12-31'
              }
            }
          },
          {
            opcode: 'secondsUntil',
            blockType: Scratch.BlockType.REPORTER,
            text: 'seconds until [DATE]',
            arguments: {
              DATE: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: '2025-12-31'
              }
            }
          },
          {
            opcode: 'millisecondsUntil',
            blockType: Scratch.BlockType.REPORTER,
            text: 'milliseconds until [DATE]',
            arguments: {
              DATE: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: '2025-12-31'
              }
            }
          },
          '---',
          {
            opcode: 'formatCountdown',
            blockType: Scratch.BlockType.REPORTER,
            text: 'format countdown to [DATE] as [FORMAT]',
            arguments: {
              DATE: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: '2025-12-31'
              },
              FORMAT: {
                type: Scratch.ArgumentType.STRING,
                menu: 'formatOptions'
              }
            }
          },
          {
            opcode: 'customFormat',
            blockType: Scratch.BlockType.REPORTER,
            text: 'countdown to [DATE]: [D]d [H]h [M]m [S]s',
            arguments: {
              DATE: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: '2025-12-31'
              },
              D: {
                type: Scratch.ArgumentType.STRING,
                menu: 'boolMenu',
                defaultValue: 'show'
              },
              H: {
                type: Scratch.ArgumentType.STRING,
                menu: 'boolMenu',
                defaultValue: 'show'
              },
              M: {
                type: Scratch.ArgumentType.STRING,
                menu: 'boolMenu',
                defaultValue: 'show'
              },
              S: {
                type: Scratch.ArgumentType.STRING,
                menu: 'boolMenu',
                defaultValue: 'show'
              }
            }
          },
          '---',
          {
            opcode: 'currentTimestamp',
            blockType: Scratch.BlockType.REPORTER,
            text: 'current timestamp (ms)'
          },
          {
            opcode: 'dateToTimestamp',
            blockType: Scratch.BlockType.REPORTER,
            text: 'timestamp of [DATE]',
            arguments: {
              DATE: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: '2025-12-31'
              }
            }
          },
          {
            opcode: 'isDatePast',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'is [DATE] in the past?',
            arguments: {
              DATE: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: '2025-12-31'
              }
            }
          },
          {
            opcode: 'isDateFuture',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'is [DATE] in the future?',
            arguments: {
              DATE: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: '2025-12-31'
              }
            }
          }
        ],
        menus: {
          timeUnits: {
            acceptReporters: true,
            items: ['milliseconds', 'seconds', 'minutes', 'hours', 'days', 'weeks', 'months', 'years']
          },
          formatOptions: {
            acceptReporters: true,
            items: ['D:H:M:S', 'D days H hours', 'Full', 'Compact']
          },
          boolMenu: {
            acceptReporters: false,
            items: ['show', 'hide']
          }
        }
      };
    }

    parseDate(dateStr) {
      // Check if the input is just a date (YYYY-MM-DD format) without time
      const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(dateStr.trim());
      
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        return null;
      }
      
      // If it's a date-only input, set to end of that day
      if (dateOnly) {
        date.setHours(23, 59, 59, 999);
      }
      
      return date;
    }

    getTimeDifference(date1, date2) {
      return date2.getTime() - date1.getTime();
    }

    timeUntilDate(args) {
      const targetDate = this.parseDate(args.DATE);
      if (!targetDate) return 'Invalid date';
      
      const now = new Date();
      const diff = this.getTimeDifference(now, targetDate);
      
      return this.convertTime(diff, args.UNIT);
    }

    timeBetweenDates(args) {
      const startDate = this.parseDate(args.START);
      const endDate = this.parseDate(args.END);
      
      if (!startDate || !endDate) return 'Invalid date';
      
      const diff = this.getTimeDifference(startDate, endDate);
      
      return this.convertTime(diff, args.UNIT);
    }

    convertTime(ms, unit) {
      const absMs = Math.abs(ms);
      const sign = ms < 0 ? -1 : 1;
      
      switch(unit.toLowerCase()) {
        case 'milliseconds':
          return ms;
        case 'seconds':
          return sign * Math.floor(absMs / 1000);
        case 'minutes':
          return sign * Math.floor(absMs / (1000 * 60));
        case 'hours':
          return sign * Math.floor(absMs / (1000 * 60 * 60));
        case 'days':
          return sign * Math.floor(absMs / (1000 * 60 * 60 * 24));
        case 'weeks':
          return sign * Math.floor(absMs / (1000 * 60 * 60 * 24 * 7));
        case 'months':
          return sign * Math.floor(absMs / (1000 * 60 * 60 * 24 * 30.44));
        case 'years':
          return sign * Math.floor(absMs / (1000 * 60 * 60 * 24 * 365.25));
        default:
          return ms;
      }
    }

    daysUntil(args) {
      return this.timeUntilDate({DATE: args.DATE, UNIT: 'days'});
    }

    hoursUntil(args) {
      return this.timeUntilDate({DATE: args.DATE, UNIT: 'hours'});
    }

    minutesUntil(args) {
      return this.timeUntilDate({DATE: args.DATE, UNIT: 'minutes'});
    }

    secondsUntil(args) {
      return this.timeUntilDate({DATE: args.DATE, UNIT: 'seconds'});
    }

    millisecondsUntil(args) {
      return this.timeUntilDate({DATE: args.DATE, UNIT: 'milliseconds'});
    }

    formatCountdown(args) {
      const targetDate = this.parseDate(args.DATE);
      if (!targetDate) return 'Invalid date';
      
      const now = new Date();
      const diff = this.getTimeDifference(now, targetDate);
      const absMs = Math.abs(diff);
      
      const days = Math.floor(absMs / (1000 * 60 * 60 * 24));
      const hours = Math.floor((absMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((absMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((absMs % (1000 * 60)) / 1000);
      
      const sign = diff < 0 ? '-' : '';
      
      switch(args.FORMAT) {
        case 'D:H:M:S':
          return `${sign}${days}:${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        case 'D days H hours':
          return `${sign}${days} days ${hours} hours`;
        case 'Full':
          return `${sign}${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds`;
        case 'Compact':
          return `${sign}${days}d ${hours}h ${minutes}m ${seconds}s`;
        default:
          return `${sign}${days}:${hours}:${minutes}:${seconds}`;
      }
    }

    customFormat(args) {
      const targetDate = this.parseDate(args.DATE);
      if (!targetDate) return 'Invalid date';
      
      const now = new Date();
      const diff = this.getTimeDifference(now, targetDate);
      const absMs = Math.abs(diff);
      
      const days = Math.floor(absMs / (1000 * 60 * 60 * 24));
      const hours = Math.floor((absMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((absMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((absMs % (1000 * 60)) / 1000);
      
      const sign = diff < 0 ? '-' : '';
      let result = sign;
      
      if (args.D === 'show') result += `${days}d `;
      if (args.H === 'show') result += `${hours}h `;
      if (args.M === 'show') result += `${minutes}m `;
      if (args.S === 'show') result += `${seconds}s`;
      
      return result.trim();
    }

    currentTimestamp() {
      return Date.now();
    }

    dateToTimestamp(args) {
      const date = this.parseDate(args.DATE);
      if (!date) return 'Invalid date';
      return date.getTime();
    }

    isDatePast(args) {
      const date = this.parseDate(args.DATE);
      if (!date) return false;
      return date.getTime() < Date.now();
    }

    isDateFuture(args) {
      const date = this.parseDate(args.DATE);
      if (!date) return false;
      return date.getTime() > Date.now();
    }
  }

  Scratch.extensions.register(new CountdownExtension());
})(Scratch);