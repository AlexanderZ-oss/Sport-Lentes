# 🔧 Ejemplo de Backend para Sport Lentes (Node.js + Express)

Este es un ejemplo básico de cómo implementar el backend que el frontend necesita.

---

## 📦 Instalación

```bash
mkdir sport-lentes-backend
cd sport-lentes-backend
npm init -y
npm install express cors dotenv bcryptjs jsonwebtoken mongoose
npm install --save-dev typescript @types/express @types/node @types/cors @types/bcryptjs @types/jsonwebtoken ts-node-dev
```

---

## 📁 Estructura del Proyecto

```
sport-lentes-backend/
├── src/
│   ├── config/
│   │   └── database.ts
│   ├── models/
│   │   ├── User.ts
│   │   ├── Product.ts
│   │   ├── Sale.ts
│   │   └── Log.ts
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── users.routes.ts
│   │   ├── products.routes.ts
│   │   ├── sales.routes.ts
│   │   └── logs.routes.ts
│   ├── middleware/
│   │   └── auth.middleware.ts
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── users.controller.ts
│   │   ├── products.controller.ts
│   │   ├── sales.controller.ts
│   │   └── logs.controller.ts
│   └── server.ts
├── .env
├── tsconfig.json
└── package.json
```

---

## ⚙️ Configuración

### `.env`
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/sport-lentes
JWT_SECRET=tu_secreto_super_seguro_aqui_cambiar_en_produccion
NODE_ENV=development
```

### `tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

### `package.json` (scripts)
```json
{
  "scripts": {
    "dev": "ts-node-dev --respawn src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js"
  }
}
```

---

## 📝 Código de Ejemplo

### 1. `src/server.ts`
```typescript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDatabase } from './config/database';

// Routes
import authRoutes from './routes/auth.routes';
import usersRoutes from './routes/users.routes';
import productsRoutes from './routes/products.routes';
import salesRoutes from './routes/sales.routes';
import logsRoutes from './routes/logs.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Rout es
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/logs', logsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Start server
const startServer = async () => {
  try {
    await connectDatabase();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
```

### 2. `src/config/database.ts`
```typescript
import mongoose from 'mongoose';

export const connectDatabase = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sport-lentes';
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Database connected');
  } catch (error) {
    console.error('❌ Database connection error:', error);
    throw error;
  }
};
```

### 3. `src/models/User.ts`
```typescript
import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  username: string;
  password: string;
  name: string;
  role: 'admin' | 'employee';
  status: 'active' | 'inactive';
  createdAt: Date;
  comparePassword(password: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['admin', 'employee'], default: 'employee' },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  createdAt: { type: Date, default: Date.now }
});

// Hash password before save
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(password: string): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

export default mongoose.model<IUser>('User', userSchema);
```

### 4. `src/models/Product.ts`
```typescript
import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  code: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  image?: string;
  createdAt: Date;
}

const productSchema = new Schema<IProduct>({
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, required: true, default: 0 },
  category: { type: String, required: true },
  image: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IProduct>('Product', productSchema);
```

### 5. `src/middleware/auth.middleware.ts`
```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: any;
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};
```

### 6. `src/controllers/auth.controller.ts`
```typescript
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    // Find user
    const user = await User.findOne({ username, status: 'active' });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    // Return user (without password) and token
    const userResponse = {
      id: user._id,
      username: user.username,
      name: user.name,
      role: user.role
    };

    res.json({ user: userResponse, token });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const verify = async (req: Request & { user?: any }, res: Response) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
```

### 7. `src/routes/auth.routes.ts`
```typescript
import express from 'express';
import { login, verify } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/login', login);
router.get('/verify', authenticate, verify);

export default router;
```

### 8. `src/controllers/products.controller.ts`
```typescript
import { Request, Response } from 'express';
import Product from '../models/Product';

export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getProductByCode = async (req: Request, res: Response) => {
  try {
    const product = await Product.findOne({ code: req.params.code });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const updateStock = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    product.stock += quantity;
    await product.save();

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
```

---

## 🚀 Ejecutar el Backend

```bash
# Desarrollo
npm run dev

# Producción
npm run build
npm start
```

---

## 🧪 Probar con Postman

### Login
```http
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "123"
}
```

### Obtener Productos (con token)
```http
GET http://localhost:3000/api/products
Authorization: Bearer [tu_token_aqui]
```

---

## 🐳 Docker (Opcional)

### `Dockerfile`
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

### `docker-compose.yml`
```yaml
version: '3.8'

services:
  backend:
    build: .
    ports:
      - "3000:3000"
    environment:
      - MONGODB_URI=mongodb://mongo:27017/sport-lentes
      - JWT_SECRET=super_secret_key
    depends_on:
      - mongo

  mongo:
    image: mongo:6
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db

volumes:
  mongo-data:
```

Ejecutar:
```bash
docker-compose up
```

---

## 📚 Recursos Adicionales

- [Express Documentation](https://expressjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [JWT Best Practices](https://jwt.io/introduction)

---

*¿Necesitas ayuda con el backend? Contacta al equipo de desarrollo.*
