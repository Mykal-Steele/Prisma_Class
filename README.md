
# Overview - Summary

## Stack

- Express with TypeScript
- Prisma 7.7.0
- LibSQL Adapter for Prisma

## APIs

- Create an Item `/foods`
- Get All Items `/foods`
- Update an Item `/foods/:id`
- Delete an Item `/foods/:id`

## Scope

- Database connection with the new Prisma 7 system and LibSQL Adapter
- Express TypeScript setup
- Basic CRUD with Prisma SQLite database

# Tutorial Flow

# Setup Project

```py
npm init -y
npm i -D typescript tsx @types/node prisma
npx tsc --init
````

# Configure TypeScript (`tsconfig.json`)

* Replace your tsconfig.json with following code into your ts.config.json

```json
{
  "compilerOptions": {
    "rootDir": "./",
    "outDir": "./dist",
    "module": "esnext",
    "types": ["node"],
    "moduleResolution": "bundler",
    "target": "ES2023",
    "strict": true,
    "esModuleInterop": true
  },
  "include": ["./src/**/*", "prisma.config.ts"],
  "exclude": ["node_modules", "dist"]
}
```
Since we are using TypeScript, we need to configure it to match our setup. \
Prisma 7 uses a more modern system, so using `esnext` for the module and `ES2023` as the target works well. \
Setting `moduleResolution` to `bundler` follows a more modern approach for handling modules in TypeScript projects. \
We also enable `esModuleInterop` to make imports more consistent and easier to work with.

# Update `package.json`

* Replace your `scripts` in `package.json` with this:

```json
"scripts": {
  "dev": "tsx watch ./src/index.ts",
  "build": "tsc",
  "start": "node ./dist/src/index.js"
},
```

* Change type to module:

```json
"type": "module"
```

# Create Source (src) folder

```css
mkdir src
```
Make sure you create the `src` folder before initializing Prisma so it can configure everything properly.
# Setup Prisma

* Run init

```css
npx prisma init --datasource-provider sqlite
```

* Install dependencies

```css
npm i @prisma/client @prisma/adapter-libsql @libsql/client dotenv
```

* Inside the `prisma/schema.prisma` file, add `importFileExtension = "js"` inside the `generator client {}` block so Prisma generates files with a `.js` extension that Node.js can use

```py
generator client {
  provider            = "prisma-client"
  output              = "../generated/prisma"
  importFileExtension = "js"
}
```


* Create a `Food` model in `schema.prisma`

```py
model Food {
  id String @id @default(cuid(2))
  name String
  amount Int
}
```

### Your final schema.prisma should look like this

```py
generator client {
  provider            = "prisma-client"
  output              = "../src/generated/prisma"
  importFileExtension = "js"
}

datasource db {
  provider = "sqlite"
}

model Food {
  id     String @id @default(cuid(2))
  name   String
  amount Int
}
```

* Run migrate dev & generate

```css
npx prisma migrate dev --name init
npx prisma generate
```
`migrate dev` applies your schema changes and all existing migration history (if any) to the database. \
`prisma generate` creates the client you will use in your application to interact with the database.

* Add `prisma.config.ts` to the `tsconfig.json` include

```json
"include": ["./src/**/*", "prisma.config.ts"],
```
# Database Setup

* Create folder `lib` inside `src`

```css
mkdir src/lib
```

* Create `db.ts` inside `./src/lib`

```css
code src/lib/db.ts
```
- Note: If these commands don't work for you, you can create the necessary folders and files using your interface.

### Inside db.ts

* Import PrismaClient from `../generated/prisma/client.js`
* Import PrismaLibSql from `@prisma/adapter-libsql`
* Import `dotenv/config`
* Handle the database connection, use the LibSQL adapter, and export a Prisma client to use in the app

## Your db.ts should look something like this

```ts
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "../generated/prisma/client";
import "dotenv/config";
const connectionString = process.env.DATABASE_URL || "file:./dev.db";

const adapter = new PrismaLibSql({ url: connectionString });
const prisma = new PrismaClient({ adapter });

export default prisma;
```

# Setup Express with TypeScript

```css
npm i express @types/express
```

### Create `./src/index.ts`

```css
code src/index.ts
```

## Inside index.ts create a basic server

* Initialize Express
* Listen on a port (from `.env`)

```ts
import express, { Request, Response } from "express";
import "dotenv/config";
const app = express();
const port = process.env.PORT || "3000";

app.use(express.json());

app.listen(port, () => {
  console.log("Server is running on http://localhost:%d", port);
});
```

* Add get root route:

```ts
app.get("/", (_req, res: Response) => {
  res.send("Hello World");
});
```

# Prisma + API

* Inside `src/index.ts`, import Prisma from `db.ts`

```ts
import prisma from "./lib/db";
```

## Write APIs to create, update, read, and delete items from the database

### Get All Foods

* GET `/foods`

```ts
app.get("/foods", async (_req, res: Response) => {
  const food = await prisma.food.findMany();
  res.status(200).json(food);
});
```

### Add Food

* POST `/foods`

```ts
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
```

* Validate input
* Handle missing or invalid data

### Update Food

* PUT `/foods/:id`

```ts
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
```

### Delete Food

* DELETE `/foods/:id`

```ts
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
```

## Your final index.ts should look something like this

```ts
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
```

