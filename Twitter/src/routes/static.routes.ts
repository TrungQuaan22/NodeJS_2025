import { Router } from "express";
import { getImageController, getVideoController, getVideoHLSController, getVideoHLSSegmentController } from "~/controllers/medias.controllers";

const staticRouter = Router();
staticRouter.get('/image-self/:name', getImageController);
staticRouter.get('/video/:name', getVideoController);
staticRouter.get('/video-hls/:id/master.m3u8', getVideoHLSController); // serve m3u8
staticRouter.get("/video-hls/:id/:ver/:segment", getVideoHLSSegmentController); // serve ts segments



export default staticRouter;