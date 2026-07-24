package com.secureauction.auction.repository;

import com.secureauction.auction.domain.Auction;
import com.secureauction.auction.domain.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByAuction(Auction auction);

    @Query("SELECT p.auction.id, p.finalPrice FROM Payment p WHERE p.auction.id IN :auctionIds")
    List<Object[]> findFinalPricesByAuctionIds(@Param("auctionIds") Collection<Long> auctionIds);
}
