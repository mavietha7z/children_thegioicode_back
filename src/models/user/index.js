import mongoose, { Schema } from 'mongoose';
import { generateRandomNumber } from '~/configs';

const userSchema = new Schema({
    id: {
        type: Number,
        required: true,
        unique: true,
        immutable: true,
    },
    first_name: {
        type: String,
        required: true,
    },
    last_name: {
        type: String,
        required: true,
    },
    full_name: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        unique: true,
        required: true,
        lowercase: true,
    },
    phone_number: {
        type: String,
        default: '',
    },
    phone_verified: {
        type: Boolean,
        default: false,
    },
    email: {
        type: String,
        unique: true,
        required: true,
        lowercase: true,
    },
    email_verified: {
        type: Boolean,
        default: false,
    },
    register_type: {
        type: String,
        enum: ['facebook', 'google', 'github', 'email', 'phone'],
        default: 'email',
    },
    password: {
        type: String,
        required: true,
    },
    admin: {
        type: Boolean,
        default: false,
    },
    role: [
        {
            type: String,
            enum: ['admin', 'create', 'view', 'edit', 'delete', 'user'],
        },
    ],
    status: {
        type: String,
        enum: ['activated', 'inactivated', 'blocked'],
        required: true,
    },
    membership: {
        current: {
            type: Schema.Types.ObjectId,
            ref: 'Membership',
            required: true,
        },
        next_membership: {
            type: Schema.Types.ObjectId,
            ref: 'Membership',
            required: true,
        },
    },
    birthday: {
        type: Date,
        default: null,
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other'],
        default: 'other',
    },
    avatar_url: {
        type: String,
        default: '',
    },
    cover_url: {
        type: String,
        default: '',
    },
    notification_configs: [
        {
            _id: false,
            name: {
                type: String,
                required: true,
            },
            is_active: {
                type: Boolean,
                default: false,
            },
            secret_code: {
                type: String,
                default: null,
            },
        },
    ],
    two_factor_auth: {
        name: {
            type: String,
            enum: ['Email', 'Google'],
            default: null,
        },
        is_active: {
            type: Boolean,
            default: false,
        },
        secret_code: {
            type: String,
            default: null,
        },
    },
    account_configs: {
        language: {
            type: String,
            enum: ['vi', 'en'],
            default: 'vi',
        },
        mode: {
            type: String,
            enum: ['dark', 'light'],
            default: 'light',
        },
    },
    location: {
        address: {
            type: String,
            default: '',
        },
        city: {
            type: String,
            default: '',
        },
        country: {
            type: String,
            default: 'VN',
        },
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
    updated_at: {
        type: Date,
        default: Date.now,
    },
    last_login_at: {
        type: Date,
        default: null,
    },
});

userSchema.pre('validate', async function (next) {
    if (this.isNew && !this.id) {
        let id;
        let unique = false;

        while (!unique) {
            id = generateRandomNumber(8, 8);

            const exist = await mongoose.models.User.findOne({ id });
            if (!exist) {
                unique = true;
            }
        }

        this.id = id;
    }

    next();
});

export const User = mongoose.model('User', userSchema);
