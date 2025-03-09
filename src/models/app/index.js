import mongoose, { Schema } from 'mongoose';
import { generateRandomNumber } from '~/configs';

const appSchema = new Schema({
    id: {
        type: Number,
        unique: true,
        required: true,
        immutable: true,
    },
    website_status: {
        status: {
            type: String,
            enum: ['activated', 'inactivated', 'maintenance'],
            default: 'activated',
        },
        reason: {
            type: String,
            default: '',
        },
    },
    favicon_url: {
        type: String,
        default: '',
    },
    website_logo_url: {
        type: String,
        default: '',
    },
    backend_logo_url: {
        type: String,
        default: '',
    },
    sendmail_config: {
        partner: {
            type: String,
            default: '',
        },
        host: {
            type: String,
            default: '',
        },
        port: {
            type: Number,
            default: 0,
        },
        secure: {
            type: Boolean,
            default: false,
        },
        email: {
            type: String,
            default: '',
        },
        password: {
            type: String,
            default: '',
        },
    },
    contacts: {
        zalo_url: {
            type: String,
            default: '',
        },
        facebook_url: {
            type: String,
            default: '',
        },
        instagram_url: {
            type: String,
            default: '',
        },
        website_url: {
            type: String,
            default: '',
        },
        youtube_url: {
            type: String,
            default: '',
        },
        tiktok_url: {
            type: String,
            default: '',
        },
        telegram_url: {
            type: String,
            default: '',
        },
        twitter_url: {
            type: String,
            default: '',
        },
        email: {
            type: String,
            default: '',
        },
        phone_number: {
            type: String,
            default: '',
        },
        address: {
            type: String,
            default: '',
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
});

appSchema.pre('validate', async function (next) {
    if (this.isNew && !this.id) {
        let id;
        let unique = false;

        while (!unique) {
            id = generateRandomNumber(8, 8);

            const exist = await mongoose.models.App.findOne({ id });
            if (!exist) {
                unique = true;
            }
        }

        this.id = id;
    }

    next();
});

export const App = mongoose.model('App', appSchema);
