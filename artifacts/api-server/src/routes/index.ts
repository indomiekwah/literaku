import { Router, type IRouter } from "express";
import healthRouter from "./health";
import speechRouter from "./speech";
import cluRouter from "./clu";
import summarizeRouter from "./summarize";

const router: IRouter = Router();

router.use(healthRouter);
router.use(speechRouter);
router.use(cluRouter);
router.use(summarizeRouter);

export default router;
