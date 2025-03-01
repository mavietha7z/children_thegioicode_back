import axios from 'axios';

const url = 'https://wwproxy.com/api';
const userAPIKEY = 'API-aacb613e-ed53-44dd-a7ca-c7996ae40ce4';

const provinceID = [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36,
    37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63,
];

let lastIP = null;
let lastFetchTime = null;
let currentProvinceIndex = 0;

const serviceGetProxyInfo = async (proxyKey) => {
    const currentTime = Date.now();

    if (!lastFetchTime || currentTime - lastFetchTime > 60000 || !lastIP) {
        lastFetchTime = currentTime;

        try {
            const result = await axios.get(`${url}/client/proxy/available`, {
                params: {
                    key: proxyKey,
                    provinceId: provinceID[currentProvinceIndex],
                },
                timeout: 6000,
            });

            const proxy = result.data;
            if (proxy.status === 'OK') {
                lastIP = proxy.data;
                currentProvinceIndex = (currentProvinceIndex + 1) % provinceID.length;
                return {
                    ip: proxy.data.ipAddress,
                    port: proxy.data.port,
                };
            }
            return null;
        } catch (error) {
            currentProvinceIndex = (currentProvinceIndex + 1) % provinceID.length;
            if (lastIP) {
                return {
                    ip: lastIP.ipAddress,
                    port: lastIP.port,
                };
            }
            return null;
        }
    }

    return {
        ip: lastIP.ipAddress,
        port: lastIP.port,
    };
};

const serviceV2ChangeIPProxy = async () => {
    try {
        const result = await axios.get('https://app.proxyno1.com/api/change-key-ip/zKt9LcIRlDlDOWaJed1Pwc1740126499');

        if (result.data.status === 0) {
            return true;
        }

        return false;
    } catch (error) {
        return false;
    }
};

export { serviceGetProxyInfo, serviceV2ChangeIPProxy };
