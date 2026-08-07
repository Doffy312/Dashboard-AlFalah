import type { Request, Response } from "express";
import { transactionService } from "../services/transactions.service.js";
import { getSocketIO } from "../lib/socket.js";

export class TransactionController {
  async findAll(req: Request, res: Response) {
    const { search, category, month, page, limit } = req.query;
    const result = await transactionService.findAll({
      search: search as string,
      category: category as string,
      month: month as string,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
    res.json(result);
  }

  async findById(req: Request, res: Response) {
    const id = req.params.id as string;
    const result = await transactionService.findById(id);
    if (!result) {
      res.status(404).json({ error: "Transaction not found" });
      return;
    }
    res.json(result);
  }

  async create(req: Request, res: Response) {
    try {
      const result = await transactionService.create(req.body, req.user!.id);
      getSocketIO().emit("dataUpdate", { entity: "transactions" });
      res.status(201).json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message || "Failed to create transaction" });
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
    } catch (err: any) {
      res.status(400).json({ error: err.message || "Failed to update transaction" });
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
    } catch (err: any) {
      res.status(400).json({ error: err.message || "Failed to delete transaction" });
    }
  }

  async getSummary(req: Request, res: Response) {
    const result = await transactionService.getSummary();
    res.json(result);
  }
}

export const transactionController = new TransactionController();
