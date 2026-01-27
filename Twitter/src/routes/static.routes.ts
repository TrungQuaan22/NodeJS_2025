import { Router } from "express";
import { getImageController, getVideoController } from "~/controllers/medias.controllers";

const staticRouter = Router();
staticRouter.get('/image-self/:name', getImageController);
staticRouter.get('/video/:name', getVideoController);


export default staticRouter;