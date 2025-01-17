package com.ies2324.projBackend.consumer;

import java.nio.charset.StandardCharsets;
import java.util.Optional;

import org.springframework.amqp.rabbit.annotation.RabbitHandler;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ies2324.projBackend.entities.Keystroke;
import com.ies2324.projBackend.entities.Team;
import com.ies2324.projBackend.entities.User;
import com.ies2324.projBackend.services.KeystrokeSaver;
import com.ies2324.projBackend.services.UserService;

import lombok.AllArgsConstructor;

@Component
@AllArgsConstructor
@RabbitListener(queues = { "strokes" })
public class KeystrokesConsumer {
    @Autowired
    private UserService userService;
    @Autowired
    private SimpMessagingTemplate simpMessagingTemplate;

    private final ObjectMapper mapper = new ObjectMapper();
    private KeystrokeSaver keystrokeSaver;

    @RabbitHandler
    public void receive(byte[] in) throws JsonProcessingException, JsonMappingException {
        Keystroke k = mapper.readValue(new String(in, StandardCharsets.UTF_8), Keystroke.class);
        Optional<User> optAuthor = userService.getUserById(k.getAuthor().getId());
        if (optAuthor.isPresent()) {
            User author = optAuthor.get();
            Team team = author.getTeam();
            if (team != null) {
                keystrokeSaver.addKeyStroke(String.valueOf(k.getAuthor().getId()), k);
                k.setAuthor(author);
                simpMessagingTemplate.convertAndSendToUser(
                        team.getLeader().getUsername(),
                        "/topic/keystrokes",
                        k);
                // System.out.printf("sent to this guy %s: %s\n", team.getLeader().getUsername(), k);
            }
        }

    }
}
