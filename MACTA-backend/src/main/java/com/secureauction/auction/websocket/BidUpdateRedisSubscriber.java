package com.secureauction.auction.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.secureauction.auction.dto.BidUpdateMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class BidUpdateRedisSubscriber {

    private final ObjectMapper objectMapper;
    private final SimpMessagingTemplate messagingTemplate;

    public void onMessage(String raw) {
        try {
            BidUpdateMessage payload = objectMapper.readValue(raw, BidUpdateMessage.class);
            String destination = "/topic/auctions/" + payload.getAuctionId();
            messagingTemplate.convertAndSend(destination, payload);
            log.debug("Forwarded Redis bid update to {}", destination);
        } catch (Exception e) {
            log.error("Failed to handle Redis bid update message", e);
        }
    }
}
