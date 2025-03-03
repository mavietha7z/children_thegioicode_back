import { Api } from '~/models/api';
import { App } from '~/models/app';
import { Cart } from '~/models/cart';
import { User } from '~/models/user';
import { Order } from '~/models/order';
import { Token } from '~/models/token';
import { Wallet } from '~/models/wallet';
import { Player } from '~/models/player';
import { Source } from '~/models/source';
import { Cycles } from '~/models/cycles';
import { Apikey } from '~/models/apikey';
import { Request } from '~/models/request';
import { Invoice } from '~/models/invoice';
import { Paygate } from '~/models/paygate';
import { Pricing } from '~/models/pricing';
import { Userbank } from '~/models/userbank';
import { Template } from '~/models/template';
import { Localbank } from '~/models/localbank';
import { Membership } from '~/models/membership';
import { BonusPoint } from '~/models/bonusPoint';
import { CartProduct } from '~/models/cartProduct';
import { LoginHistory } from '~/models/loginHistory';
import { Notification } from '~/models/notification';
import { WalletHistory } from '~/models/walletHistory';
import { OrderTemplate } from '~/models/orderTemplate';
import { OrderCloudServer } from '~/models/orderCloudServer';
import { CloudServerImage } from '~/models/cloudServerImage';
import { CloudServerRegion } from '~/models/cloudServerRegion';
import { CloudServerPartner } from '~/models/partner';
import { CloudServerProduct } from '~/models/cloudServerProduct';

const serviceModelMapDatabase = {
    Apis: { model: Api, type: 'Apis' },
    Apps: { model: App, type: 'Apps' },
    Carts: { model: Cart, type: 'Carts' },
    Users: { model: User, type: 'Users' },
    Orders: { model: Order, type: 'Orders' },
    Tokens: { model: Token, type: 'Tokens' },
    Cycles: { model: Cycles, type: 'Cycles' },
    ApiKeys: { model: Apikey, type: 'ApiKeys' },
    Wallets: { model: Wallet, type: 'Wallets' },
    Sources: { model: Source, type: 'Sources' },
    Players: { model: Player, type: 'Players' },
    Invoices: { model: Invoice, type: 'Invoices' },
    Requests: { model: Request, type: 'Requests' },
    Paygates: { model: Paygate, type: 'Paygates' },
    Pricings: { model: Pricing, type: 'Pricings' },
    Userbanks: { model: Userbank, type: 'Userbanks' },
    Templates: { model: Template, type: 'Templates' },
    Localbanks: { model: Localbank, type: 'Localbanks' },
    BonusPoints: { model: BonusPoint, type: 'BonusPoints' },
    Memberships: { model: Membership, type: 'Memberships' },
    CartProducts: { model: CartProduct, type: 'CartProducts' },
    Notifications: { model: Notification, type: 'Notifications' },
    LoginHistories: { model: LoginHistory, type: 'LoginHistories' },
    OrderTemplates: { model: OrderTemplate, type: 'OrderTemplates' },
    WalletHistories: { model: WalletHistory, type: 'WalletHistories' },
    CloudServerImages: { model: CloudServerImage, type: 'CloudServerImages' },
    OrderCloudServers: { model: OrderCloudServer, type: 'OrderCloudServers' },
    CloudServerRegions: { model: CloudServerRegion, type: 'CloudServerRegions' },
    CloudServerPartners: { model: CloudServerPartner, type: 'CloudServerPartners' },
    CloudServerProducts: { model: CloudServerProduct, type: 'CloudServerProducts' },
};

const serviceFetchExportDatabase = async (model, type) => {
    const result = await model.find({}).sort({ created_at: 1 });
    const jsonData = JSON.stringify(result);

    return JSON.parse(jsonData).map((data) => {
        const originalKeys = Object.keys(data);

        let tempData = {
            ...data,
            _id: { $oid: data._id },
            created_at: { $date: data.created_at },
            updated_at: { $date: data.updated_at },
        };

        if (
            type === 'Carts' ||
            type === 'Orders' ||
            type === 'Tokens' ||
            type === 'Sources' ||
            type === 'ApiKeys' ||
            type === 'Wallets' ||
            type === 'Invoices' ||
            type === 'Requests' ||
            type === 'Userbanks' ||
            type === 'BonusPoints' ||
            type === 'CartProducts' ||
            type === 'Notifications' ||
            type === 'LoginHistories' ||
            type === 'OrderTemplates' ||
            type === 'WalletHistories' ||
            type === 'OrderCloudServers'
        ) {
            tempData.user_id = { $oid: data.user_id };
        }

        // ApiKeys
        if (type === 'ApiKeys') {
            tempData.service_id = { $oid: data.service_id };
        }

        // BonusPoints
        if (type === 'BonusPoints') {
            tempData.wallet_id = { $oid: data.wallet_id };
        }

        // CartProducts
        if (type === 'CartProducts') {
            tempData.cart_id = { $oid: data.cart_id };
            tempData.product_id = { $oid: data.product_id };
            tempData.pricing_id = { $oid: data.pricing_id };

            if (data.partner_service_id) {
                tempData.partner_service_id = { $oid: data.partner_service_id };
            }
            if (data.coupon_id) {
                tempData.coupon_id = { $oid: data.coupon_id };
            }
            if (data.partner_id) {
                tempData.partner_id = { $oid: data.partner_id };
            }
            if (data.plan_id) {
                tempData.plan_id = { $oid: data.plan_id };
            }
            if (data.region_id) {
                tempData.region_id = { $oid: data.region_id };
            }
            if (data.image_id) {
                tempData.image_id = { $oid: data.image_id };
            }
            if (data.additional_services.length > 0) {
                tempData.additional_services = data.additional_services.map((service) => {
                    const { required, service_type, service_id } = service;

                    return {
                        required,
                        service_type,
                        service_id: { $oid: service_id },
                    };
                });
            }
        }

        // CloudServerRegions
        if (type === 'CloudServerRegions') {
            tempData.plans = data.plans.map((plan) => ({ $oid: plan }));
        }

        // CloudServerProducts
        if (type === 'CloudServerProducts') {
            tempData.plan_id = { $oid: data.plan_id };
        }

        // Invoices
        if (type === 'Invoices') {
            tempData.expired_at = { $date: data.expired_at };
            tempData.processed_at = { $date: data.processed_at };

            if (data.userbank_id) {
                tempData.userbank_id = { $oid: data.userbank_id };
            }
        }

        // Notifications
        if (type === 'Notifications') {
            if (data.sent_at) {
                tempData.sent_at = { $date: data.sent_at };
            }
        }

        // OrderCloudServers
        if (type === 'OrderCloudServers') {
            tempData.plan_id = { $oid: data.plan_id };
            tempData.image_id = { $oid: data.image_id };
            tempData.region_id = { $oid: data.region_id };
            tempData.product_id = { $oid: data.product_id };
            tempData.pricing_id = { $oid: data.pricing_id };
            tempData.expired_at = { $date: data.expired_at };
        }

        // Orders
        if (type === 'Orders') {
            tempData.paid_at = { $date: data.paid_at };
            tempData.expired_at = { $date: data.expired_at };
            tempData.products = data.products.map((product) => {
                const { pricing_id, product_id, cart_product_id: cartProductID, ...others } = product;

                let cart_product_id = null;
                if (cartProductID) {
                    cart_product_id = { $oid: cartProductID };
                }

                return {
                    ...others,
                    cart_product_id,
                    product_id: { $oid: product_id },
                    pricing_id: { $oid: pricing_id },
                };
            });
        }

        // OrderTemplates
        if (type === 'OrderTemplates') {
            tempData.template_id = { $oid: data.template_id };
            tempData.pricing_id = { $oid: data.pricing_id };
            tempData.expired_at = { $date: data.expired_at };
            tempData.cloudflare.created_on = { $date: data.cloudflare.created_on };
            tempData.cloudflare.modified_on = { $date: data.cloudflare.modified_on };
            tempData.cloudflare.activated_on = { $date: data.cloudflare.activated_on };
        }

        // PartnerServices
        if (type === 'PartnerServices') {
            tempData.partner_id = { $oid: data.partner_id };
        }

        // Paygates
        if (type === 'Paygates') {
            tempData.options = data.options.map((option) => {
                const { userbank_id, status, created_at, updated_at } = option;

                return {
                    userbank_id: { $oid: userbank_id },
                    status: status,
                    created_at: { $date: created_at },
                    updated_at: { $date: updated_at },
                };
            });
        }

        // Players - Requests
        if (type === 'Players' || type === 'Requests') {
            tempData.service_id = { $oid: data.service_id };
        }

        // Pricings
        if (type === 'Pricings') {
            tempData.service_id = { $oid: data.service_id };
            tempData.cycles_id = { $oid: data.cycles_id };
        }

        // Tokens
        if (type === 'Tokens') {
            tempData.expired_at = { $date: data.expired_at };
        }

        // Userbanks
        if (type === 'Userbanks') {
            tempData.localbank_id = { $oid: data.localbank_id };
        }

        // Users
        if (type === 'Users') {
            if (data.birthday) {
                tempData.birthday = { $date: data.birthday };
            }
            if (data.last_login_at) {
                tempData.last_login_at = { $date: data.last_login_at };
            }
            tempData.membership = {
                current: { $oid: data.membership.current },
                next_membership: { $oid: data.membership.next_membership },
            };
        }

        // Wallets
        if (type === 'Wallets') {
            if (data.expired_at) {
                tempData.expired_at = { $date: data.expired_at };
            }

            if (data.bonus_point_expiry) {
                tempData.bonus_point_expiry = { $date: data.bonus_point_expiry };
            }
        }

        let newData = {};
        originalKeys.forEach((key) => {
            newData[key] = tempData[key];
        });

        return newData;
    });
};

export { serviceModelMapDatabase, serviceFetchExportDatabase };
