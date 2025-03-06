import bcrypt from 'bcrypt';
import { Api } from '~/models/api';
import { App } from '~/models/app';
import { v4 as uuidv4 } from 'uuid';
import { User } from '~/models/user';
import { Cart } from '~/models/cart';
import { Wallet } from '~/models/wallet';
import { Cycles } from '~/models/cycles';
import { Apikey } from '~/models/apikey';
import { configCreateLog } from '~/configs';
import { Membership } from '~/models/membership';
import { infoApp, infoAuth, infoCycles, infoMemberships } from '~/configs/database';

const controlAuthInitializeDatabase = async (req, res) => {
    try {
        // Membership
        for (let i = 0; i < infoMemberships.length; i++) {
            const membership = infoMemberships[i];
            const isMembership = await Membership.findOne({ name: membership.name });
            if (!isMembership) {
                await new Membership({
                    name: membership.name,
                    achieve_point: membership.achieve_point,
                    discount: membership.discount,
                }).save();
            }
        }

        // Auth
        const isAuth = await User.findOne({ email: infoAuth.email });
        if (!isAuth) {
            const salt = await bcrypt.genSalt(10);
            const hashed = await bcrypt.hash(infoAuth.password, salt);

            const memberships = await Membership.find({}).sort({ achieve_point: 1 }).limit(2);
            if (memberships.length < 2) {
                return;
            }

            const membership = {
                current: memberships[0]._id,
                next_membership: memberships[1]._id,
            };

            const newUser = await new User({
                membership,
                role: infoAuth.role,
                email: infoAuth.email,
                username: infoAuth.username,
                last_name: infoAuth.last_name,
                full_name: infoAuth.full_name,
                first_name: infoAuth.first_name,
                password: hashed,
                email_verified: true,
                register_type: 'email',
                admin: infoAuth.admin,
            }).save();

            await new Cart({ user_id: newUser._id }).save();
            await new Wallet({ user_id: newUser._id }).save();

            const apis = await Api.find({});
            for (let i = 0; i < apis.length; i++) {
                const api = apis[i];

                await new Apikey({
                    user_id: newUser._id,
                    service_id: api._id,
                    service_type: 'Api',
                    free_usage: api.free_usage,
                    webhooks: {
                        url: [],
                        security_key: '',
                    },
                    key: `SV-${uuidv4()}`,
                    category: api.category,
                }).save();
            }
        }

        // App
        const isApp = await App.findOne({});
        if (!isApp) {
            await new App({ ...infoApp }).save();
        }

        // Cycles
        for (let i = 0; i < infoCycles.length; i++) {
            const cycles = infoCycles[i];
            const isCycles = await Cycles.findOne({ value: cycles.value, unit: cycles.unit, display_name: cycles.display_name });
            if (!isCycles) {
                await new Cycles({
                    ...cycles,
                }).save();
            }
        }
    } catch (error) {
        configCreateLog('controllers/database/create.log', 'controlAuthInitializeDatabase', error.message);
    }
};

export { controlAuthInitializeDatabase };
