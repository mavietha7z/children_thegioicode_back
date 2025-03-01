const validatorAuthUpdatePricing = async (req, res, next) => {
    const { type } = req.query;

    if (!['status', 'info'].includes(type)) {
        return res.status(400).json({ error: 'Tham số truy vấn không hợp lệ' });
    }

    if (type === 'info') {
        const {
            price,
            discount,
            other_fees,
            bonus_point,
            penalty_fee,
            renewal_fee,
            upgrade_fee,
            service_type,
            creation_fee,
            brokerage_fee,
            cancellation_fee,
        } = req.body;

        if (typeof price !== 'number' || price < 0) {
            return res.status(400).json({ error: 'Giá phải là số và lớn hơn 0' });
        }
        if (typeof discount !== 'number' || discount < 0 || discount > 100) {
            return res.status(400).json({ error: 'Giảm giá phải là số và từ 1 -> 100' });
        }
        if (typeof other_fees !== 'number' || other_fees < 0) {
            return res.status(400).json({ error: 'Phí khác phải là số và lớn hơn 0' });
        }
        if (typeof bonus_point !== 'number' || bonus_point < 0) {
            return res.status(400).json({ error: 'Điểm thưởng phải là số và lớn hơn 0' });
        }
        if (typeof penalty_fee !== 'number' || penalty_fee < 0) {
            return res.status(400).json({ error: 'Phí phạt phải là số và lớn hơn 0' });
        }
        if (typeof renewal_fee !== 'number' || renewal_fee < 0) {
            return res.status(400).json({ error: 'Phí gia hạn phải là số và lớn hơn 0' });
        }
        if (typeof upgrade_fee !== 'number' || upgrade_fee < 0) {
            return res.status(400).json({ error: 'Phí nâng cấp phải là số và lớn hơn 0' });
        }
        if (typeof creation_fee !== 'number' || creation_fee < 0) {
            return res.status(400).json({ error: 'Phí tạo phải là số và lớn hơn 0' });
        }
        if (typeof brokerage_fee !== 'number' || brokerage_fee < 0) {
            return res.status(400).json({ error: 'Phí môi giới là số và lớn hơn 0' });
        }
        if (typeof cancellation_fee !== 'number' || cancellation_fee < 0 || cancellation_fee > 100) {
            return res.status(400).json({ error: 'Phí hủy phải là số và và từ 1 -> 100' });
        }
        if (!service_type || !['Template', 'Source', 'CloudServerProduct'].includes(service_type)) {
            return res.status(400).json({ error: 'Loại dịch vụ không hợp lệ' });
        }
        return next();
    }

    next();
};

export { validatorAuthUpdatePricing };
