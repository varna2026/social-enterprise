import { Router, type IRouter } from "express";
import healthRouter from "./health";
import enterprisesRouter from "./enterprises";
import eventsRouter from "./events";
import storageRouter from "./storage";

const router: IRouter = Router();

router.use(healthRouter);
router.use(enterprisesRouter);
router.use(eventsRouter);
router.use(storageRouter);

export default router;
