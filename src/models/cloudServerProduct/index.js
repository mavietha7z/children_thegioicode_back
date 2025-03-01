import mongoose, { Schema } from 'mongoose';
import { generateRandomNumber } from '~/configs';

const loudServerProductSchema = new Schema({
    id: {
        type: Number,
        unique: true,
        required: true,
        immutable: true,
    },
    plan_id: {
        type: Schema.Types.ObjectId,
        ref: 'CloudServerPlan',
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    code: {
        type: String,
        required: true,
    },
    priority: {
        type: Number,
        default: 1,
    },
    core: {
        type: Number,
        default: 1,
    },
    core_info: {
        type: String,
        required: true,
    },
    memory: {
        type: Number,
        default: 1,
    },
    memory_info: {
        type: String,
        required: true,
    },
    disk: {
        type: Number,
        min: 20,
        max: 240,
        default: 20,
    },
    disk_info: {
        type: String,
        required: true,
    },
    bandwidth: {
        type: Number,
        default: 0,
    },
    network_speed: {
        type: Number,
        default: 0,
    },
    network_port: {
        type: Number,
        default: 0,
    },
    network_inter: {
        type: Number,
        default: 0,
    },
    commit: {
        type: String,
        required: true,
    },
    support: {
        type: String,
        required: true,
    },
    ipv4: {
        type: Number,
        default: 1,
    },
    ipv6: {
        type: Number,
        default: 0,
    },
    customize: {
        type: Boolean,
        default: false,
    },
    customize_config: {
        min_core: {
            type: Number,
            default: 1,
        },
        max_core: {
            type: Number,
            default: 16,
        },
        min_memory: {
            type: Number,
            default: 1,
        },
        max_memory: {
            type: Number,
            default: 32,
        },
        min_disk: {
            type: Number,
            default: 20,
        },
        max_disk: {
            type: Number,
            default: 240,
        },
    },
    sold_out: {
        type: Boolean,
        default: false,
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

loudServerProductSchema.pre('validate', async function (next) {
    if (this.isNew && !this.id) {
        let id;
        let unique = false;

        while (!unique) {
            id = generateRandomNumber(8, 8);

            const exist = await mongoose.models.CloudServerProduct.findOne({ id });
            if (!exist) {
                unique = true;
            }
        }

        this.id = id;
    }

    next();
});

export const CloudServerProduct = mongoose.model('CloudServerProduct', loudServerProductSchema);
