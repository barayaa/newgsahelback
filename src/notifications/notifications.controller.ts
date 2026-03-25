import { Controller, Get, Patch, Param, Delete } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('user/:userId')
  findByUser(@Param('userId') userId: number) {
    return this.notificationsService.findByUser(+userId);
  }

  @Get('user/:userId/unread-count')
  getUnreadCount(@Param('userId') userId: number) {
    return this.notificationsService.getUnreadCount(+userId).then(count => ({ count }));
  }

  @Patch(':id/read')
  markAsRead(@Param('id') id: number) {
    return this.notificationsService.markAsRead(+id);
  }

  @Patch('user/:userId/read-all')
  markAllAsRead(@Param('userId') userId: number) {
    return this.notificationsService.markAllAsRead(+userId);
  }
}
