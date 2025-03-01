import { User } from '~/models/user';
import { Cart } from '~/models/cart';
import { Order } from '~/models/order';
import { Token } from '~/models/token';
import { Apikey } from '~/models/apikey';
import { Wallet } from '~/models/wallet';
import { Source } from '~/models/source';
import { Request } from '~/models/request';
import { Invoice } from '~/models/invoice';
import { configCreateLog } from '~/configs';
import { Userbank } from '~/models/userbank';
import { NewsFeed } from '~/models/newsFeed';
import { BonusPoint } from '~/models/bonusPoint';
import { LoginHistory } from '~/models/loginHistory';
import { Notification } from '~/models/notification';
import { WalletHistory } from '~/models/walletHistory';
import { OrderTemplate } from '~/models/orderTemplate';
import { ResourceProduct } from '~/models/resourceProduct';
import { ResourceAccount } from '~/models/resourceAccount';
import { OrderCloudServer } from '~/models/orderCloudServer';

const controlAuthDestroyUser = async (req, res) => {
    try {
        const { id: user_id } = req.query;

        const user = await User.findByIdAndDelete(user_id);
        if (!user) {
            return res.status(404).json({
                error: 'Người dùng cần xoá không tồn tại',
            });
        }

        await Promise.all([
            Apikey.deleteMany({ user_id }),
            BonusPoint.deleteMany({ user_id }),
            Cart.findOneAndDelete({ user_id }),
            OrderCloudServer.deleteMany({ user_id }),
            Invoice.deleteMany({ user_id }),
            LoginHistory.deleteMany({ user_id }),
            NewsFeed.deleteMany({ user_id }),
            Notification.deleteMany({ user_id }),
            Order.deleteMany({ user_id }),
            OrderTemplate.deleteMany({ user_id }),
            Request.deleteMany({ user_id }),
            ResourceAccount.deleteMany({ user_id }),
            ResourceProduct.deleteMany({ user_id }),
            Source.deleteMany({ user_id }),
            Token.deleteMany({ user_id }),
            Userbank.deleteMany({ user_id }),
            Wallet.findOneAndDelete({ user_id }),
            WalletHistory.deleteMany({ user_id }),
        ]);

        res.status(200).json({
            status: 200,
            message: `Xoá khách hàng #${user.id} thành công`,
        });
    } catch (error) {
        configCreateLog('controllers/manage/user/destroy.log', 'controlAuthDestroyUser', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthDestroyUser };
