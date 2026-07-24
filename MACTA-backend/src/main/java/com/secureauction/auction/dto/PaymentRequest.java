package com.secureauction.auction.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class PaymentRequest {
    @NotNull(message = "경매 ID가 필요합니다.")
    private Long auctionId;

    @NotNull(message = "결제 금액이 필요합니다.")
    @Positive(message = "결제 금액은 0보다 커야 합니다.")
    private Long amount;
}
