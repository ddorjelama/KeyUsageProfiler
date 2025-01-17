package com.ies2324.projBackend.services.impl;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.ies2324.projBackend.dao.JwtAuthenticationResponse;
import com.ies2324.projBackend.dao.JwtRefreshRequest;
import com.ies2324.projBackend.dao.JwtRefreshResponse;
import com.ies2324.projBackend.dao.SignInRequest;
import com.ies2324.projBackend.dao.SignUpRequest;
import com.ies2324.projBackend.entities.Role;
import com.ies2324.projBackend.entities.Status;
import com.ies2324.projBackend.entities.User;
import com.ies2324.projBackend.entities.UserStatistics;
import com.ies2324.projBackend.repositories.UserRepository;
import com.ies2324.projBackend.services.AuthenticationService;
import com.ies2324.projBackend.services.JwtService;
import com.ies2324.projBackend.services.UserService;
import com.ies2324.projBackend.services.UserStatisticsService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthenticationServiceImpl implements AuthenticationService {
        private final PasswordEncoder passwordEncoder;
        private final UserRepository userRepository;
        private final JwtService jwtService;
        private final UserService userService;
        private final UserStatisticsService userStatisticsService;
        private final AuthenticationManager authenticationManager;

        @Override
        public JwtAuthenticationResponse signup(SignUpRequest request) {
                User user = User.builder().email(request.getEmail())
                                .password(passwordEncoder.encode(request.getPassword()))
                                .name(request.getUsername()).role(Role.USER).build();
                userRepository.save(user);
                // Create user statistics with values at 0
                userStatisticsService.createUserStatistics(UserStatistics.builder().author(user).awpm(0f).maxWpm(0f)
                                .minutesTyping(0f).status(Status.INACTIVE).build());
                var jwt = jwtService.generateToken(user);
                var refreshJwt = jwtService.generateRefreshToken(user);
                long id = user.getId();
                String name = user.getName();
                String email = user.getEmail();
                String userType = user.getRole().toString();
                return JwtAuthenticationResponse.builder().id(id).token(jwt).refreshToken(refreshJwt).username(name)
                                .email(email).userType(userType)
                                .build();
        }

        @Override
        public JwtAuthenticationResponse signin(SignInRequest request) {
                authenticationManager
                                .authenticate(new UsernamePasswordAuthenticationToken(request.getEmail(),
                                                request.getPassword()));
                User user = userRepository.findByEmail(request.getEmail())
                                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password."));
                String jwt = jwtService.generateToken(user);
                var refreshJwt = jwtService.generateRefreshToken(user);
                long id = user.getId();
                String username = user.getUsername();
                String email = user.getEmail();
                String userType = user.getRole().toString();
                return JwtAuthenticationResponse.builder().id(id).token(jwt).refreshToken(refreshJwt).username(username)
                                .email(email).userType(userType)
                                .build();
        }

        @Override
        public JwtRefreshResponse refreshToken(JwtRefreshRequest request) {
                String userEmail = jwtService.extractSubject(request.getRefreshToken());
                UserDetails userDetails = userService.userDetailsService().loadUserByUsername(userEmail);

                if (!jwtService.isRefreshTokenValid(userDetails, request.getRefreshToken()))
                        return null;
                return new JwtRefreshResponse(jwtService.generateToken(userDetails));
        }

}
