package com.secureauction.auction.domain;

public enum NotificationType {
    OUTBID,              // 상위 입찰 발생
    NEW_BID,             // 판매자: 신규 입찰
    AUCTION_WON,         // 경매 낙찰
    AUCTION_ENDED,       // 경매 종료 (유찰 등)
    NEW_QUESTION,        // 새로운 문의 등록
    NEW_ANSWER,          // 문의에 대한 답변 등록
    CLOSING_SOON,        // 경매 마감 임박
    PAYMENT_COMPLETED,   // 결제 완료 (판매자)
    SHIPPING_STARTED,    // 배송 시작 (구매자)
    TRADE_COMPLETED      // 수령 확인 / 거래 완료
}