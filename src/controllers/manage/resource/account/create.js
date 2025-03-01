import { configCreateLog } from '~/configs';
import { ResourceProduct } from '~/models/resourceProduct';
import { ResourceAccount } from '~/models/resourceAccount';

const controlAuthCreateResourceAccount = async (req, res) => {
    try {
        const { product_id, username, password, description } = req.body;

        const product = await ResourceProduct.findById(product_id).select('id title');
        if (!product) {
            return res.status(404).json({ error: 'Loại tài khoản không tồn tại' });
        }

        const newAccount = await new ResourceAccount({
            user_id: req.user.id,
            product_id,
            username,
            password,
            description,
            sold: false,
            status: true,
        }).save();

        await product.save();

        const data = {
            id: newAccount.id,
            key: newAccount._id,
            user: {
                _id: req.user.id,
                id: req.user.user_id,
                email: req.user.email,
                full_name: req.user.full_name,
            },
            product,
            username,
            password,
            description,
            created_at: Date.now(),
            updated_at: Date.now(),
            status: newAccount.status,
        };

        res.status(200).json({
            data,
            status: 200,
            message: `Tạo mới tài khoản #${newAccount.id} thành công`,
        });
    } catch (error) {
        configCreateLog('controllers/manage/resource/account/create.log', 'controlAuthCreateResourceAccount', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthCreateResourceAccount };
