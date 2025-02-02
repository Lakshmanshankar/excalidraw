//https://github.com/nextauthjs/express-auth-example/blob/main/src/middleware/auth.middleware.ts
import { getSession } from "@auth/express";
import { authConfig } from "~/config/auth";
import type { NextFunction, Request, Response } from "express";

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const session =
      res.locals.session ?? (await getSession(req, authConfig)) ?? undefined;
    res.locals.session = session;
    if (session) {
      return next();
    }
    res.status(401).json({ message: "Not Authenticated" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error: error });
  }
}

export async function currentSession(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const session = (await getSession(req, authConfig)) ?? undefined;
  res.locals.session = session;
  return next();
}
