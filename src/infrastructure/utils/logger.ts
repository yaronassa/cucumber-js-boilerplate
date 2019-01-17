import {InfrastructureObject} from "../infrastructureObject";
import {Logger as WinstonLogger, LoggerOptions} from "winston";
const winston = require('winston');
const moment = require('moment');

class Logger extends InfrastructureObject {

    // TODO:IMPLEMENT_ME - You may want your own infrastructure

    private engine: WinstonLogger;

    constructor() {
        super();
    }

    public async beforeRun() {
        this.initLogger();
    }

    public writeToLog(level: 'info'|'error', message: string, indentLevel: number = 2) {
        this.engine.log(level, message, {indentLevel});
    }

    private initLogger() {

        const loggerOptions: LoggerOptions = {
            format: winston.format.combine(
                winston.format.align(),
                winston.format.printf(info => `${moment().format('DD/MM/YY-HH:mm:ss')}\t${info.level}\t${info.message}`)
            ),
            transports: [
                new winston.transports.File({filename: `${this.infra.workPath}/log.log`, level: 'verbose'}),
                new winston.transports.File({filename: `${this.infra.workPath}/errors.log`, level: 'error'}),
                new winston.transports.Console({level: 'verbose', format: winston.format.printf(info => {
                    return info.message
                        .split('\n')
                        .map(line => `${' '.repeat(info.indentLevel * 3)}${line}`)
                        .join('\n');
                })})
            ]
        };
        this.engine = winston.createLogger(loggerOptions);

        this.log('Infrastructure logger initialized', 0);
    }
}

export {Logger};
