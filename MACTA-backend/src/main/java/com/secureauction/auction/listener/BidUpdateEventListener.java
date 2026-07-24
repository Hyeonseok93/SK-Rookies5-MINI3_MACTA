package com.secureauction.auction.listener;

import com.secureauction.auction.domain.Auction;
import com.secureauction.auction.dto.BidUpdateMessage;
import com.secureauction.auction.event.BidPlacedEvent;
import com.secureauction.auction.repository.AuctionRepository;
import com.secureauction.auction.repository.UserRepository;
import com.secureauction.auction.service.NotificationFacade;
import com.secureauction.auction.websocket.BidUpdateRedisPublisher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Slf4j
@Component
@RequiredArgsConstructor
public class BidUpdateEventListener {

    private final BidUpdateRedisPublisher bidUpdateRedisPublisher;
    private final NotificationFacade notificationFacade;
    private final AuctionRepository auctionRepository;
    private final UserRepository userRepository;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void onBidPlaced(BidPlacedEvent event) {
        BidUpdateMessage payload = event.getPayload();
        bidUpdateRedisPublisher.publish(payload);

        Auction auction = auctionRepository.findById(event.getAuctionId()).orElse(null);
        if (auction == null) {
            return;
        }

        notificationFacade.notifyNewBidToSeller(auction, event.getAuctionId());

        if (event.getOutbidUserId() != null) {
            userRepository.findById(event.getOutbidUserId()).ifPresent(previousBidder ->
                    notificationFacade.notifyOutbid(previousBidder, auction, event.getAuctionId())
            );
        }
    }
}
