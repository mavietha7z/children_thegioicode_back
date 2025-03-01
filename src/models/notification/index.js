import mongoose, { Schema } from 'mongoose';
import { generateRandomNumber } from '~/configs';

const notificationSchema = new Schema({
    id: {
        type: Number,
        required: true,
        immutable: true,
        unique: true,
    },
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    service: {
        type: String,
        enum: ['Web', 'Email'],
        required: true,
    },
    message_id: {
        type: String,
        default: null,
    },
    from: {
        type: String,
        default: null,
    },
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    note: {
        type: String,
        default: null,
    },
    reason_failed: {
        type: String,
        default: null,
    },
    status: {
        type: String,
        enum: ['pending', 'sent', 'failed'],
        required: true,
    },
    unread: {
        type: Boolean,
        default: true,
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
    updated_at: {
        type: Date,
        default: Date.now,
    },
    sent_at: {
        type: Date,
        default: null,
    },
});

notificationSchema.pre('validate', async function (next) {
    if (this.isNew && !this.id) {
        let id;
        let unique = false;

        while (!unique) {
            id = generateRandomNumber(8, 8);

            const exist = await mongoose.models.Notification.findOne({ id });
            if (!exist) {
                unique = true;
            }
        }
        this.id = id;
    }

    next();
});

export const Notification = mongoose.model('Notification', notificationSchema);
