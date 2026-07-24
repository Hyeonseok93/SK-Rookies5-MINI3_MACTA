package com.secureauction.auction.controller;

import com.secureauction.auction.dto.ApiResponse;
import com.secureauction.auction.dto.LoginRequest;
import com.secureauction.auction.dto.LoginResponse;
import com.secureauction.auction.dto.SignUpRequest;
import com.secureauction.auction.exception.BusinessException;
import com.secureauction.auction.exception.ErrorCode;
import com.secureauction.auction.global.security.CustomUserDetails;
import com.secureauction.auction.global.security.JwtTokenProvider;
import com.secureauction.auction.repository.UserRepository;
import com.secureauction.auction.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;

    @PostMapping("/signup")
    public ApiResponse<Object> signup(@Valid @RequestBody SignUpRequest request) {
        authService.signUp(request);
        return ApiResponse.success(null, "회원가입이 성공적으로 완료되었습니다.");
    }

    @PostMapping("/login")
    public ApiResponse<LoginResponse> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse response
    ) {
        LoginResponse loginResponse = authService.login(request);
        response.addHeader(HttpHeaders.SET_COOKIE, buildAccessCookie(loginResponse.getAccessToken(), httpRequest, false).toString());
        return ApiResponse.success(loginResponse, "로그인 성공");
    }

    @PostMapping("/logout")
    public ApiResponse<Void> logout(HttpServletRequest httpRequest, HttpServletResponse response) {
        response.addHeader(HttpHeaders.SET_COOKIE, buildAccessCookie("", httpRequest, true).toString());
        return ApiResponse.success(null, "로그아웃 되었습니다.");
    }

    @GetMapping("/me")
    public ApiResponse<LoginResponse> me(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            HttpServletRequest httpRequest,
            HttpServletResponse response
    ) {
        if (userDetails == null || userDetails.getUser().getId() == null) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED);
        }
        var user = userRepository.findById(userDetails.getUser().getId())
                .orElseThrow(() -> new BusinessException(ErrorCode.UNAUTHORIZED));
        String accessToken = jwtTokenProvider.createToken(user);
        response.addHeader(HttpHeaders.SET_COOKIE, buildAccessCookie(accessToken, httpRequest, false).toString());
        LoginResponse loginResponse = LoginResponse.builder()
                .accessToken(accessToken)
                .user(LoginResponse.UserDto.builder()
                        .id(user.getId())
                        .role(user.getRole().name())
                        .nickname(user.getNickname())
                        .email(user.getEmail())
                        .build())
                .build();
        return ApiResponse.success(loginResponse, "세션 복구 성공");
    }

    @GetMapping("/check-login-id")
    public ApiResponse<Boolean> checkLoginId(@RequestParam(name = "login_id") String loginId) {
        boolean isAvailable = authService.isLoginIdAvailable(loginId);
        String message = isAvailable ? "사용 가능한 아이디입니다." : "이미 사용 중인 아이디입니다.";
        return ApiResponse.success(isAvailable, message);
    }

    @GetMapping("/check-nickname")
    public ApiResponse<Boolean> checkNickname(@RequestParam String nickname) {
        boolean isAvailable = authService.isNicknameAvailable(nickname);
        String message = isAvailable ? "사용 가능한 닉네임입니다." : "이미 사용 중인 닉네임입니다.";
        return ApiResponse.success(isAvailable, message);
    }

    @GetMapping("/check-email")
    public ApiResponse<Boolean> checkEmail(@RequestParam String email) {
        boolean isAvailable = authService.isEmailAvailable(email);
        String message = isAvailable ? "사용 가능한 이메일입니다." : "이미 사용 중인 이메일입니다.";
        return ApiResponse.success(isAvailable, message);
    }

    private ResponseCookie buildAccessCookie(String token, HttpServletRequest request, boolean clear) {
        boolean secure = request.isSecure() || "https".equalsIgnoreCase(request.getHeader("X-Forwarded-Proto"));
        return ResponseCookie.from(JwtTokenProvider.ACCESS_TOKEN_COOKIE, token)
                .httpOnly(true)
                .secure(secure)
                .sameSite(secure ? "None" : "Lax")
                .path("/")
                .maxAge(clear ? Duration.ZERO : Duration.ofHours(1))
                .build();
    }
}
