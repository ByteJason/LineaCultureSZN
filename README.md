# 1. 基本介绍
- 本项目是一个基于 `nodejs` 的 LineaCultureSZN 的脚本分享
- issue 仅用于提交 Bug 或 Feature 以及设计相关的内容，其它内容可能会被直接关闭。
- 作者 [https://x.com/ByteJason](https://x.com/ByteJason)
- 本项目仅供学习研究使用，请勿用于非法用途，否则后果自负！


# 2. 使用说明

## 2.1 安装环境

- 安装 nodejs >= 18.18 的版本
  - 可以在 [https://nodejs.org/](https://nodejs.org/zh-cn/download/package-manager) 进行下载适合系统的环境安装包进行安装
- 安装好之后使用如下命令查看是否成功安装，如果都能看到版本号信息，既代表安装完成
  - ```
    node -v
    npm -v
    ```

## 2.2 安装依赖
- 在项目根目录下执行如下命令，安装依赖
  - ```
    npm install
    ```

## 2.3 编辑配置文件
- 在项目根目录下找到 `config.yaml` 文件，修改里面的配置信息
  - `linea`
    - `upset`: 账号是否打乱账号顺序执行，true 是打乱，false 是不打乱
    - `access`:
      - `second_min`: 账号之间的间隔随机（最小值）秒
      - `second_max`: 账号之间的间隔随机（最大值）秒
    - `add_gas_price`: 加多少gas,单位 gwei，【是获取当前的gas后再加这个数】【不像+gas可以改0】
- `chain`:
  - `linea`:
    - `rpc_url`: 默认使用公共的 rpc 地址，可以替换为自己的rpc
    - `explorer_url`: 区块链浏览器的 api 地址
    - `explorer_apikey`: 区块链浏览器的 api key 填写后才能使用 判断该地址是否已经mint过，如果mint过将不会重复 mint,自动跳过
      - > 到 [https://lineascan.build/](https://lineascan.build/) 进行注册并登录后打开 [https://lineascan.build/myapikey](https://lineascan.build/myapikey) `Add` 一个 `API Key Token` 之后粘贴到配置文件

## 2.4 编辑 `wallet.csv` 收款钱包文件
- 在项目根目录下找到 `wallet.csv` 文件，编辑里面的收款钱包私钥与代理地址，一行一个
  - `私钥`: 必须填写
  - `代理地址`: 可选，如果不填写，则默认使用将直接使用电脑本身的IP，填写格式为`ip:port:username:password`，如`192.168.100.10:8888:admin:admin`

## 2.5 执行脚本
- 在项目根目录下执行如下命令，执行脚本
  - ```shell
    node week4-task1.js
    ```

# 商用注意事项
如果您将此项目用于商业用途，请遵守Apache2.0协议并保留作者技术支持声明。
