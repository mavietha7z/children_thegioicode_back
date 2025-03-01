import { Api } from '~/models/api';
import { sendMessageBotTelegramError } from '~/bot';

const serviceApiToggleStatus = async (category, status) => {
    try {
        const api = await Api.findOne({ category }).select('status');

        api.status = status;

        await api.save();
    } catch (error) {
        sendMessageBotTelegramError(`Lỗi chuyển trạng thái API ${category}: \n ${JSON.stringify(error)}`);
    }
};

export { serviceApiToggleStatus };
