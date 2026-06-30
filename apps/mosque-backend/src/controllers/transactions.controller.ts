import type { Request, Response } from "express";
import { transactionService } from "../services/transactions.service.js";
import { getSocketIO } from "../lib/socket.js";

export class TransactionController {
  async findAll(req: Request, res: Response) {
    try {
      const { search, category, month, page, limit } = req.query;
      const result = await transactionService.findAll({
        search: search as string,
        category: category as string,
        month: month as string,
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
      });
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  }

  async findById(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const result = await transactionService.findById(id);
      if (!result) {
        res.status(404).json({ error: "Transaction not found" });
        return;
      }
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch transaction" });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const result = await transactionService.create(req.body, req.user!.id);
      getSocketIO().emit("dataUpdate", { entity: "transactions" });
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to create transaction" });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const result = await transactionService.update(id, req.body);
      if (!result) {
        res.status(404).json({ error: "Transaction not found" });
        return;
      }
      getSocketIO().emit("dataUpdate", { entity: "transactions" });
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to update transaction" });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const result = await transactionService.delete(id);
      if (!result) {
        res.status(404).json({ error: "Transaction not found" });
        return;
      }
      getSocketIO().emit("dataUpdate", { entity: "transactions" });
      res.json({ message: "Transaction deleted", data: result });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete transaction" });
    }
  }

  async getSummary(req: Request, res: Response) {
    try {
      const result = await transactionService.getSummary();
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch summary" });
    }
  }
}

export const transactionController = new TransactionController();
