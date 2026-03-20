import { Router, type IRouter } from "express";
import healthRouter from "./health";
import speechRouter from "./speech";

const router: IRouter = Router();

router.use(healthRouter);
router.use(speechRouter);

export default router;
