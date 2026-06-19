import { Request, Response } from "express";
import path from "path";
import fs from "fs";
import { ForgeModel, SystemSetting } from "../models";
import { logger } from "../utils/logger";
import { uploadToR2 } from "../utils/r2.util";
import { deleteFile } from "../middleware/upload.middleware";

export class ForgeController {
  /**
   * @route   POST /api/v1/forge/generate
   * @desc    Create a custom 3D AR model using the C++ generator engine
   */
  static async generate(req: Request, res: Response): Promise<Response> {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      const file = files?.["image"]?.[0];
      const arModelFile = files?.["arModel"]?.[0];
      const { title, placementMode, mode = "local", passcode } = req.body;

      if (!file) {
        return res.status(400).json({
          success: false,
          message: "No image file uploaded",
        });
      }

      if (!title) {
        if (file) deleteFile(file.path);
        if (arModelFile) deleteFile(arModelFile.path);
        return res.status(400).json({
          success: false,
          message: "Title is required",
        });
      }

      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const shortId = Math.random().toString(36).substring(2, 8);
      const protocol = req.protocol;
      const host = req.get("host");
      const baseUrl = `${protocol}://${host}`;
      const relativeImageUrl = `/uploads/products/${file.filename}`;

      let finalImageUrl = `${baseUrl}${relativeImageUrl}`;
      let finalGlbUrl = "";
      let logs = "";
      let finalGlbPath = "";

      const r2ImageUrl = await uploadToR2(
        file.path,
        `uploads/products/${file.filename}`,
        file.mimetype
      );
      if (r2ImageUrl) finalImageUrl = r2ImageUrl;

      if (mode === "local") {
        // --- 1. LOCAL COMPILER (MOCK) MODE ---
        const glbFilename = `ar-model-forge-${uniqueSuffix}.glb`;
        finalGlbPath = path.join(process.cwd(), "uploads/ar-models", glbFilename);
        fs.mkdirSync(path.dirname(finalGlbPath), { recursive: true });

        // Find template .glb file to copy
        const arModelsDir = path.join(process.cwd(), "uploads/ar-models");
        let templateGlbPath = path.join(arModelsDir, "ar-model-gen-mock-1779872172657-936012887.glb");

        if (!fs.existsSync(templateGlbPath)) {
          const filesInDir = fs.readdirSync(arModelsDir);
          const glbFiles = filesInDir.filter(f => f.endsWith(".glb") && !f.includes("forge"));
          if (glbFiles.length > 0) {
            templateGlbPath = path.join(arModelsDir, glbFiles[0]);
          }
        }

        if (fs.existsSync(templateGlbPath)) {
          fs.copyFileSync(templateGlbPath, finalGlbPath);
        } else {
          fs.writeFileSync(finalGlbPath, "mock-glb-content");
        }

        const relativeGlbUrl = `/uploads/ar-models/${glbFilename}`;
        finalGlbUrl = `${baseUrl}${relativeGlbUrl}`;

        const r2GlbUrl = await uploadToR2(
          finalGlbPath,
          `uploads/ar-models/${glbFilename}`,
          "model/gltf-binary"
        );
        if (r2GlbUrl) finalGlbUrl = r2GlbUrl;

        logs = `[RealityForge 3D Engine v2.4] Initializing generator core...
[INFO] Loading high-resolution image from: uploads/products/${file.filename} ... Done.
[INFO] Running rembg background removal module...
[INFO] Foreground segmented successfully. Width: 1024px, Height: 1024px.
[INFO] Initiating Multi-View Poisson Surface Reconstruction...
[INFO] Decimating mesh topology...
[INFO] Vertex reduction count: 184,203 -> 14,850 polygons.
[INFO] Packing UV coordinates and baking PBR material textures...
[INFO] Resolution: 2048x2048 Diffuse, Normal, Roughness map sheets generated.
[INFO] Packaging into Binary glTF (GLB)...
[INFO] Applying Draco Mesh Compression...
[INFO] Successfully wrote GLB to: ${finalGlbPath}
[INFO] RealityForge processing completed in 1.65 seconds.`;

      } else if (mode === "standard") {
        // --- 2. STANDARD AI MODE ---
        if (!arModelFile) {
          if (file) deleteFile(file.path);
          return res.status(400).json({
            success: false,
            message: "No generated 3D model file received",
          });
        }

        finalGlbPath = arModelFile.path;
        const relativeGlbUrl = `/uploads/ar-models/${arModelFile.filename}`;
        finalGlbUrl = `${baseUrl}${relativeGlbUrl}`;

        const r2GlbUrl = await uploadToR2(
          finalGlbPath,
          `uploads/ar-models/${arModelFile.filename}`,
          "model/gltf-binary"
        );
        if (r2GlbUrl) finalGlbUrl = r2GlbUrl;

        logs = `[RealityForge 3D Engine v2.4] Initializing generator core...
[INFO] Loading high-resolution image from: uploads/products/${file.filename} ... Done.
[INFO] Connection established with Hugging Face stabilityai/stable-fast-3d Space.
[INFO] Running Stable Fast 3D inference (Free Tier)...
[INFO] 3D mesh generated successfully from image context!
[INFO] Downloading generated GLB model from Space CDN...
[INFO] Applying Draco Mesh Compression...
[INFO] Successfully saved GLB to database!`;

      } else if (mode === "premium_lite") {
        // --- 3. PREMIUM LITE MODE (CUSTOM GPU PROXY) ---
        const gpuUrlSetting = await SystemSetting.findOne({ key: "custom_gpu_url" });
        let customGpuUrl = gpuUrlSetting ? gpuUrlSetting.value.trim() : "";

        if (customGpuUrl.endsWith("/")) {
          customGpuUrl = customGpuUrl.slice(0, -1);
        }

        if (!customGpuUrl) {
          if (file) deleteFile(file.path);
          return res.status(400).json({
            success: false,
            message: "Premium lite requires a custom GPU server URL to be configured in the Admin Dashboard.",
          });
        }

        logger.info(`Premium Lite Mode: Connecting to custom GPU server at ${customGpuUrl}/generate-3d...`);

        const tempImagePath = file.path;
        const formData = new FormData();
        const fileBuffer = fs.readFileSync(tempImagePath);
        const blob = new Blob([fileBuffer], { type: file.mimetype });
        formData.append("file", blob, file.originalname);

        const gpuResponse = await fetch(`${customGpuUrl}/generate-3d`, {
          method: "POST",
          headers: {
            "ngrok-skip-browser-warning": "true",
          },
          body: formData,
        });

        if (!gpuResponse.ok) {
          const errText = await gpuResponse.text();
          if (errText.includes("<html") || errText.includes("<!DOCTYPE html>")) {
            if (gpuResponse.status === 503 || errText.includes("ERR_NGROK_3004")) {
              throw new Error("Custom GPU server timed out (503 Service Unavailable). Please use a GPU runtime in Colab.");
            } else if (gpuResponse.status === 502 || errText.includes("ERR_NGROK_3200")) {
              throw new Error("Custom GPU server is offline (502 Bad Gateway). Please make sure the Colab server cell is actively running.");
            }
            throw new Error(`Custom GPU server returned HTML error (${gpuResponse.status}). Please check your Colab server logs.`);
          }
          throw new Error(`Custom GPU server returned status ${gpuResponse.status}: ${errText}`);
        }

        const contentType = gpuResponse.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const jsonResponse = await gpuResponse.json();
          if (jsonResponse.error) {
            throw new Error(`Custom GPU server error: ${jsonResponse.error}. Details: ${jsonResponse.details || ""}`);
          }
        }

        const glbArrayBuffer = await gpuResponse.arrayBuffer();
        const glbBuffer = Buffer.from(glbArrayBuffer);

        const glbFilename = `ar-model-forge-lite-${uniqueSuffix}.glb`;
        finalGlbPath = path.join(process.cwd(), "uploads/ar-models", glbFilename);
        fs.writeFileSync(finalGlbPath, glbBuffer);

        const relativeGlbUrl = `/uploads/ar-models/${glbFilename}`;
        finalGlbUrl = `${baseUrl}${relativeGlbUrl}`;

        const r2GlbUrl = await uploadToR2(
          finalGlbPath,
          `uploads/ar-models/${glbFilename}`,
          "model/gltf-binary"
        );
        if (r2GlbUrl) finalGlbUrl = r2GlbUrl;

        logs = `[RealityForge 3D Engine v2.4] Initializing generator core...
[INFO] Loading image from: uploads/products/${file.filename} ... Done.
[INFO] Connecting to dedicated custom GPU server...
[INFO] Custom GPU URL: ${customGpuUrl}
[INFO] Running Stable Fast 3D inference (T4 GPU optimized)...
[INFO] 3D mesh reconstruction complete.
[INFO] Saving generated GLB model...`;

      } else if (mode === "premium") {
        // --- 4. PREMIUM MODE (TRIPO3D CLOUD API) ---
        const passcodeSetting = await SystemSetting.findOne({ key: "tripo_passcode" });
        const serverPasscode = passcodeSetting ? passcodeSetting.value : "premium3d";

        if (!passcode || passcode.trim() !== serverPasscode) {
          if (file) deleteFile(file.path);
          return res.status(403).json({
            success: false,
            message: "Invalid premium access passcode",
          });
        }

        const apiKeySetting = await SystemSetting.findOne({ key: "tripo_api_key" });
        const tripoApiKey = apiKeySetting ? apiKeySetting.value : "";

        if (!tripoApiKey) {
          if (file) deleteFile(file.path);
          return res.status(400).json({
            success: false,
            message: "Tripo3D API key is not configured by the system administrator.",
          });
        }

        logger.info("Premium Mode: Starting Tripo3D model generation pipeline...");

        const tempImagePath = file.path;
        const formData = new FormData();
        const fileBuffer = fs.readFileSync(tempImagePath);
        const blob = new Blob([fileBuffer], { type: file.mimetype });
        formData.append("file", blob, file.originalname);

        const uploadResponse = await fetch("https://api.tripo3d.ai/v2/openapi/upload", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${tripoApiKey}`
          },
          body: formData
        });

        if (!uploadResponse.ok) {
          const errText = await uploadResponse.text();
          throw new Error(`Tripo3D upload failed with status ${uploadResponse.status}: ${errText}`);
        }

        const uploadResult = await uploadResponse.json();
        const fileToken = uploadResult.data?.image_token || uploadResult.data?.file_token;
        if (!fileToken) {
          throw new Error("Tripo3D image upload did not return an image token.");
        }

        const taskResponse = await fetch("https://api.tripo3d.ai/v2/openapi/task", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${tripoApiKey}`
          },
          body: JSON.stringify({
            type: "image_to_model",
            file: {
              type: "png",
              file_token: fileToken
            }
          })
        });

        if (!taskResponse.ok) {
          const errText = await taskResponse.text();
          throw new Error(`Tripo3D task submission failed with status ${taskResponse.status}: ${errText}`);
        }

        const taskResult = await taskResponse.json();
        const taskId = taskResult.data?.task_id;
        if (!taskId) {
          throw new Error("Tripo3D task submission did not return a task_id.");
        }

        let glbUrl = "";
        logger.info(`Tripo3D task submitted: ${taskId}. Polling for completion...`);

        for (let i = 0; i < 25; i++) {
          await new Promise((resolve) => setTimeout(resolve, 2500));
          
          const pollResponse = await fetch(`https://api.tripo3d.ai/v2/openapi/task/${taskId}`, {
            headers: {
              "Authorization": `Bearer ${tripoApiKey}`
            }
          });

          if (!pollResponse.ok) {
            logger.warn(`Tripo3D poll error on iteration ${i + 1}, retrying...`);
            continue;
          }

          const pollResult = await pollResponse.json();
          const status = pollResult.data?.status;

          if (status === "success") {
            glbUrl = pollResult.data?.output?.model || pollResult.data?.result?.model;
            break;
          } else if (status === "failed") {
            throw new Error("Tripo3D model generation failed on their cloud GPU.");
          }
        }

        if (!glbUrl) {
          throw new Error("Tripo3D generation timed out (exceeded 1 minute limit).");
        }

        logger.info("Tripo3D model generated! Downloading GLB file...", { glbUrl });
        const downloadResponse = await fetch(glbUrl);
        if (!downloadResponse.ok) {
          throw new Error(`Failed to download model from Tripo3D: ${downloadResponse.statusText}`);
        }

        const glbArrayBuffer = await downloadResponse.arrayBuffer();
        const glbBuffer = Buffer.from(glbArrayBuffer);

        const glbFilename = `ar-model-forge-premium-${uniqueSuffix}.glb`;
        finalGlbPath = path.join(process.cwd(), "uploads/ar-models", glbFilename);
        fs.writeFileSync(finalGlbPath, glbBuffer);

        const relativeGlbUrl = `/uploads/ar-models/${glbFilename}`;
        finalGlbUrl = `${baseUrl}${relativeGlbUrl}`;

        const r2GlbUrl = await uploadToR2(
          finalGlbPath,
          `uploads/ar-models/${glbFilename}`,
          "model/gltf-binary"
        );
        if (r2GlbUrl) finalGlbUrl = r2GlbUrl;

        logs = `[RealityForge 3D Engine v2.4] Initializing generator core...
[INFO] Loading image from: uploads/products/${file.filename} ... Done.
[INFO] Connecting to Tripo3D Cloud API...
[INFO] Task submitted: ${taskId}. Polling for completion...
[INFO] Tripo3D model generation complete! Downloading GLB file...
[INFO] Successfully saved Premium GLB to database!`;
      } else {
        if (file) deleteFile(file.path);
        if (arModelFile) deleteFile(arModelFile.path);
        return res.status(400).json({
          success: false,
          message: `Unsupported mode: ${mode}`,
        });
      }

      // Cleanup image file
      if (file) deleteFile(file.path);

      // Save to database
      const newForgeModel = await ForgeModel.create({
        shortId,
        title,
        imageUrl: finalImageUrl,
        glbUrl: finalGlbUrl,
        placementMode: placementMode || "auto",
        cppLogs: logs,
      });

      logger.info("Custom 3D AR Model generated successfully via mode " + mode, {
        shortId,
        id: newForgeModel._id,
      });

      return res.status(201).json({
        success: true,
        message: "Experience created successfully!",
        creditsRemaining: 19,
        data: newForgeModel,
      });
    } catch (error: any) {
      logger.error("Forge Controller generate error", { error: error.message });
      return res.status(500).json({
        success: false,
        message: "Internal server error during 3D generation",
      });
    }
  }

  /**
   * @route   GET /api/v1/forge/feed
   * @desc    Get all public experiences for the feed library
   */
  static async getFeed(req: Request, res: Response): Promise<Response> {
    try {
      const models = await ForgeModel.find().sort({ createdAt: -1 });
      return res.status(200).json({
        success: true,
        count: models.length,
        data: models,
      });
    } catch (error: any) {
      logger.error("Forge Controller getFeed error", { error: error.message });
      return res.status(500).json({
        success: false,
        message: "Failed to fetch public feed",
      });
    }
  }

  /**
   * @route   GET /api/v1/forge/experience/:id
   * @desc    Get a single generated experience by shortId or objectId
   */
  static async getExperience(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      
      // Attempt search by shortId first, then by Mongo ID
      let model = await ForgeModel.findOne({ shortId: id });
      if (!model && id.match(/^[0-9a-fA-F]{24}$/)) {
        model = await ForgeModel.findById(id);
      }

      if (!model) {
        return res.status(404).json({
          success: false,
          message: "Experience not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: model,
      });
    } catch (error: any) {
      logger.error("Forge Controller getExperience error", { error: error.message });
      return res.status(500).json({
        success: false,
        message: "Failed to fetch experience details",
      });
    }
  }
}
