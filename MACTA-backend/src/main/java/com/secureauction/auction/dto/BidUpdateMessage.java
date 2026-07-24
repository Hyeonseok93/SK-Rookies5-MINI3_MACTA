package com.secureauction.auction.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BidUpdateMessage {
    private Long auctionId;
    private Long bidId;
    private Long currentPrice;
    private Integer bidCount;
    private String bidderNickname;
    private LocalDateTime bidTime;
    private String status;
}
