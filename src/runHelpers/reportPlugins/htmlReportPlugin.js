let AbstractReportPlugin = require('./abstractReportPlugin.js');

let fs = require('fs');
let path = require('path');

/**
 * A report plugin to produce HTML cucumber reports
 * @augments {AbstractReportPlugin}
 */
class HTMLReportPlugin extends AbstractReportPlugin {
    /** @inheritDoc */
    get pluginName() {return 'html';}

    /** @inheritDoc */
    produceReport(config, runResult){
        let Report = require('cucumber-html-report');
        
        /** @type {{reportPath, reportTitle}} */
        let reporterConfiguration = this.getReporterConfiguration(config);

        let reportFile = reporterConfiguration.reportPath;
        let sourceFile = config.testRunner.cucumber.resultFile;

        if (!reportFile || !sourceFile) return Promise.resolve();

        let options = {
            source:    sourceFile,
            dest:      path.dirname(reportFile),
            name:      path.basename(reportFile),
            title:     reporterConfiguration.reportTitle
        };

        if (runResult.isCatastrophic) return HTMLReportPlugin._createCatastrophicFailureHTMLReport(reportFile, runResult.stderr);
        
        console.log(`\nProducing HTML report to ${reportFile}\n`);

        return new Promise((resolve, reject) => {
            return Report.create(options)
                .then(res => resolve(res))
                .catch(e => reject(e));
        });
    }


    /**
     * Creates an HTML report for catastrophic failures
     * @param {string} reportPath Target report path
     * @param {string} stderr The run stderr stream output
     * @private
     */
    static _createCatastrophicFailureHTMLReport(reportPath, stderr){

        let html = `<!DOCTYPE html>
                    <html lang="en">
                        <head>
                            <meta charset="utf-8">
                            <style>
                                table {
                                    border-collapse: collapse;
                                    border: 2px black solid;
                                    font: 12px sans-serif;
                                }
                    
                                td {
                                    border: 1px black solid;
                                    padding: 5px;
                                }
                                th {
                                    padding-left: 10px;
                                    padding-right: 10px;
                                }
                            </style>
                        </head>
                        <body>`;

        html += `<h1>Cucumber Catastrophic Failure Report</h1>
                <h2>This cucumber run could not be performed due to a severe failure:</h2>
                <div style="margin:20px;">${stderr}</div>`;

        html += '</body></html>';

        fs.writeFileSync(reportPath, html);

        return true;
    }

}

module.exports = HTMLReportPlugin;