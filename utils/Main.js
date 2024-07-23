const Config = require("./Config");
const AddressData = require("./AddressData");
const EthersClient = require("./EthersClient");
const {
    dd, sleep, randomNumber,
    shuffle, getCurrentDateTime
} = require("./function");
const {ethers} = require("ethers");

class Main {
    startTime = 0;
    endTime = 0;
    ConfigObj = null;
    config = [];
    AddressDataObj = null;
    EthersObj = null;
    chainConfig = {};

    constructor(chain = "linea", walletPath = "./wallet.csv") {
        this.startTime = performance.now();

        this.ConfigObj = new Config();
        this.config = this.ConfigObj.data;
        this.AddressDataObj = new AddressData(walletPath);
        this.chainConfig = this.config.chain[chain];
        this.EthersObj = new EthersClient(this.chainConfig);
    }

    async starkPrompt(count, config) {
        dd(`钱包总数: ${count}`);
        config && config.access && dd(`账号随机间隔: ${config.access.second_min} ~ ${config.access.second_max} 秒`);
        //dd(`执行任务最高gas: ${this.chainConfig.max_gas} Gwei, 当前: ` + await this.EthersObj.getGas() + ' Gwei');
        //dd(`当前Gas: ` + await this.EthersObj.getGas() + ' Gwei');
    }

    async isSkip(params = {
        checkContract: true,
        address: '',
        contractAddress: '',
        funHex: '',
    }) {
        if (params.checkContract && params.address && params.contractAddress
            && await this.EthersObj.checkContractInteraction(params.address, params.contractAddress, params.funHex) > 0) {
            dd(`${params.address} 已经交互过合约 ${params.contractAddress} 现跳过该地址执行下一个钱包`, 'warning');
            return true;
        }
        return false;
    }

    async lineaRun(fun) {
        const addressData = await this.AddressDataObj.load();
        await this.starkPrompt(addressData.length, this.config.linea_park);

        this.config.linea.upset && shuffle(addressData);

        await fun(addressData);
    }

    async sendTransaction(wallet, contractAddress, hexData, value = null, addGasPrice = "0.0", retry = 0) {
        const address = await wallet.getAddress();
        try {
            const data = {
                to: contractAddress,
                data: hexData,
            };
            if (addGasPrice > 0) {
                const maxGasPrice = await this.EthersObj.getMaxGas('wei');
                data.gasPrice = maxGasPrice + ethers.parseUnits(addGasPrice.toString(),9);
            }
            if (value !== null) {
                data.value = ethers.parseEther(value);
            }
            const tx = await wallet.sendTransaction(data);

            dd(getCurrentDateTime() + ` ${address} Pending TX: ${tx.hash}`, 'info')
            // try {
            //     await tx.wait();
            // } catch (error) {
            // }
            // dd(getCurrentDateTime() + ` ${address} Success TX: ${tx.hash}`, 'success')
            return tx;
        } catch (error) {
            retry--;
            if (retry > 0) {
                dd(`Error address: ${address} retry:${retry}`, 'error')
                console.error(error);
                await sleep(5);
                await mintByHexAndVal(wallet, contractAddress, hexData, value, retry);
            } else {
                dd(`Error address: ${address}`, 'error')
                console.error("Error:", error);
            }
        }
    }

    async suffix(params = {
        sleep: true,
        count: 0,
        current: 0,
        minSecond: '',
        maxSecond: '',
    }) {
        if (params.sleep && params.minSecond && params.maxSecond && params.count > params.current) {
            const sleepSeconds = randomNumber(params.minSecond, params.maxSecond);
            dd(`暂停${sleepSeconds}秒后继续下一个账号`, 'warning');
            await sleep(sleepSeconds);
        }
    }

    async destruct() {
        this.endTime = performance.now();
        const executionTime = parseInt((this.endTime - this.startTime) / 1000);
        dd(`脚本执行完毕，总耗时: ${executionTime} 秒`, 'success');
    }
}

module.exports = Main;
