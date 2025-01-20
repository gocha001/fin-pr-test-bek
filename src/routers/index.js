import { Router } from "express";
import waterRouter from "./water.js";
import authRouter from "./auth.js";
import { authenticate } from "../middlewares/authenticate.js";

const router = Router();

router.use('/water', authenticate, waterRouter);
router.use('/auth', authRouter);

export default router;
