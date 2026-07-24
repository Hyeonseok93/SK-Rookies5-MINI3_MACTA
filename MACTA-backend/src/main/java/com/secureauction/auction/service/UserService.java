package com.secureauction.auction.service;

import com.secureauction.auction.domain.Auction;
import com.secureauction.auction.domain.AuctionStatus;
import com.secureauction.auction.domain.User;
import com.secureauction.auction.dto.*;
import com.secureauction.auction.exception.BusinessException;
import com.secureauction.auction.exception.ErrorCode;
import com.secureauction.auction.repository.AuctionLikeRepository;
import com.secureauction.auction.repository.AuctionRepository;
import com.secureauction.auction.repository.BidRepository;
import com.secureauction.auction.repository.PaymentRepository;
import com.secureauction.auction.repository.PictureRepository;
import com.secureauction.auction.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuctionLikeRepository auctionLikeRepository;
    private final AuctionRepository auctionRepository;
    private final BidRepository bidRepository;
    private final PaymentRepository paymentRepository;
    private final PictureRepository pictureRepository;
    private final PictureUrlResolver pictureUrlResolver;

    private Map<Long, String> loadMainImageKeys(List<Long> auctionIds) {
        Map<Long, String> map = new HashMap<>();
        if (auctionIds.isEmpty()) {
            return map;
        }
        for (Object[] row : pictureRepository.findMainImageKeysByAuctionIds(auctionIds)) {
            map.put((Long) row[0], (String) row[1]);
        }
        return map;
    }

    private Map<Long, Long> loadFinalPrices(List<Long> auctionIds) {
        Map<Long, Long> map = new HashMap<>();
        if (auctionIds.isEmpty()) {
            return map;
        }
        for (Object[] row : paymentRepository.findFinalPricesByAuctionIds(auctionIds)) {
            map.put((Long) row[0], (Long) row[1]);
        }
        return map;
    }

    private Map<Long, Long> loadMaxPrices(List<Long> auctionIds) {
        Map<Long, Long> map = new HashMap<>();
        if (auctionIds.isEmpty()) {
            return map;
        }
        for (Object[] row : bidRepository.findMaxPriceGroupedByAuctionIds(auctionIds)) {
            map.put((Long) row[0], (Long) row[1]);
        }
        return map;
    }

    private Map<Long, Long> loadMyMaxPrices(User user, List<Long> auctionIds) {
        Map<Long, Long> map = new HashMap<>();
        if (auctionIds.isEmpty()) {
            return map;
        }
        for (Object[] row : bidRepository.findMaxPriceGroupedByUserAndAuctionIds(user, auctionIds)) {
            map.put((Long) row[0], (Long) row[1]);
        }
        return map;
    }

    private AuctionDto.MyPageListResponse toMyPageResponse(
            Auction auction,
            Long currentPrice,
            Long myPrice,
            User currentUser,
            Map<Long, String> mainImageKeys,
            Map<Long, Long> finalPrices
    ) {
        String mainUrl = pictureUrlResolver.resolve(mainImageKeys.get(auction.getId()));

        Long finalPrice = null;
        if (auction.getStatus() != AuctionStatus.LIVE && auction.getStatus() != AuctionStatus.READY) {
            finalPrice = finalPrices.get(auction.getId());
        }

        String statusStr = auction.getStatus().name();
        if (currentUser != null) {
            if (auction.getStatus() == AuctionStatus.FINISHED) {
                if (auction.getWinner() != null && currentUser.getId().equals(auction.getWinner().getId())) {
                    statusStr = "WON";
                } else if (myPrice != null) {
                    statusStr = "LOST";
                }
            } else if (auction.getStatus() == AuctionStatus.LIVE && myPrice != null) {
                if (myPrice < currentPrice) {
                    statusStr = "OUTBID";
                }
            }
            if (currentUser.getId().equals(auction.getSeller().getId()) && auction.getStatus() == AuctionStatus.FINISHED) {
                if (auction.getWinner() != null) {
                    statusStr = "SOLD";
                } else {
                    statusStr = "FINISHED";
                }
            }
        }

        return AuctionDto.MyPageListResponse.builder()
                .auctionId(auction.getId())
                .title(auction.getTitle())
                .currentPrice(currentPrice)
                .myPrice(myPrice)
                .finalPrice(finalPrice)
                .status(statusStr)
                .viewCount(auction.getViewCount())
                .likeCount(auction.getLikeCount())
                .createdAt(auction.getCreatedAt())
                .mainPictureUrl(mainUrl)
                .build();
    }

    private Page<AuctionDto.MyPageListResponse> mapAuctionPage(Page<Auction> page, User user, boolean includeMyBid) {
        List<Auction> auctions = page.getContent();
        List<Long> ids = auctions.stream().map(Auction::getId).toList();
        Map<Long, String> mainImageKeys = loadMainImageKeys(ids);
        Map<Long, Long> finalPrices = loadFinalPrices(ids);
        Map<Long, Long> maxPrices = includeMyBid ? loadMaxPrices(ids) : Map.of();
        Map<Long, Long> myPrices = includeMyBid ? loadMyMaxPrices(user, ids) : Map.of();

        return page.map(auction -> {
            Long current = includeMyBid
                    ? maxPrices.getOrDefault(auction.getId(), auction.getCurrentPrice())
                    : auction.getCurrentPrice();
            Long myPrice = includeMyBid ? myPrices.get(auction.getId()) : null;
            return toMyPageResponse(auction, current, myPrice, user, mainImageKeys, finalPrices);
        });
    }

    @Transactional(readOnly = true)
    public UserSummaryResponse getUserSummary(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND));

        return UserSummaryResponse.builder()
                .biddingCount(Math.toIntExact(bidRepository.countDistinctAuctionsByUser(user)))
                .wonCount(Math.toIntExact(auctionRepository.countByWinner(user)))
                .hostedCount(Math.toIntExact(auctionRepository.countBySeller(user)))
                .watchlistCount(Math.toIntExact(auctionLikeRepository.countByUser(user)))
                .build();
    }

    @Transactional
    public void updatePassword(Long userId, PasswordUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BusinessException(ErrorCode.INVALID_PASSWORD);
        }

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE);
        }

        user.updatePassword(passwordEncoder.encode(request.getNewPassword()));
    }

    @Transactional(readOnly = true)
    public UserInfoResponse getUserInfo(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND));
        return UserInfoResponse.from(user);
    }

    @Transactional
    public void updateUserInfo(Long userId, UserUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND));

        if (!user.getNickname().equals(request.getNickname()) && userRepository.existsByNickname(request.getNickname())) {
            throw new BusinessException(ErrorCode.DUPLICATE_RESOURCE);
        }

        user.updateInfo(request.getNickname());
    }

    @Transactional(readOnly = true)
    public Page<AuctionDto.MyPageListResponse> getMyAuctions(User user, String status, Pageable pageable) {
        Page<Auction> page;
        if (status == null || status.isBlank() || "ALL".equalsIgnoreCase(status)) {
            page = auctionRepository.findBySeller(user, pageable);
        } else if ("SOLD".equalsIgnoreCase(status)) {
            page = auctionRepository.findBySellerAndStatusAndWinnerIsNotNull(user, AuctionStatus.FINISHED, pageable);
        } else if ("FINISHED".equalsIgnoreCase(status)) {
            page = auctionRepository.findBySellerAndStatusAndWinnerIsNull(user, AuctionStatus.FINISHED, pageable);
        } else {
            AuctionStatus auctionStatus;
            try {
                auctionStatus = AuctionStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE);
            }
            page = auctionRepository.findBySellerAndStatus(user, auctionStatus, pageable);
        }
        return mapAuctionPage(page, user, false);
    }

    @Transactional(readOnly = true)
    public Page<AuctionDto.MyPageListResponse> getMyBids(User user, String status, Pageable pageable) {
        Page<Auction> auctions;

        if (status == null || status.isBlank() || "ALL".equalsIgnoreCase(status)) {
            auctions = bidRepository.findBidAuctionsByUser(user, pageable);
        } else if ("WON".equalsIgnoreCase(status)) {
            auctions = auctionRepository.findByWinnerAndStatus(user, AuctionStatus.FINISHED, pageable);
        } else if ("LOST".equalsIgnoreCase(status)) {
            auctions = bidRepository.findLostAuctionsByUser(user, pageable);
        } else if ("PAID".equalsIgnoreCase(status) || "SHIPPING".equalsIgnoreCase(status) || "COMPLETED".equalsIgnoreCase(status)) {
            auctions = auctionRepository.findByWinnerAndStatus(user, AuctionStatus.valueOf(status.toUpperCase()), pageable);
        } else if ("OUTBID".equalsIgnoreCase(status)) {
            auctions = bidRepository.findOutbidAuctionsByUser(user, pageable);
        } else {
            AuctionStatus auctionStatus;
            try {
                auctionStatus = AuctionStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE);
            }
            auctions = bidRepository.findBidAuctionsByUserAndStatus(user, auctionStatus, pageable);
        }

        return mapAuctionPage(auctions, user, true);
    }

    @Transactional(readOnly = true)
    public Page<AuctionDto.MyPageListResponse> getMyWishlist(User user, Pageable pageable) {
        Page<com.secureauction.auction.domain.AuctionLike> likes = auctionLikeRepository.findByUser(user, pageable);
        List<Long> ids = likes.getContent().stream()
                .map(like -> like.getAuction().getId())
                .toList();
        Map<Long, String> mainImageKeys = loadMainImageKeys(ids);
        Map<Long, Long> finalPrices = loadFinalPrices(ids);

        return likes.map(like -> {
            Auction auction = like.getAuction();
            return toMyPageResponse(auction, auction.getCurrentPrice(), null, user, mainImageKeys, finalPrices);
        });
    }
}
