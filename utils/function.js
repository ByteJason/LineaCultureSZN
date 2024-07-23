const {ethers, formatEther, formatUnits} = require('ethers');
const {createLogger, transports, format} = require('winston');
const path = require("path");

/**
 * 睡眠
 * @param seconds
 * @returns {Promise<unknown>}
 */
const sleep = (seconds) => {
    const milliseconds = seconds * 1000;
    return new Promise(resolve => setTimeout(resolve, milliseconds));
};

/**
 * 随机数
 * @param min
 * @param max
 * @returns {number}
 */
function randomNumber(min, max) {
    min = parseInt(min)
    max = parseInt(max)
    // 确保 min 小于等于 max
    if (min > max) {
        [min, max] = [max, min];
    }

    // 计算生成随机整数的范围
    const range = max - min + 1;

    // 生成随机数并将其映射到指定范围内
    return Math.floor(Math.random() * range) + min;
}

/**
 * 打乱数组
 * @param arr
 */
function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1)); //生成[0, i]之间的随机索引
        [arr[i], arr[j]] = [arr[j], arr[i]]; //交换位置
    }
}

/**
 * 获取当前时间
 * @returns {string}
 */
function getCurrentDateTime() {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // 月份从0开始，需要加1
    const day = String(currentDate.getDate()).padStart(2, '0');
    const hours = String(currentDate.getHours()).padStart(2, '0');
    const minutes = String(currentDate.getMinutes()).padStart(2, '0');
    const seconds = String(currentDate.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}


async function mintByHexAndVal(wallet, contractAddress, hexData, value = null, retry = 10) {

}


async function gasRun(maxGas, fun, params) {
    let gas = 0;
    let i = 0;
    while ((gas = await getGas()) >= maxGas) {
        if (i === 10 || i === 100 || i === 500 || i % 1000 === 0) {
            dd(getCurrentDateTime() + ` gas为: ${gas} Gwei, 当gas降低到小于 ${maxGas} Gwei时执行任务`, 'warning');
        }
        i++;
        await sleep(5);
    }

    fun(...params)
}


function dd(msg, level = 'info') {
    let formattedMsg = '';

    // 检查参数的类型
    if (typeof msg === 'string' || typeof msg === 'number' || typeof msg === 'boolean') {
        // 如果是字符串、数字或布尔值，直接添加到格式化后的消息中
        formattedMsg += msg;
    } else if (Array.isArray(msg)) {
        // 如果是数组，将数组元素格式化后拼接成字符串
        formattedMsg += msg.map(item => JSON.stringify(item)).join(', ');
    } else if (typeof msg === 'object' && msg !== null) {
        // 如果是对象，将对象转换为字符串格式
        formattedMsg += JSON.stringify(msg);
    }

    formattedMsg = getCurrentDateTime() + ' ' + formattedMsg

    switch (level) {
        case 'success':
            console.log(`\x1b[32m${formattedMsg}\x1b[39m`);
            break;
        default:
        case 'info':
            console.log(`\x1b[34m${formattedMsg}\x1b[39m`);
            break;
        case 'error':
            console.log(`\x1b[41m${formattedMsg}\x1b[49m`);
            break;
        case 'warning':
            console.log(`\x1b[33m${formattedMsg}\x1b[39m`);
            break;
    }
}

/**
 * 获取今日开始和结束的时间戳
 * @returns {number[]}
 */
function getTodayTimestamp() {
    // 获取今天的开始时间戳
    let startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    let startTimestamp = startOfToday.getTime();

    // 获取今天的结束时间戳
    let endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);
    let endTimestamp = endOfToday.getTime();

    return [Math.floor(startTimestamp / 1000), Math.floor(endTimestamp / 1000)];
}

function shortAddress(address, num = 4) {
    if (address.length <= num * 2) {
        return address;
    } else {
        // 截取前4位和后4位，中间用"***"代替
        return address.slice(0, num + 2) + "***" + address.slice(-num);
    }
}

function logger() {
    const path = require('path');
    // 自定义日志级别，包括 success
    const customLevels = {
        levels: {
            error: 0,
            warn: 1,
            info: 2,
            success: 3,

            http: 4,
            verbose: 5,
            debug: 6,
            silly: 7
        },
        colors: {
            error: 'red',
            warn: 'yellow',
            info: 'blue',
            success: 'green',
            http: 'magenta',
            verbose: 'cyan',
            debug: 'white',
            silly: 'grey'
        }
    };

    const newLogger = createLogger({
        levels: customLevels.levels,
        format: format.combine(
            format.timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
            format.printf(info => `${info.timestamp} | ${info.level}: ${info.message}`)
        ),
        transports: [
            new transports.Console({
                level: 'success',
                format: format.combine(
                    format.colorize(),
                    format.printf(info => `${info.timestamp} | ${info.level}: ${info.message}`)
                )
            }),
            new transports.File({
                filename: path.join(process.cwd(), 'logs', 'app.log'),
                level: 'success',
                format: format.combine(
                    format.uncolorize(),
                    format.json()
                ),
                maxsize: 5242880, // 5MB
                maxFiles: 5,
            })
        ]
    });

    // 添加颜色
    require('winston').addColors(customLevels.colors);

    return newLogger;
}

module.exports = {
    sleep,
    randomNumber,
    shuffle,
    getCurrentDateTime,
    mintByHexAndVal,
    dd,
    logger,
    getTodayTimestamp,
    shortAddress,
}

