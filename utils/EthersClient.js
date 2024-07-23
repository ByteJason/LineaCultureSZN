const {ethers} = require("ethers");
const {
    sleep,
    getTodayTimestamp, dd,
} = require("./function");

class EthersClient {
    // RPCUrl = null;
    // provider = null;
    // chainConfig = null;
    constructor(chainConfig) {
        this.chainConfig = chainConfig;
        this.RPCUrl = chainConfig.rpc_url;
        this.provider = new ethers.JsonRpcProvider(this.RPCUrl);
    }

    getProvider() {
        if (this.provider !== null) {
            this.provider = new ethers.JsonRpcProvider(this.RPCUrl);
        }
        return this.provider;
    }

    getWallet(privateKey) {
        // TODO: 判断私钥是否正确格式
        // 使用私钥连接钱包
        return new ethers.Wallet(privateKey, this.provider);
    }

    getContract(contractAddress, ABI, wallet) {
        // 获取合约实例
        return new ethers.Contract(
            contractAddress,
            ABI,
            wallet,
        );
    }

    async getBalance(provider, address) {
        const balance = await provider.getBalance(address);
        return ethers.formatEther(balance);
    }

    async txIsSuccess(provider, hash, i = 0) {
        const receipt = await provider.getTransactionReceipt(hash);

        if (receipt) {
            if (receipt.status === 1) {
                return true;
            } else if (receipt.status === 0) {
                return false;
            }
        } else {
            await sleep(2)
            if (i < 8) {
                i++
                return this.txIsSuccess(provider, hash, i)
            }
            return false;
        }
    }

    /**
     *
     * @param address
     * @param contractAddress
     * @param funHex
     * @returns {Promise<*|number>}
     */
    async checkContractInteraction(address, contractAddress, funHex = '') {
        if (!this.chainConfig.explorer_apikey) {
            dd("explorer_apikey 填写后将会自动判断该账号是否 mint 过，避免重复 mint", 'warning')
            return -1;
        }
        const url = `${this.chainConfig.explorer_url}/api?module=account&action=txlist&address=${address}&startblock=0&endblock=latest&sort=desc&apikey=${this.chainConfig.explorer_apikey}`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                return -1;
            }
            const data = await response.json();
            console.log(data)
            const transactions = data.result;

            let interactions = transactions.filter(tx =>
                tx.isError === "0" &&
                (tx.from.toLowerCase() === contractAddress.toLowerCase() ||
                    tx.to.toLowerCase() === contractAddress.toLowerCase())
            );
            if (funHex.length > 0) {
                interactions = interactions.filter(tx =>
                    tx.input.slice(0, funHex.length).toLowerCase() === funHex.toLowerCase()
                );
            }

            return interactions.length;
        } catch (error) {
            return -1;
        }
    }

    async getGas(uint = 'gwei') {
        const feeData = await this.provider.getFeeData();

        if (uint === "wei") {
            return feeData.gasPrice;
        }

        return Number(ethers.formatUnits(feeData.gasPrice, uint)).toFixed(4)
    }

    async getMaxGas(uint = 'gwei') {
        const feeData = await this.provider.getFeeData();

        if (uint === "wei") {
            return feeData.maxFeePerGas;
        }

        return Number(ethers.formatUnits(feeData.maxFeePerGas, uint)).toFixed(4)
    }
}

module.exports = EthersClient;
