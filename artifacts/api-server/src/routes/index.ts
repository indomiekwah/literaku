import { Router, type IRouter } from "express";
import healthRouter from "./health";
import speechRouter from "./speech";
import cluRouter from "./clu";
import summarizeRouter from "./summarize";
import booksRouter from "./books";

const router: IRouter = Router();

router.use(healthRouter);
router.use(speechRouter);
router.use(cluRouter);
router.use(summarizeRouter);
router.use(booksRouter);

export default router;
