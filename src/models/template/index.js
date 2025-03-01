import mongoose, { Schema } from 'mongoose';
import { generateRandomNumber } from '~/configs';

const templateSchema = new Schema({
    id: {
        type: Number,
        unique: true,
        required: true,
        immutable: true,
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
    modules: [
        {
            _id: false,
            modun: {
                type: String,
                required: true,
            },
            content: {
                type: String,
                required: true,
            },
            include: {
                type: Boolean,
                default: true,
            },
            description: [
                {
                    type: String,
                },
            ],
        },
    ],
    additional_services: [
        {
            required: {
                type: Boolean,
                default: false,
            },
            service_type: {
                type: String,
                enum: ['CloudServer'],
                required: true,
            },
            service_id: {
                type: Schema.Types.ObjectId,
                ref: 'CloudServerProduct',
                required: true,
            },
        },
    ],
    view_count: {
        type: Number,
        default: 0,
    },
    create_count: {
        type: Number,
        default: 0,
    },
    demo_url: {
        type: String,
        default: '',
    },
    version: {
        type: String,
        default: '',
    },
    status: {
        type: Boolean,
        default: false,
    },
    updated_at: {
        type: Date,
        default: Date.now,
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
});

templateSchema.pre('validate', async function (next) {
    if (this.isNew && !this.id) {
        let id;
        let unique = false;

        while (!unique) {
            id = generateRandomNumber(8, 8);

            const exist = await mongoose.models.Template.findOne({ id });
            if (!exist) {
                unique = true;
            }
        }

        this.id = id;
    }

    next();
});

export const Template = mongoose.model('Template', templateSchema);
