const ethers = require("ethers");
const axios = require('axios');
const {
    sleep,
    randomNumber, dd,
} = require("./utils/function");

const MainClass = require("./utils/Main");
const {HttpsProxyAgent} = require("https-proxy-agent");

async function index() {
    const main = new MainClass('linea');
    /**
     * ************************************************************
     */
        // 定义合约地址
    let contractAddress = "0xAd626D0F8BE64076C4c27a583e3df3878874467E";
    // 定义合约方法的十六进制数据
    let hexData = "";
    const value = null;

    await main.lineaRun(async (addressData) => {
        let count = addressData.length;
        let current = 0;

        for (let access of addressData) {
            current++;
            dd(`总共 ${count} 个任务，准备执行第 ${current} 个任务`, 'success')
            // 根据私钥创建签名的钱包
            const wallet = main.EthersObj.getWallet(access.PrivateKey);
            const address = wallet.address;

            /**
             * ************************************************************
             */
            const skip = await main.isSkip({checkContract: true, address: address, contractAddress: contractAddress});
            if (skip === false) {
                let result = null;
                let j = 0;
                while (result === null || result === 429) {
                    j++;
                    try {
                        result = await getSignature(address, access.ProxyObj);
                    } catch (e) {
                        dd(address + ' - ' + e.toString(), 'error');
                        await sleep(1);
                    }
                    if (j > 150) {
                        break;
                    }
                }

                if (!result || !result.data || !result.data.contract) {
                    dd(address + ' - ' + result, 'error');
                    continue;
                }

                contractAddress = result.data.contract;

                try {
                    hexData = genHex(result.data.voucher, result.data.signature);

                    await main.sendTransaction(wallet, contractAddress, hexData, value, main.config.linea.add_gas_price);

                    await main.suffix({
                        sleep: true,
                        count: count,
                        current: current,
                        minSecond: main.config.linea.access.second_min,
                        maxSecond: main.config.linea.access.second_max,
                    });
                } catch (e) {
                    console.log(e)
                }
            }
        }
    });

    await main.destruct();
}

function genHex(voucher, signature) {
    const AbiCoder = new ethers.AbiCoder;

    const hex = AbiCoder.encode(
        ["tuple(address,address,uint256,uint256,uint256,uint256,uint256,uint256,address)", "bytes"],
        [[
            voucher.net_recipient,
            voucher.initial_recipient,
            voucher.initial_recipient_amount,
            voucher.quantity,
            voucher.nonce,
            voucher.expiry,
            voucher.price,
            voucher.token_id,
            voucher.currency,
        ], signature],
    );

    return "0xd4dfd6bc" + hex.slice(2);
}

async function getSignature(address, proxyObj) {
    // 请求 URL
    const url = 'https://public-api.phosphor.xyz/v1/purchase-intents';

    // 请求头
    const headers = {
        'accept': '*/*',
        'accept-language': 'en,en-US;q=0.9',
        'cache-control': 'no-cache',
        'content-type': 'application/json',
        'origin': 'https://app.phosphor.xyz',
        'pragma': 'no-cache',
        'priority': 'u=1, i',
        'referer': 'https://app.phosphor.xyz/',
        'sec-ch-ua': '"Google Chrome";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
    };


    // 请求体
    const data = {
        "buyer": {"eth_address": address},
        "listing_id": "fceb2be9-f9fd-458a-8952-9a0a6f873aff",
        "provider": "MINT_VOUCHER",
        "quantity": 1
    };

    const config = {
        headers: headers,
        timeout: 30 * 1000,
    };
    if (proxyObj !== null) {
        const agent = new HttpsProxyAgent(`http://${proxyObj.username}:${proxyObj.password}@${proxyObj.host}:${proxyObj.port}`);
        config.httpsAgent = agent;
        config.httpAgent = agent;
    }

    // 创建 10 个请求的数组
    const requests = Array.from({length: 1}, () =>
        axios.post(url, data, config)
    );

    // 使用 Promise.race 来等待第一个成功的请求
    const res = await Promise.race(requests);

    if (res.status === 200 || res.status === 201) {
        return res.data;
    }

    // console.log(res);
    return res.status;
}


index()
