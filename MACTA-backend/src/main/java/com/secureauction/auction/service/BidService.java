package com.secureauction.auction.service;

import com.secureauction.auction.domain.*;
import com.secureauction.auction.dto.BidResponse;
import com.secureauction.auction.dto.BidUpdateMessage;
import com.secureauction.auction.event.BidPlacedEvent;
import com.secureauction.auction.exception.BusinessException;
import com.secureauction.auction.exception.ErrorCode;
import com.secureauction.auction.repository.AuctionRepository;
import com.secureauction.auction.repository.BidRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BidService {

    private final AuctionRepository auctionRepository;
    private final BidRepository bidRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public BidResponse placeBid(Long auctionId, User bidder, Long bidPrice) {
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND));

        if (auction.getStatus() != AuctionStatus.LIVE) {
            throw new BusinessException(ErrorCode.AUCTION_CLOSED);
        }

        if (auction.getEndTime().isBefore(LocalDateTime.now())) {
            throw new BusinessException(ErrorCode.AUCTION_CLOSED);
        }

        if (bidPrice <= auction.getCurrentPrice()) {
            throw new BusinessException(ErrorCode.INVALID_BID_PRICE);
        }

        if (auction.getSeller().getId().equals(bidder.getId())) {
            throw new BusinessException(ErrorCode.SELF_BID_NOT_ALLOWED);
        }

        Optional<Bid> lastHighBid = bidRepository.findFirstByAuctionOrderByPriceDesc(auction);

        auction.updateCurrentPrice(bidPrice);
        auction.increaseBidCount();

        Bid bid = Bid.builder()
                .auction(auction)
                .user(bidder)
                .price(bidPrice)
                .build();

        bidRepository.save(bid);

        Long outbidUserId = lastHighBid
                .filter(previous -> !previous.getUser().getId().equals(bidder.getId()))
                .map(previous -> previous.getUser().getId())
                .orElse(null);

        LocalDateTime bidTime = bid.getUpdatedAt() != null ? bid.getUpdatedAt() : LocalDateTime.now();

        eventPublisher.publishEvent(new BidPlacedEvent(
                this,
                BidUpdateMessage.builder()
                        .auctionId(auctionId)
                        .bidId(bid.getId())
                        .currentPrice(auction.getCurrentPrice())
                        .bidCount(auction.getBidCount())
                        .bidderNickname(bidder.getNickname())
                        .bidTime(bidTime)
                        .status(auction.getStatus().name())
                        .build(),
                auctionId,
                auction.getTitle(),
                auction.getSeller().getId(),
                outbidUserId
        ));

        return BidResponse.builder()
                .bidId(bid.getId())
                .currentPrice(auction.getCurrentPrice())
                .build();
    }
}
