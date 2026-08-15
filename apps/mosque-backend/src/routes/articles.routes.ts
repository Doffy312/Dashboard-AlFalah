import { Router } from "express";
import { articlesService } from "../services/articles.service.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/rbac.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createArticleSchema, updateArticleSchema } from "../validations/articles.validation.js";

const router = Router();

// Public route for Landing Page
router.get("/", async (_req, res, next) => {
  try {
    const articles = await articlesService.findAll();
    res.json(articles);
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const id = req.params.id as string;
    const articleItem = await articlesService.findById(id);
    if (!articleItem) {
      res.status(404).json({ message: "Article not found" });
      return;
    }
    res.json(articleItem);
  } catch (error) {
    next(error);
  }
});

// Protected routes for managing articles
router.post("/", requireAuth, requireRole("Ketua", "Sekretaris", "Pengurus"), validate(createArticleSchema), async (req, res, next) => {
  try {
    const newArticle = await articlesService.create(req.body);
    res.status(201).json(newArticle);
  } catch (error) {
    next(error);
  }
});

router.put("/:id", requireAuth, requireRole("Ketua", "Sekretaris", "Pengurus"), validate(updateArticleSchema), async (req, res, next) => {
  try {
    const id = req.params.id as string;
    const updated = await articlesService.update(id, req.body);
    if (!updated) {
      res.status(404).json({ message: "Article not found" });
      return;
    }
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", requireAuth, requireRole("Ketua", "Sekretaris", "Pengurus"), async (req, res, next) => {
  try {
    const id = req.params.id as string;
    const deleted = await articlesService.delete(id);
    if (!deleted) {
      res.status(404).json({ message: "Article not found" });
      return;
    }
    res.json({ message: "Article deleted successfully" });
  } catch (error) {
    next(error);
  }
});

export default router;

