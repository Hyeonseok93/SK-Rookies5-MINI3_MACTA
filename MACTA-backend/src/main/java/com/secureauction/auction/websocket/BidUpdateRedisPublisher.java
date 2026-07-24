package com.secureauction.auction.websocket;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.secureauction.auction.dto.BidUpdateMessage;
import com.secureauction.auction.global.config.RedisConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class BidUpdateRedisPublisher {

    private final StringRedisTemplate stringRedisTemplate;
    private final ObjectMapper objectMapper;

    public void publish(BidUpdateMessage payload) {
        try {
            String json = objectMapper.writeValueAsString(payload);
            stringRedisTemplate.convertAndSend(RedisConfig.BID_UPDATE_CHANNEL, json);
            log.debug("Published bid update to Redis channel {}", RedisConfig.BID_UPDATE_CHANNEL);
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize bid update for Redis publish", e);
        } catch (Exception e) {
            log.error("Failed to publish bid update to Redis", e);
        }
    }
}
