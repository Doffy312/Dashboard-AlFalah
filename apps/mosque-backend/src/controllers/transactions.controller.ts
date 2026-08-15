import type { Request, Response } from "express";
import { transactionService } from "../services/transactions.service.js";
import { ziswafService } from "../services/ziswaf.service.js";
import { notificationService } from "../services/notifications.service.js";
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

  async publicDonate(req: Request, res: Response) {
    try {
      const { amount, donorName = "Hamba Allah", type = "Infaq", description = "" } = req.body;
      const today = new Date().toISOString().split("T")[0];

      // 1. Create entry in transactions table (Keuangan / Arus Kas)
      const txDescription = description
        ? `Donasi ${type} Scan QR - ${donorName} (${description})`
        : `Donasi ${type} Scan QR - ${donorName}`;

      const newTx = await transactionService.create({
        date: today,
        type: "Pemasukan",
        category: type,
        amount: String(amount),
        description: txDescription,
      });

      // 2. Create entry in ziswaf_transactions table
      await ziswafService.create({
        date: today,
        type: type,
        donorName: donorName,
        amount: String(amount),
        description: description || "Donasi via Scan QR Code",
      });

      // 3. Create a dedicated notification for Scan QR donation
      const formattedAmount = Number(amount).toLocaleString("id-ID");
      await notificationService.create({
        type: "Donasi",
        title: `Donasi ${type} Scan QR Masuk`,
        description: `Rp ${formattedAmount} dari ${donorName} melalui Scan QR Code QRIS`,
      });

      // 4. Emit real-time updates via Socket.IO
      try {
        const io = getSocketIO();
        io.emit("dataUpdate", { entity: "transactions" });
        io.emit("dataUpdate", { entity: "ziswaf" });
        io.emit("notificationUpdated");
      } catch (e) {
        // Socket may be offline in standalone test execution
      }

      res.status(201).json({
        message: "Donasi Scan QR berhasil diproses dan disimpan ke database MySQL",
        data: newTx,
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message || "Gagal memproses donasi Scan QR" });
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

