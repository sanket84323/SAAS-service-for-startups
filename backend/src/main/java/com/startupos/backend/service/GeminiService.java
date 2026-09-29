package com.startupos.backend.service;

import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.google.genai.GoogleGenAiChatOptions;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.converter.BeanOutputConverter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;

@Service
public class GeminiService {

    @Autowired
    private ChatModel chatModel;

    public String generateContent(String systemInstruction, String userPrompt, boolean jsonMode) {
        List<Message> messages = new ArrayList<>();
        
        if (systemInstruction != null && !systemInstruction.trim().isEmpty()) {
            messages.add(new SystemMessage(systemInstruction));
        }
        messages.add(new UserMessage(userPrompt));

        GoogleGenAiChatOptions options = GoogleGenAiChatOptions.builder()
                .responseMimeType(jsonMode ? "application/json" : "text/plain")
                .temperature(0.7)
                .build();

        Prompt prompt = new Prompt(messages, options);
        
        try {
            ChatResponse response = chatModel.call(prompt);
            if (response != null && response.getResult() != null && response.getResult().getOutput() != null) {
                return response.getResult().getOutput().getText();
            }
            throw new RuntimeException("Spring AI ChatModel returned empty response.");
        } catch (Exception e) {
            throw new RuntimeException("Error calling Gemini API via Spring AI: " + e.getMessage(), e);
        }
    }

    public <T> T generateStructuredContent(String systemInstruction, String userPrompt, Class<T> clazz) {
        BeanOutputConverter<T> converter = new BeanOutputConverter<>(clazz);
        String formatInstructions = converter.getFormat();
        
        List<Message> messages = new ArrayList<>();
        if (systemInstruction != null && !systemInstruction.trim().isEmpty()) {
            messages.add(new SystemMessage(systemInstruction));
        }
        
        String fullUserPrompt = userPrompt + "\n\n" + formatInstructions;
        messages.add(new UserMessage(fullUserPrompt));

        GoogleGenAiChatOptions options = GoogleGenAiChatOptions.builder()
                .responseMimeType("application/json")
                .temperature(0.7)
                .build();

        Prompt prompt = new Prompt(messages, options);
        
        try {
            ChatResponse response = chatModel.call(prompt);
            if (response != null && response.getResult() != null && response.getResult().getOutput() != null) {
                String rawText = response.getResult().getOutput().getText();
                // Strip markdown code block fences if returned by the model
                if (rawText.contains("```json")) {
                    rawText = rawText.substring(rawText.indexOf("```json") + 7);
                    if (rawText.contains("```")) {
                        rawText = rawText.substring(0, rawText.indexOf("```"));
                    }
                } else if (rawText.contains("```")) {
                    rawText = rawText.substring(rawText.indexOf("```") + 3);
                    if (rawText.contains("```")) {
                        rawText = rawText.substring(0, rawText.indexOf("```"));
                    }
                }
                return converter.convert(rawText.trim());
            }
            throw new RuntimeException("Spring AI ChatModel returned empty response.");
        } catch (Exception e) {
            throw new RuntimeException("Error generating structured content: " + e.getMessage(), e);
        }
    }
}
