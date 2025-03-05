import { configCreateLog } from '~/configs';

const controlAuthInitializeDatabase = async (req, res) => {
    try {
    } catch (error) {
        configCreateLog('controllers/database/create.log', 'controlAuthInitializeDatabase', error.message);
    }
};

export { controlAuthInitializeDatabase };
