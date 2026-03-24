import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import type {
  SocketJoinRoomPayload,
  SocketLeaveRoomPayload,
  SocketComponentUpdatePayload,
  SocketLockStatusPayload,
} from '@codigo/schema';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'collaboration',
})
export class CollaborationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  // 内存中维护房间用户状态：roomId -> Map<socketId, UserInfo>
  private roomUsers = new Map<
    string,
    Map<
      string,
      {
        userId: number;
        userName: string;
        isOnline: boolean;
        lastActiveAt: number;
      }
    >
  >();

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    // 遍历所有房间，移除该客户端，并广播更新
    for (const [roomId, users] of this.roomUsers.entries()) {
      if (users.has(client.id)) {
        users.delete(client.id);
        this.broadcastRoomUsers(roomId);
        // 如果房间空了，清理房间
        if (users.size === 0) {
          this.roomUsers.delete(roomId);
        }
      }
    }
  }

  @SubscribeMessage('join_room')
  handleJoinRoom(client: Socket, payload: SocketJoinRoomPayload) {
    const roomId = `page_${payload.pageId}`;
    client.join(roomId);

    if (!this.roomUsers.has(roomId)) {
      this.roomUsers.set(roomId, new Map());
    }

    const users = this.roomUsers.get(roomId);
    if (users) {
      users.set(client.id, {
        userId: payload.userId,
        userName: payload.userName,
        isOnline: true,
        lastActiveAt: Date.now(),
      });
    }

    this.broadcastRoomUsers(roomId);
    console.log(`Client ${client.id} joined room ${roomId}`);
  }

  @SubscribeMessage('leave_room')
  handleLeaveRoom(client: Socket, payload: SocketLeaveRoomPayload) {
    const roomId = `page_${payload.pageId}`;
    client.leave(roomId);

    const users = this.roomUsers.get(roomId);
    if (users && users.has(client.id)) {
      users.delete(client.id);
      this.broadcastRoomUsers(roomId);
      if (users.size === 0) {
        this.roomUsers.delete(roomId);
      }
    }
  }

  @SubscribeMessage('component_update')
  handleComponentUpdate(client: Socket, payload: SocketComponentUpdatePayload) {
    const roomId = `page_${payload.pageId}`;
    this.updateUserActivity(client.id, roomId);
    client.to(roomId).emit('sync_component', payload);
  }

  @SubscribeMessage('toggle_lock')
  handleToggleLock(client: Socket, payload: SocketLockStatusPayload) {
    const roomId = `page_${payload.pageId}`;
    this.updateUserActivity(client.id, roomId);
    client.to(roomId).emit('sync_lock_status', payload);
  }

  private updateUserActivity(socketId: string, roomId: string) {
    const users = this.roomUsers.get(roomId);
    if (users && users.has(socketId)) {
      const user = users.get(socketId);
      if (user) {
        user.lastActiveAt = Date.now();
        users.set(socketId, user);
      }
      this.broadcastRoomUsers(roomId);
    }
  }

  private broadcastRoomUsers(roomId: string) {
    const users = this.roomUsers.get(roomId);
    if (users) {
      const usersList = Array.from(users.values());
      this.server.to(roomId).emit('room_users_update', { users: usersList });
    }
  }
}
