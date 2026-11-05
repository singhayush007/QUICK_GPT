import express from "express";
import { getPublishedImages } from "./community.controller.js";

const communityRouter = express.Router();

communityRouter.get("/", getPublishedImages);

export default communityRouter;
