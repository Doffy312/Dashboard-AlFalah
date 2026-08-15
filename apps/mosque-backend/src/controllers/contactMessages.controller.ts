import { Request, Response, NextFunction } from "express";
import { contactMessagesService } from "../services/contactMessages.service.js";
import { 
  createContactMessageSchema, 
  updateContactMessageStatusSchema 
} from "../validations/contactMessages.validation.js";

export class ContactMessagesController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    const data = await contactMessagesService.findAll();
    res.json(data);
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    const id = req.params.id as string;
    const item = await contactMessagesService.findById(id);
    if (!item) {
      return res.status(404).json({ message: "Pesan tidak ditemukan" });
    }
    res.json(item);
  }

  async create(req: Request, res: Response, next: NextFunction) {
    const validatedData = createContactMessageSchema.parse(req.body);
    const result = await contactMessagesService.create(validatedData);
    res.status(201).json(result);
  }

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    const id = req.params.id as string;
    const validatedData = updateContactMessageStatusSchema.parse(req.body);
    
    const existing = await contactMessagesService.findById(id);
    if (!existing) {
      return res.status(404).json({ message: "Pesan tidak ditemukan" });
    }

    const updated = await contactMessagesService.updateStatus(id, validatedData.status);
    res.json(updated);
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    const id = req.params.id as string;
    const existing = await contactMessagesService.findById(id);
    if (!existing) {
      return res.status(404).json({ message: "Pesan tidak ditemukan" });
    }

    await contactMessagesService.delete(id);
    res.json({ success: true, message: "Pesan berhasil dihapus" });
  }
}

export const contactMessagesController = new ContactMessagesController();
