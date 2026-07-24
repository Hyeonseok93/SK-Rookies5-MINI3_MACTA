package com.secureauction.auction.service;

import com.secureauction.auction.domain.Auction;
import com.secureauction.auction.domain.Comment;
import com.secureauction.auction.domain.User;
import com.secureauction.auction.dto.CommentDto;
import com.secureauction.auction.exception.BusinessException;
import com.secureauction.auction.exception.ErrorCode;
import com.secureauction.auction.repository.AuctionRepository;
import com.secureauction.auction.repository.CommentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentService {
    private final CommentRepository commentRepository;
    private final AuctionRepository auctionRepository;
    private final NotificationFacade notificationFacade;

    @Transactional
    public Long createComment(Long auctionId, CommentDto.CreateRequest request, User user) {
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND));

        Comment comment = Comment.builder()
                .auction(auction)
                .user(user)
                .content(request.getContent())
                .build();

        Comment savedComment = commentRepository.save(comment);

        if (!auction.getSeller().getId().equals(user.getId())) {
            notificationFacade.notifyNewQuestion(auction.getSeller(), auction, auctionId);
        }

        return savedComment.getId();
    }

    @Transactional
    public Long createAnswer(Long auctionId, Long parentId, CommentDto.CreateRequest request, User user) {
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND));

        if (!auction.getSeller().getId().equals(user.getId())) {
            throw new BusinessException(ErrorCode.NOT_AUCTION_SELLER);
        }

        Comment parentComment = commentRepository.findById(parentId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND));

        if (!parentComment.getAuction().getId().equals(auctionId) || parentComment.getParent() != null) {
            throw new BusinessException(ErrorCode.RESOURCE_NOT_FOUND);
        }

        Comment answer = Comment.builder()
                .auction(auction)
                .user(user)
                .content(request.getContent())
                .parent(parentComment)
                .build();

        Comment savedAnswer = commentRepository.save(answer);

        if (!parentComment.getUser().getId().equals(user.getId())) {
            notificationFacade.notifyNewAnswer(parentComment.getUser(), auction, auctionId);
        }

        return savedAnswer.getId();
    }

    @Transactional(readOnly = true)
    public List<CommentDto.Response> getComments(Long auctionId) {
        return commentRepository.findByAuctionIdAndParentIsNull(auctionId).stream()
                .map(CommentDto.Response::from)
                .collect(Collectors.toList());
    }
}
