import mongoose, { Schema } from 'mongoose';
import { generateRandomNumber } from '~/configs';

const partnerSchema = new Schema({
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
    token: {
        type: String,
        required: true,
    },
    whitelist_ip: [
        {
            type: String,
            required: true,
        },
    ],
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

partnerSchema.pre('validate', async function (next) {
    if (this.isNew && !this.id) {
        let id;
        let unique = false;

        while (!unique) {
            id = generateRandomNumber(8, 8);

            const exist = await mongoose.models.Partner.findOne({ id: id });
            if (!exist) {
                unique = true;
            }
        }

        this.id = id;
    }

    next();
});

export const Partner = mongoose.model('Partner', partnerSchema);
