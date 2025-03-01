import { User } from '~/models/user';
import { Source } from '~/models/source';
import { Cycles } from '~/models/cycles';
import { configCreateLog } from '~/configs';
import { Template } from '~/models/template';
import { CloudServerProduct } from '~/models/cloudServerProduct';

const controlAuthSearchCoupon = async (req, res) => {
    try {
        const { type, service_type } = req.body;

        if (!['service', 'user', 'cycles'].includes(type)) {
            return res.status(400).json({ error: 'Tham số truy vấn không hợp lệ' });
        }

        let data = [];
        if (type === 'service') {
            if (!['Source', 'Template', 'CloudServerProduct'].includes(service_type)) {
                return res.status(400).json({ error: 'Tham số truy vấn không hợp lệ' });
            }

            if (service_type === 'Source') {
                const sources = await Source.find({}).select('id title').sort({ priority: 1 });
                data = sources.map((source) => ({ id: source._id, title: source.title }));
            }

            if (service_type === 'Template') {
                const templates = await Template.find({}).select('id title').sort({ priority: 1 });
                data = templates.map((template) => ({ id: template._id, title: template.title }));
            }

            if (service_type === 'CloudServerProduct') {
                const cloudServers = await CloudServerProduct.find({}).select('id title').sort({ priority: 1 });

                data = cloudServers.map((cloud) => ({ id: cloud._id, title: cloud.title }));
            }
        }

        if (type === 'user') {
            const user = await User.find({}).select('id email').sort({ created_at: -1 });

            data = user.map((user) => ({ id: user._id, title: user.email }));
        }

        if (type === 'cycles') {
            const cycles = await Cycles.find({}).select('display_name').sort({ unit: 1 });

            data = cycles.map((cycle) => ({ id: cycle._id, title: cycle.display_name }));
        }

        res.status(200).json({
            data,
            status: 200,
        });
    } catch (error) {
        configCreateLog('controllers/manage/coupon/get.log', 'controlAuthSearchCoupon', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthSearchCoupon };
