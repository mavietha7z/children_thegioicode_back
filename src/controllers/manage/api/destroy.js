import { Api } from '~/models/api';
import { Player } from '~/models/player';
import { Apikey } from '~/models/apikey';
import { Request } from '~/models/request';
import { configCreateLog } from '~/configs';

const controlAuthDestroyApi = async (req, res) => {
    try {
        const { id } = req.query;

        const api = await Api.findByIdAndDelete(id);
        if (!api) {
            return res.status(404).json({ error: 'API cần xoá không tồn tại' });
        }

        await Player.deleteMany({ service_id: api._id });
        await Apikey.deleteMany({ service_id: api._id });
        await Request.deleteMany({ service_id: api._id });

        res.status(200).json({
            status: 200,
            message: `Xoá API #${api.id} thành công`,
        });
    } catch (error) {
        configCreateLog('controllers/manage/api/destroy.log', 'controlAuthDestroyApi', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthDestroyApi };
