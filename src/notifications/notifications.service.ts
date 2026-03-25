import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './entities/notification.entity';
import { User } from 'src/PROFILE&USER/user/entities/user.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification) private notifRepo: Repository<Notification>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  async create(destinataireId: number, titre: string, message: string, type: NotificationType, lienId?: number) {
    const destinataire = await this.userRepo.findOne({ where: { id: destinataireId } });
    if (!destinataire) return;

    const notif = this.notifRepo.create({ titre, message, type, lienId, destinataire });
    return this.notifRepo.save(notif);
  }

  async findByUser(userId: number) {
    return this.notifRepo.find({
      where: { destinataire: { id: userId } },
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  async getUnreadCount(userId: number): Promise<number> {
    return this.notifRepo.count({
      where: { destinataire: { id: userId }, lue: false },
    });
  }

  async markAsRead(id: number): Promise<void> {
    await this.notifRepo.update(id, { lue: true });
  }

  async markAllAsRead(userId: number): Promise<void> {
    await this.notifRepo.update(
      { destinataire: { id: userId }, lue: false },
      { lue: true },
    );
  }

  async deleteOld(): Promise<void> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    await this.notifRepo
      .createQueryBuilder()
      .delete()
      .where('createdAt < :date AND lue = true', { date: thirtyDaysAgo })
      .execute();
  }
}
