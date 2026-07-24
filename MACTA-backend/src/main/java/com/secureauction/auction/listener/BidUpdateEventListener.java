package com.secureauction.auction.listener;

import com.secureauction.auction.domain.Auction;
import com.secureauction.auction.domain.User;
import com.secureauction.auction.dto.BidUpdateMessage;
import com.secureauction.auction.event.BidPlacedEvent;
import com.secureauction.auction.repository.AuctionRepository;
import com.secureauction.auction.repository.UserRepository;
import com.secureauction.auction.service.NotificationFacade;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Slf4j
@Component
@RequiredArgsConstructor
public class BidUpdateEventListener {

    private final SimpMessagingTemplate messagingTemplate;
    private final NotificationFacade notificationFacade;
    private final AuctionRepository auctionRepository;
    private final UserRepository userRepository;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void onBidPlaced(BidPlacedEvent event) {
        BidUpdateMessage payload = event.getPayload();
        String destination = "/topic/auctions/" + payload.getAuctionId();
        messagingTemplate.convertAndSend(destination, payload);
        log.debug("Published bid update to {}", destination);

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
