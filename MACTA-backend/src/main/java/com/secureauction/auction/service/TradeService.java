package com.secureauction.auction.service;

import com.secureauction.auction.domain.*;
import com.secureauction.auction.dto.PaymentRequest;
import com.secureauction.auction.exception.BusinessException;
import com.secureauction.auction.exception.ErrorCode;
import com.secureauction.auction.repository.AuctionRepository;
import com.secureauction.auction.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TradeService {

    private final AuctionRepository auctionRepository;
    private final PaymentRepository paymentRepository;
    private final NotificationFacade notificationFacade;

    /**
     * 낙찰자 결제 (PENDING -> PAID)
     * 3단계 보안 검증 (상태, 권한, 금액 무결성) 적용
     */
    @Transactional
    public void processPayment(PaymentRequest request, User user) {
        Auction auction = auctionRepository.findById(request.getAuctionId())
                .orElseThrow(() -> new BusinessException(ErrorCode.AUCTION_NOT_FOUND));

        if (auction.getStatus() != AuctionStatus.FINISHED) {
            throw new BusinessException(ErrorCode.ALREADY_PROCESSED);
        }

        if (auction.getWinner() == null || !auction.getWinner().getId().equals(user.getId())) {
            throw new BusinessException(ErrorCode.NOT_THE_WINNER);
        }

        if (!auction.getCurrentPrice().equals(request.getAmount())) {
            throw new BusinessException(ErrorCode.PAYMENT_AMOUNT_MISMATCH);
        }

        Payment payment = paymentRepository.findByAuction(auction)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND));

        if (payment.getStatus() != PaymentStatus.PENDING) {
            throw new BusinessException(ErrorCode.ALREADY_PROCESSED);
        }

        payment.complete();
        auction.updateStatus(AuctionStatus.PAID);

        notificationFacade.notifyPaymentCompleted(auction);
    }

    @Transactional
    public void startShipping(Long auctionId, User user) {
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new BusinessException(ErrorCode.AUCTION_NOT_FOUND));

        if (!auction.getSeller().getId().equals(user.getId())) {
            throw new BusinessException(ErrorCode.ACCESS_DENIED);
        }

        if (auction.getStatus() != AuctionStatus.PAID) {
            throw new BusinessException(ErrorCode.ALREADY_PROCESSED);
        }

        auction.updateStatus(AuctionStatus.SHIPPING);

        notificationFacade.notifyShippingStarted(auction);
    }

    @Transactional
    public void completeTrade(Long auctionId, User user) {
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new BusinessException(ErrorCode.AUCTION_NOT_FOUND));

        if (auction.getWinner() == null || !auction.getWinner().getId().equals(user.getId())) {
            throw new BusinessException(ErrorCode.NOT_THE_WINNER);
        }

        if (auction.getStatus() != AuctionStatus.SHIPPING) {
            throw new BusinessException(ErrorCode.ALREADY_PROCESSED);
        }

        auction.updateStatus(AuctionStatus.COMPLETED);

        notificationFacade.notifyTradeCompleted(auction);
    }
}
