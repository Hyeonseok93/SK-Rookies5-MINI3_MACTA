package com.secureauction.auction.dto;

import com.secureauction.auction.exception.ErrorCode;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class ApiResponse<T> {
    private boolean success;
    private T data;
    private String message;
    private ErrorBody error;
    private LocalDateTime timestamp;

    @Getter
    @Builder
    public static class ErrorBody {
        private String code;
        private String message;
    }

    public static <T> ApiResponse<T> success(T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .data(data)
                .message("작업이 성공적으로 완료되었습니다.")
                .timestamp(LocalDateTime.now())
                .build();
    }

    public static <T> ApiResponse<T> success(T data, String message) {
        return ApiResponse.<T>builder()
                .success(true)
                .data(data)
                .message(message)
                .timestamp(LocalDateTime.now())
                .build();
    }

    public static <T> ApiResponse<T> error(String message) {
        return ApiResponse.<T>builder()
                .success(false)
                .message(message)
                .timestamp(LocalDateTime.now())
                .build();
    }

    public static <T> ApiResponse<T> error(ErrorCode errorCode) {
        return ApiResponse.<T>builder()
                .success(false)
                .message(errorCode.getMessage())
                .error(ErrorBody.builder()
                        .code(errorCode.name())
                        .message(errorCode.getMessage())
                        .build())
                .timestamp(LocalDateTime.now())
                .build();
    }
}
