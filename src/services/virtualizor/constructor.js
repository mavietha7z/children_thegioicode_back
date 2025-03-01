import axios from 'axios';
import https from 'https';

export class VirtualizorAPI {
    constructor(hostname, key, pass) {
        this.key = key;
        this.pass = pass;
        this.hostname = hostname;
        this.httpsAgent = new https.Agent({ rejectUnauthorized: false });
    }

    // Tạo chuỗi ngẫu nhiên
    generateRandomString(length) {
        const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        return Array.from({ length }, () => characters.charAt(Math.floor(Math.random() * characters.length))).join('');
    }

    // Tạo khóa API
    authMakeApiKey(key, pass) {
        const crypto = require('crypto');
        return (
            key +
            crypto
                .createHash('md5')
                .update(pass + key)
                .digest('hex')
        );
    }

    // Hàm gọi API
    async functionCallAPI(path, data = {}, post = {}, cookies = {}) {
        const key = this.generateRandomString(8);
        const apikey = this.authMakeApiKey(key, this.pass);

        let url = `${this.hostname}/${path}`;
        url += `&adminapikey=${encodeURIComponent(this.key)}&adminapipass=${encodeURIComponent(this.pass)}`;
        url += `&api=json&apikey=${encodeURIComponent(apikey)}`;

        if (Object.keys(data).length) {
            url += `&apidata=${encodeURIComponent(Buffer.from(JSON.stringify(data)).toString('base64'))}`;
        }

        const options = {
            method: Object.keys(post).length ? 'POST' : 'GET',
            url,
            data: post,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            httpsAgent: this.httpsAgent,
        };

        if (Object.keys(cookies).length) {
            options.headers['Cookie'] = Object.entries(cookies)
                .map(([key, value]) => `${key}=${value}`)
                .join('; ');
        }

        try {
            const response = await axios(options);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    // Danh sách người dùng
    async authGetUsersVPS(page = 1, reslen = 50, filter = {}) {
        let path = 'index.php?act=users';

        if (Object.keys(filter).length) {
            path += `&uid=${filter.uid || ''}&email=${filter.email || ''}&type=${filter.type || ''}`;
        }
        path += `&page=${page}&reslen=${reslen}`;

        return await this.functionCallAPI(path, {}, filter);
    }

    // Thêm người dùng
    async authCreateUserVPS(post = {}) {
        const path = 'index.php?act=adduser';

        return await this.functionCallAPI(path, {}, post);
    }

    // Lấy VPS bằng ID
    async authGetVPSByID(id) {
        const path = `index.php?act=vs&vpsid=${id}`;

        return await this.functionCallAPI(path);
    }

    // Tạo VPS
    async authCreateVPS(post = {}, cookies = {}) {
        const path = 'index.php?act=addvs';

        const response = await this.functionCallAPI(path, {}, post, cookies);

        return {
            done: response.done,
            info: response.newvs,
            title: response.title,
        };
    }

    // Stop Start Restart VPS bằng ID
    async authActionVPSByID(action, id) {
        const path = `index.php?act=vs&action=${action}&vpsid=${id}`;

        return await this.functionCallAPI(path);
    }

    // Lấy trạng thái VPS
    async authGetStatusVPS(ids = []) {
        const path = `index.php?act=vs&vs_status=${ids}`;

        return await this.functionCallAPI(path);
    }

    // Rebuild VPS
    async authRebuildVPS(post = {}) {
        const path = 'index.php?act=rebuild';

        return await this.functionCallAPI(path, {}, post);
    }

    // Manage VPS (Resize, Change Password Root)
    async authManageVPS(id, post = {}) {
        const path = `index.php?act=managevps&vpsid=${id}`;

        return await this.functionCallAPI(path, {}, post);
    }

    // Xoá VPS
    async authDeleteVPS(id) {
        const path = `index.php?act=vs&delete=${id}`;

        return await this.functionCallAPI(path);
    }

    // Suspend and Unsuspend
    async authSuspendAndUnsuspendVPS(id, type) {
        const path = `index.php?act=vs&${type}=${id}`;

        return await this.functionCallAPI(path, {}, {});
    }
}
