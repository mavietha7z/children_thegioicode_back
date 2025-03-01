import { Cart } from '~/models/cart';
import { configCreateLog } from '~/configs';
import { CartProduct } from '~/models/cartProduct';

const controlAuthGetCartUsers = async (req, res) => {
    try {
        const pageSize = 20;
        const skip = (req.page - 1) * pageSize;
        const count = await Cart.countDocuments({});
        const pages = Math.ceil(count / pageSize);

        const carts = await Cart.find({})
            .populate({ path: 'user_id', select: 'id full_name email' })

            .skip(skip)
            .limit(pageSize)
            .sort({ created_at: -1 });

        const data = await Promise.all(
            carts.map(async (cart) => {
                const { _id: key, id, user_id: user, status, created_at, updated_at } = cart;

                const products = await CartProduct.find({ user_id: user._id, cart_id: key }).populate({
                    path: 'pricing_id',
                    select: 'id price discount bonus_point cycles_id',
                    populate: { path: 'cycles_id', select: 'id unit value display_name' },
                });

                return {
                    id,
                    key,
                    user,
                    status,
                    created_at,
                    updated_at,
                    products: products.map((product) => {
                        return {
                            id: product.id,
                            title: product.title,
                            quantity: product.quantity,
                            description: product.description,
                            pricing: {
                                id: product.pricing_id.id,
                                price: product.pricing_id.price,
                                discount: product.pricing_id.discount,
                                bonus_point: product.pricing_id.bonus_point,
                                cycles: {
                                    id: product.pricing_id.cycles_id.id,
                                    unit: product.pricing_id.cycles_id.unit,
                                    value: product.pricing_id.cycles_id.value,
                                    display_name: product.pricing_id.cycles_id.display_name,
                                },
                            },
                        };
                    }),
                };
            }),
        );

        res.status(200).json({
            data,
            pages,
            status: 200,
        });
    } catch (error) {
        configCreateLog('controllers/manage/cart/get.log', 'controlAuthGetCartUsers', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthGetCartUsers };
