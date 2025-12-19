import multer from "multer";
import path from "path";
import fs from "fs";
import { Request } from "express";

// Create upload directories if they don't exist
const createUploadDirs = () => {
  const dirs = ["uploads/products", "uploads/categories", "uploads/ar-models"];

  dirs.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

createUploadDirs();

// Storage configuration for product images
const productStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/products");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "product-" + uniqueSuffix + path.extname(file.originalname));
  },
});

// Storage configuration for category images
const categoryStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/categories");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "category-" + uniqueSuffix + path.extname(file.originalname));
  },
});

// Storage configuration for AR models
const arModelStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/ar-models");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "ar-model-" + uniqueSuffix + path.extname(file.originalname));
  },
});

// File filter for images
const imageFileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase(),
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"));
  }
};

// File filter for AR models
const arModelFileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  const allowedTypes = /glb|gltf|usdz/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase(),
  );

  if (extname) {
    cb(null, true);
  } else {
    cb(new Error("Only .glb, .gltf, or .usdz AR model files are allowed!"));
  }
};

// Upload middlewares
export const uploadProductImage = multer({
  storage: productStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: imageFileFilter,
}).single("image");

export const uploadCategoryImage = multer({
  storage: categoryStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: imageFileFilter,
}).single("image");

export const uploadARModel = multer({
  storage: arModelStorage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit for AR models
  fileFilter: arModelFileFilter,
}).single("arModel");

// Combined upload for product with image and AR model
export const uploadProductFiles = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      if (file.fieldname === "image") {
        cb(null, "uploads/products");
      } else if (file.fieldname === "arModel") {
        cb(null, "uploads/ar-models");
      } else {
        cb(new Error("Invalid field name"), "");
      }
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const prefix = file.fieldname === "image" ? "product-" : "ar-model-";
      cb(null, prefix + uniqueSuffix + path.extname(file.originalname));
    },
  }),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === "image") {
      imageFileFilter(req, file, cb);
    } else if (file.fieldname === "arModel") {
      arModelFileFilter(req, file, cb);
    } else {
      cb(new Error("Invalid field name"));
    }
  },
}).fields([
  { name: "image", maxCount: 1 },
  { name: "arModel", maxCount: 1 },
]);

// Helper function to delete file
export const deleteFile = (filePath: string): void => {
  if (filePath && fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};
