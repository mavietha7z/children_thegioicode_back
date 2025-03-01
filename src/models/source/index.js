import mongoose, { Schema } from 'mongoose';
import { generateRandomNumber } from '~/configs';

const sourceSchema = new Schema({
    id: {
        type: Number,
        unique: true,
        required: true,
        immutable: true,
    },
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    slug_url: {
        type: String,
        unique: true,
        required: true,
    },
    description: {
        type: String,
        default: '',
    },
    priority: {
        type: Number,
        required: true,
    },
    image_url: {
        type: String,
        default: '',
    },
    image_meta: [
        {
            type: String,
        },
    ],
    status: {
        type: Boolean,
        default: false,
    },
    published: {
        type: Boolean,
        default: false,
    },
    view_count: {
        type: Number,
        default: 0,
    },
    purchase_count: {
        type: Number,
        default: 0,
    },
    category: [
        {
            type: String,
            enum: ['phishing', 'commerce', 'service'],
        },
    ],
    languages: [
        {
            type: String,
        },
    ],
    data_url: {
        type: String,
        default: '',
    },
    demo_url: {
        type: String,
        default: '',
    },
    version: {
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

sourceSchema.pre('validate', async function (next) {
    if (this.isNew && !this.id) {
        let id;
        let unique = false;

        while (!unique) {
            id = generateRandomNumber(8, 8);

            const exist = await mongoose.models.Source.findOne({ id });
            if (!exist) {
                unique = true;
            }
        }

        this.id = id;
    }

    next();
});

export const Source = mongoose.model('Source', sourceSchema);
