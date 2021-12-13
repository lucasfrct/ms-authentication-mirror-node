require('events').EventEmitter.defaultMaxListeners = Infinity; 

const { ConsoleConfig, ConsoleColors, ConsoleBgColors } = require("./console-config");

const Logger = class Logger {

    layout = {
        border: "##===================================================================================================================================##",
        line: "*--------------------------------------------------------------------------------------------------------------------------------------",
        titleColor: ConsoleConfig.Reset,
        textColor: ConsoleConfig.Reset,
        strongColor: ConsoleConfig.Reset,
        lineColor:  ConsoleConfig.Reset,
        borderColor: ConsoleConfig.Reset,
    }

    registers = [];

    constructor() {}

    title(title = "") {
        console.log(this.layout.borderColor, this.tpm(title, this.layout.border), ConsoleConfig.Reset);
    }

    line() {
        console.log(this.layout.borderColor, this.layout.line, ConsoleConfig.Reset);
    }

    border() {
        console.log(this.layout.borderColor, this.layout.border, ConsoleConfig.Reset);
    }

    tpm(text = "", base = "") {
        const lenT = text.length + 2;
        const len = base.length;
        const diff = Math.abs(len - lenT);
        const mid = Math.round( diff / 2);
        const startPart2 = (len - mid);
        const part1 = base.substring(0, mid);
        const part2 = base.substring(len, startPart2);
        return `${part1} ${text} ${part2}`;
    }

    reset() {
        this.layout.titleColor = ConsoleConfig.Reset;
        this.layout.textColor = ConsoleConfig.Reset;
        this.layout.strongColor = ConsoleConfig.Reset;
        this.layout.lineColor =  ConsoleConfig.Reset;
        this.layout.borderColor = ConsoleConfig.Reset;
    }

    paragraph(text = "", color = "") {
        color = color || this.layout.lineColor;
        String(text).split("\n").forEach((line)=> {
            console.log(this.layout.borderColor, "* ", color, line, ConsoleConfig.Reset);
        });
    }

    strong(text = "",  color = "") {
        color = color || this.defaultColor;
        text.split("\n").forEach((line)=> {
            console.error(this.currentColor, '* >>> ', color, line, this.defaultColor);
        });
    }

    message(log) {
        this.registers.push(log);
        this.layout.borderColor = ConsoleColors.Yellow;
        this.title("Log Message")
        this.paragraph(log.message);
        this.border();
    }

    error(log){
        this.registers.push(log);
        this.layout.borderColor = ConsoleColors.Red;
        this.title("Log Error")
        this.paragraph(log.message);
        this.border();
    }

    info(log) {
        this.registers.push(log);
        this.layout.borderColor = ConsoleColors.Cyan;
        this.title("Log Info")
        this.paragraph(log.message);
        this.border();
    }

    warn(log) {
        this.registers.push(log);
        this.layout.borderColor = ConsoleColors.Cyan;
        this.title("Log Warn")
        this.paragraph(log.message);
        this.border();
    }

    verbose(log) {
        this.registers.push(log);
        this.layout.borderColor = ConsoleColors.Cyan;
        this.title("Log Verbose")
        this.paragraph(log.message);
        this.border();
    }

    debug(log) {
        this.registers.push(log);
        this.layout.borderColor = ConsoleColors.Cyan;
        this.title("Log Info")
        this.paragraph(log.message);
        this.border();
    }

    silly(log) {
        this.registers.push(log);
        this.layout.borderColor = ConsoleColors.Cyan;
        this.title("Log Info")
        this.paragraph(log.message);
        this.border();
    }

}

module.exports = new Logger();