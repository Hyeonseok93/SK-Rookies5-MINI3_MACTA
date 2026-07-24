package com.secureauction.auction.service;

import com.secureauction.auction.domain.*;
import com.secureauction.auction.event.AuctionWonEvent;
import com.secureauction.auction.exception.BusinessException;
import com.secureauction.auction.exception.ErrorCode;
import com.secureauction.auction.repository.AuctionRepository;
import com.secureauction.auction.repository.BidRepository;
import com.secureauction.auction.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuctionProcessService {

    private final AuctionRepository auctionRepository;
    private final BidRepository bidRepository;
    private final PaymentRepository paymentRepository;
    private final NotificationFacade notificationFacade;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void processStart(Long auctionId) {
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new BusinessException(ErrorCode.AUCTION_NOT_FOUND));

        if (auction.getStatus() != AuctionStatus.READY) {
            log.warn("Auction {} is not in READY status. Skipping start.", auctionId);
            return;
        }

        auction.updateStatus(AuctionStatus.LIVE);
        log.info("Auction {} started (READY → LIVE).", auctionId);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void processClosure(Long auctionId) {
        log.info("Processing closure for Auction {}...", auctionId);

        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new BusinessException(ErrorCode.AUCTION_NOT_FOUND));

        if (auction.getStatus() != AuctionStatus.LIVE) {
            log.warn("Auction {} is not in LIVE status. Skipping closure.", auctionId);
            return;
        }

        bidRepository.findFirstByAuctionOrderByPriceDesc(auction)
            .ifPresentOrElse(
                highestBid -> {
                    auction.finish(highestBid.getUser());

                    Payment payment = Payment.builder()
                            .user(highestBid.getUser())
                            .auction(auction)
                            .finalPrice(highestBid.getPrice())
                            .status(PaymentStatus.PENDING)
                            .build();
                    paymentRepository.save(payment);

                    eventPublisher.publishEvent(new AuctionWonEvent(auction, highestBid.getUser()));

                    notificationFacade.notifyAuctionWonToSeller(auction, highestBid.getPrice());

                    log.info("Auction {} won by user {}.", auction.getId(), highestBid.getUser().getId());
                },
                () -> {
                    auction.updateStatus(AuctionStatus.FINISHED);

                    notificationFacade.notifyAuctionEndedNoBids(auction);
                    log.info("Auction {} finished with no bids.", auction.getId());
                }
            );
    }
}
