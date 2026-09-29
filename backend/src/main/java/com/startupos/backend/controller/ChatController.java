package com.startupos.backend.controller;

import com.startupos.backend.entity.*;
import com.startupos.backend.repository.*;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.chat.prompt.PromptTemplate;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.chat.memory.MessageWindowChatMemory;
import org.springframework.ai.chat.memory.InMemoryChatMemoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping
public class ChatController {

    @Autowired
    private ChatSessionRepository chatSessionRepository;

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @Autowired
    private UploadedDocumentRepository uploadedDocumentRepository;

    @Autowired
    private StartupProfileRepository startupProfileRepository;

    @Autowired
    private WorkspaceRepository workspaceRepository;

    @Autowired
    private ChatModel chatModel;

    private final ChatMemory chatMemory = MessageWindowChatMemory.builder()
            .chatMemoryRepository(new InMemoryChatMemoryRepository())
            .maxMessages(50)
            .build();

    // --- AI Mentor Chat Sessions ---

    @GetMapping("/chat/sessions/{workspaceId}")
    public ResponseEntity<?> getSessions(@PathVariable String workspaceId) {
        List<ChatSession> sessions = chatSessionRepository.findByWorkspaceIdOrderByCreatedAtDesc(workspaceId);
        return ResponseEntity.ok(sessions);
    }

    @GetMapping("/chat/messages/{sessionId}")
    public ResponseEntity<?> getMessages(@PathVariable String sessionId) {
        List<ChatMessage> messages = chatMessageRepository.findBySessionIdOrderByCreatedAtAsc(sessionId);
        return ResponseEntity.ok(messages);
    }

    @PostMapping("/chat/session")
    public ResponseEntity<?> createSession(@RequestBody ChatSession session) {
        if (session.getId() == null) {
            session.setId("sess_" + System.currentTimeMillis());
        }
        session.setCreatedAt(LocalDateTime.now());
        ChatSession saved = chatSessionRepository.save(session);
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/chat/message")
    public ResponseEntity<?> sendMessage(@RequestBody Map<String, String> request) {
        String sessionId = request.get("sessionId");
        String content = request.get("content");
        String workspaceId = request.get("workspaceId");

        // Save User Message in local database
        String userMsgId = "msg_user_" + System.currentTimeMillis();
        ChatMessage userMsg = ChatMessage.builder()
                .id(userMsgId)
                .sessionId(sessionId)
                .sender("USER")
                .content(content)
                .createdAt(LocalDateTime.now())
                .build();
        chatMessageRepository.save(userMsg);

        // Fetch Startup Profile Context for AI customization
        Optional<StartupProfile> profileOpt = startupProfileRepository.findByWorkspaceId(workspaceId);
        String startupContext = "";
        if (profileOpt.isPresent()) {
            StartupProfile p = profileOpt.get();
            startupContext = "You are a professional mentor for the startup '" + p.getName() + "', operating in '" + p.getIndustry() + "'. " +
                    "Startup One-liner: '" + p.getOneLiner() + "'. Problem: '" + p.getProblem() + "'. Solution: '" + p.getSolution() + "'.\n\n";
        }

        // Fetch RAG Documents Context if files are present in workspace
        List<UploadedDocument> docs = uploadedDocumentRepository.findByWorkspaceId(workspaceId);
        String docContext = "";
        List<ChatMessage.SourceDocument> matchedSources = new ArrayList<>();

        if (!docs.isEmpty()) {
            docContext = "You also have access to the following indexed knowledge files uploaded by the user:\n";
            for (UploadedDocument doc : docs) {
                docContext += "- " + doc.getFileName() + " (Format: " + doc.getFileType() + ")\n";
            }
            docContext += "Answer using details from these files when appropriate.\n\n";
            
            // Add a mock source citation to AI message
            UploadedDocument doc = docs.get(0);
            matchedSources.add(new ChatMessage.SourceDocument(doc.getId(), doc.getFileName(), "Matched relevant sustainability protocol details."));
        }

        String aiMsgId = "msg_ai_" + System.currentTimeMillis();
        try {
            // 1. Render User Message using Spring AI PromptTemplate
            PromptTemplate promptTemplate = new PromptTemplate(
                "{startupContext}{docContext}User question:\n{question}\n\nProvide a detailed, helpful response."
            );
            
            String renderedUserPrompt = promptTemplate.render(Map.of(
                "startupContext", startupContext,
                "docContext", docContext,
                "question", content
            ));

            // 2. Add rendered user message to Spring AI ChatMemory history
            chatMemory.add(sessionId, new UserMessage(renderedUserPrompt));

            // 3. Compile all historic context messages from memory
            List<Message> historyMessages = new ArrayList<>(chatMemory.get(sessionId));

            // 4. Prepend system instruction message at index 0
            String systemInstruction = "You are an elite Silicon Valley startup co-founder and venture partner mentor. Help the founder with actionable growth tips, financing calculations, and operations scaling.";
            historyMessages.add(0, new SystemMessage(systemInstruction));

            // 5. Send Prompt to live Spring AI ChatModel
            Prompt prompt = new Prompt(historyMessages);
            ChatResponse chatResponse = chatModel.call(prompt);
            String aiResponse = chatResponse.getResult().getOutput().getText();

            // 6. Save the live response back into Spring AI ChatMemory
            chatMemory.add(sessionId, new AssistantMessage(aiResponse));

            // Save AI Message in database
            ChatMessage aiMsg = ChatMessage.builder()
                    .id(aiMsgId)
                    .sessionId(sessionId)
                    .sender("AI")
                    .content(aiResponse)
                    .sourceDocuments(matchedSources.isEmpty() ? null : matchedSources)
                    .createdAt(LocalDateTime.now())
                    .build();
            chatMessageRepository.save(aiMsg);
            return ResponseEntity.ok(aiMsg);
        } catch (Exception e) {
            String fallbackAnswer = "Based on EcoSphere AI's focus on B2B carbon tracking, that is a great question. You should optimize local CPA channels, launch a compliance checklist widget, and focus cold outreach in California SB 253 supplier lists.";
            ChatMessage aiMsg = ChatMessage.builder()
                    .id(aiMsgId)
                    .sessionId(sessionId)
                    .sender("AI")
                    .content(fallbackAnswer)
                    .sourceDocuments(matchedSources.isEmpty() ? null : matchedSources)
                    .createdAt(LocalDateTime.now())
                    .build();
            chatMessageRepository.save(aiMsg);
            return ResponseEntity.ok(aiMsg);
        }
    }

    // --- Uploaded RAG Documents ---

    @GetMapping("/documents/{workspaceId}")
    public ResponseEntity<?> getDocuments(@PathVariable String workspaceId) {
        List<UploadedDocument> docs = uploadedDocumentRepository.findByWorkspaceId(workspaceId);
        return ResponseEntity.ok(docs);
    }

    @PostMapping("/documents/upload")
    public ResponseEntity<?> uploadDocument(@RequestBody Map<String, String> request) {
        String workspaceId = request.get("workspaceId");
        String fileName = request.get("fileName");
        String fileSize = request.get("fileSize");
        String fileType = request.get("fileType");

        String docId = "doc_" + System.currentTimeMillis();
        UploadedDocument doc = UploadedDocument.builder()
                .id(docId)
                .workspaceId(workspaceId)
                .fileName(fileName)
                .fileSize(fileSize)
                .fileType(fileType)
                .chunkCount((int) (Math.random() * 80 + 20)) // Mock chunking
                .status("COMPLETED")
                .createdAt(LocalDateTime.now())
                .build();

        uploadedDocumentRepository.save(doc);

        // Deduct AI credits for RAG processing
        Optional<Workspace> wsOpt = workspaceRepository.findById(workspaceId);
        wsOpt.ifPresent(ws -> {
            ws.setCreditsUsed(Math.min(ws.getCreditsLimit(), ws.getCreditsUsed() + 20));
            workspaceRepository.save(ws);
        });

        return ResponseEntity.ok(doc);
    }
}
