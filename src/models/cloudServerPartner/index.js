import mongoose, { Schema } from 'mongoose';
import { generateRandomNumber } from '~/configs';

const cloudServerPartnerSchema = new Schema({
    id: {
        type: Number,
        unique: true,
        required: true,
        immutable: true,
    },
    name: {
        type: String,
        required: true,
    },
    url: {
        type: String,
        required: true,
    },
    key: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    node_select: {
        type: String,
        required: true,
    },
    status: {
        type: Boolean,
        default: true,
    },
    description: {
        type: String,
        default: '',
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

cloudServerPartnerSchema.pre('validate', async function (next) {
    if (this.isNew && !this.id) {
        let id;
        let unique = false;

        while (!unique) {
            id = generateRandomNumber(8, 8);

            const exist = await mongoose.models.CloudServerPartner.findOne({ id });
            if (!exist) {
                unique = true;
            }
        }

        this.id = id;
    }

    next();
});

export const CloudServerPartner = mongoose.model('CloudServerPartner', cloudServerPartnerSchema);
