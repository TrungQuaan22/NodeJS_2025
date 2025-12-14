import { Router } from "express";
import { getImageController } from "~/controllers/medias.controllers";

const staticRouter = Router();
staticRouter.get('/image/:name', getImageController);

export default staticRouter;