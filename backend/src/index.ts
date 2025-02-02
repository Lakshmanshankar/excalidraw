import type { Request, Response } from "express";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { ExpressAuth } from "@auth/express";
import userRoutes from "~/routes/userRoutes";
import fileRoutes from "~/routes/fileRoutes";
import { authConfig } from "~/config/auth";
import { authMiddleware } from "~/config/auth.middleware";

dotenv.config();
const app = express();

app.set("trust proxy", true);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    // methods: ['GET', 'POST']
  }),
);

//Set up ExpressAuth to handle authentication
// IMPORTANT: It is highly encouraged set up rate limiting on this route
app.use("/api/auth/*", ExpressAuth(authConfig));
app.use("/api", userRoutes);

export const mail = async (req: Request, res: Response) => {
  res.status(200).json({ mesage: "Yes you are authenticated" });
};

app.use("/api/v1", authMiddleware);
app.get("/api/v1/", mail);
app.use("/api/v1/file", fileRoutes);

// Now in your route
app.get("/", (req, res) => {
  const { session } = res.locals;
  res.json({ status: "express is running", user: session?.user });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
