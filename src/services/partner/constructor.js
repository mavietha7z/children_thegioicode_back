import axios from 'axios';
import { Partner } from '~/models/partner';
import { configCreateLog } from '~/configs';

class ThegioicodeAPI {
    constructor() {
        this.api = axios.create({
            headers: {
                'Content-Type': 'application/json',
            },
            family: 4,
            proxy: false,
        });

        this.initPromise = this.init();

        this.api.interceptors.response.use(
            (response) => response,
            (error) => {
                configCreateLog('services/partner/constructor.log', 'ThegioicodeAPI', error.response?.data?.error || error.message);
                return Promise.reject(error);
            },
        );
    }

    async init() {
        const partner = await Partner.findOne({}).select('url token');

        if (partner) {
            this.setToken(partner.token);
            this.api.defaults.proxy = false;
            this.api.defaults.baseURL = partner.url;
        }
    }

    setToken(token) {
        this.api.defaults.headers['Authorization'] = `Bearer ${token}`;
    }

    async get(path, params = {}, query = {}) {
        await this.initPromise;
        return this.api.get(path, { params, paramsSerializer: () => new URLSearchParams(query).toString() });
    }

    async post(path, data = {}, params = {}) {
        await this.initPromise;
        return this.api.post(path, data, { params });
    }

    async put(path, data = {}, params = {}) {
        await this.initPromise;
        return this.api.put(path, data, { params });
    }

    async delete(path, params = {}, query = {}) {
        await this.initPromise;
        return this.api.delete(path, { params, paramsSerializer: () => new URLSearchParams(query).toString() });
    }
}

export default ThegioicodeAPI;
