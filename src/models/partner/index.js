import mongoose, { Schema } from 'mongoose';
import { generateRandomNumber } from '~/configs';

const partnerSchema = new Schema({
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
    token: {
        type: String,
        required: true,
    },
    difference_cloud_server: {
        type: Number,
        default: 0,
    },
    difference_public_api: {
        type: Number,
        default: 0,
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

partnerSchema.pre('validate', async function (next) {
    if (this.isNew && !this.id) {
        let id;
        let unique = false;

        while (!unique) {
            id = generateRandomNumber(8, 8);

            const exist = await mongoose.models.Partner.findOne({ id });
            if (!exist) {
                unique = true;
            }
        }

        this.id = id;
    }

    next();
});

export const Partner = mongoose.model('Partner', partnerSchema);
