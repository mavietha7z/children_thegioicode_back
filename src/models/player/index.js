import mongoose, { Schema } from 'mongoose';

const playerSchema = new Schema({
    service_id: {
        type: Schema.Types.ObjectId,
        ref: 'Api',
        required: true,
    },
    account_garena: {
        username: {
            type: String,
            default: null,
        },
        password: {
            type: String,
            default: null,
        },
        uid: {
            type: Number,
            default: null,
        },
        timestamp: {
            type: Number,
            default: null,
        },
        session_key: {
            type: String,
            default: null,
        },
        id: {
            type: String,
            default: null,
        },
    },
    account_freefire: {
        nickname: {
            type: String,
            default: null,
        },
        account_id: {
            type: String,
            default: null,
        },
        img_url: {
            type: String,
            default: null,
        },
        region: {
            type: String,
            default: null,
        },
        open_id: {
            type: String,
            default: null,
        },
        app_id: {
            type: Number,
            default: 100067,
        },
        app_server_id: {
            type: Number,
            default: 0,
        },
    },
    account_vnggames: {
        user_id: {
            type: String,
            default: null,
        },
        login_type: {
            type: String,
            default: null,
        },
        jwt_token: {
            type: String,
            default: null,
        },
        server_id: {
            type: String,
            default: null,
        },
        server_name: {
            type: String,
            default: null,
        },
        role_id: {
            type: String,
            default: null,
        },
        role_name: {
            type: String,
            default: null,
        },
        front_id: {
            type: String,
            default: null,
        },
        module: {
            type: String,
            default: null,
        },
    },
    account_type: {
        type: String,
        enum: ['garena', 'freefire', 'vnggames'],
        required: true,
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

export const Player = mongoose.model('Player', playerSchema);
