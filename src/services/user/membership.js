import { User } from '~/models/user';
import { Wallet } from '~/models/wallet';
import { configCreateLog } from '~/configs';
import { Membership } from '~/models/membership';
import { sendMessageBotTelegramError } from '~/bot';
import { serviceCreateNotificationUser } from './notification';

const serviceMembershipUser = async (user_id) => {
    try {
        const user = await User.findById(user_id)
            .select('membership')
            .populate({
                path: 'membership.current',
            })
            .populate({
                path: 'membership.next_membership',
            });
        if (!user) {
            throw new Error('Khách hàng không tồn tại');
        }

        const wallet = await Wallet.findOne({ user_id }).select('total_bonus_point');
        if (!wallet) {
            throw new Error('Ví khách hàng không tồn tại');
        }

        // Tìm tất cả membership và sắp xếp theo điểm yêu cầu (achieve_point) tăng dần
        const allMembership = await Membership.find({}).sort({ achieve_point: 1 });
        if (allMembership.length < 1) {
            throw new Error('Không tìm thấy bậc thành viên nào');
        }

        // Tìm vị trí của membership tiếp theo
        const nextMembershipIndex = allMembership.findIndex(
            (membership) => membership._id.toString() === user.membership.next_membership._id.toString(),
        );
        if (nextMembershipIndex === -1) {
            throw new Error('Không tìm thấy bậc thành viên tiếp theo');
        }

        if (user.membership.next_membership && wallet.total_bonus_point >= user.membership.next_membership.achieve_point) {
            const nameCurrentMembership = user.membership.current.name;
            const nameNextMembership = user.membership.next_membership.name;
            const disCountNextMembership = user.membership.next_membership.discount;

            // Thông báo email
            await serviceCreateNotificationUser(
                user._id,
                'Email',
                'Chúc mừng nâng hạng thành viên',
                `Chúc mừng quý khách đã được thăng hạng thành viên từ <b>${nameCurrentMembership.toUpperCase()}</b> lên <b>${nameNextMembership.toUpperCase()}</b>, sau khi nâng hạng tất cả dịch vụ của quý khách sẽ được giảm giá <b>${disCountNextMembership}%</b>.`,
                'Hạng thành viên đã được thăng không thể hoàn tác.',
            );

            // Thông báo web
            await serviceCreateNotificationUser(
                user._id,
                'Web',
                'Chúc mừng nâng hạng thành viên',
                `Chúc mừng quý khách đã được thăng hạng thành viên từ ${nameCurrentMembership.toUpperCase()} lên ${nameNextMembership.toUpperCase()}, sau khi nâng hạng tất cả dịch vụ của quý khách sẽ được giảm giá ${disCountNextMembership}%. Trân trọng!`,
            );

            // Tìm bậc tiếp theo mà điểm của người dùng đủ điều kiện
            const nextMembership = allMembership[nextMembershipIndex + 1];
            if (nextMembership) {
                user.membership.current = user.membership.next_membership._id;
                user.membership.next_membership = nextMembership._id;
            } else {
                user.membership.current = user.membership.next_membership._id;
                user.membership.next_membership = null;
            }

            await user.save();
        }
    } catch (error) {
        sendMessageBotTelegramError(`Lỗi xử lý membership: \n\n ${error.message}`);
        configCreateLog('services/user/membership.log', 'serviceMembershipUser', error.message);
    }
};

export { serviceMembershipUser };
