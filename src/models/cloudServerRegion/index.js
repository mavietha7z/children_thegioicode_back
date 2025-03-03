import mongoose, { Schema } from 'mongoose';
import { generateRandomNumber } from '~/configs';

const cloudServerRegionSchema = new Schema({
    id: {
        type: Number,
        unique: true,
        required: true,
        immutable: true,
    },
    partner_id: {
        type: Number,
        unique: true,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    priority: {
        type: Number,
        required: true,
    },
    image_url: {
        type: String,
        required: true,
    },
    plans: [
        {
            _id: false,
            id: {
                type: Number,
                unique: true,
                required: true,
            },
            title: {
                type: String,
                required: true,
            },
            image_url: {
                type: String,
                required: true,
            },
            description: {
                type: String,
                required: true,
            },
        },
    ],
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

cloudServerRegionSchema.pre('validate', async function (next) {
    if (this.isNew && !this.id) {
        let id;
        let unique = false;

        while (!unique) {
            id = generateRandomNumber(8, 8);

            const exist = await mongoose.models.CloudServerRegion.findOne({ id });
            if (!exist) {
                unique = true;
            }
        }

        this.id = id;
    }

    next();
});

export const CloudServerRegion = mongoose.model('CloudServerRegion', cloudServerRegionSchema);
