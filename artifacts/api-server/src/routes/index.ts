import { Router, type IRouter } from "express";
import healthRouter from "./health";
import speechRouter from "./speech";
import cluRouter from "./clu";
import summarizeRouter from "./summarize";
import authRouter from "./auth";
import adminRouter from "./admin";
import operatorRouter from "./operator";
import studentRouter from "./student";
import booksRouter from "./books";

const router: IRouter = Router();

router.use(healthRouter);
router.use(speechRouter);
router.use(cluRouter);
router.use(summarizeRouter);
router.use(authRouter);
router.use(adminRouter);
router.use(operatorRouter);
router.use(studentRouter);
router.use(booksRouter);

export default router;
