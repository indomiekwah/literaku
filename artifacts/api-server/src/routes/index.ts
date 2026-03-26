import { Router, type IRouter } from "express";
import healthRouter from "./health";
import speechRouter from "./speech";
import cluRouter from "./clu";

const router: IRouter = Router();

router.use(healthRouter);
router.use(speechRouter);
router.use(cluRouter);

export default router;
