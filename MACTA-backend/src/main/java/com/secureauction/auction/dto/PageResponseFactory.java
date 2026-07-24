package com.secureauction.auction.dto;

import org.springframework.data.domain.Page;

import java.util.HashMap;
import java.util.Map;

public final class PageResponseFactory {

    private PageResponseFactory() {
    }

    public static Map<String, Object> from(Page<?> page) {
        Map<String, Object> pageInfo = new HashMap<>();
        pageInfo.put("currentPage", page.getNumber());
        pageInfo.put("pageSize", page.getSize());
        pageInfo.put("totalPages", page.getTotalPages());
        pageInfo.put("totalElements", page.getTotalElements());
        pageInfo.put("isFirst", page.isFirst());
        pageInfo.put("isLast", page.isLast());
        pageInfo.put("hasNext", page.hasNext());
        pageInfo.put("hasPrevious", page.hasPrevious());

        Map<String, Object> responseData = new HashMap<>();
        responseData.put("content", page.getContent());
        responseData.put("pageInfo", pageInfo);
        return responseData;
    }
}
