import type { Request, Response } from "express";
import {
  createUploadSignedURL,
  getReadonlySignedURL,
} from "~/adapters/blob/supabase";

export const getUserIndexFile = async (_req: Request, res: Response) => {
  const session = res.locals.session;
  res.json({ session: session?.user }).status(200);
};

export const getUserFile = async (req: Request, res: Response) => {
  const session = res.locals.session;
  const filePath = `${session?.user?.id}/${
    (req.query?.filePath || "") as string
  }`;
  if (
    session &&
    session?.user &&
    filePath &&
    filePath.includes(session?.user?.id || "")
  ) {

    console.log(filePath,"FILE PATH >>>>>>>>>>>>>?????????")
    const signedURL = await getReadonlySignedURL(filePath, 15);
    res.status(200).json({ data: signedURL });
  } else {
    res
      .json({
        error: "Unauthorized",
        message: "Make sure you have enough permissions to access the file",
      })
      .status(401);
  }
};

export const createUserFile = async (req: Request, res: Response) => {
  const filePath = req.query?.filePath as string;
  const session = res.locals.session;
  if (
    session &&
    session?.user &&
    filePath &&
    filePath.includes(session?.user?.id || "")
  ) {
    const signedURL = await createUploadSignedURL(filePath);
    res.status(200).json({ data: signedURL });
  } else {
    res
      .json({
        error: "Unauthorized",
        message: "Make sure you have enough permissions to create a file",
      })
      .status(401);
  }
};
