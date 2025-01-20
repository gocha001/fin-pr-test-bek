import dotenv from 'dotenv';
dotenv.config();

import { initMongoDB } from "./db/initMongoConnection.js";
import { setupServer } from "./server.js";
import { createDirIfNotExists } from "./utils/createDirIfNotExists.js";
import { TEMP_UPLOAD_DIR, UPLOAD_DIR } from "./constants/constants.js";

const bootstrap = async () => {
    await initMongoDB();
    await createDirIfNotExists(TEMP_UPLOAD_DIR);
    await createDirIfNotExists(UPLOAD_DIR);
    setupServer();
};

void bootstrap();

