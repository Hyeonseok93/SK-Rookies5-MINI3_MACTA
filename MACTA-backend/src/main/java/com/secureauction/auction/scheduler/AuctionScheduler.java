package com.secureauction.auction.scheduler;

import com.secureauction.auction.domain.*;
import com.secureauction.auction.repository.AuctionRepository;
import com.secureauction.auction.service.AuctionProcessService;
import com.secureauction.auction.service.NotificationFacade;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class AuctionScheduler {

    private final AuctionRepository auctionRepository;
    private final NotificationFacade notificationFacade;
    private final AuctionProcessService auctionProcessService;

    @Scheduled(cron = "0 * * * * *") // 매 분 0초 실행
    public void openReadyAndCloseExpiredAuctions() {
        LocalDateTime now = LocalDateTime.now(ZoneId.of("Asia/Seoul"));
        log.info("Auction scheduler tick (KST: {})", now);

        List<Long> readyIds = auctionRepository.findIdsByStatusAndStartTimeLessThanEqual(AuctionStatus.READY, now);
        if (!readyIds.isEmpty()) {
            log.info("Found {} auctions to open (READY → LIVE).", readyIds.size());
        }
        for (Long auctionId : readyIds) {
            try {
                auctionProcessService.processStart(auctionId);
            } catch (Exception e) {
                log.error("[Critical] 경매 시작 처리 실패 - ID: {}, 사유: {}", auctionId, e.getMessage());
            }
        }

        List<Long> targetIds = auctionRepository.findIdsByStatusAndEndTimeBefore(AuctionStatus.LIVE, now);
        if (!targetIds.isEmpty()) {
            log.info("Found {} auctions to close.", targetIds.size());
        }
        for (Long auctionId : targetIds) {
            try {
                auctionProcessService.processClosure(auctionId);
            } catch (Exception e) {
                log.error("[Critical] 경매 마감 처리 실패 - ID: {}, 사유: {}", auctionId, e.getMessage());
            }
        }
    }

    @Scheduled(cron = "0 0 * * * *")
    @Transactional
    public void notifyClosingSoon() {
        LocalDateTime now = LocalDateTime.now(ZoneId.of("Asia/Seoul"));
        LocalDateTime targetTime = now.plusHours(1);

        List<Auction> closingAuctions = auctionRepository.findAllByStatusAndEndTimeBetween(
                AuctionStatus.LIVE, now, targetTime
        );

        for (Auction auction : closingAuctions) {
            auction.getBids().stream()
                    .map(Bid::getUser)
                    .collect(java.util.stream.Collectors.toMap(User::getId, u -> u, (a, b) -> a))
                    .values()
                    .forEach(user -> notificationFacade.notifyClosingSoon(user, auction));
        }
    }
}
