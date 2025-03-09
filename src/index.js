import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import express from 'express';
import { connect } from 'mongoose';
import cookieParser from 'cookie-parser';
import DeviceDetector from 'device-detector-js';

import { configViewEngine } from './configs';
import { startIntervalTasks } from './cron/intervalTasks';
import { startScheduleTasks } from './cron/scheduleTasks';
import { controlDeleteAllDatabase } from './controllers/database/delete';
import { controlAuthInitializeDatabase } from './controllers/database/create';

import v2Router from './routes/v2';
import myRouter from './routes/my';
import uploadRouter from './routes/upload';
import manageRouter from './routes/manage';
import rechargeRouter from './routes/recharge';

const deviceDetector = new DeviceDetector();

// Config
const port = 8080;
const app = express();

const url = 'http://localhost:8080';
const whitelist = ['http://localhost:3000', 'http://localhost:3030', url];

const corsMiddleware = cors({
    origin: (origin, callback) => {
        if (whitelist.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Only secure connections (HTTPS) are allowed'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
});

app.use((req, res, next) => {
    if (!req.path.startsWith('/api/v2')) {
        return corsMiddleware(req, res, next);
    }

    next();
});

app.use(
    helmet({
        crossOriginResourcePolicy: false,
    }),
);
app.use(express.json());
app.use(cookieParser());
app.use(morgan('common'));

configViewEngine(app);

// Connect database
connect('mongodb://127.0.0.1:27017/netcode')
    .then(async () => {
        await controlAuthInitializeDatabase();

        console.log('Connecting to database successfully');
    })
    .catch((err) => {
        console.log('Connecting to database error: ' + err.message);
    });

// Cron
startIntervalTasks();
startScheduleTasks();

// Middleware
app.use((req, res, next) => {
    req.hostUrl = 'localhost';
    req.domainDefault = url;

    const userAgent = req.headers['user-agent'];
    const device = deviceDetector.parse(userAgent);

    req.device = device;

    next();
});

app.use('/api/my', myRouter);
app.use('/api/v2', v2Router);
app.use('/charge', rechargeRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/manages', manageRouter);
app.get('/api/delete-database', controlDeleteAllDatabase);

app.use('/images', express.static('src/assets'));

app.use('/', (req, res) => {
    res.status(404).render('index');
});

app.listen(port, () => {
    console.log(`Listening on port: ${port}`);
});
