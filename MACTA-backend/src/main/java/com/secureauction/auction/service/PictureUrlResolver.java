package com.secureauction.auction.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * S3 presigned URL 생성 공통화.
 */
@Component
@RequiredArgsConstructor
public class PictureUrlResolver {

    private final ImageService imageService;

    public String resolve(String imageKey) {
        if (imageKey == null || imageKey.isBlank()) {
            return null;
        }
        return imageService.createPresignedUrl(imageKey);
    }
}
