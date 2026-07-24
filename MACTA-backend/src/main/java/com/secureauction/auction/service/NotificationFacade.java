package com.secureauction.auction.service;

import com.secureauction.auction.domain.Auction;
import com.secureauction.auction.domain.NotificationType;
import com.secureauction.auction.domain.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class NotificationFacade {

    private final NotificationService notificationService;

    public void notifyNewBidToSeller(Auction auction, Long auctionId) {
        notificationService.createNotification(
                auction.getSeller(),
                NotificationType.NEW_BID,
                String.format("[%s] 상품에 새로운 입찰이 등록되었습니다.", auction.getTitle()),
                "/product/" + auctionId
        );
    }

    public void notifyOutbid(User previousBidder, Auction auction, Long auctionId) {
        notificationService.createNotification(
                previousBidder,
                NotificationType.OUTBID,
                String.format("[%s] 상품에 더 높은 입찰가가 제시되었습니다.", auction.getTitle()),
                "/product/" + auctionId
        );
    }

    public void notifyNewQuestion(User seller, Auction auction, Long auctionId) {
        notificationService.createNotification(
                seller,
                NotificationType.NEW_QUESTION,
                String.format("[%s] 상품에 새로운 문의가 등록되었습니다.", auction.getTitle()),
                "/product/" + auctionId
        );
    }

    public void notifyNewAnswer(User questioner, Auction auction, Long auctionId) {
        notificationService.createNotification(
                questioner,
                NotificationType.NEW_ANSWER,
                String.format("[답변 완료] 문의하신 '%s' 상품에 답변이 등록되었습니다.", auction.getTitle()),
                "/product/" + auctionId
        );
    }

    public void notifyClosingSoon(User user, Auction auction) {
        String targetUrl = "/product/" + auction.getId();
        if (notificationService.existsClosingSoon(user, targetUrl)) {
            return;
        }
        notificationService.createNotification(
                user,
                NotificationType.CLOSING_SOON,
                String.format("[마감 임박] '%s' 경매 마감이 1시간 남았습니다!", auction.getTitle()),
                targetUrl
        );
    }

    public void notifyAuctionWonToSeller(Auction auction, Long finalPrice) {
        notificationService.createNotification(
                auction.getSeller(),
                NotificationType.AUCTION_WON,
                String.format("[판매] '%s' 상품이 최종가 ₩%,d에 낙찰되었습니다!", auction.getTitle(), finalPrice),
                "/product/" + auction.getId()
        );
    }

    public void notifyAuctionEndedNoBids(Auction auction) {
        notificationService.createNotification(
                auction.getSeller(),
                NotificationType.AUCTION_ENDED,
                String.format("[유찰] '%s' 경매가 입찰자 없이 종료되었습니다.", auction.getTitle()),
                "/product/" + auction.getId()
        );
    }

    public void notifyPaymentCompleted(Auction auction) {
        notificationService.createNotification(
                auction.getSeller(),
                NotificationType.PAYMENT_COMPLETED,
                String.format("[결제] '%s' 상품의 결제가 완료되었습니다. 배송을 시작해 주세요!", auction.getTitle()),
                "/product/" + auction.getId()
        );
    }

    public void notifyShippingStarted(Auction auction) {
        notificationService.createNotification(
                auction.getWinner(),
                NotificationType.SHIPPING_STARTED,
                String.format("[배송] 주문하신 '%s' 상품의 배송이 시작되었습니다!", auction.getTitle()),
                "/product/" + auction.getId()
        );
    }

    public void notifyTradeCompleted(Auction auction) {
        notificationService.createNotification(
                auction.getSeller(),
                NotificationType.TRADE_COMPLETED,
                String.format("[완료] '%s' 상품의 구매자가 수령을 확인했습니다. 거래가 종료되었습니다.", auction.getTitle()),
                "/product/" + auction.getId()
        );
    }
}
