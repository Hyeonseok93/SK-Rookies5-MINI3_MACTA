package com.secureauction.auction.event;

import com.secureauction.auction.dto.BidUpdateMessage;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class BidPlacedEvent extends ApplicationEvent {
    private final BidUpdateMessage payload;
    private final Long auctionId;
    private final String auctionTitle;
    private final Long sellerId;
    /** 이전에 최고가였던 입찰자 (자기 재입찰이면 null) */
    private final Long outbidUserId;

    public BidPlacedEvent(
            Object source,
            BidUpdateMessage payload,
            Long auctionId,
            String auctionTitle,
            Long sellerId,
            Long outbidUserId
    ) {
        super(source);
        this.payload = payload;
        this.auctionId = auctionId;
        this.auctionTitle = auctionTitle;
        this.sellerId = sellerId;
        this.outbidUserId = outbidUserId;
    }
}
