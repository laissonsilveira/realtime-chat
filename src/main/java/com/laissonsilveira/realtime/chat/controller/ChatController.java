package com.laissonsilveira.realtime.chat.controller;

import com.laissonsilveira.realtime.chat.model.ChatInMessage;
import org.apache.commons.lang3.StringUtils;
import org.springframework.messaging.handler.annotation.MessageExceptionHandler;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import org.springframework.web.util.HtmlUtils;

import com.laissonsilveira.realtime.chat.model.ChatOutMessage;

@Controller
public class ChatController {

	@MessageMapping("/guestchat")
    @SendTo("/topic/guestchats")
    public ChatOutMessage handleMessaging(ChatInMessage chat) throws Exception {
        Thread.sleep(1000); // simulated delay
        String message = String.format("%s: %s", chat.getSenderName(), chat.getMessage());
        return new ChatOutMessage(HtmlUtils.htmlEscape(message));
    }
    
    @MessageMapping("/guestupdate")
    @SendTo("/topic/guestupdates")
    public ChatOutMessage handleUserTyping(ChatInMessage chat) {
        if (StringUtils.isNotBlank(chat.getMessage()))
            return new ChatOutMessage("Someone is typing...");
        else
            return new ChatOutMessage("");
    }
    
    @MessageMapping("/guestjoin")
    @SendTo("/topic/guestnames")
    public ChatOutMessage handleMemberJoins(ChatInMessage chat) {
        return new ChatOutMessage(chat.getMessage());
    }
    
    @MessageExceptionHandler
	@SendTo("/topic/errors")
	public ChatOutMessage handleException(Throwable exception) {
        exception.printStackTrace();
		return new ChatOutMessage("An error happened");
	}
}
