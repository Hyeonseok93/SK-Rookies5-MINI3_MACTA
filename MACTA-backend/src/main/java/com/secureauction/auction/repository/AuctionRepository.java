package com.secureauction.auction.repository;

import com.secureauction.auction.domain.Auction;
import com.secureauction.auction.domain.AuctionStatus;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.secureauction.auction.domain.User;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface AuctionRepository extends JpaRepository<Auction, Long>, JpaSpecificationExecutor<Auction> {

    long countByStatus(AuctionStatus status);

    long countByStatusAndEndTimeBetween(AuctionStatus status, LocalDateTime start, LocalDateTime end);
    
    @Query("SELECT a FROM Auction a WHERE a.status = :status AND a.endTime <= :now")
    List<Auction> findAllByStatusAndEndTimeBefore(@Param("status") AuctionStatus status, @Param("now") LocalDateTime now);

    @Query("SELECT a.id FROM Auction a WHERE a.status = :status AND a.endTime <= :now")
    List<Long> findIdsByStatusAndEndTimeBefore(@Param("status") AuctionStatus status, @Param("now") LocalDateTime now);

    @Query("SELECT a.id FROM Auction a WHERE a.status = :status AND a.startTime <= :now")
    List<Long> findIdsByStatusAndStartTimeLessThanEqual(@Param("status") AuctionStatus status, @Param("now") LocalDateTime now);

    @Modifying(clearAutomatically = true)
    @Query("UPDATE Auction a SET a.viewCount = a.viewCount + 1 WHERE a.id = :id")
    int incrementViewCount(@Param("id") Long id);

    /**
     * bids 집계 결과로 bid_count를 맞춘다. (스키마 추가 직후 백필용)
     * @return 갱신된 row 수 (JDBC/Hibernate에 따라 정확한 건수가 아닐 수 있음)
     */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value = """
            UPDATE auctions a
            SET bid_count = (
                SELECT COUNT(*) FROM bids b WHERE b.auction_id = a.id
            )
            """, nativeQuery = true)
    int syncBidCountsFromBids();

    @Query("SELECT a FROM Auction a WHERE a.status = :status AND a.endTime BETWEEN :start AND :end")
    List<Auction> findAllByStatusAndEndTimeBetween(
            @Param("status") AuctionStatus status,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );

    Page<Auction> findBySeller(User seller, Pageable pageable);

    Page<Auction> findBySellerAndStatus(User seller, AuctionStatus status, Pageable pageable);

    Page<Auction> findBySellerAndStatusAndWinnerIsNull(User seller, AuctionStatus status, Pageable pageable);

    Page<Auction> findBySellerAndStatusAndWinnerIsNotNull(User seller, AuctionStatus status, Pageable pageable);

    long countBySeller(User seller);

    long countByWinner(User winner);

    Page<Auction> findByWinnerAndStatus(User winner, AuctionStatus status, Pageable pageable);
}
