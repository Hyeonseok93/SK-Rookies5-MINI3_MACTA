package com.secureauction.auction.global.config;

import com.secureauction.auction.repository.AuctionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * 기존 auctions.bid_count 컬럼이 0으로 채워진 경우 bids 테이블 기준으로 한 번 동기화한다.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class BidCountBackfillRunner implements ApplicationRunner {

    private final AuctionRepository auctionRepository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        int updated = auctionRepository.syncBidCountsFromBids();
        if (updated > 0) {
            log.info("Synced bid_count for {} auctions from bids table", updated);
        }
    }
}
