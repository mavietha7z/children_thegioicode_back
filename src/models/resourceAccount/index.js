import mongoose, { Schema } from 'mongoose';
import { generateRandomNumber } from '~/configs';

const resourceAccountSchema = new Schema({
    id: {
        type: Number,
        required: true,
        unique: true,
        immutable: true,
    },
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    product_id: {
        type: Schema.Types.ObjectId,
        ref: 'ResourceProduct',
        required: true,
    },
    username: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        default: '',
    },
    sold: {
        type: Boolean,
        default: false,
    },
    status: {
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
});

resourceAccountSchema.pre('validate', async function (next) {
    if (this.isNew && !this.id) {
        let id;
        let unique = false;

        while (!unique) {
            id = generateRandomNumber(8, 8);

            const exist = await mongoose.models.ResourceAccount.findOne({ id });
            if (!exist) {
                unique = true;
            }
        }

        this.id = id;
    }

    next();
});

export const ResourceAccount = mongoose.model('ResourceAccount', resourceAccountSchema);
