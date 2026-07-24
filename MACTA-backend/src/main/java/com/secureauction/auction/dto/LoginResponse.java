package com.secureauction.auction.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Builder;
import lombok.Getter;

@Builder
public class LoginResponse {
    /** HttpOnly 쿠키로만 전달. JSON 응답에는 포함하지 않음. */
    private final String accessToken;
    @Getter
    private final UserDto user;

    @JsonIgnore
    public String getAccessToken() {
        return accessToken;
    }

    @Getter
    @Builder
    public static class UserDto {
        private Long id;
        private String nickname;
        private String role;
        private String email;
    }
}
