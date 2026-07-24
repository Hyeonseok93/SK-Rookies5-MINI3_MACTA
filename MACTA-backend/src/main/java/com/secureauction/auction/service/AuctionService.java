package com.secureauction.auction.service;

import com.secureauction.auction.domain.*;
import com.secureauction.auction.dto.AuctionDto;
import com.secureauction.auction.dto.AuctionStatsResponse;
import com.secureauction.auction.exception.BusinessException;
import com.secureauction.auction.exception.ErrorCode;
import com.secureauction.auction.global.security.SecurityUtils;
import com.secureauction.auction.repository.AuctionLikeRepository;
import com.secureauction.auction.repository.AuctionRepository;
import com.secureauction.auction.repository.PictureRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuctionService {

    private final AuctionRepository auctionRepository;
    private final PictureRepository pictureRepository;
    private final PictureUrlResolver pictureUrlResolver;
    private final AuctionLikeRepository auctionLikeRepository;
    private final AuctionViewService auctionViewService;

    @Transactional
    public Long createAuction(AuctionDto.CreateRequest request, User seller) {
        LocalDateTime startTime = request.getStartTime() != null ? request.getStartTime() : LocalDateTime.now();
        AuctionStatus initialStatus = startTime.isAfter(LocalDateTime.now()) ? AuctionStatus.READY : AuctionStatus.LIVE;

        Auction auction = Auction.builder()
                .seller(seller)
                .title(request.getTitle())
                .description(request.getDescription())
                .category(Category.valueOf(request.getCategory()))
                .startPrice(request.getStartPrice())
                .currentPrice(request.getStartPrice())
                .startTime(startTime)
                .endTime(request.getEndTime())
                .status(initialStatus)
                .build();

        Auction savedAuction = auctionRepository.save(auction);

        if (request.getPictures() != null) {
            List<Picture> pictures = request.getPictures().stream()
                    .map(picDto -> Picture.builder()
                            .auction(savedAuction)
                            .imageUrl(picDto.getUrl())
                            .imageKey(picDto.getImageKey())
                            .isMain(picDto.getIsMain())
                            .sortOrder(picDto.getSortOrder())
                            .build())
                    .collect(Collectors.toList());

            pictureRepository.saveAll(pictures);
        }

        return savedAuction.getId();
    }

    @Transactional(readOnly = true)
    public Page<AuctionDto.ListResponse> getAuctionList(
            String category, String q, Long minPrice, Long maxPrice, String sort, Pageable pageable) {

        User currentUser = SecurityUtils.currentUserOrNull();

        Sort sortCondition = switch (sort) {
            case "closing-soon" -> Sort.by(Sort.Direction.ASC, "endTime");
            case "price-low" -> Sort.by(Sort.Direction.ASC, "currentPrice");
            case "price-high" -> Sort.by(Sort.Direction.DESC, "currentPrice");
            default -> Sort.by(Sort.Direction.DESC, "createdAt");
        };

        Pageable sortedPageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), sortCondition);

        Specification<Auction> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("status"), AuctionStatus.LIVE));

            if (category != null && !category.isEmpty()) {
                try {
                    predicates.add(cb.equal(root.get("category"), Category.valueOf(category)));
                } catch (IllegalArgumentException ignored) {
                }
            }

            if (q != null && !q.isEmpty()) {
                predicates.add(cb.like(cb.lower(root.get("title")), "%" + q.toLowerCase() + "%"));
            }

            if (minPrice != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("currentPrice"), minPrice));
            }
            if (maxPrice != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("currentPrice"), maxPrice));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Auction> page = auctionRepository.findAll(spec, sortedPageable);
        List<Auction> auctions = page.getContent();
        List<Long> auctionIds = auctions.stream().map(Auction::getId).toList();

        Set<Long> likedIds = new HashSet<>();
        Map<Long, String> mainImageKeys = new HashMap<>();

        if (!auctionIds.isEmpty()) {
            if (currentUser != null) {
                likedIds.addAll(auctionLikeRepository.findLikedAuctionIds(currentUser, auctionIds));
            }
            for (Object[] row : pictureRepository.findMainImageKeysByAuctionIds(auctionIds)) {
                mainImageKeys.put((Long) row[0], (String) row[1]);
            }
        }

        return page.map(auction -> {
            String imageKey = mainImageKeys.get(auction.getId());
            int bidCount = auction.getBidCount() != null ? auction.getBidCount() : 0;
            return AuctionDto.ListResponse.builder()
                    .id(auction.getId())
                    .title(auction.getTitle())
                    .currentPrice(auction.getCurrentPrice())
                    .status(auction.getStatus().name())
                    .category(auction.getCategory().name())
                    .mainPictureUrl(pictureUrlResolver.resolve(imageKey))
                    .startTime(auction.getStartTime())
                    .endTime(auction.getEndTime())
                    .bidCount(bidCount)
                    .isLiked(likedIds.contains(auction.getId()))
                    .sellerId(auction.getSeller().getId())
                    .build();
        });
    }

    @Transactional(readOnly = true)
    public AuctionDto.DetailResponse getAuctionDetail(Long id) {
        auctionViewService.incrementViewCount(id);

        Auction auction = auctionRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.AUCTION_NOT_FOUND));

        User currentUser = SecurityUtils.currentUserOrNull();
        boolean isLiked = currentUser != null
                && auctionLikeRepository.findByUserAndAuction(currentUser, auction).isPresent();

        List<AuctionDto.PictureInfo> pictureInfos = auction.getPictures().stream()
                .map(p -> AuctionDto.PictureInfo.builder()
                        .url(pictureUrlResolver.resolve(p.getImageKey()))
                        .imageKey(p.getImageKey())
                        .isMain(p.getIsMain())
                        .sortOrder(p.getSortOrder())
                        .build())
                .collect(Collectors.toList());

        String mainUrl = pictureInfos.stream()
                .filter(AuctionDto.PictureInfo::getIsMain)
                .map(AuctionDto.PictureInfo::getUrl)
                .findFirst()
                .orElse(null);

        List<AuctionDto.BidInfo> biddingHistory = auction.getBids().stream()
                .map(bid -> AuctionDto.BidInfo.builder()
                        .bidderNickname(bid.getUser().getNickname())
                        .price(bid.getPrice())
                        .bidTime(bid.getUpdatedAt())
                        .build())
                .sorted((b1, b2) -> b2.getBidTime().compareTo(b1.getBidTime()))
                .collect(Collectors.toList());

        return AuctionDto.DetailResponse.builder()
                .id(auction.getId())
                .title(auction.getTitle())
                .description(auction.getDescription())
                .currentPrice(auction.getCurrentPrice())
                .startPrice(auction.getStartPrice())
                .status(auction.getStatus().name())
                .category(auction.getCategory().name())
                .mainPictureUrl(mainUrl)
                .startTime(auction.getStartTime())
                .endTime(auction.getEndTime())
                .viewCount(auction.getViewCount())
                .likeCount(auction.getLikeCount())
                .isLiked(isLiked)
                .sellerNickname(auction.getSeller().getNickname())
                .sellerId(auction.getSeller().getId())
                .sellerJoinedAt(auction.getSeller().getCreatedAt())
                .winnerId(auction.getWinner() != null ? auction.getWinner().getId() : null)
                .winnerNickname(auction.getWinner() != null ? auction.getWinner().getNickname() : null)
                .pictures(pictureInfos)
                .biddingHistory(biddingHistory)
                .build();
    }

    @Transactional
    public AuctionDto.LikeToggleResponse toggleLike(Long auctionId, User user) {
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new BusinessException(ErrorCode.AUCTION_NOT_FOUND));

        Optional<AuctionLike> auctionLike = auctionLikeRepository.findByUserAndAuction(user, auction);
        boolean isLiked;

        if (auctionLike.isPresent()) {
            auctionLikeRepository.delete(auctionLike.get());
            auction.decreaseLikeCount();
            isLiked = false;
        } else {
            auctionLikeRepository.save(AuctionLike.builder().user(user).auction(auction).build());
            auction.increaseLikeCount();
            isLiked = true;
        }

        return AuctionDto.LikeToggleResponse.builder()
                .auctionId(auctionId)
                .likeCount(auction.getLikeCount())
                .isLiked(isLiked)
                .build();
    }

    @Transactional(readOnly = true)
    public AuctionStatsResponse getStats() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime oneHourLater = now.plusHours(1);

        long totalActive = auctionRepository.countByStatus(AuctionStatus.LIVE);
        long endingSoon = auctionRepository.countByStatusAndEndTimeBetween(AuctionStatus.LIVE, now, oneHourLater);

        return AuctionStatsResponse.builder()
                .totalActive(totalActive)
                .endingSoon(endingSoon)
                .build();
    }
}
