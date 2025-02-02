import express from "express";
import {
  createUserFile,
  getUserFile,
  getUserIndexFile,
} from "~/controllers/file";

const router = express.Router();

router.get("/index", getUserIndexFile);
router.post("/get", getUserFile);
router.post("/post", createUserFile);
//
export default router;
