import { Api } from '~/models/api';
import { App } from '~/models/app';
import { Cart } from '~/models/cart';
import { User } from '~/models/user';
import { Order } from '~/models/order';
import { Token } from '~/models/token';
import { Player } from '~/models/player';
import { Source } from '~/models/source';
import { Wallet } from '~/models/wallet';
import { Apikey } from '~/models/apikey';
import { Cycles } from '~/models/cycles';
import { Request } from '~/models/request';
import { Invoice } from '~/models/invoice';
import { Paygate } from '~/models/paygate';
import { Pricing } from '~/models/pricing';
import { Partner } from '~/models/partner';
import { Template } from '~/models/template';
import { Userbank } from '~/models/userbank';
import { Localbank } from '~/models/localbank';
import { BonusPoint } from '~/models/bonusPoint';
import { Membership } from '~/models/membership';
import { CartProduct } from '~/models/cartProduct';
import { LoginHistory } from '~/models/loginHistory';
import { Notification } from '~/models/notification';
import { WalletHistory } from '~/models/walletHistory';
import { OrderTemplate } from '~/models/orderTemplate';
import { OrderCloudServer } from '~/models/orderCloudServer';
import { CloudServerImage } from '~/models/cloudServerImage';
import { CloudServerRegion } from '~/models/cloudServerRegion';
import { CloudServerProduct } from '~/models/cloudServerProduct';

const controlDeleteAllDatabase = async (req, res) => {
    try {
        await Apikey.deleteMany({});
        await Api.deleteMany({});
        await App.deleteMany({});
        await BonusPoint.deleteMany({});
        await CartProduct.deleteMany({});
        await Cart.deleteMany({});
        await CloudServerImage.deleteMany({});
        await CloudServerProduct.deleteMany({});
        await CloudServerRegion.deleteMany({});
        await OrderCloudServer.deleteMany({});
        await Cycles.deleteMany({});
        await Invoice.deleteMany({});
        await Localbank.deleteMany({});
        await LoginHistory.deleteMany({});
        await Membership.deleteMany({});
        await Notification.deleteMany({});
        await Order.deleteMany({});
        await OrderTemplate.deleteMany({});
        await Partner.deleteMany({});
        await Paygate.deleteMany({});
        await Player.deleteMany({});
        await Pricing.deleteMany({});
        await Request.deleteMany({});
        await Source.deleteMany({});
        await Template.deleteMany({});
        await Token.deleteMany({});
        await Userbank.deleteMany({});
        await User.deleteMany({});
        await WalletHistory.deleteMany({});
        await Wallet.deleteMany({});

        res.status(200).json({
            status: 200,
            data: true,
            message: 'Xóa dữ liệu databases thành công',
        });
    } catch (error) {
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlDeleteAllDatabase };
