package com.secureauction.auction.global.security;

import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@RequiredArgsConstructor
public class StompAuthChannelInterceptor implements ChannelInterceptor {

    private final JwtTokenProvider jwtTokenProvider;

    @Override
    public Message<?> preSend(@NonNull Message<?> message, @NonNull MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (accessor == null) {
            return message;
        }

        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            Authentication authentication = null;

            Map<String, Object> sessionAttributes = accessor.getSessionAttributes();
            if (sessionAttributes != null) {
                Object attr = sessionAttributes.get(JwtHandshakeInterceptor.AUTH_ATTR);
                if (attr instanceof Authentication auth) {
                    authentication = auth;
                }
            }

            if (authentication == null) {
                String authHeader = accessor.getFirstNativeHeader("Authorization");
                if (authHeader != null && authHeader.startsWith("Bearer ")) {
                    String token = authHeader.substring(7);
                    if (jwtTokenProvider.validateToken(token)) {
                        authentication = jwtTokenProvider.getAuthentication(token);
                    }
                }
            }

            if (authentication != null) {
                accessor.setUser(authentication);
            }
        }
        return message;
    }
}
