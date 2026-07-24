package com.secureauction.auction.repository;

import com.secureauction.auction.domain.Picture;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;

public interface PictureRepository extends JpaRepository<Picture, Long> {

    @Query("SELECT p.auction.id, p.imageKey FROM Picture p WHERE p.auction.id IN :auctionIds AND p.isMain = true")
    List<Object[]> findMainImageKeysByAuctionIds(@Param("auctionIds") Collection<Long> auctionIds);
}
