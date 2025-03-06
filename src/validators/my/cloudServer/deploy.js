import { Pricing } from '~/models/pricing';
import { isValidDataId } from '~/validators';
import { CloudServerImage } from '~/models/cloudServerImage';
import { CloudServerRegion } from '~/models/cloudServerRegion';
import { CloudServerProduct } from '~/models/cloudServerProduct';

const validateDisplayName = (names) => {
    for (const name of names) {
        // Kiểm tra độ dài
        if (name.length < 4 || name.length > 40) {
            return 'Tên phải từ 6 đến 30 ký tự.';
        }

        // Kiểm tra ký tự hợp lệ
        if (!/^[A-Za-z0-9_-]+$/.test(name)) {
            return 'Tên chỉ được chứa chữ cái, số, dấu gạch dưới (_) và dấu gạch ngang (-).';
        }

        // Kiểm tra không bắt đầu hoặc kết thúc bằng ký tự đặc biệt
        if (/^[-_]/.test(name) || /[-_]$/.test(name)) {
            return 'Tên máy chủ không được bắt đầu hoặc kết thúc bằng dấu (-) và (_).';
        }
    }

    // Nếu tất cả hợp lệ
    return '';
};

const validatorUserDeployCloudServer = async (body) => {
    try {
        const { display_name, image_id, plan_id, pricing_id, product_id, region_id } = body;

        if (typeof display_name !== 'object') {
            return { success: false, status: 400, error: 'Tên máy chủ phải là một mảng' };
        }
        if (display_name.length < 1 || display_name.length > 10) {
            return { success: false, status: 400, error: 'Số lượng máy chủ muốn tạo tối ta 10' };
        }

        const isValidate = validateDisplayName(display_name);
        if (isValidate) {
            return { success: false, status: 400, error: 'Tên máy chủ muốn tạo không hợp lệ' };
        }

        if (!isValidDataId(plan_id)) {
            return { success: false, status: 400, error: 'Loại máy chủ không hợp lệ' };
        }
        if (!isValidDataId(region_id)) {
            return { success: false, status: 400, error: 'Khu vực máy chủ không hợp lệ' };
        }
        if (!isValidDataId(image_id)) {
            return { success: false, status: 400, error: 'Hệ điều hành không hợp lệ' };
        }
        if (!isValidDataId(pricing_id)) {
            return { success: false, status: 400, error: 'Chu kỳ thanh toán không hợp lệ' };
        }
        if (!isValidDataId(product_id)) {
            return { success: false, status: 400, error: 'Gói dịch vụ máy chủ không hợp lệ' };
        }

        const region = await CloudServerRegion.findOne({ id: region_id, status: true }).select('id title image_url');
        if (!region) {
            return { success: false, status: 400, error: 'Khu vực máy chủ không tồn tại' };
        }

        const image = await CloudServerImage.findOne({ id: image_id, status: true }).select('id title group code image_url');
        if (!image) {
            return { success: false, status: 400, error: 'Hệ điều hành máy chủ không tồn tại' };
        }

        const product = await CloudServerProduct.findOne({ id: product_id, status: true }).select(
            'id title code core memory disk bandwidth network_speed network_port network_inter ipv4 ipv6 customize sold_out',
        );
        if (!product) {
            return { success: false, status: 400, error: 'Gói dịch vụ máy chủ không tồn tại' };
        }
        if (product.sold_out) {
            return { success: false, status: 400, error: 'Gói dịch vụ máy chủ đã hết hàng' };
        }

        const pricing = await Pricing.findOne({ id: pricing_id, service_id: product._id, service_type: 'CloudServerProduct' })
            .select(
                'id cycles_id original_price price discount creation_fee penalty_fee renewal_fee upgrade_fee cancellation_fee other_fees bonus_point',
            )
            .populate({
                path: 'cycles_id',
                select: 'id value unit display_name',
            });
        if (!pricing) {
            return { success: false, status: 400, error: 'Chu kỳ thanh toán máy chủ không tồn tại' };
        }

        const data = {
            plan,
            image,
            region,
            partner,
            pricing,
            product,
        };

        return { success: true, status: 200, data };
    } catch (error) {
        return { success: false, status: 400, error: 'Lỗi kiểm tra đơn tạo máy chủ' };
    }
};

export { validatorUserDeployCloudServer };
