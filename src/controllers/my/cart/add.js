import { configCreateLog } from '~/configs';
import { isValidDataId } from '~/validators';
import { serviceUserAddSourceToCart } from '~/services/my/cart/add/source';
import { validatorUserDeployCloudServer } from '~/validators/my/cloudServer/deploy';
import { serviceUserAddCloudServerToCart } from '~/services/my/cart/add/cloudServer';
import { serviceUserAddOrderTemplateToCart } from '~/services/my/cart/add/orderTemplate';
import { serviceUserAddOrderInstanceToCart } from '~/services/my/cart/add/orderInstance';

const controlUserAddProductToCart = async (req, res) => {
    try {
        const { category } = req.params;

        if (!['source', 'order-template', 'order-instance', 'cloud-server'].includes(category)) {
            return res.status(400).json({
                error: 'Tham số truy vấn không hợp lệ',
            });
        }
        if (['source', 'order-template', 'order-instance'].includes(category) && !isValidDataId(req.body.id)) {
            return res.status(400).json({
                error: 'Tham số truy vấn không hợp lệ',
            });
        }

        let status = 400;
        let message = 'Thêm vào giỏ hàng thất bại';

        if (category === 'source') {
            const source = await serviceUserAddSourceToCart(req.user, req.body.id);
            if (!source.success) {
                return res.status(source.status).json({
                    error: source.error,
                });
            }

            status = source.status;
            message = source.message;
        }

        if (category === 'order-template') {
            const order = await serviceUserAddOrderTemplateToCart(req.user, req.body.id);
            if (!order.success) {
                return res.status(order.status).json({
                    error: order.error,
                });
            }

            status = order.status;
            message = order.message;
        }

        if (category === 'order-instance') {
            const order = await serviceUserAddOrderInstanceToCart(req.user, req.body.id);
            if (!order.success) {
                return res.status(order.status).json({
                    error: order.error,
                });
            }

            status = order.status;
            message = order.message;
        }

        if (category === 'cloud-server') {
            const validate = await validatorUserDeployCloudServer(req.body);
            if (!validate.success) {
                return res.status(validate.status).json({
                    error: validate.error,
                });
            }

            const result = await serviceUserAddCloudServerToCart(req.user, req.body, validate.data);
            if (!result.success) {
                return res.status(result.status).json({
                    error: result.error,
                });
            }

            status = result.status;
            message = result.message;
        }

        res.status(status).json({
            status,
            message,
        });
    } catch (error) {
        configCreateLog('controllers/my/cart/add.log', 'controlUserAddProductToCart', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlUserAddProductToCart };
