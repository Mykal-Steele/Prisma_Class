import express, { Request, Response } from "express";
import "dotenv/config";
import prisma from "./lib/db.js";
const app = express();
const port = process.env.PORT || "3000";

app.use(express.json());

app.get("/foods", async (_req, res: Response) => {
  const food = await prisma.food.findMany();
  res.status(200).json(food);
});

app.post("/foods", async (req: Request, res: Response) => {
  try {
    const { name, amount } = req.body;

    if (!name || amount == null)
      return res.status(400).json({ err: "Name or Amount is required" });
    if (typeof amount !== "number")
      return res.status(400).json({ err: "Amount needs to be a number" });

    const newFood = await prisma.food.create({
      data: { name, amount },
    });

    res.status(201).json(newFood);
  } catch (err) {
    console.log("err: ", err);
    res.status(500).json({ err: "Internal Server Error" });
  }
});

app.put("/foods/:id", async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const data = req.body;
  // Uncomment to disallow partial updates
  // if (data.name == null) return res.status(400).json({ err: "name is required" });
  // if (data.amount == null) return res.status(400).json({ err: "Amount is required" });
  try {
    const updatedFood = await prisma.food.update({
      where: { id },
      data: data,
    });
    res.status(200).json(updatedFood);
  } catch (err: any) {
    console.log("Error updating: ", err.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

app.delete("/foods/:id", async (req: Request, res: Response) => {
  const id = String(req.params.id);
  try {
    const deletedFood = await prisma.food.delete({
      where: { id },
    });
    res.status(200).json({ message: "Successfully deleted", deletedFood });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Internal Server Error", err });
  }
});

app.get("/", (_req, res: Response) => {
  res.send("Hello World");
});

app.listen(port, () => {
  console.log("Server is running on http://localhost:%d", port);
});
