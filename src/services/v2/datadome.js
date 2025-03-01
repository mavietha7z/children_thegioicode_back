import axios from 'axios';
import https from 'https';
import { Api } from '~/models/api';
import { serviceV2ChangeIPProxy } from './proxy';

const serviceV2GetDatadomeFreeFire = async () => {
    try {
        const url = 'https://api-js.datadome.co/js/';
        const data =
            'jsData=%7B%22ttst%22%3A34.500000178813934%2C%22ifov%22%3Afalse%2C%22wdifrm%22%3Afalse%2C%22wdif%22%3Afalse%2C%22br_h%22%3A844%2C%22br_w%22%3A390%2C%22br_oh%22%3A844%2C%22br_ow%22%3A390%2C%22nddc%22%3A1%2C%22rs_h%22%3A844%2C%22rs_w%22%3A390%2C%22rs_cd%22%3A24%2C%22phe%22%3Afalse%2C%22nm%22%3Afalse%2C%22jsf%22%3Afalse%2C%22ua%22%3A%22Mozilla%2F5.0%20(iPhone%3B%20CPU%20iPhone%20OS%2013_2_3%20like%20Mac%20OS%20X)%20AppleWebKit%2F605.1.15%20(KHTML%2C%20like%20Gecko)%20Version%2F13.0.3%20Mobile%2F15E148%20Safari%2F604.1%22%2C%22lg%22%3A%22vi%22%2C%22pr%22%3A3%2C%22hc%22%3A4%2C%22ars_h%22%3A844%2C%22ars_w%22%3A390%2C%22tz%22%3A-420%2C%22str_ss%22%3Atrue%2C%22str_ls%22%3Atrue%2C%22str_idb%22%3Atrue%2C%22str_odb%22%3Atrue%2C%22plgod%22%3Afalse%2C%22plg%22%3A0%2C%22plgne%22%3A%22NA%22%2C%22plgre%22%3A%22NA%22%2C%22plgof%22%3A%22NA%22%2C%22plggt%22%3A%22NA%22%2C%22pltod%22%3Afalse%2C%22hcovdr%22%3Afalse%2C%22hcovdr2%22%3Afalse%2C%22plovdr%22%3Afalse%2C%22plovdr2%22%3Afalse%2C%22ftsovdr%22%3Afalse%2C%22ftsovdr2%22%3Afalse%2C%22lb%22%3Atrue%2C%22eva%22%3A33%2C%22lo%22%3Atrue%2C%22ts_mtp%22%3A1%2C%22ts_tec%22%3Atrue%2C%22ts_tsa%22%3Atrue%2C%22vnd%22%3A%22Google%20Inc.%22%2C%22bid%22%3A%22NA%22%2C%22mmt%22%3A%22empty%22%2C%22plu%22%3A%22empty%22%2C%22hdn%22%3Afalse%2C%22awe%22%3Afalse%2C%22geb%22%3Afalse%2C%22dat%22%3Afalse%2C%22med%22%3A%22defined%22%2C%22aco%22%3A%22probably%22%2C%22acots%22%3Afalse%2C%22acmp%22%3A%22probably%22%2C%22acmpts%22%3Atrue%2C%22acw%22%3A%22probably%22%2C%22acwts%22%3Afalse%2C%22acma%22%3A%22maybe%22%2C%22acmats%22%3Afalse%2C%22acaa%22%3A%22probably%22%2C%22acaats%22%3Atrue%2C%22ac3%22%3A%22%22%2C%22ac3ts%22%3Afalse%2C%22acf%22%3A%22probably%22%2C%22acfts%22%3Afalse%2C%22acmp4%22%3A%22maybe%22%2C%22acmp4ts%22%3Afalse%2C%22acmp3%22%3A%22probably%22%2C%22acmp3ts%22%3Afalse%2C%22acwm%22%3A%22maybe%22%2C%22acwmts%22%3Afalse%2C%22ocpt%22%3Afalse%2C%22vco%22%3A%22probably%22%2C%22vcots%22%3Afalse%2C%22vch%22%3A%22probably%22%2C%22vchts%22%3Atrue%2C%22vcw%22%3A%22probably%22%2C%22vcwts%22%3Atrue%2C%22vc3%22%3A%22maybe%22%2C%22vc3ts%22%3Afalse%2C%22vcmp%22%3A%22%22%2C%22vcmpts%22%3Afalse%2C%22vcq%22%3A%22%22%2C%22vcqts%22%3Afalse%2C%22vc1%22%3A%22probably%22%2C%22vc1ts%22%3Atrue%2C%22dvm%22%3A4%2C%22sqt%22%3Afalse%2C%22so%22%3A%22portrait-primary%22%2C%22wbd%22%3Afalse%2C%22wbdm%22%3Atrue%2C%22wdw%22%3Atrue%2C%22cokys%22%3A%22bG9hZFRpbWVzY3NpYXBwcnVudGltZQ%3D%3DL%3D%22%2C%22ecpc%22%3Afalse%2C%22lgs%22%3Atrue%2C%22lgsod%22%3Afalse%2C%22psn%22%3Atrue%2C%22edp%22%3Atrue%2C%22addt%22%3Atrue%2C%22wsdc%22%3Atrue%2C%22ccsr%22%3Atrue%2C%22nuad%22%3Atrue%2C%22bcda%22%3Afalse%2C%22idn%22%3Atrue%2C%22capi%22%3Afalse%2C%22svde%22%3Afalse%2C%22vpbq%22%3Atrue%2C%22ucdv%22%3Afalse%2C%22spwn%22%3Afalse%2C%22emt%22%3Afalse%2C%22bfr%22%3Afalse%2C%22dbov%22%3Afalse%2C%22npmtm%22%3Afalse%2C%22jset%22%3A1657013360%7D&events=%5B%5D&eventCounters=%5B%5D&jsType=ch&cid=.9Nfoi4MbtrhZ~-OzCe~9usp06_xKvitrfSO_5i8SbAvj_9hA-MnNwlaDhl4GxNX4oYEwpAo-KAriC6KcwwSwKfxI.I8_5UJuMtUXNzFVIbpOuMkCbT97yipJWa-gR3r&ddk=AE3F04AD3F0D3A462481A337485081&Referer=https%253A%252F%252Fsso.garena.com%252Fui%252Flogin%253Fapp_id%253D10100%2526redirect_uri%253Dhttps%25253A%25252F%25252Faccount.garena.com%25252F%2526locale%253Dvi-VN&request=%252Fui%252Flogin%253Fapp_id%253D10100%2526redirect_uri%253Dhttps%25253A%25252F%25252Faccount.garena.com%25252F%2526locale%253Dvi-VN&responsePage=origin&ddv=4.4.3';

        const response = await axios.post(url, data, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            httpsAgent: new https.Agent({ rejectUnauthorized: false }),
        });

        if (!response.data.cookie) {
            return null;
        }

        const datadome = response.data.cookie.match(/datadome=(.*?);/)[1];
        return datadome;
    } catch (error) {
        return null;
    }
};

const serviceGetHeadersGarena = (datadome) => {
    const headers = {
        Accept: 'application/json, text/plain, */*',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Accept-Language': 'vi,en-US;q=0.9,en;q=0.8,vi-VN;q=0.7,fr-FR;q=0.6,fr;q=0.5,es;q=0.4',
        Connection: 'keep-alive',
        Cookie: `_ga=GA1.1.1696053284.1737727584; _ga_XB5PSHEQB4=GS1.1.1737727583.1.1.1737727720.0.0.0; datadome=${datadome}`,
        Host: 'authgop.garena.com',
        Referer: `https://authgop.garena.com/universal/oauth?client_id=10017&redirect_uri=https://napthe.vn/app/100054&response_type=token&platform=1&locale=vi-VN&theme=white`,
        'Sec-Ch-Ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        'X-Datadome-Clientid': datadome,
    };

    return headers;
};

const serviceGetDatadomeGarena = async (proxy) => {
    try {
        const currentAPI = await Api.findOne({ category: 'Garena_login' }).select('datadome count_get_datadome');
        if (!currentAPI) {
            return { datadome: '', success: false };
        }

        const data = {
            proxy,
            token: '7766fa2f-44f6-472c-9d0b-38a1b0dd8c76',
        };

        // Hàm gọi API lấy datadome
        const fetchDatadome = async () => {
            try {
                const result = await axios.post('http://14.225.205.0:7575/api/v1/datadome', data);

                return result.data;
            } catch (err) {
                return { error: 'request_failed' };
            }
        };

        // Gọi API lần đầu
        let resultData = await fetchDatadome();

        // Nếu gặp lỗi server_reset, thử đổi IP và gọi lại API
        if (resultData.error === 'server_reset') {
            const resultChangeIP = await serviceV2ChangeIPProxy();
            if (resultChangeIP) {
                resultData = await fetchDatadome();
            } else {
                return { datadome: '', success: false };
            }
        }

        if (resultData.error === 'server_error') {
            resultData = await fetchDatadome();
        }

        // Kiểm tra kết quả cuối cùng
        if (resultData.error || !resultData.datadome) {
            return { datadome: '', success: false };
        }

        // Cập nhật API với datadome mới
        currentAPI.count_get_datadome += 1;
        currentAPI.datadome = resultData.datadome;
        await currentAPI.save();

        return {
            success: true,
            datadome: resultData.datadome,
        };
    } catch (error) {
        return { datadome: '', success: false };
    }
};

export { serviceV2GetDatadomeFreeFire, serviceGetDatadomeGarena, serviceGetHeadersGarena };
