import { Api } from '~/models/api';
import TelegramBot from 'node-telegram-bot-api';
import { serviceApiToggleStatus } from '~/services/api/status';

const botTelegramApp = new TelegramBot('7913613085:AAHyMQV8BZKKPBddD11rd_b6t4SEB1X2geo', { polling: true });
const botTelegramError = new TelegramBot('7842790696:AAHriSp4UD8smg0SQNeCluZWUldgrOmEo8A', { polling: true });
const botTelegramDatadome = new TelegramBot('7509173808:AAEn6Etgx93st_ZOC_n7SAPdh00d07XSbqw', { polling: true });

let currentDatadomeMessage = null;

// Bot error
botTelegramError.onText(/\/start/, (msg) => {
    const { id, first_name } = msg.chat;

    try {
        botTelegramError.sendMessage(id, `Chào mừng ${first_name} đến với bot của chúng tôi!`);
    } catch (error) {
        botTelegramError.sendMessage(id, `Yêu cầu vừa thực hiện có lỗi: \n${error}`);
    }
});

const sendMessageBotTelegramError = (message) => {
    botTelegramError.sendMessage(5169696585, message);
};

// Bot app
botTelegramApp.onText(/\/start/, (msg) => {
    const { id, first_name } = msg.chat;

    try {
        botTelegramApp.sendMessage(id, `Chào mừng ${first_name} đến với bot của chúng tôi!`);
    } catch (error) {
        botTelegramApp.sendMessage(id, `Yêu cầu vừa thực hiện có lỗi: \n${error}`);
    }
});

const sendMessageBotTelegramApp = (message) => {
    botTelegramApp.sendMessage(5169696585, message);
};

// Bot datadome
const sendMessageBotTelegramDatadome = (message, option = {}) => {
    botTelegramDatadome.sendMessage(5169696585, message, option);
};

botTelegramDatadome.onText(/\/start/, async (msg) => {
    const { id, first_name } = msg.chat;

    try {
        const apis = await Api.find({}).select('title category').sort({ created_at: -1 });

        const optionsMainMenu = {
            reply_markup: {
                inline_keyboard: apis.map((api) => {
                    return [
                        {
                            text: api.title,
                            callback_data: api.category,
                        },
                    ];
                }),
            },
        };

        botTelegramDatadome.sendMessage(
            id,
            `Chào mừng ${first_name} đến với bot của chúng tôi! Dưới đây là các mục bạn có thể chọn.`,
            optionsMainMenu,
        );
    } catch (error) {
        botTelegramDatadome.sendMessage(id, `Yêu cầu vừa thực hiện có lỗi: \n${error}`);
    }
});

botTelegramDatadome.on('callback_query', async (query) => {
    const callbackData = query.data;
    const { id: chatId } = query.message.chat;

    try {
        if (!callbackData.includes(':')) {
            const apiInfo = await Api.findOne({ category: callbackData }).select('title category');

            if (!apiInfo) {
                botTelegramDatadome.sendMessage(chatId, `${callbackData} - Không tìm thấy thông tin cho API chọn này!`);
                return;
            }

            botTelegramDatadome.sendMessage(chatId, `Dưới đây là những yêu cầu bạn có thể thực hiện với - ${apiInfo.title}.`, {
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: 'Bảo trì API', callback_data: `maintenance_api:${apiInfo.category}` },
                            { text: 'Hoạt động API', callback_data: `activated_api:${apiInfo.category}` },
                        ],
                    ],
                },
            });
        } else {
            const [action, category] = callbackData.split(':');

            if (action === 'maintenance_api') {
                await serviceApiToggleStatus(category, 'maintenance');

                botTelegramDatadome.sendMessage(chatId, `${category} - Yêu cầu chuyển trạng thái API sang bảo trì thành công.`);
            }

            if (action === 'activated_api') {
                await serviceApiToggleStatus(category, 'activated');

                botTelegramDatadome.sendMessage(chatId, `${category} - Yêu cầu chuyển trạng thái API sang hoạt động thành công.`);
            }

            if (action === 'update_datadome' && currentDatadomeMessage) {
                const result = await Api.updateOne({ category }, { $set: { 'configs.datadome': currentDatadomeMessage } });

                if (result.modifiedCount > 0) {
                    currentDatadomeMessage = null;

                    botTelegramDatadome.sendMessage(chatId, `Yêu cầu cập nhật datadome cho ${category} thành công!`);
                } else {
                    botTelegramDatadome.sendMessage(chatId, `Không tìm thấy tài liệu nào với ${category}!`);
                }
            }
        }
    } catch (error) {
        botTelegramDatadome.sendMessage(chatId, `Yêu cầu vừa thực hiện có lỗi: \n${error}`);
    }

    botTelegramDatadome.answerCallbackQuery(query.id);
});

export { sendMessageBotTelegramApp, sendMessageBotTelegramError, sendMessageBotTelegramDatadome };
