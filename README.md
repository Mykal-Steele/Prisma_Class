
# Setup Project

```py
npm init -y
npm i -D typescript tsx prisma
npx tsc --init
````

# Configure TypeScript (`tsconfig.json`)

* Uncomment:

  * `"rootDir": "./src"` (line ~5)  -  // remove `src` from here
  * `"outDir": "./dist",` (line ~6)

* Add Node types:

  ```json
  "types": ["node"]
  ```

* Comment out:

  * line ~25 `// "exactOptionalPropertyTypes": true,`
  * line ~38 ` // "verbatimModuleSyntax": true, `

* Add path alias:

  ```json
  "paths": {
    "@/*": ["./src/*"]
  }
  ```

* Add include & exclude:

  ```json
  "include": ["./src/**/*"],
  "exclude": ["node_modules", "dist"]
  ```

# Update `package.json`

* Add dev script:

  ```json
  "scripts": {
    "dev": "tsx watch ./src/index.ts"
  }
  ```

* Set module type:

  ```json
  "type": "module"
  ```

# Project Structure

```css
mkdir src
```

# Setup Prisma

* Run Init
```css
npx prisma init --datasource-provider sqlite
```
* Install dependencies
```css
npm i @prisma/client @prisma/adapter-libsql @libsql/client dotenv
```

* Create a `Food` model in `schema.prisma`
```schema.prisma
model Food {
  id String @id @default(cuid(2))
  name String
  amount Int
}
```
* Run Migrate & Generate
```css
npx prisma migrate dev --name init
npx prisma generate
```

# Database Setup

* Create `db.ts` inside `./src/lib`
* Import PrismaClient using alias (`@`) from `./src/generated/prisma/client.js`
* Import PrismaLibSql from `@prisma/adapter-libsql`
* Import `dotenv/config`
* Handle the database Connection, use the LibSql adapter, and export a Prisma client to use in the app

# Setup Express with TypeScript

```css
npm i express @types/express
```

* Create `./src/index.ts`

## Basic Server

* Initialize Express
* Listen on a port (from `.env`)
* Add route:

```ts
GET /
send → "Hello World"
```

# Prisma + API

* Import Prisma from `db.ts`

## Routes

### Get All Foods

```ts
GET /foods
```

### Add Food (Postman)

```ts
POST /foods
```

* Validate input
* Handle missing or invalid data

### Update Food

```ts
PATCH /foods/:id
```

* Allow partial updates

### Delete Food

```ts
DELETE /foods/:id
```
