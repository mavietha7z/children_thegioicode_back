const OPTIONS = [
    'ApiKeys',
    'Apis',
    'Apps',
    'BonusPoints',
    'CartProducts',
    'Carts',
    'CloudServerImages',
    'CloudServerPartners',
    'CloudServerPlans',
    'CloudServerProducts',
    'CloudServerRegions',
    'Cycles',
    'Invoices',
    'Localbanks',
    'LoginHistories',
    'Memberships',
    'Notifications',
    'OrderCloudServers',
    'Orders',
    'OrderTemplates',
    'Paygates',
    'Players',
    'Pricings',
    'Requests',
    'ResourceAccounts',
    'ResourceCategories',
    'Sources',
    'Templates',
    'Tokens',
    'Userbanks',
    'Users',
    'WalletHistories',
    'Wallets',
];

const validatorAuthExportDatabase = (req, res, next) => {
    const data = req.body;

    for (let i = 0; i < data.length; i++) {
        const element = data[i];

        if (!OPTIONS.includes(element)) {
            return res.status(400).json({
                error: `Truy vấn dữ liệu ${element} không hợp lệ`,
            });
        }
    }

    next();
};

export { validatorAuthExportDatabase };
