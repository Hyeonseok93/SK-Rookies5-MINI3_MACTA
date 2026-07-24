package com.secureauction.auction.service;

import com.secureauction.auction.repository.AuctionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuctionViewService {

    private final AuctionRepository auctionRepository;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void incrementViewCount(Long auctionId) {
        auctionRepository.incrementViewCount(auctionId);
    }
}
