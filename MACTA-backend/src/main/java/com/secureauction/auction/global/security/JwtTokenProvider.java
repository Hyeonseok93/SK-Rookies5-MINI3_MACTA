package com.secureauction.auction.global.security;

import com.secureauction.auction.domain.User;
import com.secureauction.auction.domain.UserRole;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtTokenProvider {

    @Value("${jwt.secret}")
    private String secretKey;

    private final long accessTokenValidTime = 60 * 60 * 1000L;
    private final long refreshTokenValidTime = 7 * 24 * 60 * 60 * 1000L;

    private Key key;

    public static final String ACCESS_TOKEN_COOKIE = "macta_access_token";

    @PostConstruct
    protected void init() {
        this.key = Keys.hmacShaKeyFor(secretKey.getBytes());
    }

    public String createToken(User user) {
        Claims claims = Jwts.claims().setSubject(user.getLoginId());
        claims.put("uid", user.getId());
        claims.put("role", user.getRole().name());
        claims.put("nickname", user.getNickname());
        claims.put("email", user.getEmail());
        Date now = new Date();

        return Jwts.builder()
                .setClaims(claims)
                .setIssuedAt(now)
                .setExpiration(new Date(now.getTime() + accessTokenValidTime))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    /** @deprecated use {@link #createToken(User)} */
    public String createToken(String loginId, String role) {
        Claims claims = Jwts.claims().setSubject(loginId);
        claims.put("role", role);
        Date now = new Date();
        return Jwts.builder()
                .setClaims(claims)
                .setIssuedAt(now)
                .setExpiration(new Date(now.getTime() + accessTokenValidTime))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public String createRefreshToken() {
        Date now = new Date();
        return Jwts.builder()
                .setIssuedAt(now)
                .setExpiration(new Date(now.getTime() + refreshTokenValidTime))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * JWT claims만으로 Authentication 구성 (요청마다 DB 조회하지 않음).
     */
    public Authentication getAuthentication(String token) {
        Claims claims = parseClaims(token);
        String roleName = claims.get("role", String.class);
        Number uid = claims.get("uid", Number.class);
        Long userId = uid != null ? uid.longValue() : null;

        User user = User.builder()
                .id(userId)
                .loginId(claims.getSubject())
                .nickname(claims.get("nickname", String.class))
                .email(claims.get("email", String.class))
                .role(roleName != null ? UserRole.valueOf(roleName) : UserRole.ROLE_USER)
                .password("")
                .build();

        CustomUserDetails principal = new CustomUserDetails(user);
        return new UsernamePasswordAuthenticationToken(principal, "", principal.getAuthorities());
    }

    public String getUserLoginId(String token) {
        return parseClaims(token).getSubject();
    }

    public String resolveToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if (ACCESS_TOKEN_COOKIE.equals(cookie.getName()) && cookie.getValue() != null && !cookie.getValue().isBlank()) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }

    public boolean validateToken(String jwtToken) {
        try {
            Jws<Claims> claims = Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(jwtToken);
            return !claims.getBody().getExpiration().before(new Date());
        } catch (ExpiredJwtException e) {
            return false;
        } catch (Exception e) {
            return false;
        }
    }

    private Claims parseClaims(String token) {
        return Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token).getBody();
    }
}
