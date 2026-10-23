import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class AuctionsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(AuctionsGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Client connected to auction live feed: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected from auction live feed: ${client.id}`);
  }

  @SubscribeMessage('join_auction')
  handleJoinAuction(@MessageBody() auctionId: string, @ConnectedSocket() client: Socket) {
    client.join(`auction_${auctionId}`);
    return { event: 'joined', auctionId };
  }

  @SubscribeMessage('leave_auction')
  handleLeaveAuction(@MessageBody() auctionId: string, @ConnectedSocket() client: Socket) {
    client.leave(`auction_${auctionId}`);
    return { event: 'left', auctionId };
  }

  broadcastNewBid(auctionId: string, bidData: any) {
    this.server.to(`auction_${auctionId}`).emit('new_bid', bidData);
    this.server.emit('auction_update', {
      auctionId,
      current_highest_bid: bidData.amount,
      highest_bidder_name: bidData.bidder_name,
      ends_at: bidData.ends_at,
    });
  }
}
