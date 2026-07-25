package com.secureauction.auction.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.secureauction.auction.dto.BidUpdateMessage;
import com.secureauction.auction.global.config.RedisConfig;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BidUpdateRedisFanoutTest {

    @Mock
    private StringRedisTemplate stringRedisTemplate;

    @Mock
    private ObjectMapper objectMapper;

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @InjectMocks
    private BidUpdateRedisPublisher publisher;

    @InjectMocks
    private BidUpdateRedisSubscriber subscriber;

    @Test
    @DisplayName("입찰 이벤트는 Redis 채널로 publish 된다")
    void publisher_sendsJsonToRedisChannel() throws Exception {
        BidUpdateMessage payload = BidUpdateMessage.builder()
                .auctionId(42L)
                .bidId(7L)
                .currentPrice(15000L)
                .bidCount(3)
                .bidderNickname("bidder")
                .bidTime(LocalDateTime.of(2026, 7, 25, 11, 0))
                .status("LIVE")
                .build();
        when(objectMapper.writeValueAsString(payload)).thenReturn("{\"auctionId\":42}");

        publisher.publish(payload);

        verify(stringRedisTemplate).convertAndSend(RedisConfig.BID_UPDATE_CHANNEL, "{\"auctionId\":42}");
    }

    @Test
    @DisplayName("Redis 메시지는 해당 경매 WebSocket topic 으로 전달된다")
    void subscriber_forwardsToAuctionTopic() throws Exception {
        String raw = "{\"auctionId\":42,\"bidId\":7,\"currentPrice\":15000}";
        BidUpdateMessage payload = BidUpdateMessage.builder()
                .auctionId(42L)
                .bidId(7L)
                .currentPrice(15000L)
                .build();
        when(objectMapper.readValue(raw, BidUpdateMessage.class)).thenReturn(payload);

        subscriber.onMessage(raw);

        ArgumentCaptor<BidUpdateMessage> captor = ArgumentCaptor.forClass(BidUpdateMessage.class);
        verify(messagingTemplate).convertAndSend(eq("/topic/auctions/42"), captor.capture());
        assertThat(captor.getValue().getAuctionId()).isEqualTo(42L);
        assertThat(captor.getValue().getCurrentPrice()).isEqualTo(15000L);
    }
}
