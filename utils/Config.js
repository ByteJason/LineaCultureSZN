const fs = require("fs");
const yaml = require('js-yaml');

class Config {
    data = [];

    constructor(filePath = "config.yaml") {
        // TODO: proxy 需要处理
        this.data = yaml.load(fs.readFileSync(filePath, 'utf8'));
    }
}

module.exports = Config;
