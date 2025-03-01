import { configCreateLog } from '~/configs';
import { VirtualizorAPI } from '~/services/virtualizor/constructor';

// Lấy ID người dùng
function getUserIdByEmail(email, userData) {
    // Lặp qua các user để tìm email
    for (let uid in userData.users) {
        if (userData.users[uid].email === email) {
            return userData.users[uid].uid; // Trả về ID của người dùng
        }
    }
    return null;
}

// Kiểm tra người dùng đã tồn tại chưa nếu chưa thì thêm mới
export const serverAuthCheckUserVPS = async (hostname, api_key, api_pass, user) => {
    try {
        const request = new VirtualizorAPI(hostname, api_key, api_pass);

        const resultGetUsers = await request.authGetUsersVPS(1, 50, { email: user.email });

        let userID = getUserIdByEmail(user.email, resultGetUsers);
        if (!resultGetUsers.users) {
            const dataUser = {
                adduser: 1,
                priority: 0,
                newemail: user.email,
                newpass: user.username,
            };

            const resultAddUser = await request.authCreateUserVPS(dataUser);
            userID = resultAddUser.done;
        }

        return userID;
    } catch (error) {
        configCreateLog('services/my/cloudServer/virtualizorAPI.log', 'serverAuthCheckUserVPS', error.message);
        return null;
    }
};

// Tạo VPS
export const serviceAuthCreateVPS = async (hostname, api_key, api_pass, data) => {
    try {
        const request = new VirtualizorAPI(hostname, api_key, api_pass);

        const result = await request.authCreateVPS(data);

        return result;
    } catch (error) {
        configCreateLog('services/my/cloudServer/virtualizorAPI.log', 'serviceAuthCreateVPS', error.message);
        return null;
    }
};

// Lấy trạng thái VPS
export const serviceAuthGetStatusVPS = async (hostname, api_key, api_pass, serverId = []) => {
    try {
        const request = new VirtualizorAPI(hostname, api_key, api_pass);

        const result = await request.authGetStatusVPS(serverId);

        return result;
    } catch (error) {
        configCreateLog('services/my/cloudServer/virtualizorAPI.log', 'serviceAuthGetStatusVPS', error.message);
        return null;
    }
};

// Xoá VPS
export const serviceAuthDeleteVPS = async (hostname, api_key, api_pass, id) => {
    try {
        const request = new VirtualizorAPI(hostname, api_key, api_pass);

        const result = await request.authDeleteVPS(id);

        return result.done;
    } catch (error) {
        configCreateLog('services/my/cloudServer/virtualizorAPI.log', 'serviceAuthDeleteVPS', error.message);
        return null;
    }
};

// Lấy VPS bằng ID
export const serviceAuthGetVPSById = async (hostname, api_key, api_pass, id) => {
    try {
        const request = new VirtualizorAPI(hostname, api_key, api_pass);

        const result = await request.authGetVPSByID(id);

        return result;
    } catch (error) {
        configCreateLog('services/my/cloudServer/virtualizorAPI.log', 'serviceAuthGetVPSById', error.message);
        return null;
    }
};

// Stop Start VPS
export const serviceAuthActionVPSById = async (hostname, api_key, api_pass, action, id) => {
    try {
        const request = new VirtualizorAPI(hostname, api_key, api_pass);

        const result = await request.authActionVPSByID(action, id);

        return result;
    } catch (error) {
        configCreateLog('services/my/cloudServer/virtualizorAPI.log', 'serviceAuthActionVPSById', error.message);
        return null;
    }
};

// Rebuild VPS
export const serviceAuthRebuildVPS = async (hostname, api_key, api_pass, data) => {
    try {
        const request = new VirtualizorAPI(hostname, api_key, api_pass);

        const result = await request.authRebuildVPS(data);

        return result;
    } catch (error) {
        configCreateLog('services/my/cloudServer/virtualizorAPI.log', 'serviceAuthRebuildVPS', error.message);
        return null;
    }
};

// Manage VPS (Resize, Change Password Root)
export const serviceAuthManageVPS = async (hostname, api_key, api_pass, id, data) => {
    try {
        const request = new VirtualizorAPI(hostname, api_key, api_pass);

        const result = await request.authManageVPS(id, data);

        return result;
    } catch (error) {
        configCreateLog('services/my/cloudServer/virtualizorAPI.log', 'serviceAuthManageVPS', error.message);
        return null;
    }
};

// Suspend And Unsuspend VPS
export const serviceAuthSuspendAndUnsuspendVPS = async (hostname, api_key, api_pass, id, type) => {
    try {
        const request = new VirtualizorAPI(hostname, api_key, api_pass);

        const result = await request.authSuspendAndUnsuspendVPS(id, type);

        return result;
    } catch (error) {
        configCreateLog('services/my/cloudServer/virtualizorAPI.log', 'serviceAuthManageVPS', error.message);
        return null;
    }
};
