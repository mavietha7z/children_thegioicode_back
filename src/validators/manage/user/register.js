import { validatorRegister } from '~/validators/auth/register';

const validatorAuthRegisterUser = (req, res, next) => {
    const { role } = req.body;

    validatorRegister(req, res, async () => {
        if (role) {
            for (let i = 0; i < role.length; i++) {
                if (
                    role[i] !== 'user' &&
                    role[i] !== 'create' &&
                    role[i] !== 'edit' &&
                    role[i] !== 'list' &&
                    role[i] !== 'delete' &&
                    role[i] !== 'view'
                ) {
                    return res.status(400).json({
                        error: 'Vai trò tài khoản không hợp lệ',
                    });
                }
            }
        }

        next();
    });
};

export { validatorAuthRegisterUser };
